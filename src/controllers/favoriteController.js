const User = require('../models/User');

// Get all favorites for a user
exports.getFavorites = async (req, res) => {
  try {
    console.log('🔍 Getting favorites for user:', req.user._id);
    
    // User is already available from auth middleware
    const user = req.user;
    
    console.log('✅ Favorites retrieved successfully');
    return res.status(200).json({
      success: true,
      favorites: user.favorites
    });
  } catch (error) {
    console.error('❌ Error getting favorites:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get favorites',
      error: error.message
    });
  }
};

// Add a movie to favorites
exports.addFavorite = async (req, res) => {
  try {
    console.log('➕ Adding movie to favorites');
    console.log('Request Body:', req.body);
    
    const { id, title, poster_path, release_date, vote_average, overview } = req.body;
    
    if (!id || !title) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Movie ID and title are required'
      });
    }
    
    // User is already available from auth middleware
    const user = req.user;
    
    // Check if movie is already in favorites
    const isAlreadyFavorite = user.favorites.some(movie => movie.id === id);
    
    if (isAlreadyFavorite) {
      console.log('⚠️ Movie already in favorites');
      return res.status(200).json({
        success: true,
        message: 'Movie is already in favorites',
        favorites: user.favorites
      });
    }
    
    // Add movie to favorites
    user.favorites.push({
      id,
      title,
      poster_path,
      release_date,
      vote_average,
      overview
    });
    
    // Save user
    await user.save();
    
    console.log('✅ Movie added to favorites successfully');
    return res.status(200).json({
      success: true,
      message: 'Movie added to favorites',
      favorites: user.favorites
    });
  } catch (error) {
    console.error('❌ Error adding favorite:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add favorite',
      error: error.message
    });
  }
};

// Remove a movie from favorites
exports.removeFavorite = async (req, res) => {
  try {
    console.log('➖ Removing movie from favorites');
    
    const { id } = req.params;
    
    if (!id) {
      console.log('❌ Missing movie ID');
      return res.status(400).json({
        success: false,
        message: 'Movie ID is required'
      });
    }
    
    // User is already available from auth middleware
    const user = req.user;
    
    // Check if movie is in favorites
    const movieIndex = user.favorites.findIndex(movie => movie.id === Number(id));
    
    if (movieIndex === -1) {
      console.log('⚠️ Movie not in favorites');
      return res.status(404).json({
        success: false,
        message: 'Movie not found in favorites'
      });
    }
    
    // Remove movie from favorites
    user.favorites.splice(movieIndex, 1);
    
    // Save user
    await user.save();
    
    console.log('✅ Movie removed from favorites successfully');
    return res.status(200).json({
      success: true,
      message: 'Movie removed from favorites',
      favorites: user.favorites
    });
  } catch (error) {
    console.error('❌ Error removing favorite:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove favorite',
      error: error.message
    });
  }
};
