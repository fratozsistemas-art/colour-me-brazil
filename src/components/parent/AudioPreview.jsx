import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export default function AudioPreview({ 
  parentAudioUrl, 
  aiAudioUrl, 
  mode = 'parent', // 'parent', 'ai', 'alternate'
  onModeChange 
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSource, setCurrentSource] = useState('parent');
  const audioRef = useRef(null);

  const handlePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Set source based on mode
      let sourceUrl = parentAudioUrl;
      if (mode === 'ai') {
        sourceUrl = aiAudioUrl;
      } else if (mode === 'alternate') {
        sourceUrl = currentSource === 'parent' ? parentAudioUrl : aiAudioUrl;
      }

      if (!sourceUrl) {
        toast.error('Audio not available');
        return;
      }

      audioRef.current.src = sourceUrl;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    
    // If in alternate mode, switch to the other audio
    if (mode === 'alternate') {
      if (currentSource === 'parent' && aiAudioUrl) {
        setCurrentSource('ai');
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.src = aiAudioUrl;
            audioRef.current.play();
            setIsPlaying(true);
          }
        }, 500);
      } else if (currentSource === 'ai') {
        setCurrentSource('parent');
      }
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      if (mode === 'alternate') {
        setCurrentSource('parent');
      }
      if (!isPlaying) {
        handlePlay();
      }
    }
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50">
      <audio
        ref={audioRef}
        onEnded={handleEnded}
        className="hidden"
      />

      <h4 className="font-semibold text-sm mb-3">Preview Audio</h4>
      
      {/* Mode Selection */}
      <div className="flex gap-2 mb-4">
        <Button
          onClick={() => onModeChange('parent')}
          variant={mode === 'parent' ? 'default' : 'outline'}
          size="sm"
          className="flex-1"
        >
          Parent Only
        </Button>
        {aiAudioUrl && (
          <>
            <Button
              onClick={() => onModeChange('ai')}
              variant={mode === 'ai' ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
            >
              AI Only
            </Button>
            <Button
              onClick={() => onModeChange('alternate')}
              variant={mode === 'alternate' ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
            >
              Alternate
            </Button>
          </>
        )}
      </div>

      {/* Current Playing */}
      {mode === 'alternate' && isPlaying && (
        <div className="mb-3 px-3 py-2 bg-white rounded-lg border border-purple-200">
          <span className="text-xs font-medium text-purple-700">
            Now Playing: {currentSource === 'parent' ? "Parent's Voice 💝" : 'AI Voice 🤖'}
          </span>
        </div>
      )}

      {/* Playback Controls */}
      <div className="flex items-center gap-2">
        <Button
          onClick={handlePlay}
          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Play Preview
            </>
          )}
        </Button>
        <Button onClick={handleRestart} variant="outline" size="icon">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-600 mt-3">
        {mode === 'parent' && "Preview your recorded voice"}
        {mode === 'ai' && "Preview AI-generated narration"}
        {mode === 'alternate' && "Preview alternating between your voice and AI"}
      </p>
    </Card>
  );
}