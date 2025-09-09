const express = require('express');
const {
    createOrder,
    getCheckoutSummary,
    validateCheckout,
    applyCoupon,
    getPaymentMethods
} = require('../controllers/checkoutController');
const { protect } = require('../middleware/auth');
const { body } = require('express-validator');

const router = express.Router();

// @route   GET /api/checkout/summary
// @desc    Get checkout summary
// @access  Private
router.get('/summary', protect, getCheckoutSummary);

// @route   POST /api/checkout/validate
// @desc    Validate checkout data
// @access  Private
router.post('/validate', protect, [
    body('shippingAddressId')
        .optional()
        .isMongoId()
        .withMessage('Invalid shipping address ID'),
    body('paymentMethod')
        .notEmpty()
        .withMessage('Payment method is required')
        .isIn(['credit_card', 'debit_card', 'paypal', 'stripe', 'cash_on_delivery'])
        .withMessage('Invalid payment method')
], validateCheckout);

// @route   POST /api/checkout/create-order
// @desc    Create new order
// @access  Private
router.post('/create-order', protect, createOrder);

// @route   POST /api/checkout/apply-coupon
// @desc    Apply coupon code
// @access  Private
router.post('/apply-coupon', protect, [
    body('couponCode')
        .notEmpty()
        .withMessage('Coupon code is required')
        .isLength({ min: 3, max: 20 })
        .withMessage('Coupon code must be between 3 and 20 characters')
], applyCoupon);

// @route   GET /api/checkout/payment-methods
// @desc    Get available payment methods
// @access  Private
router.get('/payment-methods', protect, getPaymentMethods);

module.exports = router;
