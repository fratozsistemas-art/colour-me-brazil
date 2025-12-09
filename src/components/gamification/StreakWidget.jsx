import React from 'react';
import { Card } from '@/components/ui/card';
import { Flame, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StreakWidget({ currentStreak = 0, longestStreak = 0 }) {
  const getStreakColor = (streak) => {
    if (streak >= 30) return 'from-purple-500 to-pink-500';
    if (streak >= 14) return 'from-orange-500 to-red-500';
    if (streak >= 7) return 'from-yellow-500 to-orange-500';
    if (streak >= 3) return 'from-blue-500 to-cyan-500';
    return 'from-gray-400 to-gray-500';
  };

  const getStreakEmoji = (streak) => {
    if (streak >= 30) return '👑';
    if (streak >= 14) return '🏆';
    if (streak >= 7) return '⭐';
    if (streak >= 3) return '🔥';
    return '🌟';
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Current Streak */}
      <Card className={`p-4 bg-gradient-to-br ${getStreakColor(currentStreak)} text-white overflow-hidden relative`}>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5" />
            <span className="text-sm font-medium">Current Streak</span>
          </div>
          <div className="flex items-baseline gap-2">
            <motion.span
              key={currentStreak}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-4xl font-bold"
            >
              {currentStreak}
            </motion.span>
            <span className="text-lg opacity-90">days</span>
          </div>
          <p className="text-xs opacity-80 mt-1">Keep it up!</p>
        </div>
        <motion.div
          className="absolute -right-4 -bottom-4 text-8xl opacity-20"
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {getStreakEmoji(currentStreak)}
        </motion.div>
      </Card>

      {/* Longest Streak */}
      <Card className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white overflow-hidden relative">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5" />
            <span className="text-sm font-medium">Best Streak</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{longestStreak}</span>
            <span className="text-lg opacity-90">days</span>
          </div>
          <p className="text-xs opacity-80 mt-1">Personal record!</p>
        </div>
        <div className="absolute -right-4 -bottom-4 text-8xl opacity-20">
          🏅
        </div>
      </Card>
    </div>
  );
}