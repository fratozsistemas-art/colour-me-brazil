import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ProductRating({ productId, showCount = true }) {
  const { data: reviews = [] } = useQuery({
    queryKey: ['productReviews', productId],
    queryFn: async () => {
      const allReviews = await base44.entities.ProductReview.filter({
        product_id: productId,
        status: 'approved'
      });
      return allReviews;
    },
  });

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const roundedRating = Math.round(averageRating * 2) / 2; // Round to nearest 0.5

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= Math.floor(roundedRating);
          const half = star === Math.ceil(roundedRating) && roundedRating % 1 !== 0;

          return (
            <div key={star} className="relative">
              <Star className={`w-4 h-4 ${filled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
              {half && (
                <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {showCount && reviews.length > 0 && (
        <span className="text-sm text-gray-600">
          {averageRating.toFixed(1)} ({reviews.length})
        </span>
      )}
    </div>
  );
}