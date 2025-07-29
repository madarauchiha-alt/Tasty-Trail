import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Mobile Navigation Components
const MobileHeader = ({ user, onLogout }) => (
  <header className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 shadow-lg sticky top-0 z-50">
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <div className="text-2xl">🍽️</div>
        <div>
          <h1 className="text-xl font-bold">Tasty Trail</h1>
          {user && (
            <p className="text-xs opacity-80">Hi, {user.username}! 👋</p>
          )}
        </div>
      </div>
      {user && (
        <button
          onClick={onLogout}
          className="bg-red-500 hover:bg-red-600 px-3 py-2 rounded-lg text-sm transition-all"
        >
          Logout
        </button>
      )}
    </div>
  </header>
);

const MobileBottomNav = ({ activeTab, setActiveTab }) => (
  <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
    <div className="flex justify-around py-2">
      <button
        onClick={() => setActiveTab('feed')}
        className={`flex flex-col items-center py-2 px-4 transition-all ${
          activeTab === 'feed' ? 'text-orange-600' : 'text-gray-500'
        }`}
      >
        <div className="text-2xl mb-1">🍳</div>
        <span className="text-xs font-medium">Feed</span>
      </button>
      
      <button
        onClick={() => setActiveTab('create-recipe')}
        className={`flex flex-col items-center py-2 px-4 transition-all ${
          activeTab === 'create-recipe' ? 'text-orange-600' : 'text-gray-500'
        }`}
      >
        <div className="text-2xl mb-1">📹</div>
        <span className="text-xs font-medium">Share</span>
      </button>
      
      <button
        onClick={() => setActiveTab('restaurants')}
        className={`flex flex-col items-center py-2 px-4 transition-all ${
          activeTab === 'restaurants' ? 'text-orange-600' : 'text-gray-500'
        }`}
      >
        <div className="text-2xl mb-1">🏪</div>
        <span className="text-xs font-medium">Places</span>
      </button>
      
      <button
        onClick={() => setActiveTab('add-restaurant')}
        className={`flex flex-col items-center py-2 px-4 transition-all ${
          activeTab === 'add-restaurant' ? 'text-orange-600' : 'text-gray-500'
        }`}
      >
        <div className="text-2xl mb-1">➕</div>
        <span className="text-xs font-medium">Add</span>
      </button>
    </div>
  </nav>
);

const AuthForm = ({ isLogin, setIsLogin, onAuth }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? 'auth/login' : 'auth/register';
      const data = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;
      
      const response = await axios.post(`${API}/${endpoint}`, data);
      localStorage.setItem('token', response.data.access_token);
      onAuth(response.data.access_token);
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-orange-600 mb-2">🍽️ Tasty Trail</h1>
          <p className="text-gray-600">Share recipes, discover restaurants</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
              <input
                type="text"
                placeholder="Full Name (optional)"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </>
          )}
          
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          />
          
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          />

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-700 transition-all disabled:opacity-50"
          >
            {loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-orange-600 hover:underline"
          >
            {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

const RecipeCard = ({ recipe, onLike, token }) => {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(recipe.likes);
  
  const handleLike = async () => {
    try {
      const formData = new FormData();
      formData.append('token', token);
      
      const response = await axios.post(`${API}/recipes/${recipe.id}/like`, formData);
      setLikes(response.data.likes);
      setLiked(response.data.liked);
    } catch (error) {
      console.error('Error liking recipe:', error);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6 transform hover:scale-[1.02] transition-all duration-300">
      {recipe.media_data && (
        <div className="relative">
          {recipe.media_type === 'image' ? (
            <img
              src={`data:image/jpeg;base64,${recipe.media_data}`}
              alt={recipe.title}
              className="w-full h-64 object-cover"
            />
          ) : (
            <video
              src={`data:video/mp4;base64,${recipe.media_data}`}
              controls
              className="w-full h-64 object-cover"
            />
          )}
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
            {recipe.username.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3">
            <h4 className="font-semibold">{recipe.username}</h4>
            <p className="text-sm text-gray-500">{new Date(recipe.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        
        <h3 className="text-xl font-bold mb-2">{recipe.title}</h3>
        <p className="text-gray-600 mb-4">{recipe.description}</p>
        
        <div className="space-y-3">
          <div>
            <h5 className="font-semibold text-sm text-orange-600 mb-1">Ingredients:</h5>
            <ul className="text-sm text-gray-600">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-1 h-1 bg-orange-400 rounded-full mr-2"></span>
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h5 className="font-semibold text-sm text-orange-600 mb-1">Instructions:</h5>
            <ol className="text-sm text-gray-600">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start mb-1">
                  <span className="bg-orange-100 text-orange-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">
                    {index + 1}
                  </span>
                  {instruction}
                </li>
              ))}
            </ol>
          </div>
        </div>
        
        {recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {recipe.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
              liked ? 'bg-red-50 text-red-600' : 'hover:bg-gray-50'
            }`}
          >
            <span className="text-xl">{liked ? '❤️' : '🤍'}</span>
            <span className="font-semibold">{likes}</span>
          </button>
          
          <div className="flex space-x-4">
            <button className="flex items-center space-x-1 text-gray-600 hover:text-orange-600">
              <span>💬</span>
              <span className="text-sm">{recipe.comments.length}</span>
            </button>
            <button className="flex items-center space-x-1 text-gray-600 hover:text-orange-600">
              <span>📤</span>
              <span className="text-sm">Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RecipeFeed = ({ token }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await axios.get(`${API}/recipes`);
        setRecipes(response.data);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
        Recipe Feed 🍳
      </h2>
      
      {recipes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-xl font-semibold text-gray-600">No recipes yet!</h3>
          <p className="text-gray-500 mt-2">Be the first to share a delicious recipe</p>
        </div>
      ) : (
        <div>
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              token={token}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CreateRecipe = ({ token }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ingredients: [''],
    instructions: [''],
    tags: ''
  });
  const [mediaFile, setMediaFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, '']
    });
  };

  const updateIngredient = (index, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData({
      ...formData,
      ingredients: newIngredients
    });
  };

  const removeIngredient = (index) => {
    const newIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      ingredients: newIngredients
    });
  };

  const addInstruction = () => {
    setFormData({
      ...formData,
      instructions: [...formData.instructions, '']
    });
  };

  const updateInstruction = (index, value) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = value;
    setFormData({
      ...formData,
      instructions: newInstructions
    });
  };

  const removeInstruction = (index) => {
    const newInstructions = formData.instructions.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      instructions: newInstructions
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('ingredients', JSON.stringify(formData.ingredients.filter(i => i.trim())));
      formDataToSend.append('instructions', JSON.stringify(formData.instructions.filter(i => i.trim())));
      formDataToSend.append('tags', JSON.stringify(formData.tags.split(',').map(t => t.trim()).filter(t => t)));
      formDataToSend.append('token', token);
      
      if (mediaFile) {
        formDataToSend.append('media_file', mediaFile);
      }

      await axios.post(`${API}/recipes`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(true);
      setFormData({
        title: '',
        description: '',
        ingredients: [''],
        instructions: [''],
        tags: ''
      });
      setMediaFile(null);
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error creating recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
        Share Your Recipe 👨‍🍳
      </h2>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 text-center">
          Recipe shared successfully! 🎉
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Recipe Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="e.g., Spicy Butter Chicken"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            rows="3"
            placeholder="Tell us about your recipe..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Photo or Video</label>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => setMediaFile(e.target.files[0])}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">Upload an image or video (max 60 seconds for videos)</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients</label>
          {formData.ingredients.map((ingredient, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={ingredient}
                onChange={(e) => updateIngredient(index, e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder={`Ingredient ${index + 1}`}
              />
              {formData.ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addIngredient}
            className="text-orange-600 hover:text-orange-700 text-sm font-medium"
          >
            + Add Ingredient
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
          {formData.instructions.map((instruction, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold mt-1">
                {index + 1}
              </div>
              <textarea
                value={instruction}
                onChange={(e) => updateInstruction(index, e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows="2"
                placeholder={`Step ${index + 1}`}
              />
              {formData.instructions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeInstruction(index)}
                  className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg flex-shrink-0 mt-1"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addInstruction}
            className="text-orange-600 hover:text-orange-700 text-sm font-medium"
          >
            + Add Step
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags (optional)</label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({...formData, tags: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="spicy, indian, chicken (comma separated)"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-700 transition-all disabled:opacity-50"
        >
          {loading ? 'Sharing Recipe...' : 'Share Recipe 🚀'}
        </button>
      </form>
    </div>
  );
};

const RestaurantList = ({ userLocation }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNearby, setShowNearby] = useState(false);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        let url = `${API}/restaurants`;
        if (showNearby && userLocation) {
          url = `${API}/restaurants/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}`;
        }
        const response = await axios.get(url);
        setRestaurants(response.data);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [showNearby, userLocation]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          Discover Places 🏪
        </h2>
        
        {userLocation && (
          <button
            onClick={() => setShowNearby(!showNearby)}
            className={`px-4 py-2 rounded-lg transition-all ${
              showNearby
                ? 'bg-orange-500 text-white'
                : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
            }`}
          >
            {showNearby ? '📍 Nearby' : '🌍 All Places'}
          </button>
        )}
      </div>

      {restaurants.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏪</div>
          <h3 className="text-xl font-semibold text-gray-600">No restaurants found!</h3>
          <p className="text-gray-500 mt-2">Be the first to add a restaurant</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <div key={restaurant.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{restaurant.name}</h3>
                    <p className="text-orange-600 text-sm font-medium">{restaurant.cuisine_type}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-lg ${
                            i < Math.floor(restaurant.average_rating)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">{restaurant.total_reviews} reviews</p>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-3">{restaurant.description}</p>
                
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <span className="mr-1">📍</span>
                  <span>{restaurant.address}</span>
                </div>
                
                <button className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-2 rounded-lg hover:from-orange-600 hover:to-red-700 transition-all">
                  View Reviews & Add Review
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AddRestaurant = ({ token, userLocation }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cuisine_type: '',
    address: '',
    latitude: userLocation?.lat || '',
    longitude: userLocation?.lng || ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('cuisine_type', formData.cuisine_type);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('latitude', parseFloat(formData.latitude));
      formDataToSend.append('longitude', parseFloat(formData.longitude));
      formDataToSend.append('token', token);

      await axios.post(`${API}/restaurants`, formDataToSend);

      setSuccess(true);
      setFormData({
        name: '',
        description: '',
        cuisine_type: '',
        address: '',
        latitude: userLocation?.lat || '',
        longitude: userLocation?.lng || ''
      });
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error adding restaurant:', error);
    } finally {
      setLoading(false);
    }
  };

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
        Add New Place 🏪
      </h2>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 text-center">
          Restaurant added successfully! 🎉
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="e.g., Mumbai Street Food"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            rows="3"
            placeholder="Tell us about this place..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine Type</label>
          <input
            type="text"
            value={formData.cuisine_type}
            onChange={(e) => setFormData({...formData, cuisine_type: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="e.g., Indian, Chinese, Street Food"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
          <textarea
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            rows="2"
            placeholder="Full address of the restaurant"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
            <input
              type="number"
              step="any"
              value={formData.latitude}
              onChange={(e) => setFormData({...formData, latitude: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
            <input
              type="number"
              step="any"
              value={formData.longitude}
              onChange={(e) => setFormData({...formData, longitude: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <button
          type="button"
          onClick={useCurrentLocation}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-all mb-4"
        >
          📍 Use Current Location
        </button>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-700 transition-all disabled:opacity-50"
        >
          {loading ? 'Adding Restaurant...' : 'Add Restaurant 🚀'}
        </button>
      </form>
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState('feed');
  const [isLogin, setIsLogin] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (token) {
      // Get user location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (error) => {
            console.log('Location access denied or not available');
          }
        );
      }
      
      // Decode token to get user info
      try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        setUser({ email: tokenData.sub, username: tokenData.sub.split('@')[0] });
      } catch (error) {
        console.error('Invalid token');
        localStorage.removeItem('token');
        setToken(null);
      }
    }
  }, [token]);

  const handleAuth = (newToken) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  if (!token || !user) {
    return <AuthForm isLogin={isLogin} setIsLogin={setIsLogin} onAuth={handleAuth} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        user={user} 
        setActiveTab={setActiveTab} 
        activeTab={activeTab}
        onLogout={handleLogout} 
      />
      
      <main className="container mx-auto px-4">
        {activeTab === 'feed' && <RecipeFeed token={token} />}
        {activeTab === 'create-recipe' && <CreateRecipe token={token} />}
        {activeTab === 'restaurants' && <RestaurantList userLocation={userLocation} />}
        {activeTab === 'add-restaurant' && <AddRestaurant token={token} userLocation={userLocation} />}
      </main>
    </div>
  );
}

export default App;