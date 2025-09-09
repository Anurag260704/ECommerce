import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Smartphone, 
  Laptop, 
  Shirt, 
  Home, 
  Dumbbell, 
  Book, 
  Heart, 
  Car, 
  Gamepad2
} from 'lucide-react';
import categoryService from '../services/categoryService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Footer from '../components/layout/Footer';

// Icon mapping for categories
const iconMap = {
  'laptop': Laptop,
  'smartphone': Smartphone,
  'shirt': Shirt,
  'home': Home,
  'dumbbell': Dumbbell,
  'book': Book,
  'heart': Heart,
  'car': Car,
  'puzzle': Gamepad2,
  'category': Smartphone // default icon
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [featuredCategories, setFeaturedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'featured', 'topLevel'

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all categories
        const allCategoriesResponse = await categoryService.getCategories({
          active: 'true'
        });

        // Fetch featured categories
        const featuredResponse = await categoryService.getFeaturedCategories();

        if (allCategoriesResponse.success) {
          setCategories(allCategoriesResponse.categories || []);
        }

        if (featuredResponse.success) {
          setFeaturedCategories(featuredResponse.categories || []);
        }

      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const getIconComponent = (iconName) => {
    return iconMap[iconName] || iconMap['category'];
  };

  const getDisplayCategories = () => {
    switch (activeTab) {
      case 'featured':
        return featuredCategories;
      case 'topLevel':
        return categories.filter(cat => cat.level === 0);
      default:
        return categories;
    }
  };

  if (loading) {
    return (
      <>
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="large" />
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const displayCategories = getDisplayCategories();

  return (
    <>
      <main>
        {/* Header */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                All Categories
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Explore our wide range of product categories and find exactly what you're looking for
              </p>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab('all')}
                className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'all'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Categories ({categories.length})
              </button>
              <button
                onClick={() => setActiveTab('featured')}
                className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'featured'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Featured ({featuredCategories.length})
              </button>
              <button
                onClick={() => setActiveTab('topLevel')}
                className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'topLevel'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Main Categories ({categories.filter(cat => cat.level === 0).length})
              </button>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {displayCategories.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
                <p className="text-gray-600">There are no categories to display at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {displayCategories.map((category) => {
                  const IconComponent = getIconComponent(category.metaData?.icon);
                  
                  return (
                    <Link
                      key={category._id}
                      to={`/products?category=${category.slug}`}
                      className="group relative bg-white rounded-lg overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-200 transform hover:scale-105"
                    >
                      {/* Category Image */}
                      <div className="aspect-w-16 aspect-h-12 overflow-hidden">
                        <img
                          src={category.image?.url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'}
                          alt={category.image?.alt || `${category.name} category`}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>

                      {/* Category Info */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <div className="flex items-center mb-2">
                          <IconComponent className="h-6 w-6 mr-3" />
                          <h3 className="font-bold text-lg">{category.name}</h3>
                        </div>
                        <p className="text-sm text-gray-200 line-clamp-2 mb-2">
                          {category.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-300">
                            {category.productCount || 0} products
                          </span>
                          {category.isFeatured && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-400 text-yellow-900">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-primary-600 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Categories;
