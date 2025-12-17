import React from 'react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Star, TrendingUp, Award } from 'lucide-react';
import { calculateLevel, getPointsForNextLevel } from '../achievementManager';

export default function LevelProgressBar({ profile, showDetails = true }) {
  const currentPoints = profile.total_points || 0;
  const currentLevel = profile.level || 1;
  const pointsForNextLevel = getPointsForNextLevel(currentLevel);
  const pointsInCurrentLevel = currentPoints % 500;
  const progress = (pointsInCurrentLevel / 500) * 100;
  
  const levelTitles = {
    1: { en: 'Novice Explorer', pt: 'Explorador Novato' },
    2: { en: 'Curious Artist', pt: 'Artista Curioso' },
    3: { en: 'Skilled Creator', pt: 'Criador Habilidoso' },
    4: { en: 'Cultural Enthusiast', pt: 'Entusiasta Cultural' },
    5: { en: 'Master Storyteller', pt: 'Mestre Contador' },
    6: { en: 'Brazilian Legend', pt: 'Lenda Brasileira' }
  };
  
  const getLevelTitle = (level) => {
    const lang = profile.preferred_language || 'en';
    if (level <= 6) return levelTitles[level][lang];
    return lang === 'en' ? 'Grand Master' : 'Grande Mestre';
  };
  
  const getLevelColor = (level) => {
    if (level <= 2) return 'from-gray-400 to-gray-500';
    if (level <= 4) return 'from-green-400 to-green-600';
    if (level <= 6) return 'from-blue-400 to-blue-600';
    if (level <= 8) return 'from-purple-400 to-purple-600';
    return 'from-yellow-400 to-yellow-600';
  };
  
  if (!showDetails) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getLevelColor(currentLevel)} flex items-center justify-center text-white font-bold text-sm`}>
              {currentLevel}
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {getLevelTitle(currentLevel)}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {pointsInCurrentLevel}/{500} XP
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${getLevelColor(currentLevel)}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>
    );
  }
  
  return (
    <Card className="p-6 bg-gradient-to-br from-white to-gray-50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            className={`w-16 h-16 rounded-full bg-gradient-to-br ${getLevelColor(currentLevel)} flex items-center justify-center text-white font-bold text-2xl shadow-lg`}
            whileHover={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {currentLevel}
          </motion.div>
          <div>
            <h3 className="font-bold text-xl text-gray-800">
              {getLevelTitle(currentLevel)}
            </h3>
            <p className="text-sm text-gray-600">Level {currentLevel}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-1 text-yellow-600 mb-1">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-bold text-lg">{currentPoints.toLocaleString()}</span>
          </div>
          <p className="text-xs text-gray-500">Total XP</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Progress to Level {currentLevel + 1}</span>
          <span className="font-semibold text-gray-700">
            {pointsInCurrentLevel}/{500} XP
          </span>
        </div>
        
        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${getLevelColor(currentLevel)} relative`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </motion.div>
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <TrendingUp className="w-3 h-3" />
            <span>{500 - pointsInCurrentLevel} XP to next level</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Award className="w-3 h-3" />
            <span>Unlock at Level {currentLevel + 1}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}