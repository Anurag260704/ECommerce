const Product = require('../models/Product');
const { validationResult } = require('express-validator');
const logger = require('../config/logger');
const { asyncHandler, dbHandler, validationHandler } = require('../utils/asyncHandler');

// @desc    Get all products with filtering, searching, and pagination
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
    const startTime = Date.now();
    try {
        logger.info('Fetching products', {
            query: req.query,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            userId: req.user?.id || 'anonymous'
        });

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        // Build query object
        let query = { isActive: true };

        // Search functionality
        const searchTerm = req.query.q || req.query.keyword;
        if (searchTerm) {
            query.$or = [
                { name: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } },
                { tags: { $in: [new RegExp(searchTerm, 'i')] } },
                { brand: { $regex: searchTerm, $options: 'i' } },
                { category: { $regex: searchTerm, $options: 'i' } }
            ];
        }

        // Filter by category
        if (req.query.category && req.query.category !== 'all') {
            query.category = req.query.category;
        }

        // Filter by price range
        if (req.query.minPrice || req.query.maxPrice) {
            query.price = {};
            if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
            if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
        }

        // Filter by rating
        if (req.query.minRating) {
            query.ratings = { $gte: parseFloat(req.query.minRating) };
        }

        // Filter by brand
        if (req.query.brand) {
            query.brand = new RegExp(req.query.brand, 'i');
        }

        // Filter by featured status
        if (req.query.featured === 'true') {
            query.isFeatured = true;
        }

        // Build sort object
        let sort = {};
        if (req.query.sortBy) {
            const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
            sort[req.query.sortBy] = sortOrder;
        } else if (req.query.sort) {
            // Handle alternative sort parameter format (sort=rating, sort=price, etc.)
            const sortField = req.query.sort;
            if (sortField === 'rating') {
                sort.ratings = -1; // Sort by rating descending by default
            } else if (sortField === 'price-low') {
                sort.price = 1; // Sort by price ascending
            } else if (sortField === 'price-high') {
                sort.price = -1; // Sort by price descending
            } else if (sortField === 'name') {
                sort.name = 1; // Sort by name ascending
            } else {
                sort[sortField] = -1; // Default to descending for other fields
            }
        } else {
            sort.createdAt = -1; // Default sort by newest first
        }

        // Log query details
        logger.debug('Product query built', {
            query: JSON.stringify(query),
            sort: JSON.stringify(sort),
            page,
            limit,
            skip
        });

        // Execute query with logging
        const products = await dbHandler(
            () => Product.find(query)
                .populate('seller', 'name')
                .sort(sort)
                .skip(skip)
                .limit(limit),
            'Product.find',
            'products'
        );

        // Get total count for pagination
        const totalProducts = await dbHandler(
            () => Product.countDocuments(query),
            'Product.countDocuments',
            'products'
        );
        
        const totalPages = Math.ceil(totalProducts / limit);

        logger.businessLogic('Products fetched successfully', {
            resultCount: products.length,
            totalProducts,
            currentPage: page,
            totalPages,
            searchTerm: searchTerm || null,
            filters: {
                category: req.query.category || null,
                priceRange: req.query.minPrice || req.query.maxPrice ? `${req.query.minPrice}-${req.query.maxPrice}` : null,
                brand: req.query.brand || null,
                minRating: req.query.minRating || null
            },
            responseTime: Date.now() - startTime
        }, req.user?.id);

        res.status(200).json({
            success: true,
            count: products.length,
            totalProducts,
            currentPage: page,
            totalPages,
            products
        });

    } catch (error) {
        logger.error('Get products error', {
            query: req.query,
            userId: req.user?.id || 'anonymous',
            error: error.message,
            stack: error.stack,
            responseTime: Date.now() - startTime
        });
        
        next(error);
    }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
    const startTime = Date.now();
    try {
        logger.info('Fetching single product', { productId: req.params.id, userId: req.user?.id || 'anonymous' });
        
        const product = await dbHandler(
            () => Product.findById(req.params.id)
                .populate('seller', 'name email')
                .populate('reviews.user', 'name'),
            'Product.findById',
            'products'
        );

        if (!product) {
            logger.warn('Product not found', { productId: req.params.id });
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (!product.isActive) {
            logger.warn('Product not active', { productId: req.params.id });
            return res.status(404).json({
                success: false,
                message: 'Product is not available'
            });
        }

        logger.businessLogic('Product fetched successfully', { productId: req.params.id, responseTime: Date.now() - startTime }, req.user?.id);

        res.status(200).json({
            success: true,
            product
        });

    } catch (error) {
        logger.error('Get product error', { productId: req.params.id, error: error.message, stack: error.stack, responseTime: Date.now() - startTime });
        next(error);
    }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Admin/Seller)
exports.createProduct = async (req, res, next) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        // Add seller to product data
        req.body.seller = req.user._id;

        const product = await Product.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product
        });

    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating product'
        });
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin/Owner)
exports.updateProduct = async (req, res, next) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if user owns the product or is admin
        if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this product'
            });
        }

        product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            product
        });

    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating product'
        });
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin/Owner)
exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if user owns the product or is admin
        if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this product'
            });
        }

        // Soft delete by setting isActive to false
        product.isActive = false;
        await product.save();

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });

    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting product'
        });
    }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 8;
        
        const products = await Product.getFeaturedProducts(limit)
            .populate('seller', 'name');

        res.status(200).json({
            success: true,
            count: products.length,
            products
        });

    } catch (error) {
        console.error('Get featured products error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching featured products'
        });
    }
};

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
exports.getProductsByCategory = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const products = await Product.find({
            category: req.params.category,
            isActive: true
        })
            .populate('seller', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalProducts = await Product.countDocuments({
            category: req.params.category,
            isActive: true
        });

        const totalPages = Math.ceil(totalProducts / limit);

        res.status(200).json({
            success: true,
            category: req.params.category,
            count: products.length,
            totalProducts,
            currentPage: page,
            totalPages,
            products
        });

    } catch (error) {
        console.error('Get products by category error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching products by category'
        });
    }
};

// @desc    Add product review
// @route   POST /api/products/:id/reviews
// @access  Private
exports.addReview = async (req, res, next) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { rating, comment } = req.body;

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if user already reviewed this product
        const existingReviewIndex = product.reviews.findIndex(
            review => review.user.toString() === req.user._id.toString()
        );

        const review = {
            user: req.user._id,
            name: req.user.name,
            rating: Number(rating),
            comment
        };

        if (existingReviewIndex !== -1) {
            // Update existing review
            product.reviews[existingReviewIndex] = review;
        } else {
            // Add new review
            product.reviews.push(review);
        }

        // Recalculate ratings
        product.calculateRating();

        await product.save();

        res.status(200).json({
            success: true,
            message: 'Review added successfully',
            review
        });

    } catch (error) {
        console.error('Add review error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while adding review'
        });
    }
};

// @desc    Get product reviews
// @route   GET /api/products/:id/reviews
// @access  Public
exports.getReviews = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const product = await Product.findById(req.params.id)
            .populate('reviews.user', 'name')
            .select('reviews ratings numOfReviews');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Sort reviews by newest first
        const sortedReviews = product.reviews.sort((a, b) => b.createdAt - a.createdAt);
        
        // Paginate reviews
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedReviews = sortedReviews.slice(startIndex, endIndex);
        
        const totalPages = Math.ceil(product.reviews.length / limit);

        res.status(200).json({
            success: true,
            count: paginatedReviews.length,
            totalReviews: product.reviews.length,
            currentPage: page,
            totalPages,
            averageRating: product.ratings,
            reviews: paginatedReviews
        });

    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching reviews'
        });
    }
};

// @desc    Delete review
// @route   DELETE /api/products/:id/reviews/:reviewId
// @access  Private (Admin/Review Owner)
exports.deleteReview = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const reviewIndex = product.reviews.findIndex(
            review => review._id.toString() === req.params.reviewId
        );

        if (reviewIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        const review = product.reviews[reviewIndex];

        // Check if user owns the review or is admin
        if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this review'
            });
        }

        // Remove review
        product.reviews.splice(reviewIndex, 1);

        // Recalculate ratings
        product.calculateRating();

        await product.save();

        res.status(200).json({
            success: true,
            message: 'Review deleted successfully'
        });

    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting review'
        });
    }
};

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
    try {
        const categories = await Product.distinct('category', { isActive: true });
        
        res.status(200).json({
            success: true,
            count: categories.length,
            categories
        });

    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching categories'
        });
    }
};
