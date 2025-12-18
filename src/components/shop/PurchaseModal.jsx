import React, { useState } from 'react';
import { X, Lock, CreditCard, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function PurchaseModal({ book, onClose, onPurchaseComplete }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handlePurchase = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Create checkout session
      const response = await base44.functions.invoke('createCheckoutSession', {
        itemType: 'book',
        itemId: book.id,
        amount: 499, // $4.99 in cents
        itemName: book.title_en,
        successUrl: window.location.origin + '/Library?purchase=success&book_id=' + book.id,
        cancelUrl: window.location.origin + '/Library?purchase=cancelled'
      });

      if (response.data.url) {
        // Redirect to Stripe checkout
        window.location.href = response.data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      console.error('Purchase error:', err);
      setError(err.message || 'Failed to initiate purchase. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="max-w-md w-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white p-6 rounded-t-xl relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-3 rounded-lg">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Unlock Book</h2>
                  <p className="text-white/90 text-sm">One-time purchase</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Book Info */}
              <div className="flex gap-4">
                {book.cover_image_url && (
                  <img
                    src={book.cover_image_url}
                    alt={book.title_en}
                    className="w-24 h-24 object-contain rounded-lg bg-gray-100"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800">{book.title_en}</h3>
                  {book.subtitle_en && (
                    <p className="text-sm text-gray-600 mt-1">{book.subtitle_en}</p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {book.page_count || 12} pages
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Bilingual
                    </span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">What's Included:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Interactive bilingual story (EN/PT)</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Audio narration in both languages</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Colorable illustrations</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Cultural facts & quizzes</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Offline download available</span>
                  </li>
                </ul>
              </div>

              {/* Price */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border-2 border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">One-time payment</p>
                    <p className="text-3xl font-bold text-gray-800">$4.99</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Lifetime access</p>
                    <p className="text-xs text-gray-500">All profiles</p>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Purchase Button */}
              <Button
                onClick={handlePurchase}
                disabled={isProcessing}
                className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Purchase Now
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-gray-500">
                Secure payment powered by Stripe • 30-day money-back guarantee
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}