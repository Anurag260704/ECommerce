import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const Cart = () => {
  const { items: cartItems, updateCartItem, removeFromCart, clearCart, totalPrice, isLoading } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const getCartTotal = () => {
    if (!cartItems || cartItems.length === 0) return 0;
    return cartItems.reduce((total, item) => {
      const price = item.product.salePrice || item.product.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }
    
    try {
      await updateCartItem(productId, newQuantity);
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await removeFromCart(productId);
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
    } catch (error) {
      toast.error('Failed to clear cart');
    }
  };

  const handleCheckout = () => {
    if (!user) {
      toast.error('Please log in to checkout');
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    
    if (!cartItems || cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    navigate('/checkout');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/products"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Link>
            
            <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
            
            <div className="w-32"></div> {/* Spacer for alignment */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!cartItems || cartItems.length === 0 ? (
          // Empty Cart
          <div className="text-center py-16">
            <ShoppingBag className="mx-auto h-24 w-24 text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Add some products to your cart to get started</p>
            <Link
              to="/products"
              className="btn btn-primary btn-lg"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          // Cart with Items
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900">
                      Cart Items ({cartItems?.length || 0})
                    </h2>
                    {cartItems && cartItems.length > 0 && (
                      <button
                        onClick={handleClearCart}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {cartItems?.map((item) => (
                    <div key={item.product._id} className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={item.product.images?.[0]?.url || '/placeholder-product.svg'}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded-md"
                            onError={(e) => {
                              e.target.src = '/placeholder-product.svg';
                            }}
                          />
                        </div>
                        
                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/product/${item.product._id}`}
                            className="text-sm font-medium text-gray-900 hover:text-primary-600"
                          >
                            {item.product.name}
                          </Link>
                          
                          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                            {item.product.description}
                          </p>
                          
                          <div className="mt-2 flex items-center space-x-4">
                            <span className="text-sm text-gray-500">
                              Category: {item.product.category}
                            </span>
                            
                            {item.product.stock <= 10 && item.product.stock > 0 && (
                              <span className="text-sm text-red-600">
                                Only {item.product.stock} left!
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Price & Quantity Controls */}
                        <div className="flex flex-col items-end space-y-2">
                          <div className="text-right">
                            <div className="text-lg font-medium text-gray-900">
                              {formatPrice((item.product.salePrice || item.product.price) * item.quantity)}
                            </div>
                            {item.product.salePrice && item.product.salePrice < item.product.price && (
                              <div className="text-sm text-gray-500 line-through">
                                {formatPrice(item.product.price * item.quantity)}
                              </div>
                            )}
                            <div className="text-sm text-gray-500">
                              {formatPrice(item.product.salePrice || item.product.price)} each
                            </div>
                          </div>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <button
                              onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            
                            <span className="px-3 py-1 text-sm font-medium text-gray-900">
                              {item.quantity}
                            </span>
                            
                            <button
                              onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                              disabled={item.quantity >= item.product.stock}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          
                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemoveItem(item.product._id)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Out of stock warning */}
                      {item.product.stock === 0 && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-sm text-red-700">
                            This item is currently out of stock. Please remove it from your cart or check back later.
                          </p>
                        </div>
                      )}
                      
                      {/* Quantity exceeds stock warning */}
                      {item.quantity > item.product.stock && item.product.stock > 0 && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <p className="text-sm text-yellow-700">
                            Only {item.product.stock} items available. Quantity will be adjusted at checkout.
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-4 mt-8 lg:mt-0">
              <div className="bg-white rounded-lg shadow-sm border sticky top-4">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
                </div>
                
                <div className="px-6 py-4 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({cartItems?.length || 0} items)</span>
                    <span className="font-medium">{formatPrice(getCartTotal())}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {getCartTotal() >= 50 ? 'Free' : formatPrice(5.99)}
                    </span>
                  </div>
                  
                  {getCartTotal() < 50 && (
                    <div className="text-sm text-gray-500">
                      Add {formatPrice(50 - getCartTotal())} more for free shipping
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (estimated)</span>
                    <span className="font-medium">{formatPrice(getCartTotal() * 0.08)}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-lg font-medium">
                      <span>Total</span>
                      <span>{formatPrice(getCartTotal() + (getCartTotal() >= 50 ? 0 : 5.99) + (getCartTotal() * 0.08))}</span>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4 border-t border-gray-200">
                  <button
                    onClick={handleCheckout}
                    disabled={!cartItems || cartItems.length === 0 || cartItems.some(item => item.product.stock === 0)}
                    className="w-full btn btn-primary btn-lg"
                  >
                    Proceed to Checkout
                  </button>
                  
                  <Link
                    to="/products"
                    className="block w-full text-center btn btn-outline btn-lg mt-3"
                  >
                    Continue Shopping
                  </Link>
                </div>
                
                {/* Security Features */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span>Secure checkout with SSL encryption</span>
                  </div>
                  
                  <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>30-day money-back guarantee</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
