import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Plus, Save, Download, Eye, Heart, Trash2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ContentSelector from '../components/custom-books/ContentSelector';
import BookPageEditor from '../components/custom-books/BookPageEditor';
import CustomBookPreview from '../components/custom-books/CustomBookPreview';
import { awardPoints, checkAndAwardAchievements } from '../components/achievementManager';
import { createPageUrl } from './utils';

export default function CustomBookStudio() {
  const [currentProfile, setCurrentProfile] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookTitle, setBookTitle] = useState('');
  const [bookDescription, setBookDescription] = useState('');
  const [pages, setPages] = useState([]);
  const [showContentSelector, setShowContentSelector] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
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

  const { data: customBooks = [] } = useQuery({
    queryKey: ['custom-books', currentProfile?.id],
    queryFn: async () => {
      if (!currentProfile) return [];
      return await base44.entities.CustomBook.filter({ 
        profile_id: currentProfile.id 
      }, '-created_date');
    },
    enabled: !!currentProfile
  });

  const saveBookMutation = useMutation({
    mutationFn: async (bookData) => {
      if (selectedBook) {
        return await base44.entities.CustomBook.update(selectedBook.id, bookData);
      } else {
        return await base44.entities.CustomBook.create({
          ...bookData,
          profile_id: currentProfile.id
        });
      }
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries(['custom-books']);
      
      // Award points for creating/updating custom book
      if (!selectedBook) {
        await awardPoints(currentProfile.id, 'custom_book_created');
        await checkAndAwardAchievements(currentProfile.id);
      }
      
      setSelectedBook(data);
      alert('Book saved successfully!');
    }
  });

  const exportPDFMutation = useMutation({
    mutationFn: async (bookId) => {
      const response = await base44.functions.invoke('generateCustomBookPDF', {
        bookId: bookId,
        profileId: currentProfile.id
      });
      return response.data;
    },
    onSuccess: async (data) => {
      // Update book with PDF URL
      await base44.entities.CustomBook.update(selectedBook.id, {
        pdf_url: data.pdf_url
      });
      
      // Award points for exporting
      await awardPoints(currentProfile.id, 'book_exported');
      await checkAndAwardAchievements(currentProfile.id);
      
      queryClient.invalidateQueries(['custom-books']);
      
      // Download PDF
      const link = document.createElement('a');
      link.href = data.pdf_url;
      link.download = `${bookTitle || 'custom-book'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert('Book exported successfully!');
    }
  });

  const handleSaveBook = () => {
    if (!bookTitle.trim()) {
      alert('Please enter a book title');
      return;
    }

    saveBookMutation.mutate({
      title: bookTitle,
      description: bookDescription,
      pages: pages,
      total_pages: pages.length
    });
  };

  const handleExportPDF = async () => {
    if (!selectedBook) {
      alert('Please save the book first');
      return;
    }

    setIsExporting(true);
    try {
      await exportPDFMutation.mutateAsync(selectedBook.id);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleAddContent = (content) => {
    const newPage = {
      type: content.type,
      content_id: content.id,
      order: pages.length,
      custom_text: content.custom_text || ''
    };
    setPages([...pages, newPage]);
    setShowContentSelector(false);
  };

  const handleRemovePage = (index) => {
    const newPages = pages.filter((_, i) => i !== index).map((page, i) => ({
      ...page,
      order: i
    }));
    setPages(newPages);
  };

  const handleReorderPages = (fromIndex, toIndex) => {
    const newPages = [...pages];
    const [movedPage] = newPages.splice(fromIndex, 1);
    newPages.splice(toIndex, 0, movedPage);
    setPages(newPages.map((page, i) => ({ ...page, order: i })));
  };

  const handleNewBook = () => {
    setSelectedBook(null);
    setBookTitle('');
    setBookDescription('');
    setPages([]);
  };

  const handleLoadBook = (book) => {
    setSelectedBook(book);
    setBookTitle(book.title);
    setBookDescription(book.description || '');
    setPages(book.pages || []);
  };

  const handlePublishBook = async () => {
    if (!selectedBook) return;

    try {
      await base44.entities.CustomBook.update(selectedBook.id, {
        is_published: true
      });

      // Award points for publishing
      await awardPoints(currentProfile.id, 'book_published');
      await checkAndAwardAchievements(currentProfile.id);

      queryClient.invalidateQueries(['custom-books']);
      alert('Book published successfully!');
    } catch (error) {
      console.error('Publish error:', error);
      alert('Failed to publish book');
    }
  };

  if (!currentProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Please select a profile to use Custom Book Studio</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Custom Book Studio
            </h1>
            <p className="text-gray-600 mt-2">
              Create your own books combining stories, coloring pages, and AI art
            </p>
          </div>
          <Button onClick={handleNewBook} className="gap-2">
            <Plus className="w-4 h-4" />
            New Book
          </Button>
        </div>
      </div>

      <Tabs defaultValue="editor" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="library">My Books</TabsTrigger>
        </TabsList>

        {/* Editor Tab */}
        <TabsContent value="editor">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Book Info */}
            <div className="lg:col-span-1">
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Book Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title *</label>
                    <Input
                      value={bookTitle}
                      onChange={(e) => setBookTitle(e.target.value)}
                      placeholder="My Amazing Book"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <Textarea
                      value={bookDescription}
                      onChange={(e) => setBookDescription(e.target.value)}
                      placeholder="What is your book about?"
                      rows={4}
                    />
                  </div>
                  <div className="pt-4 space-y-2">
                    <Button onClick={handleSaveBook} className="w-full gap-2" disabled={saveBookMutation.isPending}>
                      <Save className="w-4 h-4" />
                      {saveBookMutation.isPending ? 'Saving...' : 'Save Book'}
                    </Button>
                    <Button 
                      onClick={() => setShowPreview(true)} 
                      variant="outline" 
                      className="w-full gap-2"
                      disabled={pages.length === 0}
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </Button>
                    <Button 
                      onClick={handleExportPDF} 
                      variant="outline" 
                      className="w-full gap-2"
                      disabled={!selectedBook || isExporting}
                    >
                      <Download className="w-4 h-4" />
                      {isExporting ? 'Exporting...' : 'Export PDF'}
                    </Button>
                    {selectedBook && !selectedBook.is_published && (
                      <Button 
                        onClick={handlePublishBook} 
                        className="w-full gap-2 bg-gradient-to-r from-green-500 to-emerald-500"
                      >
                        <Sparkles className="w-4 h-4" />
                        Publish Book
                      </Button>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 pt-4 border-t">
                    <p>📚 Total Pages: {pages.length}</p>
                    {selectedBook?.is_published && (
                      <>
                        <p>👁️ Views: {selectedBook.views || 0}</p>
                        <p>❤️ Likes: {selectedBook.likes || 0}</p>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Pages Editor */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Book Pages</h2>
                  <Button onClick={() => setShowContentSelector(true)} size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Page
                  </Button>
                </div>

                {pages.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No pages yet. Add your first page!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence>
                      {pages.map((page, index) => (
                        <BookPageEditor
                          key={index}
                          page={page}
                          index={index}
                          onRemove={() => handleRemovePage(index)}
                          onMoveUp={() => index > 0 && handleReorderPages(index, index - 1)}
                          onMoveDown={() => index < pages.length - 1 && handleReorderPages(index, index + 1)}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Library Tab */}
        <TabsContent value="library">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customBooks.map((book) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div onClick={() => handleLoadBook(book)}>
                    <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-blue-500" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2">{book.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {book.description || 'No description'}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>📚 {book.total_pages} pages</span>
                        {book.is_published && (
                          <span className="flex items-center gap-2">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {book.views || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {book.likes || 0}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {customBooks.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">You haven't created any books yet</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Content Selector Modal */}
      <Dialog open={showContentSelector} onOpenChange={setShowContentSelector}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Content to Your Book</DialogTitle>
          </DialogHeader>
          <ContentSelector
            profileId={currentProfile?.id}
            onSelect={handleAddContent}
            onClose={() => setShowContentSelector(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{bookTitle || 'Book Preview'}</DialogTitle>
          </DialogHeader>
          <CustomBookPreview
            title={bookTitle}
            description={bookDescription}
            pages={pages}
            profileId={currentProfile?.id}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}