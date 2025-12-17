import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle2, Trophy, Gift } from 'lucide-react';
import { getTodaysDailyQuest, checkQuestProgress } from './DailyQuestManager';
import confetti from 'canvas-confetti';

export default function DailyQuestCard({ profile }) {
  const [questData, setQuestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const language = profile?.preferred_language || 'en';
  
  useEffect(() => {
    loadQuest();
    const interval = setInterval(loadQuest, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [profile]);
  
  const loadQuest = async () => {
    if (!profile?.id) return;
    try {
      const data = await checkQuestProgress(profile.id);
      setQuestData(data);
    } catch (error) {
      console.error('Error loading quest:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (questData?.completed) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [questData?.completed]);
  
  if (loading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-purple-200 rounded w-3/4" />
          <div className="h-4 bg-purple-200 rounded w-1/2" />
        </div>
      </Card>
    );
  }
  
  if (!questData?.quest) {
    return null;
  }
  
  const { quest, progress, completed } = questData;
  const progressPercent = (progress.current / progress.target) * 100;
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={completed ? 'completed' : 'active'}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <Card className={`p-6 ${completed ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400' : 'bg-gradient-to-br from-purple-50 to-pink-50'}`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl ${completed ? 'bg-green-500' : 'bg-gradient-to-br from-purple-500 to-pink-500'} flex items-center justify-center text-2xl shadow-lg`}>
                {completed ? <CheckCircle2 className="w-7 h-7 text-white" /> : quest.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-gray-800">
                    {language === 'en' ? quest.name_en : quest.name_pt}
                  </h3>
                  {completed && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <Trophy className="w-5 h-5 text-yellow-500 fill-current" />
                    </motion.div>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {language === 'en' ? quest.description_en : quest.description_pt}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 rounded-full">
                <Sparkles className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-bold text-yellow-700">+{quest.reward_points}</span>
              </div>
              {quest.reward_item_id && (
                <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 rounded-full">
                  <Gift className="w-3 h-3 text-purple-600" />
                  <span className="text-xs font-semibold text-purple-700">
                    {language === 'en' ? 'Bonus Item' : 'Item Bônus'}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {completed ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 p-4 bg-green-100 rounded-lg"
            >
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-700">
                {language === 'en' ? 'Quest Completed! 🎉' : 'Missão Completa! 🎉'}
              </span>
            </motion.div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {language === 'en' ? 'Progress' : 'Progresso'}
                </span>
                <span className="font-bold text-purple-700">
                  {progress.current}/{progress.target}
                </span>
              </div>
              
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              
              <p className="text-xs text-center text-gray-500 mt-2">
                {language === 'en' 
                  ? `${progress.target - progress.current} more to complete!` 
                  : `Faltam ${progress.target - progress.current} para completar!`}
              </p>
            </div>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}