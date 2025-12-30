import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Clock, Book, Trophy, TrendingUp, Calendar, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ReadingHistoryView({ profile }) {
  const { data: books } = useQuery({
    queryKey: ['books'],
    queryFn: () => base44.entities.Book.list(),
    initialData: [],
  });

  const { data: activities, isLoading } = useQuery({
    queryKey: ['activities', profile.id],
    queryFn: async () => {
      const logs = await base44.entities.UserActivityLog.filter({
        profile_id: profile.id
      });
      return logs.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    initialData: [],
  });

  const formatTime = (seconds) => {
    if (!seconds) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getCompletedBooks = () => {
    return books.filter(book => profile.books_completed?.includes(book.id));
  };

  const completedBooks = getCompletedBooks();
  const totalReadingTime = profile.total_reading_time || 0;
  const totalColoringTime = profile.total_coloring_time || 0;
  const totalTime = totalReadingTime + totalColoringTime;

  const stats = [
    {
      icon: Book,
      label: 'Books Completed',
      value: completedBooks.length,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      icon: Clock,
      label: 'Reading Time',
      value: formatTime(totalReadingTime),
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      icon: Trophy,
      label: 'Total Points',
      value: profile.total_points || 0,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50'
    },
    {
      icon: TrendingUp,
      label: 'Current Streak',
      value: `${profile.current_streak || 0} days`,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    }
  ];

  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
        <p className="text-gray-600">Loading reading history...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`p-6 ${stat.bg}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg bg-white`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Completed Books */}
      {completedBooks.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Book className="w-5 h-5 text-blue-600" />
            Completed Books ({completedBooks.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {completedBooks.map((book) => (
              <motion.div
                key={book.id}
                whileHover={{ scale: 1.05 }}
                className="relative group cursor-pointer"
              >
                {book.cover_image_url ? (
                  <img
                    src={book.cover_image_url}
                    alt={book.title_en}
                    className="w-full aspect-[3/4] object-cover rounded-lg shadow-md"
                  />
                ) : (
                  <div className="w-full aspect-[3/4] bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Book className="w-8 h-8 text-white" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center p-2">
                  <p className="text-white text-xs font-semibold text-center">
                    {book.title_en}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          Recent Activity
        </h3>
        {activities.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No activity yet. Start reading to see your history!</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activities.slice(0, 20).map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 capitalize">
                    {activity.activity_type.replace(/_/g, ' ')}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(activity.created_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                {activity.points_earned > 0 && (
                  <div className="text-sm font-semibold text-yellow-600">
                    +{activity.points_earned} pts
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {/* Reading Goals (placeholder) */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          Reading Insights
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Average reading time per session</span>
              <span className="font-semibold text-gray-900">
                {activities.length > 0 ? formatTime(Math.floor(totalReadingTime / activities.length)) : '0m'}
              </span>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Most active time</span>
              <span className="font-semibold text-gray-900">
                {profile.early_morning_sessions > profile.night_sessions ? 'Morning' : 'Evening'}
              </span>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Pages colored</span>
              <span className="font-semibold text-gray-900">
                {profile.pages_colored?.length || 0}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}