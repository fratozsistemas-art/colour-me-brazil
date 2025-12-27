import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Lightbulb } from 'lucide-react';

const TIPS = {
  'first-freeform': {
    id: 'first-freeform',
    title: 'Freeform Drawing Mode',
    message: 'Draw freely with brushes! Adjust brush size and type for different effects. Try different brushes like watercolor or airbrush.',
    position: 'bottom'
  },
  'first-fill': {
    id: 'first-fill',
    title: 'Fill Mode Activated',
    message: 'Click on enclosed areas to fill them with color. Adjust the tolerance slider if the fill is too precise or too loose.',
    position: 'bottom'
  },
  'first-gradient': {
    id: 'first-gradient',
    title: 'Gradient Mode',
    message: 'Click multiple areas to select them, then choose gradient colors and apply! Perfect for creating beautiful color transitions.',
    position: 'right'
  },
  'first-texture': {
    id: 'first-texture',
    title: 'Texture Fills',
    message: 'Selected textures blend with your color for unique effects. Try different patterns like dots, stripes, or noise!',
    position: 'right'
  },
  'first-color-adjust': {
    id: 'first-color-adjust',
    title: 'Color Adjustment',
    message: 'Fine-tune your entire artwork! Adjust hue to shift colors, saturation to make them vivid or muted, and brightness to lighten or darken.',
    position: 'right'
  },
  'first-brush-advanced': {
    id: 'first-brush-advanced',
    title: 'Advanced Brush Controls',
    message: 'Customize flow, opacity, blur, spacing, jitter, and texture intensity. Save your favorite settings as presets!',
    position: 'bottom'
  },
  'first-zoom': {
    id: 'first-zoom',
    title: 'Zoom & Pan',
    message: 'Use zoom buttons or Ctrl+Scroll to zoom. Hold Ctrl and drag to pan around the canvas.',
    position: 'left'
  }
};

export default function ContextualTip({ tipId, onDismiss }) {
  const [isVisible, setIsVisible] = useState(false);
  const tip = TIPS[tipId];

  useEffect(() => {
    if (tip) {
      // Check if this tip has been shown before
      const shownTips = JSON.parse(localStorage.getItem('coloringTipsShown') || '[]');
      if (!shownTips.includes(tipId)) {
        // Show tip after a short delay
        setTimeout(() => setIsVisible(true), 500);
      }
    }
  }, [tipId]);

  const handleDismiss = () => {
    setIsVisible(false);
    
    // Mark tip as shown
    const shownTips = JSON.parse(localStorage.getItem('coloringTipsShown') || '[]');
    shownTips.push(tipId);
    localStorage.setItem('coloringTipsShown', JSON.stringify(shownTips));
    
    if (onDismiss) onDismiss();
  };

  if (!tip || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed z-50 max-w-sm"
        style={{
          top: tip.position === 'top' ? '10%' : tip.position === 'bottom' ? 'auto' : '50%',
          bottom: tip.position === 'bottom' ? '10%' : 'auto',
          left: tip.position === 'left' ? '10%' : tip.position === 'right' ? 'auto' : '50%',
          right: tip.position === 'right' ? '10%' : 'auto',
          transform: tip.position === 'center' ? 'translate(-50%, -50%)' : 'none'
        }}
      >
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl shadow-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="bg-white/20 rounded-full p-2 flex-shrink-0">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-lg mb-2">{tip.title}</h4>
              <p className="text-sm leading-relaxed opacity-90">
                {tip.message}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="text-white hover:bg-white/20 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <Button
            onClick={handleDismiss}
            className="mt-4 w-full bg-white text-purple-600 hover:bg-gray-100"
          >
            Got it!
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export { TIPS };