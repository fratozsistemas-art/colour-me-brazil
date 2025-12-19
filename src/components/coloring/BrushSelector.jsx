import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Paintbrush, Droplet, Feather, Sparkles, Pen, Highlighter, Save, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

const BRUSH_TYPES = [
  {
    id: 'solid',
    name: 'Solid',
    icon: Paintbrush,
    description: 'Classic solid brush',
    opacity: 1.0,
    blur: 0,
    texture: 'solid',
    flow: 1.0,
    spacing: 0.1,
    jitter: 0,
    textureIntensity: 0
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    icon: Droplet,
    description: 'Soft watercolor effect',
    opacity: 0.3,
    blur: 3,
    texture: 'watercolor',
    flow: 0.4,
    spacing: 0.15,
    jitter: 0.3,
    textureIntensity: 0.5
  },
  {
    id: 'airbrush',
    name: 'Airbrush',
    icon: Sparkles,
    description: 'Spray paint effect',
    opacity: 0.15,
    blur: 5,
    texture: 'airbrush',
    flow: 0.3,
    spacing: 0.05,
    jitter: 0.5,
    textureIntensity: 0.3
  },
  {
    id: 'calligraphy',
    name: 'Calligraphy',
    icon: Feather,
    description: 'Elegant calligraphy',
    opacity: 0.8,
    blur: 0,
    texture: 'solid',
    flow: 0.9,
    spacing: 0.2,
    jitter: 0,
    textureIntensity: 0
  },
  {
    id: 'crayon',
    name: 'Crayon',
    icon: Pen,
    description: 'Textured crayon',
    opacity: 0.7,
    blur: 0,
    texture: 'crayon',
    flow: 0.6,
    spacing: 0.1,
    jitter: 0.2,
    textureIntensity: 0.8
  },
  {
    id: 'marker',
    name: 'Marker',
    icon: Highlighter,
    description: 'Bold marker',
    opacity: 0.85,
    blur: 0,
    texture: 'marker',
    flow: 0.8,
    spacing: 0.1,
    jitter: 0.1,
    textureIntensity: 0.4
  }
];

export default function BrushSelector({ 
  selectedBrush, 
  onBrushChange,
  brushParams = {},
  onBrushParamsChange 
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [presets, setPresets] = useState([]);
  const [presetName, setPresetName] = useState('');

  // Load presets from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('coloringBrushPresets');
    if (saved) {
      try {
        setPresets(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load presets:', e);
      }
    }
  }, []);

  const getCurrentBrush = () => {
    return BRUSH_TYPES.find(b => b.id === selectedBrush) || BRUSH_TYPES[0];
  };

  const getEffectiveParams = () => {
    const base = getCurrentBrush();
    return {
      opacity: brushParams.opacity ?? base.opacity,
      blur: brushParams.blur ?? base.blur,
      flow: brushParams.flow ?? base.flow,
      spacing: brushParams.spacing ?? base.spacing,
      jitter: brushParams.jitter ?? base.jitter,
      textureIntensity: brushParams.textureIntensity ?? base.textureIntensity
    };
  };

  const handleParamChange = (param, value) => {
    const newParams = { ...brushParams, [param]: value };
    onBrushParamsChange?.(newParams);
  };

  const savePreset = () => {
    if (!presetName.trim()) return;
    
    const newPreset = {
      id: Date.now().toString(),
      name: presetName,
      brushType: selectedBrush,
      params: brushParams,
      created: new Date().toISOString()
    };

    const updated = [...presets, newPreset];
    setPresets(updated);
    localStorage.setItem('coloringBrushPresets', JSON.stringify(updated));
    setPresetName('');
  };

  const loadPreset = (preset) => {
    onBrushChange(preset.brushType);
    onBrushParamsChange?.(preset.params || {});
  };

  const deletePreset = (presetId) => {
    const updated = presets.filter(p => p.id !== presetId);
    setPresets(updated);
    localStorage.setItem('coloringBrushPresets', JSON.stringify(updated));
  };

  const resetToDefaults = () => {
    onBrushParamsChange?.({});
  };

  const params = getEffectiveParams();

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-700 text-sm">Brush Type</h3>
      <div className="grid grid-cols-2 gap-2">
        {BRUSH_TYPES.map((brush) => {
          const Icon = brush.icon;
          const isSelected = selectedBrush === brush.id;
          
          return (
            <motion.button
              key={brush.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onBrushChange(brush.id)}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
              <div className="text-xs font-medium text-gray-800">{brush.name}</div>
            </motion.button>
          );
        })}
      </div>

      {/* Advanced Controls Toggle */}
      <Button
        variant="outline"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full justify-between"
        size="sm"
      >
        <span>Advanced Controls</span>
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
            {/* Flow */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <label className="font-medium text-gray-700">Flow</label>
                <span className="text-gray-500">{Math.round(params.flow * 100)}%</span>
              </div>
              <Slider
                value={[params.flow * 100]}
                onValueChange={([v]) => handleParamChange('flow', v / 100)}
                min={10}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            {/* Opacity */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <label className="font-medium text-gray-700">Opacity</label>
                <span className="text-gray-500">{Math.round(params.opacity * 100)}%</span>
              </div>
              <Slider
                value={[params.opacity * 100]}
                onValueChange={([v]) => handleParamChange('opacity', v / 100)}
                min={10}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            {/* Blur */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <label className="font-medium text-gray-700">Blur</label>
                <span className="text-gray-500">{params.blur}px</span>
              </div>
              <Slider
                value={[params.blur]}
                onValueChange={([v]) => handleParamChange('blur', v)}
                min={0}
                max={15}
                step={1}
                className="w-full"
              />
            </div>

            {/* Spacing */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <label className="font-medium text-gray-700">Spacing</label>
                <span className="text-gray-500">{Math.round(params.spacing * 100)}%</span>
              </div>
              <Slider
                value={[params.spacing * 100]}
                onValueChange={([v]) => handleParamChange('spacing', v / 100)}
                min={1}
                max={50}
                step={1}
                className="w-full"
              />
            </div>

            {/* Jitter */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <label className="font-medium text-gray-700">Jitter</label>
                <span className="text-gray-500">{Math.round(params.jitter * 100)}%</span>
              </div>
              <Slider
                value={[params.jitter * 100]}
                onValueChange={([v]) => handleParamChange('jitter', v / 100)}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            {/* Texture Intensity */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <label className="font-medium text-gray-700">Texture</label>
                <span className="text-gray-500">{Math.round(params.textureIntensity * 100)}%</span>
              </div>
              <Slider
                value={[params.textureIntensity * 100]}
                onValueChange={([v]) => handleParamChange('textureIntensity', v / 100)}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            <Button
              variant="outline"
              onClick={resetToDefaults}
              className="w-full"
              size="sm"
            >
              Reset to Defaults
            </Button>

            {/* Save Preset */}
            <div className="pt-2 border-t">
              <h4 className="text-xs font-semibold text-gray-700 mb-2">Save as Preset</h4>
              <div className="flex gap-2">
                <Input
                  placeholder="Preset name..."
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  className="flex-1 h-8 text-xs"
                />
                <Button
                  onClick={savePreset}
                  disabled={!presetName.trim()}
                  size="sm"
                  className="h-8"
                >
                  <Save className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Saved Presets */}
            {presets.length > 0 && (
              <div className="pt-2 border-t">
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Saved Presets</h4>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {presets.map(preset => (
                    <div
                      key={preset.id}
                      className="flex items-center justify-between gap-2 p-2 bg-white rounded border hover:border-blue-300 transition-colors"
                    >
                      <button
                        onClick={() => loadPreset(preset)}
                        className="flex-1 text-left text-xs font-medium text-gray-700 hover:text-blue-600"
                      >
                        {preset.name}
                      </button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePreset(preset.id)}
                        className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { BRUSH_TYPES };