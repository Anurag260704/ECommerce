const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log the error with full context
    const errorContext = {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id || 'anonymous',
        body: req.body,
        params: req.params,
        query: req.query,
        errorName: err.name,
        errorCode: err.code,
        timestamp: new Date().toISOString()
    };

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = `Resource not found with id: ${err.value}`;
        error = { message, statusCode: 404 };
        logger.warn('Invalid ObjectId provided', { ...errorContext, invalidId: err.value });
    }
    // Mongoose duplicate key
    else if (err.code === 11000) {
        const duplicateField = Object.keys(err.keyValue)[0];
        const duplicateValue = err.keyValue[duplicateField];
        const message = `Duplicate ${duplicateField}: ${duplicateValue} already exists`;
        error = { message, statusCode: 400 };
        logger.warn('Duplicate key error', { ...errorContext, duplicateField, duplicateValue });
    }
    // Mongoose validation error
    else if (err.name === 'ValidationError') {
        const validationErrors = Object.values(err.errors).map(error => ({
            field: error.path,
            message: error.message,
            value: error.value
        }));
        const message = validationErrors.map(error => error.message).join(', ');
        error = { message, statusCode: 400, validationErrors };
        logger.warn('Validation error', { ...errorContext, validationErrors });
    }
    // JWT errors
    else if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token. Please login again.';
        error = { message, statusCode: 401 };
        logger.warn('Invalid JWT token', errorContext);
    }
    else if (err.name === 'TokenExpiredError') {
        const message = 'Token expired. Please login again.';
        error = { message, statusCode: 401 };
        logger.warn('Expired JWT token', errorContext);
    }
    // Rate limiting errors
    else if (err.message && err.message.includes('Too many requests')) {
        const message = 'Too many requests. Please try again later.';
        error = { message, statusCode: 429 };
        logger.warn('Rate limit exceeded', errorContext);
    }
    // File upload errors
    else if (err.code === 'LIMIT_FILE_SIZE') {
        const message = 'File size too large. Maximum size allowed is 50MB.';
        error = { message, statusCode: 413 };
        logger.warn('File size limit exceeded', errorContext);
    }
    // Database connection errors
    else if (err.name === 'MongoNetworkError' || err.name === 'MongooseServerSelectionError') {
        const message = 'Database connection error. Please try again later.';
        error = { message, statusCode: 503 };
        logger.error('Database connection error', { ...errorContext, stack: err.stack });
    }
    // Generic server errors
    else {
        const statusCode = error.statusCode || 500;
        if (statusCode >= 500) {
            logger.error('Internal server error', { ...errorContext, stack: err.stack });
        } else {
            logger.warn('Client error', errorContext);
        }
    }

    const statusCode = error.statusCode || 500;
    const response = {
        success: false,
        message: error.message || 'Internal Server Error',
        ...(error.validationErrors && { validationErrors: error.validationErrors }),
        ...(process.env.NODE_ENV === 'development' && { 
            stack: err.stack,
            errorDetails: {
                name: err.name,
                code: err.code,
                path: req.originalUrl,
                method: req.method
            }
        })
    };

    res.status(statusCode).json(response);
};

const notFound = (req, res, next) => {
    logger.warn('Route not found', {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });
    
    const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};

module.exports = { errorHandler, notFound };
