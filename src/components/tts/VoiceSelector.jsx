import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Settings, Play, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ElevenLabs voice library
const VOICE_LIBRARY = {
  en: [
    { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', gender: 'Female', age: 'Young Adult', accent: 'American', tone: 'Calm' },
    { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', gender: 'Female', age: 'Young Adult', accent: 'American', tone: 'Strong' },
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', gender: 'Female', age: 'Young Adult', accent: 'American', tone: 'Soft' },
    { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', gender: 'Male', age: 'Young Adult', accent: 'American', tone: 'Well-rounded' },
    { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', gender: 'Female', age: 'Young Adult', accent: 'American', tone: 'Emotional' },
    { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', gender: 'Male', age: 'Young Adult', accent: 'American', tone: 'Deep' },
    { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', gender: 'Male', age: 'Middle Aged', accent: 'American', tone: 'Crisp' },
    { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', gender: 'Male', age: 'Middle Aged', accent: 'American', tone: 'Deep' },
    { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam', gender: 'Male', age: 'Young Adult', accent: 'American', tone: 'Raspy' }
  ],
  pt: [
    { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', gender: 'Female', age: 'Middle Aged', accent: 'Brazilian', tone: 'Warm' },
    { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', gender: 'Male', age: 'Middle Aged', accent: 'American', tone: 'Deep' }
  ]
};

export default function VoiceSelector({ 
  language = 'en',
  selectedVoiceId,
  onVoiceChange,
  voiceSettings = {},
  onSettingsChange,
  onPreview
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentVoices = VOICE_LIBRARY[language] || VOICE_LIBRARY.en;
  const selectedVoice = currentVoices.find(v => v.id === selectedVoiceId) || currentVoices[0];

  const settings = {
    stability: voiceSettings.stability ?? 0.5,
    similarity_boost: voiceSettings.similarity_boost ?? 0.75,
    style: voiceSettings.style ?? 0.0,
    speaking_rate: voiceSettings.speaking_rate ?? 1.0,
    pitch: voiceSettings.pitch ?? 1.0
  };

  const handleSettingChange = (key, value) => {
    onSettingsChange?.({ ...voiceSettings, [key]: value });
  };

  const handlePreview = async () => {
    if (!onPreview) return;
    setIsPlaying(true);
    try {
      await onPreview(selectedVoiceId, settings);
    } finally {
      setIsPlaying(false);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          Voice Selection
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreview}
          disabled={isPlaying}
        >
          <Play className="w-4 h-4 mr-2" />
          Preview
        </Button>
      </div>

      {/* Voice Selection */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Choose Voice
        </label>
        <Select value={selectedVoiceId} onValueChange={onVoiceChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {currentVoices.map(voice => (
              <SelectItem key={voice.id} value={voice.id}>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{voice.name}</span>
                  <span className="text-xs text-gray-500">
                    ({voice.gender}, {voice.age}, {voice.accent})
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedVoice && (
          <p className="text-xs text-gray-500 mt-1">
            {selectedVoice.tone} tone • {selectedVoice.accent} accent
          </p>
        )}
      </div>

      {/* Filter by Characteristics */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Gender</label>
          <Select
            value={selectedVoice?.gender || 'all'}
            onValueChange={(gender) => {
              if (gender === 'all') return;
              const voice = currentVoices.find(v => v.gender === gender);
              if (voice) onVoiceChange?.(voice.id);
            }}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Age</label>
          <Select
            value={selectedVoice?.age || 'all'}
            onValueChange={(age) => {
              if (age === 'all') return;
              const voice = currentVoices.find(v => v.age === age);
              if (voice) onVoiceChange?.(voice.id);
            }}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Young Adult">Young Adult</SelectItem>
              <SelectItem value="Middle Aged">Middle Aged</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Advanced Settings Toggle */}
      <Button
        variant="outline"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full justify-between"
        size="sm"
      >
        <span className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Advanced Settings
        </span>
        {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </Button>

      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 overflow-hidden"
          >
            {/* Stability */}
            <div>
              <div className="flex justify-between text-xs mb-2">
                <label className="font-medium text-gray-700">Stability</label>
                <span className="text-gray-500">{Math.round(settings.stability * 100)}%</span>
              </div>
              <Slider
                value={[settings.stability * 100]}
                onValueChange={([v]) => handleSettingChange('stability', v / 100)}
                min={0}
                max={100}
                step={5}
              />
              <p className="text-xs text-gray-500 mt-1">
                Higher = more consistent, Lower = more expressive
              </p>
            </div>

            {/* Similarity Boost */}
            <div>
              <div className="flex justify-between text-xs mb-2">
                <label className="font-medium text-gray-700">Clarity</label>
                <span className="text-gray-500">{Math.round(settings.similarity_boost * 100)}%</span>
              </div>
              <Slider
                value={[settings.similarity_boost * 100]}
                onValueChange={([v]) => handleSettingChange('similarity_boost', v / 100)}
                min={0}
                max={100}
                step={5}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enhances voice clarity and similarity
              </p>
            </div>

            {/* Style */}
            <div>
              <div className="flex justify-between text-xs mb-2">
                <label className="font-medium text-gray-700">Style Intensity</label>
                <span className="text-gray-500">{Math.round(settings.style * 100)}%</span>
              </div>
              <Slider
                value={[settings.style * 100]}
                onValueChange={([v]) => handleSettingChange('style', v / 100)}
                min={0}
                max={100}
                step={5}
              />
              <p className="text-xs text-gray-500 mt-1">
                Adds emotional expressiveness
              </p>
            </div>

            {/* Speaking Rate */}
            <div>
              <div className="flex justify-between text-xs mb-2">
                <label className="font-medium text-gray-700">Speaking Speed</label>
                <span className="text-gray-500">{settings.speaking_rate.toFixed(1)}x</span>
              </div>
              <Slider
                value={[settings.speaking_rate * 100]}
                onValueChange={([v]) => handleSettingChange('speaking_rate', v / 100)}
                min={50}
                max={150}
                step={5}
              />
              <p className="text-xs text-gray-500 mt-1">
                Adjust narration speed (applied during playback)
              </p>
            </div>

            {/* Pitch */}
            <div>
              <div className="flex justify-between text-xs mb-2">
                <label className="font-medium text-gray-700">Pitch</label>
                <span className="text-gray-500">{settings.pitch.toFixed(1)}x</span>
              </div>
              <Slider
                value={[settings.pitch * 100]}
                onValueChange={([v]) => handleSettingChange('pitch', v / 100)}
                min={75}
                max={125}
                step={5}
              />
              <p className="text-xs text-gray-500 mt-1">
                Adjust voice pitch (applied during playback)
              </p>
            </div>

            {/* Reset Button */}
            <Button
              variant="outline"
              onClick={() => {
                onSettingsChange?.({
                  stability: 0.5,
                  similarity_boost: 0.75,
                  style: 0.0,
                  speaking_rate: 1.0,
                  pitch: 1.0
                });
              }}
              className="w-full"
              size="sm"
            >
              Reset to Defaults
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export { VOICE_LIBRARY };