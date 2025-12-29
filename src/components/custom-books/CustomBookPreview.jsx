import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomBookPreview({ title, description, pages, profileId }) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const { data: books = [] } = useQuery({
    queryKey: ['books'],
    queryFn: () => base44.entities.Book.list()
  });

  const { data: artworks = [] } = useQuery({
    queryKey: ['artworks', profileId],
    queryFn: () => base44.entities.ColoredArtwork.filter({ profile_id: profileId }),
    enabled: !!profileId
  });

  const renderPageContent = (page) => {
    if (page.type === 'text') {
      return (
        <div className="flex items-center justify-center h-full p-8">
          <p className="text-lg text-gray-800 whitespace-pre-wrap">{page.custom_text}</p>
        </div>
      );
    }

    if (page.type === 'story') {
      const book = books.find(b => b.id === page.content_id);
      return (
        <div className="flex flex-col items-center justify-center h-full p-8">
          {book?.cover_image_url && (
            <img src={book.cover_image_url} alt={book.title_en} className="max-h-64 mb-4" />
          )}
          <h2 className="text-2xl font-bold mb-2">{book?.title_en}</h2>
          <p className="text-gray-600">{book?.subtitle_en}</p>
        </div>
      );
    }

    if (page.type === 'coloring' || page.type === 'artwork') {
      const artwork = artworks.find(a => a.id === page.content_id);
      return (
        <div className="flex items-center justify-center h-full">
          {artwork && (
            <img src={artwork.artwork_url} alt="Artwork" className="max-w-full max-h-full object-contain" />
          )}
        </div>
      );
    }

    return null;
  };

  const currentPage = pages[currentPageIndex];

  return (
    <div className="space-y-4">
      {/* Cover Page */}
      {currentPageIndex === 0 && (
        <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg p-12 text-center">
          <h1 className="text-4xl font-bold mb-4">{title}</h1>
          {description && (
            <p className="text-lg text-gray-700">{description}</p>
          )}
        </div>
      )}

      {/* Page Content */}
      {currentPageIndex > 0 && currentPageIndex <= pages.length && (
        <div className="bg-white rounded-lg border-2 border-gray-200 min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPageIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="h-full"
            >
              {renderPageContent(currentPage)}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
          disabled={currentPageIndex === 0}
          variant="outline"
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <span className="text-sm text-gray-600">
          Page {currentPageIndex} of {pages.length + 1}
        </span>

        <Button
          onClick={() => setCurrentPageIndex(Math.min(pages.length, currentPageIndex + 1))}
          disabled={currentPageIndex >= pages.length}
          variant="outline"
          className="gap-2"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}