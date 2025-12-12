import React from 'react';
import { Card } from '@/components/ui/card';
import { BookOpen, Palette, Trophy, Target, Calendar, Star } from 'lucide-react';
import { format } from 'date-fns';

export default function ChildActivityFeed({ profile, activityLogs = [], books = [] }) {
  // Sort logs by date
  const sortedLogs = [...activityLogs].sort((a, b) => 
    new Date(b.created_date) - new Date(a.created_date)
  ).slice(0, 20); // Show last 20 activities

  const getActivityIcon = (type) => {
    switch (type) {
      case 'book_started': return BookOpen;
      case 'book_completed': return BookOpen;
      case 'page_colored': return Palette;
      case 'quiz_completed': return Target;
      case 'achievement_earned': return Trophy;
      case 'daily_challenge_completed': return Star;
      default: return Calendar;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'book_started': return 'bg-blue-100 text-blue-700';
      case 'book_completed': return 'bg-green-100 text-green-700';
      case 'page_colored': return 'bg-purple-100 text-purple-700';
      case 'quiz_completed': return 'bg-yellow-100 text-yellow-700';
      case 'achievement_earned': return 'bg-orange-100 text-orange-700';
      case 'daily_challenge_completed': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getActivityText = (log) => {
    const book = books.find(b => b.id === log.book_id);
    const bookTitle = book ? (book.title_en || book.title_pt) : 'a book';

    switch (log.activity_type) {
      case 'book_started':
        return `Started reading "${bookTitle}"`;
      case 'book_completed':
        return `Completed "${bookTitle}"${log.points_earned ? ` (+${log.points_earned} points)` : ''}`;
      case 'page_colored':
        return `Colored a page${log.points_earned ? ` (+${log.points_earned} points)` : ''}`;
      case 'quiz_completed':
        return log.metadata?.is_correct 
          ? `Answered quiz correctly (+${log.points_earned || 10} points)` 
          : 'Attempted a quiz';
      case 'achievement_earned':
        return `Unlocked achievement: ${log.metadata?.achievement_name || 'New Achievement'}`;
      case 'daily_challenge_completed':
        return `Completed daily challenge (+${log.points_earned || 20} points)`;
      default:
        return 'Activity recorded';
    }
  };

  if (sortedLogs.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No recent activity</p>
        <p className="text-sm text-gray-400 mt-1">Activities will appear here as {profile.child_name} uses the app</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5" />
        Recent Activity
      </h3>

      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {sortedLogs.map((log, index) => {
          const Icon = getActivityIcon(log.activity_type);
          const colorClass = getActivityColor(log.activity_type);

          return (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                <Icon className="w-5 h-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">
                  {getActivityText(log)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {format(new Date(log.created_date), 'MMM d, yyyy • h:mm a')}
                </p>
              </div>

              {log.points_earned > 0 && (
                <div className="text-xs font-semibold text-green-600 flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  +{log.points_earned}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}