import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Eye } from 'lucide-react';
import { CartContext } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { getImageUrl } from '../../utils/imageUtils';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

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

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      addToCart(product, 1);
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const discountPercentage = product.salePrice && product.salePrice < product.price
    ? Math.round((1 - product.salePrice / product.price) * 100)
    : 0;

  const currentPrice = product.salePrice && product.salePrice < product.price 
    ? product.salePrice 
    : product.price;

  const handleProductClick = (e) => {
    // Allow clicks on action buttons to bubble up naturally
    if (e.target.closest('.action-button')) {
      e.preventDefault();
      return;
    }
    // Navigate to product page for other clicks
    navigate(`/product/${product._id}`);
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Navigate to product page
    navigate(`/product/${product._id}`);
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(product._id);
  };

  return (
    <div className="card group hover:shadow-card-hover transition-all duration-200 overflow-hidden">
      <div className="relative overflow-hidden cursor-pointer" onClick={handleProductClick}>
        <img
          src={getImageUrl(product.images?.[0])}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
          onError={(e) => {
            e.target.src = '/placeholder-product.jpg';
          }}
        />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
        
        {/* Quick action buttons */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 space-y-2">
          <button 
            className={`action-button p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors ${
              isInWishlist(product._id) ? 'text-red-500' : 'text-gray-600'
            }`}
            onClick={handleWishlistToggle}
            title={isInWishlist(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`h-4 w-4 ${
              isInWishlist(product._id) ? 'fill-current' : ''
            }`} />
          </button>
          
          <button
            className="action-button block p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
            onClick={handleQuickView}
          >
            <Eye className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Discount badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-2 left-2">
            <span className="bg-red-500 text-white px-2 py-1 text-xs font-semibold rounded-md">
              {discountPercentage}% OFF
            </span>
          </div>
        )}

        {/* Stock status */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-600 text-white px-3 py-1 text-sm font-semibold rounded-md">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="card-content">
        <div className="mb-2">
          <span className="text-xs text-gray-500 uppercase tracking-wide">
            {product.category}
          </span>
        </div>

        <h3 
          className="font-semibold text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-primary-600 transition-colors"
          onClick={handleProductClick}
        >
          {product.name}
        </h3>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center mr-2">
            {renderStars(product.averageRating || 0)}
          </div>
          <span className="text-sm text-gray-500">
            ({product.totalReviews || 0})
          </span>
          {product.averageRating && (
            <span className="text-sm font-medium text-gray-900 ml-1">
              {product.averageRating.toFixed(1)}
            </span>
          )}
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

        {/* Add to cart button */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`w-full btn btn-sm flex items-center justify-center ${
            product.stock === 0
              ? 'btn-secondary opacity-50 cursor-not-allowed'
              : 'btn-primary'
          }`}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>

        {/* Stock indicator */}
        {product.stock > 0 && product.stock <= 10 && (
          <p className="text-xs text-red-600 mt-2 text-center">
            Only {product.stock} left in stock!
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
