const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const PaymentMethod = require('../models/PaymentMethod');

// @desc    Get all user payment methods
// @route   GET /api/payment-methods
// @access  Private
const getPaymentMethods = asyncHandler(async (req, res) => {
    const paymentMethods = await PaymentMethod.find({ user: req.user.id }).sort({ isDefault: -1, createdAt: -1 });
    
    res.status(200).json({
        success: true,
        count: paymentMethods.length,
        data: paymentMethods
    });
});

// @desc    Get single payment method
// @route   GET /api/payment-methods/:id
// @access  Private
const getPaymentMethod = asyncHandler(async (req, res, next) => {
    const paymentMethod = await PaymentMethod.findById(req.params.id);
    
    if (!paymentMethod) {
        return res.status(404).json({
            success: false,
            message: 'Payment method not found'
        });
    }
    
    // Check if payment method belongs to user
    if (paymentMethod.user.toString() !== req.user.id) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this payment method'
        });
    }
    
    res.status(200).json({
        success: true,
        data: paymentMethod
    });
});

// @desc    Create new payment method
// @route   POST /api/payment-methods
// @access  Private
const createPaymentMethod = asyncHandler(async (req, res, next) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation errors',
            errors: errors.array()
        });
    }
    
    const { type, cardNumber, cardType, expiryMonth, expiryYear, holderName, isDefault = false } = req.body;
    
    // If this is set as default, unset other default payment methods
    if (isDefault) {
        await PaymentMethod.updateMany(
            { user: req.user.id }, 
            { isDefault: false }
        );
    }
    
    // Check if user has no payment methods and make this default
    const existingPaymentMethods = await PaymentMethod.countDocuments({ user: req.user.id });
    const shouldBeDefault = existingPaymentMethods === 0 || isDefault;
    
    const paymentMethodData = {
        user: req.user.id,
        type,
        holderName,
        isDefault: shouldBeDefault
    };
    
    // Add card-specific fields if it's a card payment
    if (type === 'card') {
        // Mask card number (show only last 4 digits)
        const maskedCardNumber = '**** **** **** ' + cardNumber.slice(-4);
        paymentMethodData.cardNumber = maskedCardNumber;
        paymentMethodData.cardType = cardType;
        paymentMethodData.expiryMonth = expiryMonth;
        paymentMethodData.expiryYear = expiryYear;
    }
    
    const paymentMethod = await PaymentMethod.create(paymentMethodData);
    
    res.status(201).json({
        success: true,
        data: paymentMethod
    });
});

// @desc    Update payment method
// @route   PUT /api/payment-methods/:id
// @access  Private
const updatePaymentMethod = asyncHandler(async (req, res, next) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation errors',
            errors: errors.array()
        });
    }
    
    let paymentMethod = await PaymentMethod.findById(req.params.id);
    
    if (!paymentMethod) {
        return res.status(404).json({
            success: false,
            message: 'Payment method not found'
        });
    }
    
    // Check if payment method belongs to user
    if (paymentMethod.user.toString() !== req.user.id) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to update this payment method'
        });
    }
    
    const { type, cardNumber, cardType, expiryMonth, expiryYear, holderName, isDefault = false } = req.body;
    
    // If this is set as default, unset other default payment methods
    if (isDefault && !paymentMethod.isDefault) {
        await PaymentMethod.updateMany(
            { user: req.user.id, _id: { $ne: req.params.id } },
            { isDefault: false }
        );
    }
    
    const updateData = {
        type,
        holderName,
        isDefault
    };
    
    // Add card-specific fields if it's a card payment
    if (type === 'card' && cardNumber) {
        // Mask card number (show only last 4 digits)
        const maskedCardNumber = '**** **** **** ' + cardNumber.slice(-4);
        updateData.cardNumber = maskedCardNumber;
        updateData.cardType = cardType;
        updateData.expiryMonth = expiryMonth;
        updateData.expiryYear = expiryYear;
    }
    
    paymentMethod = await PaymentMethod.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
    );
    
    res.status(200).json({
        success: true,
        data: paymentMethod
    });
});

// @desc    Delete payment method
// @route   DELETE /api/payment-methods/:id
// @access  Private
const deletePaymentMethod = asyncHandler(async (req, res, next) => {
    const paymentMethod = await PaymentMethod.findById(req.params.id);
    
    if (!paymentMethod) {
        return res.status(404).json({
            success: false,
            message: 'Payment method not found'
        });
    }
    
    // Check if payment method belongs to user
    if (paymentMethod.user.toString() !== req.user.id) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to delete this payment method'
        });
    }
    
    // If this was the default payment method, set another one as default
    if (paymentMethod.isDefault) {
        const otherPaymentMethod = await PaymentMethod.findOne({ 
            user: req.user.id, 
            _id: { $ne: req.params.id } 
        });
        
        if (otherPaymentMethod) {
            otherPaymentMethod.isDefault = true;
            await otherPaymentMethod.save();
        }
    }
    
    await paymentMethod.deleteOne();
    
    res.status(200).json({
        success: true,
        message: 'Payment method deleted successfully'
    });
});

// @desc    Set default payment method
// @route   PUT /api/payment-methods/:id/default
// @access  Private
const setDefaultPaymentMethod = asyncHandler(async (req, res, next) => {
    const paymentMethod = await PaymentMethod.findById(req.params.id);
    
    if (!paymentMethod) {
        return res.status(404).json({
            success: false,
            message: 'Payment method not found'
        });
    }
    
    // Check if payment method belongs to user
    if (paymentMethod.user.toString() !== req.user.id) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to modify this payment method'
        });
    }
    
    // Unset all other default payment methods for this user
    await PaymentMethod.updateMany(
        { user: req.user.id },
        { isDefault: false }
    );
    
    // Set this payment method as default
    paymentMethod.isDefault = true;
    await paymentMethod.save();
    
    res.status(200).json({
        success: true,
        data: paymentMethod
    });
});

// @desc    Validate payment method
// @route   POST /api/payment-methods/validate
// @access  Private
const validatePaymentMethod = asyncHandler(async (req, res, next) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation errors',
            errors: errors.array()
        });
    }
    
    const { cardNumber, expiryMonth, expiryYear, cvv } = req.body;
    
    // Basic validation - in production, you'd integrate with payment processors
    const isValid = cardNumber && cardNumber.length >= 13 && 
                   expiryMonth >= 1 && expiryMonth <= 12 &&
                   expiryYear >= new Date().getFullYear() &&
                   cvv && cvv.length >= 3 && cvv.length <= 4;
    
    // Check if card has expired
    const currentDate = new Date();
    const cardExpiry = new Date(expiryYear, expiryMonth - 1, 1);
    const isExpired = cardExpiry < currentDate;
    
    res.status(200).json({
        success: true,
        data: {
            isValid: isValid && !isExpired,
            isExpired,
            message: isValid && !isExpired ? 'Payment method is valid' : 
                    isExpired ? 'Payment method has expired' : 
                    'Payment method is invalid'
        }
    });
});

module.exports = {
    getPaymentMethods,
    getPaymentMethod,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    validatePaymentMethod
};
