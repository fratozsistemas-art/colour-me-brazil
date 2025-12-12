import React from 'react';
import { Card } from '@/components/ui/card';
import { BookOpen, Palette, Award, Clock, Trophy, TrendingUp, Target } from 'lucide-react';

export default function ChildProgressOverview({ profile, activityLogs = [], quizResults = [] }) {
  const totalReadingMinutes = Math.round((profile.total_reading_time || 0) / 60);
  const totalColoringMinutes = Math.round((profile.total_coloring_time || 0) / 60);
  const quizAccuracy = profile.quizzes_attempted > 0 
    ? Math.round((profile.quizzes_correct / profile.quizzes_attempted) * 100) 
    : 0;

  const stats = [
    {
      icon: BookOpen,
      label: 'Books Completed',
      value: profile.books_completed?.length || 0,
      color: 'bg-blue-50 text-blue-600',
      borderColor: 'border-blue-200'
    },
    {
      icon: Palette,
      label: 'Pages Colored',
      value: profile.pages_colored?.length || 0,
      color: 'bg-purple-50 text-purple-600',
      borderColor: 'border-purple-200'
    },
    {
      icon: Award,
      label: 'Achievements',
      value: profile.achievements?.length || 0,
      color: 'bg-green-50 text-green-600',
      borderColor: 'border-green-200'
    },
    {
      icon: Trophy,
      label: 'Quiz Accuracy',
      value: `${quizAccuracy}%`,
      color: 'bg-yellow-50 text-yellow-600',
      borderColor: 'border-yellow-200'
    },
    {
      icon: Clock,
      label: 'Reading Time',
      value: `${totalReadingMinutes} min`,
      color: 'bg-indigo-50 text-indigo-600',
      borderColor: 'border-indigo-200'
    },
    {
      icon: TrendingUp,
      label: 'Current Streak',
      value: `${profile.current_streak || 0} days`,
      color: 'bg-orange-50 text-orange-600',
      borderColor: 'border-orange-200'
    },
    {
      icon: Target,
      label: 'Total Points',
      value: profile.total_points || 0,
      color: 'bg-pink-50 text-pink-600',
      borderColor: 'border-pink-200'
    },
    {
      icon: Award,
      label: 'Current Level',
      value: profile.level || 1,
      color: 'bg-teal-50 text-teal-600',
      borderColor: 'border-teal-200'
    }
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-4xl">{profile.avatar_icon}</div>
        <div>
          <h3 className="text-2xl font-bold">{profile.child_name}</h3>
          <p className="text-gray-600">Progress Overview</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`rounded-xl p-4 border-2 ${stat.borderColor} ${stat.color}`}
          >
            <stat.icon className="w-6 h-6 mb-2" />
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <div className="text-xs font-medium opacity-80">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Insights */}
      <div className="mt-6 pt-6 border-t space-y-3">
        <h4 className="font-semibold text-gray-700 mb-3">Quick Insights</h4>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total Time in App</span>
          <span className="font-semibold">{totalReadingMinutes + totalColoringMinutes} minutes</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Quizzes Completed</span>
          <span className="font-semibold">{profile.quizzes_correct} / {profile.quizzes_attempted}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Longest Streak</span>
          <span className="font-semibold">{profile.longest_streak || 0} days</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Preferred Language</span>
          <span className="font-semibold">{profile.preferred_language === 'en' ? '🇺🇸 English' : '🇧🇷 Português'}</span>
        </div>
      </div>
    </Card>
  );
}