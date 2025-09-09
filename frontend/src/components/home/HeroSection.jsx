import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="relative bg-gradient-to-r from-primary-600 to-primary-800 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <img 
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          alt="Shopping background"
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <ShoppingBag className="h-16 w-16 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Welcome to
            <span className="block text-yellow-300">ShopEasy</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-100 mb-8 max-w-3xl mx-auto">
            Discover amazing products at unbeatable prices. From fashion to electronics, 
            we have everything you need in one place.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/products"
              className="inline-flex items-center px-8 py-3 border border-transparent text-lg font-medium rounded-md text-primary-900 bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              Shop Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            
            <Link
              to="/categories"
              className="inline-flex items-center px-8 py-3 border-2 border-white text-lg font-medium rounded-md text-white hover:bg-white hover:text-primary-900 transition-colors duration-200"
            >
              Browse Categories
            </Link>
          </div>
        </div>
      </div>
      
      {/* Wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-16 text-white" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M1200 120L0 16.48 0 0 1200 0 1200 120z" fill="currentColor"></path>
        </svg>
      </div>
    </div>
  );
};

export default HeroSection;
