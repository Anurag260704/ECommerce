const Category = require('../models/Category');
const Product = require('../models/Product');
const { validationResult } = require('express-validator');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            featured,
            level,
            parent,
            tree,
            active = 'true'
        } = req.query;

        let query = {};
        
        // Filter by active status
        if (active !== 'all') {
            query.isActive = active === 'true';
        }
        
        // Filter by featured
        if (featured === 'true') {
            query.isFeatured = true;
        }
        
        // Filter by level
        if (level !== undefined) {
            query.level = parseInt(level);
        }
        
        // Filter by parent
        if (parent) {
            query.parent = parent === 'null' ? null : parent;
        }

        // Return category tree structure
        if (tree === 'true') {
            const categoryTree = await Category.getCategoryTree();
            return res.status(200).json({
                success: true,
                count: categoryTree.length,
                categories: categoryTree
            });
        }

        // Regular paginated results
        const pageNum = parseInt(page);
        const pageSize = parseInt(limit);
        const skip = (pageNum - 1) * pageSize;

        const categories = await Category.find(query)
            .populate('parent', 'name slug')
            .populate('children', 'name slug productCount')
            .sort({ level: 1, sortOrder: 1, name: 1 })
            .skip(skip)
            .limit(pageSize);

        const totalCategories = await Category.countDocuments(query);
        const totalPages = Math.ceil(totalCategories / pageSize);

        res.status(200).json({
            success: true,
            count: categories.length,
            totalCategories,
            currentPage: pageNum,
            totalPages,
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

// @desc    Get featured categories
// @route   GET /api/categories/featured
// @access  Public
exports.getFeaturedCategories = async (req, res) => {
    try {
        const { limit = 8 } = req.query;
        
        const categories = await Category.getFeatured(parseInt(limit));
        
        res.status(200).json({
            success: true,
            count: categories.length,
            categories
        });

    } catch (error) {
        console.error('Get featured categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching featured categories'
        });
    }
};

// @desc    Get top-level categories
// @route   GET /api/categories/top-level
// @access  Public
exports.getTopLevelCategories = async (req, res) => {
    try {
        const categories = await Category.getTopLevel();
        
        res.status(200).json({
            success: true,
            count: categories.length,
            categories
        });

    } catch (error) {
        console.error('Get top-level categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching top-level categories'
        });
    }
};

// @desc    Get single category by ID or slug
// @route   GET /api/categories/:id
// @access  Public
exports.getCategory = async (req, res) => {
    try {
        let category;
        
        // Check if parameter is MongoDB ObjectId or slug
        if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            category = await Category.findById(req.params.id);
        } else {
            category = await Category.findOne({ slug: req.params.id });
        }
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Populate related data
        await category.populate('parent', 'name slug');
        await category.populate('children', 'name slug description image productCount');

        // Get category hierarchy/breadcrumbs
        const hierarchy = await category.getHierarchy();

        res.status(200).json({
            success: true,
            category: {
                ...category.toObject(),
                hierarchy
            }
        });

    } catch (error) {
        console.error('Get category error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching category'
        });
    }
};

// @desc    Get products by category
// @route   GET /api/categories/:id/products
// @access  Public
exports.getCategoryProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            minPrice,
            maxPrice,
            minRating
        } = req.query;

        let category;
        
        // Find category by ID or slug
        if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            category = await Category.findById(req.params.id);
        } else {
            category = await Category.findOne({ slug: req.params.id });
        }
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Build product query
        let productQuery = { 
            category: category._id,
            isActive: true,
            stock: { $gt: 0 }
        };

        // Price range filter
        if (minPrice || maxPrice) {
            productQuery.price = {};
            if (minPrice) productQuery.price.$gte = parseFloat(minPrice);
            if (maxPrice) productQuery.price.$lte = parseFloat(maxPrice);
        }

        // Rating filter
        if (minRating) {
            productQuery.averageRating = { $gte: parseFloat(minRating) };
        }

        // Pagination
        const pageNum = parseInt(page);
        const pageSize = parseInt(limit);
        const skip = (pageNum - 1) * pageSize;

        // Sort options
        let sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const products = await Product.find(productQuery)
            .populate('category', 'name slug')
            .sort(sortOptions)
            .skip(skip)
            .limit(pageSize)
            .select('-__v');

        const totalProducts = await Product.countDocuments(productQuery);
        const totalPages = Math.ceil(totalProducts / pageSize);

        res.status(200).json({
            success: true,
            category: {
                _id: category._id,
                name: category.name,
                slug: category.slug,
                description: category.description,
                hierarchy: await category.getHierarchy()
            },
            products,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalProducts,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1
            }
        });

    } catch (error) {
        console.error('Get category products error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching category products'
        });
    }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private (Admin)
exports.createCategory = async (req, res) => {
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

        const categoryData = { ...req.body };
        
        // Handle image data
        if (req.body.image && typeof req.body.image === 'string') {
            categoryData.image = {
                url: req.body.image,
                alt: req.body.imageAlt || `${req.body.name} category image`
            };
        }

        const category = await Category.create(categoryData);
        
        // Populate for response
        await category.populate('parent', 'name slug');

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            category
        });

    } catch (error) {
        console.error('Create category error:', error);
        
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                success: false,
                message: `Category ${field} already exists`
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error while creating category'
        });
    }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin)
exports.updateCategory = async (req, res) => {
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

        let category = await Category.findById(req.params.id);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        const updateData = { ...req.body };
        
        // Handle image data
        if (req.body.image && typeof req.body.image === 'string') {
            updateData.image = {
                url: req.body.image,
                alt: req.body.imageAlt || `${req.body.name || category.name} category image`
            };
        }

        category = await Category.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        // Populate for response
        await category.populate('parent', 'name slug');
        await category.populate('children', 'name slug');

        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            category
        });

    } catch (error) {
        console.error('Update category error:', error);
        
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                success: false,
                message: `Category ${field} already exists`
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error while updating category'
        });
    }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Check if category can be deleted
        const canDelete = await category.canBeDeleted();
        
        if (!canDelete) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete category. It contains products or subcategories.'
            });
        }

        await Category.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully'
        });

    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting category'
        });
    }
};

// @desc    Update product counts for all categories
// @route   POST /api/categories/update-counts
// @access  Private (Admin)
exports.updateProductCounts = async (req, res) => {
    try {
        await Category.updateAllProductCounts();
        
        res.status(200).json({
            success: true,
            message: 'Product counts updated for all categories'
        });

    } catch (error) {
        console.error('Update product counts error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating product counts'
        });
    }
};

// @desc    Toggle category featured status
// @route   PATCH /api/categories/:id/toggle-featured
// @access  Private (Admin)
exports.toggleFeatured = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        category.isFeatured = !category.isFeatured;
        await category.save();

        res.status(200).json({
            success: true,
            message: `Category ${category.isFeatured ? 'featured' : 'unfeatured'} successfully`,
            category
        });

    } catch (error) {
        console.error('Toggle featured error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while toggling featured status'
        });
    }
};

// @desc    Toggle category active status
// @route   PATCH /api/categories/:id/toggle-active
// @access  Private (Admin)
exports.toggleActive = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        category.isActive = !category.isActive;
        await category.save();

        res.status(200).json({
            success: true,
            message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
            category
        });

    } catch (error) {
        console.error('Toggle active error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while toggling active status'
        });
    }
};
