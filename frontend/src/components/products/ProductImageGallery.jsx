import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUtils';

const ProductImageGallery = ({ images, productName }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState(new Set());

  // Process images with proper URLs - handle different data structures
  const processImages = () => {
    if (!images || images.length === 0) {
      return ['/placeholder-product.jpg'];
    }
    
    // Debug: Log the images structure to understand the data format
    console.log('ProductImageGallery - Images data:', images);
    
    return images.map(img => {
      // Handle different image data structures:
      // 1. String URL: "http://example.com/image.jpg"
      // 2. Object with url property: {url: "http://example.com/image.jpg", alt: "..."}
      // 3. Object with src property: {src: "http://example.com/image.jpg"}
      // 4. Direct path: "uploads/image.jpg"
      
      let imagePath = img;
      
      if (typeof img === 'object') {
        imagePath = img.url || img.src || img.path || img;
      }
      
      return getImageUrl(imagePath);
    });
  };
  
  const productImages = processImages();

  // Handle image loading error
  const handleImageError = (index, imageSrc) => {
    console.warn(`Failed to load image: ${imageSrc}`);
    const newErrors = new Set(imageErrors);
    newErrors.add(index);
    setImageErrors(newErrors);
    setImageLoading(false);
  };

  // Handle image load success
  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // Get the image source with fallback
  const getImageSrc = (index) => {
    if (imageErrors.has(index)) {
      return '/placeholder-product.jpg';
    }
    return productImages[index];
  };

  const nextImage = () => {
    setImageLoading(true);
    setCurrentImageIndex((prev) => 
      prev === productImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setImageLoading(true);
    setCurrentImageIndex((prev) => 
      prev === 0 ? productImages.length - 1 : prev - 1
    );
  };

  const selectImage = (index) => {
    setImageLoading(true);
    setCurrentImageIndex(index);
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative bg-gray-100 rounded-lg overflow-hidden group">
        <div className="aspect-square relative">
          {/* Loading skeleton */}
          {imageLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="text-gray-400 text-sm">Loading...</div>
            </div>
          )}
          
          <img
            src={getImageSrc(currentImageIndex)}
            alt={`${productName} - Image ${currentImageIndex + 1}`}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
            } ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
            onClick={toggleZoom}
            onLoad={handleImageLoad}
            onError={() => handleImageError(currentImageIndex, productImages[currentImageIndex])}
          />
          
          {/* Zoom Icon */}
          <button
            onClick={toggleZoom}
            className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <ZoomIn className="h-4 w-4 text-gray-600" />
          </button>

          {/* Navigation Arrows - Only show if multiple images */}
          {productImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-50"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-50"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </>
          )}

          {/* Image Counter */}
          {productImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {productImages.length}
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail Images - Only show if multiple images */}
      {productImages.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {productImages.map((image, index) => (
            <button
              key={index}
              onClick={() => selectImage(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                index === currentImageIndex
                  ? 'border-primary-500'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={getImageSrc(index)}
                alt={`${productName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={() => handleImageError(index, productImages[index])}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
