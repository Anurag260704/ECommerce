const logger = require('../config/logger');

/**
 * Async handler wrapper with logging
 * @param {Function} fn - Async function to wrap
 * @param {string} operationName - Name of the operation for logging
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn, operationName = 'Unknown Operation') => {
    return (req, res, next) => {
        const startTime = Date.now();
        
        // Log request start
        logger.debug(`${operationName} started`, {
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            userId: req.user?.id || 'anonymous',
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString()
        });

        Promise.resolve(fn(req, res, next))
            .then((result) => {
                // Log successful completion
                const responseTime = Date.now() - startTime;
                logger.debug(`${operationName} completed successfully`, {
                    method: req.method,
                    url: req.originalUrl,
                    userId: req.user?.id || 'anonymous',
                    responseTime: `${responseTime}ms`,
                    timestamp: new Date().toISOString()
                });
                return result;
            })
            .catch((error) => {
                // Log error with context
                const responseTime = Date.now() - startTime;
                logger.error(`${operationName} failed`, {
                    method: req.method,
                    url: req.originalUrl,
                    userId: req.user?.id || 'anonymous',
                    error: error.message,
                    stack: error.stack,
                    responseTime: `${responseTime}ms`,
                    body: req.body,
                    params: req.params,
                    query: req.query,
                    timestamp: new Date().toISOString()
                });
                next(error);
            });
    };
};

/**
 * Async handler with business logic logging
 * @param {Function} fn - Async function to wrap
 * @param {string} operationName - Name of the operation for logging
 * @param {Object} options - Additional options for logging
 * @returns {Function} Express middleware function
 */
const businessAsyncHandler = (fn, operationName = 'Business Operation', options = {}) => {
    return (req, res, next) => {
        const startTime = Date.now();
        
        // Log business operation start
        logger.businessLogic(`${operationName} started`, {
            method: req.method,
            url: req.originalUrl,
            ...options.logData
        }, req.user?.id);

        Promise.resolve(fn(req, res, next))
            .then((result) => {
                // Log successful completion
                const responseTime = Date.now() - startTime;
                logger.businessLogic(`${operationName} completed`, {
                    responseTime: `${responseTime}ms`,
                    result: options.logResult ? result : 'Operation completed',
                    ...options.logData
                }, req.user?.id);
                return result;
            })
            .catch((error) => {
                // Log business operation error
                const responseTime = Date.now() - startTime;
                logger.error(`${operationName} failed`, {
                    method: req.method,
                    url: req.originalUrl,
                    userId: req.user?.id || 'anonymous',
                    error: error.message,
                    stack: error.stack,
                    responseTime: `${responseTime}ms`,
                    operationType: 'business',
                    ...options.logData,
                    timestamp: new Date().toISOString()
                });
                next(error);
            });
    };
};

/**
 * Database operation wrapper with logging
 * @param {Function} dbOperation - Database operation function
 * @param {string} operationName - Name of the database operation
 * @param {string} collection - Collection name
 * @returns {Promise} Result of the database operation
 */
const dbHandler = async (dbOperation, operationName, collection) => {
    const startTime = Date.now();
    try {
        const result = await dbOperation();
        const duration = Date.now() - startTime;
        
        logger.dbOperation(operationName, collection, {
            success: true,
            resultCount: Array.isArray(result) ? result.length : (result ? 1 : 0)
        }, duration);
        
        return result;
    } catch (error) {
        const duration = Date.now() - startTime;
        
        logger.error(`Database operation failed: ${operationName}`, {
            collection,
            error: error.message,
            stack: error.stack,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString()
        });
        
        throw error;
    }
};

/**
 * Validation handler with logging
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @param {string} operationName - Name of the operation being validated
 * @returns {boolean} Returns true if validation passes, false otherwise
 */
const validationHandler = (req, res, next, operationName = 'Validation') => {
    const { validationResult } = require('express-validator');
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        logger.warn(`${operationName} validation failed`, {
            method: req.method,
            url: req.originalUrl,
            userId: req.user?.id || 'anonymous',
            errors: errors.array(),
            body: req.body,
            timestamp: new Date().toISOString()
        });
        
        res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
        
        return false;
    }
    
    return true;
};

module.exports = {
    asyncHandler,
    businessAsyncHandler,
    dbHandler,
    validationHandler
};
