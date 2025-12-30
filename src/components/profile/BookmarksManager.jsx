import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bookmark, Trash2, Book, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createPageUrl } from '../../utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function BookmarksManager({ profile, onUpdate }) {
  const [bookmarks, setBookmarks] = useState(profile.bookmarks || {});

  const { data: books, isLoading: booksLoading } = useQuery({
    queryKey: ['books'],
    queryFn: () => base44.entities.Book.list(),
    initialData: [],
  });

  const { data: pages, isLoading: pagesLoading } = useQuery({
    queryKey: ['pages'],
    queryFn: () => base44.entities.Page.list(),
    initialData: [],
  });

  const handleRemoveBookmark = async (bookId, pageId) => {
    const updatedBookmarks = { ...bookmarks };
    updatedBookmarks[bookId] = (updatedBookmarks[bookId] || []).filter(id => id !== pageId);
    
    if (updatedBookmarks[bookId].length === 0) {
      delete updatedBookmarks[bookId];
    }

    setBookmarks(updatedBookmarks);
    await onUpdate({ bookmarks: updatedBookmarks });
    toast.success('Bookmark removed');
  };

  const handleClearAllBookmarks = async () => {
    if (!confirm('Are you sure you want to remove all bookmarks?')) return;
    
    setBookmarks({});
    await onUpdate({ bookmarks: {} });
    toast.success('All bookmarks cleared');
  };

  const getBookById = (bookId) => books.find(b => b.id === bookId);
  const getPageById = (pageId) => pages.find(p => p.id === pageId);

  const totalBookmarks = Object.values(bookmarks).reduce((sum, arr) => sum + arr.length, 0);

  if (booksLoading || pagesLoading) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
        <p className="text-gray-600">Loading bookmarks...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bookmark className="w-6 h-6 text-yellow-600" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">My Bookmarks</h3>
              <p className="text-sm text-gray-600">{totalBookmarks} bookmarked pages across {Object.keys(bookmarks).length} books</p>
            </div>
          </div>
          {totalBookmarks > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearAllBookmarks}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </Card>

      {/* Bookmarks List */}
      {totalBookmarks === 0 ? (
        <Card className="p-12 text-center">
          <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Bookmarks Yet</h3>
          <p className="text-gray-600 mb-4">
            Bookmark your favorite pages while reading to access them quickly later
          </p>
          <Button onClick={() => window.location.href = createPageUrl('Library')}>
            Go to Library
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {Object.entries(bookmarks).map(([bookId, pageIds]) => {
              const book = getBookById(bookId);
              if (!book || !pageIds || pageIds.length === 0) return null;

              return (
                <motion.div
                  key={bookId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      {book.cover_image_url ? (
                        <img
                          src={book.cover_image_url}
                          alt={book.title_en}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                          <Book className="w-8 h-8 text-white" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900">{book.title_en}</h4>
                        <p className="text-sm text-gray-600">{pageIds.length} bookmarked pages</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {pageIds.map((pageId) => {
                        const page = getPageById(pageId);
                        if (!page) return null;

                        return (
                          <div
                            key={pageId}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <Bookmark className="w-4 h-4 text-yellow-600" />
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">Page {page.page_number}</div>
                                {page.story_text_en && (
                                  <p className="text-sm text-gray-600 line-clamp-1">
                                    {page.story_text_en.substring(0, 80)}...
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  window.location.href = createPageUrl('Library');
                                }}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveBookmark(bookId, pageId)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}