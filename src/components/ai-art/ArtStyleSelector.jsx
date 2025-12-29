import React from 'react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export default function ArtStyleSelector({ styles, selected, onSelect }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-3">Choose Brazilian Art Style</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {styles.map((style) => (
          <motion.button
            key={style.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(style)}
            className="relative"
          >
            <Card className={`p-4 text-center transition-all ${
              selected.id === style.id
                ? 'border-2 border-purple-500 bg-purple-50'
                : 'border border-gray-200 hover:border-purple-300'
            }`}>
              <div className="text-2xl mb-2">{getStyleEmoji(style.id)}</div>
              <div className="text-sm font-medium text-gray-800">{style.name}</div>
              
              {selected.id === style.id && (
                <div className="absolute top-2 right-2 bg-purple-500 rounded-full p-1">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </Card>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function getStyleEmoji(styleId) {
  const emojis = {
    indigenous: '🪶',
    carnival: '🎭',
    folk: '🎨',
    modern: '🏛️',
    amazon: '🌿',
    capoeira: '🤸'
  };
  return emojis[styleId] || '🎨';
}