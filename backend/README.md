# 🔧 ECommerce Backend API

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Express](https://img.shields.io/badge/Express.js-5+-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)

A robust RESTful API backend for the ECommerce application built with Node.js, Express.js, and MongoDB.

</div>

## 🌟 Overview

This backend provides a complete set of RESTful APIs for managing an e-commerce application. It features secure authentication, product management, shopping cart functionality, order processing, and comprehensive logging.

## ✨ Features

### 🔐 Authentication & Security
- **JWT-based authentication** with refresh tokens
- **Password hashing** using bcrypt
- **Role-based access control** (User, Admin)
- **Protected routes** middleware
- **CORS configuration** for cross-origin requests
- **Rate limiting** to prevent abuse
- **Input validation** and sanitization

### 🛍️ Product Management
- **CRUD operations** for products
- **Advanced filtering** (price range, category, brand, rating)
- **Search functionality** with text indexing
- **Category management** with hierarchical structure
- **Image upload** support with Cloudinary integration
- **Inventory tracking** and stock management
- **Product reviews** and rating system

### 🛒 Shopping Cart & Orders
- **Persistent cart** management
- **Cart synchronization** across devices
- **Order processing** workflow
- **Order history** and tracking
- **Payment integration** ready
- **Invoice generation** support

### 📊 Admin Features
- **User management** (view, update, delete)
- **Product management** dashboard
- **Order management** and status updates
- **Analytics** and reporting endpoints
- **Inventory alerts** and notifications

### 🔧 Technical Features
- **Comprehensive logging** with Winston
- **Error handling** middleware
- **Database connection** pooling
- **Environment configuration** management
- **API documentation** with detailed examples
- **Request/Response logging** with Morgan

## 🏗️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | Runtime Environment |
| **Express.js** | 5.1+ | Web Framework |
| **MongoDB** | Atlas | Database |
| **Mongoose** | 8+ | ODM |
| **JWT** | 9+ | Authentication |
| **bcryptjs** | 3+ | Password Hashing |
| **Winston** | 3+ | Logging |
| **Morgan** | 1+ | HTTP Request Logging |
| **Express-Validator** | 7+ | Input Validation |
| **CORS** | 2+ | Cross-Origin Resource Sharing |
| **Dotenv** | 17+ | Environment Variables |
| **Nodemailer** | 7+ | Email Service |

## 📂 Project Structure

```
backend/
├── 📁 config/                 # Configuration files
│   ├── database.js             # MongoDB connection setup
│   └── logger.js               # Winston logger configuration
├── 📁 controllers/             # Business logic controllers
│   ├── authController.js       # Authentication & authorization
│   ├── productController.js    # Product CRUD operations
│   ├── cartController.js       # Shopping cart management
│   ├── orderController.js      # Order processing
│   ├── userController.js       # User management
│   ├── categoryController.js   # Category management
│   ├── addressController.js    # Address management
│   ├── wishlistController.js   # Wishlist functionality
│   └── checkoutController.js   # Checkout process
├── 📁 middleware/              # Custom middleware
│   ├── auth.js                 # JWT verification & authorization
│   ├── errorHandler.js         # Global error handling
│   ├── validation.js           # Input validation rules
│   ├── requestLogger.js        # HTTP request logging
│   └── categoryValidation.js   # Category-specific validation
├── 📁 models/                  # MongoDB schemas
│   ├── User.js                 # User schema & methods
│   ├── Product.js              # Product schema with reviews
│   ├── Cart.js                 # Shopping cart schema
│   ├── Order.js                # Order schema & workflow
│   ├── Category.js             # Category hierarchy schema
│   ├── Address.js              # User address schema
│   ├── Wishlist.js             # Wishlist schema
│   └── PaymentMethod.js        # Payment method schema
├── 📁 routes/                  # API route definitions
│   ├── auth.js                 # Authentication routes
│   ├── products.js             # Product management routes
│   ├── cart.js                 # Cart management routes
│   ├── orders.js               # Order management routes
│   ├── users.js                # User management routes
│   ├── categories.js           # Category management routes
│   ├── addresses.js            # Address management routes
│   ├── paymentMethods.js       # Payment method routes
│   ├── wishlist.js             # Wishlist routes
│   └── checkout.js             # Checkout process routes
├── 📁 utils/                   # Utility functions
│   ├── helpers.js              # Common helper functions
│   └── asyncHandler.js         # Async error handling wrapper
├── 📁 logs/                    # Application logs
│   ├── combined.log            # All logs combined
│   ├── error.log               # Error logs only
│   ├── http.log                # HTTP request logs
│   ├── exceptions.log          # Uncaught exceptions
│   └── rejections.log          # Unhandled promise rejections
├── server.js                   # Express server setup & configuration
├── package.json                # Dependencies & scripts
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore patterns
├── API_DOCUMENTATION.md        # Detailed API documentation
└── README.md                   # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (Atlas account recommended)
- **npm** or **yarn** package manager

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment setup**
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables**
   ```env
   # Database Configuration
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
   JWT_EXPIRE=7d
   JWT_COOKIE_EXPIRE=7
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   
   # Email Configuration (Optional)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USERNAME=your-email@gmail.com
   EMAIL_PASSWORD=your-app-specific-password
   FROM_NAME=ECommerce Store
   FROM_EMAIL=noreply@ecommerce.com
   ```

### Running the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will be available at: `http://localhost:5000`

## 📋 API Endpoints

### 🔐 Authentication
| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | User registration | `{ name, email, password }` |
| POST | `/api/auth/login` | User login | `{ email, password }` |
| POST | `/api/auth/logout` | User logout | - |
| GET | `/api/auth/me` | Get current user | - |
| PUT | `/api/auth/profile` | Update user profile | `{ name, email, phone }` |
| POST | `/api/auth/forgot-password` | Forgot password | `{ email }` |
| POST | `/api/auth/reset-password/:token` | Reset password | `{ password }` |

### 🛍️ Products
| Method | Endpoint | Description | Query Parameters |
|--------|----------|-------------|------------------|
| GET | `/api/products` | Get all products | `page, limit, search, category, minPrice, maxPrice, sort` |
| GET | `/api/products/:id` | Get single product | - |
| POST | `/api/products` | Create product (Admin) | Product data |
| PUT | `/api/products/:id` | Update product (Admin) | Product data |
| DELETE | `/api/products/:id` | Delete product (Admin) | - |
| GET | `/api/products/featured` | Get featured products | - |
| GET | `/api/products/categories` | Get all categories | - |
| GET | `/api/products/category/:category` | Get products by category | - |

### 🛒 Shopping Cart
| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/api/cart` | Get user cart | - |
| POST | `/api/cart` | Add item to cart | `{ productId, quantity }` |
| PUT | `/api/cart/:id` | Update cart item | `{ quantity }` |
| DELETE | `/api/cart/:id` | Remove cart item | - |
| DELETE | `/api/cart` | Clear entire cart | - |

### 📦 Orders
| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/api/orders` | Get user orders | - |
| GET | `/api/orders/:id` | Get single order | - |
| POST | `/api/orders` | Create new order | Order data |
| PUT | `/api/orders/:id` | Update order status (Admin) | `{ status }` |

### 👥 Users (Admin)
| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/api/users` | Get all users | - |
| GET | `/api/users/:id` | Get single user | - |
| PUT | `/api/users/:id` | Update user | User data |
| DELETE | `/api/users/:id` | Delete user | - |

### 🏷️ Categories
| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/api/categories` | Get all categories | - |
| GET | `/api/categories/:id` | Get single category | - |
| POST | `/api/categories` | Create category (Admin) | Category data |
| PUT | `/api/categories/:id` | Update category (Admin) | Category data |
| DELETE | `/api/categories/:id` | Delete category (Admin) | - |

## 🔧 Development Scripts

```bash
# Start development server with nodemon
npm run dev

# Start production server
npm start

# Run tests (if configured)
npm test

# Check for security vulnerabilities
npm audit

# Update dependencies
npm update
```

## 🗂️ Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (user/admin),
  phone: String,
  avatar: Object,
  addresses: [AddressSchema],
  isEmailVerified: Boolean,
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  discountPrice: Number,
  category: String,
  brand: String,
  stock: Number,
  images: [ImageSchema],
  specifications: Map,
  tags: [String],
  weight: Number,
  dimensions: Object,
  seller: ObjectId (User),
  reviews: [ReviewSchema],
  rating: Number,
  numReviews: Number,
  isFeatured: Boolean,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Order Model
```javascript
{
  user: ObjectId (User),
  orderItems: [OrderItemSchema],
  shippingAddress: AddressSchema,
  paymentMethod: String,
  paymentResult: Object,
  itemsPrice: Number,
  taxPrice: Number,
  shippingPrice: Number,
  totalPrice: Number,
  isPaid: Boolean,
  paidAt: Date,
  isDelivered: Boolean,
  deliveredAt: Date,
  status: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Security Features

### Authentication
- **JWT tokens** with expiration
- **Password hashing** with bcrypt (12 rounds)
- **Protected routes** middleware
- **Role-based access** control

### Input Validation
- **Express-validator** for request validation
- **Data sanitization** to prevent XSS
- **MongoDB injection** prevention
- **File upload** security measures

### CORS Configuration
- **Allowed origins** configuration
- **Credentials** support
- **Methods and headers** restrictions

## 📊 Logging

### Log Levels
- **error**: System errors, authentication failures
- **warn**: Invalid requests, business rule violations
- **info**: Successful operations, user actions
- **http**: HTTP request/response details
- **debug**: Detailed debugging information

### Log Files
- **combined.log**: All application logs
- **error.log**: Error logs only
- **http.log**: HTTP request logs
- **exceptions.log**: Uncaught exceptions
- **rejections.log**: Unhandled promise rejections

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret-very-long-and-secure
FRONTEND_URL=https://your-frontend-domain.com
```

### Recommended Platforms
- **Railway**: Easy deployment with GitHub integration
- **Render**: Free tier available, automatic deployments
- **DigitalOcean App Platform**: Scalable with database integration
- **AWS EC2**: Full control, requires more setup
- **Google Cloud Run**: Serverless, auto-scaling

### Health Check Endpoint
```bash
GET /api/health
```
Returns server status and database connection status.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.test.js
```

## 📚 API Documentation

Detailed API documentation is available in `API_DOCUMENTATION.md` with:
- Complete endpoint descriptions
- Request/response examples
- Error codes and messages
- Authentication requirements
- Rate limiting information

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
---
## 👨‍💻 Author : Anurag Thakur


<div align="center">

**🔧 Ready for production deployment!**

</div>
