import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, Volume2, BookOpen, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPageUrl } from '../utils';
import { loadBookManifest, getPageImageUrl } from '@/components/books/loadManifest';
import ColoringCanvas from '../components/coloring/ColoringCanvas';
import TextReader from '../components/books/TextReader';
import { base44 } from '@/api/base44Client';

export default function ManifestBookReader() {
  const [searchParams, setSearchParams] = useSearchParams();
  const bookId = searchParams.get('bookId');
  const pageId = searchParams.get('pageId');
  
  const [manifest, setManifest] = useState(null);
  const [currentPage, setCurrentPage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showColoring, setShowColoring] = useState(false);
  const [profileId, setProfileId] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [pageText, setPageText] = useState(null);

  // Load profile
  useEffect(() => {
    const savedProfileId = localStorage.getItem('currentProfileId');
    if (savedProfileId) setProfileId(savedProfileId);
  }, []);

  // Load manifest
  useEffect(() => {
    if (!bookId) return;
    
    setIsLoading(true);
    loadBookManifest(bookId)
      .then(m => {
        setManifest(m);
        const pages = [...m.pages].sort((a, b) => a.order - b.order);
        
        if (pageId) {
          const idx = pages.findIndex(p => p.id === pageId);
          if (idx >= 0) {
            setCurrentIndex(idx);
            setCurrentPage(pages[idx]);
          } else {
            setCurrentIndex(0);
            setCurrentPage(pages[0]);
          }
        } else {
          setCurrentIndex(0);
          setCurrentPage(pages[0]);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load manifest:', err);
        setIsLoading(false);
      });
  }, [bookId, pageId]);

  // Fetch audio and text for current page from Base44 Page entity, with manifest fallback
  useEffect(() => {
    if (!currentPage || !bookId) return;
    
    const fetchPageData = async () => {
      try {
        const pages = await base44.entities.Page.filter({ 
          book_id: bookId,
          page_number: currentPage.order 
        });
        
        if (pages.length > 0) {
          const dbPage = pages[0];
          const lang = manifest?.language === 'pt' ? 'pt' : 'en';
          const audioField = lang === 'pt' ? 'audio_narration_pt_url' : 'audio_narration_en_url';
          const textField = lang === 'pt' ? 'story_text_pt' : 'story_text_en';
          
          setAudioUrl(dbPage[audioField] || null);
          setPageText(dbPage[textField] || null);
        } else {
          // Fallback to manifest data if no database entry
          setAudioUrl(null);
          // Use text array from manifest if available
          const textContent = currentPage.text ? currentPage.text.join('\n\n') : null;
          setPageText(textContent);
        }
      } catch (error) {
        console.error('Error fetching page data:', error);
        // Fallback to manifest on error
        setAudioUrl(null);
        const textContent = currentPage.text ? currentPage.text.join('\n\n') : null;
        setPageText(textContent);
      }
    };
    
    fetchPageData();
  }, [currentPage, bookId, manifest]);

  const pages = manifest ? [...manifest.pages].sort((a, b) => a.order - b.order) : [];
  const prevPage = currentIndex > 0 ? pages[currentIndex - 1] : null;
  const nextPage = currentIndex < pages.length - 1 ? pages[currentIndex + 1] : null;

  const handlePrevious = () => {
    if (prevPage) {
      setCurrentIndex(currentIndex - 1);
      setCurrentPage(prevPage);
      setSearchParams({ bookId, pageId: prevPage.id });
    }
  };

  const handleNext = () => {
    if (nextPage) {
      setCurrentIndex(currentIndex + 1);
      setCurrentPage(nextPage);
      setSearchParams({ bookId, pageId: nextPage.id });
    }
  };

  const handlePlayAudio = () => {
    if (!audioUrl) return;
    
    const audio = new Audio(audioUrl);
    audio.play();
    setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
  };

  const handleOpenColoring = () => {
    if (currentPage?.type === 'color') {
      setShowColoring(true);
    }
  };

  const handleSaveColoring = async (data) => {
    if (!profileId) return;
    
    try {
      // Save to ColoredArtwork entity
      await base44.entities.ColoredArtwork.create({
        profile_id: profileId,
        book_id: bookId,
        page_id: currentPage.id,
        artwork_url: data.thumbnail_data,
        coloring_time_seconds: data.coloring_time,
        is_showcased: false
      });
      
      setShowColoring(false);
    } catch (error) {
      console.error('Error saving artwork:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (!manifest || !currentPage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-600 mb-4">Book not found</p>
        <Link to={createPageUrl('ManifestLibrary')}>
          <Button>Back to Library</Button>
        </Link>
      </div>
    );
  }

  const imageUrl = getPageImageUrl(manifest, currentPage.id);

  return (
    <>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{manifest.title}</h1>
            <p className="text-sm text-gray-600">{currentPage.label}</p>
          </div>
          <Link to={createPageUrl('ManifestLibrary')}>
            <Button variant="outline" size="sm">
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </Link>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="relative aspect-[3/4] bg-gray-100">
            {currentPage.type === 'text' && pageText ? (
              <TextReader
                text={pageText}
                audioUrl={audioUrl}
                language={manifest.language || 'en'}
                bookId={bookId}
                pageId={currentPage.id}
              />
            ) : (
              <img
                src={imageUrl}
                alt={currentPage.label}
                className="w-full h-full object-contain"
              />
            )}
          </div>

          {/* Controls */}
          <div className="p-6 border-t bg-gray-50">
            <div className="flex items-center justify-between gap-4">
              <Button
                onClick={handlePrevious}
                disabled={!prevPage}
                variant="outline"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="flex gap-2">
                {currentPage.type === 'color' && (
                  <Button
                    onClick={handleOpenColoring}
                    className="bg-gradient-to-r from-purple-500 to-pink-500"
                  >
                    <Palette className="w-4 h-4 mr-2" />
                    Start Coloring
                  </Button>
                )}
              </div>

              <Button
                onClick={handleNext}
                disabled={!nextPage}
                variant="outline"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Page Progress */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span>Page {currentIndex + 1} of {pages.length}</span>
                <span>{Math.round(((currentIndex + 1) / pages.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-orange-500 to-pink-500 h-2 rounded-full transition-all"
                  style={{ width: `${((currentIndex + 1) / pages.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coloring Canvas Modal */}
      {showColoring && currentPage.type === 'color' && (
        <ColoringCanvas
          pageId={currentPage.id}
          bookId={bookId}
          profileId={profileId}
          illustrationUrl={imageUrl}
          onSave={handleSaveColoring}
          onClose={() => setShowColoring(false)}
          lineArtUrl={imageUrl}
        />
      )}
    </>
  );
}