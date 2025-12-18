import React from 'react';
import { X, Info, MapPin, FileText, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

export default function AvatarInfoModal({ avatar, language = 'en', onClose }) {
  if (!avatar) return null;

  const isEnglish = language === 'en';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="text-6xl">{avatar.emoji}</div>
                  <div>
                    <h2 className="text-3xl font-bold">
                      {isEnglish ? avatar.nameEn : avatar.namePt}
                    </h2>
                    <p className="text-white/90 italic text-sm mt-1">{avatar.scientificName}</p>
                    <p className="text-white/80 text-sm mt-2">
                      {isEnglish ? avatar.taglineEn : avatar.taglinePt}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Habitat */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <h3 className="text-xl font-bold text-gray-800">
                    {isEnglish ? 'Habitat' : 'Habitat'}
                  </h3>
                </div>
                <p className="text-gray-700 leading-relaxed pl-7">
                  {isEnglish ? avatar.habitatEn : avatar.habitatPt}
                </p>
              </div>

              {/* Characteristics */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-800">
                    {isEnglish ? 'Characteristics' : 'Características'}
                  </h3>
                </div>
                <p className="text-gray-700 leading-relaxed pl-7">
                  {isEnglish ? avatar.characteristicsEn : avatar.characteristicsPt}
                </p>
              </div>

              {/* Conservation Status */}
              <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-bold text-gray-800">
                    {isEnglish ? 'Conservation Status' : 'Status de Conservação'}
                  </h3>
                </div>
                <p className="text-orange-900 font-semibold mb-2">
                  {isEnglish ? avatar.conservationStatusEn : avatar.conservationStatusPt}
                </p>
                <div className="flex items-start gap-2 mt-3">
                  <AlertTriangle className="w-4 h-4 text-orange-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-orange-800 mb-1">
                      {isEnglish ? 'Main Threats:' : 'Principais Ameaças:'}
                    </p>
                    <p className="text-sm text-orange-700">
                      {isEnglish ? avatar.conservationThreatsEn : avatar.conservationThreatsPt}
                    </p>
                  </div>
                </div>
              </div>

              {/* Fun Fact */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border-2 border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-bold text-gray-800">
                    {isEnglish ? 'Did You Know?' : 'Você Sabia?'}
                  </h3>
                </div>
                <p className="text-gray-700 text-sm">
                  {isEnglish 
                    ? 'These animals play important roles in their ecosystems and their conservation is crucial to maintaining biodiversity in Brazil and the Amazon.'
                    : 'Estes animais desempenham papéis importantes em seus ecossistemas e sua conservação é crucial para manter a biodiversidade do Brasil e da Amazônia.'}
                </p>
              </div>

              {/* Close Button */}
              <div className="pt-4">
                <Button
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  size="lg"
                >
                  {isEnglish ? 'Close' : 'Fechar'}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}