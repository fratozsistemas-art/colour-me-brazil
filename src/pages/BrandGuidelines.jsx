import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BrandGuidelines() {
  const [copiedColor, setCopiedColor] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(id);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const primaryColors = [
    { name: 'Sunset Orange', hex: '#FF6B35', rgb: '255, 107, 53', usage: 'Headlines, CTAs principais, destaque' },
    { name: 'Tropical Coral', hex: '#FF8C42', rgb: '255, 140, 66', usage: 'Gradientes, hover states' },
    { name: 'Golden Mango', hex: '#FFD23F', rgb: '255, 210, 63', usage: 'Ícones, badges, gamificação' }
  ];

  const secondaryColors = [
    { name: 'Ocean Blue', hex: '#2E86AB', rgb: '46, 134, 171', usage: 'Corporativo, confiança' },
    { name: 'Tropical Teal', hex: '#06A77D', rgb: '6, 167, 125', usage: 'Sucesso, elementos naturais' },
    { name: 'Rainforest Green', hex: '#A8DADC', rgb: '168, 218, 220', usage: 'Backgrounds suaves' }
  ];

  const neutralColors = [
    { name: 'Cloud White', hex: '#F8F9FA', rgb: '248, 249, 250', usage: 'Backgrounds principais' },
    { name: 'Cream Canvas', hex: '#FFF8F0', rgb: '255, 248, 240', usage: 'Cards premium' },
    { name: 'Charcoal Slate', hex: '#1A2332', rgb: '26, 35, 50', usage: 'Texto principal' },
    { name: 'Storm Grey', hex: '#6C757D', rgb: '108, 117, 125', usage: 'Texto secundário' }
  ];

  const gradients = [
    { name: 'Tropical Sunset', css: 'linear-gradient(135deg, #FF6B35 0%, #FFD23F 100%)', usage: 'Headers hero, CTAs premium' },
    { name: 'Ocean Depths', css: 'linear-gradient(135deg, #2E86AB 0%, #06A77D 100%)', usage: 'Seções corporativas' },
    { name: 'Coral Reef', css: 'linear-gradient(135deg, #FF8C42 0%, #06A77D 100%)', usage: 'Gamificação' },
    { name: 'Sky Breeze', css: 'linear-gradient(135deg, #A8DADC 0%, #F8F9FA 100%)', usage: 'Backgrounds suaves' }
  ];

  const ColorCard = ({ color, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div
          className="w-full h-32 rounded-lg mb-4 shadow-md"
          style={{ backgroundColor: color.hex }}
        />
        <h3 className="font-bold text-lg text-gray-800 mb-2">{color.name}</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">HEX:</span>
            <button
              onClick={() => copyToClipboard(color.hex, `${color.name}-hex`)}
              className="flex items-center gap-2 font-mono font-semibold hover:text-green-600 transition-colors"
            >
              {color.hex}
              {copiedColor === `${color.name}-hex` ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">RGB:</span>
            <span className="font-mono text-gray-800">{color.rgb}</span>
          </div>
          <p className="text-xs text-gray-500 mt-3 pt-3 border-t">
            <strong>Uso:</strong> {color.usage}
          </p>
        </div>
      </Card>
    </motion.div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-24 md:pb-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4" style={{ 
          background: 'linear-gradient(135deg, #FF6B35 0%, #2E86AB 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Colour Me Brazil
        </h1>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Brand Guidelines</h2>
        <p className="text-gray-600">Identidade Cromática Tropical</p>
      </div>

      {/* Primary Colors */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          🔥 Paleta Primária
          <span className="text-sm font-normal text-gray-500">(Core Brand Colors)</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {primaryColors.map((color, index) => (
            <ColorCard key={color.name} color={color} index={index} />
          ))}
        </div>
      </section>

      {/* Secondary Colors */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          🌊 Paleta Secundária
          <span className="text-sm font-normal text-gray-500">(Supporting Colors)</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {secondaryColors.map((color, index) => (
            <ColorCard key={color.name} color={color} index={index} />
          ))}
        </div>
      </section>

      {/* Neutral Colors */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          🤍 Paleta Neutra
          <span className="text-sm font-normal text-gray-500">(Foundation Colors)</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {neutralColors.map((color, index) => (
            <ColorCard key={color.name} color={color} index={index} />
          ))}
        </div>
      </section>

      {/* Gradients */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">🎨 Gradientes Oficiais</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {gradients.map((gradient, index) => (
            <motion.div
              key={gradient.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div
                  className="w-full h-32 rounded-lg mb-4 shadow-md"
                  style={{ background: gradient.css }}
                />
                <h3 className="font-bold text-lg text-gray-800 mb-2">{gradient.name}</h3>
                <button
                  onClick={() => copyToClipboard(gradient.css, gradient.name)}
                  className="flex items-center gap-2 text-sm font-mono text-gray-600 hover:text-green-600 transition-colors mb-3"
                >
                  {gradient.css}
                  {copiedColor === gradient.name ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <p className="text-xs text-gray-500">
                  <strong>Uso:</strong> {gradient.usage}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Usage Guidelines */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">📐 Hierarquia Cromática</h2>
        <Card className="p-8 bg-gradient-to-br from-orange-50 to-blue-50">
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-lg mb-2">Regra 60-30-10</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-lg">
                  <div className="font-bold text-2xl mb-2" style={{ color: '#2E86AB' }}>60%</div>
                  <p className="text-sm text-gray-600">Base/Fundo - Cloud White, Cream Canvas</p>
                </div>
                <div className="p-4 bg-white rounded-lg">
                  <div className="font-bold text-2xl mb-2" style={{ color: '#FF6B35' }}>30%</div>
                  <p className="text-sm text-gray-600">Cor Principal - Ocean Blue ou Sunset Orange</p>
                </div>
                <div className="p-4 bg-white rounded-lg">
                  <div className="font-bold text-2xl mb-2" style={{ color: '#06A77D' }}>10%</div>
                  <p className="text-sm text-gray-600">Acentos - Coral, Mango, Teal</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t">
              <h3 className="font-bold text-lg mb-4">Combinações Estratégicas</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg">
                  <h4 className="font-semibold mb-2" style={{ color: '#FF6B35' }}>High Energy (CTAs)</h4>
                  <p className="text-sm text-gray-600">Sunset Orange + Ocean Blue + Golden Mango</p>
                </div>
                <div className="p-4 bg-white rounded-lg">
                  <h4 className="font-semibold mb-2" style={{ color: '#2E86AB' }}>Professional Trust</h4>
                  <p className="text-sm text-gray-600">Ocean Blue + Charcoal + Tropical Teal</p>
                </div>
                <div className="p-4 bg-white rounded-lg">
                  <h4 className="font-semibold mb-2" style={{ color: '#FF8C42' }}>Creative Playful</h4>
                  <p className="text-sm text-gray-600">Tropical Coral + Teal + Golden Mango</p>
                </div>
                <div className="p-4 bg-white rounded-lg">
                  <h4 className="font-semibold mb-2" style={{ color: '#1A2332' }}>Premium Elegance</h4>
                  <p className="text-sm text-gray-600">Ocean Blue + Sunset Orange + Cloud White</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}