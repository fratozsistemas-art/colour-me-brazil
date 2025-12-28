import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Scissors, Wand2, Volume2, Play, Pause } from 'lucide-react';
import { toast } from 'sonner';

export default function AudioEditor({ audioBlob, audioUrl, onSave, onCancel }) {
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(100);
  const [voiceEffect, setVoiceEffect] = useState('none');
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const audioContextRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.onloadedmetadata = () => {
        setDuration(audioPlayerRef.current.duration);
      };
    }
  }, [audioUrl]);

  useEffect(() => {
    drawWaveform();
  }, [audioUrl, trimStart, trimEnd]);

  const drawWaveform = async () => {
    if (!canvasRef.current || !audioBlob) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, width, height);

    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const data = audioBuffer.getChannelData(0);
      const step = Math.ceil(data.length / width);
      const amp = height / 2;

      ctx.fillStyle = '#3b82f6';
      for (let i = 0; i < width; i++) {
        let min = 1.0;
        let max = -1.0;
        for (let j = 0; j < step; j++) {
          const datum = data[(i * step) + j];
          if (datum < min) min = datum;
          if (datum > max) max = datum;
        }
        ctx.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
      }

      // Draw trim indicators
      const startX = (trimStart / 100) * width;
      const endX = (trimEnd / 100) * width;
      
      ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
      ctx.fillRect(0, 0, startX, height);
      ctx.fillRect(endX, 0, width - endX, height);
      
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startX, 0);
      ctx.lineTo(startX, height);
      ctx.moveTo(endX, 0);
      ctx.lineTo(endX, height);
      ctx.stroke();

      audioContext.close();
    } catch (error) {
      console.error('Error drawing waveform:', error);
    }
  };

  const applyEffects = async () => {
    if (!audioBlob || voiceEffect === 'none') return audioBlob;

    setIsProcessing(true);
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Create offline context for processing
      const offlineContext = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      );

      const source = offlineContext.createBufferSource();
      source.buffer = audioBuffer;

      let lastNode = source;

      // Apply effects based on selection
      switch (voiceEffect) {
        case 'storyteller':
          // Lower pitch slightly, add slight reverb
          const pitchShift = offlineContext.createBiquadFilter();
          pitchShift.type = 'lowpass';
          pitchShift.frequency.value = 3000;
          lastNode.connect(pitchShift);
          lastNode = pitchShift;
          break;

        case 'warm':
          // Warmer tone with bass boost
          const bassBoost = offlineContext.createBiquadFilter();
          bassBoost.type = 'lowshelf';
          bassBoost.frequency.value = 200;
          bassBoost.gain.value = 3;
          lastNode.connect(bassBoost);
          lastNode = bassBoost;
          break;

        case 'clear':
          // Enhance clarity with high-pass
          const clarityFilter = offlineContext.createBiquadFilter();
          clarityFilter.type = 'highpass';
          clarityFilter.frequency.value = 80;
          lastNode.connect(clarityFilter);
          lastNode = clarityFilter;
          break;

        case 'gentle':
          // Softer with compression
          const compressor = offlineContext.createDynamicsCompressor();
          compressor.threshold.value = -24;
          compressor.ratio.value = 12;
          lastNode.connect(compressor);
          lastNode = compressor;
          break;
      }

      lastNode.connect(offlineContext.destination);
      source.start(0);

      const renderedBuffer = await offlineContext.startRendering();
      
      // Convert to blob
      const wavBlob = await audioBufferToWav(renderedBuffer);
      audioContext.close();
      
      return wavBlob;
    } catch (error) {
      console.error('Error applying effects:', error);
      toast.error('Failed to apply effects');
      return audioBlob;
    } finally {
      setIsProcessing(false);
    }
  };

  const audioBufferToWav = (buffer) => {
    return new Promise((resolve) => {
      const length = buffer.length * buffer.numberOfChannels * 2 + 44;
      const arrayBuffer = new ArrayBuffer(length);
      const view = new DataView(arrayBuffer);
      const channels = [];
      let offset = 0;
      let pos = 0;

      // Write WAV header
      const setUint16 = (data) => {
        view.setUint16(pos, data, true);
        pos += 2;
      };
      const setUint32 = (data) => {
        view.setUint32(pos, data, true);
        pos += 4;
      };

      setUint32(0x46464952); // "RIFF"
      setUint32(length - 8); // file length - 8
      setUint32(0x45564157); // "WAVE"
      setUint32(0x20746d66); // "fmt " chunk
      setUint32(16); // length = 16
      setUint16(1); // PCM (uncompressed)
      setUint16(buffer.numberOfChannels);
      setUint32(buffer.sampleRate);
      setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels); // avg. bytes/sec
      setUint16(buffer.numberOfChannels * 2); // block-align
      setUint16(16); // 16-bit
      setUint32(0x61746164); // "data" - chunk
      setUint32(length - pos - 4); // chunk length

      // Write interleaved data
      for (let i = 0; i < buffer.numberOfChannels; i++) {
        channels.push(buffer.getChannelData(i));
      }

      while (pos < length) {
        for (let i = 0; i < buffer.numberOfChannels; i++) {
          let sample = Math.max(-1, Math.min(1, channels[i][offset]));
          sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
          view.setInt16(pos, sample, true);
          pos += 2;
        }
        offset++;
      }

      resolve(new Blob([arrayBuffer], { type: 'audio/wav' }));
    });
  };

  const trimAudio = async () => {
    if (!audioBlob) return audioBlob;

    setIsProcessing(true);
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const startSample = Math.floor((trimStart / 100) * audioBuffer.length);
      const endSample = Math.floor((trimEnd / 100) * audioBuffer.length);
      const newLength = endSample - startSample;

      const trimmedBuffer = audioContext.createBuffer(
        audioBuffer.numberOfChannels,
        newLength,
        audioBuffer.sampleRate
      );

      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const channelData = audioBuffer.getChannelData(channel);
        const trimmedData = trimmedBuffer.getChannelData(channel);
        for (let i = 0; i < newLength; i++) {
          trimmedData[i] = channelData[startSample + i];
        }
      }

      const wavBlob = await audioBufferToWav(trimmedBuffer);
      audioContext.close();
      
      return wavBlob;
    } catch (error) {
      console.error('Error trimming audio:', error);
      toast.error('Failed to trim audio');
      return audioBlob;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    setIsProcessing(true);
    try {
      // Trim first
      let processedBlob = await trimAudio();
      
      // Apply effects
      if (voiceEffect !== 'none') {
        processedBlob = await applyEffects();
      }

      onSave(processedBlob);
    } catch (error) {
      console.error('Error processing audio:', error);
      toast.error('Failed to process audio');
    } finally {
      setIsProcessing(false);
    }
  };

  const togglePlayback = () => {
    if (!audioPlayerRef.current) return;

    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      const startTime = (trimStart / 100) * duration;
      audioPlayerRef.current.currentTime = startTime;
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="space-y-6">
      <audio
        ref={audioPlayerRef}
        src={audioUrl}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />

      {/* Waveform */}
      <Card className="p-4">
        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Volume2 className="w-4 h-4" />
          Audio Waveform
        </h4>
        <canvas
          ref={canvasRef}
          width={600}
          height={120}
          className="w-full h-32 border rounded-lg bg-gray-50"
        />
        <div className="mt-3 flex items-center justify-center gap-2">
          <Button onClick={togglePlayback} variant="outline" size="sm">
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <span className="text-xs text-gray-500">
            {duration > 0 ? `${duration.toFixed(1)}s` : '0s'}
          </span>
        </div>
      </Card>

      {/* Trim Controls */}
      <Card className="p-4">
        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Scissors className="w-4 h-4" />
          Trim Audio
        </h4>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-600">Start: {trimStart}%</label>
            <Slider
              value={[trimStart]}
              onValueChange={(value) => setTrimStart(Math.min(value[0], trimEnd - 1))}
              max={100}
              step={1}
              className="mt-2"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">End: {trimEnd}%</label>
            <Slider
              value={[trimEnd]}
              onValueChange={(value) => setTrimEnd(Math.max(value[0], trimStart + 1))}
              max={100}
              step={1}
              className="mt-2"
            />
          </div>
        </div>
      </Card>

      {/* Voice Effects */}
      <Card className="p-4">
        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Wand2 className="w-4 h-4" />
          Voice Effects
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'none', name: 'No Effect', desc: 'Original voice' },
            { id: 'storyteller', name: 'Storyteller', desc: 'Warm narration' },
            { id: 'warm', name: 'Warm', desc: 'Bass boost' },
            { id: 'clear', name: 'Clear', desc: 'Enhanced clarity' },
            { id: 'gentle', name: 'Gentle', desc: 'Soft & smooth' }
          ].map((effect) => (
            <button
              key={effect.id}
              onClick={() => setVoiceEffect(effect.id)}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                voiceEffect === effect.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-sm">{effect.name}</div>
              <div className="text-xs text-gray-500">{effect.desc}</div>
            </button>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={onCancel} variant="outline" className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={isProcessing}
          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500"
        >
          {isProcessing ? 'Processing...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}