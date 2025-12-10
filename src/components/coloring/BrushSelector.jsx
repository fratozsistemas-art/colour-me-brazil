import React from 'react';
import { Button } from '@/components/ui/button';
import { Paintbrush, Droplet, Feather, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const BRUSH_TYPES = [
  {
    id: 'solid',
    name: 'Solid',
    icon: Paintbrush,
    description: 'Classic solid brush',
    opacity: 1.0,
    blur: 0
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    icon: Droplet,
    description: 'Soft watercolor effect',
    opacity: 0.3,
    blur: 3
  },
  {
    id: 'airbrush',
    name: 'Airbrush',
    icon: Sparkles,
    description: 'Spray paint effect',
    opacity: 0.15,
    blur: 5
  },
  {
    id: 'calligraphy',
    name: 'Calligraphy',
    icon: Feather,
    description: 'Elegant calligraphy',
    opacity: 0.8,
    blur: 0
  }
];

export default function BrushSelector({ selectedBrush, onBrushChange }) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-700 text-sm">Brush Type</h3>
      <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
        {BRUSH_TYPES.map((brush) => {
          const Icon = brush.icon;
          const isSelected = selectedBrush === brush.id;
          
          return (
            <motion.button
              key={brush.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onBrushChange(brush.id)}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
              <div className="text-xs font-medium text-gray-800">{brush.name}</div>
              <div className="text-xs text-gray-500">{brush.description}</div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export { BRUSH_TYPES };