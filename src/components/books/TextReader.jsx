import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, Volume2, Type, Minus, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TextReader({ 
  text, 
  audioUrl,
  language = 'en',
  onClose 
}) {
  const [fontSize, setFontSize] = useState(18);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

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

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header Controls */}
      <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="flex items-center gap-2">
          <Type className="w-5 h-5 text-orange-600" />
          <span className="font-semibold text-gray-800">Story Text</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Font Size Controls */}
          <Button
            variant="outline"
            size="sm"
            onClick={decreaseFontSize}
            disabled={fontSize <= 12}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium text-gray-600 w-12 text-center">
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
          <Card className="p-8 bg-white/90 backdrop-blur-sm shadow-lg">
            <p 
              className="leading-relaxed text-gray-800 whitespace-pre-wrap"
              style={{ fontSize: `${fontSize}px` }}
            >
              {text}
            </p>
          </Card>
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