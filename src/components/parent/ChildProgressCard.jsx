import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Book, Palette, Trophy, Flame, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ChildProgressCard({ profile, stats, onSelect }) {
  const levelProgress = ((profile.total_points % 500) / 500) * 100;

  return (
    <motion.div whileHover={{ y: -4 }}>
      <Card 
        className="p-6 cursor-pointer hover:shadow-xl transition-all"
        onClick={() => onSelect(profile)}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">
              {profile.avatar_icon === 'jaguar' && '🐆'}
              {profile.avatar_icon === 'toucan' && '🦜'}
              {profile.avatar_icon === 'sloth' && '🦥'}
              {!['jaguar', 'toucan', 'sloth'].includes(profile.avatar_icon) && '👤'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{profile.child_name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-semibold">
                  Level {profile.level || 1}
                </span>
                <span className="text-yellow-600">⭐ {profile.total_points || 0} pts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Level Progress</span>
            <span>{Math.round(levelProgress)}%</span>
          </div>
          <Progress value={levelProgress} className="h-2" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
            <Book className="w-5 h-5 text-orange-600" />
            <div>
              <div className="text-lg font-bold text-orange-900">
                {profile.books_completed?.length || 0}
              </div>
              <div className="text-xs text-orange-700">Books</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
            <Palette className="w-5 h-5 text-purple-600" />
            <div>
              <div className="text-lg font-bold text-purple-900">
                {profile.pages_colored?.length || 0}
              </div>
              <div className="text-xs text-purple-700">Pages</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
            <Trophy className="w-5 h-5 text-green-600" />
            <div>
              <div className="text-lg font-bold text-green-900">
                {stats?.achievements || 0}
              </div>
              <div className="text-xs text-green-700">Achievements</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
            <Flame className="w-5 h-5 text-red-600" />
            <div>
              <div className="text-lg font-bold text-red-900">
                {profile.current_streak || 0}
              </div>
              <div className="text-xs text-red-700">Day Streak</div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}