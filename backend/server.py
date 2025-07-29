from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form, status
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import base64
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "your-secret-key-here"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Pydantic Models
class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: str
    full_name: Optional[str] = None
    avatar: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Token(BaseModel):
    access_token: str
    token_type: str

class Recipe(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    username: str
    title: str
    description: str
    ingredients: List[str]
    instructions: List[str]
    media_type: str  # 'image' or 'video'
    media_data: str  # base64 encoded media
    tags: List[str] = []
    likes: int = 0
    liked_by: List[str] = []
    comments: List[dict] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class RecipeCreate(BaseModel):
    title: str
    description: str
    ingredients: List[str]
    instructions: List[str]
    tags: List[str] = []

class Restaurant(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    cuisine_type: str
    address: str
    latitude: float
    longitude: float
    added_by: str
    average_rating: float = 0.0
    total_reviews: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class RestaurantCreate(BaseModel):
    name: str
    description: str
    cuisine_type: str
    address: str
    latitude: float
    longitude: float

class Review(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    restaurant_id: str
    user_id: str
    username: str
    rating: int  # 1-5 stars
    comment: str
    photos: List[str] = []  # base64 encoded images
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ReviewCreate(BaseModel):
    restaurant_id: str
    rating: int
    comment: str

# Authentication functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(lambda: None)):
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
    except JWTError:
        return None
    
    user = await db.users.find_one({"email": email})
    if user is None:
        return None
    return User(**user)

# Authentication Routes
@api_router.post("/auth/register", response_model=Token)
async def register_user(user: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    user_dict = user.dict()
    del user_dict["password"]
    user_obj = User(**user_dict)
    user_data = user_obj.dict()
    user_data["hashed_password"] = hashed_password
    
    await db.users.insert_one(user_data)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.post("/auth/login", response_model=Token)
async def login_user(user: UserLogin):
    db_user = await db.users.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user.get("hashed_password", "")):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# Recipe Routes
@api_router.post("/recipes", response_model=Recipe)
async def create_recipe(
    title: str = Form(...),
    description: str = Form(...),
    ingredients: str = Form(...),  # JSON string
    instructions: str = Form(...),  # JSON string
    tags: str = Form("[]"),  # JSON string
    media_file: UploadFile = File(None),
    token: str = Form(...)
):
    # Verify user
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        user = await db.users.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=401, detail="Invalid authentication")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication")
    
    # Parse JSON strings
    try:
        ingredients_list = json.loads(ingredients)
        instructions_list = json.loads(instructions)
        tags_list = json.loads(tags)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format")
    
    # Process media file
    media_data = ""
    media_type = ""
    if media_file:
        content = await media_file.read()
        media_data = base64.b64encode(content).decode('utf-8')
        if media_file.content_type.startswith('image/'):
            media_type = "image"
        elif media_file.content_type.startswith('video/'):
            media_type = "video"
        else:
            raise HTTPException(status_code=400, detail="Unsupported media type")
    
    recipe_data = {
        "user_id": user["id"],
        "username": user["username"],
        "title": title,
        "description": description,
        "ingredients": ingredients_list,
        "instructions": instructions_list,
        "media_type": media_type,
        "media_data": media_data,
        "tags": tags_list
    }
    
    recipe_obj = Recipe(**recipe_data)
    await db.recipes.insert_one(recipe_obj.dict())
    return recipe_obj

@api_router.get("/recipes", response_model=List[Recipe])
async def get_recipes(skip: int = 0, limit: int = 20):
    recipes = await db.recipes.find().skip(skip).limit(limit).sort("created_at", -1).to_list(limit)
    return [Recipe(**recipe) for recipe in recipes]

@api_router.post("/recipes/{recipe_id}/like")
async def like_recipe(recipe_id: str, token: str = Form(...)):
    # Verify user
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        user = await db.users.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=401, detail="Invalid authentication")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication")
    
    recipe = await db.recipes.find_one({"id": recipe_id})
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    user_id = user["id"]
    liked_by = recipe.get("liked_by", [])
    
    if user_id in liked_by:
        # Unlike
        liked_by.remove(user_id)
        likes = max(0, recipe.get("likes", 0) - 1)
    else:
        # Like
        liked_by.append(user_id)
        likes = recipe.get("likes", 0) + 1
    
    await db.recipes.update_one(
        {"id": recipe_id},
        {"$set": {"likes": likes, "liked_by": liked_by}}
    )
    
    return {"likes": likes, "liked": user_id in liked_by}

# Restaurant Routes
@api_router.post("/restaurants", response_model=Restaurant)
async def create_restaurant(restaurant: RestaurantCreate, token: str = Form(...)):
    # Verify user
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        user = await db.users.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=401, detail="Invalid authentication")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication")
    
    restaurant_data = restaurant.dict()
    restaurant_data["added_by"] = user["id"]
    restaurant_obj = Restaurant(**restaurant_data)
    
    await db.restaurants.insert_one(restaurant_obj.dict())
    return restaurant_obj

@api_router.get("/restaurants/nearby")
async def get_nearby_restaurants(lat: float, lng: float, radius: float = 10.0):
    # Simple distance-based filtering (for MVP)
    restaurants = await db.restaurants.find().to_list(1000)
    nearby_restaurants = []
    
    for restaurant in restaurants:
        # Simple distance calculation (for MVP - in production use proper geospatial queries)
        lat_diff = abs(restaurant["latitude"] - lat)
        lng_diff = abs(restaurant["longitude"] - lng)
        distance = (lat_diff ** 2 + lng_diff ** 2) ** 0.5
        
        if distance <= radius:
            nearby_restaurants.append(Restaurant(**restaurant))
    
    return nearby_restaurants

@api_router.get("/restaurants", response_model=List[Restaurant])
async def get_all_restaurants():
    restaurants = await db.restaurants.find().to_list(1000)
    return [Restaurant(**restaurant) for restaurant in restaurants]

# Review Routes
@api_router.post("/reviews", response_model=Review)
async def create_review(
    restaurant_id: str = Form(...),
    rating: int = Form(...),
    comment: str = Form(...),
    token: str = Form(...),
    photos: List[UploadFile] = File([])
):
    # Verify user
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        user = await db.users.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=401, detail="Invalid authentication")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication")
    
    # Check if restaurant exists
    restaurant = await db.restaurants.find_one({"id": restaurant_id})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # Process photos
    photo_data = []
    for photo in photos:
        if photo and photo.content_type.startswith('image/'):
            content = await photo.read()
            photo_base64 = base64.b64encode(content).decode('utf-8')
            photo_data.append(photo_base64)
    
    review_data = {
        "restaurant_id": restaurant_id,
        "user_id": user["id"],
        "username": user["username"],
        "rating": rating,
        "comment": comment,
        "photos": photo_data
    }
    
    review_obj = Review(**review_data)
    await db.reviews.insert_one(review_obj.dict())
    
    # Update restaurant average rating
    reviews = await db.reviews.find({"restaurant_id": restaurant_id}).to_list(1000)
    total_reviews = len(reviews)
    average_rating = sum(r["rating"] for r in reviews) / total_reviews if total_reviews > 0 else 0
    
    await db.restaurants.update_one(
        {"id": restaurant_id},
        {"$set": {"average_rating": average_rating, "total_reviews": total_reviews}}
    )
    
    return review_obj

@api_router.get("/restaurants/{restaurant_id}/reviews", response_model=List[Review])
async def get_restaurant_reviews(restaurant_id: str):
    reviews = await db.reviews.find({"restaurant_id": restaurant_id}).sort("created_at", -1).to_list(1000)
    return [Review(**review) for review in reviews]

# Health check
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "app": "Tasty Trail API"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()