import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Sparkles } from 'lucide-react';

export default function StoryChoiceDialog({ choices, onChoiceSelect, language = 'en' }) {
  if (!choices || choices.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25 }}
        >
          <Card className="max-w-2xl w-full p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <h3 className="text-2xl font-bold text-purple-900">
                {language === 'en' ? 'What do you want to do?' : 'O que você quer fazer?'}
              </h3>
            </div>

            <div className="space-y-3">
              {choices.map((choice, index) => (
                <motion.div
                  key={choice.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Button
                    onClick={() => onChoiceSelect(choice)}
                    className="w-full text-left p-4 h-auto bg-white hover:bg-purple-100 border-2 border-purple-200 hover:border-purple-400 transition-all group"
                    variant="outline"
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium leading-relaxed">
                          {language === 'en' ? choice.choice_text_en : choice.choice_text_pt}
                        </p>
                        {choice.consequence && (
                          <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {language === 'en' ? 'This choice will affect the story' : 'Esta escolha afetará a história'}
                          </p>
                        )}
                      </div>
                    </div>
                  </Button>
                </motion.div>
              ))}
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              {language === 'en' 
                ? 'Choose wisely - your decisions shape the story!' 
                : 'Escolha com sabedoria - suas decisões moldam a história!'}
            </p>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}