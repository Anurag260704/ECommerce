const winston = require('winston');
const path = require('path');

// Create logs directory if it doesn't exist
const fs = require('fs');
const logDir = path.join(__dirname, '../logs');

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Custom format for logs
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.prettyPrint()
);

// Custom format for console output
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
        let log = `${timestamp} [${level}]: ${message}`;
        
        if (stack) {
            log += `\n${stack}`;
        }
        
        if (Object.keys(meta).length > 0) {
            log += `\nMeta: ${JSON.stringify(meta, null, 2)}`;
        }
        
        return log;
    })
);

// Create Winston logger
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: logFormat,
    defaultMeta: { service: 'ecommerce-api' },
    transports: [
        // Error logs - only errors
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
            maxsize: 10485760, // 10MB
            maxFiles: 5
        }),
        
        // Combined logs - all levels
        new winston.transports.File({
            filename: path.join(logDir, 'combined.log'),
            maxsize: 10485760, // 10MB
            maxFiles: 5
        }),
        
        // HTTP logs - for API requests
        new winston.transports.File({
            filename: path.join(logDir, 'http.log'),
            level: 'http',
            maxsize: 10485760, // 10MB
            maxFiles: 3
        })
    ],
    
    // Handle uncaught exceptions
    exceptionHandlers: [
        new winston.transports.File({
            filename: path.join(logDir, 'exceptions.log'),
            maxsize: 10485760, // 10MB
            maxFiles: 2
        })
    ],
    
    // Handle unhandled promise rejections
    rejectionHandlers: [
        new winston.transports.File({
            filename: path.join(logDir, 'rejections.log'),
            maxsize: 10485760, // 10MB
            maxFiles: 2
        })
    ]
});

// Add console transport for non-production environments
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: consoleFormat,
        level: 'debug'
    }));
}

// Custom logging methods for different scenarios
logger.apiRequest = (req, statusCode, responseTime) => {
    const logData = {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        statusCode,
        responseTime: `${responseTime}ms`,
        userId: req.user?.id || 'anonymous',
        timestamp: new Date().toISOString()
    };
    
    if (statusCode >= 400) {
        logger.warn('API Request Failed', logData);
    } else {
        logger.http('API Request', logData);
    }
};

logger.dbOperation = (operation, collection, data, duration) => {
    logger.debug('Database Operation', {
        operation,
        collection,
        data: typeof data === 'object' ? JSON.stringify(data) : data,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
    });
};

logger.authEvent = (event, userId, details) => {
    logger.info('Authentication Event', {
        event,
        userId,
        details,
        timestamp: new Date().toISOString()
    });
};

logger.businessLogic = (action, data, userId) => {
    logger.info('Business Logic', {
        action,
        data: typeof data === 'object' ? JSON.stringify(data) : data,
        userId,
        timestamp: new Date().toISOString()
    });
};

module.exports = logger;
