const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const logger = require('../config/logger');

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// Create and send cookie with token
const sendTokenResponse = (user, statusCode, res, message) => {
    const token = generateToken(user._id);

    const options = {
        expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    };

    res.status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            message,
            token,
            user: user.getPublicProfile()
        });
};

// Email transporter setup
const createEmailTransporter = () => {
    return nodemailer.createTransporter({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    const startTime = Date.now();
    try {
        logger.info('User registration attempt started', {
            email: req.body.email,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString()
        });

        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logger.warn('User registration validation failed', {
                email: req.body.email,
                errors: errors.array(),
                ip: req.ip
            });
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { name, firstName, lastName, email, password } = req.body;

        // Check if user already exists
        const dbStart = Date.now();
        const existingUser = await User.findOne({ email });
        logger.dbOperation('User.findOne', 'users', { email }, Date.now() - dbStart);
        
        if (existingUser) {
            logger.warn('User registration failed - email already exists', {
                email,
                existingUserId: existingUser._id,
                ip: req.ip
            });
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create user - handle both name and firstName/lastName formats
        const userData = { email, password };
        if (firstName && lastName) {
            userData.firstName = firstName;
            userData.lastName = lastName;
        } else if (name) {
            // If only name is provided, split it
            const nameParts = name.split(' ');
            userData.firstName = nameParts[0];
            userData.lastName = nameParts.slice(1).join(' ') || nameParts[0];
        } else {
            logger.warn('User registration failed - missing name fields', {
                email,
                ip: req.ip
            });
            return res.status(400).json({
                success: false,
                message: 'Either firstName/lastName or name is required'
            });
        }

        const createStart = Date.now();
        const user = await User.create(userData);
        logger.dbOperation('User.create', 'users', { userId: user._id, email }, Date.now() - createStart);

        // Generate email verification token
        const verificationToken = user.generateEmailVerificationToken();
        const saveStart = Date.now();
        await user.save({ validateBeforeSave: false });
        logger.dbOperation('User.save', 'users', { userId: user._id }, Date.now() - saveStart);

        logger.authEvent('USER_REGISTERED', user._id, {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            ip: req.ip,
            responseTime: Date.now() - startTime
        });

        // Send verification email (optional - can be enabled later)
        // await sendVerificationEmail(user.email, verificationToken);

        sendTokenResponse(user, 201, res, 'User registered successfully');

    } catch (error) {
        logger.error('User registration error', {
            email: req.body.email,
            ip: req.ip,
            error: error.message,
            stack: error.stack,
            responseTime: Date.now() - startTime
        });
        
        // Pass error to global error handler
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    const startTime = Date.now();
    try {
        logger.info('User login attempt started', {
            email: req.body.email,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString()
        });

        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logger.warn('User login validation failed', {
                email: req.body.email,
                errors: errors.array(),
                ip: req.ip
            });
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Check if user exists and include password for comparison
        const dbStart = Date.now();
        const user = await User.findOne({ email }).select('+password');
        logger.dbOperation('User.findOne', 'users', { email }, Date.now() - dbStart);
        
        if (!user) {
            logger.warn('User login failed - user not found', {
                email,
                ip: req.ip,
                responseTime: Date.now() - startTime
            });
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const passwordStart = Date.now();
        const isPasswordValid = await user.comparePassword(password);
        logger.debug('Password comparison completed', {
            userId: user._id,
            isValid: isPasswordValid,
            duration: Date.now() - passwordStart
        });
        
        if (!isPasswordValid) {
            logger.warn('User login failed - invalid password', {
                userId: user._id,
                email,
                ip: req.ip,
                responseTime: Date.now() - startTime
            });
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        logger.authEvent('USER_LOGIN_SUCCESS', user._id, {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            ip: req.ip,
            responseTime: Date.now() - startTime
        });

        sendTokenResponse(user, 200, res, 'Login successful');

    } catch (error) {
        logger.error('User login error', {
            email: req.body.email,
            ip: req.ip,
            error: error.message,
            stack: error.stack,
            responseTime: Date.now() - startTime
        });
        
        // Pass error to global error handler
        next(error);
    }
};

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
    try {
        const userId = req.user?._id;
        
        logger.authEvent('USER_LOGOUT', userId, {
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        
        res.cookie('token', 'none', {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true
        });

        res.status(200).json({
            success: true,
            message: 'User logged out successfully'
        });
    } catch (error) {
        logger.error('User logout error', {
            userId: req.user?._id,
            error: error.message,
            stack: error.stack
        });
        next(error);
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        
        res.status(200).json({
            success: true,
            user: user.getPublicProfile()
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
    try {
        const { name, firstName, lastName, email, phone, address } = req.body;
        
        // Check if email is being updated and is already taken by another user
        if (email && email !== req.user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is already taken by another user'
                });
            }
        }
        
        const fieldsToUpdate = {};
        if (name) fieldsToUpdate.name = name;
        if (firstName) fieldsToUpdate.firstName = firstName;
        if (lastName) fieldsToUpdate.lastName = lastName;
        if (email) fieldsToUpdate.email = email;
        if (phone) fieldsToUpdate.phone = phone;
        if (address) fieldsToUpdate.address = address;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            fieldsToUpdate,
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: user.getPublicProfile()
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during profile update'
        });
    }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
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

        const { currentPassword, newPassword } = req.body;

        // Get user with password
        const user = await User.findById(req.user._id).select('+password');

        // Check current password
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        sendTokenResponse(user, 200, res, 'Password changed successfully');

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during password change'
        });
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found with this email'
            });
        }

        // Generate reset token
        const resetToken = user.generateResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        // Create reset URL
        const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;

        const message = `
            You are receiving this email because you (or someone else) has requested a password reset.
            Please click on the following link to reset your password:
            ${resetUrl}
            
            If you did not request this, please ignore this email and your password will remain unchanged.
        `;

        try {
            // Send email (optional - enable when email service is configured)
            /*
            const transporter = createEmailTransporter();
            await transporter.sendMail({
                from: process.env.FROM_EMAIL,
                to: user.email,
                subject: 'Password Reset Request',
                text: message
            });
            */

            res.status(200).json({
                success: true,
                message: 'Password reset email sent',
                // For development only - remove in production
                resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
            });

        } catch (error) {
            console.error('Email send error:', error);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({
                success: false,
                message: 'Email could not be sent'
            });
        }

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
exports.resetPassword = async (req, res, next) => {
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

        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resettoken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        sendTokenResponse(user, 200, res, 'Password reset successful');

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during password reset'
        });
    }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res, next) => {
    try {
        const emailVerificationToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({ emailVerificationToken });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid verification token'
            });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true,
            message: 'Email verified successfully'
        });

    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during email verification'
        });
    }
};
