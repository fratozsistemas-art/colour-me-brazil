import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Palette, Volume2, Save } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { getAllPaletteNames } from '../coloring/colorPalettes';

export default function PersonalizationSettings({ profile, onUpdate }) {
  const [preferredLanguage, setPreferredLanguage] = useState(profile.preferred_language || 'en');
  const [narrationLanguage, setNarrationLanguage] = useState(profile.narration_language || 'en');
  const [defaultPalette, setDefaultPalette] = useState(profile.default_palette || 'culture');
  const [isSaving, setIsSaving] = useState(false);

  const palettes = getAllPaletteNames();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await base44.entities.UserProfile.update(profile.id, {
        preferred_language: preferredLanguage,
        narration_language: narrationLanguage,
        default_palette: defaultPalette
      });
      
      toast.success('Settings saved!');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = 
    preferredLanguage !== (profile.preferred_language || 'en') ||
    narrationLanguage !== (profile.narration_language || 'en') ||
    defaultPalette !== (profile.default_palette || 'culture');

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Palette className="w-6 h-6 text-purple-500" />
        Personalization
      </h2>

      <div className="space-y-6">
        {/* Preferred Language */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Globe className="w-4 h-4" />
            App Language
          </label>
          <Select value={preferredLanguage} onValueChange={setPreferredLanguage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">🇺🇸 English</SelectItem>
              <SelectItem value="pt">🇧🇷 Português</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">
            Language for menus and interface
          </p>
        </div>

        {/* Narration Language */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Volume2 className="w-4 h-4" />
            Audio Narration Language
          </label>
          <Select value={narrationLanguage} onValueChange={setNarrationLanguage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">🇺🇸 English</SelectItem>
              <SelectItem value="pt">🇧🇷 Português</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">
            Preferred language for story narration
          </p>
        </div>

        {/* Default Color Palette */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Palette className="w-4 h-4" />
            Default Coloring Palette
          </label>
          <Select value={defaultPalette} onValueChange={setDefaultPalette}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {palettes.map(palette => (
                <SelectItem key={palette.id} value={palette.id}>
                  {palette.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">
            Your favorite color theme for coloring pages
          </p>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </Card>
  );
}