import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Palette, Type, Languages } from 'lucide-react';

export default function ReadingPreferences({ profile, onUpdate, isUpdating }) {
  const [preferences, setPreferences] = useState({
    preferred_language: profile.preferred_language || 'en',
    narration_language: profile.narration_language || 'en',
    font_size_preference: profile.font_size_preference || 'medium',
    font_family: profile.font_family || 'default',
    background_color_preference: profile.background_color_preference || 'white',
    line_spacing_preference: profile.line_spacing_preference || 'normal',
    high_contrast_mode: profile.high_contrast_mode || false,
  });

  const handleSave = () => {
    onUpdate(preferences);
  };

  return (
    <div className="space-y-6">
      {/* Language Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Languages className="w-5 h-5 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-900">Language Preferences</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              App Language
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPreferences({ ...preferences, preferred_language: 'en', narration_language: 'en' })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  preferences.preferred_language === 'en'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="text-2xl mb-1">🇺🇸</div>
                <div className="font-semibold">English</div>
              </button>
              <button
                onClick={() => setPreferences({ ...preferences, preferred_language: 'pt', narration_language: 'pt' })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  preferences.preferred_language === 'pt'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="text-2xl mb-1">🇧🇷</div>
                <div className="font-semibold">Português</div>
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Font Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Type className="w-5 h-5 text-purple-600" />
          <h3 className="text-xl font-semibold text-gray-900">Text Settings</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Font Size
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {['small', 'medium', 'large', 'extra-large'].map((size) => (
                <button
                  key={size}
                  onClick={() => setPreferences({ ...preferences, font_size_preference: size })}
                  className={`p-3 rounded-lg border-2 transition-all capitalize ${
                    preferences.font_size_preference === size
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className={`font-semibold ${
                    size === 'small' ? 'text-xs' :
                    size === 'medium' ? 'text-sm' :
                    size === 'large' ? 'text-base' :
                    'text-lg'
                  }`}>
                    Aa
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Font Family
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'default', label: 'Default', style: 'font-sans' },
                { value: 'serif', label: 'Serif', style: 'font-serif' },
                { value: 'dyslexic', label: 'Dyslexic', style: 'font-mono' },
                { value: 'mono', label: 'Mono', style: 'font-mono' }
              ].map((font) => (
                <button
                  key={font.value}
                  onClick={() => setPreferences({ ...preferences, font_family: font.value })}
                  className={`p-3 rounded-lg border-2 transition-all ${font.style} ${
                    preferences.font_family === font.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  {font.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Line Spacing
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {['compact', 'normal', 'relaxed', 'spacious'].map((spacing) => (
                <button
                  key={spacing}
                  onClick={() => setPreferences({ ...preferences, line_spacing_preference: spacing })}
                  className={`p-3 rounded-lg border-2 transition-all capitalize text-xs ${
                    preferences.line_spacing_preference === spacing
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  {spacing}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Color Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Palette className="w-5 h-5 text-green-600" />
          <h3 className="text-xl font-semibold text-gray-900">Display Settings</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Background Color
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { value: 'white', label: 'White', bg: 'bg-white', border: 'border-gray-300' },
                { value: 'cream', label: 'Cream', bg: 'bg-yellow-50', border: 'border-yellow-300' },
                { value: 'sepia', label: 'Sepia', bg: 'bg-amber-50', border: 'border-amber-300' },
                { value: 'night', label: 'Night', bg: 'bg-gray-900', border: 'border-gray-700' }
              ].map((color) => (
                <button
                  key={color.value}
                  onClick={() => setPreferences({ ...preferences, background_color_preference: color.value })}
                  className={`p-4 rounded-lg border-2 transition-all ${color.bg} ${
                    preferences.background_color_preference === color.value
                      ? `${color.border} ring-2 ring-green-500`
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className={`font-semibold text-sm ${color.value === 'night' ? 'text-white' : 'text-gray-900'}`}>
                    {color.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">High Contrast Mode</div>
              <div className="text-sm text-gray-600">Improves visibility for low vision</div>
            </div>
            <button
              onClick={() => setPreferences({ ...preferences, high_contrast_mode: !preferences.high_contrast_mode })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.high_contrast_mode ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.high_contrast_mode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isUpdating}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isUpdating ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
}