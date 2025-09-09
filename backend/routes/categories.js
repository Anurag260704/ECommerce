const express = require('express');
const router = express.Router();

const {
    getCategories,
    getFeaturedCategories,
    getTopLevelCategories,
    getCategory,
    getCategoryProducts,
    createCategory,
    updateCategory,
    deleteCategory,
    updateProductCounts,
    toggleFeatured,
    toggleActive
} = require('../controllers/categoryController');

const { protect, authorize } = require('../middleware/auth');
const {
    validateCreateCategory,
    validateUpdateCategory,
    validateCategoryId,
    validateCategoryQuery,
    validateCategoryProductsQuery
} = require('../middleware/categoryValidation');

// Public routes
router.get('/', validateCategoryQuery, getCategories);
router.get('/featured', getFeaturedCategories);
router.get('/top-level', getTopLevelCategories);
router.get('/:id', validateCategoryId, getCategory);
router.get('/:id/products', validateCategoryProductsQuery, getCategoryProducts);

// Protected routes (Admin only)
router.use(protect);
router.use(authorize('admin'));

router.post('/', validateCreateCategory, createCategory);
router.put('/:id', validateUpdateCategory, updateCategory);
router.delete('/:id', validateCategoryId, deleteCategory);

// Utility routes
router.post('/update-counts', updateProductCounts);
router.patch('/:id/toggle-featured', validateCategoryId, toggleFeatured);
router.patch('/:id/toggle-active', validateCategoryId, toggleActive);

module.exports = router;
