import React from 'react';
import { Button } from '@/components/ui/button';

export const TEXTURE_PATTERNS = [
  { id: 'none', name: 'None', icon: '⬜' },
  { id: 'dots', name: 'Dots', icon: '⚫' },
  { id: 'stripes', name: 'Stripes', icon: '▬' },
  { id: 'crosshatch', name: 'Crosshatch', icon: '✖' },
  { id: 'noise', name: 'Noise', icon: '▦' },
  { id: 'stipple', name: 'Stipple', icon: '⋮' },
  { id: 'waves', name: 'Waves', icon: '〰' },
  { id: 'zigzag', name: 'Zigzag', icon: '⚡' },
  { id: 'hearts', name: 'Hearts', icon: '❤️' },
  { id: 'stars', name: 'Stars', icon: '⭐' },
  { id: 'flowers', name: 'Flowers', icon: '🌸' },
  { id: 'scales', name: 'Scales', icon: '🐟' },
  { id: 'bubbles', name: 'Bubbles', icon: '🫧' },
  { id: 'confetti', name: 'Confetti', icon: '🎊' },
  { id: 'geometric', name: 'Geometric', icon: '◇' },
  { id: 'wood', name: 'Wood Grain', icon: '🪵' }
];

export function createAdvancedTexture(type) {
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');
  
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, 100, 100);

  switch (type) {
    case 'dots':
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          ctx.fillStyle = 'rgba(0,0,0,0.3)';
          ctx.beginPath();
          ctx.arc(i * 10 + 5, j * 10 + 5, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
      
    case 'stripes':
      for (let i = 0; i < 10; i++) {
        ctx.fillStyle = i % 2 === 0 ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0)';
        ctx.fillRect(i * 10, 0, 10, 100);
      }
      break;
      
    case 'crosshatch':
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 10, 0);
        ctx.lineTo(i * 10, 100);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * 10);
        ctx.lineTo(100, i * 10);
        ctx.stroke();
      }
      break;
      
    case 'noise':
      const imgData = ctx.createImageData(100, 100);
      for (let i = 0; i < imgData.data.length; i += 4) {
        const noise = Math.random() * 50;
        imgData.data[i] = noise;
        imgData.data[i + 1] = noise;
        imgData.data[i + 2] = noise;
        imgData.data[i + 3] = 100;
      }
      ctx.putImageData(imgData, 0, 0);
      break;
      
    case 'stipple':
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const size = Math.random() * 1.5 + 0.5;
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
      
    case 'waves':
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = 2;
      for (let y = 10; y < 100; y += 15) {
        ctx.beginPath();
        for (let x = 0; x < 100; x += 2) {
          const wave = Math.sin(x * 0.1) * 5;
          ctx.lineTo(x, y + wave);
        }
        ctx.stroke();
      }
      break;
      
    case 'zigzag':
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 2;
      for (let y = 0; y < 100; y += 20) {
        ctx.beginPath();
        for (let x = 0; x < 100; x += 10) {
          ctx.lineTo(x, y + (x % 20 === 0 ? 10 : 0));
        }
        ctx.stroke();
      }
      break;
      
    case 'hearts':
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          const x = i * 20 + 10;
          const y = j * 20 + 10;
          ctx.fillStyle = 'rgba(255,0,0,0.2)';
          ctx.font = '12px Arial';
          ctx.fillText('♥', x, y);
        }
      }
      break;
      
    case 'stars':
      for (let i = 0; i < 8; i++) {
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        ctx.fillStyle = 'rgba(255,215,0,0.3)';
        ctx.font = '10px Arial';
        ctx.fillText('★', x, y);
      }
      break;
      
    case 'flowers':
      for (let i = 0; i < 6; i++) {
        const x = Math.random() * 90 + 5;
        const y = Math.random() * 90 + 5;
        for (let p = 0; p < 6; p++) {
          const angle = (p / 6) * Math.PI * 2;
          const px = x + Math.cos(angle) * 4;
          const py = y + Math.sin(angle) * 4;
          ctx.fillStyle = 'rgba(255,182,193,0.3)';
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = 'rgba(255,215,0,0.4)';
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
      
    case 'scales':
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          const x = i * 12 + (j % 2) * 6;
          const y = j * 12;
          ctx.strokeStyle = 'rgba(0,0,0,0.2)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      break;
      
    case 'bubbles':
      for (let i = 0; i < 12; i++) {
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const r = Math.random() * 8 + 3;
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(135,206,250,0.1)';
        ctx.fill();
      }
      break;
      
    case 'confetti':
      for (let i = 0; i < 30; i++) {
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const w = Math.random() * 4 + 2;
        const h = Math.random() * 6 + 3;
        const hue = Math.random() * 360;
        ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.5)`;
        ctx.fillRect(x, y, w, h);
      }
      break;
      
    case 'geometric':
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          const x = i * 20 + 10;
          const y = j * 20 + 10;
          ctx.strokeStyle = 'rgba(0,0,0,0.25)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x, y - 6);
          ctx.lineTo(x + 6, y);
          ctx.lineTo(x, y + 6);
          ctx.lineTo(x - 6, y);
          ctx.closePath();
          ctx.stroke();
        }
      }
      break;
      
    case 'wood':
      for (let y = 0; y < 100; y += 2) {
        const wave1 = Math.sin(y * 0.08) * 3;
        const wave2 = Math.sin(y * 0.15 + 1) * 2;
        const opacity = 0.1 + Math.random() * 0.1;
        ctx.strokeStyle = `rgba(101, 67, 33, ${opacity})`;
        ctx.lineWidth = 1 + Math.random() * 1;
        ctx.beginPath();
        ctx.moveTo(wave1 + wave2, y);
        ctx.lineTo(100 + wave1 + wave2, y);
        ctx.stroke();
      }
      break;
  }
  
  return canvas;
}

export default function AdvancedTextures({ selectedTexture, onTextureChange, textureIntensity, onIntensityChange }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">🎨 Texture Library</h3>
      
      <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto p-2 bg-gray-50 rounded-lg">
        {TEXTURE_PATTERNS.map((texture) => (
          <Button
            key={texture.id}
            variant={selectedTexture === texture.id ? 'default' : 'outline'}
            onClick={() => {
              if (texture.id === 'none') {
                onTextureChange(null);
              } else {
                const pattern = createAdvancedTexture(texture.id);
                pattern.id = texture.id;
                onTextureChange(pattern);
              }
            }}
            className="flex flex-col items-center justify-center h-16 p-1"
            size="sm"
          >
            <span className="text-lg mb-1">{texture.icon}</span>
            <span className="text-[10px]">{texture.name}</span>
          </Button>
        ))}
      </div>
      
      {selectedTexture && selectedTexture !== 'none' && (
        <div>
          <label className="text-xs text-gray-600">
            Texture Intensity: {Math.round(textureIntensity * 100)}%
          </label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={textureIntensity}
            onChange={(e) => onIntensityChange(parseFloat(e.target.value))}
            className="w-full accent-purple-500"
          />
        </div>
      )}
    </div>
  );
}