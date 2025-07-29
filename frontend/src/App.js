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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🍽️</div>
          <h1 className="text-2xl font-bold text-orange-600 mb-2">Tasty Trail</h1>
          <p className="text-gray-600 text-sm">Share recipes, discover restaurants</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <input
                  type="text"
                  placeholder="Username"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Full Name (optional)"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
                />
              </div>
            </>
          )}
          
          <div>
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
              required
            />
          </div>
          
          <div>
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-xl">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all disabled:opacity-50 text-base"
          >
            {loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-orange-600 hover:underline text-sm"
          >
            {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

const MobileRecipeCard = ({ recipe, onLike, token }) => {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(recipe.likes);
  const [showFullDescription, setShowFullDescription] = useState(false);
  
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

  const handleDoubleTap = () => {
    if (!liked) {
      handleLike();
    }
  };

  return (
    <div className="bg-white shadow-lg mb-4 mx-2 rounded-2xl overflow-hidden">
      {/* User Header */}
      <div className="flex items-center p-4 pb-2">
        <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
          {recipe.username.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm">{recipe.username}</h4>
          <p className="text-xs text-gray-500">{new Date(recipe.created_at).toLocaleDateString()}</p>
        </div>
        <button className="text-gray-400">
          <span className="text-xl">⋯</span>
        </button>
      </div>

      {/* Media Content */}
      {recipe.media_data && (
        <div className="relative bg-black" onDoubleClick={handleDoubleTap}>
          {recipe.media_type === 'image' ? (
            <img
              src={`data:image/jpeg;base64,${recipe.media_data}`}
              alt={recipe.title}
              className="w-full h-80 object-cover"
            />
          ) : (
            <video
              src={`data:video/mp4;base64,${recipe.media_data}`}
              controls
              className="w-full h-80 object-cover"
              playsInline
            />
          )}
          
          {/* Overlay Like Animation */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className={`text-6xl transition-all duration-300 ${liked ? 'scale-110 opacity-100' : 'scale-0 opacity-0'}`}>
              ❤️
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className="transition-transform active:scale-95"
            >
              <span className={`text-2xl ${liked ? '' : 'grayscale'}`}>
                {liked ? '❤️' : '🤍'}
              </span>
            </button>
            <button className="transition-transform active:scale-95">
              <span className="text-2xl">💬</span>
            </button>
            <button className="transition-transform active:scale-95">
              <span className="text-2xl">📤</span>
            </button>
          </div>
          <button className="transition-transform active:scale-95">
            <span className="text-2xl">🔖</span>
          </button>
        </div>

        {/* Likes Count */}
        <p className="font-semibold text-sm mb-2">{likes} likes</p>

        {/* Recipe Content */}
        <div className="space-y-2">
          <div>
            <span className="font-semibold text-sm mr-2">{recipe.username}</span>
            <span className="text-sm font-bold">{recipe.title}</span>
          </div>
          
          <p className="text-sm text-gray-700">
            {showFullDescription ? recipe.description : recipe.description.substring(0, 100)}
            {recipe.description.length > 100 && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-orange-600 ml-1 font-medium"
              >
                {showFullDescription ? 'less' : '...more'}
              </button>
            )}
          </p>

          {/* Tags */}
          {recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {recipe.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="text-orange-600 text-sm font-medium"
                >
                  #{tag}
                </span>
              ))}
              {recipe.tags.length > 3 && (
                <span className="text-gray-500 text-sm">+{recipe.tags.length - 3} more</span>
              )}
            </div>
          )}

          {/* View Recipe Button */}
          <button className="text-gray-500 text-sm font-medium mt-2">
            View all {recipe.comments.length} comments
          </button>
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
    <div className="pb-20">
      {recipes.length === 0 ? (
        <div className="text-center py-20 px-4">
          <div className="text-8xl mb-6">🍽️</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No recipes yet!</h3>
          <p className="text-gray-500">Be the first to share a delicious recipe</p>
          <div className="mt-6">
            <span className="inline-block bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm">
              Tap the 📹 Share tab below to get started!
            </span>
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto">
          {recipes.map((recipe) => (
            <MobileRecipeCard
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

const MobileCreateRecipe = ({ token }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ingredients: [''],
    instructions: [''],
    tags: ''
  });
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    setMediaFile(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setMediaPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setMediaPreview(null);
    }
  };

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
      setMediaPreview(null);
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error creating recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-20 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center py-6">
          <div className="text-4xl mb-2">📹</div>
          <h2 className="text-xl font-bold text-gray-800">Share Your Recipe</h2>
          <p className="text-gray-600 text-sm">Create your cooking reel</p>
        </div>

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl mb-6 text-center text-sm">
            Recipe shared successfully! 🎉
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Media Upload Section */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              📸 Add Photo or Video
            </label>
            
            {!mediaPreview ? (
              <div className="relative">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                  <div className="text-4xl mb-2">📷</div>
                  <p className="text-sm text-gray-500">Tap to add photo or video</p>
                  <p className="text-xs text-gray-400 mt-1">Max 60 seconds for videos</p>
                </div>
              </div>
            ) : (
              <div className="relative">
                {mediaFile?.type.startsWith('video/') ? (
                  <video
                    src={mediaPreview}
                    controls
                    className="w-full h-48 object-cover rounded-xl"
                  />
                ) : (
                  <img
                    src={mediaPreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMediaFile(null);
                    setMediaPreview(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Recipe Title */}
          <div>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
              placeholder="Recipe title (e.g., Spicy Butter Chicken)"
              required
            />
          </div>

          {/* Description */}
          <div>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base resize-none"
              rows="3"
              placeholder="Tell us about your recipe..."
              required
            />
          </div>

          {/* Ingredients */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">🥘 Ingredients</label>
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={ingredient}
                  onChange={(e) => updateIngredient(index, e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
                  placeholder={`Ingredient ${index + 1}`}
                />
                {formData.ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="px-3 py-3 text-red-500 hover:bg-red-50 rounded-xl"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addIngredient}
              className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center"
            >
              <span className="mr-1">+</span> Add Ingredient
            </button>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">👨‍🍳 Instructions</label>
            {formData.instructions.map((instruction, index) => (
              <div key={index} className="flex gap-2 mb-3">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold mt-2">
                  {index + 1}
                </div>
                <textarea
                  value={instruction}
                  onChange={(e) => updateInstruction(index, e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base resize-none"
                  rows="2"
                  placeholder={`Step ${index + 1}`}
                />
                {formData.instructions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeInstruction(index)}
                    className="px-3 py-3 text-red-500 hover:bg-red-50 rounded-xl flex-shrink-0 mt-2"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addInstruction}
              className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center"
            >
              <span className="mr-1">+</span> Add Step
            </button>
          </div>

          {/* Tags */}
          <div>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
              placeholder="Tags: spicy, indian, chicken (comma separated)"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all disabled:opacity-50 text-base"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Sharing Recipe...
              </div>
            ) : (
              'Share Recipe 🚀'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

const MobileRestaurantList = ({ userLocation }) => {
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
    <div className="pb-20 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center py-6">
          <div className="text-4xl mb-2">🏪</div>
          <h2 className="text-xl font-bold text-gray-800">Discover Places</h2>
          
          {userLocation && (
            <div className="flex justify-center mt-4">
              <div className="bg-gray-100 rounded-full p-1">
                <button
                  onClick={() => setShowNearby(false)}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${
                    !showNearby
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-600'
                  }`}
                >
                  All Places
                </button>
                <button
                  onClick={() => setShowNearby(true)}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${
                    showNearby
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-600'
                  }`}
                >
                  📍 Nearby
                </button>
              </div>
            </div>
          )}
        </div>

        {restaurants.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="text-8xl mb-6">🏪</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No restaurants found!</h3>
            <p className="text-gray-500">Be the first to add a restaurant</p>
            <div className="mt-6">
              <span className="inline-block bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm">
                Tap the ➕ Add tab below to get started!
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {restaurants.map((restaurant) => (
              <div key={restaurant.id} className="bg-white rounded-2xl shadow-lg p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-1">{restaurant.name}</h3>
                    <p className="text-orange-600 text-sm font-medium bg-orange-50 px-2 py-1 rounded-full inline-block">
                      {restaurant.cuisine_type}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="flex items-center justify-end mb-1">
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
                    <p className="text-xs text-gray-500">{restaurant.total_reviews} reviews</p>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-3">{restaurant.description}</p>
                
                <div className="flex items-center text-xs text-gray-500 mb-4">
                  <span className="mr-1">📍</span>
                  <span className="flex-1">{restaurant.address}</span>
                </div>
                
                <button className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all text-sm">
                  View Reviews & Add Review
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const MobileAddRestaurant = ({ token, userLocation }) => {
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
    <div className="pb-20 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center py-6">
          <div className="text-4xl mb-2">➕</div>
          <h2 className="text-xl font-bold text-gray-800">Add New Place</h2>
          <p className="text-gray-600 text-sm">Share your food discovery</p>
        </div>

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl mb-6 text-center text-sm">
            Restaurant added successfully! 🎉
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
              placeholder="Restaurant name (e.g., Mumbai Street Food)"
              required
            />
          </div>

          <div>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base resize-none"
              rows="3"
              placeholder="Tell us about this place..."
              required
            />
          </div>

          <div>
            <input
              type="text"
              value={formData.cuisine_type}
              onChange={(e) => setFormData({...formData, cuisine_type: e.target.value})}
              className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
              placeholder="Cuisine type (e.g., Indian, Chinese, Street Food)"
              required
            />
          </div>

          <div>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base resize-none"
              rows="2"
              placeholder="Full address of the restaurant"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
                placeholder="Latitude"
                required
              />
            </div>
            
            <div>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
                placeholder="Longitude"
                required
              />
            </div>
          </div>

          <button
            type="button"
            onClick={useCurrentLocation}
            className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-all text-base"
          >
            📍 Use Current Location
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all disabled:opacity-50 text-base"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Adding Restaurant...
              </div>
            ) : (
              'Add Restaurant 🚀'
            )}
          </button>
        </form>
      </div>
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
      <MobileHeader user={user} onLogout={handleLogout} />
      
      <main className="min-h-screen">
        {activeTab === 'feed' && <RecipeFeed token={token} />}
        {activeTab === 'create-recipe' && <MobileCreateRecipe token={token} />}
        {activeTab === 'restaurants' && <MobileRestaurantList userLocation={userLocation} />}
        {activeTab === 'add-restaurant' && <MobileAddRestaurant token={token} userLocation={userLocation} />}
      </main>

      <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;