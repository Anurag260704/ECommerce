import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, Grid3X3, List, ChevronDown, ArrowLeft } from 'lucide-react';
import productService from '../services/productService';
import ProductCard from '../components/products/ProductCard';
import ProductFilters from '../components/products/ProductFilters';
import ProductSearch from '../components/products/ProductSearch';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [filters, setFilters] = useState({
    categories: searchParams.get('category') ? [searchParams.get('category')] : [],
    priceRange: searchParams.get('price') || '',
    rating: searchParams.get('rating') ? parseInt(searchParams.get('rating')) : '',
    inStock: searchParams.get('inStock') === 'true',
    onSale: searchParams.get('onSale') === 'true'
  });

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'name-asc', label: 'Name: A to Z' },
    { value: 'name-desc', label: 'Name: Z to A' }
  ];

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: 12,
        ...buildFilterParams()
      };
      
      // Add search query if present
      if (searchQuery.trim()) {
        params.q = searchQuery.trim();
      }

      const response = await productService.getProducts(params);
      
      setProducts(response.products || []);
      setTotalPages(response.totalPages || 1);
      setTotalProducts(response.totalProducts || 0);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Build filter parameters for API call
  const buildFilterParams = () => {
    const params = {};
    
    if (filters.categories.length > 0) {
      params.category = filters.categories[0]; // Backend expects single category
    }
    
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-');
      if (min) {
        params.minPrice = min === '200+' ? '200' : min;
      }
      if (max && max !== '+') {
        params.maxPrice = max;
      }
    }
    
    if (filters.rating) {
      params.minRating = filters.rating;
    }
    
    // Convert sort options to backend format
    if (sortBy && sortBy !== 'newest') {
      switch (sortBy) {
        case 'price-low':
          params.sortBy = 'price';
          params.sortOrder = 'asc';
          break;
        case 'price-high':
          params.sortBy = 'price';
          params.sortOrder = 'desc';
          break;
        case 'rating':
          params.sortBy = 'rating';
          params.sortOrder = 'desc';
          break;
        case 'name-asc':
          params.sortBy = 'name';
          params.sortOrder = 'asc';
          break;
        case 'name-desc':
          params.sortBy = 'name';
          params.sortOrder = 'desc';
          break;
        case 'oldest':
          params.sortBy = 'createdAt';
          params.sortOrder = 'asc';
          break;
        default:
          params.sortBy = 'createdAt';
          params.sortOrder = 'desc';
      }
    }

    return params;
  };

  // Update URL with current parameters
  const updateURL = () => {
    const params = new URLSearchParams();
    
    if (searchQuery) params.set('search', searchQuery);
    if (sortBy !== 'newest') params.set('sort', sortBy);
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (filters.categories.length > 0) params.set('category', filters.categories[0]);
    if (filters.priceRange) params.set('price', filters.priceRange);
    if (filters.rating) params.set('rating', filters.rating.toString());
    if (filters.inStock) params.set('inStock', 'true');
    if (filters.onSale) params.set('onSale', 'true');

    setSearchParams(params);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
    updateURL();
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value, checked) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      if (filterType === 'categories') {
        if (checked) {
          newFilters.categories = [...prev.categories, value];
        } else {
          newFilters.categories = prev.categories.filter(cat => cat !== value);
        }
      } else if (filterType === 'priceRange' || filterType === 'rating') {
        newFilters[filterType] = checked ? value : '';
      } else {
        newFilters[filterType] = checked;
      }
      
      return newFilters;
    });
    
    setCurrentPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      categories: [],
      priceRange: '',
      rating: '',
      inStock: false,
      onSale: false
    });
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Effects
  useEffect(() => {
    fetchProducts();
  }, [currentPage, sortBy, filters]);

  useEffect(() => {
    updateURL();
  }, [searchQuery, sortBy, currentPage, filters]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" />
        </div>
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
              to="/"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            
            <div className="w-20"></div> {/* Spacer for alignment */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <ProductFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="mb-6">
              <ProductSearch
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSearch={handleSearch}
                onClearSearch={() => {
                  setCurrentPage(1);
                  fetchProducts();
                  updateURL();
                }}
                placeholder="Search products by name, description, brand..."
              />
            </div>

            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Mobile Filter Toggle */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden btn btn-outline btn-sm flex items-center"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </button>

                  {/* Results Count */}
                  <span className="text-sm text-gray-600">
                    {totalProducts > 0 
                      ? `Showing ${((currentPage - 1) * 12) + 1}-${Math.min(currentPage * 12, totalProducts)} of ${totalProducts} products`
                      : 'No products found'
                    }
                  </span>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Sort Dropdown */}
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex border border-gray-300 rounded-md">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="lg:hidden mb-6">
                <ProductFilters
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClearFilters={clearFilters}
                />
              </div>
            )}

            {/* Products Grid */}
            {error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">Error loading products: {error}</p>
                <button 
                  onClick={fetchProducts}
                  className="btn btn-primary"
                >
                  Try Again
                </button>
              </div>
            ) : products.length > 0 ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {products.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">No products found</p>
                <p className="text-gray-400 mb-6">Try adjusting your search or filters</p>
                <button
                  onClick={clearFilters}
                  className="btn btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <nav className="flex items-center space-x-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      return page === 1 || 
                             page === totalPages || 
                             (page >= currentPage - 2 && page <= currentPage + 2);
                    })
                    .map((page, index, array) => {
                      if (index > 0 && array[index - 1] < page - 1) {
                        return (
                          <React.Fragment key={`ellipsis-${page}`}>
                            <span className="px-3 py-2 text-sm font-medium text-gray-400">...</span>
                            <button
                              onClick={() => handlePageChange(page)}
                              className={`px-3 py-2 text-sm font-medium rounded-md ${
                                currentPage === page
                                  ? 'bg-primary-600 text-white'
                                  : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                              }`}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        );
                      }
                      
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            currentPage === page
                              ? 'bg-primary-600 text-white'
                              : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
