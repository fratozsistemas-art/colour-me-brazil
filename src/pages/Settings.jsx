import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Volume2, Info, Shield, HelpCircle } from 'lucide-react';

export default function Settings() {
  return (
    <div className="max-w-4xl mx-auto pb-24 md:pb-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Settings</h1>

      {/* Language Settings */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Globe className="w-6 h-6 text-blue-600" />
          Language / Idioma
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              App Language
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="default" className="justify-start">
                🇺🇸 English
              </Button>
              <Button variant="outline" className="justify-start">
                🇧🇷 Português
              </Button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Narration Language
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="default" className="justify-start">
                🇺🇸 English
              </Button>
              <Button variant="outline" className="justify-start">
                🇧🇷 Português
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Audio Settings */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Volume2 className="w-6 h-6 text-green-600" />
          Audio Settings
        </h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">Auto-play Narration</div>
              <div className="text-sm text-gray-600">Start audio automatically when opening a page</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
          <div className="pt-4 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Narration Speed
            </label>
            <input
              type="range"
              min="0.75"
              max="1.5"
              step="0.25"
              defaultValue="1"
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.75x</span>
              <span>1.0x</span>
              <span>1.5x</span>
            </div>
          </div>
        </div>
      </Card>

      {/* About */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Info className="w-6 h-6 text-purple-600" />
          About
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Version</span>
            <span className="font-medium">1.0.0 (MVP)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Platform</span>
            <span className="font-medium">Base44 Web App</span>
          </div>
          <div className="pt-3 border-t">
            <Button variant="outline" className="w-full mb-2">
              <HelpCircle className="w-4 h-4 mr-2" />
              Help & Support
            </Button>
            <Button variant="outline" className="w-full">
              <Shield className="w-4 h-4 mr-2" />
              Privacy Policy
            </Button>
          </div>
        </div>
      </Card>

      {/* App Info */}
      <div className="text-center text-sm text-gray-500 mt-8">
        <p className="mb-2">Colour Me Brazil</p>
        <p>Explore Brazilian Culture Through Interactive Art 🇧🇷</p>
        <p className="mt-4">Made with ❤️ for children around the world</p>
      </div>
    </div>
  );
}