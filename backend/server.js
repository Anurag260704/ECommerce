const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');
const { requestLogger, responseTimeMiddleware, logRequestDetails } = require('./middleware/requestLogger');
const logger = require('./config/logger');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Logging middleware (should be first)
app.use(responseTimeMiddleware);
app.use(requestLogger);

// Middleware - Allow all network access for development
app.use(cors({
    origin: true, // Allow all origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'X-CSRF-Token']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Log detailed request information for debugging
app.use(logRequestDetails);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/checkout', require('./routes/checkout'));
app.use('/api/addresses', require('./routes/addresses'));
app.use('/api/payment-methods', require('./routes/paymentMethods'));
app.use('/api/categories', require('./routes/categories'));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'E-Commerce API is running successfully!',
        timestamp: new Date().toISOString()
    });
});

// Welcome route
app.get('/', (req, res) => {
    res.json({
        message: '🛒 Welcome to E-Commerce API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            products: '/api/products',
            cart: '/api/cart',
            wishlist: '/api/wishlist',
            orders: '/api/orders',
            users: '/api/users',
            checkout: '/api/checkout',
            addresses: '/api/addresses',
            paymentMethods: '/api/payment-methods',
            categories: '/api/categories'
        }
    });
});

// Error handling middleware
app.use(errorHandler);

// Handle 404 routes - catch all unmatched routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    const serverInfo = {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
        database: process.env.NODE_ENV === 'production' ? 'MongoDB Atlas' : 'Local MongoDB',
        timestamp: new Date().toISOString()
    };
    
    logger.info('🚀 Server started successfully', serverInfo);
    
    // Console logs for immediate visibility
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    console.log(`🗄️ Database: ${process.env.NODE_ENV === 'production' ? 'MongoDB Atlas' : 'Local MongoDB'}`);
    console.log(`📝 Logs directory: logs/`);
});

module.exports = app;
