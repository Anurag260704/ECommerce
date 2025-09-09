const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
    },
    comment: {
        type: String,
        required: true,
        maxlength: [500, 'Review comment cannot exceed 500 characters']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        maxlength: [2000, 'Product description cannot exceed 2000 characters']
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative']
    },
    discountPrice: {
        type: Number,
        min: [0, 'Discount price cannot be negative'],
        validate: {
            validator: function(value) {
                return !value || value < this.price;
            },
            message: 'Discount price must be less than regular price'
        }
    },
    category: {
        type: String,
        required: [true, 'Product category is required'],
        enum: {
            values: [
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
            ],
            message: 'Please select a valid category'
        }
    },
    subCategory: {
        type: String,
        maxlength: [50, 'Sub-category cannot exceed 50 characters']
    },
    brand: {
        type: String,
        maxlength: [50, 'Brand name cannot exceed 50 characters']
    },
    images: [{
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    }],
    stock: {
        type: Number,
        required: [true, 'Product stock is required'],
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    seller: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    reviews: [reviewSchema],
    numOfReviews: {
        type: Number,
        default: 0
    },
    ratings: {
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be negative'],
        max: [5, 'Rating cannot exceed 5']
    },
    specifications: {
        type: Map,
        of: String
    },
    tags: [{
        type: String,
        maxlength: [30, 'Tag cannot exceed 30 characters']
    }],
    weight: {
        type: Number,
        min: [0, 'Weight cannot be negative']
    },
    dimensions: {
        length: Number,
        width: Number,
        height: Number
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
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

// Indexes for better query performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ ratings: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ seller: 1 });

// Update the updatedAt field before saving
productSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Calculate average rating and number of reviews
productSchema.methods.calculateRating = function() {
    if (this.reviews.length === 0) {
        this.ratings = 0;
        this.numOfReviews = 0;
        return;
    }

    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.ratings = Math.round((totalRating / this.reviews.length) * 10) / 10; // Round to 1 decimal place
    this.numOfReviews = this.reviews.length;
};

// Static method to get products by category
productSchema.statics.findByCategory = function(category) {
    return this.find({ category, isActive: true }).sort({ createdAt: -1 });
};

// Static method to get featured products
productSchema.statics.getFeaturedProducts = function(limit = 10) {
    return this.find({ isFeatured: true, isActive: true })
                .sort({ ratings: -1, createdAt: -1 })
                .limit(limit);
};

// Static method to search products
productSchema.statics.searchProducts = function(query, category = null, minPrice = null, maxPrice = null) {
    const searchQuery = {
        $text: { $search: query },
        isActive: true
    };

    if (category) {
        searchQuery.category = category;
    }

    if (minPrice !== null || maxPrice !== null) {
        searchQuery.price = {};
        if (minPrice !== null) searchQuery.price.$gte = minPrice;
        if (maxPrice !== null) searchQuery.price.$lte = maxPrice;
    }

    return this.find(searchQuery, { score: { $meta: 'textScore' } })
                .sort({ score: { $meta: 'textScore' }, ratings: -1 });
};

// Virtual for effective price (considering discount)
productSchema.virtual('effectivePrice').get(function() {
    return this.discountPrice || this.price;
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
    if (!this.discountPrice) return 0;
    return Math.round(((this.price - this.discountPrice) / this.price) * 100);
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
