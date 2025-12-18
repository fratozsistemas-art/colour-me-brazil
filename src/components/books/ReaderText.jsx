import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, Languages, Type, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReaderText({ 
  manifest,
  bookSlug,
  pages,
  currentPageIndex = 0,
  onClose,
  onPageChange,
  language = 'en'
}) {
  const [pageIndex, setPageIndex] = useState(currentPageIndex);
  const [viewMode, setViewMode] = useState('text'); // 'text' or 'image'
  const [fontSize, setFontSize] = useState('medium');
  const [backgroundColor, setBackgroundColor] = useState('white');

  const currentPage = pages[pageIndex];

  useEffect(() => {
    if (onPageChange) onPageChange(pageIndex);
  }, [pageIndex]);

  const nextPage = () => {
    if (pageIndex < pages.length - 1) {
      setPageIndex(pageIndex + 1);
    }
  };

  const prevPage = () => {
    if (pageIndex > 0) {
      setPageIndex(pageIndex - 1);
    }
  };

  const getFontSizeClass = () => {
    switch(fontSize) {
      case 'small': return 'text-sm md:text-base';
      case 'medium': return 'text-base md:text-lg';
      case 'large': return 'text-lg md:text-xl';
      case 'extra-large': return 'text-xl md:text-2xl';
      default: return 'text-base md:text-lg';
    }
  };

  const getBackgroundClass = () => {
    switch(backgroundColor) {
      case 'white': return 'bg-white text-gray-900';
      case 'cream': return 'bg-yellow-50 text-gray-900';
      case 'sepia': return 'bg-amber-50 text-gray-900';
      case 'night': return 'bg-gray-900 text-gray-100';
      default: return 'bg-white text-gray-900';
    }
  };

  const renderTextContent = () => {
    if (!currentPage || !currentPage.text) return null;
    
    const textContent = currentPage.text[language] || currentPage.text.en || '';
    
    return (
      <div className={`${getFontSizeClass()} leading-relaxed whitespace-pre-wrap`}>
        {textContent}
      </div>
    );
  };

  if (!currentPage) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 to-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-gray-700 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white">
              <X className="w-6 h-6" />
            </Button>
            <div>
              <h2 className="text-white font-bold text-lg">
                {manifest.title[language] || manifest.title.en}
              </h2>
              <p className="text-gray-400 text-sm">
                Page {pageIndex + 1} of {pages.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            {currentPage.imageFallback && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'text' ? 'image' : 'text')}
                className="text-white border-white/20"
                title={viewMode === 'text' ? 'Show image' : 'Show text'}
              >
                {viewMode === 'text' ? <ImageIcon className="w-4 h-4" /> : <Type className="w-4 h-4" />}
              </Button>
            )}

            {/* Font Size Control */}
            {viewMode === 'text' && (
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="text-sm bg-white/10 text-white border border-white/20 rounded px-2 py-1"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="extra-large">Extra Large</option>
              </select>
            )}

            {/* Background Color Toggle */}
            {viewMode === 'text' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const colors = ['white', 'cream', 'sepia', 'night'];
                  const currentIndex = colors.indexOf(backgroundColor);
                  const nextIndex = (currentIndex + 1) % colors.length;
                  setBackgroundColor(colors[nextIndex]);
                }}
                className="text-white border-white/20"
                title="Change background"
              >
                {backgroundColor === 'night' ? '☀️' : '🌙'}
              </Button>
            )}

            {/* Language Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // This would need to be passed up to parent component
                // For now, just showing the button
              }}
              className="text-white border-white/20"
            >
              <Languages className="w-4 h-4 mr-2" />
              {language.toUpperCase()}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 overflow-hidden ${viewMode === 'text' ? getBackgroundClass() : 'bg-gray-800'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${pageIndex}-${viewMode}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full overflow-y-auto"
          >
            {viewMode === 'text' ? (
              <div className="container mx-auto max-w-3xl p-8">
                {renderTextContent()}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-8">
                <img
                  src={`/assets/books/${bookSlug}/${currentPage.imageFallback}`}
                  alt={`Page ${pageIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className={`border-t p-4 ${viewMode === 'text' && backgroundColor === 'night' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50'}`}>
        <div className="container mx-auto flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prevPage}
            disabled={pageIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {/* Page Dots */}
          <div className="flex gap-1">
            {pages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setPageIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === pageIndex
                    ? 'bg-blue-600 w-6'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          <Button
            variant="outline"
            onClick={nextPage}
            disabled={pageIndex === pages.length - 1}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}