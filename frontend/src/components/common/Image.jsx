import React, { useState, useEffect } from 'react';
import { getImageUrl } from '../../utils/imageUtils';

/**
 * Robust Image component with comprehensive error handling
 * Supports loading states, fallbacks, and various image data structures
 */
const Image = ({
  src,
  alt = '',
  className = '',
  fallback = '/placeholder-product.jpg',
  showLoading = true,
  loadingClassName = 'animate-pulse bg-gray-200',
  onLoad,
  onError,
  ...props
}) => {
  const [imageState, setImageState] = useState('loading');
  const [currentSrc, setCurrentSrc] = useState('');
  
  useEffect(() => {
    if (src) {
      setImageState('loading');
      setCurrentSrc(getImageUrl(src, fallback));
    } else {
      setImageState('error');
      setCurrentSrc(fallback);
    }
  }, [src, fallback]);

  const handleLoad = (e) => {
    setImageState('loaded');
    onLoad?.(e);
  };

  const handleError = (e) => {
    if (currentSrc !== fallback) {
      console.warn(`Failed to load image: ${currentSrc}, falling back to: ${fallback}`);
      setCurrentSrc(fallback);
      setImageState('loading'); // Try loading the fallback
    } else {
      setImageState('error');
      console.error(`Failed to load fallback image: ${fallback}`);
    }
    onError?.(e);
  };

  if (imageState === 'loading' && showLoading) {
    return (
      <div className={`${className} ${loadingClassName} flex items-center justify-center`}>
        <span className="text-gray-400 text-sm">Loading...</span>
      </div>
    );
  }

  if (imageState === 'error' && currentSrc === fallback) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center text-gray-400`}>
        <span className="text-sm">Image not available</span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={`${className} ${imageState === 'loaded' ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  );
};

export default Image;
