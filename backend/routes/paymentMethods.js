const express = require('express');
const {
    getPaymentMethods,
    getPaymentMethod,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    validatePaymentMethod
} = require('../controllers/paymentMethodController');
const { protect } = require('../middleware/auth');
const { body } = require('express-validator');

const router = express.Router();

// Payment method validation middleware
const paymentMethodValidation = [
    body('type')
        .notEmpty()
        .withMessage('Payment type is required')
        .isIn(['card', 'bank', 'wallet'])
        .withMessage('Invalid payment type'),
    body('cardNumber')
        .if(body('type').equals('card'))
        .notEmpty()
        .withMessage('Card number is required for card payments')
        .isLength({ min: 13, max: 19 })
        .withMessage('Card number must be between 13-19 digits'),
    body('cardType')
        .if(body('type').equals('card'))
        .notEmpty()
        .withMessage('Card type is required')
        .isIn(['visa', 'mastercard', 'amex', 'discover'])
        .withMessage('Invalid card type'),
    body('expiryMonth')
        .if(body('type').equals('card'))
        .notEmpty()
        .withMessage('Expiry month is required')
        .isInt({ min: 1, max: 12 })
        .withMessage('Invalid expiry month'),
    body('expiryYear')
        .if(body('type').equals('card'))
        .notEmpty()
        .withMessage('Expiry year is required')
        .isInt({ min: new Date().getFullYear() })
        .withMessage('Invalid expiry year'),
    body('holderName')
        .notEmpty()
        .withMessage('Holder name is required')
        .isLength({ max: 100 })
        .withMessage('Holder name cannot exceed 100 characters'),
    body('isDefault')
        .optional()
        .isBoolean()
        .withMessage('isDefault must be boolean')
];

// @route   GET /api/payment-methods
// @desc    Get all user payment methods
// @access  Private
router.get('/', protect, getPaymentMethods);

// @route   GET /api/payment-methods/:id
// @desc    Get single payment method
// @access  Private
router.get('/:id', protect, getPaymentMethod);

// @route   POST /api/payment-methods
// @desc    Create new payment method
// @access  Private
router.post('/', protect, paymentMethodValidation, createPaymentMethod);

// @route   PUT /api/payment-methods/:id
// @desc    Update payment method
// @access  Private
router.put('/:id', protect, paymentMethodValidation, updatePaymentMethod);

// @route   DELETE /api/payment-methods/:id
// @desc    Delete payment method
// @access  Private
router.delete('/:id', protect, deletePaymentMethod);

// @route   PUT /api/payment-methods/:id/default
// @desc    Set default payment method
// @access  Private
router.put('/:id/default', protect, setDefaultPaymentMethod);

// @route   POST /api/payment-methods/validate
// @desc    Validate payment method
// @access  Private
router.post('/validate', protect, [
    body('cardNumber')
        .notEmpty()
        .withMessage('Card number is required')
        .isLength({ min: 13, max: 19 })
        .withMessage('Card number must be between 13-19 digits'),
    body('expiryMonth')
        .notEmpty()
        .withMessage('Expiry month is required')
        .isInt({ min: 1, max: 12 })
        .withMessage('Invalid expiry month'),
    body('expiryYear')
        .notEmpty()
        .withMessage('Expiry year is required')
        .isInt({ min: new Date().getFullYear() })
        .withMessage('Invalid expiry year'),
    body('cvv')
        .notEmpty()
        .withMessage('CVV is required')
        .isLength({ min: 3, max: 4 })
        .withMessage('CVV must be 3-4 digits')
], validatePaymentMethod);

module.exports = router;
