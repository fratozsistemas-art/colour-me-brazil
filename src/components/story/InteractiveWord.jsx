import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function InteractiveWord({ word, definition, culturalContext, children, language = 'en' }) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!definition && !culturalContext) {
    return <span>{children}</span>;
  }

  return (
    <span className="relative inline-block">
      <motion.span
        className="cursor-help border-b-2 border-dotted border-blue-400 text-blue-600 font-medium hover:border-blue-600 transition-colors"
        onClick={() => setShowTooltip(!showTooltip)}
        whileHover={{ scale: 1.05 }}
      >
        {children}
        <Sparkles className="w-3 h-3 inline-block ml-1 text-yellow-500" />
      </motion.span>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="p-4 shadow-xl border-2 border-blue-200 bg-white">
              <div className="mb-2">
                <div className="text-sm font-bold text-blue-600 mb-1 flex items-center gap-1">
                  <Book className="w-4 h-4" />
                  {word}
                </div>
                {definition && (
                  <p className="text-sm text-gray-700 mb-2">{definition}</p>
                )}
              </div>
              {culturalContext && (
                <div className="pt-2 border-t border-gray-200">
                  <div className="text-xs font-semibold text-purple-600 mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Cultural Context
                  </div>
                  <p className="text-xs text-gray-600">{culturalContext}</p>
                </div>
              )}
            </Card>
            <div className="w-3 h-3 bg-white border-r-2 border-b-2 border-blue-200 absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}