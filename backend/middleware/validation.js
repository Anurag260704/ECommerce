const { body, param, query } = require('express-validator');

// User registration validation
exports.validateRegister = [
    // Support both firstName/lastName and name field formats
    body('firstName')
        .optional()
        .isLength({ min: 2, max: 25 })
        .withMessage('First name must be between 2 and 25 characters')
        .trim(),
    
    body('lastName')
        .optional()
        .isLength({ min: 2, max: 25 })
        .withMessage('Last name must be between 2 and 25 characters')
        .trim(),
    
    body('name')
        .optional()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters')
        .trim(),
    
    // Custom validation to ensure at least one name format is provided
    body().custom((value, { req }) => {
        const { firstName, lastName, name } = req.body;
        if (!name && (!firstName || !lastName)) {
            throw new Error('Either provide name or both firstName and lastName');
        }
        return true;
    }),
    
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
];

// User login validation
exports.validateLogin = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

// Change password validation
exports.validateChangePassword = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
    
    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Password confirmation does not match new password');
            }
            return true;
        })
];

// Reset password validation
exports.validateResetPassword = [
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    
    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Password confirmation does not match password');
            }
            return true;
        })
];

// Product creation/update validation
exports.validateProduct = [
    body('name')
        .notEmpty()
        .withMessage('Product name is required')
        .isLength({ max: 100 })
        .withMessage('Product name cannot exceed 100 characters')
        .trim(),
    
    body('description')
        .notEmpty()
        .withMessage('Product description is required')
        .isLength({ max: 2000 })
        .withMessage('Product description cannot exceed 2000 characters')
        .trim(),
    
    body('price')
        .isNumeric()
        .withMessage('Price must be a number')
        .isFloat({ min: 0 })
        .withMessage('Price cannot be negative'),
    
    body('discountPrice')
        .optional()
        .isNumeric()
        .withMessage('Discount price must be a number')
        .isFloat({ min: 0 })
        .withMessage('Discount price cannot be negative')
        .custom((value, { req }) => {
            if (value && parseFloat(value) >= parseFloat(req.body.price)) {
                throw new Error('Discount price must be less than regular price');
            }
            return true;
        }),
    
    body('category')
        .notEmpty()
        .withMessage('Product category is required')
        .isIn([
            'Electronics',
            'Clothing',
            'Books',
            'Home & Garden',
            'Sports',
            'Beauty & Health',
            'Automotive',
            'Food & Beverages',
            'Toys & Games',
            'Others'
        ])
        .withMessage('Please select a valid category'),
    
    body('stock')
        .isInt({ min: 0 })
        .withMessage('Stock must be a non-negative integer'),
    
    body('brand')
        .optional()
        .isLength({ max: 50 })
        .withMessage('Brand name cannot exceed 50 characters')
        .trim(),
    
    body('weight')
        .optional()
        .isNumeric()
        .withMessage('Weight must be a number')
        .isFloat({ min: 0 })
        .withMessage('Weight cannot be negative')
];

// Product review validation
exports.validateReview = [
    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),
    
    body('comment')
        .notEmpty()
        .withMessage('Review comment is required')
        .isLength({ min: 10, max: 500 })
        .withMessage('Review comment must be between 10 and 500 characters')
        .trim()
];

// Cart item validation
exports.validateCartItem = [
    body('productId')
        .isMongoId()
        .withMessage('Invalid product ID'),
    
    body('quantity')
        .isInt({ min: 1, max: 50 })
        .withMessage('Quantity must be between 1 and 50')
];

// Update cart item validation
exports.validateUpdateCartItem = [
    body('quantity')
        .isInt({ min: 0, max: 50 })
        .withMessage('Quantity must be between 0 and 50')
];

// Order validation
exports.validateOrder = [
    body('shippingAddress')
        .notEmpty()
        .withMessage('Shipping address is required'),
    
    body('shippingAddress.street')
        .notEmpty()
        .withMessage('Street address is required')
        .isLength({ max: 200 })
        .withMessage('Street address cannot exceed 200 characters')
        .trim(),
    
    body('shippingAddress.city')
        .notEmpty()
        .withMessage('City is required')
        .isLength({ max: 50 })
        .withMessage('City name cannot exceed 50 characters')
        .trim(),
    
    body('shippingAddress.state')
        .notEmpty()
        .withMessage('State is required')
        .isLength({ max: 50 })
        .withMessage('State name cannot exceed 50 characters')
        .trim(),
    
    body('shippingAddress.zipCode')
        .notEmpty()
        .withMessage('ZIP code is required')
        .isLength({ max: 10 })
        .withMessage('ZIP code cannot exceed 10 characters')
        .trim(),
    
    body('shippingAddress.country')
        .notEmpty()
        .withMessage('Country is required')
        .isLength({ max: 50 })
        .withMessage('Country name cannot exceed 50 characters')
        .trim(),
    
    body('shippingAddress.phone')
        .notEmpty()
        .withMessage('Phone number is required')
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),
    
    body('paymentMethod')
        .isIn(['credit_card', 'debit_card', 'paypal', 'stripe', 'razorpay', 'cash_on_delivery'])
        .withMessage('Invalid payment method'),
    
    body('orderNotes')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Order notes cannot exceed 500 characters')
        .trim()
];

// Update order status validation
exports.validateOrderStatus = [
    body('status')
        .isIn(['processing', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'])
        .withMessage('Invalid order status'),
    
    body('note')
        .optional()
        .isLength({ max: 200 })
        .withMessage('Status note cannot exceed 200 characters')
        .trim()
];

// MongoDB ObjectId validation
exports.validateObjectId = [
    param('id')
        .isMongoId()
        .withMessage('Invalid ID format')
];

// MongoDB ObjectId validation for productId parameter
exports.validateProductId = [
    param('productId')
        .isMongoId()
        .withMessage('Invalid product ID format')
];

// Pagination validation
exports.validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100')
];

// Search validation
exports.validateSearch = [
    query('q')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('Search query must be between 1 and 100 characters')
        .trim(),
    
    query('category')
        .optional()
        .isIn([
            'Electronics',
            'Clothing',
            'Books',
            'Home & Garden',
            'Sports',
            'Beauty & Health',
            'Automotive',
            'Food & Beverages',
            'Toys & Games',
            'Others'
        ])
        .withMessage('Invalid category'),
    
    query('minPrice')
        .optional()
        .isNumeric()
        .withMessage('Minimum price must be a number')
        .isFloat({ min: 0 })
        .withMessage('Minimum price cannot be negative'),
    
    query('maxPrice')
        .optional()
        .isNumeric()
        .withMessage('Maximum price must be a number')
        .isFloat({ min: 0 })
        .withMessage('Maximum price cannot be negative')
        .custom((value, { req }) => {
            if (req.query.minPrice && parseFloat(value) < parseFloat(req.query.minPrice)) {
                throw new Error('Maximum price must be greater than minimum price');
            }
            return true;
        }),
    
    query('sortBy')
        .optional()
        .isIn(['price', 'name', 'rating', 'createdAt'])
        .withMessage('Invalid sort field'),
    
    query('sortOrder')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('Sort order must be asc or desc')
];

// User profile update validation
exports.validateProfileUpdate = [
    body('name')
        .optional()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters')
        .trim(),
    
    body('phone')
        .optional()
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),
    
    body('address.street')
        .optional()
        .isLength({ max: 200 })
        .withMessage('Street address cannot exceed 200 characters')
        .trim(),
    
    body('address.city')
        .optional()
        .isLength({ max: 50 })
        .withMessage('City name cannot exceed 50 characters')
        .trim(),
    
    body('address.state')
        .optional()
        .isLength({ max: 50 })
        .withMessage('State name cannot exceed 50 characters')
        .trim(),
    
    body('address.zipCode')
        .optional()
        .isLength({ max: 10 })
        .withMessage('ZIP code cannot exceed 10 characters')
        .trim(),
    
    body('address.country')
        .optional()
        .isLength({ max: 50 })
        .withMessage('Country name cannot exceed 50 characters')
        .trim()
];
