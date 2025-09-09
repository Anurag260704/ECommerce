const express = require('express');
const router = express.Router();

const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getFeaturedProducts,
    getProductsByCategory,
    addReview,
    getReviews,
    deleteReview,
    getCategories
} = require('../controllers/productController');

const { protect, authorize } = require('../middleware/auth');
const {
    validateProduct,
    validateReview,
    validateObjectId,
    validatePagination,
    validateSearch
} = require('../middleware/validation');

// Public routes
router.get('/', validatePagination, validateSearch, getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/category/:category', validatePagination, getProductsByCategory);
router.get('/:id', validateObjectId, getProduct);
router.get('/:id/reviews', validateObjectId, validatePagination, getReviews);

// Protected routes (require authentication)
router.use(protect);

// Product management routes (Admin/Seller only)
router.post('/', authorize('admin'), validateProduct, createProduct);
router.put('/:id', validateObjectId, validateProduct, updateProduct);
router.delete('/:id', validateObjectId, deleteProduct);

// Review routes (authenticated users)
router.post('/:id/reviews', validateObjectId, validateReview, addReview);
router.delete('/:id/reviews/:reviewId', validateObjectId, deleteReview);

module.exports = router;
