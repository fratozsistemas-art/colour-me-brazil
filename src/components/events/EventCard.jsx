import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Trophy, Clock, Star, CheckCircle2 } from 'lucide-react';

export default function EventCard({ event, progress, language = 'en', onJoin }) {
  const title = language === 'en' ? event.title_en : event.title_pt;
  const description = language === 'en' ? event.description_en : event.description_pt;
  const currentProgress = progress?.current_progress || 0;
  const isCompleted = progress?.is_completed || false;
  const progressPercent = Math.min((currentProgress / event.goal_value) * 100, 100);

  const now = new Date();
  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);
  const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
  const isActive = now >= startDate && now <= endDate && event.is_active;

  return (
    <motion.div whileHover={{ scale: 1.02 }} className="h-full">
      <Card className={`p-6 h-full flex flex-col relative overflow-hidden ${
        isCompleted ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400' :
        isActive ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-400' :
        'bg-gray-50 border-2 border-gray-300 opacity-60'
      }`}>
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          {isCompleted ? (
            <div className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-full text-xs font-bold">
              <CheckCircle2 className="w-3 h-3" />
              Completed
            </div>
          ) : isActive ? (
            <div className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-bold">
              <Clock className="w-3 h-3" />
              {daysLeft}d left
            </div>
          ) : (
            <div className="px-3 py-1 bg-gray-600 text-white rounded-full text-xs font-bold">
              Ended
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="text-4xl mb-3">{event.icon || '🎯'}</div>
          <h3 className="text-xl font-bold mb-2 text-gray-800">{title}</h3>
          <p className="text-sm text-gray-600 mb-4">{description}</p>

          {/* Progress Bar */}
          {isActive && !isCompleted && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span className="font-bold">{currentProgress} / {event.goal_value}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                />
              </div>
            </div>
          )}

          {/* Rewards */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-yellow-600 font-semibold">
              <Star className="w-4 h-4" />
              {event.reward_points} pts
            </div>
            {event.reward_cosmetic_id && (
              <div className="flex items-center gap-1 text-purple-600 font-semibold">
                <Trophy className="w-4 h-4" />
                Exclusive Reward
              </div>
            )}
          </div>
        </div>

        {isActive && !isCompleted && (
          <Button 
            onClick={onJoin}
            className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {progress ? 'Continue' : 'Join Event'}
          </Button>
        )}
      </Card>
    </motion.div>
  );
}