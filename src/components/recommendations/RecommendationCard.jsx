import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, X, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { dismissRecommendation, rateBook } from './recommendationEngine';

export default function RecommendationCard({ 
  book, 
  profileId, 
  onDismiss, 
  onClick,
  language = 'en' 
}) {
  const [isDismissing, setIsDismissing] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleDismiss = async (e) => {
    e.stopPropagation();
    setIsDismissing(true);
    await dismissRecommendation(profileId, book.id);
    setTimeout(() => {
      if (onDismiss) onDismiss(book.id);
    }, 300);
  };

  const handleRate = async (selectedRating) => {
    setRating(selectedRating);
    await rateBook(profileId, book.id, selectedRating);
    setTimeout(() => setShowRating(false), 1000);
  };

  const title = language === 'en' ? book.title_en : book.title_pt;
  const subtitle = language === 'en' ? book.subtitle_en : book.subtitle_pt;

  return (
    <AnimatePresence>
      {!isDismissing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8, x: -100 }}
          transition={{ duration: 0.3 }}
        >
          <Card 
            className="relative overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 group"
            onClick={onClick}
          >
            {/* Dismiss Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 z-10 bg-white/90 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
              title={language === 'en' ? 'Not interested' : 'Não interessado'}
            >
              <X className="w-4 h-4 text-gray-600 hover:text-red-600" />
            </button>

            {/* Book Cover */}
            <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100">
              {book.cover_image_url && (
                <img
                  src={book.cover_image_url}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              )}
              
              {/* Score Badge */}
              {book.recommendationScore > 0 && (
                <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Heart className="w-3 h-3 fill-current" />
                  {Math.round(book.recommendationScore)}% Match
                </div>
              )}
            </div>

            {/* Book Info */}
            <div className="p-4">
              <h3 className="font-bold text-lg mb-1 line-clamp-2">{title}</h3>
              {subtitle && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-1">{subtitle}</p>
              )}

              {/* Recommendation Reasons */}
              {book.recommendationReasons && book.recommendationReasons.length > 0 && (
                <div className="mb-3 space-y-1">
                  {book.recommendationReasons.slice(0, 2).map((reason, idx) => (
                    <div key={idx} className="text-xs text-blue-600 flex items-start gap-1">
                      <span className="mt-0.5">•</span>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Rating Section */}
              <div className="border-t pt-3 mt-3">
                {!showRating ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowRating(true);
                    }}
                    className="w-full text-xs"
                  >
                    <Star className="w-3 h-3 mr-1" />
                    {language === 'en' ? 'Rate this book' : 'Avaliar este livro'}
                  </Button>
                ) : (
                  <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRate(star);
                        }}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="transition-transform hover:scale-125"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= (hoveredRating || rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}