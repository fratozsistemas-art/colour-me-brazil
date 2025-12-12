import React from 'react';
import { Card } from '@/components/ui/card';
import { BookOpen, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function ReadingHistory({ profile, books = [], activityLogs = [] }) {
  // Get book reading activities
  const bookActivities = activityLogs.filter(
    log => log.activity_type === 'book_started' || log.activity_type === 'book_completed'
  );

  // Group by book
  const bookReadingData = books.map(book => {
    const started = bookActivities.find(
      log => log.book_id === book.id && log.activity_type === 'book_started'
    );
    const completed = bookActivities.find(
      log => log.book_id === book.id && log.activity_type === 'book_completed'
    );
    const isCompleted = profile.books_completed?.includes(book.id);
    const currentPage = profile.reading_progress?.[book.id];

    return {
      book,
      started: started?.created_date,
      completed: completed?.created_date,
      isCompleted,
      currentPage,
      hasProgress: started || currentPage !== undefined
    };
  }).filter(item => item.hasProgress);

  if (bookReadingData.length === 0) {
    return (
      <Card className="p-8 text-center">
        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No reading history yet</p>
        <p className="text-sm text-gray-400 mt-1">{profile.child_name} hasn't started reading any books</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5" />
        Reading History
      </h3>

      <div className="space-y-3">
        {bookReadingData.map((item, index) => (
          <div
            key={index}
            className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">
                  {item.book.title_en || item.book.title_pt}
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  {item.book.subtitle_en || item.book.subtitle_pt}
                </p>
                
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {item.started && (
                    <span className="text-gray-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Started {format(new Date(item.started), 'MMM d, yyyy')}
                    </span>
                  )}
                  
                  {item.isCompleted ? (
                    <span className="text-green-600 flex items-center gap-1 font-medium">
                      <CheckCircle className="w-3 h-3" />
                      Completed {item.completed && format(new Date(item.completed), 'MMM d, yyyy')}
                    </span>
                  ) : item.currentPage !== undefined ? (
                    <span className="text-blue-600 font-medium">
                      Reading: Page {item.currentPage + 1} of {item.book.page_count || 12}
                    </span>
                  ) : null}
                </div>

                {/* Progress Bar */}
                {!item.isCompleted && item.currentPage !== undefined && (
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${((item.currentPage + 1) / (item.book.page_count || 12)) * 100}%`
                      }}
                    />
                  </div>
                )}
              </div>

              {item.book.cover_image_url && (
                <img
                  src={item.book.cover_image_url}
                  alt={item.book.title_en}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}