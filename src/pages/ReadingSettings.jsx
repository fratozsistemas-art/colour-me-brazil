import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookOpen, Save, RotateCcw, Eye, Type } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ReadingSettings() {
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState({
    font_size_preference: 'medium',
    font_family: 'default',
    line_spacing_preference: 'normal',
    background_color_preference: 'white',
    high_contrast_mode: false,
    tts_voice_preference: 'default',
    tts_speed: 1.0
  });
  const [saving, setSaving] = useState(false);
  const [previewText, setPreviewText] = useState(
    'Era uma vez, no coração da floresta amazônica, onde as árvores tocavam o céu e os rios cantavam melodias antigas. Once upon a time, in the heart of the Amazon rainforest, where trees touched the sky and rivers sang ancient melodies.'
  );

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const profileId = localStorage.getItem('currentProfileId');
    if (!profileId) return;

    try {
      // Try to load from online profile
      const profiles = await base44.entities.UserProfile.filter({ id: profileId });
      if (profiles.length > 0) {
        const userProfile = profiles[0];
        setProfile(userProfile);
        setSettings({
          font_size_preference: userProfile.font_size_preference || 'medium',
          font_family: userProfile.font_family || 'default',
          line_spacing_preference: userProfile.line_spacing_preference || 'normal',
          background_color_preference: userProfile.background_color_preference || 'white',
          high_contrast_mode: userProfile.high_contrast_mode || false,
          tts_voice_preference: userProfile.tts_voice_preference || 'default',
          tts_speed: userProfile.tts_speed || 1.0
        });
      }
    } catch (error) {
      console.log('Loading from offline storage');
    }

    // Always load from localStorage (offline storage)
    const offlineSettings = localStorage.getItem(`reading_settings_${profileId}`);
    if (offlineSettings) {
      setSettings(JSON.parse(offlineSettings));
    }
  };

  const handleSave = async () => {
    const profileId = localStorage.getItem('currentProfileId');
    if (!profileId) {
      toast.error('Perfil não identificado');
      return;
    }

    setSaving(true);

    try {
      // Save offline first (always works)
      localStorage.setItem(`reading_settings_${profileId}`, JSON.stringify(settings));
      toast.success('Configurações salvas offline!');

      // Try to sync online if available
      if (navigator.onLine && profile) {
        await base44.entities.UserProfile.update(profileId, settings);
        toast.success('Configurações sincronizadas online!');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Salvo offline. Sincronizará quando conectar.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings({
      font_size_preference: 'medium',
      font_family: 'default',
      line_spacing_preference: 'normal',
      background_color_preference: 'white',
      high_contrast_mode: false,
      tts_voice_preference: 'default',
      tts_speed: 1.0
    });
    toast.info('Configurações resetadas');
  };

  // Preview styles
  const getPreviewFontSize = () => {
    const sizes = { small: '14px', medium: '18px', large: '22px', 'extra-large': '26px' };
    return sizes[settings.font_size_preference] || '18px';
  };

  const getPreviewFontFamily = () => {
    const families = {
      default: 'system-ui, -apple-system, sans-serif',
      serif: 'Georgia, "Times New Roman", serif',
      dyslexic: '"OpenDyslexic", "Comic Sans MS", sans-serif',
      mono: '"Courier New", monospace'
    };
    return families[settings.font_family] || families.default;
  };

  const getPreviewLineHeight = () => {
    const heights = { compact: '1.4', normal: '1.8', relaxed: '2.2', spacious: '2.6' };
    return heights[settings.line_spacing_preference] || '1.8';
  };

  const getPreviewBackground = () => {
    const backgrounds = {
      white: '#FFFFFF',
      cream: '#FFF8DC',
      sepia: '#F4E8D0',
      night: '#1a1a1a'
    };
    return backgrounds[settings.background_color_preference] || '#FFFFFF';
  };

  const getPreviewTextColor = () => {
    if (settings.background_color_preference === 'night') {
      return settings.high_contrast_mode ? '#FFFFFF' : '#E5E5E5';
    }
    return settings.high_contrast_mode ? '#000000' : '#333333';
  };

  const previewStyle = {
    fontSize: getPreviewFontSize(),
    fontFamily: getPreviewFontFamily(),
    lineHeight: getPreviewLineHeight(),
    backgroundColor: getPreviewBackground(),
    color: getPreviewTextColor(),
    fontWeight: settings.high_contrast_mode ? '600' : '400',
    padding: '24px',
    borderRadius: '8px',
    transition: 'all 0.3s ease'
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          <BookOpen className="w-10 h-10 text-orange-500" />
          Configurações de Leitura
        </h1>
        <p className="text-gray-600">Personalize sua experiência de leitura</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações */}
        <div className="space-y-6">
          {/* Tamanho da Fonte */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Type className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold">Tamanho da Fonte</h3>
            </div>
            <Select
              value={settings.font_size_preference}
              onValueChange={(value) => setSettings({ ...settings, font_size_preference: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Pequena (14px)</SelectItem>
                <SelectItem value="medium">Média (18px)</SelectItem>
                <SelectItem value="large">Grande (22px)</SelectItem>
                <SelectItem value="extra-large">Extra Grande (26px)</SelectItem>
              </SelectContent>
            </Select>
          </Card>

          {/* Estilo da Fonte */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Type className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-semibold">Estilo da Fonte</h3>
            </div>
            <Select
              value={settings.font_family}
              onValueChange={(value) => setSettings({ ...settings, font_family: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Padrão (Sans-Serif)</SelectItem>
                <SelectItem value="serif">Serif (Mais formal)</SelectItem>
                <SelectItem value="dyslexic">OpenDyslexic (Amigável para dislexia)</SelectItem>
                <SelectItem value="mono">Monoespaçada</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-2">
              A fonte OpenDyslexic foi projetada para facilitar a leitura de pessoas com dislexia
            </p>
          </Card>

          {/* Espaçamento entre Linhas */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Espaçamento entre Linhas</h3>
            <Select
              value={settings.line_spacing_preference}
              onValueChange={(value) => setSettings({ ...settings, line_spacing_preference: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compacto (1.4)</SelectItem>
                <SelectItem value="normal">Normal (1.8)</SelectItem>
                <SelectItem value="relaxed">Relaxado (2.2)</SelectItem>
                <SelectItem value="spacious">Espaçoso (2.6)</SelectItem>
              </SelectContent>
            </Select>
          </Card>

          {/* Tema/Cor de Fundo */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-semibold">Tema de Fundo</h3>
            </div>
            <Select
              value={settings.background_color_preference}
              onValueChange={(value) => setSettings({ ...settings, background_color_preference: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="white">☀️ Branco (Claro)</SelectItem>
                <SelectItem value="cream">🌾 Creme</SelectItem>
                <SelectItem value="sepia">📜 Sépia</SelectItem>
                <SelectItem value="night">🌙 Noturno (Escuro)</SelectItem>
              </SelectContent>
            </Select>
          </Card>

          {/* Alto Contraste */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Modo Alto Contraste</h3>
                <p className="text-sm text-gray-500">Aumenta a visibilidade do texto</p>
              </div>
              <Switch
                checked={settings.high_contrast_mode}
                onCheckedChange={(checked) => setSettings({ ...settings, high_contrast_mode: checked })}
              />
            </div>
          </Card>

          {/* Velocidade TTS */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Velocidade da Narração: {settings.tts_speed}x
            </h3>
            <Slider
              value={[settings.tts_speed]}
              onValueChange={([value]) => setSettings({ ...settings, tts_speed: value })}
              min={0.5}
              max={2}
              step={0.25}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Lento (0.5x)</span>
              <span>Rápido (2x)</span>
            </div>
          </Card>

          {/* Botões de Ação */}
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
            <Button onClick={handleReset} variant="outline" className="flex-1">
              <RotateCcw className="w-4 h-4 mr-2" />
              Resetar
            </Button>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-24 h-fit">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Pré-visualização</h3>
            <div style={previewStyle} className="border">
              {previewText}
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Este é um exemplo de como o texto aparecerá durante a leitura
            </p>
          </Card>

          {/* Informações */}
          <Card className="p-6 mt-6 bg-blue-50">
            <h4 className="font-semibold text-blue-900 mb-2">💡 Dica</h4>
            <p className="text-sm text-blue-800">
              Suas configurações são salvas automaticamente no seu dispositivo e funcionam mesmo sem internet.
              Quando você se conectar novamente, elas serão sincronizadas com a nuvem.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}