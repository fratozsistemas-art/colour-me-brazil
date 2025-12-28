import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tantml:function_calls>';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Star, ThumbsUp, CheckCircle, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ReviewsList({ productId }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const user = await base44.auth.me();
          setCurrentUser(user);
          
          const profiles = await base44.entities.ShopUserProfile.filter({ 
            user_id: user.id 
          });
          setCurrentProfile(profiles[0] || null);
        }
      } catch (error) {
        // Not logged in
      }
    };
    loadUser();
  }, []);

  const { data: reviews = [] } = useQuery({
    queryKey: ['productReviews', productId],
    queryFn: async () => {
      const allReviews = await base44.entities.ProductReview.filter({
        product_id: productId,
        status: 'approved'
      });
      return allReviews.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['shopProfiles'],
    queryFn: () => base44.entities.ShopUserProfile.list(),
  });

  const { data: helpfulMarks = [] } = useQuery({
    queryKey: ['reviewHelpful'],
    queryFn: () => base44.entities.ReviewHelpful.list(),
  });

  const markHelpful = useMutation({
    mutationFn: async (reviewId) => {
      if (!currentUser) {
        toast.error('Please login to mark helpful');
        return;
      }

      let profileId = currentProfile?.id;
      if (!profileId) {
        const newProfile = await base44.entities.ShopUserProfile.create({
          user_id: currentUser.id,
          display_name: currentUser.full_name || currentUser.email.split('@')[0]
        });
        profileId = newProfile.id;
        setCurrentProfile(newProfile);
      }

      const existing = helpfulMarks.find(
        h => h.review_id === reviewId && h.profile_id === profileId
      );

      if (existing) {
        await base44.entities.ReviewHelpful.delete(existing.id);
        const review = reviews.find(r => r.id === reviewId);
        await base44.entities.ProductReview.update(reviewId, {
          helpful_count: Math.max(0, (review.helpful_count || 0) - 1)
        });
      } else {
        await base44.entities.ReviewHelpful.create({
          review_id: reviewId,
          profile_id: profileId
        });
        const review = reviews.find(r => r.id === reviewId);
        await base44.entities.ProductReview.update(reviewId, {
          helpful_count: (review.helpful_count || 0) + 1
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['productReviews']);
      queryClient.invalidateQueries(['reviewHelpful']);
    }
  });

  const getProfile = (profileId) => profiles.find(p => p.id === profileId);
  const isMarkedHelpful = (reviewId) => 
    currentProfile && helpfulMarks.some(h => h.review_id === reviewId && h.profile_id === currentProfile.id);

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length
  }));

  if (reviews.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600">No reviews yet. Be the first to review!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="text-center md:border-r">
            <div className="text-5xl font-bold text-gray-800 mb-2">{averageRating}</div>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600">{reviews.length} reviews</p>
          </div>

          <div className="space-y-2">
            {ratingCounts.map(({ star, count }) => {
              const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-12">{star} star</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800">Customer Reviews</h3>
        {reviews.map((review, index) => {
          const profile = getProfile(review.profile_id);
          const isHelpful = isMarkedHelpful(review.id);

          return (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.display_name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                      {profile?.display_name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-800">
                        {profile?.display_name || 'Anonymous'}
                      </h4>
                      {profile?.verified_buyer && (
                        <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          Verified
                        </span>
                      )}
                    </div>
                    {profile?.location && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {profile.location}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(review.created_date).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex gap-0.5 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>

                {review.review_title && (
                  <h4 className="font-bold text-gray-800 mb-2">{review.review_title}</h4>
                )}

                <p className="text-gray-700 mb-3 whitespace-pre-wrap">{review.review_text}</p>

                {review.is_verified_purchase && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full mb-3">
                    <CheckCircle className="w-3 h-3" />
                    Verified Purchase
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t">
                  {profile?.total_reviews > 1 && (
                    <span className="text-sm text-gray-500">
                      {profile.total_reviews} reviews
                    </span>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markHelpful.mutate(review.id)}
                    disabled={!currentUser}
                    className={isHelpful ? 'bg-blue-50 border-blue-300' : ''}
                  >
                    <ThumbsUp className={`w-4 h-4 mr-1 ${isHelpful ? 'fill-blue-500 text-blue-500' : ''}`} />
                    Helpful ({review.helpful_count || 0})
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}