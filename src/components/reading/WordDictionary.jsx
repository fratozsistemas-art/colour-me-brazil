import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Volume2, BookOpen, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function WordDictionary({ word, language, context, onClose, position }) {
  const [definition, setDefinition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playingAudio, setPlayingAudio] = useState(false);

  React.useEffect(() => {
    if (word) {
      fetchDefinition();
    }
  }, [word]);

  const fetchDefinition = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('getWordDefinition', {
        word,
        language,
        context
      });

      if (response.data.success) {
        setDefinition(response.data);
      } else {
        toast.error('Failed to load definition');
        onClose();
      }
    } catch (error) {
      console.error('Error fetching definition:', error);
      toast.error('Failed to load definition');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const playPronunciation = async () => {
    if (!definition?.audioUrl) {
      toast.error('Audio not available');
      return;
    }

    setPlayingAudio(true);
    const audio = new Audio(definition.audioUrl);
    audio.onended = () => setPlayingAudio(false);
    audio.onerror = () => {
      setPlayingAudio(false);
      toast.error('Failed to play audio');
    };
    await audio.play();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        className="fixed z-50"
        style={{
          left: position?.x || '50%',
          top: position?.y || '50%',
          transform: position ? 'translate(0, 10px)' : 'translate(-50%, -50%)',
          maxWidth: '90vw',
          width: '400px'
        }}
      >
        <Card className="p-4 shadow-2xl border-2 border-purple-200 bg-white">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-bold text-gray-800">
                {word}
              </h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            </div>
          ) : definition ? (
            <div className="space-y-3">
              {/* Pronunciation */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 italic">
                  /{definition.pronunciation}/
                </span>
                {definition.audioUrl && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={playPronunciation}
                    disabled={playingAudio}
                    className="h-7 w-7 p-0"
                  >
                    <Volume2 className={`w-4 h-4 ${playingAudio ? 'animate-pulse' : ''}`} />
                  </Button>
                )}
                {definition.partOfSpeech && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                    {definition.partOfSpeech}
                  </span>
                )}
              </div>

              {/* Definition */}
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-sm text-gray-800 leading-relaxed">
                  {definition.definition}
                </p>
              </div>

              {/* Example */}
              {definition.example && (
                <div className="border-l-4 border-purple-300 pl-3">
                  <p className="text-xs text-gray-500 mb-1">Example:</p>
                  <p className="text-sm text-gray-700 italic">
                    "{definition.example}"
                  </p>
                </div>
              )}

              {/* Synonyms */}
              {definition.synonyms && definition.synonyms.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Similar words:</p>
                  <div className="flex flex-wrap gap-1">
                    {definition.synonyms.map((synonym, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                      >
                        {synonym}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Cached indicator */}
              {definition.cached && (
                <p className="text-xs text-gray-400 text-center">
                  ✓ Saved in your dictionary
                </p>
              )}
            </div>
          ) : null}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}