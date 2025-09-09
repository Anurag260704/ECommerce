import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Components
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProductList from './pages/ProductList';
import ProductDetails from './pages/ProductDetails';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Profile from './pages/user/Profile';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import OrderTracking from './pages/OrderTracking';
import Categories from './pages/Categories';

// Temporary placeholder components until we create the actual pages

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Router>
              {/* Toast Notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    theme: {
                      primary: '#4aed88',
                    },
                  },
                }}
              />

              <React.Suspense fallback={
                <div className="flex justify-center items-center h-screen">
                  <LoadingSpinner size="large" />
                </div>
              }>
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="categories" element={<Categories />} />
                    <Route path="products" element={<ProductList />} />
                    <Route path="product/:id" element={<ProductDetails />} />
                    <Route path="wishlist" element={<Wishlist />} />
                    <Route path="cart" element={<Cart />} />
                    <Route path="checkout" element={<Checkout />} />
                    <Route path="order-confirmation/:orderId" element={<OrderConfirmation />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="orders/:orderId" element={<OrderDetails />} />
                    <Route path="orders/:orderId/track" element={<OrderTracking />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="*" element={
                      <div className="text-center py-16">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
                        <Link to="/" className="btn-primary">Go Back Home</Link>
                      </div>
                    } />
                  </Route>
                </Routes>
              </React.Suspense>
            </Router>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App
