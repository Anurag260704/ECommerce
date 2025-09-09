import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  Star,
  Filter,
  Search,
  ArrowRight,
  Package,
  Grid,
  List
} from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { getImageUrl } from '../../utils/imageUtils';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const WishlistTab = () => {
  const { 
    wishlist, 
    loading, 
    removeFromWishlist, 
    clearWishlist, 
    moveToCart, 
    moveAllToCart 
  } = useWishlist();
  
  const { addToCart } = useCart();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('dateAdded');
  const [filterBy, setFilterBy] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedItems, setSelectedItems] = useState(new Set());

  // Filter and sort wishlist items
  const getFilteredAndSortedItems = () => {
    if (!wishlist?.products) return [];

    let filteredItems = wishlist.products;

    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filteredItems = filteredItems.filter(item =>
        item.product?.name?.toLowerCase().includes(search) ||
        item.product?.category?.toLowerCase().includes(search) ||
        item.product?.description?.toLowerCase().includes(search)
      );
    }

    // Category filter
    if (filterBy !== 'all') {
      filteredItems = filteredItems.filter(item =>
        item.product?.category?.toLowerCase() === filterBy.toLowerCase()
      );
    }

    // Sort items
    filteredItems.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.product?.name || '').localeCompare(b.product?.name || '');
        case 'price-low':
          return (a.product?.price || 0) - (b.product?.price || 0);
        case 'price-high':
          return (b.product?.price || 0) - (a.product?.price || 0);
        case 'rating':
          return (b.product?.averageRating || 0) - (a.product?.averageRating || 0);
        case 'dateAdded':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return filteredItems;
  };

  const filteredItems = getFilteredAndSortedItems();

  // Get unique categories for filter
  const getCategories = () => {
    if (!wishlist?.products) return [];
    const categories = [...new Set(wishlist.products.map(item => item.product?.category))];
    return categories.filter(Boolean);
  };

  const categories = getCategories();

  const handleSelectItem = (itemId, isSelected) => {
    const newSelection = new Set(selectedItems);
    if (isSelected) {
      newSelection.add(itemId);
    } else {
      newSelection.delete(itemId);
    }
    setSelectedItems(newSelection);
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedItems(new Set(filteredItems.map(item => item._id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleRemoveItem = async (productId) => {
    const success = await removeFromWishlist(productId);
    if (success) {
      // Remove from selected items if it was selected
      const newSelection = new Set(selectedItems);
      const item = filteredItems.find(i => i.product._id === productId);
      if (item) {
        newSelection.delete(item._id);
        setSelectedItems(newSelection);
      }
    }
  };

  const handleAddToCart = async (product) => {
    const success = await addToCart(product._id, 1);
    if (success) {
      toast.success(`${product.name} added to cart!`);
    }
  };

  const handleMoveToCart = async (productId) => {
    const success = await moveToCart([productId]);
    if (success) {
      // Remove from selected items
      const newSelection = new Set(selectedItems);
      const item = filteredItems.find(i => i.product._id === productId);
      if (item) {
        newSelection.delete(item._id);
        setSelectedItems(newSelection);
      }
    }
  };

  const handleMoveSelectedToCart = async () => {
    if (selectedItems.size === 0) {
      toast.error('Please select items to move to cart');
      return;
    }

    const productIds = Array.from(selectedItems)
      .map(itemId => {
        const item = filteredItems.find(i => i._id === itemId);
        return item?.product?._id;
      })
      .filter(Boolean);

    if (productIds.length > 0) {
      const success = await moveToCart(productIds);
      if (success) {
        setSelectedItems(new Set());
      }
    }
  };

  const handleRemoveSelectedItems = async () => {
    if (selectedItems.size === 0) {
      toast.error('Please select items to remove');
      return;
    }

    if (!window.confirm(`Remove ${selectedItems.size} item(s) from wishlist?`)) {
      return;
    }

    const promises = Array.from(selectedItems)
      .map(itemId => {
        const item = filteredItems.find(i => i._id === itemId);
        return item?.product?._id ? removeFromWishlist(item.product._id) : null;
      })
      .filter(Boolean);

    try {
      await Promise.all(promises);
      setSelectedItems(new Set());
      toast.success('Selected items removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove some items');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner message="Loading your wishlist..." />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">My Wishlist</h2>
          <p className="text-gray-600">
            {wishlist?.products?.length > 0 
              ? `${wishlist.products.length} item${wishlist.products.length !== 1 ? 's' : ''} saved`
              : 'No items in your wishlist'
            }
          </p>
        </div>
        
        {wishlist?.products?.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={moveAllToCart}
              className="btn btn-primary"
            >
              <ShoppingCart className="h-4 w-4" />
              Move All to Cart
            </button>
            <button
              onClick={() => window.confirm('Clear entire wishlist?') && clearWishlist()}
              className="btn btn-outline-error"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </button>
          </div>
        )}
      </div>

      {wishlist?.products?.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
          <p className="text-gray-600 mb-6">Start adding products you love to see them here!</p>
          <Link to="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      ) : (
        <>
          {/* Filters and Controls */}
          <div className="mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search wishlist..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <Filter className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="input pl-10 appearance-none"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input appearance-none"
              >
                <option value="dateAdded">Recently Added</option>
                <option value="name">Name A-Z</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>

              {/* View Mode */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Bulk Actions */}
            {filteredItems.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Select All ({selectedItems.size} selected)
                    </span>
                  </label>
                </div>
                
                {selectedItems.size > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleMoveSelectedToCart}
                      className="btn btn-sm btn-primary"
                    >
                      <ShoppingCart className="h-3 w-3" />
                      Move to Cart ({selectedItems.size})
                    </button>
                    <button
                      onClick={handleRemoveSelectedItems}
                      className="btn btn-sm btn-outline-error"
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove ({selectedItems.size})
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Items List/Grid */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No items match your filters</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
              {filteredItems.map((item) => (
                <div
                  key={item._id}
                  className={`bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item._id)}
                      onChange={(e) => handleSelectItem(item._id, e.target.checked)}
                      className="absolute top-2 left-2 z-10 rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200"
                    />
                    
                    <Link to={`/products/${item.product._id}`}>
                      <img
                        src={getImageUrl(item.product.images?.[0])}
                        alt={item.product.name}
                        className={`object-cover ${
                          viewMode === 'grid' ? 'w-full h-48' : 'w-32 h-32'
                        }`}
                        onError={(e) => {
                          e.target.src = '/placeholder-product.jpg';
                        }}
                      />
                    </Link>
                  </div>

                  <div className={`p-4 ${viewMode === 'list' ? 'flex-1 flex justify-between items-center' : ''}`}>
                    <div className={viewMode === 'list' ? 'flex-1' : ''}>
                      <Link to={`/products/${item.product._id}`}>
                        <h3 className="font-medium text-gray-900 hover:text-primary-600 line-clamp-2 mb-2">
                          {item.product.name}
                        </h3>
                      </Link>
                      
                      {item.product.averageRating > 0 && (
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="h-4 w-4 fill-current text-yellow-400" />
                          <span className="text-sm text-gray-600">
                            {item.product.averageRating.toFixed(1)} ({item.product.reviewCount || 0})
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-bold text-gray-900">
                          {formatPrice(item.product.price)}
                        </span>
                        {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(item.product.originalPrice)}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-500 mb-3">
                        Added on {formatDate(item.createdAt)}
                      </p>
                    </div>

                    <div className={`flex gap-2 ${viewMode === 'list' ? 'ml-4' : 'flex-col'}`}>
                      <button
                        onClick={() => handleAddToCart(item.product)}
                        className="btn btn-sm btn-primary"
                        disabled={!item.product.inStock}
                      >
                        <ShoppingCart className="h-3 w-3" />
                        {viewMode === 'grid' && 'Add to Cart'}
                      </button>
                      <button
                        onClick={() => handleMoveToCart(item.product._id)}
                        className="btn btn-sm btn-outline-secondary"
                        disabled={!item.product.inStock}
                      >
                        <ArrowRight className="h-3 w-3" />
                        {viewMode === 'grid' && 'Move'}
                      </button>
                      <button
                        onClick={() => handleRemoveItem(item.product._id)}
                        className="btn btn-sm btn-outline-error"
                      >
                        <Trash2 className="h-3 w-3" />
                        {viewMode === 'grid' && 'Remove'}
                      </button>
                    </div>

                    {!item.product.inStock && (
                      <div className="mt-2">
                        <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WishlistTab;
