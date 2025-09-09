const { body, param, query } = require('express-validator');

// Validation for creating category
exports.validateCreateCategory = [
    body('name')
        .notEmpty()
        .withMessage('Category name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Category name must be between 2 and 100 characters')
        .trim(),
    
    body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters')
        .trim(),
    
    body('parent')
        .optional()
        .isMongoId()
        .withMessage('Parent must be a valid category ID'),
    
    body('image')
        .optional()
        .isURL()
        .withMessage('Image must be a valid URL'),
    
    body('imageAlt')
        .optional()
        .isLength({ max: 200 })
        .withMessage('Image alt text cannot exceed 200 characters')
        .trim(),
    
    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive must be a boolean value'),
    
    body('isFeatured')
        .optional()
        .isBoolean()
        .withMessage('isFeatured must be a boolean value'),
    
    body('sortOrder')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Sort order must be a non-negative integer'),
    
    body('seoTitle')
        .optional()
        .isLength({ max: 60 })
        .withMessage('SEO title cannot exceed 60 characters')
        .trim(),
    
    body('seoDescription')
        .optional()
        .isLength({ max: 160 })
        .withMessage('SEO description cannot exceed 160 characters')
        .trim(),
    
    body('keywords')
        .optional()
        .isArray()
        .withMessage('Keywords must be an array'),
    
    body('keywords.*')
        .optional()
        .isLength({ min: 1, max: 50 })
        .withMessage('Each keyword must be between 1 and 50 characters')
        .trim(),
    
    body('metaData.color')
        .optional()
        .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
        .withMessage('Color must be a valid hex color code'),
    
    body('metaData.icon')
        .optional()
        .isLength({ min: 1, max: 50 })
        .withMessage('Icon must be between 1 and 50 characters')
        .trim()
];

// Validation for updating category
exports.validateUpdateCategory = [
    param('id')
        .isMongoId()
        .withMessage('Category ID must be a valid MongoDB ObjectId'),
    
    body('name')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('Category name must be between 2 and 100 characters')
        .trim(),
    
    body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters')
        .trim(),
    
    body('parent')
        .optional()
        .custom((value, { req }) => {
            if (value === null || value === '') return true;
            if (!value.match(/^[0-9a-fA-F]{24}$/)) {
                throw new Error('Parent must be a valid category ID');
            }
            if (value === req.params.id) {
                throw new Error('Category cannot be its own parent');
            }
            return true;
        }),
    
    body('image')
        .optional()
        .isURL()
        .withMessage('Image must be a valid URL'),
    
    body('imageAlt')
        .optional()
        .isLength({ max: 200 })
        .withMessage('Image alt text cannot exceed 200 characters')
        .trim(),
    
    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive must be a boolean value'),
    
    body('isFeatured')
        .optional()
        .isBoolean()
        .withMessage('isFeatured must be a boolean value'),
    
    body('sortOrder')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Sort order must be a non-negative integer'),
    
    body('seoTitle')
        .optional()
        .isLength({ max: 60 })
        .withMessage('SEO title cannot exceed 60 characters')
        .trim(),
    
    body('seoDescription')
        .optional()
        .isLength({ max: 160 })
        .withMessage('SEO description cannot exceed 160 characters')
        .trim(),
    
    body('keywords')
        .optional()
        .isArray()
        .withMessage('Keywords must be an array'),
    
    body('keywords.*')
        .optional()
        .isLength({ min: 1, max: 50 })
        .withMessage('Each keyword must be between 1 and 50 characters')
        .trim(),
    
    body('metaData.color')
        .optional()
        .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
        .withMessage('Color must be a valid hex color code'),
    
    body('metaData.icon')
        .optional()
        .isLength({ min: 1, max: 50 })
        .withMessage('Icon must be between 1 and 50 characters')
        .trim()
];

// Validation for category ID parameter
exports.validateCategoryId = [
    param('id')
        .custom((value) => {
            // Allow both MongoDB ObjectId and slug
            if (value.match(/^[0-9a-fA-F]{24}$/)) {
                return true; // Valid ObjectId
            }
            if (value.match(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)) {
                return true; // Valid slug
            }
            throw new Error('Invalid category identifier. Must be a valid ID or slug.');
        })
];

// Validation for category query parameters
exports.validateCategoryQuery = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    
    query('featured')
        .optional()
        .isIn(['true', 'false'])
        .withMessage('Featured must be true or false'),
    
    query('level')
        .optional()
        .isInt({ min: 0, max: 3 })
        .withMessage('Level must be between 0 and 3'),
    
    query('parent')
        .optional()
        .custom((value) => {
            if (value === 'null') return true;
            if (value.match(/^[0-9a-fA-F]{24}$/)) return true;
            throw new Error('Parent must be a valid category ID or "null"');
        }),
    
    query('active')
        .optional()
        .isIn(['true', 'false', 'all'])
        .withMessage('Active must be true, false, or all'),
    
    query('tree')
        .optional()
        .isIn(['true', 'false'])
        .withMessage('Tree must be true or false')
];

// Validation for category products query
exports.validateCategoryProductsQuery = [
    param('id')
        .custom((value) => {
            // Allow both MongoDB ObjectId and slug
            if (value.match(/^[0-9a-fA-F]{24}$/)) {
                return true; // Valid ObjectId
            }
            if (value.match(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)) {
                return true; // Valid slug
            }
            throw new Error('Invalid category identifier. Must be a valid ID or slug.');
        }),
    
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Limit must be between 1 and 50'),
    
    query('sortBy')
        .optional()
        .isIn(['name', 'price', 'createdAt', 'averageRating', 'popularity'])
        .withMessage('Sort by must be name, price, createdAt, averageRating, or popularity'),
    
    query('sortOrder')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('Sort order must be asc or desc'),
    
    query('minPrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Minimum price must be a non-negative number'),
    
    query('maxPrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Maximum price must be a non-negative number'),
    
    query('minRating')
        .optional()
        .isFloat({ min: 0, max: 5 })
        .withMessage('Minimum rating must be between 0 and 5')
];
