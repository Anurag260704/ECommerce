const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative']
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1']
    }
});

const shippingAddressSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    company: {
        type: String,
        maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    addressLine1: {
        type: String,
        required: true,
        maxlength: [200, 'Address line 1 cannot exceed 200 characters']
    },
    addressLine2: {
        type: String,
        maxlength: [200, 'Address line 2 cannot exceed 200 characters']
    },
    city: {
        type: String,
        required: true,
        maxlength: [100, 'City name cannot exceed 100 characters']
    },
    state: {
        type: String,
        required: true,
        maxlength: [100, 'State name cannot exceed 100 characters']
    },
    postalCode: {
        type: String,
        required: true,
        maxlength: [20, 'Postal code cannot exceed 20 characters']
    },
    country: {
        type: String,
        required: true,
        maxlength: [100, 'Country name cannot exceed 100 characters']
    },
    phone: {
        type: String,
        maxlength: [20, 'Phone number cannot exceed 20 characters']
    }
});

const paymentInfoSchema = new mongoose.Schema({
    method: {
        type: String,
        required: true,
        enum: ['credit_card', 'debit_card', 'paypal', 'stripe', 'razorpay', 'cash_on_delivery']
    },
    transactionId: {
        type: String,
        required: function() {
            return this.method !== 'cash_on_delivery';
        }
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    paidAt: {
        type: Date
    },
    amount: {
        type: Number,
        required: true,
        min: [0, 'Amount cannot be negative']
    }
});

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true,
        sparse: true
    },
    orderItems: [orderItemSchema],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    shippingAddress: {
        type: shippingAddressSchema,
        required: true
    },
    paymentInfo: {
        type: paymentInfoSchema,
        required: true
    },
    orderStatus: {
        type: String,
        required: true,
        enum: [
            'processing',
            'confirmed',
            'shipped',
            'out_for_delivery',
            'delivered',
            'cancelled',
            'returned'
        ],
        default: 'processing'
    },
    itemsPrice: {
        type: Number,
        required: true,
        min: [0, 'Items price cannot be negative']
    },
    taxPrice: {
        type: Number,
        required: true,
        min: [0, 'Tax price cannot be negative'],
        default: 0
    },
    shippingPrice: {
        type: Number,
        required: true,
        min: [0, 'Shipping price cannot be negative'],
        default: 0
    },
    discountAmount: {
        type: Number,
        min: [0, 'Discount amount cannot be negative'],
        default: 0
    },
    totalPrice: {
        type: Number,
        required: true,
        min: [0, 'Total price cannot be negative']
    },
    orderNotes: {
        type: String,
        maxlength: [500, 'Order notes cannot exceed 500 characters']
    },
    trackingNumber: {
        type: String,
        sparse: true
    },
    estimatedDelivery: {
        type: Date
    },
    actualDelivery: {
        type: Date
    },
    statusHistory: [{
        status: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        note: String
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

// Indexes for better query performance
// Note: user and trackingNumber indexes are automatically created by field constraints
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });

// Generate unique order number
orderSchema.pre('save', async function(next) {
    if (this.isNew) {
        // Generate order number: ORD-YYYYMMDD-XXXXX
        const date = new Date();
        const dateStr = date.getFullYear().toString() + 
                       (date.getMonth() + 1).toString().padStart(2, '0') + 
                       date.getDate().toString().padStart(2, '0');
        
        const randomNum = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
        this.orderNumber = `ORD-${dateStr}-${randomNum}`;

        // Add initial status to history
        this.statusHistory.push({
            status: this.orderStatus,
            timestamp: new Date(),
            note: 'Order placed successfully'
        });
    }
    
    this.updatedAt = Date.now();
    next();
});

// Update status with history tracking
orderSchema.methods.updateStatus = function(newStatus, note = '') {
    if (this.orderStatus !== newStatus) {
        this.orderStatus = newStatus;
        this.statusHistory.push({
            status: newStatus,
            timestamp: new Date(),
            note
        });

        // Set delivery date if delivered
        if (newStatus === 'delivered' && !this.actualDelivery) {
            this.actualDelivery = new Date();
        }
    }
};

// Calculate order totals
orderSchema.methods.calculateTotals = function() {
    this.itemsPrice = this.orderItems.reduce((total, item) => 
        total + (item.price * item.quantity), 0
    );
    
    this.totalPrice = this.itemsPrice + this.taxPrice + this.shippingPrice - this.discountAmount;
};

// Check if order can be cancelled
orderSchema.methods.canBeCancelled = function() {
    return ['processing', 'confirmed'].includes(this.orderStatus);
};

// Check if order can be returned
orderSchema.methods.canBeReturned = function() {
    if (this.orderStatus !== 'delivered') return false;
    
    const deliveryDate = this.actualDelivery;
    if (!deliveryDate) return false;
    
    // Allow returns within 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return deliveryDate > thirtyDaysAgo;
};

// Get order summary
orderSchema.methods.getSummary = function() {
    return {
        orderNumber: this.orderNumber,
        orderStatus: this.orderStatus,
        totalPrice: this.totalPrice,
        itemsCount: this.orderItems.length,
        createdAt: this.createdAt,
        estimatedDelivery: this.estimatedDelivery
    };
};

// Static method to get orders by status
orderSchema.statics.findByStatus = function(status, limit = 50) {
    return this.find({ orderStatus: status })
               .populate('user', 'name email')
               .sort({ createdAt: -1 })
               .limit(limit);
};

// Static method to get user orders
orderSchema.statics.findUserOrders = function(userId, limit = 10) {
    return this.find({ user: userId })
               .populate('orderItems.product', 'name images')
               .sort({ createdAt: -1 })
               .limit(limit);
};

// Virtual for order age in days
orderSchema.virtual('orderAge').get(function() {
    const now = new Date();
    const created = this.createdAt;
    const timeDiff = now.getTime() - created.getTime();
    return Math.floor(timeDiff / (1000 * 3600 * 24));
});

// Virtual to check if order is recent (within 24 hours)
orderSchema.virtual('isRecent').get(function() {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    return this.createdAt > twentyFourHoursAgo;
});

// Ensure virtual fields are serialized
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema);
