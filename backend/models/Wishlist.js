const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for user-product combination to prevent duplicates
// Note: Single user index removed to avoid duplication with compound index
wishlistSchema.index({ user: 1, 'products.product': 1 });

// Update the updatedAt field before saving
wishlistSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Static method to find or create wishlist for a user
wishlistSchema.statics.findOrCreateByUser = async function(userId) {
    let wishlist = await this.findOne({ user: userId }).populate('products.product');
    
    if (!wishlist) {
        wishlist = await this.create({ user: userId, products: [] });
        wishlist = await this.findById(wishlist._id).populate('products.product');
    }
    
    return wishlist;
};

// Instance method to add product to wishlist
wishlistSchema.methods.addProduct = function(productId) {
    // Check if product already exists in wishlist
    const existingProduct = this.products.find(
        item => item.product.toString() === productId.toString()
    );
    
    if (existingProduct) {
        throw new Error('Product already in wishlist');
    }
    
    // Add product to wishlist
    this.products.push({
        product: productId,
        addedAt: new Date()
    });
    
    return this.save();
};

// Instance method to remove product from wishlist
wishlistSchema.methods.removeProduct = function(productId) {
    this.products = this.products.filter(
        item => item.product.toString() !== productId.toString()
    );
    
    return this.save();
};

// Instance method to check if product is in wishlist
wishlistSchema.methods.hasProduct = function(productId) {
    return this.products.some(
        item => item.product.toString() === productId.toString()
    );
};

// Instance method to get wishlist count
wishlistSchema.methods.getCount = function() {
    return this.products.length;
};

// Instance method to clear entire wishlist
wishlistSchema.methods.clearWishlist = function() {
    this.products = [];
    return this.save();
};

// Virtual for products count
wishlistSchema.virtual('productsCount').get(function() {
    return this.products.length;
});

// Ensure virtual fields are included in JSON output
wishlistSchema.set('toJSON', { virtuals: true });
wishlistSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);
