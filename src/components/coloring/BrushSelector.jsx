import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Paintbrush, Droplet, Sparkles, Wind, Pen, Eraser } from 'lucide-react';

export const BRUSH_TYPES = [
  {
    id: 'solid',
    name: 'Solid',
    icon: Paintbrush,
    opacity: 1.0,
    blur: 0,
    flow: 1.0,
    spacing: 0.1,
    jitter: 0,
    textureIntensity: 0,
    texture: 'none'
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    icon: Droplet,
    opacity: 0.3,
    blur: 8,
    flow: 0.4,
    spacing: 0.2,
    jitter: 0.3,
    textureIntensity: 0.6,
    texture: 'watercolor',
    wetEdges: true
  },
  {
    id: 'airbrush',
    name: 'Airbrush',
    icon: Wind,
    opacity: 0.15,
    blur: 15,
    flow: 0.3,
    spacing: 0.05,
    jitter: 0.5,
    textureIntensity: 0,
    texture: 'none'
  },
  {
    id: 'crayon',
    name: 'Crayon',
    icon: Pen,
    opacity: 0.7,
    blur: 0,
    flow: 0.8,
    spacing: 0.3,
    jitter: 0.2,
    textureIntensity: 0.8,
    texture: 'crayon'
  },
  {
    id: 'marker',
    name: 'Marker',
    icon: Pen,
    opacity: 0.8,
    blur: 2,
    flow: 0.9,
    spacing: 0.1,
    jitter: 0.1,
    textureIntensity: 0.2,
    texture: 'marker'
  },
  {
    id: 'sparkle',
    name: 'Sparkle',
    icon: Sparkles,
    opacity: 0.9,
    blur: 3,
    flow: 0.7,
    spacing: 0.4,
    jitter: 0.8,
    textureIntensity: 0.5,
    texture: 'sparkle',
    particleEffect: true
  },
  {
    id: 'soft',
    name: 'Soft Brush',
    icon: Paintbrush,
    opacity: 0.5,
    blur: 10,
    flow: 0.6,
    spacing: 0.15,
    jitter: 0.1,
    textureIntensity: 0,
    texture: 'none'
  }
];

export default function BrushSelector({ selectedBrush, onBrushChange, brushParams, onBrushParamsChange }) {
  const currentBrush = BRUSH_TYPES.find(b => b.id === selectedBrush) || BRUSH_TYPES[0];

  const handleParamChange = (param, value) => {
    onBrushParamsChange({
      ...brushParams,
      [param]: value
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Paintbrush className="w-4 h-4" />
          Brush Type
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {BRUSH_TYPES.map((brush) => {
            const Icon = brush.icon;
            return (
              <Button
                key={brush.id}
                variant={selectedBrush === brush.id ? 'default' : 'outline'}
                onClick={() => onBrushChange(brush.id)}
                className="flex items-center gap-2 justify-start"
                size="sm"
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs">{brush.name}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Advanced Brush Controls */}
      <Card className="p-3 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <h4 className="text-xs font-semibold text-gray-700 mb-3">Advanced Controls</h4>
        
        <div className="space-y-3">
          {/* Opacity */}
          <div>
            <label className="text-xs text-gray-600">
              Opacity: {Math.round((brushParams.opacity ?? currentBrush.opacity) * 100)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={brushParams.opacity ?? currentBrush.opacity}
              onChange={(e) => handleParamChange('opacity', parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          {/* Flow */}
          <div>
            <label className="text-xs text-gray-600">
              Flow: {Math.round((brushParams.flow ?? currentBrush.flow) * 100)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={brushParams.flow ?? currentBrush.flow}
              onChange={(e) => handleParamChange('flow', parseFloat(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>

          {/* Blur */}
          <div>
            <label className="text-xs text-gray-600">
              Blur: {Math.round(brushParams.blur ?? currentBrush.blur)}px
            </label>
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={brushParams.blur ?? currentBrush.blur}
              onChange={(e) => handleParamChange('blur', parseInt(e.target.value))}
              className="w-full accent-pink-500"
            />
          </div>

          {/* Spacing */}
          <div>
            <label className="text-xs text-gray-600">
              Spacing: {Math.round((brushParams.spacing ?? currentBrush.spacing) * 100)}%
            </label>
            <input
              type="range"
              min="0.05"
              max="1"
              step="0.05"
              value={brushParams.spacing ?? currentBrush.spacing}
              onChange={(e) => handleParamChange('spacing', parseFloat(e.target.value))}
              className="w-full accent-orange-500"
            />
          </div>

          {/* Jitter */}
          <div>
            <label className="text-xs text-gray-600">
              Jitter: {Math.round((brushParams.jitter ?? currentBrush.jitter) * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={brushParams.jitter ?? currentBrush.jitter}
              onChange={(e) => handleParamChange('jitter', parseFloat(e.target.value))}
              className="w-full accent-green-500"
            />
          </div>

          {/* Texture Intensity */}
          {currentBrush.texture !== 'none' && (
            <div>
              <label className="text-xs text-gray-600">
                Texture: {Math.round((brushParams.textureIntensity ?? currentBrush.textureIntensity) * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={brushParams.textureIntensity ?? currentBrush.textureIntensity}
                onChange={(e) => handleParamChange('textureIntensity', parseFloat(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onBrushParamsChange({})}
          className="w-full mt-3 text-xs"
        >
          Reset to Defaults
        </Button>
      </Card>

      {/* Brush Preview */}
      <div className="p-3 bg-white rounded-lg border">
        <p className="text-xs text-gray-600 mb-2">Preview:</p>
        <div className="h-20 bg-gray-50 rounded flex items-center justify-center">
          <div 
            className="rounded-full transition-all"
            style={{
              width: `${20 + (brushParams.blur ?? currentBrush.blur) * 2}px`,
              height: `${20 + (brushParams.blur ?? currentBrush.blur) * 2}px`,
              backgroundColor: `rgba(59, 130, 246, ${brushParams.opacity ?? currentBrush.opacity})`,
              filter: `blur(${(brushParams.blur ?? currentBrush.blur) / 2}px)`
            }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          {currentBrush.name} • {Math.round((brushParams.opacity ?? currentBrush.opacity) * 100)}% opacity
        </p>
      </div>
    </div>
  );
}