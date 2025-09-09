const Address = require('../models/Address');
const { validationResult } = require('express-validator');

// @desc    Get all user addresses
// @route   GET /api/addresses
// @access  Private
exports.getAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({ 
            user: req.user._id, 
            isActive: true 
        }).sort({ isDefault: -1, createdAt: -1 });

        res.status(200).json({
            success: true,
            count: addresses.length,
            addresses
        });

    } catch (error) {
        console.error('Get addresses error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching addresses'
        });
    }
};

// @desc    Get single address
// @route   GET /api/addresses/:id
// @access  Private
exports.getAddress = async (req, res) => {
    try {
        const address = await Address.findById(req.params.id);

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        // Check if address belongs to user
        if (address.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this address'
            });
        }

        res.status(200).json({
            success: true,
            address
        });

    } catch (error) {
        console.error('Get address error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching address'
        });
    }
};

// @desc    Create new address
// @route   POST /api/addresses
// @access  Private
exports.createAddress = async (req, res) => {
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

        const addressData = {
            ...req.body,
            user: req.user._id
        };

        const address = new Address(addressData);
        await address.save();

        // If this is set as default, update other addresses
        if (address.isDefault) {
            await Address.setDefaultAddress(req.user._id, address._id, address.type);
        }

        res.status(201).json({
            success: true,
            message: 'Address created successfully',
            address
        });

    } catch (error) {
        console.error('Create address error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating address'
        });
    }
};

// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private
exports.updateAddress = async (req, res) => {
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

        let address = await Address.findById(req.params.id);

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        // Check if address belongs to user
        if (address.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this address'
            });
        }

        address = await Address.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        // If this is set as default, update other addresses
        if (address.isDefault) {
            await Address.setDefaultAddress(req.user._id, address._id, address.type);
        }

        res.status(200).json({
            success: true,
            message: 'Address updated successfully',
            address
        });

    } catch (error) {
        console.error('Update address error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating address'
        });
    }
};

// @desc    Delete address
// @route   DELETE /api/addresses/:id
// @access  Private
exports.deleteAddress = async (req, res) => {
    try {
        const address = await Address.findById(req.params.id);

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        // Check if address belongs to user
        if (address.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this address'
            });
        }

        // Soft delete - mark as inactive
        address.isActive = false;
        address.isDefault = false;
        await address.save();

        res.status(200).json({
            success: true,
            message: 'Address deleted successfully'
        });

    } catch (error) {
        console.error('Delete address error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting address'
        });
    }
};

// @desc    Set default address
// @route   PUT /api/addresses/:id/default
// @access  Private
exports.setDefaultAddress = async (req, res) => {
    try {
        const address = await Address.findById(req.params.id);

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        // Check if address belongs to user
        if (address.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to modify this address'
            });
        }

        // Set as default
        await Address.setDefaultAddress(req.user._id, address._id, address.type);

        // Get updated address
        const updatedAddress = await Address.findById(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Default address updated successfully',
            address: updatedAddress
        });

    } catch (error) {
        console.error('Set default address error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while setting default address'
        });
    }
};

// @desc    Get default addresses
// @route   GET /api/addresses/default
// @access  Private
exports.getDefaultAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({ 
            user: req.user._id, 
            isActive: true,
            isDefault: true
        });

        res.status(200).json({
            success: true,
            addresses
        });

    } catch (error) {
        console.error('Get default addresses error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching default addresses'
        });
    }
};

// @desc    Validate address
// @route   POST /api/addresses/validate
// @access  Private
exports.validateAddress = async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Address validation failed',
                errors: errors.array()
            });
        }

        // Mock address validation - in production, integrate with address validation service
        const { addressLine1, city, state, postalCode, country } = req.body;
        
        // Basic validation
        const validationResult = {
            isValid: true,
            suggestions: [],
            warnings: []
        };

        // Check postal code format (basic US format)
        if (country === 'United States') {
            const usZipRegex = /^\d{5}(-\d{4})?$/;
            if (!usZipRegex.test(postalCode)) {
                validationResult.warnings.push('Postal code format may be incorrect for US addresses');
            }
        }

        // Mock suggestion for demo
        if (addressLine1.toLowerCase().includes('123 main st')) {
            validationResult.suggestions.push({
                field: 'addressLine1',
                suggestion: '123 Main Street',
                reason: 'Standardized street format'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Address validation completed',
            validation: validationResult
        });

    } catch (error) {
        console.error('Validate address error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while validating address'
        });
    }
};
