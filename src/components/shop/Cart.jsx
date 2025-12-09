import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Cart({ cart, onClose, onUpdateQuantity, onRemove }) {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const shipping = subtotal > 50 ? 0 : 9.99;
  const total = subtotal + shipping;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#1A2332' }}>
            <ShoppingBag className="w-6 h-6" style={{ color: '#FF6B35' }} />
            Your Cart ({cart.length})
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#1A2332' }}>Your cart is empty</h3>
              <p style={{ color: '#6C757D' }}>Add some products to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {cart.map((item) => (
                  <motion.div
                    key={item.cartId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <Card className="p-4">
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name_en} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl">
                              {item.category === 't-shirt' ? '👕' : item.category === 'mug' ? '☕' : item.category === 'notebook' ? '📓' : '🖼️'}
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1" style={{ color: '#1A2332' }}>
                            {item.name_en}
                          </h4>
                          {item.selectedSize && (
                            <p className="text-sm mb-2" style={{ color: '#6C757D' }}>
                              Size: {item.selectedSize}
                            </p>
                          )}
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 border rounded-lg">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onUpdateQuantity(item.cartId, (item.quantity || 1) - 1)}
                                className="h-8 w-8"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="font-medium px-2">{item.quantity || 1}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onUpdateQuantity(item.cartId, (item.quantity || 1) + 1)}
                                className="h-8 w-8"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="text-lg font-bold" style={{ color: '#FF6B35' }}>
                              ${(item.price * (item.quantity || 1)).toFixed(2)}
                            </div>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onRemove(item.cartId)}
                          className="flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" style={{ color: '#FF6B35' }} />
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer - Summary and Checkout */}
        {cart.length > 0 && (
          <div className="border-t p-6 space-y-4" style={{ backgroundColor: '#FFF8F0' }}>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span style={{ color: '#6C757D' }}>Subtotal:</span>
                <span className="font-medium" style={{ color: '#1A2332' }}>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: '#6C757D' }}>Shipping:</span>
                <span className="font-medium" style={{ color: shipping === 0 ? '#06A77D' : '#1A2332' }}>
                  {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              {subtotal < 50 && (
                <p className="text-xs" style={{ color: '#FF6B35' }}>
                  Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                </p>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span style={{ color: '#1A2332' }}>Total:</span>
                <span style={{ color: '#FF6B35' }}>${total.toFixed(2)}</span>
              </div>
            </div>
            <Button
              className="w-full text-lg py-6"
              style={{ 
                background: 'linear-gradient(135deg, #FF6B35 0%, #2E86AB 100%)',
                color: '#FFFFFF'
              }}
            >
              Proceed to Checkout
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}