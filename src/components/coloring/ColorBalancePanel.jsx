import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Palette, RotateCw } from 'lucide-react';

export default function ColorBalancePanel({ onApply }) {
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(100);
  const [redBalance, setRedBalance] = useState(0);
  const [greenBalance, setGreenBalance] = useState(0);
  const [blueBalance, setBlueBalance] = useState(0);
  const [contrast, setContrast] = useState(100);
  const [warmth, setWarmth] = useState(0);

  const handleReset = () => {
    setHue(0);
    setSaturation(100);
    setLightness(100);
    setRedBalance(0);
    setGreenBalance(0);
    setBlueBalance(0);
    setContrast(100);
    setWarmth(0);
  };

  const handleApply = () => {
    onApply({
      hue,
      saturation,
      lightness,
      redBalance,
      greenBalance,
      blueBalance,
      contrast,
      warmth
    });
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Color Balance & Adjustment
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="gap-1"
        >
          <RotateCw className="w-3 h-3" />
          Reset
        </Button>
      </div>

      <div className="space-y-4">
        {/* HSL Controls */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-purple-700 uppercase">HSL Adjustments</p>
          
          <div>
            <div className="flex justify-between text-xs mb-1">
              <label className="text-gray-700 font-medium">Hue</label>
              <span className="text-gray-500">{hue}°</span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              value={hue}
              onChange={(e) => setHue(Number(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
              }}
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <label className="text-gray-700 font-medium">Saturation</label>
              <span className="text-gray-500">{saturation}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              value={saturation}
              onChange={(e) => setSaturation(Number(e.target.value))}
              className="w-full accent-pink-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <label className="text-gray-700 font-medium">Lightness</label>
              <span className="text-gray-500">{lightness}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              value={lightness}
              onChange={(e) => setLightness(Number(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>
        </div>

        {/* RGB Balance */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-purple-700 uppercase">RGB Balance</p>
          
          <div>
            <div className="flex justify-between text-xs mb-1">
              <label className="text-red-600 font-medium">Red</label>
              <span className="text-gray-500">{redBalance > 0 ? '+' : ''}{redBalance}</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={redBalance}
              onChange={(e) => setRedBalance(Number(e.target.value))}
              className="w-full accent-red-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <label className="text-green-600 font-medium">Green</label>
              <span className="text-gray-500">{greenBalance > 0 ? '+' : ''}{greenBalance}</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={greenBalance}
              onChange={(e) => setGreenBalance(Number(e.target.value))}
              className="w-full accent-green-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <label className="text-blue-600 font-medium">Blue</label>
              <span className="text-gray-500">{blueBalance > 0 ? '+' : ''}{blueBalance}</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={blueBalance}
              onChange={(e) => setBlueBalance(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>
        </div>

        {/* Advanced Controls */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-purple-700 uppercase">Advanced</p>
          
          <div>
            <div className="flex justify-between text-xs mb-1">
              <label className="text-gray-700 font-medium">Contrast</label>
              <span className="text-gray-500">{contrast}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="150"
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <label className="text-gray-700 font-medium">Warmth</label>
              <span className="text-gray-500">
                {warmth === 0 ? 'Neutral' : warmth > 0 ? `Warm +${warmth}` : `Cool ${warmth}`}
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={warmth}
              onChange={(e) => setWarmth(Number(e.target.value))}
              className="w-full accent-orange-500"
            />
          </div>
        </div>

        {/* Quick Presets */}
        <div>
          <p className="text-xs font-semibold text-purple-700 uppercase mb-2">Quick Presets</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setHue(0);
                setSaturation(150);
                setLightness(110);
                setWarmth(20);
              }}
            >
              🌞 Vibrant
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setHue(0);
                setSaturation(70);
                setLightness(90);
                setWarmth(-20);
              }}
            >
              🌙 Muted
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setHue(10);
                setSaturation(120);
                setLightness(105);
                setWarmth(30);
              }}
            >
              🔥 Warm
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setHue(-10);
                setSaturation(110);
                setLightness(95);
                setWarmth(-30);
              }}
            >
              ❄️ Cool
            </Button>
          </div>
        </div>
      </div>

      <Button
        onClick={handleApply}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
      >
        Apply Color Balance
      </Button>
    </Card>
  );
}