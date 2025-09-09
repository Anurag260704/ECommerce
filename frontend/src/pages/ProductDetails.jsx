import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Truck, 
  Shield, 
  RotateCcw, 
  Plus, 
  Minus,
  ArrowLeft,
  Check
} from 'lucide-react';

import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import productService from '../services/productService';
import toast from 'react-hot-toast';

import Footer from '../components/layout/Footer';
import ProductImageGallery from '../components/products/ProductImageGallery';
import ProductReviews from '../components/products/ProductReviews';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    fetchProductDetails();
    fetchProductReviews();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await productService.getProduct(id);
      setProduct(response.product);
      
      // Set default selections
      if (response.product.sizes && response.product.sizes.length > 0) {
        setSelectedSize(response.product.sizes[0]);
      }
      if (response.product.colors && response.product.colors.length > 0) {
        setSelectedColor(response.product.colors[0]);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setError(error.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductReviews = async () => {
    try {
      const response = await productService.getReviews(id);
      setReviews(response.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

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

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    // Check if size/color selection is required
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }

    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.error('Please select a color');
      return;
    }

    if (product.stock === 0) {
      toast.error('Product is out of stock');
      return;
    }

    setAddingToCart(true);

    try {
      const productWithOptions = {
        ...product,
        selectedSize,
        selectedColor,
      };

      addToCart(productWithOptions, quantity);
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/checkout');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Product link copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy link');
      }
    }
  };

  const handleWishlistToggle = async () => {
    await toggleWishlist(product._id);
  };

  const discountPercentage = product && product.salePrice && product.salePrice < product.price
    ? Math.round((1 - product.salePrice / product.price) * 100)
    : 0;

  const currentPrice = product && product.salePrice && product.salePrice < product.price 
    ? product.salePrice 
    : product?.price;

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

  if (error || !product) {
    return (
      <>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-8">{error || 'The product you are looking for does not exist.'}</p>
            <button
              onClick={() => navigate('/products')}
              className="btn btn-primary"
            >
              Browse Products
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <button
              onClick={() => navigate('/products')}
              className="flex items-center hover:text-primary-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Products
            </button>
            <span>/</span>
            <span>{product.category}</span>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>

          {/* Product Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Product Images */}
            <div>
              <ProductImageGallery 
                images={product.images} 
                productName={product.name} 
              />
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500 uppercase tracking-wide">
                    {product.category}
                  </span>
                  <button
                    onClick={handleShare}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Share"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>

                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center">
                    {renderStars(product.averageRating || 0)}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.averageRating ? product.averageRating.toFixed(1) : '0.0'} 
                    ({product.totalReviews || 0} reviews)
                  </span>
                </div>

                <div className="flex items-center space-x-4 mb-6">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(currentPrice)}
                  </span>
                  {product.salePrice && product.salePrice < product.price && (
                    <>
                      <span className="text-lg text-gray-500 line-through">
                        {formatPrice(product.price)}
                      </span>
                      <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded">
                        {discountPercentage}% OFF
                      </span>
                    </>
                  )}
                </div>

                <p className="text-gray-700 mb-6">
                  {product.description}
                </p>
              </div>

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Size</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                          selectedSize === size
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-300 hover:border-gray-400 text-gray-700'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Color</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                          selectedColor === color
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-300 hover:border-gray-400 text-gray-700'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Quantity</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-2 font-medium">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.stock}
                      className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.stock} available
                  </span>
                </div>
              </div>

              {/* Stock Status */}
              <div>
                {product.stock > 0 ? (
                  <div className="flex items-center text-green-600">
                    <Check className="h-5 w-5 mr-2" />
                    <span className="font-medium">In Stock</span>
                  </div>
                ) : (
                  <div className="text-red-600 font-medium">
                    Out of Stock
                  </div>
                )}
                
                {product.stock > 0 && product.stock <= 10 && (
                  <p className="text-orange-600 text-sm mt-1">
                    Only {product.stock} left in stock - order soon!
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0 || addingToCart}
                    className="flex-1 btn btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingToCart ? (
                      <LoadingSpinner size="small" className="mr-2" />
                    ) : (
                      <ShoppingCart className="h-5 w-5 mr-2" />
                    )}
                    Add to Cart
                  </button>
                  
                  <button
                    onClick={handleWishlistToggle}
                    className={`p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${
                      isInWishlist(product._id) 
                        ? 'text-red-500 border-red-300 bg-red-50' 
                        : 'text-gray-600'
                    }`}
                    title={isInWishlist(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart className={`h-5 w-5 ${
                      isInWishlist(product._id) ? 'fill-current' : ''
                    }`} />
                  </button>
                </div>

                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="w-full btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
              </div>

              {/* Features */}
              <div className="border-t pt-6 space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Truck className="h-5 w-5 mr-3 text-green-600" />
                  <span>Free shipping on orders over $50</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <RotateCcw className="h-5 w-5 mr-3 text-blue-600" />
                  <span>30-day return policy</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Shield className="h-5 w-5 mr-3 text-purple-600" />
                  <span>1-year warranty included</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="bg-white rounded-lg shadow-sm">
            {/* Tab Headers */}
            <div className="border-b">
              <div className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'details'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Product Details
                </button>
                <button
                  onClick={() => setActiveTab('specifications')}
                  className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'specifications'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Specifications
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'reviews'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Reviews ({product.totalReviews || 0})
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'details' && (
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {product.fullDescription || product.description}
                  </p>
                  
                  {product.features && product.features.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Features</h3>
                      <ul className="space-y-2">
                        {product.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'specifications' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Product Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {product.specifications ? (
                      Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                          <span className="font-medium text-gray-600 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span className="text-gray-900">{value}</span>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="font-medium text-gray-600">Category</span>
                          <span className="text-gray-900">{product.category}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="font-medium text-gray-600">Brand</span>
                          <span className="text-gray-900">{product.brand || 'N/A'}</span>
                        </div>
                        {product.weight && (
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="font-medium text-gray-600">Weight</span>
                            <span className="text-gray-900">{product.weight}</span>
                          </div>
                        )}
                        {product.dimensions && (
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="font-medium text-gray-600">Dimensions</span>
                            <span className="text-gray-900">{product.dimensions}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <ProductReviews
                  productId={product._id}
                  reviews={reviews}
                  averageRating={product.averageRating}
                  totalReviews={product.totalReviews}
                  onReviewAdded={fetchProductReviews}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ProductDetails;
