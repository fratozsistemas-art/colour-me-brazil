import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, Trash2, Play, Pause, Languages } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import ParentAudioRecorder from './ParentAudioRecorder';

export default function ParentAudioManager({ book, onClose }) {
  const [pages, setPages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [playingAudio, setPlayingAudio] = useState(null);
  const audioRef = React.useRef(null);

  useEffect(() => {
    loadPages();
  }, [book.id]);

  const loadPages = async () => {
    setIsLoading(true);
    try {
      const bookPages = await base44.entities.Page.filter({ book_id: book.id });
      const sortedPages = bookPages.sort((a, b) => a.page_number - b.page_number);
      setPages(sortedPages);
    } catch (error) {
      console.error('Error loading pages:', error);
      toast.error('Failed to load pages');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRecording = async (page, language) => {
    if (!confirm('Are you sure you want to delete this recording?')) return;

    try {
      const audioField = language === 'pt' ? 'parent_audio_pt_url' : 'parent_audio_en_url';
      await base44.entities.Page.update(page.id, {
        [audioField]: null,
        parent_audio_recorded_by: null
      });

      toast.success('Recording deleted');
      loadPages();
    } catch (error) {
      console.error('Error deleting recording:', error);
      toast.error('Failed to delete recording');
    }
  };

  const handlePlayAudio = (audioUrl, pageId) => {
    if (playingAudio === pageId) {
      audioRef.current?.pause();
      setPlayingAudio(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setPlayingAudio(pageId);
      }
    }
  };

  const hasRecording = (page, lang) => {
    return lang === 'pt' ? page.parent_audio_pt_url : page.parent_audio_en_url;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <audio
        ref={audioRef}
        onEnded={() => setPlayingAudio(null)}
        className="hidden"
      />

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">
            Record Your Voice for "{book.title_en}"
          </h3>
          <p className="text-gray-600 mt-1">
            Record narration for each page so your child can hear your voice while reading
          </p>
        </div>
        <Button onClick={onClose} variant="outline">
          Close
        </Button>
      </div>

      {/* Language Toggle */}
      <Card className="p-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="flex items-center gap-4">
          <Languages className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-semibold text-gray-700">Recording Language:</span>
          <div className="flex gap-2">
            <Button
              onClick={() => setSelectedLanguage('en')}
              variant={selectedLanguage === 'en' ? 'default' : 'outline'}
              size="sm"
            >
              🇺🇸 English
            </Button>
            <Button
              onClick={() => setSelectedLanguage('pt')}
              variant={selectedLanguage === 'pt' ? 'default' : 'outline'}
              size="sm"
            >
              🇧🇷 Portuguese
            </Button>
          </div>
        </div>
      </Card>

      {/* Pages List */}
      <div className="grid gap-4">
        {pages.map((page) => {
          const hasEnRecording = hasRecording(page, 'en');
          const hasPtRecording = hasRecording(page, 'pt');
          const currentLangRecording = hasRecording(page, selectedLanguage);
          const isPlaying = playingAudio === `${page.id}-${selectedLanguage}`;

          return (
            <Card key={page.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-bold text-gray-800">
                      Page {page.page_number}
                    </span>
                    {hasEnRecording && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        🇺🇸 EN
                      </span>
                    )}
                    {hasPtRecording && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        🇧🇷 PT
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {selectedLanguage === 'en' ? page.story_text_en : page.story_text_pt}
                  </p>
                </div>

                <div className="flex gap-2 ml-4">
                  {currentLangRecording ? (
                    <>
                      <Button
                        onClick={() => handlePlayAudio(
                          currentLangRecording,
                          `${page.id}-${selectedLanguage}`
                        )}
                        variant="outline"
                        size="sm"
                      >
                        {isPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        onClick={() => setSelectedPage({ page, language: selectedLanguage })}
                        variant="outline"
                        size="sm"
                        title="Re-record"
                      >
                        <Mic className="w-4 h-4 text-orange-500" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteRecording(page, selectedLanguage)}
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => setSelectedPage({ page, language: selectedLanguage })}
                      className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                      size="sm"
                    >
                      <Mic className="w-4 h-4 mr-2" />
                      Record
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recording Modal */}
      {selectedPage && (
        <ParentAudioRecorder
          page={selectedPage.page}
          book={book}
          language={selectedPage.language}
          onClose={() => setSelectedPage(null)}
          onSave={() => {
            setSelectedPage(null);
            loadPages();
          }}
        />
      )}
    </div>
  );
}