import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function InteractiveHotspot({ element, language, onInteract }) {
  const [showInfo, setShowInfo] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleClick = () => {
    setShowInfo(true);
    setHasInteracted(true);
    
    // Play sound if available
    if (element.sound_url) {
      const audio = new Audio(element.sound_url);
      audio.play().catch(e => console.log('Audio play failed:', e));
    }
    
    if (onInteract) onInteract(element);
  };

  const title = language === 'en' ? element.title_en : element.title_pt;
  const content = language === 'en' ? element.content_en : element.content_pt;

  return (
    <>
      {/* Hotspot Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ 
          scale: 1,
          boxShadow: hasInteracted 
            ? '0 0 0 0 rgba(255, 215, 0, 0)' 
            : ['0 0 0 0 rgba(255, 215, 0, 0.7)', '0 0 0 10px rgba(255, 215, 0, 0)']
        }}
        transition={{ 
          scale: { duration: 0.3 },
          boxShadow: { duration: 2, repeat: hasInteracted ? 0 : Infinity }
        }}
        onClick={handleClick}
        className={`absolute w-10 h-10 rounded-full flex items-center justify-center cursor-pointer ${
          hasInteracted ? 'bg-green-500' : 'bg-yellow-400'
        } shadow-lg hover:scale-110 transition-transform`}
        style={{
          left: `${element.position_x}%`,
          top: `${element.position_y}%`,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <Sparkles className="w-5 h-5 text-white" />
      </motion.button>

      {/* Info Modal */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 flex items-center justify-center z-20 p-4"
            onClick={() => setShowInfo(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowInfo(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {element.animation_url && (
                <div className="mb-4 rounded-lg overflow-hidden">
                  <img
                    src={element.animation_url}
                    alt={title}
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}

              <p className="text-gray-600 leading-relaxed mb-4">
                {content}
              </p>

              {element.sound_url && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Volume2 className="w-4 h-4" />
                  <span>Click the hotspot again to replay sound</span>
                </div>
              )}

              <Button
                onClick={() => setShowInfo(false)}
                className="w-full mt-4"
                style={{ 
                  background: 'linear-gradient(135deg, #FF6B35 0%, #2E86AB 100%)',
                  color: '#FFFFFF'
                }}
              >
                Got it!
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}