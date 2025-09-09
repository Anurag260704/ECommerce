const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

// Protect routes - Check if user is authenticated
exports.protect = async (req, res, next) => {
    const startTime = Date.now();
    try {
        let token;
        let tokenSource = 'none';

        // Check for token in header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            tokenSource = 'header';
        }
        // Check for token in cookies
        else if (req.cookies.token) {
            token = req.cookies.token;
            tokenSource = 'cookie';
        }

        const authContext = {
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            tokenSource,
            hasToken: !!token,
            timestamp: new Date().toISOString()
        };

        // Make sure token exists
        if (!token) {
            logger.warn('Authentication failed - no token provided', authContext);
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route. Please login.'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            authContext.userId = decoded.userId;
            
            // Get user from token
            const dbStart = Date.now();
            const user = await User.findById(decoded.userId);
            logger.debug('User lookup completed', {
                userId: decoded.userId,
                found: !!user,
                duration: Date.now() - dbStart
            });
            
            if (!user) {
                logger.warn('Authentication failed - user not found', {
                    ...authContext,
                    userId: decoded.userId,
                    responseTime: Date.now() - startTime
                });
                return res.status(401).json({
                    success: false,
                    message: 'User not found. Please login again.'
                });
            }

            req.user = user;
            
            logger.authEvent('AUTH_SUCCESS', user._id, {
                method: req.method,
                url: req.originalUrl,
                ip: req.ip,
                tokenSource,
                responseTime: Date.now() - startTime
            });
            
            next();

        } catch (error) {
            logger.warn('Authentication failed - invalid token', {
                ...authContext,
                error: error.message,
                responseTime: Date.now() - startTime
            });
            
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Please login again.'
            });
        }

    } catch (error) {
        logger.error('Auth middleware error', {
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            error: error.message,
            stack: error.stack,
            responseTime: Date.now() - startTime
        });
        
        res.status(500).json({
            success: false,
            message: 'Server error in authentication'
        });
    }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        const authzContext = {
            userId: req.user?._id,
            userRole: req.user?.role,
            requiredRoles: roles,
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            timestamp: new Date().toISOString()
        };
        
        if (!roles.includes(req.user.role)) {
            logger.warn('Authorization failed - insufficient role', authzContext);
            return res.status(403).json({
                success: false,
                message: `User role '${req.user.role}' is not authorized to access this route`
            });
        }
        
        logger.authEvent('AUTHORIZATION_SUCCESS', req.user._id, {
            role: req.user.role,
            requiredRoles: roles,
            method: req.method,
            url: req.originalUrl
        });
        
        next();
    };
};

// Check if user is verified (optional middleware)
exports.verifyEmail = (req, res, next) => {
    if (!req.user.isEmailVerified) {
        return res.status(401).json({
            success: false,
            message: 'Please verify your email to access this resource'
        });
    }
    next();
};

// Optional authentication - doesn't fail if no token
exports.optionalAuth = async (req, res, next) => {
    try {
        let token;

        // Check for token in header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        // Check for token in cookies
        else if (req.cookies.token) {
            token = req.cookies.token;
        }

        if (token) {
            try {
                // Verify token
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                
                // Get user from token
                const user = await User.findById(decoded.userId);
                
                if (user) {
                    req.user = user;
                }
            } catch (error) {
                // Token is invalid, but we don't fail the request
                console.log('Invalid token in optional auth:', error.message);
            }
        }

        next();

    } catch (error) {
        console.error('Optional auth middleware error:', error);
        next(); // Don't fail the request
    }
};

// Check if user owns the resource (for user-specific resources)
exports.checkResourceOwnership = (resourceUserField = 'user') => {
    return (req, res, next) => {
        // This middleware should be used after protect and after fetching the resource
        // The resource should be available in req.resource or similar
        if (req.user.role === 'admin') {
            // Admin can access any resource
            return next();
        }

        // Check if the resource belongs to the current user
        const resource = req.resource || req.body || req.params;
        const resourceUserId = resource[resourceUserField];

        if (!resourceUserId || resourceUserId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this resource'
            });
        }

        next();
    };
};
