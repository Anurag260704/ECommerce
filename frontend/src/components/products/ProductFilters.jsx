import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

const ProductFilters = ({ filters, onFilterChange, onClearFilters }) => {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    rating: true,
    brand: false
  });

  const categories = [
    { value: 'Electronics', label: 'Electronics' },
    { value: 'Clothing', label: 'Clothing' },
    { value: 'Books', label: 'Books' },
    { value: 'Home & Garden', label: 'Home & Garden' },
    { value: 'Sports', label: 'Sports' },
    { value: 'Beauty & Health', label: 'Beauty & Health' },
    { value: 'Automotive', label: 'Automotive' },
    { value: 'Food & Beverages', label: 'Food & Beverages' },
    { value: 'Toys & Games', label: 'Toys & Games' },
    { value: 'Others', label: 'Others' }
  ];

  const priceRanges = [
    { value: '0-25', label: 'Under $25' },
    { value: '25-50', label: '$25 - $50' },
    { value: '50-100', label: '$50 - $100' },
    { value: '100-200', label: '$100 - $200' },
    { value: '200-500', label: '$200 - $500' },
    { value: '500-1000', label: '$500 - $1000' },
    { value: '1000+', label: '$1000+' }
  ];

  const ratingOptions = [
    { value: 4, label: '4 Stars & Up' },
    { value: 3, label: '3 Stars & Up' },
    { value: 2, label: '2 Stars & Up' },
    { value: 1, label: '1 Star & Up' }
  ];

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFilterChange = (filterType, value, checked) => {
    onFilterChange(filterType, value, checked);
  };

  const hasActiveFilters = () => {
    return Object.values(filters).some(filterArray => 
      Array.isArray(filterArray) ? filterArray.length > 0 : filterArray
    );
  };

  const FilterSection = ({ title, sectionKey, children }) => (
    <div className="border-b border-gray-200 py-4">
      <button
        className="flex items-center justify-between w-full text-left"
        onClick={() => toggleSection(sectionKey)}
      >
        <span className="text-sm font-medium text-gray-900">{title}</span>
        {expandedSections[sectionKey] ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>
      {expandedSections[sectionKey] && (
        <div className="mt-3 space-y-2">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters() && (
          <button
            onClick={onClearFilters}
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </button>
        )}
      </div>

      {/* Category Filter */}
      <FilterSection title="Category" sectionKey="category">
        {categories.map((category) => (
          <label key={category.value} className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              checked={filters.categories?.includes(category.value) || false}
              onChange={(e) => handleFilterChange('categories', category.value, e.target.checked)}
            />
            <span className="ml-3 text-sm text-gray-700">{category.label}</span>
          </label>
        ))}
      </FilterSection>

      {/* Price Filter */}
      <FilterSection title="Price Range" sectionKey="price">
        {priceRanges.map((range) => (
          <label key={range.value} className="flex items-center">
            <input
              type="radio"
              name="priceRange"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              checked={filters.priceRange === range.value}
              onChange={() => handleFilterChange('priceRange', range.value, true)}
            />
            <span className="ml-3 text-sm text-gray-700">{range.label}</span>
          </label>
        ))}
      </FilterSection>

      {/* Rating Filter */}
      <FilterSection title="Customer Rating" sectionKey="rating">
        {ratingOptions.map((rating) => (
          <label key={rating.value} className="flex items-center">
            <input
              type="radio"
              name="rating"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              checked={filters.rating === rating.value}
              onChange={() => handleFilterChange('rating', rating.value, true)}
            />
            <span className="ml-3 text-sm text-gray-700">{rating.label}</span>
          </label>
        ))}
      </FilterSection>

      {/* Brand Filter */}
      <FilterSection title="Brand" sectionKey="brand">
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Search brands..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          />
          {/* Brand checkboxes would be populated dynamically from API */}
          <div className="text-sm text-gray-500">
            Brands will be loaded based on available products
          </div>
        </div>
      </FilterSection>

      {/* Availability Filter */}
      <div className="py-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            checked={filters.inStock || false}
            onChange={(e) => handleFilterChange('inStock', true, e.target.checked)}
          />
          <span className="ml-3 text-sm text-gray-700">In Stock Only</span>
        </label>
      </div>

      {/* On Sale Filter */}
      <div className="py-4 border-t border-gray-200">
        <label className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            checked={filters.onSale || false}
            onChange={(e) => handleFilterChange('onSale', true, e.target.checked)}
          />
          <span className="ml-3 text-sm text-gray-700">On Sale</span>
        </label>
      </div>
    </div>
  );
};

export default ProductFilters;
