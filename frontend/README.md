# 🎨 ECommerce Frontend

<div align="center">

![React](https://img.shields.io/badge/React-18+-blue)
![Vite](https://img.shields.io/badge/Vite-5+-green)
![Material-UI](https://img.shields.io/badge/UI-Material--UI-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)

A modern, responsive React frontend for the ECommerce application built with Vite, Material-UI, and Context API.

</div>

## 🌟 Overview

This frontend provides a comprehensive user interface for the e-commerce application. Built with modern React practices, it offers a seamless shopping experience with responsive design, intuitive navigation, and rich user interactions.

## ✨ Features

### 🔐 Authentication & User Management
- **User registration** with form validation
- **Secure login/logout** functionality
- **Profile management** with address book
- **Password reset** capability
- **Session persistence** across browser tabs
- **Role-based UI** (Customer/Admin views)

### 🛍️ Product Browsing
- **Product catalog** with grid/list view toggle
- **Advanced filtering** by category, price, brand, rating
- **Real-time search** with autocomplete
- **Product details** page with image gallery
- **Product reviews** and ratings display
- **Wishlist** functionality
- **Recently viewed** products tracking

### 🛒 Shopping Experience
- **Shopping cart** with persistent storage
- **Cart drawer** for quick access
- **Quantity management** with stock validation
- **Price calculations** with taxes and shipping
- **Checkout process** with multiple steps
- **Order confirmation** and tracking
- **Order history** with detailed views

### 🎨 User Interface
- **Material-UI** design system
- **Responsive design** (mobile-first approach)
- **Dark/Light theme** toggle
- **Loading states** and skeleton screens
- **Error boundaries** for graceful error handling
- **Toast notifications** for user feedback
- **Smooth animations** and transitions
- **Accessibility** compliance (WCAG 2.1)

### 📱 Mobile-First Design
- **Touch-friendly** interface
- **Swipe gestures** for product gallery
- **Responsive navigation** with mobile drawer
- **Optimized images** for different screen sizes
- **PWA ready** (Progressive Web App)

## 🏗️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18+ | UI Library |
| **Vite** | 5+ | Build Tool & Dev Server |
| **Material-UI (MUI)** | 5+ | Component Library |
| **React Router** | 6+ | Client-side Routing |
| **Axios** | 1+ | HTTP Client |
| **Context API** | Built-in | State Management |
| **Emotion** | 11+ | CSS-in-JS Styling |
| **React Hook Form** | 7+ | Form Management |
| **Yup** | 1+ | Form Validation |

## 📂 Project Structure

```
frontend/
├── 📁 public/                    # Static assets
│   ├── index.html                # HTML template
│   ├── favicon.ico               # App icon
│   ├── logo192.png               # PWA icons
│   └── manifest.json             # PWA manifest
├── 📁 src/                       # Source code
│   ├── 📁 components/            # Reusable components
│   │   ├── 📁 common/            # Common UI components
│   │   │   ├── Header.jsx        # Navigation header
│   │   │   ├── Footer.jsx        # Page footer
│   │   │   ├── LoadingSpinner.jsx # Loading component
│   │   │   ├── ErrorBoundary.jsx # Error handling
│   │   │   ├── ProtectedRoute.jsx # Route protection
│   │   │   └── NotificationToast.jsx # Toast notifications
│   │   ├── 📁 auth/              # Authentication components
│   │   │   ├── LoginForm.jsx     # Login component
│   │   │   ├── RegisterForm.jsx  # Registration component
│   │   │   └── ForgotPassword.jsx # Password reset
│   │   ├── 📁 product/           # Product-related components
│   │   │   ├── ProductCard.jsx   # Product card display
│   │   │   ├── ProductGrid.jsx   # Product grid layout
│   │   │   ├── ProductList.jsx   # Product list layout
│   │   │   ├── ProductFilters.jsx # Filter sidebar
│   │   │   ├── SearchBar.jsx     # Search component
│   │   │   ├── ProductDetail.jsx # Product details view
│   │   │   ├── ProductGallery.jsx # Image gallery
│   │   │   └── ProductReviews.jsx # Reviews section
│   │   ├── 📁 cart/              # Shopping cart components
│   │   │   ├── CartDrawer.jsx    # Side cart drawer
│   │   │   ├── CartItem.jsx      # Cart item component
│   │   │   ├── CartSummary.jsx   # Cart totals
│   │   │   └── MiniCart.jsx      # Header cart icon
│   │   ├── 📁 checkout/          # Checkout components
│   │   │   ├── CheckoutStepper.jsx # Multi-step checkout
│   │   │   ├── ShippingForm.jsx  # Shipping address
│   │   │   ├── PaymentForm.jsx   # Payment details
│   │   │   └── OrderSummary.jsx  # Order review
│   │   └── 📁 profile/           # User profile components
│   │       ├── ProfileTabs.jsx   # Profile navigation
│   │       ├── PersonalInfo.jsx  # Personal information
│   │       ├── AddressBook.jsx   # Address management
│   │       ├── OrderHistory.jsx  # Order history
│   │       ├── PaymentMethods.jsx # Saved payment methods
│   │       └── WishlistTab.jsx   # Wishlist management
│   ├── 📁 pages/                 # Page components
│   │   ├── HomePage.jsx          # Landing page
│   │   ├── LoginPage.jsx         # Login page
│   │   ├── RegisterPage.jsx      # Registration page
│   │   ├── ProductsPage.jsx      # Product catalog
│   │   ├── ProductDetailPage.jsx # Single product page
│   │   ├── CartPage.jsx          # Shopping cart page
│   │   ├── CheckoutPage.jsx      # Checkout process
│   │   ├── ProfilePage.jsx       # User profile
│   │   ├── OrdersPage.jsx        # Order history
│   │   ├── WishlistPage.jsx      # Wishlist page
│   │   ├── AboutPage.jsx         # About us
│   │   ├── ContactPage.jsx       # Contact form
│   │   └── NotFoundPage.jsx      # 404 error page
│   ├── 📁 context/               # React Context providers
│   │   ├── AuthContext.jsx       # Authentication state
│   │   ├── CartContext.jsx       # Shopping cart state
│   │   ├── ThemeContext.jsx      # Theme management
│   │   └── NotificationContext.jsx # Toast notifications
│   ├── 📁 hooks/                 # Custom React hooks
│   │   ├── useAuth.js            # Authentication hook
│   │   ├── useCart.js            # Cart management hook
│   │   ├── useProducts.js        # Products data hook
│   │   ├── useLocalStorage.js    # Local storage hook
│   │   ├── useDebounce.js        # Debounce hook for search
│   │   ├── useAsync.js           # Async operations hook
│   │   └── useInfiniteScroll.js  # Infinite scroll hook
│   ├── 📁 services/              # API service functions
│   │   ├── api.js                # Axios configuration
│   │   ├── authService.js        # Authentication API
│   │   ├── productService.js     # Products API
│   │   ├── cartService.js        # Shopping cart API
│   │   ├── orderService.js       # Orders API
│   │   ├── userService.js        # User management API
│   │   ├── addressService.js     # Address management API
│   │   └── checkoutService.js    # Checkout API
│   ├── 📁 utils/                 # Utility functions
│   │   ├── constants.js          # App constants
│   │   ├── helpers.js            # Helper functions
│   │   ├── validation.js         # Form validation schemas
│   │   ├── formatters.js         # Data formatters
│   │   ├── storage.js            # Local storage utilities
│   │   └── theme.js              # Material-UI theme config
│   ├── 📁 styles/                # Global styles
│   │   ├── index.css             # Global CSS
│   │   ├── variables.css         # CSS variables
│   │   └── animations.css        # Animation classes
│   ├── App.jsx                   # Main App component
│   ├── main.jsx                  # React entry point
│   └── setupTests.js             # Test configuration
├── package.json                  # Dependencies & scripts
├── vite.config.js                # Vite configuration
├── eslint.config.js              # ESLint configuration
├── .env.example                  # Environment variables template
├── .gitignore                    # Git ignore patterns
└── README.md                     # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
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
   # API Configuration
   VITE_API_URL=http://localhost:5000/api
   VITE_APP_NAME=ECommerce Store
   
   # Feature Flags
   VITE_ENABLE_PWA=true
   VITE_ENABLE_ANALYTICS=false
   
   # External Services (Optional)
   VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key
   VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
   ```

### Running the Application

**Development mode:**
```bash
npm run dev
```

**Build for production:**
```bash
npm run build
```

**Preview production build:**
```bash
npm run preview
```

**Run linter:**
```bash
npm run lint
```

The application will be available at: `http://localhost:5173`

## 🎨 Component Architecture

### Higher-Order Components (HOCs)
- **withAuth**: Authentication wrapper
- **withLoading**: Loading state wrapper
- **withErrorBoundary**: Error handling wrapper

### Custom Hooks
- **useAuth**: Manages authentication state
- **useCart**: Shopping cart operations
- **useProducts**: Product data management
- **useLocalStorage**: Persistent storage
- **useDebounce**: Search optimization
- **useAsync**: Async operation states

### Context Providers
- **AuthContext**: User authentication state
- **CartContext**: Shopping cart state
- **ThemeContext**: UI theme management
- **NotificationContext**: Toast notifications

## 🛍️ Key Features Implementation

### Product Catalog
```javascript
// Advanced filtering and search
const ProductsPage = () => {
  const [filters, setFilters] = useState({
    category: '',
    priceRange: [0, 1000],
    rating: 0,
    brand: '',
    sortBy: 'name'
  });
  
  const { products, loading, error } = useProducts(filters);
  // ...
};
```

### Shopping Cart
```javascript
// Persistent cart with context
const CartContext = () => {
  const [cart, setCart] = useLocalStorage('cart', []);
  
  const addToCart = (product, quantity) => {
    // Add item logic with validation
  };
  
  const updateQuantity = (itemId, quantity) => {
    // Update quantity logic
  };
  // ...
};
```

### Authentication Flow
```javascript
// Protected routes with authentication
const ProtectedRoute = ({ children, requiredRole = 'user' }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  
  if (!user || (requiredRole && user.role !== requiredRole)) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};
```

## 🎯 Performance Optimizations

### Code Splitting
- **Route-based splitting** with React.lazy()
- **Component-based splitting** for heavy components
- **Dynamic imports** for optional features

### Image Optimization
- **Lazy loading** for product images
- **Responsive images** with srcset
- **Image compression** and WebP support
- **Placeholder skeletons** during loading

### Caching Strategy
- **API response caching** with React Query (optional)
- **Local storage** for cart and preferences
- **Service worker** for offline capability (PWA)

### Bundle Optimization
- **Tree shaking** for unused code elimination
- **Code minification** in production
- **Gzip compression** support
- **Asset optimization** with Vite

## 🔧 Development Tools

### Vite Configuration
```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
```

### ESLint Configuration
- **React hooks** rules
- **Accessibility** rules (jsx-a11y)
- **Import/export** rules
- **Code formatting** with Prettier integration

## 📱 Responsive Design

### Breakpoints
```javascript
// Material-UI breakpoints
const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,      // Mobile
      sm: 600,    // Tablet
      md: 900,    // Desktop
      lg: 1200,   // Large desktop
      xl: 1536,   // Extra large
    },
  },
});
```

### Mobile-First Approach
- **Touch-friendly** buttons and controls
- **Swipe gestures** for image galleries
- **Responsive navigation** with drawer
- **Optimized forms** for mobile input

## 🎨 Theming & Styling

### Material-UI Theme
```javascript
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});
```

### CSS-in-JS with Emotion
- **Styled components** for custom styling
- **Theme integration** with Material-UI
- **Dynamic styling** based on props
- **Performance optimized** with emotion

## 🧪 Testing

### Test Setup
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Testing Strategy
- **Unit tests** for utilities and hooks
- **Component tests** with React Testing Library
- **Integration tests** for user flows
- **E2E tests** with Cypress (optional)

## 🚀 Deployment

### Build Process
```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Environment Variables for Production
```env
VITE_API_URL=https://your-api-domain.com/api
VITE_APP_NAME=Your Store Name
NODE_ENV=production
```

### Deployment Platforms

**Static Site Hosting:**
- **Vercel**: Automatic deployments from Git
- **Netlify**: Built-in form handling and functions
- **Firebase Hosting**: Google Cloud integration
- **GitHub Pages**: Free hosting for public repos

**CDN Deployment:**
- **AWS CloudFront**: Global CDN with S3
- **Cloudflare Pages**: Edge deployment
- **Azure Static Web Apps**: Microsoft cloud platform

### Performance Optimization for Production
- **Asset optimization** (images, fonts, icons)
- **Bundle splitting** for better caching
- **Service worker** for offline functionality
- **Progressive Web App** configuration

## 🔍 SEO & Meta Tags

### React Helmet for SEO
```javascript
import { Helmet } from 'react-helmet-async';

const ProductDetailPage = ({ product }) => (
  <>
    <Helmet>
      <title>{product.name} - Your Store</title>
      <meta name="description" content={product.description} />
      <meta property="og:title" content={product.name} />
      <meta property="og:image" content={product.image} />
    </Helmet>
    {/* Component content */}
  </>
);
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

### Code Style Guidelines
- Use **functional components** with hooks
- Follow **Material-UI** design patterns
- Write **comprehensive tests** for new features
- Use **TypeScript** for type safety (optional)
- Follow **accessibility** best practices

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Anurag Thakur**
- Built for Astrape.AI Internship Program

---

<div align="center">

**🎨 Crafted with ❤️ using React & Material-UI**

</div>
