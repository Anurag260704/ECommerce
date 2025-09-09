const express = require('express');
const router = express.Router();

const {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartSummary,
    validateCart,
    moveToWishlist
} = require('../controllers/cartController');

const { protect } = require('../middleware/auth');
const {
    validateCartItem,
    validateUpdateCartItem,
    validateObjectId,
    validateProductId
} = require('../middleware/validation');

// All cart routes require authentication
router.use(protect);

// Cart operations
router.get('/', getCart);
router.get('/summary', getCartSummary);
router.post('/validate', validateCart);
router.post('/add', validateCartItem, addToCart);
router.put('/update/:productId', validateProductId, validateUpdateCartItem, updateCartItem);
router.delete('/remove/:productId', validateProductId, removeFromCart);
router.delete('/clear', clearCart);
router.post('/move-to-wishlist/:productId', validateProductId, moveToWishlist);

module.exports = router;
