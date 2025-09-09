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
import categoryService from '../../services/categoryService';
import LoadingSpinner from '../common/LoadingSpinner';

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

const CategoriesSection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await categoryService.getFeaturedCategories(8);
        
        if (response.success) {
          setCategories(response.categories || []);
        }
      } catch (error) {
        console.error('Error fetching featured categories:', error);
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCategories();
  }, []);

  const getIconComponent = (iconName) => {
    return iconMap[iconName] || iconMap['category'];
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Shop by Category
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Browse through our diverse collection of products across different categories
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <LoadingSpinner size="large" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-primary"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => {
              const IconComponent = getIconComponent(category.metaData?.icon);
              
              return (
                <Link
                  key={category._id}
                  to={`/products?category=${category.slug}`}
                  className="group relative overflow-hidden rounded-lg bg-white shadow-card hover:shadow-card-hover transition-all duration-200"
                >
                  <div className="aspect-w-16 aspect-h-12 overflow-hidden">
                    <img
                      src={category.image?.url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'}
                      alt={category.image?.alt || `${category.name} category`}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <div className="flex items-center mb-2">
                      <IconComponent className="h-5 w-5 mr-2" />
                      <h3 className="font-semibold text-sm">{category.name}</h3>
                    </div>
                    <p className="text-xs text-gray-200 line-clamp-1">
                      {category.description}
                    </p>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-primary-600 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200" />
                </Link>
              );
            })}
          </div>
        )}

        <div className="text-center mt-12">
          <Link to="/categories" className="btn btn-secondary btn-lg">
            View All Categories
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
