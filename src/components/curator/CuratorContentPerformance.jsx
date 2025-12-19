import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, Users, Clock, Star, BookOpen } from 'lucide-react';

export default function CuratorContentPerformance({ books, profiles }) {
  // Calculate performance metrics for each book
  const bookMetrics = books.map(book => {
    const readers = profiles.filter(p => 
      p.books_completed?.includes(book.id)
    );
    
    const totalReadingTime = profiles.reduce((sum, p) => {
      return sum + (p.reading_progress?.[book.id] || 0);
    }, 0);

    const avgReadingTime = readers.length > 0 
      ? Math.round(totalReadingTime / readers.length)
      : 0;

    // Calculate engagement score (0-100)
    const engagementScore = Math.min(100, Math.round(
      (readers.length * 10) + 
      (avgReadingTime / 60) // convert seconds to minutes for score
    ));

    return {
      book,
      readers: readers.length,
      totalReadingTime,
      avgReadingTime,
      engagementScore
    };
  }).sort((a, b) => b.readers - a.readers);

  const formatTime = (seconds) => {
    if (!seconds) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const totalReaders = bookMetrics.reduce((sum, m) => sum + m.readers, 0);
  const totalReadingTime = bookMetrics.reduce((sum, m) => sum + m.totalReadingTime, 0);
  const avgEngagement = bookMetrics.length > 0
    ? Math.round(bookMetrics.reduce((sum, m) => sum + m.engagementScore, 0) / bookMetrics.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">Total Books</span>
          </div>
          <p className="text-3xl font-bold text-blue-800">{books.length}</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-green-600" />
            <span className="text-sm font-medium text-green-600">Total Readers</span>
          </div>
          <p className="text-3xl font-bold text-green-800">{totalReaders}</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">Total Time</span>
          </div>
          <p className="text-3xl font-bold text-purple-800">
            {formatTime(totalReadingTime)}
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="flex items-center gap-3 mb-2">
            <Star className="w-6 h-6 text-orange-600" />
            <span className="text-sm font-medium text-orange-600">Avg Engagement</span>
          </div>
          <p className="text-3xl font-bold text-orange-800">{avgEngagement}/100</p>
        </Card>
      </div>

      {/* Book Performance List */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-800">Book Performance</h3>
        </div>

        {bookMetrics.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No books created yet</p>
        ) : (
          <div className="space-y-4">
            {bookMetrics.map(({ book, readers, avgReadingTime, engagementScore }) => (
              <div
                key={book.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {book.cover_image_url && (
                    <img
                      src={book.cover_image_url}
                      alt={book.title_en}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div>
                    <h4 className="font-bold text-gray-800">{book.title_en}</h4>
                    <p className="text-sm text-gray-600">{book.title_pt}</p>
                    {book.cultural_tags?.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {book.cultural_tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{readers}</p>
                    <p className="text-xs text-gray-500">Readers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {formatTime(avgReadingTime)}
                    </p>
                    <p className="text-xs text-gray-500">Avg Time</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{engagementScore}</p>
                    <p className="text-xs text-gray-500">Engagement</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}