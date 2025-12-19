import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  Target,
  TrendingUp,
  Calendar,
  Award
} from 'lucide-react';

export default function DetailedProgressReport({ profileId }) {
  const { data: profile } = useQuery({
    queryKey: ['profile', profileId],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ id: profileId });
      return profiles[0];
    }
  });

  const { data: books = [] } = useQuery({
    queryKey: ['books'],
    queryFn: () => base44.entities.Book.list()
  });

  const { data: activityLogs = [] } = useQuery({
    queryKey: ['activityLogs', profileId],
    queryFn: () => base44.entities.UserActivityLog.filter({ profile_id: profileId }),
    enabled: !!profileId
  });

  const { data: quizResults = [] } = useQuery({
    queryKey: ['quizResults', profileId],
    queryFn: () => base44.entities.QuizResult.filter({ profile_id: profileId }),
    enabled: !!profileId
  });

  if (!profile) {
    return <div>Loading...</div>;
  }

  // Calculate reading time per book
  const readingTimeByBook = {};
  activityLogs
    .filter(log => log.activity_type === 'book_started' || log.activity_type === 'book_completed')
    .forEach(log => {
      if (log.book_id && log.metadata?.time_spent) {
        readingTimeByBook[log.book_id] = (readingTimeByBook[log.book_id] || 0) + log.metadata.time_spent;
      }
    });

  // Calculate quiz performance
  const totalQuizzes = quizResults.length;
  const correctQuizzes = quizResults.filter(q => q.is_correct).length;
  const quizAccuracy = totalQuizzes > 0 ? Math.round((correctQuizzes / totalQuizzes) * 100) : 0;

  // Get recent achievements
  const recentAchievements = activityLogs
    .filter(log => log.activity_type === 'achievement_earned')
    .slice(0, 5);

  const formatTime = (seconds) => {
    if (!seconds) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">Books Read</span>
          </div>
          <p className="text-3xl font-bold text-blue-800">
            {profile.books_completed?.length || 0}
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6 text-green-600" />
            <span className="text-sm font-medium text-green-600">Reading Time</span>
          </div>
          <p className="text-3xl font-bold text-green-800">
            {formatTime(profile.total_reading_time || 0)}
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-6 h-6 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">Quiz Accuracy</span>
          </div>
          <p className="text-3xl font-bold text-purple-800">
            {quizAccuracy}%
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-6 h-6 text-orange-600" />
            <span className="text-sm font-medium text-orange-600">Current Streak</span>
          </div>
          <p className="text-3xl font-bold text-orange-800">
            {profile.current_streak || 0} days
          </p>
        </Card>
      </div>

      {/* Reading Time per Book */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-800">Reading Time by Book</h3>
        </div>

        {Object.keys(readingTimeByBook).length === 0 ? (
          <p className="text-gray-500 text-center py-8">No reading data yet</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(readingTimeByBook)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 10)
              .map(([bookId, time]) => {
                const book = books.find(b => b.id === bookId);
                return (
                  <div key={bookId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {book?.cover_image_url && (
                        <img 
                          src={book.cover_image_url} 
                          alt={book.title_en}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-gray-800">
                          {book?.title_en || 'Unknown Book'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {book?.author || ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">
                        {formatTime(time)}
                      </p>
                      <p className="text-xs text-gray-500">time spent</p>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </Card>

      {/* Quiz Performance Details */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-bold text-gray-800">Quiz Performance</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-800">{totalQuizzes}</p>
            <p className="text-sm text-purple-600">Total Quizzes</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-800">{correctQuizzes}</p>
            <p className="text-sm text-green-600">Correct</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-800">{totalQuizzes - correctQuizzes}</p>
            <p className="text-sm text-red-600">Incorrect</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-800">{profile.consecutive_quizzes_correct || 0}</p>
            <p className="text-sm text-blue-600">Current Streak</p>
          </div>
        </div>
      </Card>

      {/* Recent Achievements */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Award className="w-6 h-6 text-yellow-600" />
          <h3 className="text-xl font-bold text-gray-800">Recent Achievements</h3>
        </div>

        {recentAchievements.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No achievements yet</p>
        ) : (
          <div className="space-y-3">
            {recentAchievements.map((log, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-yellow-50 rounded-lg">
                <Award className="w-8 h-8 text-yellow-600" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">
                    Achievement Unlocked!
                  </p>
                  <p className="text-sm text-gray-600">
                    {log.metadata?.achievement_name || 'New achievement'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {new Date(log.created_date).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-400">
                    +{log.points_earned || 0} points
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}