const express = require('express');
const router = express.Router();
const { getFavorites, addFavorite, removeFavorite } = require('../controllers/favoriteController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get all favorites
router.get('/', getFavorites);

// Add a movie to favorites
router.post('/', addFavorite);

// Remove a movie from favorites
router.delete('/:id', removeFavorite);

module.exports = router;
