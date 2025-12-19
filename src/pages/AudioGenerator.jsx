import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Volume2, CheckCircle2, AlertCircle, Loader2, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import VoiceSelector from '../components/tts/VoiceSelector';

export default function AudioGenerator() {
  const [selectedBook, setSelectedBook] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedVoiceEn, setSelectedVoiceEn] = useState('21m00Tcm4TlvDq8ikWAM');
  const [selectedVoicePt, setSelectedVoicePt] = useState('XrExE9yKIg1WjnnlVkGX');
  const [voiceSettingsEn, setVoiceSettingsEn] = useState({});
  const [voiceSettingsPt, setVoiceSettingsPt] = useState({});
  
  const queryClient = useQueryClient();

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          base44.auth.redirectToLogin(window.location.pathname);
          return;
        }
      } catch (error) {
        base44.auth.redirectToLogin(window.location.pathname);
      }
    };
    checkAuth();
  }, []);

  // Fetch books
  const { data: books = [], isLoading: booksLoading } = useQuery({
    queryKey: ['books'],
    queryFn: () => base44.entities.Book.list('order_index'),
  });

  // Fetch pages for selected book
  const { data: pages = [], refetch: refetchPages } = useQuery({
    queryKey: ['pages', selectedBook?.id],
    queryFn: () => base44.entities.Page.filter({ book_id: selectedBook.id }),
    enabled: !!selectedBook,
  });

  const handleGenerateAudio = async () => {
    if (!selectedBook || pages.length === 0) return;

    setIsGenerating(true);
    setProgress([]);
    setCurrentPageIndex(0);
    setTotalPages(pages.length);

    const sortedPages = [...pages].sort((a, b) => a.page_number - b.page_number);

    for (let i = 0; i < sortedPages.length; i++) {
      const page = sortedPages[i];
      setCurrentPageIndex(i + 1);

      try {
        // Generate English audio
        let audioEnUrl = null;
        if (page.story_text_en) {
          setProgress(prev => [...prev, {
            pageNumber: page.page_number,
            status: 'generating',
            language: 'en',
            message: 'Generating English audio...'
          }]);

          const enResult = await base44.functions.invoke('generateSpeechElevenLabs', {
            text: page.story_text_en,
            language: 'en',
            voice_id: selectedVoiceEn,
            ...voiceSettingsEn
          });

          if (enResult.data?.audio_url) {
            audioEnUrl = enResult.data.audio_url;
            setProgress(prev => prev.map(p => 
              p.pageNumber === page.page_number && p.language === 'en'
                ? { ...p, status: 'success', message: 'English audio generated' }
                : p
            ));
          } else {
            throw new Error(enResult.data?.error || 'Failed to generate English audio');
          }
        }

        // Generate Portuguese audio
        let audioPtUrl = null;
        if (page.story_text_pt) {
          setProgress(prev => [...prev, {
            pageNumber: page.page_number,
            status: 'generating',
            language: 'pt',
            message: 'Generating Portuguese audio...'
          }]);

          const ptResult = await base44.functions.invoke('generateSpeechElevenLabs', {
            text: page.story_text_pt,
            language: 'pt',
            voice_id: selectedVoicePt,
            ...voiceSettingsPt
          });

          if (ptResult.data?.audio_url) {
            audioPtUrl = ptResult.data.audio_url;
            setProgress(prev => prev.map(p => 
              p.pageNumber === page.page_number && p.language === 'pt'
                ? { ...p, status: 'success', message: 'Portuguese audio generated' }
                : p
            ));
          } else {
            throw new Error(ptResult.data?.error || 'Failed to generate Portuguese audio');
          }
        }

        // Update page entity with audio URLs
        const updateData = {};
        if (audioEnUrl) updateData.audio_narration_en_url = audioEnUrl;
        if (audioPtUrl) updateData.audio_narration_pt_url = audioPtUrl;

        if (Object.keys(updateData).length > 0) {
          await base44.entities.Page.update(page.id, updateData);
          setProgress(prev => [...prev, {
            pageNumber: page.page_number,
            status: 'updated',
            language: 'both',
            message: 'Page updated successfully'
          }]);
        }

      } catch (error) {
        console.error('Error generating audio for page:', page.page_number, error);
        setProgress(prev => [...prev, {
          pageNumber: page.page_number,
          status: 'error',
          language: 'both',
          message: error.message || 'Failed to generate audio'
        }]);
      }
    }

    setIsGenerating(false);
    refetchPages();
    queryClient.invalidateQueries(['pages']);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'generating':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'updated':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Audio Generator</h1>
        <p className="text-gray-600">Generate AI narration for story pages</p>
      </div>

      {/* Book Selection */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Select a Book</h2>
        {booksLoading ? (
          <div className="text-center py-4">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map((book) => (
              <motion.button
                key={book.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedBook(book)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedBook?.id === book.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  {book.cover_image_url && (
                    <img
                      src={book.cover_image_url}
                      alt={book.title_en}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{book.title_en}</h3>
                    <p className="text-sm text-gray-500">{book.title_pt}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {book.page_count || 0} pages
                      </span>
                      {selectedBook?.id === book.id && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          Selected
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </Card>

      {/* Voice Configuration */}
      {selectedBook && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <VoiceSelector
              language="en"
              selectedVoiceId={selectedVoiceEn}
              onVoiceChange={setSelectedVoiceEn}
              voiceSettings={voiceSettingsEn}
              onSettingsChange={setVoiceSettingsEn}
              onPreview={async (voiceId, settings) => {
                const result = await base44.functions.invoke('generateSpeechElevenLabs', {
                  text: "Hello! This is a preview of the English voice for your story narration.",
                  language: 'en',
                  voice_id: voiceId,
                  ...settings
                });
                if (result.data?.audio_url) {
                  const audio = new Audio(result.data.audio_url);
                  audio.playbackRate = settings.speaking_rate || 1.0;
                  audio.play();
                }
              }}
            />
            <VoiceSelector
              language="pt"
              selectedVoiceId={selectedVoicePt}
              onVoiceChange={setSelectedVoicePt}
              voiceSettings={voiceSettingsPt}
              onSettingsChange={setVoiceSettingsPt}
              onPreview={async (voiceId, settings) => {
                const result = await base44.functions.invoke('generateSpeechElevenLabs', {
                  text: "Olá! Esta é uma prévia da voz em português para a narração da sua história.",
                  language: 'pt',
                  voice_id: voiceId,
                  ...settings
                });
                if (result.data?.audio_url) {
                  const audio = new Audio(result.data.audio_url);
                  audio.playbackRate = settings.speaking_rate || 1.0;
                  audio.play();
                }
              }}
            />
          </div>

          {/* Pages Preview and Generate Button */}
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Pages</h2>
              <p className="text-sm text-gray-600">
                {pages.length} pages found for {selectedBook.title_en}
              </p>
            </div>
            <Button
              onClick={handleGenerateAudio}
              disabled={isGenerating || pages.length === 0}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating ({currentPageIndex}/{totalPages})
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 mr-2" />
                  Generate Audio for All Pages
                </>
              )}
            </Button>
          </div>

          {/* Pages List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {[...pages].sort((a, b) => a.page_number - b.page_number).map((page) => (
              <div
                key={page.id}
                className="p-3 bg-gray-50 rounded-lg flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-800">
                    Page {page.page_number}
                  </div>
                  <div className="flex gap-2 mt-1">
                    {page.audio_narration_en_url && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        EN Audio
                      </span>
                    )}
                    {page.audio_narration_pt_url && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        PT Audio
                      </span>
                    )}
                    {!page.audio_narration_en_url && !page.audio_narration_pt_url && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                        No Audio
                      </span>
                    )}
                  </div>
                </div>
                {page.story_text_en && (
                  <div className="text-xs text-gray-500">
                    {page.story_text_en.substring(0, 50)}...
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
        </>
      )}

      {/* Progress Log */}
      {progress.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Generation Progress</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {progress.map((item, index) => (
                <motion.div
                  key={`${item.pageNumber}-${item.language}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  {getStatusIcon(item.status)}
                  <div className="flex-1">
                    <span className="font-medium text-gray-800">
                      Page {item.pageNumber}
                    </span>
                    <span className="text-sm text-gray-600 ml-2">
                      ({item.language === 'en' ? 'English' : item.language === 'pt' ? 'Portuguese' : 'Both'})
                    </span>
                    <div className="text-sm text-gray-500">{item.message}</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {!isGenerating && progress.length > 0 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">
                ✓ Audio generation completed for all pages!
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}