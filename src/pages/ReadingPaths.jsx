import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, BookOpen, Heart, Users, Star, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { awardPoints } from '../components/achievementManager';

export default function ReadingPaths() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPath, setSelectedPath] = useState(null);
  const [newPath, setNewPath] = useState({
    title_en: '',
    title_pt: '',
    description_en: '',
    description_pt: '',
    book_ids: [],
    difficulty_level: 'beginner',
    theme: 'mixed'
  });
  const queryClient = useQueryClient();
  const currentProfileId = localStorage.getItem('currentProfileId');

  const { data: paths = [] } = useQuery({
    queryKey: ['readingPaths'],
    queryFn: () => base44.entities.ReadingPath.list('-created_date'),
  });

  const { data: books = [] } = useQuery({
    queryKey: ['books'],
    queryFn: () => base44.entities.Book.list('order_index'),
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => base44.entities.UserProfile.list(),
  });

  const createPath = useMutation({
    mutationFn: async (pathData) => {
      await base44.entities.ReadingPath.create({
        ...pathData,
        creator_profile_id: currentProfileId
      });
      await awardPoints(currentProfileId, 15);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['readingPaths']);
      setShowCreateModal(false);
      setNewPath({
        title_en: '',
        title_pt: '',
        description_en: '',
        description_pt: '',
        book_ids: [],
        difficulty_level: 'beginner',
        theme: 'mixed'
      });
    },
  });

  const toggleBookInPath = (bookId) => {
    const bookIds = newPath.book_ids;
    if (bookIds.includes(bookId)) {
      setNewPath({ ...newPath, book_ids: bookIds.filter(id => id !== bookId) });
    } else {
      setNewPath({ ...newPath, book_ids: [...bookIds, bookId] });
    }
  };

  const getProfile = (profileId) => profiles.find(p => p.id === profileId);
  const getBook = (bookId) => books.find(b => b.id === bookId);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Reading Paths 🗺️</h1>
          <p className="text-gray-600">Discover curated book sequences or create your own!</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Path
        </Button>
      </div>

      {/* Paths Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paths.map((path) => {
          const creator = getProfile(path.creator_profile_id);
          const pathBooks = path.book_ids.map(id => getBook(id)).filter(Boolean);
          
          return (
            <motion.div key={path.id} whileHover={{ y: -4 }}>
              <Card className="p-6 cursor-pointer hover:shadow-xl transition-shadow" onClick={() => setSelectedPath(path)}>
                {path.is_featured && (
                  <div className="mb-3">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                      <Star className="w-3 h-3" />
                      Featured
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2">{path.title_en}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{path.description_en}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    {path.difficulty_level}
                  </span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                    {path.theme}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                    {pathBooks.length} books
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                      {creator?.child_name?.[0] || '?'}
                    </div>
                    <span>{creator?.child_name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {path.likes_count || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {path.followers_count || 0}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Create Path Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-6">Create Reading Path</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Title (English)</label>
                  <Input
                    value={newPath.title_en}
                    onChange={(e) => setNewPath({ ...newPath, title_en: e.target.value })}
                    placeholder="My Amazing Reading Journey"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Title (Portuguese)</label>
                  <Input
                    value={newPath.title_pt}
                    onChange={(e) => setNewPath({ ...newPath, title_pt: e.target.value })}
                    placeholder="Minha Jornada de Leitura Incrível"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description (English)</label>
                  <Textarea
                    value={newPath.description_en}
                    onChange={(e) => setNewPath({ ...newPath, description_en: e.target.value })}
                    placeholder="A journey through Brazilian folklore..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description (Portuguese)</label>
                  <Textarea
                    value={newPath.description_pt}
                    onChange={(e) => setNewPath({ ...newPath, description_pt: e.target.value })}
                    placeholder="Uma jornada pelo folclore brasileiro..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Difficulty</label>
                    <select
                      value={newPath.difficulty_level}
                      onChange={(e) => setNewPath({ ...newPath, difficulty_level: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Theme</label>
                    <select
                      value={newPath.theme}
                      onChange={(e) => setNewPath({ ...newPath, theme: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="mixed">Mixed</option>
                      <option value="folklore">Folklore</option>
                      <option value="nature">Nature</option>
                      <option value="culture">Culture</option>
                      <option value="tradition">Tradition</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Select Books ({newPath.book_ids.length} selected)</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto border rounded-lg p-3">
                    {books.map((book) => (
                      <div
                        key={book.id}
                        onClick={() => toggleBookInPath(book.id)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          newPath.book_ids.includes(book.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={book.cover_image_url}
                          alt={book.title_en}
                          className="w-full h-24 object-cover rounded mb-2"
                        />
                        <p className="text-xs font-semibold line-clamp-2">{book.title_en}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => createPath.mutate(newPath)}
                  disabled={!newPath.title_en || !newPath.title_pt || newPath.book_ids.length === 0}
                >
                  Create Path
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Path Modal */}
      <AnimatePresence>
        {selectedPath && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPath(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-3xl font-bold mb-2">{selectedPath.title_en}</h2>
              <p className="text-gray-600 mb-6">{selectedPath.description_en}</p>

              <div className="space-y-4">
                <h3 className="text-xl font-bold">Books in This Path</h3>
                {selectedPath.book_ids.map((bookId, index) => {
                  const book = getBook(bookId);
                  if (!book) return null;
                  
                  return (
                    <div key={bookId} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-400 w-8">
                        {index + 1}
                      </div>
                      <img
                        src={book.cover_image_url}
                        alt={book.title_en}
                        className="w-16 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold">{book.title_en}</h4>
                        <p className="text-sm text-gray-600">{book.subtitle_en}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}