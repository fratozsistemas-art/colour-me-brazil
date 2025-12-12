import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ChevronLeft, ChevronRight, X, Volume2, VolumeX, 
  Palette, Play, Pause, RotateCcw, Languages, CheckCircle2, Zap 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import InteractiveHotspot from './InteractiveHotspot';
import QuizModal from './QuizModal';
import InteractiveWord from './InteractiveWord';

export default function StoryReader({ 
  book, 
  pages, 
  currentPageIndex = 0,
  onClose,
  onColorPage,
  onPageChange,
  onBookComplete,
  preferredLanguage = 'en'
}) {
  const [pageIndex, setPageIndex] = useState(currentPageIndex);
  const [language, setLanguage] = useState(preferredLanguage);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentWord, setCurrentWord] = useState(-1);
  const audioRef = useRef(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [showCompleteButton, setShowCompleteButton] = useState(false);
  const [interactiveElements, setInteractiveElements] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswered, setQuizAnswered] = useState(false);

  const currentPage = pages[pageIndex];

  useEffect(() => {
    // Reset audio when page changes
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentWord(-1);
    }
    
    // Load interactive elements and quizzes for current page
    loadInteractiveElements();
    loadQuizzes();
    setQuizAnswered(false);
  }, [pageIndex]);
  
  const loadInteractiveElements = async () => {
    try {
      const elements = await base44.entities.InteractiveElement.filter({
        page_id: currentPage.id
      });
      setInteractiveElements(elements || []);
    } catch (error) {
      console.log('No interactive elements for this page');
      setInteractiveElements([]);
    }
  };
  
  const loadQuizzes = async () => {
    try {
      const pageQuizzes = await base44.entities.Quiz.filter({
        page_id: currentPage.id
      });
      setQuizzes(pageQuizzes || []);
      if (pageQuizzes && pageQuizzes.length > 0) {
        setCurrentQuiz(pageQuizzes[0]);
      } else {
        setCurrentQuiz(null);
      }
    } catch (error) {
      console.log('No quiz for this page');
      setQuizzes([]);
      setCurrentQuiz(null);
    }
  };

  useEffect(() => {
    // Load and potentially auto-play audio
    if (currentPage) {
      const audioUrl = language === 'en' 
        ? currentPage.audio_narration_en_url 
        : currentPage.audio_narration_pt_url;
      
      if (audioUrl && audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.playbackRate = playbackSpeed;
      }
    }
  }, [currentPage, language, playbackSpeed]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleAudioTimeUpdate = () => {
    if (!audioRef.current) return;
    const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
    setAudioProgress(progress || 0);

    // Text highlighting based on progress
    const text = language === 'en' ? currentPage.story_text_en : currentPage.story_text_pt;
    const words = text?.split(' ') || [];
    
    if (words.length > 0 && audioRef.current.duration > 0) {
      const wordIndex = Math.floor((audioRef.current.currentTime / audioRef.current.duration) * words.length);
      // Clamp wordIndex to valid range
      setCurrentWord(Math.min(wordIndex, words.length - 1));
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setAudioProgress(100);
    
    // Highlight last word briefly before clearing
    const text = language === 'en' ? currentPage.story_text_en : currentPage.story_text_pt;
    const words = text?.split(' ') || [];
    if (words.length > 0) {
      setCurrentWord(words.length - 1);
      setTimeout(() => setCurrentWord(-1), 500);
    } else {
      setCurrentWord(-1);
    }
  };

  const restartAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentWord(-1);
      setAudioProgress(0);
    }
  };

  const nextPage = () => {
    if (pageIndex < pages.length - 1) {
      const newIndex = pageIndex + 1;
      setPageIndex(newIndex);
      if (onPageChange) onPageChange(newIndex);
      
      // Show complete button on last page
      if (newIndex === pages.length - 1) {
        setShowCompleteButton(true);
      }
    }
  };

  const prevPage = () => {
    if (pageIndex > 0) {
      const newIndex = pageIndex - 1;
      setPageIndex(newIndex);
      if (onPageChange) onPageChange(newIndex);
      setShowCompleteButton(false);
    }
  };

  const handleCompleteBook = () => {
    if (onBookComplete) onBookComplete();
    onClose();
  };

  // Check if we're on the last page on mount
  useEffect(() => {
    if (pageIndex === pages.length - 1) {
      setShowCompleteButton(true);
    }
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'pt' : 'en');
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };
  
  const changePlaybackSpeed = () => {
    const speeds = [0.75, 1, 1.25, 1.5];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };
  
  const handleShowQuiz = () => {
    if (currentQuiz && !quizAnswered) {
      setShowQuiz(true);
    }
  };
  
  const handleQuizComplete = (result) => {
    setQuizAnswered(true);
  };

  const [wordDefinitions, setWordDefinitions] = useState([]);

  useEffect(() => {
    loadWordDefinitions();
  }, []);

  const loadWordDefinitions = async () => {
    try {
      const definitions = await base44.entities.WordDefinition.list();
      setWordDefinitions(definitions || []);
    } catch (error) {
      console.log('No word definitions available');
      setWordDefinitions([]);
    }
  };

  const getWordDefinition = (word) => {
    const cleanWord = word.toLowerCase().replace(/[.,!?;:]/g, '');
    return wordDefinitions.find(
      def => def.word_en?.toLowerCase() === cleanWord || def.word_pt?.toLowerCase() === cleanWord
    );
  };

  const renderHighlightedText = () => {
    const text = language === 'en' ? currentPage.story_text_en : currentPage.story_text_pt;
    if (!text) return null;

    const words = text.split(' ');
    return (
      <p className="text-lg md:text-xl leading-relaxed">
        {words.map((word, index) => {
          const definition = getWordDefinition(word);
          
          return definition ? (
            <InteractiveWord
              key={index}
              word={language === 'en' ? definition.word_en : definition.word_pt}
              definition={language === 'en' ? definition.definition_en : definition.definition_pt}
              culturalContext={language === 'en' ? definition.cultural_context_en : definition.cultural_context_pt}
              language={language}
            >
              <motion.span
                animate={{
                  backgroundColor: index === currentWord ? 'rgba(255, 223, 0, 0.4)' : 'transparent'
                }}
                transition={{ duration: 0.3 }}
                className="inline-block px-1 rounded"
              >
                {word}
              </motion.span>
            </InteractiveWord>
          ) : (
            <motion.span
              key={index}
              animate={{
                backgroundColor: index === currentWord ? 'rgba(255, 223, 0, 0.4)' : 'transparent'
              }}
              transition={{ duration: 0.3 }}
              className="inline-block px-1 rounded"
            >
              {word}{' '}
            </motion.span>
          );
        })}
      </p>
    );
  };

  if (!currentPage) {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
        <Card className="p-8">
          <p className="text-gray-600">No pages available for this book.</p>
          <Button onClick={onClose} className="mt-4">Close</Button>
        </Card>
      </div>
    );
  }

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
                {language === 'en' ? book.title_en : book.title_pt}
              </h2>
              <p className="text-gray-400 text-sm">
                Page {pageIndex + 1} of {pages.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentQuiz && !quizAnswered && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleShowQuiz}
                className="text-white border-white/20 animate-pulse"
              >
                <Zap className="w-4 h-4 mr-2" />
                Quiz
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="text-white border-white/20"
            >
              <Languages className="w-4 h-4 mr-2" />
              {language === 'en' ? '🇺🇸 EN' : '🇧🇷 PT'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Illustration */}
        <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-gray-800 to-gray-900">
          <motion.div
            key={pageIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="relative max-w-2xl w-full aspect-square"
          >
            {currentPage.illustration_url ? (
              <div className="relative w-full h-full">
                <img
                  src={currentPage.illustration_url}
                  alt={`Page ${pageIndex + 1}`}
                  className="w-full h-full object-contain rounded-xl shadow-2xl"
                />
                
                {/* Interactive Hotspots */}
                {interactiveElements.map((element, index) => (
                  <InteractiveHotspot
                    key={index}
                    element={element}
                    language={language}
                    onInteract={() => console.log('Interacted with:', element)}
                  />
                ))}
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center">
                <p className="text-gray-400 text-lg">Illustration coming soon...</p>
              </div>
            )}
            
            {/* Color This Page Button */}
            <Button
              onClick={() => onColorPage(currentPage)}
              className="absolute bottom-4 right-4 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-xl"
            >
              <Palette className="w-4 h-4 mr-2" />
              Color This Page
            </Button>
            
            {/* Quiz Modal */}
            <AnimatePresence>
              {showQuiz && currentQuiz && (
                <QuizModal
                  quiz={currentQuiz}
                  language={language}
                  profileId={book.profileId}
                  onComplete={handleQuizComplete}
                  onClose={() => setShowQuiz(false)}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Story Text & Controls */}
        <div className="w-full md:w-96 bg-white flex flex-col">
          {/* Audio Controls */}
          <div className="border-b p-4 bg-gray-50">
            <div className="flex items-center gap-2 mb-3">
              <Button
                variant="outline"
                size="icon"
                onClick={togglePlayPause}
                className="bg-white"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={restartAudio}
                className="bg-white"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsMuted(!isMuted)}
                className="bg-white"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={changePlaybackSpeed}
                className="bg-white px-3 font-semibold"
                title="Playback speed"
              >
                {playbackSpeed}x
              </Button>
              
              {/* Progress Bar */}
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                  style={{ width: `${audioProgress}%` }}
                />
              </div>
            </div>
            
            <audio
              ref={audioRef}
              onTimeUpdate={handleAudioTimeUpdate}
              onEnded={handleAudioEnded}
              muted={isMuted}
            />
          </div>

          {/* Story Text */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${pageIndex}-${language}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderHighlightedText()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="border-t p-4 bg-gray-50">
            {showCompleteButton && (
              <Button
                onClick={handleCompleteBook}
                className="w-full mb-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark Book as Completed
              </Button>
            )}
            
            <div className="flex items-center justify-between mb-3">
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
                    onClick={() => {
                      setPageIndex(idx);
                      if (onPageChange) onPageChange(idx);
                      setShowCompleteButton(idx === pages.length - 1);
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === pageIndex
                        ? 'bg-green-600 w-6'
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
      </div>
    </div>
  );
}