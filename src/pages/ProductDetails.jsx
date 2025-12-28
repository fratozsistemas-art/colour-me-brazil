import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ShoppingCart, Star, MessageSquare } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '../utils';
import ReviewsList from '../components/shop/ReviewsList';
import ReviewForm from '../components/shop/ReviewForm';
import ProductRating from '../components/shop/ProductRating';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductDetails() {
  const [selectedSize, setSelectedSize] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  const { data: product, isLoading, refetch } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const products = await base44.entities.Product.filter({ id: productId });
      return products[0];
    },
    enabled: !!productId
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p className="text-gray-600">Product not found</p>
        <Button onClick={() => window.location.href = createPageUrl('Shop')} className="mt-4">
          Back to Shop
        </Button>
      </div>
    );
  }

  if (!selectedSize && product.sizes && product.sizes.length > 0) {
    setSelectedSize(product.sizes[0]);
  }

  const handleAddToCart = () => {
    // TODO: Integrate with cart
    alert('Added to cart!');
  };

  return (
    <div className="max-w-7xl mx-auto pb-24 md:pb-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => window.location.href = createPageUrl('Shop')}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Shop
      </Button>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Product Image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="overflow-hidden">
            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name_en}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-9xl">
                    {product.category === 't-shirt' && '👕'}
                    {product.category === 'mug' && '☕'}
                    {product.category === 'notebook' && '📓'}
                    {product.category === 'poster' && '🖼️'}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">{product.name_en}</h1>
            <p className="text-lg text-gray-600 mb-4">{product.description_en}</p>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-4">
              <ProductRating productId={product.id} showCount={true} />
            </div>

            {/* Theme */}
            {product.design_theme && (
              <div className="mb-4">
                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700">
                  {product.design_theme}
                </span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="border-t border-b py-4">
            <div className="text-4xl font-bold text-orange-600">
              ${product.price.toFixed(2)}
            </div>
            <p className="text-sm text-gray-500 mt-1">Free shipping on orders over $50</p>
          </div>

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Select Size
              </label>
              <div className="flex gap-3">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                      selectedSize === size
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock Info */}
          {product.stock <= 5 && product.stock > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-sm text-orange-800">
                🔥 Only {product.stock} left in stock!
              </p>
            </div>
          )}

          {product.stock === 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-800">
                😔 Out of stock - check back soon!
              </p>
            </div>
          )}

          {/* Add to Cart */}
          <Button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Add to Cart
          </Button>

          {/* Write Review Button */}
          <Button
            variant="outline"
            onClick={() => setShowReviewForm(true)}
            className="w-full py-4"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Write a Review
          </Button>
        </motion.div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Customer Reviews</h2>
        <ReviewsList productId={product.id} />
      </div>

      {/* Review Form Modal */}
      <AnimatePresence>
        {showReviewForm && (
          <ReviewForm
            productId={product.id}
            productName={product.name_en}
            onClose={() => setShowReviewForm(false)}
            onSubmitSuccess={() => {
              refetch();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}