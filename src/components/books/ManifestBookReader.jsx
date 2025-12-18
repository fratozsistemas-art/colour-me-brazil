import React, { useState, useEffect } from 'react';
import { loadBookManifest, getStoryPages, getColoringPages, getBookAssetUrl } from './manifestLoader';
import ReaderText from './ReaderText';
import ColoringCanvas from '../coloring/ColoringCanvas';
import { Button } from '@/components/ui/button';
import { Book, Palette, Loader2 } from 'lucide-react';

/**
 * Main reader component that handles manifest-based books
 * Switches between ReaderText and ColoringCanvas based on page type
 */
export default function ManifestBookReader({
  bookSlug,
  profileId,
  onClose,
  onSaveProgress,
  language = 'en'
}) {
  const [manifest, setManifest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMode, setCurrentMode] = useState('story'); // 'story' or 'coloring'
  const [storyPageIndex, setStoryPageIndex] = useState(0);
  const [selectedColoringPage, setSelectedColoringPage] = useState(null);

  useEffect(() => {
    loadManifest();
  }, [bookSlug]);

  const loadManifest = async () => {
    try {
      setLoading(true);
      const data = await loadBookManifest(bookSlug);
      setManifest(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleColorPage = (page) => {
    setSelectedColoringPage(page);
    setCurrentMode('coloring');
  };

  const handleSaveColoring = (data) => {
    if (onSaveProgress) {
      onSaveProgress({
        type: 'coloring',
        pageId: selectedColoringPage.pageId,
        ...data
      });
    }
    setSelectedColoringPage(null);
    setCurrentMode('story');
  };

  const handleStoryPageChange = (index) => {
    setStoryPageIndex(index);
    if (onSaveProgress) {
      onSaveProgress({
        type: 'reading',
        pageIndex: index
      });
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p>Loading book...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 max-w-md">
          <h3 className="text-xl font-bold text-red-600 mb-4">Error Loading Book</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    );
  }

  if (!manifest) return null;

  const storyPages = getStoryPages(manifest);
  const coloringPages = getColoringPages(manifest);

  // Show coloring canvas if a coloring page is selected
  if (currentMode === 'coloring' && selectedColoringPage) {
    const lineArtUrl = getBookAssetUrl(bookSlug, selectedColoringPage.lineArtImage);
    
    return (
      <ColoringCanvas
        pageId={selectedColoringPage.pageId}
        bookId={bookSlug}
        profileId={profileId}
        lineArtUrl={lineArtUrl}
        bookData={{ title: manifest.title[language] || manifest.title.en }}
        onSave={handleSaveColoring}
        onClose={() => {
          setSelectedColoringPage(null);
          setCurrentMode('story');
        }}
      />
    );
  }

  // Show story reader
  return (
    <>
      <ReaderText
        manifest={manifest}
        bookSlug={bookSlug}
        pages={storyPages}
        currentPageIndex={storyPageIndex}
        onClose={onClose}
        onPageChange={handleStoryPageChange}
        language={language}
      />

      {/* Coloring Pages Quick Access */}
      {coloringPages.length > 0 && (
        <div className="fixed bottom-24 right-8 z-50">
          <Button
            onClick={() => {
              // Show first coloring page, or cycle through them
              const nextPage = coloringPages[0];
              handleColorPage(nextPage);
            }}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-xl"
          >
            <Palette className="w-4 h-4 mr-2" />
            Color Pages ({coloringPages.length})
          </Button>
        </div>
      )}
    </>
  );
}