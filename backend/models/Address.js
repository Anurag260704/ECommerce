const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['shipping', 'billing', 'both'],
        default: 'both'
    },
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        maxLength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        maxLength: [50, 'Last name cannot exceed 50 characters']
    },
    company: {
        type: String,
        maxLength: [100, 'Company name cannot exceed 100 characters']
    },
    addressLine1: {
        type: String,
        required: [true, 'Address line 1 is required'],
        maxLength: [200, 'Address line 1 cannot exceed 200 characters']
    },
    addressLine2: {
        type: String,
        maxLength: [200, 'Address line 2 cannot exceed 200 characters']
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        maxLength: [100, 'City cannot exceed 100 characters']
    },
    state: {
        type: String,
        required: [true, 'State is required'],
        maxLength: [100, 'State cannot exceed 100 characters']
    },
    postalCode: {
        type: String,
        required: [true, 'Postal code is required'],
        maxLength: [20, 'Postal code cannot exceed 20 characters']
    },
    country: {
        type: String,
        required: [true, 'Country is required'],
        maxLength: [100, 'Country cannot exceed 100 characters'],
        default: 'United States'
    },
    phone: {
        type: String,
        maxLength: [20, 'Phone number cannot exceed 20 characters']
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
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

// Index for faster user lookup
addressSchema.index({ user: 1 });

// Ensure only one default address per user per type
addressSchema.index({ user: 1, type: 1, isDefault: 1 }, { 
    unique: true,
    partialFilterExpression: { isDefault: true }
});

// Update the updatedAt field before saving
addressSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Method to get full name
addressSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Method to get formatted address
addressSchema.virtual('formattedAddress').get(function() {
    let address = this.addressLine1;
    if (this.addressLine2) {
        address += `, ${this.addressLine2}`;
    }
    address += `, ${this.city}, ${this.state} ${this.postalCode}`;
    if (this.country !== 'United States') {
        address += `, ${this.country}`;
    }
    return address;
});

// Static method to set default address
addressSchema.statics.setDefaultAddress = async function(userId, addressId, type = 'both') {
    // First, unset all default addresses for this user and type
    await this.updateMany(
        { 
            user: userId, 
            type: { $in: type === 'both' ? ['shipping', 'billing', 'both'] : [type, 'both'] }
        },
        { isDefault: false }
    );
    
    // Then set the new default
    return await this.findByIdAndUpdate(
        addressId,
        { isDefault: true },
        { new: true }
    );
};

// Ensure virtual fields are serialized
addressSchema.set('toJSON', { virtuals: true });
addressSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Address', addressSchema);
