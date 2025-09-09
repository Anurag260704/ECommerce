import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  Trash2, 
  Eye, 
  Share2,
  ArrowRight,
  ShoppingBag
} from 'lucide-react';

import Footer from '../components/layout/Footer';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../utils/imageUtils';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const navigate = useNavigate();
  const { 
    wishlist, 
    wishlistCount, 
    loading, 
    removeFromWishlist, 
    clearWishlist,
    moveToCart,
    moveAllToCart
  } = useWishlist();
  const { addToCart } = useCart();

  const [selectedItems, setSelectedItems] = useState([]);
  const [actionLoading, setActionLoading] = useState({});

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const handleSelectItem = (productId) => {
    setSelectedItems(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSelectAll = () => {
    if (!wishlist || !wishlist.products) return;

    if (selectedItems.length === wishlist.products.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(wishlist.products.map(item => item.product._id));
    }
  };

  const handleAddToCart = async (product, e) => {
    e.stopPropagation();
    setActionLoading(prev => ({ ...prev, [product._id]: true }));

    try {
      addToCart(product, 1);
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setActionLoading(prev => ({ ...prev, [product._id]: false }));
    }
  };

  const handleRemoveFromWishlist = async (productId, e) => {
    e.stopPropagation();
    setActionLoading(prev => ({ ...prev, [productId]: true }));

    try {
      await removeFromWishlist(productId);
      setSelectedItems(prev => prev.filter(id => id !== productId));
    } finally {
      setActionLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleMoveToCart = async (productId, e) => {
    e.stopPropagation();
    setActionLoading(prev => ({ ...prev, [productId]: true }));

    try {
      await moveToCart([productId]);
      setSelectedItems(prev => prev.filter(id => id !== productId));
    } finally {
      setActionLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleMoveSelectedToCart = async () => {
    if (selectedItems.length === 0) {
      toast.error('Please select items to move to cart');
      return;
    }

    setActionLoading(prev => ({ ...prev, moveSelected: true }));

    try {
      await moveToCart(selectedItems);
      setSelectedItems([]);
    } finally {
      setActionLoading(prev => ({ ...prev, moveSelected: false }));
    }
  };

  const handleMoveAllToCart = async () => {
    setActionLoading(prev => ({ ...prev, moveAll: true }));

    try {
      await moveAllToCart();
      setSelectedItems([]);
    } finally {
      setActionLoading(prev => ({ ...prev, moveAll: false }));
    }
  };

  const handleClearWishlist = async () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      setActionLoading(prev => ({ ...prev, clear: true }));

      try {
        await clearWishlist();
        setSelectedItems([]);
      } finally {
        setActionLoading(prev => ({ ...prev, clear: false }));
      }
    }
  };

  const handleShare = async (product) => {
    const shareData = {
      title: product.name,
      text: product.description,
      url: `${window.location.origin}/product/${product._id}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Product link copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy link');
      }
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const getCurrentPrice = (product) => {
    return product.salePrice && product.salePrice < product.price 
      ? product.salePrice 
      : product.price;
  };

  const getDiscountPercentage = (product) => {
    if (product.salePrice && product.salePrice < product.price) {
      return Math.round((1 - product.salePrice / product.price) * 100);
    }
    return 0;
  };

  if (loading) {
    return (
      <>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner size="large" />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Wishlist
            </h1>
            <p className="text-gray-600">
              {wishlistCount} item{wishlistCount !== 1 ? 's' : ''} saved for later
            </p>
          </div>

          {/* Empty Wishlist */}
          {!wishlist || wishlist.products.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Your wishlist is empty
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Start adding products you love to your wishlist. You can add items from any product page.
              </p>
              <button
                onClick={() => navigate('/products')}
                className="btn btn-primary inline-flex items-center"
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                Start Shopping
              </button>
            </div>
          ) : (
            <>
              {/* Action Bar */}
              <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Selection Controls */}
                  <div className="flex items-center gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === wishlist.products.length}
                        onChange={handleSelectAll}
                        className="mr-2 rounded"
                      />
                      <span className="text-sm font-medium">
                        Select All ({wishlist.products.length})
                      </span>
                    </label>
                    
                    {selectedItems.length > 0 && (
                      <span className="text-sm text-gray-600">
                        {selectedItems.length} selected
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {selectedItems.length > 0 && (
                      <button
                        onClick={handleMoveSelectedToCart}
                        disabled={actionLoading.moveSelected}
                        className="btn btn-sm btn-primary flex items-center"
                      >
                        {actionLoading.moveSelected ? (
                          <LoadingSpinner size="small" className="mr-2" />
                        ) : (
                          <ShoppingCart className="h-4 w-4 mr-2" />
                        )}
                        Move Selected to Cart
                      </button>
                    )}
                    
                    <button
                      onClick={handleMoveAllToCart}
                      disabled={actionLoading.moveAll}
                      className="btn btn-sm btn-secondary flex items-center"
                    >
                      {actionLoading.moveAll ? (
                        <LoadingSpinner size="small" className="mr-2" />
                      ) : (
                        <ArrowRight className="h-4 w-4 mr-2" />
                      )}
                      Move All to Cart
                    </button>
                    
                    <button
                      onClick={handleClearWishlist}
                      disabled={actionLoading.clear}
                      className="btn btn-sm bg-red-50 text-red-600 border-red-200 hover:bg-red-100 flex items-center"
                    >
                      {actionLoading.clear ? (
                        <LoadingSpinner size="small" className="mr-2" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Clear Wishlist
                    </button>
                  </div>
                </div>
              </div>

              {/* Wishlist Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {wishlist.products.map((item) => {
                  const product = item.product;
                  const currentPrice = getCurrentPrice(product);
                  const discountPercentage = getDiscountPercentage(product);
                  
                  return (
                    <div
                      key={product._id}
                      className="bg-white rounded-lg shadow-sm overflow-hidden group hover:shadow-md transition-shadow duration-200"
                    >
                      {/* Selection Checkbox */}
                      <div className="p-3 pb-0">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(product._id)}
                            onChange={() => handleSelectItem(product._id)}
                            className="mr-2 rounded"
                          />
                          <span className="text-xs text-gray-500">Select</span>
                        </label>
                      </div>

                      {/* Product Image */}
                      <div 
                        className="relative overflow-hidden cursor-pointer"
                        onClick={() => handleProductClick(product._id)}
                      >
                        <img
                          src={getImageUrl(product.images?.[0])}
                          alt={product.name}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            e.target.src = '/placeholder-product.jpg';
                          }}
                        />
                        
                        {/* Discount Badge */}
                        {discountPercentage > 0 && (
                          <div className="absolute top-2 left-2">
                            <span className="bg-red-500 text-white px-2 py-1 text-xs font-semibold rounded-md">
                              {discountPercentage}% OFF
                            </span>
                          </div>
                        )}

                        {/* Stock Status */}
                        {product.stock === 0 && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <span className="bg-red-600 text-white px-3 py-1 text-sm font-semibold rounded-md">
                              Out of Stock
                            </span>
                          </div>
                        )}

                        {/* Quick Action Buttons */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 space-y-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/product/${product._id}`);
                            }}
                            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4 text-gray-600" />
                          </button>
                          
                          <button
                            onClick={(e) => handleShare(product)}
                            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                            title="Share"
                          >
                            <Share2 className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <div className="mb-2">
                          <span className="text-xs text-gray-500 uppercase tracking-wide">
                            {product.category}
                          </span>
                        </div>

                        <h3 
                          className="font-semibold text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-primary-600 transition-colors"
                          onClick={() => handleProductClick(product._id)}
                        >
                          {product.name}
                        </h3>

                        {/* Rating */}
                        <div className="flex items-center mb-3">
                          <div className="flex items-center mr-2">
                            {renderStars(product.averageRating || 0)}
                          </div>
                          <span className="text-sm text-gray-500">
                            ({product.totalReviews || 0})
                          </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-gray-900">
                              {formatPrice(currentPrice)}
                            </span>
                            {product.salePrice && product.salePrice < product.price && (
                              <span className="text-sm text-gray-500 line-through">
                                {formatPrice(product.price)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2">
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => handleAddToCart(product, e)}
                              disabled={product.stock === 0 || actionLoading[product._id]}
                              className="flex-1 btn btn-sm btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading[product._id] ? (
                                <LoadingSpinner size="small" />
                              ) : (
                                <>
                                  <ShoppingCart className="h-4 w-4 mr-1" />
                                  Add to Cart
                                </>
                              )}
                            </button>

                            <button
                              onClick={(e) => handleRemoveFromWishlist(product._id, e)}
                              disabled={actionLoading[product._id]}
                              className="p-2 btn btn-sm bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                              title="Remove from Wishlist"
                            >
                              <Heart className="h-4 w-4 fill-current" />
                            </button>
                          </div>

                          <button
                            onClick={(e) => handleMoveToCart(product._id, e)}
                            disabled={product.stock === 0 || actionLoading[product._id]}
                            className="w-full btn btn-sm btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Move to Cart
                          </button>
                        </div>

                        {/* Added Date */}
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-500">
                            Added {new Date(item.addedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Wishlist;
