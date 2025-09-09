# 🛒 ECommerce MERN Application

<div align="center">

![MERN Stack](https://img.shields.io/badge/Stack-MERN-green)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18+-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![Material-UI](https://img.shields.io/badge/UI-Material--UI-blue)

A modern, full-stack e-commerce application built with the MERN stack, featuring advanced product management, secure authentication, and a responsive user interface.

</div>

## 🌟 Overview

This is a comprehensive e-commerce application that provides a complete online shopping experience. Built with modern technologies and best practices, it offers both customers and administrators powerful tools for managing products, orders, and user accounts.

## ✨ Key Features

### 🔐 Authentication & Security
- **JWT-based authentication** with secure token management
- **Password hashing** using bcrypt
- **Protected routes** and role-based access control
- **Session persistence** across browser sessions
- **Email verification** and password reset functionality

### 🛍️ Product Management
- **Advanced filtering** by price, category, brand, and ratings
- **Search functionality** with real-time suggestions
- **Product reviews** and rating system
- **Image gallery** with zoom functionality
- **Inventory management** with stock tracking
- **Category-based organization** with subcategories

### 🛒 Shopping Experience
- **Persistent shopping cart** across sessions
- **Real-time cart updates** and synchronization
- **Wishlist functionality** for saved items
- **Order tracking** and history
- **Multiple payment options** integration ready
- **Address management** for shipping

### 🎨 User Interface
- **Responsive design** optimized for all devices
- **Material-UI components** for consistent design
- **Loading states** and error handling
- **Toast notifications** for user feedback
- **Dark/Light theme** support
- **Accessibility compliant** design

### 📊 Admin Features
- **Dashboard** with sales analytics
- **Product management** (CRUD operations)
- **User management** and role assignment
- **Order management** and status updates
- **Inventory tracking** and alerts
- **Sales reports** and insights

## 🏗️ Tech Stack

### Backend
| Technology | Purpose | Version |
|------------|---------|----------|
| **Node.js** | Runtime Environment | 18+ |
| **Express.js** | Web Framework | 5.1+ |
| **MongoDB** | Database | Atlas |
| **Mongoose** | ODM | 8+ |
| **JWT** | Authentication | 9+ |
| **bcryptjs** | Password Hashing | 3+ |
| **Winston** | Logging | 3+ |
| **Morgan** | HTTP Logging | 1+ |
| **Nodemailer** | Email Service | 7+ |
| **Express-Validator** | Validation | 7+ |

### Frontend
| Technology | Purpose | Version |
|------------|---------|----------|
| **React** | UI Library | 18+ |
| **Vite** | Build Tool | 5+ |
| **Material-UI** | Component Library | 5+ |
| **React Router** | Routing | 6+ |
| **Axios** | HTTP Client | 1+ |
| **Context API** | State Management | Built-in |
| **Emotion** | CSS-in-JS | 11+ |

## 📂 Project Structure

```
ECommerce/
├── 📁 backend/              # Node.js Backend Server
│   ├── 📁 config/           # Configuration files
│   │   ├── database.js       # MongoDB connection
│   │   └── logger.js         # Winston logger config
│   ├── 📁 controllers/      # Business logic controllers
│   │   ├── authController.js # Authentication logic
│   │   ├── productController.js # Product management
│   │   ├── cartController.js # Shopping cart logic
│   │   ├── orderController.js # Order processing
│   │   └── userController.js # User management
│   ├── 📁 middleware/       # Custom middleware
│   │   ├── auth.js          # JWT verification
│   │   ├── errorHandler.js  # Error handling
│   │   ├── validation.js    # Input validation
│   │   └── requestLogger.js # Request logging
│   ├── 📁 models/          # MongoDB schemas
│   │   ├── User.js         # User model
│   │   ├── Product.js      # Product model
│   │   ├── Cart.js         # Cart model
│   │   ├── Order.js        # Order model
│   │   ├── Category.js     # Category model
│   │   ├── Address.js      # Address model
│   │   └── Wishlist.js     # Wishlist model
│   ├── 📁 routes/          # API route definitions
│   │   ├── auth.js         # Authentication routes
│   │   ├── products.js     # Product routes
│   │   ├── cart.js         # Cart routes
│   │   ├── orders.js       # Order routes
│   │   ├── users.js        # User routes
│   │   └── categories.js   # Category routes
│   ├── 📁 utils/           # Utility functions
│   │   ├── helpers.js      # Common helpers
│   │   └── asyncHandler.js # Async error handling
│   ├── 📁 logs/            # Application logs
│   ├── server.js           # Express server setup
│   ├── package.json        # Backend dependencies
│   └── .env.example        # Environment template
│
├── 📁 frontend/            # React Frontend Application
│   ├── 📁 public/          # Static assets
│   │   ├── index.html      # HTML template
│   │   └── favicon.ico     # App favicon
│   ├── 📁 src/             # Source code
│   │   ├── 📁 components/  # Reusable components
│   │   │   ├── 📁 common/  # Common UI components
│   │   │   ├── 📁 auth/    # Authentication components
│   │   │   ├── 📁 product/ # Product components
│   │   │   ├── 📁 cart/    # Shopping cart components
│   │   │   └── 📁 profile/ # User profile components
│   │   ├── 📁 pages/       # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ProductsPage.jsx
│   │   │   ├── ProductDetailPage.jsx
│   │   │   ├── CartPage.jsx
│   │   │   ├── CheckoutPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── OrdersPage.jsx
│   │   ├── 📁 context/     # React Context
│   │   │   ├── AuthContext.jsx
│   │   │   ├── CartContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── 📁 hooks/       # Custom React hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useCart.js
│   │   │   └── useLocalStorage.js
│   │   ├── 📁 services/    # API service functions
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── productService.js
│   │   │   └── cartService.js
│   │   ├── 📁 utils/       # Utility functions
│   │   │   ├── constants.js
│   │   │   ├── helpers.js
│   │   │   └── validation.js
│   │   ├── 📁 styles/      # Styling files
│   │   │   └── index.css
│   │   ├── App.jsx         # Main App component
│   │   └── main.jsx        # React entry point
│   ├── package.json        # Frontend dependencies
│   ├── vite.config.js      # Vite configuration
│   └── .env.example        # Environment template
│
├── .gitignore             # Git ignore patterns
└── README.md              # Project documentation
```

## 🚀 Quick Start

### Prerequisites

Make sure you have the following installed:
- **Node.js** (v18 or higher)
- **MongoDB** (Atlas account or local installation)
- **npm** or **yarn** package manager
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd ECommerce
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Copy environment template
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Configuration**
   
   **Backend (.env):**
   ```env
   # Database
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   JWT_COOKIE_EXPIRE=7
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   
   # Email Configuration (optional)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USERNAME=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   FROM_NAME=ECommerce Store
   FROM_EMAIL=noreply@ecommerce.com
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Server will run on: http://localhost:5000

2. **Start the Frontend Application**
   ```bash
   cd frontend
   npm run dev
   ```
   Application will run on: http://localhost:5173

3. **Access the Application**
   - **Frontend:** http://localhost:5173
   - **Backend API:** http://localhost:5000/api
   - **API Documentation:** See `backend/API_DOCUMENTATION.md`

## 📋 API Documentation

### Authentication Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | User registration | ❌ |
| POST | `/api/auth/login` | User login | ❌ |
| POST | `/api/auth/logout` | User logout | ✅ |
| GET | `/api/auth/me` | Get current user | ✅ |
| PUT | `/api/auth/profile` | Update profile | ✅ |

### Product Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/products` | Get all products | ❌ |
| GET | `/api/products/:id` | Get single product | ❌ |
| POST | `/api/products` | Create product | ✅ Admin |
| PUT | `/api/products/:id` | Update product | ✅ Admin |
| DELETE | `/api/products/:id` | Delete product | ✅ Admin |

### Cart Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/cart` | Get user cart | ✅ |
| POST | `/api/cart` | Add to cart | ✅ |
| PUT | `/api/cart/:id` | Update cart item | ✅ |
| DELETE | `/api/cart/:id` | Remove from cart | ✅ |

### Order Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/orders` | Get user orders | ✅ |
| POST | `/api/orders` | Create order | ✅ |
| GET | `/api/orders/:id` | Get single order | ✅ |

## 🔧 Development Scripts

### Backend Commands
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
```

### Frontend Commands
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## 🌐 Deployment

### Production Environment Variables

**Backend:**
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
FRONTEND_URL=https://your-frontend-domain.com
```

### Deployment Platforms

**Recommended platforms:**
- **Backend:** Railway, Render, DigitalOcean App Platform
- **Frontend:** Vercel, Netlify, Firebase Hosting
- **Database:** MongoDB Atlas

### Docker Support (Optional)
```dockerfile
# Dockerfile example included in each service
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

---


<div align="center">

**⭐ Star this repository if you find it helpful!**

</div>
