import React from 'react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { getTierFromPoints, getNextTier, getTierProgress } from '../gamification/tierSystem';
import { Crown, Star, Sparkles } from 'lucide-react';

export default function TierDisplay({ points, showRewards = true }) {
  const currentTier = getTierFromPoints(points);
  const nextTier = getNextTier(points);
  const progress = getTierProgress(points);

  return (
    <Card className="p-6 relative overflow-hidden">
      {/* Background gradient based on tier */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br opacity-10 ${currentTier.color}`}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-5xl"
            >
              {currentTier.icon}
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{currentTier.name}</h3>
              <p className="text-sm text-gray-600">Tier {currentTier.tier}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-purple-600">{points.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Total Points</div>
          </div>
        </div>

        {/* Progress Bar */}
        {nextTier && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress to {nextTier.name}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full bg-gradient-to-r ${currentTier.color}`}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {nextTier.minPoints - points} points until next tier
            </p>
          </div>
        )}

        {/* Tier Rewards */}
        {showRewards && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              Tier Rewards
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {currentTier.rewards.profileBorder && (
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-8 h-8 rounded-full ${currentTier.borderStyle} bg-gradient-to-br ${currentTier.color}`} />
                  <span className="text-gray-700 capitalize">{currentTier.rewards.profileBorder} Border</span>
                </div>
              )}
              {currentTier.rewards.badge && (
                <div className="flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-gray-700">Special Badge</span>
                </div>
              )}
              {currentTier.rewards.title && (
                <div className="flex items-center gap-2 text-sm">
                  <Crown className="w-4 h-4 text-purple-500" />
                  <span className="text-gray-700">{currentTier.rewards.title}</span>
                </div>
              )}
              {currentTier.rewards.avatarFrame && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 rounded border-2 border-purple-500" />
                  <span className="text-gray-700">Avatar Frame</span>
                </div>
              )}
              {currentTier.rewards.specialEffect && (
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="w-4 h-4 text-pink-500" />
                  <span className="text-gray-700 capitalize">{currentTier.rewards.specialEffect} Effect</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}