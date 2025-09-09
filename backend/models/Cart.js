const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1'],
        max: [50, 'Quantity cannot exceed 50']
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative']
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
});

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [cartItemSchema],
    totalItems: {
        type: Number,
        default: 0
    },
    totalPrice: {
        type: Number,
        default: 0,
        min: [0, 'Total price cannot be negative']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// User index is automatically created by unique: true constraint

// Update the updatedAt field before saving
cartSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Calculate total items and total price
cartSchema.methods.calculateTotals = function() {
    this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
    this.totalPrice = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

// Add item to cart
cartSchema.methods.addItem = function(productId, quantity, price) {
    const existingItemIndex = this.items.findIndex(item => 
        item.product.toString() === productId.toString()
    );

    if (existingItemIndex > -1) {
        // Update existing item
        this.items[existingItemIndex].quantity += quantity;
        this.items[existingItemIndex].price = price; // Update price in case it changed
    } else {
        // Add new item
        this.items.push({
            product: productId,
            quantity,
            price
        });
    }

    this.calculateTotals();
};

// Update item quantity
cartSchema.methods.updateItemQuantity = function(productId, quantity) {
    const itemIndex = this.items.findIndex(item => 
        item.product.toString() === productId.toString()
    );

    if (itemIndex > -1) {
        if (quantity <= 0) {
            // Remove item if quantity is 0 or less
            this.items.splice(itemIndex, 1);
        } else {
            this.items[itemIndex].quantity = quantity;
        }
        this.calculateTotals();
        return true;
    }
    return false;
};

// Remove item from cart
cartSchema.methods.removeItem = function(productId) {
    const itemIndex = this.items.findIndex(item => 
        item.product.toString() === productId.toString()
    );

    if (itemIndex > -1) {
        this.items.splice(itemIndex, 1);
        this.calculateTotals();
        return true;
    }
    return false;
};

// Clear cart
cartSchema.methods.clearCart = function() {
    this.items = [];
    this.totalItems = 0;
    this.totalPrice = 0;
};

// Check if product exists in cart
cartSchema.methods.hasProduct = function(productId) {
    return this.items.some(item => item.product.toString() === productId.toString());
};

// Get item by product ID
cartSchema.methods.getItem = function(productId) {
    return this.items.find(item => item.product.toString() === productId.toString());
};

// Static method to get or create cart for user
cartSchema.statics.getOrCreateCart = async function(userId) {
    try {
        // Use findOneAndUpdate with upsert to handle race conditions
        let cart = await this.findOneAndUpdate(
            { user: userId },
            { 
                $setOnInsert: { 
                    user: userId,
                    items: [],
                    totalItems: 0,
                    totalPrice: 0,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            },
            { 
                upsert: true, 
                new: true,
                runValidators: true
            }
        ).populate('items.product');
        
        return cart;
    } catch (error) {
        // If upsert fails due to duplicate key, try to find existing cart
        if (error.code === 11000) {
            const existingCart = await this.findOne({ user: userId }).populate('items.product');
            if (existingCart) {
                return existingCart;
            }
        }
        throw error;
    }
};

// Validate cart items against current product data
cartSchema.methods.validateItems = async function() {
    const Product = mongoose.model('Product');
    const invalidItems = [];

    for (let i = this.items.length - 1; i >= 0; i--) {
        const item = this.items[i];
        const product = await Product.findById(item.product);

        if (!product || !product.isActive || product.stock < item.quantity) {
            invalidItems.push({
                productId: item.product,
                reason: !product ? 'Product not found' : 
                       !product.isActive ? 'Product not available' : 
                       'Insufficient stock'
            });
            this.items.splice(i, 1);
        } else if (product.effectivePrice !== item.price) {
            // Update price if it has changed
            item.price = product.effectivePrice;
        }
    }

    if (invalidItems.length > 0 || this.items.some(item => item.price !== item.product?.effectivePrice)) {
        this.calculateTotals();
        await this.save();
    }

    return invalidItems;
};

// Virtual to check if cart is empty
cartSchema.virtual('isEmpty').get(function() {
    return this.items.length === 0;
});

// Ensure virtual fields are serialized
cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Cart', cartSchema);
