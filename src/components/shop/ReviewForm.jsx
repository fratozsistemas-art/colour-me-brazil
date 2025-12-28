import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Star, Send, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { createPageUrl } from '../../utils';

export default function ReviewForm({ productId, productName, onClose, onSubmitSuccess }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [shopProfile, setShopProfile] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          toast.error('Please login to write a review');
          base44.auth.redirectToLogin(window.location.href);
          return;
        }
        const user = await base44.auth.me();
        setCurrentUser(user);

        const profiles = await base44.entities.ShopUserProfile.filter({ 
          user_id: user.id 
        });
        setShopProfile(profiles[0] || null);
      } catch (error) {
        toast.error('Please login to write a review');
        base44.auth.redirectToLogin(window.location.href);
      }
    };
    loadUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error('Please login to submit a review');
      return;
    }

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setIsSubmitting(true);

    try {
      let profileId = shopProfile?.id;
      if (!shopProfile) {
        const newProfile = await base44.entities.ShopUserProfile.create({
          user_id: currentUser.id,
          display_name: currentUser.full_name || currentUser.email.split('@')[0],
          total_reviews: 0,
          verified_buyer: false
        });
        profileId = newProfile.id;
      }

      const existing = await base44.entities.ProductReview.filter({
        product_id: productId,
        profile_id: profileId
      });

      if (existing.length > 0) {
        toast.error('You already reviewed this product');
        setIsSubmitting(false);
        return;
      }

      await base44.entities.ProductReview.create({
        product_id: productId,
        profile_id: profileId,
        rating,
        review_title: reviewTitle,
        review_text: reviewText,
        is_verified_purchase: false,
        status: 'approved'
      });

      await base44.entities.ShopUserProfile.update(profileId, {
        total_reviews: (shopProfile?.total_reviews || 0) + 1
      });

      toast.success('Review submitted successfully!');
      if (onSubmitSuccess) onSubmitSuccess();
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        {currentUser && !shopProfile && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800">
              👋 Complete your profile to make your review stand out! 
              <a 
                href={createPageUrl('ProfileSettings')} 
                className="font-semibold underline ml-2"
              >
                Set up profile
              </a>
            </p>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Write a Review</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <p className="text-gray-600 mb-4">{productName}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Rating *
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review Title (optional)
            </label>
            <Input
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              placeholder="Sum up your experience..."
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review *
            </label>
            <Textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your thoughts about this product..."
              rows={5}
              maxLength={1000}
              required
            />
            <p className="text-xs text-gray-500 mt-1">{reviewText.length}/1000</p>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || rating === 0 || !reviewText.trim()}
              className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500"
            >
              {isSubmitting ? 'Submitting...' : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Review
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}