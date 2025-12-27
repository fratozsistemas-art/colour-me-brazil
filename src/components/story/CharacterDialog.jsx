import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Heart, Star, Gift, Zap } from 'lucide-react';

const emotionIcons = {
  happy: '😊',
  sad: '😢',
  excited: '🤩',
  curious: '🤔',
  friendly: '🤝',
  grateful: '🙏'
};

const interactionIcons = {
  dialogue: MessageCircle,
  question: Zap,
  gift: Gift,
  challenge: Star,
  emotion: Heart
};

export default function CharacterDialog({ 
  interaction, 
  onResponse, 
  onClose, 
  language = 'en' 
}) {
  const [selectedResponse, setSelectedResponse] = useState(null);
  const Icon = interactionIcons[interaction.interaction_type] || MessageCircle;

  const handleResponseSelect = (response) => {
    setSelectedResponse(response);
    setTimeout(() => {
      onResponse(response);
    }, 500);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center z-40 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl"
        >
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 shadow-2xl">
            {/* Character Header */}
            <div className="flex items-center gap-4 p-6 border-b border-blue-200 bg-white/50">
              {interaction.character_avatar_url && (
                <motion.img
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  src={interaction.character_avatar_url}
                  alt={language === 'en' ? interaction.character_name_en : interaction.character_name_pt}
                  className="w-16 h-16 rounded-full border-4 border-blue-400 shadow-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-blue-900">
                  {language === 'en' ? interaction.character_name_en : interaction.character_name_pt}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Icon className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-600 capitalize">
                    {interaction.interaction_type}
                  </span>
                </div>
              </div>
            </div>

            {/* Dialogue */}
            <div className="p-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-4 shadow-inner mb-4 border border-blue-100"
              >
                <p className="text-gray-800 leading-relaxed">
                  {language === 'en' ? interaction.dialogue_en : interaction.dialogue_pt}
                </p>
              </motion.div>

              {/* Response Options */}
              {interaction.response_options && interaction.response_options.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-600 mb-3">
                    {language === 'en' ? 'How do you respond?' : 'Como você responde?'}
                  </p>
                  {interaction.response_options.map((response, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      <Button
                        onClick={() => handleResponseSelect(response)}
                        disabled={selectedResponse !== null}
                        className={`w-full text-left p-3 h-auto justify-start ${
                          selectedResponse === response
                            ? 'bg-green-500 text-white border-green-600'
                            : 'bg-white hover:bg-blue-50 text-gray-800 border-blue-200'
                        } transition-all`}
                        variant="outline"
                      >
                        <div className="flex items-center gap-3">
                          {response.emotion && (
                            <span className="text-2xl">{emotionIcons[response.emotion] || '💬'}</span>
                          )}
                          <span className="flex-1">
                            {language === 'en' ? response.text_en : response.text_pt}
                          </span>
                        </div>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Simple Close Button if no responses */}
              {(!interaction.response_options || interaction.response_options.length === 0) && (
                <Button
                  onClick={onClose}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4"
                >
                  {language === 'en' ? 'Continue' : 'Continuar'}
                </Button>
              )}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}