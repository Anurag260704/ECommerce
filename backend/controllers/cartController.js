const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { validationResult } = require('express-validator');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res, next) => {
    try {
        const cart = await Cart.getOrCreateCart(req.user._id);
        
        // Populate product details
        await cart.populate('items.product', 'name price discountPrice images stock isActive');
        
        // Validate cart items against current product data
        const invalidItems = await cart.validateItems();
        
        res.status(200).json({
            success: true,
            cart,
            invalidItems: invalidItems.length > 0 ? invalidItems : undefined
        });

    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching cart'
        });
    }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
exports.addToCart = async (req, res, next) => {
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

        const { productId, quantity } = req.body;

        // Check if product exists and is active
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (!product.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Product is not available'
            });
        }

        // Check stock availability
        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} items available in stock`
            });
        }

        // Get or create cart
        const cart = await Cart.getOrCreateCart(req.user._id);

        // Check if item already exists in cart
        const existingItem = cart.getItem(productId);
        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            
            // Check if new quantity exceeds stock
            if (product.stock < newQuantity) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot add ${quantity} more items. Only ${product.stock - existingItem.quantity} more available.`
                });
            }
            
            cart.updateItemQuantity(productId, newQuantity);
        } else {
            // Add new item
            const price = product.discountPrice || product.price;
            cart.addItem(productId, quantity, price);
        }

        await cart.save();

        // Populate product details for response
        await cart.populate('items.product', 'name price discountPrice images');

        res.status(200).json({
            success: true,
            message: 'Item added to cart successfully',
            cart
        });

    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while adding item to cart'
        });
    }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update/:productId
// @access  Private
exports.updateCartItem = async (req, res, next) => {
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

        const { productId } = req.params;
        const { quantity } = req.body;

        // Get user's cart
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        // Check if item exists in cart
        if (!cart.hasProduct(productId)) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }

        // If quantity is 0, remove item
        if (quantity === 0) {
            cart.removeItem(productId);
        } else {
            // Check product stock
            const product = await Product.findById(productId);
            if (!product || !product.isActive) {
                return res.status(400).json({
                    success: false,
                    message: 'Product is not available'
                });
            }

            if (product.stock < quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${product.stock} items available in stock`
                });
            }

            // Update item quantity
            const price = product.discountPrice || product.price;
            cart.updateItemQuantity(productId, quantity);
            
            // Update price in case it changed
            const item = cart.getItem(productId);
            if (item) {
                item.price = price;
            }
        }

        await cart.save();

        // Populate product details for response
        await cart.populate('items.product', 'name price discountPrice images');

        res.status(200).json({
            success: true,
            message: quantity === 0 ? 'Item removed from cart' : 'Cart item updated successfully',
            cart
        });

    } catch (error) {
        console.error('Update cart item error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating cart item'
        });
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:productId
// @access  Private
exports.removeFromCart = async (req, res, next) => {
    try {
        const { productId } = req.params;

        // Get user's cart
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        // Check if item exists in cart
        if (!cart.hasProduct(productId)) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }

        // Remove item
        cart.removeItem(productId);
        await cart.save();

        // Populate product details for response
        await cart.populate('items.product', 'name price discountPrice images');

        res.status(200).json({
            success: true,
            message: 'Item removed from cart successfully',
            cart
        });

    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while removing item from cart'
        });
    }
};

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
exports.clearCart = async (req, res, next) => {
    try {
        // Get user's cart
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        // Clear cart
        cart.clearCart();
        await cart.save();

        res.status(200).json({
            success: true,
            message: 'Cart cleared successfully',
            cart
        });

    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while clearing cart'
        });
    }
};

// @desc    Get cart summary
// @route   GET /api/cart/summary
// @access  Private
exports.getCartSummary = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        
        if (!cart || cart.isEmpty) {
            return res.status(200).json({
                success: true,
                summary: {
                    totalItems: 0,
                    totalPrice: 0,
                    itemsCount: 0
                }
            });
        }

        // Validate cart items
        await cart.validateItems();

        const summary = {
            totalItems: cart.totalItems,
            totalPrice: cart.totalPrice,
            itemsCount: cart.items.length,
            subtotal: cart.totalPrice,
            // Calculate estimated tax (example: 10%)
            estimatedTax: Math.round(cart.totalPrice * 0.1 * 100) / 100,
            // Calculate estimated shipping (free shipping over $100)
            estimatedShipping: cart.totalPrice >= 100 ? 0 : 10
        };

        // Calculate estimated total
        summary.estimatedTotal = summary.subtotal + summary.estimatedTax + summary.estimatedShipping;

        res.status(200).json({
            success: true,
            summary
        });

    } catch (error) {
        console.error('Get cart summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching cart summary'
        });
    }
};

// @desc    Validate cart items against current product data
// @route   POST /api/cart/validate
// @access  Private
exports.validateCart = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        // Validate all cart items
        const invalidItems = await cart.validateItems();

        // Populate product details
        await cart.populate('items.product', 'name price discountPrice images stock isActive');

        res.status(200).json({
            success: true,
            message: invalidItems.length > 0 ? 'Cart validated with some issues' : 'Cart is valid',
            cart,
            invalidItems,
            isValid: invalidItems.length === 0
        });

    } catch (error) {
        console.error('Validate cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while validating cart'
        });
    }
};

// @desc    Move item from cart to wishlist (placeholder for future implementation)
// @route   POST /api/cart/move-to-wishlist/:productId
// @access  Private
exports.moveToWishlist = async (req, res, next) => {
    try {
        const { productId } = req.params;

        // Get user's cart
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        // Check if item exists in cart
        if (!cart.hasProduct(productId)) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }

        // For now, just remove from cart (wishlist functionality can be added later)
        cart.removeItem(productId);
        await cart.save();

        res.status(200).json({
            success: true,
            message: 'Item moved to wishlist (removed from cart for now)',
            cart
        });

    } catch (error) {
        console.error('Move to wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while moving item to wishlist'
        });
    }
};
