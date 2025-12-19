import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, Volume2, Type, Minus, Plus, Moon, Sun, Bookmark, BookmarkCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function TextReader({ 
  text, 
  audioUrl,
  language = 'en',
  bookId,
  pageId,
  onClose 
}) {
  // Adaptive font size based on viewport
  const getInitialFontSize = () => {
    const width = window.innerWidth;
    if (width < 640) return 16; // mobile
    if (width < 1024) return 18; // tablet
    return 20; // desktop
  };

  const [fontSize, setFontSize] = useState(getInitialFontSize());
  const [darkMode, setDarkMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedText, setSelectedText] = useState('');
  const [bookmarks, setBookmarks] = useState([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const audioRef = useRef(null);
  const textRef = useRef(null);

  // Load bookmarks
  useEffect(() => {
    const loadBookmarks = async () => {
      const profileId = localStorage.getItem('currentProfileId');
      if (!profileId || !bookId || !pageId) return;

      try {
        const profiles = await base44.entities.UserProfile.list();
        const profile = profiles.find(p => p.id === profileId);
        if (profile?.bookmarks) {
          const key = `${bookId}_${pageId}`;
          setBookmarks(profile.bookmarks[key] || []);
        }
      } catch (error) {
        console.error('Error loading bookmarks:', error);
      }
    };
    loadBookmarks();
  }, [bookId, pageId]);

  // Adaptive font size on resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setFontSize(16);
      else if (width < 1024) setFontSize(18);
      else setFontSize(20);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Audio player
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Text selection handler
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection.toString().trim();
      if (text && textRef.current?.contains(selection.anchorNode)) {
        setSelectedText(text);
      } else {
        setSelectedText('');
      }
    };

    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    audio.currentTime = percentage * duration;
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 2, 32));
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 2, 12));
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleBookmarkPassage = async () => {
    if (!selectedText) return;

    const profileId = localStorage.getItem('currentProfileId');
    if (!profileId || !bookId || !pageId) {
      toast.error('Unable to save bookmark');
      return;
    }

    try {
      const profiles = await base44.entities.UserProfile.list();
      const profile = profiles.find(p => p.id === profileId);
      
      if (profile) {
        const key = `${bookId}_${pageId}`;
        const updatedBookmarks = { ...profile.bookmarks };
        const pageBookmarks = updatedBookmarks[key] || [];
        
        // Check if already bookmarked
        if (pageBookmarks.some(b => b.text === selectedText)) {
          toast.info('This passage is already bookmarked');
          return;
        }

        pageBookmarks.push({
          text: selectedText,
          timestamp: new Date().toISOString()
        });
        updatedBookmarks[key] = pageBookmarks;

        await base44.entities.UserProfile.update(profileId, {
          bookmarks: updatedBookmarks
        });

        setBookmarks(pageBookmarks);
        toast.success('Passage bookmarked!');
        setSelectedText('');
        window.getSelection().removeAllRanges();
      }
    } catch (error) {
      console.error('Error saving bookmark:', error);
      toast.error('Failed to save bookmark');
    }
  };

  const handleRemoveBookmark = async (bookmarkText) => {
    const profileId = localStorage.getItem('currentProfileId');
    if (!profileId || !bookId || !pageId) return;

    try {
      const profiles = await base44.entities.UserProfile.list();
      const profile = profiles.find(p => p.id === profileId);
      
      if (profile) {
        const key = `${bookId}_${pageId}`;
        const updatedBookmarks = { ...profile.bookmarks };
        const pageBookmarks = updatedBookmarks[key] || [];
        
        updatedBookmarks[key] = pageBookmarks.filter(b => b.text !== bookmarkText);

        await base44.entities.UserProfile.update(profileId, {
          bookmarks: updatedBookmarks
        });

        setBookmarks(updatedBookmarks[key]);
        toast.success('Bookmark removed');
      }
    } catch (error) {
      console.error('Error removing bookmark:', error);
      toast.error('Failed to remove bookmark');
    }
  };

  const bgClass = darkMode 
    ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
    : 'bg-gradient-to-br from-amber-50 to-orange-50';
  
  const cardBg = darkMode ? 'bg-gray-800/95' : 'bg-white/90';
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-800';
  const headerBg = darkMode ? 'bg-gray-800/80' : 'bg-white/80';

  return (
    <div className={`h-full flex flex-col ${bgClass} transition-colors duration-300`}>
      {/* Header Controls */}
      <div className={`flex items-center justify-between p-4 ${headerBg} backdrop-blur-sm border-b shadow-sm`}>
        <div className="flex items-center gap-2">
          <Type className="w-5 h-5 text-orange-600" />
          <span className={`font-semibold ${textColor}`}>Story Text</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Dark Mode Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleDarkMode}
            title="Toggle Dark Mode"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          {/* Bookmarks Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBookmarks(!showBookmarks)}
            title="View Bookmarks"
          >
            <Bookmark className="w-4 h-4" />
            {bookmarks.length > 0 && (
              <span className="ml-1 text-xs">({bookmarks.length})</span>
            )}
          </Button>

          {/* Font Size Controls */}
          <Button
            variant="outline"
            size="sm"
            onClick={decreaseFontSize}
            disabled={fontSize <= 12}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <span className={`text-sm font-medium ${textColor} w-12 text-center`}>
            {fontSize}px
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={increaseFontSize}
            disabled={fontSize >= 32}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Text Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <Card className={`p-8 ${cardBg} backdrop-blur-sm shadow-lg relative`}>
            <p 
              ref={textRef}
              className={`leading-relaxed ${textColor} whitespace-pre-wrap select-text`}
              style={{ 
                fontSize: `${fontSize}px`,
                lineHeight: '1.8'
              }}
            >
              {text}
            </p>

            {/* Bookmark Selection Tooltip */}
            <AnimatePresence>
              {selectedText && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50"
                >
                  <Button
                    onClick={handleBookmarkPassage}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg"
                  >
                    <Bookmark className="w-4 h-4 mr-2" />
                    Bookmark Selected Text
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Bookmarks Panel */}
          <AnimatePresence>
            {showBookmarks && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mt-4"
              >
                <Card className={`p-6 ${cardBg} backdrop-blur-sm shadow-lg`}>
                  <h3 className={`text-lg font-semibold ${textColor} mb-4 flex items-center gap-2`}>
                    <BookmarkCheck className="w-5 h-5 text-purple-500" />
                    Bookmarked Passages ({bookmarks.length})
                  </h3>
                  
                  {bookmarks.length === 0 ? (
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Select text in the story and click the bookmark button to save passages.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {bookmarks.map((bookmark, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`p-4 rounded-lg border ${
                            darkMode 
                              ? 'bg-gray-700/50 border-gray-600' 
                              : 'bg-white/50 border-gray-200'
                          }`}
                        >
                          <p className={`text-sm ${textColor} mb-2 italic`}>
                            "{bookmark.text}"
                          </p>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {new Date(bookmark.timestamp).toLocaleDateString()}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveBookmark(bookmark.text)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              Remove
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Audio Player */}
      {audioUrl && (
        <div className="p-4 bg-white/90 backdrop-blur-sm border-t shadow-lg">
          <div className="max-w-3xl mx-auto space-y-3">
            {/* Play/Pause Button */}
            <div className="flex items-center gap-4">
              <Button
                onClick={togglePlayPause}
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 mr-2" />
                ) : (
                  <Play className="w-5 h-5 mr-2" />
                )}
                {isPlaying ? 'Pause' : 'Play'} Audio
              </Button>

              <div className="flex-1 flex items-center gap-2 text-sm text-gray-600">
                <Volume2 className="w-4 h-4" />
                <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div 
              className="h-2 bg-gray-200 rounded-full cursor-pointer overflow-hidden"
              onClick={handleSeek}
            >
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-pink-500 transition-all"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>

            {/* Hidden Audio Element */}
            <audio
              ref={audioRef}
              src={audioUrl}
              preload="metadata"
            />
          </div>
        </div>
      )}
    </div>
  );
}