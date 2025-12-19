import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Clock, Palette, Calendar, TrendingUp, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function ColoringHistory({ profileId }) {
  const [filter, setFilter] = useState('all'); // all, completed, in_progress

  const { data: coloringSessions = [] } = useQuery({
    queryKey: ['coloringSessions', profileId],
    queryFn: () => base44.entities.ColoringSession.filter({ profile_id: profileId }),
    enabled: !!profileId
  });

  const { data: coloredArtwork = [] } = useQuery({
    queryKey: ['coloredArtwork', profileId],
    queryFn: () => base44.entities.ColoredArtwork.filter({ profile_id: profileId }),
    enabled: !!profileId
  });

  const { data: books = [] } = useQuery({
    queryKey: ['books'],
    queryFn: () => base44.entities.Book.list()
  });

  const filteredSessions = coloringSessions.filter(session => {
    if (filter === 'completed') return session.is_completed;
    if (filter === 'in_progress') return !session.is_completed;
    return true;
  }).sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date));

  const totalTime = coloringSessions.reduce((sum, s) => sum + (s.coloring_time || 0), 0);
  const completedCount = coloringSessions.filter(s => s.is_completed).length;
  const averageTime = completedCount > 0 ? Math.round(totalTime / completedCount) : 0;

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const getBookTitle = (bookId) => {
    const book = books.find(b => b.id === bookId);
    return book ? book.title_en : 'Unknown Book';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Palette className="w-6 h-6 text-orange-500" />
          Coloring History
        </h2>
        <Link to={createPageUrl('ArtGallery')}>
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            View Gallery
          </Button>
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <Clock className="w-6 h-6 mx-auto mb-2 text-orange-600" />
          <div className="text-2xl font-bold text-orange-600">
            {formatTime(totalTime)}
          </div>
          <div className="text-xs text-gray-600">Total Time</div>
        </div>
        <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100">
          <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-600" />
          <div className="text-2xl font-bold text-green-600">
            {completedCount}
          </div>
          <div className="text-xs text-gray-600">Completed</div>
        </div>
        <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <Calendar className="w-6 h-6 mx-auto mb-2 text-blue-600" />
          <div className="text-2xl font-bold text-blue-600">
            {formatTime(averageTime)}
          </div>
          <div className="text-xs text-gray-600">Avg. Time</div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
        >
          All ({coloringSessions.length})
        </Button>
        <Button
          variant={filter === 'completed' ? 'default' : 'outline'}
          onClick={() => setFilter('completed')}
          size="sm"
        >
          Completed ({completedCount})
        </Button>
        <Button
          variant={filter === 'in_progress' ? 'default' : 'outline'}
          onClick={() => setFilter('in_progress')}
          size="sm"
        >
          In Progress ({coloringSessions.length - completedCount})
        </Button>
      </div>

      {/* Sessions List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Palette className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No coloring sessions yet</p>
            <p className="text-sm">Start coloring to see your history!</p>
          </div>
        ) : (
          filteredSessions.map((session, index) => {
            const artwork = coloredArtwork.find(a => a.page_id === session.page_id);
            
            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-lg border hover:shadow-md transition-all bg-white"
              >
                {artwork?.artwork_url && (
                  <img
                    src={artwork.artwork_url}
                    alt="Artwork"
                    className="w-16 h-16 rounded object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-800 truncate">
                    {getBookTitle(session.book_id)}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {formatTime(session.coloring_time || 0)}
                    <span>•</span>
                    {new Date(session.updated_date).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  {session.is_completed ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                      ✓ Done
                    </span>
                  ) : (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
                      In Progress
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </Card>
  );
}