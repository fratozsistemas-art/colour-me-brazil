import React from 'react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Star, TrendingUp, Award } from 'lucide-react';
import { calculateLevel, getPointsForNextLevel } from '../achievementManager';
import { BRAZILIAN_FAUNA_AVATARS } from '../profile/BrazilianFaunaAvatars';

export default function LevelProgressBar({ profile, showDetails = true }) {
  const currentPoints = profile.total_points || 0;
  const currentLevel = profile.level || 1;
  const avatarIcon = profile?.avatar_icon || 'toucan';
  const pointsForNextLevel = getPointsForNextLevel(currentLevel);
  const pointsInCurrentLevel = currentPoints % 500;
  const progress = (pointsInCurrentLevel / 500) * 100;
  
  // Find avatar data
  const avatar = BRAZILIAN_FAUNA_AVATARS.find(a => a.id === avatarIcon) || BRAZILIAN_FAUNA_AVATARS[0];
  
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
  
  // Avatar styling based on level
  const getAvatarStyle = () => {
    if (currentLevel >= 10) {
      return {
        size: 'text-5xl',
        border: 'border-4 border-purple-500',
        bg: 'bg-gradient-to-br from-purple-100 to-pink-100',
        glow: 'shadow-2xl shadow-purple-500/50',
        ring: 'ring-4 ring-purple-400/30'
      };
    } else if (currentLevel >= 7) {
      return {
        size: 'text-4xl',
        border: 'border-4 border-blue-500',
        bg: 'bg-gradient-to-br from-blue-100 to-cyan-100',
        glow: 'shadow-xl shadow-blue-500/40',
        ring: 'ring-3 ring-blue-400/20'
      };
    } else if (currentLevel >= 4) {
      return {
        size: 'text-3xl',
        border: 'border-3 border-green-500',
        bg: 'bg-gradient-to-br from-green-100 to-teal-100',
        glow: 'shadow-lg shadow-green-500/30',
        ring: 'ring-2 ring-green-400/20'
      };
    } else {
      return {
        size: 'text-2xl',
        border: 'border-2 border-gray-300',
        bg: 'bg-gradient-to-br from-gray-100 to-gray-200',
        glow: 'shadow-md',
        ring: ''
      };
    }
  };
  
  const avatarStyle = getAvatarStyle();
  
  if (!showDetails) {
    return (
      <div className="w-full bg-white rounded-lg p-3 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <motion.div 
            className={`w-12 h-12 rounded-full flex items-center justify-center ${avatarStyle.border} ${avatarStyle.bg} ${avatarStyle.glow} ${avatarStyle.ring} relative`}
            whileHover={{ scale: 1.05 }}
          >
            <span className={avatarStyle.size}>{avatar.emoji}</span>
            <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-md">
              {currentLevel}
            </div>
          </motion.div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-gray-800">{profile?.child_name || 'Explorer'}</span>
              <span className="text-xs text-gray-500">• Level {currentLevel}</span>
            </div>
            <div className="text-xs text-gray-600 mb-1">{getLevelTitle(currentLevel)}</div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r ${getLevelColor(currentLevel)}`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-yellow-600">
              <Star className="w-3 h-3 fill-current" />
              <span className="font-bold text-sm">{currentPoints}</span>
            </div>
            <p className="text-xs text-gray-500">XP</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <Card className="p-6 bg-gradient-to-br from-white to-gray-50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <motion.div 
            className={`w-20 h-20 rounded-2xl flex items-center justify-center ${avatarStyle.border} ${avatarStyle.bg} ${avatarStyle.glow} ${avatarStyle.ring} relative`}
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <span className="text-6xl">{avatar.emoji}</span>
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">
              {currentLevel}
            </div>
          </motion.div>
          <div>
            <h3 className="font-bold text-2xl text-gray-800">
              {profile?.child_name || 'Explorer'}
            </h3>
            <p className="text-lg text-gray-600">
              Level {currentLevel} • {getLevelTitle(currentLevel)}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-1 text-yellow-600 mb-1">
            <Star className="w-5 h-5 fill-current" />
            <span className="font-bold text-2xl">{currentPoints.toLocaleString()}</span>
          </div>
          <p className="text-sm text-gray-500">Total XP</p>
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