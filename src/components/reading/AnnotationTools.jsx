import React from 'react';
import { Button } from '@/components/ui/button';
import { Highlighter, Underline, StickyNote, Eraser } from 'lucide-react';
import { motion } from 'framer-motion';

const HIGHLIGHT_COLORS = [
  { name: 'Yellow', value: '#FFF59D' },
  { name: 'Green', value: '#C5E1A5' },
  { name: 'Blue', value: '#BBDEFB' },
  { name: 'Pink', value: '#F8BBD0' },
  { name: 'Orange', value: '#FFE082' }
];

export default function AnnotationTools({ 
  selectedAnnotationType, 
  onAnnotationTypeChange,
  selectedColor,
  onColorChange,
  onClearAnnotations
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/95 backdrop-blur-sm border rounded-lg shadow-lg p-3"
    >
      <div className="flex items-center gap-2 flex-wrap">
        {/* Annotation Type Buttons */}
        <Button
          size="sm"
          variant={selectedAnnotationType === 'highlight' ? 'default' : 'outline'}
          onClick={() => onAnnotationTypeChange('highlight')}
          className="gap-2"
        >
          <Highlighter className="w-4 h-4" />
          <span className="hidden sm:inline">Highlight</span>
        </Button>

        <Button
          size="sm"
          variant={selectedAnnotationType === 'underline' ? 'default' : 'outline'}
          onClick={() => onAnnotationTypeChange('underline')}
          className="gap-2"
        >
          <Underline className="w-4 h-4" />
          <span className="hidden sm:inline">Underline</span>
        </Button>

        <Button
          size="sm"
          variant={selectedAnnotationType === 'note' ? 'default' : 'outline'}
          onClick={() => onAnnotationTypeChange('note')}
          className="gap-2"
        >
          <StickyNote className="w-4 h-4" />
          <span className="hidden sm:inline">Note</span>
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Color Picker */}
        {(selectedAnnotationType === 'highlight' || selectedAnnotationType === 'underline') && (
          <div className="flex items-center gap-1">
            {HIGHLIGHT_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => onColorChange(color.value)}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  selectedColor === color.value ? 'border-gray-800 scale-110' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        )}

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Clear Button */}
        <Button
          size="sm"
          variant="ghost"
          onClick={onClearAnnotations}
          className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Eraser className="w-4 h-4" />
          <span className="hidden sm:inline">Clear All</span>
        </Button>
      </div>
    </motion.div>
  );
}