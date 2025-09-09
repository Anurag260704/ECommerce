const express = require('express');
const {
    getAddresses,
    getAddress,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getDefaultAddresses,
    validateAddress
} = require('../controllers/addressController');
const { protect } = require('../middleware/auth');
const { body } = require('express-validator');

const router = express.Router();

// Address validation middleware
const addressValidation = [
    body('firstName')
        .notEmpty()
        .withMessage('First name is required')
        .isLength({ max: 50 })
        .withMessage('First name cannot exceed 50 characters'),
    body('lastName')
        .notEmpty()
        .withMessage('Last name is required')
        .isLength({ max: 50 })
        .withMessage('Last name cannot exceed 50 characters'),
    body('company')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Company name cannot exceed 100 characters'),
    body('addressLine1')
        .notEmpty()
        .withMessage('Address line 1 is required')
        .isLength({ max: 200 })
        .withMessage('Address line 1 cannot exceed 200 characters'),
    body('addressLine2')
        .optional()
        .isLength({ max: 200 })
        .withMessage('Address line 2 cannot exceed 200 characters'),
    body('city')
        .notEmpty()
        .withMessage('City is required')
        .isLength({ max: 100 })
        .withMessage('City cannot exceed 100 characters'),
    body('state')
        .notEmpty()
        .withMessage('State is required')
        .isLength({ max: 100 })
        .withMessage('State cannot exceed 100 characters'),
    body('postalCode')
        .notEmpty()
        .withMessage('Postal code is required')
        .isLength({ max: 20 })
        .withMessage('Postal code cannot exceed 20 characters'),
    body('country')
        .notEmpty()
        .withMessage('Country is required')
        .isLength({ max: 100 })
        .withMessage('Country cannot exceed 100 characters'),
    body('phone')
        .optional()
        .isLength({ max: 20 })
        .withMessage('Phone number cannot exceed 20 characters'),
    body('type')
        .optional()
        .isIn(['shipping', 'billing', 'both'])
        .withMessage('Invalid address type'),
    body('isDefault')
        .optional()
        .isBoolean()
        .withMessage('isDefault must be boolean')
];

// @route   GET /api/addresses
// @desc    Get all user addresses
// @access  Private
router.get('/', protect, getAddresses);

// @route   GET /api/addresses/default
// @desc    Get default addresses
// @access  Private
router.get('/default', protect, getDefaultAddresses);

// @route   GET /api/addresses/:id
// @desc    Get single address
// @access  Private
router.get('/:id', protect, getAddress);

// @route   POST /api/addresses
// @desc    Create new address
// @access  Private
router.post('/', protect, addressValidation, createAddress);

// @route   PUT /api/addresses/:id
// @desc    Update address
// @access  Private
router.put('/:id', protect, addressValidation, updateAddress);

// @route   DELETE /api/addresses/:id
// @desc    Delete address
// @access  Private
router.delete('/:id', protect, deleteAddress);

// @route   PUT /api/addresses/:id/default
// @desc    Set default address
// @access  Private
router.put('/:id/default', protect, setDefaultAddress);

// @route   POST /api/addresses/validate
// @desc    Validate address
// @access  Private
router.post('/validate', protect, [
    body('addressLine1')
        .notEmpty()
        .withMessage('Address line 1 is required'),
    body('city')
        .notEmpty()
        .withMessage('City is required'),
    body('state')
        .notEmpty()
        .withMessage('State is required'),
    body('postalCode')
        .notEmpty()
        .withMessage('Postal code is required'),
    body('country')
        .notEmpty()
        .withMessage('Country is required')
], validateAddress);

module.exports = router;
