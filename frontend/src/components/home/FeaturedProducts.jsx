import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import productService from '../../services/productService';
import LoadingSpinner from '../common/LoadingSpinner';
import { useWishlist } from '../../context/WishlistContext';
import { CartContext } from '../../context/CartContext';
import toast from 'react-hot-toast';

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        // Fetch products with high rating or featured flag
        const response = await productService.getProducts({ 
          featured: true, 
          limit: 8,
          sort: 'rating'
        });
        setProducts(response.products || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

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

  const handleWishlistToggle = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(productId);
  };

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      addToCart(product, 1);
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading featured products: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 btn btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Products
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our hand-picked selection of premium products with the best ratings and reviews
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product._id} className="card group hover:shadow-card-hover transition-shadow duration-200">
              <div className="relative overflow-hidden rounded-t-lg">
                <img
                  src={product.images?.[0]?.url || '/placeholder-product.svg'}
                  alt={product.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                  onError={(e) => {
                    e.target.src = '/placeholder-product.svg';
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
                
                {/* Quick action buttons */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button 
                    onClick={(e) => handleWishlistToggle(e, product._id)}
                    className={`p-2 bg-white rounded-full shadow-md hover:bg-gray-50 mb-2 transition-colors ${
                      isInWishlist(product._id) ? 'text-red-500' : 'text-gray-600'
                    }`}
                    title={isInWishlist(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart className={`h-4 w-4 ${
                      isInWishlist(product._id) ? 'fill-current' : ''
                    }`} />
                  </button>
                </div>

                {/* Sale badge */}
                {product.salePrice && product.salePrice < product.price && (
                  <div className="absolute top-2 left-2">
                    <span className="bg-red-500 text-white px-2 py-1 text-xs font-semibold rounded-md">
                      {Math.round((1 - product.salePrice / product.price) * 100)}% OFF
                    </span>
                  </div>
                )}
              </div>

              <div className="card-content">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  <Link 
                    to={`/product/${product._id}`}
                    className="hover:text-primary-600 transition-colors"
                  >
                    {product.name}
                  </Link>
                </h3>

                <div className="flex items-center mb-2">
                  <div className="flex items-center mr-2">
                    {renderStars(product.averageRating || 0)}
                  </div>
                  <span className="text-sm text-gray-500">
                    ({product.totalReviews || 0})
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {product.salePrice && product.salePrice < product.price ? (
                      <>
                        <span className="text-lg font-bold text-red-600">
                          {formatPrice(product.salePrice)}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(product.price)}
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>
                </div>

                <button 
                  onClick={(e) => handleAddToCart(e, product)}
                  disabled={product.stock === 0}
                  className={`w-full btn flex items-center justify-center ${
                    product.stock === 0
                      ? 'btn-secondary opacity-50 cursor-not-allowed'
                      : 'btn-primary'
                  }`}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/products" className="btn btn-outline btn-lg">
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
