import React, { useState, useContext } from 'react';
import { Star, ThumbsUp, ThumbsDown, User } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import productService from '../../services/productService';
import toast from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';

const ProductReviews = ({ productId, reviews, averageRating, totalReviews, onReviewAdded }) => {
  const { user } = useContext(AuthContext);
  const [showAddReview, setShowAddReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
    title: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  const renderStars = (rating, size = 'small') => {
    const starSize = size === 'large' ? 'h-5 w-5' : 'h-4 w-4';
    
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`${starSize} ${
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const renderInteractiveStars = (currentRating, onRatingChange) => {
    return Array.from({ length: 5 }, (_, index) => (
      <button
        key={index}
        type="button"
        onClick={() => onRatingChange(index + 1)}
        className={`h-6 w-6 transition-colors ${
          index < currentRating
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300 hover:text-yellow-300'
        }`}
      >
        <Star className="h-full w-full" />
      </button>
    ));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to add a review');
      return;
    }

    if (!reviewForm.comment.trim() || !reviewForm.title.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      await productService.addReview(productId, reviewForm);
      toast.success('Review added successfully!');
      
      // Reset form
      setReviewForm({ rating: 5, comment: '', title: '' });
      setShowAddReview(false);
      
      // Callback to refresh reviews
      if (onReviewAdded) {
        onReviewAdded();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to add review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const sortedReviews = reviews ? [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  }) : [];

  const getRatingDistribution = () => {
    if (!reviews || reviews.length === 0) return {};
    
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating] = (distribution[review.rating] || 0) + 1;
    });
    
    return distribution;
  };

  const ratingDistribution = getRatingDistribution();

  return (
    <div className="space-y-8">
      {/* Review Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center space-x-2 mb-2">
              <div className="flex items-center">
                {renderStars(averageRating || 0, 'large')}
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {averageRating ? averageRating.toFixed(1) : '0.0'}
              </span>
            </div>
            <p className="text-gray-600">
              Based on {totalReviews || 0} review{totalReviews !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2 min-w-0 md:min-w-[200px]">
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="flex items-center space-x-2 text-sm">
                <span className="w-2">{rating}</span>
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{
                      width: `${reviews && reviews.length > 0 
                        ? (ratingDistribution[rating] / reviews.length) * 100 
                        : 0}%`
                    }}
                  />
                </div>
                <span className="w-8 text-right">
                  {ratingDistribution[rating] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Add Review Button */}
        {user && (
          <button
            onClick={() => setShowAddReview(!showAddReview)}
            className="btn btn-primary"
          >
            {showAddReview ? 'Cancel' : 'Write a Review'}
          </button>
        )}
        
        {!user && (
          <p className="text-gray-600 text-sm">
            Please <span className="text-primary-600 font-medium">login</span> to write a review
          </p>
        )}
      </div>

      {/* Add Review Form */}
      {showAddReview && user && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Write Your Review</h3>
          
          <form onSubmit={handleSubmitReview} className="space-y-4">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex items-center space-x-1">
                {renderInteractiveStars(reviewForm.rating, (rating) =>
                  setReviewForm(prev => ({ ...prev, rating }))
                )}
                <span className="ml-2 text-sm text-gray-600">
                  ({reviewForm.rating} star{reviewForm.rating !== 1 ? 's' : ''})
                </span>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Title
              </label>
              <input
                type="text"
                value={reviewForm.title}
                onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                className="input w-full"
                placeholder="Summarize your review in a few words"
                required
              />
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review
              </label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                className="input w-full h-32 resize-none"
                placeholder="Share your thoughts about this product..."
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddReview(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary flex items-center"
              >
                {isSubmitting && <LoadingSpinner size="small" className="mr-2" />}
                Submit Review
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Customer Reviews ({totalReviews || 0})
          </h3>
          
          {reviews && reviews.length > 0 && (
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input w-auto text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          )}
        </div>

        {sortedReviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedReviews.map((review) => (
              <div key={review._id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {review.user?.name || 'Anonymous User'}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {review.title && (
                      <h5 className="font-medium text-gray-900 mb-2">
                        {review.title}
                      </h5>
                    )}
                    
                    <p className="text-gray-700 mb-3">
                      {review.comment}
                    </p>

                    {/* Helpful buttons could be added here */}
                    {/* 
                    <div className="flex items-center space-x-4 text-sm">
                      <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
                        <ThumbsUp className="h-4 w-4" />
                        <span>Helpful (0)</span>
                      </button>
                      <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
                        <ThumbsDown className="h-4 w-4" />
                        <span>Not Helpful (0)</span>
                      </button>
                    </div>
                    */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
