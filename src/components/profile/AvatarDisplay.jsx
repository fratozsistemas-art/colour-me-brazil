import React from 'react';
import { motion } from 'framer-motion';
import { BRAZILIAN_FAUNA_AVATARS } from './BrazilianFaunaAvatars';
import { Sparkles } from 'lucide-react';

export default function AvatarDisplay({ avatarId, level = 1, size = 'medium', showName = false, language = 'en' }) {
  const avatar = BRAZILIAN_FAUNA_AVATARS.find(a => a.id === avatarId) || BRAZILIAN_FAUNA_AVATARS[0];
  
  // Size configurations
  const sizeConfig = {
    small: { container: 'w-12 h-12', emoji: 'text-2xl', name: 'text-xs' },
    medium: { container: 'w-16 h-16', emoji: 'text-4xl', name: 'text-sm' },
    large: { container: 'w-24 h-24', emoji: 'text-6xl', name: 'text-base' },
    xlarge: { container: 'w-32 h-32', emoji: 'text-8xl', name: 'text-lg' }
  };
  
  const config = sizeConfig[size] || sizeConfig.medium;
  
  // Level-based styling
  const getLevelStyle = () => {
    if (level >= 10) {
      return {
        border: 'border-4 border-purple-500',
        bg: 'bg-gradient-to-br from-purple-100 via-pink-100 to-purple-200',
        glow: 'shadow-2xl shadow-purple-500/50',
        ring: 'ring-4 ring-purple-400/30',
        badge: '✨',
        badgeColor: 'bg-purple-500',
        title: language === 'en' ? 'Legend' : 'Lenda'
      };
    } else if (level >= 7) {
      return {
        border: 'border-4 border-blue-500',
        bg: 'bg-gradient-to-br from-blue-100 via-cyan-100 to-blue-200',
        glow: 'shadow-xl shadow-blue-500/40',
        ring: 'ring-3 ring-blue-400/20',
        badge: '⭐',
        badgeColor: 'bg-blue-500',
        title: language === 'en' ? 'Expert' : 'Especialista'
      };
    } else if (level >= 4) {
      return {
        border: 'border-3 border-green-500',
        bg: 'bg-gradient-to-br from-green-100 via-teal-100 to-green-200',
        glow: 'shadow-lg shadow-green-500/30',
        ring: 'ring-2 ring-green-400/20',
        badge: '🌟',
        badgeColor: 'bg-green-500',
        title: language === 'en' ? 'Explorer' : 'Explorador'
      };
    } else {
      return {
        border: 'border-2 border-gray-300',
        bg: 'bg-gradient-to-br from-gray-100 to-gray-200',
        glow: 'shadow-md',
        ring: '',
        badge: '🌱',
        badgeColor: 'bg-gray-400',
        title: language === 'en' ? 'Novice' : 'Novato'
      };
    }
  };
  
  const levelStyle = getLevelStyle();
  
  return (
    <div className="relative inline-block">
      <motion.div
        className={`${config.container} rounded-full flex items-center justify-center ${levelStyle.border} ${levelStyle.bg} ${levelStyle.glow} ${levelStyle.ring} relative overflow-visible`}
        whileHover={{ scale: 1.05, rotate: 5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <span className={config.emoji}>{avatar.emoji}</span>
        
        {/* Level Badge */}
        <div className={`absolute -top-1 -right-1 ${levelStyle.badgeColor} text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg`}>
          {level}
        </div>
        
        {/* Sparkle Effect for high levels */}
        {level >= 7 && (
          <motion.div
            className="absolute -top-2 -right-2"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </motion.div>
        )}
      </motion.div>
      
      {/* Name and Title */}
      {showName && (
        <div className="text-center mt-2">
          <p className={`font-semibold text-gray-800 ${config.name}`}>
            {language === 'en' ? avatar.nameEn : avatar.namePt}
          </p>
          <p className="text-xs text-gray-500">{levelStyle.title}</p>
        </div>
      )}
    </div>
  );
}