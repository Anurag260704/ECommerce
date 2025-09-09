const morgan = require('morgan');
const logger = require('../config/logger');

// Create a custom token for user ID
morgan.token('user-id', (req) => {
    return req.user?.id || 'anonymous';
});

// Create a custom token for response time in ms
morgan.token('response-time-ms', (req, res) => {
    const responseTime = res.getHeader('X-Response-Time');
    return responseTime ? `${responseTime}ms` : '-';
});

// Custom format for detailed logging
const detailedFormat = ':method :url :status :response-time-ms - :user-agent - User: :user-id - IP: :remote-addr';

// Custom format for production (less verbose)
const productionFormat = ':method :url :status :response-time-ms - User: :user-id';

// Create a stream object that writes to Winston
const stream = {
    write: (message) => {
        // Remove trailing newline
        message = message.trim();
        
        // Parse the log message to extract status code
        const statusMatch = message.match(/\s(\d{3})\s/);
        const status = statusMatch ? parseInt(statusMatch[1]) : 500;
        
        if (status >= 400) {
            logger.warn(message);
        } else {
            logger.http(message);
        }
    }
};

// Response time middleware to calculate exact response time
const responseTimeMiddleware = (req, res, next) => {
    const start = Date.now();
    
    // Set the response time header before the response finishes
    const originalSend = res.send;
    const originalJson = res.json;
    const originalEnd = res.end;
    
    const calculateAndLogResponseTime = () => {
        const duration = Date.now() - start;
        // Only set header if headers haven't been sent yet
        if (!res.headersSent) {
            res.setHeader('X-Response-Time', duration);
        }
        // Log API request using our custom logger method
        logger.apiRequest(req, res.statusCode, duration);
    };
    
    // Override response methods to calculate time before headers are sent
    res.send = function(body) {
        calculateAndLogResponseTime();
        return originalSend.call(this, body);
    };
    
    res.json = function(obj) {
        calculateAndLogResponseTime();
        return originalJson.call(this, obj);
    };
    
    res.end = function(chunk, encoding) {
        calculateAndLogResponseTime();
        return originalEnd.call(this, chunk, encoding);
    };
    
    next();
};

// Configure Morgan based on environment
const getRequestLogger = () => {
    const format = process.env.NODE_ENV === 'production' ? productionFormat : detailedFormat;
    
    return morgan(format, {
        stream,
        skip: (req, res) => {
            // Skip health check and favicon requests in production
            if (process.env.NODE_ENV === 'production') {
                return req.url === '/api/health' || req.url === '/favicon.ico';
            }
            return false;
        }
    });
};

// Middleware to log request details
const logRequestDetails = (req, res, next) => {
    // Only log detailed request info for important endpoints or errors
    const importantEndpoints = ['/api/auth', '/api/checkout', '/api/orders'];
    const isImportant = importantEndpoints.some(endpoint => req.url.startsWith(endpoint));
    
    if (isImportant || process.env.NODE_ENV !== 'production') {
        logger.debug('Incoming Request Details', {
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            userId: req.user?.id || 'anonymous',
            body: req.method !== 'GET' ? req.body : undefined,
            query: Object.keys(req.query).length > 0 ? req.query : undefined,
            params: Object.keys(req.params).length > 0 ? req.params : undefined,
            headers: {
                authorization: req.get('Authorization') ? '[PRESENT]' : '[NOT_PRESENT]',
                contentType: req.get('Content-Type'),
                contentLength: req.get('Content-Length')
            },
            timestamp: new Date().toISOString()
        });
    }
    
    next();
};

module.exports = {
    requestLogger: getRequestLogger(),
    responseTimeMiddleware,
    logRequestDetails
};
