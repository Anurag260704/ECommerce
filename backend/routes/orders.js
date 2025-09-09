const express = require('express');
const router = express.Router();

const {
    createOrder,
    getUserOrders,
    getOrder,
    updateOrderStatus,
    cancelOrder,
    getAllOrders,
    getOrderStats,
    processRefund
} = require('../controllers/orderController');

const { protect, authorize } = require('../middleware/auth');
const {
    validateOrder,
    validateOrderStatus,
    validateObjectId,
    validatePagination
} = require('../middleware/validation');

// All order routes require authentication
router.use(protect);

// User order routes
router.post('/', validateOrder, createOrder);
router.get('/', validatePagination, getUserOrders);
router.get('/:id', validateObjectId, getOrder);
router.put('/:id/cancel', validateObjectId, cancelOrder);

// Admin only routes
router.get('/admin/all', authorize('admin'), validatePagination, getAllOrders);
router.get('/admin/stats', authorize('admin'), getOrderStats);
router.put('/:id/status', authorize('admin'), validateObjectId, validateOrderStatus, updateOrderStatus);
router.post('/:id/refund', authorize('admin'), validateObjectId, processRefund);

module.exports = router;
