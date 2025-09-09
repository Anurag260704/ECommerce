const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Payment method must belong to a user']
    },
    type: {
        type: String,
        required: [true, 'Payment type is required'],
        enum: {
            values: ['card', 'bank', 'wallet'],
            message: 'Payment type must be either card, bank, or wallet'
        }
    },
    holderName: {
        type: String,
        required: [true, 'Holder name is required'],
        maxlength: [100, 'Holder name cannot exceed 100 characters'],
        trim: true
    },
    // Card specific fields
    cardNumber: {
        type: String,
        required: function() {
            return this.type === 'card';
        },
        validate: {
            validator: function(v) {
                // Allow masked card numbers for display
                return this.type !== 'card' || (v && (v.includes('****') || v.length >= 13));
            },
            message: 'Valid card number is required for card payments'
        }
    },
    cardType: {
        type: String,
        required: function() {
            return this.type === 'card';
        },
        enum: {
            values: ['visa', 'mastercard', 'amex', 'discover'],
            message: 'Card type must be visa, mastercard, amex, or discover'
        }
    },
    expiryMonth: {
        type: Number,
        required: function() {
            return this.type === 'card';
        },
        min: [1, 'Expiry month must be between 1 and 12'],
        max: [12, 'Expiry month must be between 1 and 12']
    },
    expiryYear: {
        type: Number,
        required: function() {
            return this.type === 'card';
        },
        min: [new Date().getFullYear(), 'Expiry year cannot be in the past']
    },
    // Bank specific fields
    bankName: {
        type: String,
        required: function() {
            return this.type === 'bank';
        },
        maxlength: [100, 'Bank name cannot exceed 100 characters']
    },
    accountNumber: {
        type: String,
        required: function() {
            return this.type === 'bank';
        },
        validate: {
            validator: function(v) {
                // Allow masked account numbers for display
                return this.type !== 'bank' || (v && (v.includes('****') || v.length >= 8));
            },
            message: 'Valid account number is required for bank payments'
        }
    },
    routingNumber: {
        type: String,
        required: function() {
            return this.type === 'bank';
        },
        length: [9, 'Routing number must be 9 digits']
    },
    // Wallet specific fields
    walletProvider: {
        type: String,
        required: function() {
            return this.type === 'wallet';
        },
        enum: {
            values: ['paypal', 'apple_pay', 'google_pay', 'samsung_pay'],
            message: 'Wallet provider must be paypal, apple_pay, google_pay, or samsung_pay'
        }
    },
    walletId: {
        type: String,
        required: function() {
            return this.type === 'wallet';
        },
        maxlength: [100, 'Wallet ID cannot exceed 100 characters']
    },
    // Common fields
    isDefault: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    billingAddress: {
        firstName: {
            type: String,
            maxlength: [50, 'First name cannot exceed 50 characters']
        },
        lastName: {
            type: String,
            maxlength: [50, 'Last name cannot exceed 50 characters']
        },
        addressLine1: {
            type: String,
            maxlength: [200, 'Address line 1 cannot exceed 200 characters']
        },
        addressLine2: {
            type: String,
            maxlength: [200, 'Address line 2 cannot exceed 200 characters']
        },
        city: {
            type: String,
            maxlength: [100, 'City cannot exceed 100 characters']
        },
        state: {
            type: String,
            maxlength: [100, 'State cannot exceed 100 characters']
        },
        postalCode: {
            type: String,
            maxlength: [20, 'Postal code cannot exceed 20 characters']
        },
        country: {
            type: String,
            maxlength: [100, 'Country cannot exceed 100 characters'],
            default: 'United States'
        }
    },
    lastUsed: {
        type: Date
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

// Indexes for better performance
paymentMethodSchema.index({ user: 1, isDefault: -1 });
paymentMethodSchema.index({ user: 1, type: 1 });
paymentMethodSchema.index({ user: 1, createdAt: -1 });

// Ensure only one default payment method per user
paymentMethodSchema.pre('save', async function(next) {
    if (this.isModified('isDefault') && this.isDefault) {
        // Set all other payment methods for this user to not default
        await this.constructor.updateMany(
            { user: this.user, _id: { $ne: this._id } },
            { isDefault: false }
        );
    }
    
    this.updatedAt = Date.now();
    next();
});

// Virtual to check if payment method is expired (for cards)
paymentMethodSchema.virtual('isExpired').get(function() {
    if (this.type !== 'card' || !this.expiryMonth || !this.expiryYear) {
        return false;
    }
    
    const now = new Date();
    const expiry = new Date(this.expiryYear, this.expiryMonth - 1, 1);
    return expiry < now;
});

// Virtual for masked display of sensitive information
paymentMethodSchema.virtual('displayInfo').get(function() {
    switch (this.type) {
        case 'card':
            return {
                type: 'Card',
                last4: this.cardNumber ? this.cardNumber.slice(-4) : '',
                cardType: this.cardType,
                expiry: `${this.expiryMonth}/${this.expiryYear}`
            };
        case 'bank':
            return {
                type: 'Bank Account',
                bankName: this.bankName,
                last4: this.accountNumber ? this.accountNumber.slice(-4) : ''
            };
        case 'wallet':
            return {
                type: 'Digital Wallet',
                provider: this.walletProvider,
                id: this.walletId
            };
        default:
            return { type: this.type };
    }
});

// Instance method to update last used timestamp
paymentMethodSchema.methods.markAsUsed = function() {
    this.lastUsed = new Date();
    return this.save();
};

// Instance method to activate/deactivate payment method
paymentMethodSchema.methods.toggleActive = function() {
    this.isActive = !this.isActive;
    return this.save();
};

// Static method to get user's default payment method
paymentMethodSchema.statics.getUserDefault = function(userId) {
    return this.findOne({ user: userId, isDefault: true, isActive: true });
};

// Static method to get user's payment methods by type
paymentMethodSchema.statics.getUserMethodsByType = function(userId, type) {
    return this.find({ user: userId, type, isActive: true }).sort({ isDefault: -1, createdAt: -1 });
};

// Ensure virtual fields are serialized
paymentMethodSchema.set('toJSON', { virtuals: true });
paymentMethodSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);
