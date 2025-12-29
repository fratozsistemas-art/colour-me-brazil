import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Heart, Eye, Search, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CustomBookPreview from '../components/custom-books/CustomBookPreview';

export default function PublishedBooks() {
  const [currentProfile, setCurrentProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const queryClient = useQueryClient();

  React.useEffect(() => {
    const profileId = localStorage.getItem('currentProfileId');
    if (profileId) {
      loadProfile(profileId);
    }
  }, []);

  const loadProfile = async (profileId) => {
    try {
      const profiles = await base44.entities.UserProfile.filter({ id: profileId });
      if (profiles.length > 0) {
        setCurrentProfile(profiles[0]);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const { data: publishedBooks = [] } = useQuery({
    queryKey: ['published-books'],
    queryFn: async () => {
      return await base44.entities.CustomBook.filter({ 
        is_published: true 
      }, '-created_date');
    }
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['all-profiles'],
    queryFn: async () => {
      return await base44.entities.UserProfile.list();
    }
  });

  const likeMutation = useMutation({
    mutationFn: async (bookId) => {
      const book = publishedBooks.find(b => b.id === bookId);
      if (!book) return;

      await base44.entities.CustomBook.update(bookId, {
        likes: (book.likes || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['published-books']);
    }
  });

  const incrementViewMutation = useMutation({
    mutationFn: async (bookId) => {
      const book = publishedBooks.find(b => b.id === bookId);
      if (!book) return;

      await base44.entities.CustomBook.update(bookId, {
        views: (book.views || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['published-books']);
    }
  });

  const handleViewBook = (book) => {
    setSelectedBook(book);
    setShowPreview(true);
    incrementViewMutation.mutate(book.id);
  };

  const handleLike = (e, bookId) => {
    e.stopPropagation();
    likeMutation.mutate(bookId);
  };

  const getAuthorName = (profileId) => {
    const profile = profiles.find(p => p.id === profileId);
    return profile?.child_name || 'Unknown';
  };

  const filteredBooks = publishedBooks.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-8 h-8 text-purple-500" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Published Books Gallery
          </h1>
        </div>
        <p className="text-gray-600">
          Explore amazing books created by our community
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No published books yet</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card 
                className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => handleViewBook(book)}
              >
                {/* Book Cover */}
                <div className="h-64 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center relative">
                  <BookOpen className="w-20 h-20 text-blue-500" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                    {book.total_pages || 0} pages
                  </div>
                </div>

                {/* Book Info */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">{book.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {book.description || 'No description'}
                  </p>

                  {/* Author */}
                  <div className="text-xs text-gray-500 mb-3">
                    by <span className="font-medium">{getAuthorName(book.profile_id)}</span>
                  </div>

                  {/* Stats & Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {book.views || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {book.likes || 0}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => handleLike(e, book.id)}
                      className="gap-1 text-red-500 hover:text-red-600"
                    >
                      <Heart className="w-4 h-4" />
                      Like
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedBook?.title || 'Book Preview'}</DialogTitle>
          </DialogHeader>
          {selectedBook && (
            <CustomBookPreview
              title={selectedBook.title}
              description={selectedBook.description}
              pages={selectedBook.pages || []}
              profileId={selectedBook.profile_id}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}