const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOrCreateByUser(req.user._id);
        
        res.status(200).json({
            success: true,
            data: wishlist,
            count: wishlist.productsCount
        });
    } catch (error) {
        console.error('Get wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching wishlist'
        });
    }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist/:productId
// @access  Private
const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        
        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        // Find or create wishlist
        const wishlist = await Wishlist.findOrCreateByUser(req.user._id);
        
        // Add product to wishlist
        await wishlist.addProduct(productId);
        
        // Get updated wishlist with populated products
        const updatedWishlist = await Wishlist.findById(wishlist._id)
            .populate('products.product', 'name price salePrice images category stock averageRating totalReviews');
        
        res.status(200).json({
            success: true,
            message: 'Product added to wishlist successfully',
            data: updatedWishlist,
            count: updatedWishlist.productsCount
        });
        
    } catch (error) {
        console.error('Add to wishlist error:', error);
        if (error.message === 'Product already in wishlist') {
            return res.status(409).json({
                success: false,
                message: 'Product is already in your wishlist'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error while adding to wishlist'
        });
    }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        
        // Find user's wishlist
        const wishlist = await Wishlist.findOne({ user: req.user._id });
        
        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: 'Wishlist not found'
            });
        }
        
        // Check if product exists in wishlist
        if (!wishlist.hasProduct(productId)) {
            return res.status(404).json({
                success: false,
                message: 'Product not found in wishlist'
            });
        }
        
        // Remove product from wishlist
        await wishlist.removeProduct(productId);
        
        // Get updated wishlist with populated products
        const updatedWishlist = await Wishlist.findById(wishlist._id)
            .populate('products.product', 'name price salePrice images category stock averageRating totalReviews');
        
        res.status(200).json({
            success: true,
            message: 'Product removed from wishlist successfully',
            data: updatedWishlist,
            count: updatedWishlist.productsCount
        });
    } catch (error) {
        console.error('Remove from wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while removing from wishlist'
        });
    }
};

// @desc    Check if product is in wishlist
// @route   GET /api/wishlist/check/:productId
// @access  Private
const checkInWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        
        const wishlist = await Wishlist.findOne({ user: req.user._id });
        const isInWishlist = wishlist ? wishlist.hasProduct(productId) : false;
        
        res.status(200).json({
            success: true,
            inWishlist: isInWishlist
        });
    } catch (error) {
        console.error('Check wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while checking wishlist'
        });
    }
};

// @desc    Clear entire wishlist
// @route   DELETE /api/wishlist
// @access  Private
const clearWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user._id });
        
        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: 'Wishlist not found'
            });
        }
        
        await wishlist.clearWishlist();
        
        res.status(200).json({
            success: true,
            message: 'Wishlist cleared successfully',
            data: wishlist,
            count: 0
        });
    } catch (error) {
        console.error('Clear wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while clearing wishlist'
        });
    }
};

// @desc    Get wishlist count
// @route   GET /api/wishlist/count
// @access  Private
const getWishlistCount = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user._id });
        const count = wishlist ? wishlist.getCount() : 0;
        
        res.status(200).json({
            success: true,
            count: count
        });
    } catch (error) {
        console.error('Get wishlist count error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while getting wishlist count'
        });
    }
};

// @desc    Move wishlist items to cart
// @route   POST /api/wishlist/move-to-cart
// @access  Private
const moveToCart = async (req, res) => {
    try {
        const { productIds } = req.body; // Array of product IDs to move
        const Cart = require('../models/Cart');
        
        const wishlist = await Wishlist.findOne({ user: req.user._id });
        
        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: 'Wishlist not found'
            });
        }
        
        // Get user's cart or create one
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }
        
        const movedProducts = [];
        const errors = [];
        
        // Process each product ID
        for (const productId of productIds) {
            try {
                // Check if product is in wishlist
                if (!wishlist.hasProduct(productId)) {
                    errors.push(`Product ${productId} not found in wishlist`);
                    continue;
                }
                
                // Get product details
                const product = await Product.findById(productId);
                if (!product) {
                    errors.push(`Product ${productId} not found`);
                    continue;
                }
                
                // Check if product is in stock
                if (product.stock === 0) {
                    errors.push(`Product ${product.name} is out of stock`);
                    continue;
                }
                
                // Add to cart (quantity 1 by default)
                await cart.addItem(productId, 1);
                
                // Remove from wishlist
                await wishlist.removeProduct(productId);
                
                movedProducts.push({
                    productId: productId,
                    name: product.name
                });
                
            } catch (error) {
                errors.push(`Error processing product ${productId}: ${error.message}`);
            }
        }
        
        // Get updated wishlist and cart
        const updatedWishlist = await Wishlist.findById(wishlist._id)
            .populate('products.product', 'name price salePrice images category stock averageRating totalReviews');
        const updatedCart = await Cart.findById(cart._id)
            .populate('items.product', 'name price salePrice images category stock');
        
        res.status(200).json({
            success: true,
            message: `${movedProducts.length} products moved to cart`,
            data: {
                wishlist: updatedWishlist,
                cart: updatedCart,
                movedProducts: movedProducts,
                errors: errors
            }
        });
    } catch (error) {
        console.error('Move to cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while moving items to cart'
        });
    }
};

module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    checkInWishlist,
    clearWishlist,
    getWishlistCount,
    moveToCart
};
