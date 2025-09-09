const express = require('express');
const {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    checkInWishlist,
    clearWishlist,
    getWishlistCount,
    moveToCart
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All wishlist routes require authentication
router.use(protect);

// @route   GET /api/wishlist
// @desc    Get user's wishlist
// @access  Private
router.get('/', getWishlist);

// @route   GET /api/wishlist/count
// @desc    Get wishlist count
// @access  Private
router.get('/count', getWishlistCount);

// @route   GET /api/wishlist/check/:productId
// @desc    Check if product is in wishlist
// @access  Private
router.get('/check/:productId', checkInWishlist);

// @route   POST /api/wishlist/:productId
// @desc    Add product to wishlist
// @access  Private
router.post('/:productId', addToWishlist);

// @route   DELETE /api/wishlist/:productId
// @desc    Remove product from wishlist
// @access  Private
router.delete('/:productId', removeFromWishlist);

// @route   DELETE /api/wishlist
// @desc    Clear entire wishlist
// @access  Private
router.delete('/', clearWishlist);

// @route   POST /api/wishlist/move-to-cart
// @desc    Move wishlist items to cart
// @access  Private
router.post('/move-to-cart', moveToCart);

module.exports = router;
