import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '../../utils';
import ProductRating from './ProductRating';

export default function ProductCard({ product, onAddToCart, index }) {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || null);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    onAddToCart(product, selectedSize);
  };

  const handleViewDetails = () => {
    window.location.href = createPageUrl('ProductDetails') + '?id=' + product.id;
  };

  const categoryIcons = {
    't-shirt': '👕',
    'mug': '☕',
    'notebook': '📓',
    'poster': '🖼️'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card 
        className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 cursor-pointer" 
        style={{ borderColor: 'transparent' }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#A8DADC'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
        onClick={handleViewDetails}
      >
        {/* Product Image */}
        <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden group">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name_en}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-8xl">
                {categoryIcons[product.category] || '🎨'}
              </div>
            </div>
          )}

          {/* View Details Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <Eye className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Featured Badge */}
          {product.is_featured && (
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1"
              style={{ 
                background: 'linear-gradient(135deg, #FFD23F 0%, #FF8C42 100%)',
                color: '#1A2332'
              }}>
              <Star className="w-3 h-3 fill-current" />
              Featured
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold shadow-lg"
            style={{ 
              background: 'linear-gradient(135deg, #2E86AB 0%, #06A77D 100%)',
              color: '#FFFFFF'
            }}>
            {product.category.replace('-', ' ')}
          </div>

          {/* Stock Badge */}
          {product.stock <= 5 && product.stock > 0 && (
            <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-semibold shadow-lg"
              style={{ backgroundColor: '#FF6B35', color: '#FFFFFF' }}>
              Only {product.stock} left!
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-semibold shadow-lg"
              style={{ backgroundColor: '#6C757D', color: '#FFFFFF' }}>
              Out of Stock
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-bold text-lg mb-1 line-clamp-2" style={{ color: '#1A2332' }}>
            {product.name_en}
          </h3>
          <p className="text-sm mb-2 line-clamp-2" style={{ color: '#6C757D' }}>
            {product.description_en}
          </p>

          {/* Rating */}
          <div className="mb-3">
            <ProductRating productId={product.id} showCount={true} />
          </div>

          {/* Theme Badge */}
          {product.design_theme && (
            <div className="mb-3">
              <span className="inline-block text-xs px-2 py-1 rounded-full" style={{ 
                backgroundColor: '#FFF8F0',
                color: '#FF6B35'
              }}>
                {product.design_theme}
              </span>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-3">
              <div className="text-xs mb-2" style={{ color: '#6C757D' }}>Size:</div>
              <div className="flex gap-2">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSize(size);
                    }}
                    className="px-3 py-1 rounded-lg text-sm font-medium transition-all"
                    style={selectedSize === size ? {
                      backgroundColor: '#2E86AB',
                      color: '#FFFFFF'
                    } : {
                      backgroundColor: '#F8F9FA',
                      color: '#1A2332'
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price and Add to Cart */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-2xl font-bold" style={{ color: '#FF6B35' }}>
              ${product.price.toFixed(2)}
            </div>
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex items-center gap-2"
              style={product.stock > 0 ? { 
                background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
                color: '#FFFFFF'
              } : {
                backgroundColor: '#6C757D',
                color: '#FFFFFF'
              }}
            >
              <ShoppingCart className="w-4 h-4" />
              Add
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}