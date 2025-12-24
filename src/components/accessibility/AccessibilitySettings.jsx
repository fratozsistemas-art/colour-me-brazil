import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Eye, Type, Volume2, Wifi, WifiOff } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AccessibilitySettings({ profile, onUpdate }) {
  const [settings, setSettings] = useState({
    font_size_preference: profile.font_size_preference || 'medium',
    line_spacing_preference: profile.line_spacing_preference || 'normal',
    background_color_preference: profile.background_color_preference || 'white',
    high_contrast_mode: profile.high_contrast_mode || false,
    tts_voice_preference: profile.tts_voice_preference || 'default',
    tts_speed: profile.tts_speed || 1.0
  });
  const [saving, setSaving] = useState(false);
  const [testingVoice, setTestingVoice] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.entities.UserProfile.update(profile.id, settings);
      toast.success('Configurações de acessibilidade atualizadas!');
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleTestVoice = async () => {
    setTestingVoice(true);
    try {
      const response = await base44.functions.invoke('generateTTSAudio', {
        text: 'Olá! Esta é uma amostra da voz selecionada para leitura.',
        language: 'pt',
        voice_preference: settings.tts_voice_preference,
        speed: settings.tts_speed
      });

      if (response.data.success) {
        const audio = new Audio(response.data.audio_url);
        audio.play();
      }
    } catch (error) {
      toast.error('Erro ao testar voz');
    } finally {
      setTestingVoice(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-500" />
          Acessibilidade
        </CardTitle>
        <CardDescription>
          Personalize a experiência de leitura para {profile.child_name}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Font Size */}
        <div>
          <Label className="flex items-center gap-2 mb-2">
            <Type className="w-4 h-4" />
            Tamanho da Fonte
          </Label>
          <Select
            value={settings.font_size_preference}
            onValueChange={(value) => setSettings({ ...settings, font_size_preference: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Pequeno</SelectItem>
              <SelectItem value="medium">Médio</SelectItem>
              <SelectItem value="large">Grande</SelectItem>
              <SelectItem value="extra-large">Extra Grande</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Line Spacing */}
        <div>
          <Label className="mb-2 block">Espaçamento entre Linhas</Label>
          <Select
            value={settings.line_spacing_preference}
            onValueChange={(value) => setSettings({ ...settings, line_spacing_preference: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="compact">Compacto</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="relaxed">Relaxado</SelectItem>
              <SelectItem value="spacious">Espaçoso</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Background Color */}
        <div>
          <Label className="mb-2 block">Cor de Fundo</Label>
          <Select
            value={settings.background_color_preference}
            onValueChange={(value) => setSettings({ ...settings, background_color_preference: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="white">Branco</SelectItem>
              <SelectItem value="cream">Creme</SelectItem>
              <SelectItem value="sepia">Sépia</SelectItem>
              <SelectItem value="night">Modo Noturno</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* High Contrast Mode */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <Label className="font-semibold">Modo Alto Contraste</Label>
            <p className="text-sm text-gray-600">Para melhor visibilidade</p>
          </div>
          <Switch
            checked={settings.high_contrast_mode}
            onCheckedChange={(checked) => setSettings({ ...settings, high_contrast_mode: checked })}
          />
        </div>

        {/* TTS Voice Selection */}
        <div>
          <Label className="flex items-center gap-2 mb-2">
            <Volume2 className="w-4 h-4" />
            Voz para Leitura em Voz Alta
          </Label>
          <Select
            value={settings.tts_voice_preference}
            onValueChange={(value) => setSettings({ ...settings, tts_voice_preference: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Padrão</SelectItem>
              <SelectItem value="child_male">Criança (Masculina)</SelectItem>
              <SelectItem value="child_female">Criança (Feminina)</SelectItem>
              <SelectItem value="gentle">Suave</SelectItem>
              <SelectItem value="energetic">Energética</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 w-full"
            onClick={handleTestVoice}
            disabled={testingVoice}
          >
            {testingVoice ? 'Testando...' : 'Testar Voz'}
          </Button>
        </div>

        {/* TTS Speed */}
        <div>
          <Label className="mb-2 block">Velocidade de Leitura: {settings.tts_speed}x</Label>
          <Slider
            value={[settings.tts_speed]}
            onValueChange={([value]) => setSettings({ ...settings, tts_speed: value })}
            min={0.5}
            max={2.0}
            step={0.1}
            className="mt-2"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Mais Lenta</span>
            <span>Mais Rápida</span>
          </div>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full"
        >
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </CardContent>
    </Card>
  );
}