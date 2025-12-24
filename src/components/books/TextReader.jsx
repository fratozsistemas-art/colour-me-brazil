import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, Volume2, Type, Minus, Plus, Moon, Sun, Bookmark, BookmarkCheck, Highlighter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import WordDictionary from '../reading/WordDictionary';
import AnnotationTools from '../reading/AnnotationTools';

export default function TextReader({ 
  text, 
  audioUrl,
  language = 'en',
  bookId,
  pageId,
  onClose 
}) {
  const [profile, setProfile] = useState(null);
  const [fontSize, setFontSize] = useState(20);
  const [lineSpacing, setLineSpacing] = useState('normal');
  const [darkMode, setDarkMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [bgColor, setBgColor] = useState('white');
  const [generatingTTS, setGeneratingTTS] = useState(false);
  const [customAudioUrl, setCustomAudioUrl] = useState(audioUrl);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedText, setSelectedText] = useState('');
  const [bookmarks, setBookmarks] = useState([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [wordPosition, setWordPosition] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [annotationType, setAnnotationType] = useState('highlight');
  const [annotationColor, setAnnotationColor] = useState('#FFF59D');
  const [showAnnotationTools, setShowAnnotationTools] = useState(false);
  const audioRef = useRef(null);
  const textRef = useRef(null);

  // Load profile and preferences
  useEffect(() => {
    const loadProfile = async () => {
      const profileId = localStorage.getItem('currentProfileId');
      if (!profileId) return;

      try {
        const profiles = await base44.entities.UserProfile.list();
        const userProfile = profiles.find(p => p.id === profileId);
        if (userProfile) {
          setProfile(userProfile);
          
          // Apply accessibility preferences
          const fontSizes = { small: 16, medium: 20, large: 24, 'extra-large': 28 };
          setFontSize(fontSizes[userProfile.font_size_preference] || 20);
          setLineSpacing(userProfile.line_spacing_preference || 'normal');
          setBgColor(userProfile.background_color_preference || 'white');
          setHighContrast(userProfile.high_contrast_mode || false);
          setDarkMode(userProfile.background_color_preference === 'night');
          
          if (bookId && pageId && userProfile.bookmarks) {
            const key = `${bookId}_${pageId}`;
            setBookmarks(userProfile.bookmarks[key] || []);
          }

          // Load annotations
          if (bookId && pageId) {
            loadAnnotations();
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };
    loadProfile();
  }, [bookId, pageId]);

  // Generate TTS audio if not available
  const handleGenerateTTS = async () => {
    if (!profile) return;
    
    setGeneratingTTS(true);
    try {
      const response = await base44.functions.invoke('generateTTSAudio', {
        text,
        language,
        voice_preference: profile.tts_voice_preference || 'default',
        speed: profile.tts_speed || 1.0
      });

      if (response.data.success) {
        setCustomAudioUrl(response.data.audio_url);
        toast.success('Áudio gerado com sucesso!');
      }
    } catch (error) {
      toast.error('Erro ao gerar áudio');
    } finally {
      setGeneratingTTS(false);
    }
  };

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

  // Load annotations
  const loadAnnotations = async () => {
    if (!profile || !bookId || !pageId) return;
    
    try {
      const existingAnnotations = await base44.entities.TextAnnotation.filter({
        profile_id: profile.id,
        book_id: bookId,
        page_id: pageId
      });
      setAnnotations(existingAnnotations);
    } catch (error) {
      console.error('Failed to load annotations:', error);
    }
  };

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

  // Word click handler for dictionary
  const handleWordClick = (e) => {
    if (e.target.tagName === 'SPAN' && e.target.classList.contains('word')) {
      const word = e.target.textContent.trim();
      const rect = e.target.getBoundingClientRect();
      
      setSelectedWord(word);
      setWordPosition({
        x: rect.left + rect.width / 2,
        y: rect.bottom
      });
    }
  };

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

  const handleAnnotate = async () => {
    if (!selectedText || !profile) return;

    try {
      const annotation = await base44.entities.TextAnnotation.create({
        profile_id: profile.id,
        book_id: bookId,
        page_id: pageId,
        text_content: selectedText,
        annotation_type: annotationType,
        color: annotationType === 'note' ? null : annotationColor
      });

      setAnnotations([...annotations, annotation]);
      toast.success(`${annotationType} added!`);
      setSelectedText('');
      window.getSelection().removeAllRanges();
    } catch (error) {
      console.error('Error saving annotation:', error);
      toast.error('Failed to save annotation');
    }
  };

  const handleClearAnnotations = async () => {
    if (!profile) return;

    try {
      for (const annotation of annotations) {
        await base44.entities.TextAnnotation.delete(annotation.id);
      }
      setAnnotations([]);
      toast.success('Annotations cleared');
    } catch (error) {
      console.error('Error clearing annotations:', error);
      toast.error('Failed to clear annotations');
    }
  };

  // Render text with annotations
  const renderAnnotatedText = () => {
    if (!text) return null;

    const words = text.split(/(\s+)/);
    
    return words.map((word, idx) => {
      if (!word.trim()) return word;
      
      const annotation = annotations.find(a => a.text_content.includes(word));
      const style = annotation ? {
        backgroundColor: annotation.annotation_type === 'highlight' ? annotation.color : 'transparent',
        textDecoration: annotation.annotation_type === 'underline' ? `underline 2px ${annotation.color}` : 'none',
        textDecorationThickness: '2px'
      } : {};

      return (
        <span
          key={idx}
          className="word cursor-pointer hover:bg-blue-100/30 transition-colors rounded px-0.5"
          style={style}
        >
          {word}
        </span>
      );
    });
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

  // Accessibility styles
  const lineHeights = {
    compact: '1.4',
    normal: '1.8',
    relaxed: '2.0',
    spacious: '2.4'
  };

  const bgStyles = {
    white: highContrast ? 'bg-white' : 'bg-gradient-to-br from-amber-50 to-orange-50',
    cream: highContrast ? 'bg-yellow-50' : 'bg-gradient-to-br from-yellow-50 to-amber-50',
    sepia: highContrast ? 'bg-amber-100' : 'bg-gradient-to-br from-amber-100 to-orange-100',
    night: 'bg-gradient-to-br from-gray-900 to-gray-800'
  };

  const textStyles = {
    white: highContrast ? 'text-black font-bold' : 'text-gray-800',
    cream: highContrast ? 'text-black font-bold' : 'text-gray-800',
    sepia: highContrast ? 'text-black font-bold' : 'text-gray-900',
    night: 'text-gray-100'
  };

  const cardStyles = {
    white: highContrast ? 'bg-white border-4 border-black' : 'bg-white/90',
    cream: highContrast ? 'bg-yellow-50 border-4 border-black' : 'bg-yellow-50/90',
    sepia: highContrast ? 'bg-amber-100 border-4 border-black' : 'bg-amber-100/90',
    night: 'bg-gray-800/95'
  };

  const bgClass = bgStyles[bgColor] || bgStyles.white;
  const cardBg = cardStyles[bgColor] || cardStyles.white;
  const textColor = textStyles[bgColor] || textStyles.white;
  const headerBg = bgColor === 'night' ? 'bg-gray-800/80' : 'bg-white/80';

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

          {/* Annotation Tools Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAnnotationTools(!showAnnotationTools)}
            title="Annotation Tools"
            className={showAnnotationTools ? 'bg-purple-100' : ''}
          >
            <Highlighter className="w-4 h-4" />
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

      {/* Annotation Tools */}
      <AnimatePresence>
        {showAnnotationTools && (
          <div className="px-6 pt-4">
            <AnnotationTools
              selectedAnnotationType={annotationType}
              onAnnotationTypeChange={setAnnotationType}
              selectedColor={annotationColor}
              onColorChange={setAnnotationColor}
              onClearAnnotations={handleClearAnnotations}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Text Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <Card className={`p-8 ${cardBg} backdrop-blur-sm shadow-lg relative`}>
            <div 
              ref={textRef}
              onClick={handleWordClick}
              className={`${textColor} whitespace-pre-wrap select-text`}
              style={{ 
                fontSize: `${fontSize}px`,
                lineHeight: lineHeights[lineSpacing] || '1.8',
                letterSpacing: highContrast ? '0.05em' : 'normal'
              }}
            >
              {renderAnnotatedText()}
            </div>

            {/* Selection Actions */}
            <AnimatePresence>
              {selectedText && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 flex gap-2"
                >
                  {showAnnotationTools ? (
                    <Button
                      onClick={handleAnnotate}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg"
                    >
                      <Highlighter className="w-4 h-4 mr-2" />
                      {annotationType === 'highlight' ? 'Highlight' : annotationType === 'underline' ? 'Underline' : 'Add Note'}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleBookmarkPassage}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg"
                    >
                      <Bookmark className="w-4 h-4 mr-2" />
                      Bookmark
                    </Button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Word Dictionary */}
            {selectedWord && (
              <WordDictionary
                word={selectedWord}
                language={language}
                context={text}
                onClose={() => setSelectedWord(null)}
                position={wordPosition}
              />
            )}
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
      {(customAudioUrl || audioUrl) && (
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
                {isPlaying ? 'Pausar' : 'Ouvir'} Áudio
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
              src={customAudioUrl || audioUrl}
              preload="metadata"
            />
          </div>
        </div>
      )}

      {/* Generate TTS button if no audio */}
      {!audioUrl && !customAudioUrl && profile && (
        <div className="p-4 bg-blue-50 border-t">
          <div className="max-w-3xl mx-auto text-center">
            <Button
              onClick={handleGenerateTTS}
              disabled={generatingTTS}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-500"
            >
              <Volume2 className="w-5 h-5 mr-2" />
              {generatingTTS ? 'Gerando Áudio...' : 'Gerar Leitura em Voz Alta'}
            </Button>
            <p className="text-xs text-gray-600 mt-2">
              Ouvir este texto com sua voz preferida
            </p>
          </div>
        </div>
      )}
    </div>
  );
}