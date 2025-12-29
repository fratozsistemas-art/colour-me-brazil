import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, Trash2, BookOpen, Palette, Sparkles, Type } from 'lucide-react';

export default function BookPageEditor({ page, index, onRemove, onMoveUp, onMoveDown }) {
  const getPageIcon = () => {
    switch (page.type) {
      case 'story':
        return <BookOpen className="w-5 h-5 text-blue-500" />;
      case 'coloring':
        return <Palette className="w-5 h-5 text-green-500" />;
      case 'artwork':
        return <Sparkles className="w-5 h-5 text-purple-500" />;
      case 'text':
        return <Type className="w-5 h-5 text-gray-500" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  const getPageLabel = () => {
    switch (page.type) {
      case 'story':
        return 'Story Page';
      case 'coloring':
        return 'Coloring Page';
      case 'artwork':
        return 'AI Artwork';
      case 'text':
        return 'Text Page';
      default:
        return 'Page';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <Card className="p-4">
        <div className="flex items-center gap-4">
          {/* Order Controls */}
          <div className="flex flex-col gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={onMoveUp}
              className="h-6 w-6"
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={onMoveDown}
              className="h-6 w-6"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>

          {/* Page Number */}
          <div className="text-lg font-bold text-gray-400 w-8">
            {index + 1}
          </div>

          {/* Page Info */}
          <div className="flex-1 flex items-center gap-3">
            {getPageIcon()}
            <div>
              <div className="font-medium">{getPageLabel()}</div>
              {page.custom_text && (
                <div className="text-sm text-gray-600 line-clamp-1">
                  {page.custom_text}
                </div>
              )}
            </div>
          </div>

          {/* Remove Button */}
          <Button
            size="icon"
            variant="ghost"
            onClick={onRemove}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}