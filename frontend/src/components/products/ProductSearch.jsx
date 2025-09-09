import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

const ProductSearch = ({ 
  searchQuery, 
  onSearchChange, 
  onSearch, 
  onClearSearch,
  placeholder = "Search products...",
  showClearButton = true 
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch();
  };

  const handleClear = () => {
    onSearchChange('');
    if (onClearSearch) {
      onClearSearch();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div 
        className={`relative flex items-center border rounded-lg transition-all duration-200 ${
          isFocused 
            ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-20' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full pl-10 pr-12 py-3 border-none rounded-lg focus:outline-none focus:ring-0 text-gray-900 placeholder-gray-500"
        />
        
        {showClearButton && searchQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-8 flex items-center pr-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        
        <button
          type="submit"
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-600 hover:text-blue-700 transition-colors duration-200"
        >
          <span className="sr-only">Search</span>
          <div className="w-6 h-6 flex items-center justify-center">
            <Search className="h-4 w-4" />
          </div>
        </button>
      </div>
      
      {/* Search suggestions could be added here */}
      {searchQuery && isFocused && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* This would be populated with search suggestions from API */}
          <div className="p-3 text-sm text-gray-500">
            Press Enter to search for "{searchQuery}"
          </div>
        </div>
      )}
    </form>
  );
};

export default ProductSearch;
