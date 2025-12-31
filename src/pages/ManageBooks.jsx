import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2, Save, X, BookOpen, Palette, Volume2, Loader2, Wand2, Search, Filter, CheckSquare, XSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BookCreationWizard from '../components/curator/BookCreationWizard';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function ManageBooks() {
  const [editingBook, setEditingBook] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [audioGenerationBookId, setAudioGenerationBookId] = useState(null);
  const [audioGenerationLanguage, setAudioGenerationLanguage] = useState('en');
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const queryClient = useQueryClient();

  // Advanced filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [collectionFilter, setCollectionFilter] = useState('all');
  const [authorFilter, setAuthorFilter] = useState('');
  
  // Bulk edit
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [showBulkEditDialog, setShowBulkEditDialog] = useState(false);
  const [bulkEditData, setBulkEditData] = useState({
    status: '',
    collection: '',
    tags: '',
    is_locked: null
  });

  const { data: allBooks = [], isLoading } = useQuery({
    queryKey: ['books'],
    queryFn: () => base44.entities.Book.list()
  });

  // Apply all filters
  const filteredBooks = allBooks.filter(book => {
    // Search query (title, author)
    const matchesSearch = !searchQuery || 
      book.title_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.title_pt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || book.status === statusFilter;
    
    // Collection filter
    const matchesCollection = collectionFilter === 'all' || book.collection === collectionFilter;
    
    // Author filter
    const matchesAuthor = !authorFilter || book.author?.toLowerCase().includes(authorFilter.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesCollection && matchesAuthor;
  });

  const books = filteredBooks;

  const { data: pages = [] } = useQuery({
    queryKey: ['pages', selectedBook?.id],
    queryFn: () => selectedBook ? base44.entities.Page.filter({ book_id: selectedBook.id }) : Promise.resolve([]),
    enabled: !!selectedBook
  });

  const createMutation = useMutation({
    mutationFn: (bookData) => base44.entities.Book.create(bookData),
    onSuccess: () => {
      queryClient.invalidateQueries(['books']);
      setIsCreating(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Book.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['books']);
      setEditingBook(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Book.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['books']);
    }
  });

  const deletePageMutation = useMutation({
    mutationFn: (id) => base44.entities.Page.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['pages']);
    }
  });

  const updatePageMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Page.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['pages']);
    }
  });

  const renumberPages = async (bookId) => {
    try {
      const bookPages = await base44.entities.Page.filter({ book_id: bookId });
      const sortedPages = bookPages.sort((a, b) => (a.page_number || 0) - (b.page_number || 0));
      
      for (let i = 0; i < sortedPages.length; i++) {
        await base44.entities.Page.update(sortedPages[i].id, {
          page_number: i + 1
        });
      }
      
      queryClient.invalidateQueries(['pages']);
      alert('Pages renumbered successfully!');
    } catch (error) {
      console.error('Error renumbering pages:', error);
      alert('Failed to renumber pages');
    }
  };

  const handleBatchGenerateAudio = async (bookId, language) => {
    setIsGeneratingAudio(true);
    try {
      const response = await base44.functions.invoke('batchGenerateAudio', { 
        bookId, 
        language,
        forceRegenerate: false 
      });
      
      if (response.data.success) {
        const errorDetails = response.data.errors && response.data.errors.length > 0 
          ? '\n\nErrors:\n' + response.data.errors.map(e => 
              `Page ${e.pageNumber}: ${e.error}`
            ).join('\n')
          : '';
        
        alert(
          `Audio generation completed!\n\n` +
          `Generated: ${response.data.generated}\n` +
          `Skipped: ${response.data.skipped}\n` +
          `Errors: ${response.data.errors.length}` +
          errorDetails
        );
        
        queryClient.invalidateQueries(['pages']);
      } else {
        alert(`Failed: ${response.data.error || 'Unknown error'}`);
      }
      
      console.log('Batch audio generation results:', response.data);
    } catch (error) {
      console.error('Error batch generating audio:', error);
      alert(`Failed to generate audio: ${error.message}`);
    } finally {
      setIsGeneratingAudio(false);
      setAudioGenerationBookId(null);
    }
  };

  // Toggle book selection for bulk edit
  const toggleBookSelection = (bookId) => {
    setSelectedBooks(prev => 
      prev.includes(bookId) ? prev.filter(id => id !== bookId) : [...prev, bookId]
    );
  };

  // Select/deselect all visible books
  const toggleSelectAll = () => {
    if (selectedBooks.length === books.length) {
      setSelectedBooks([]);
    } else {
      setSelectedBooks(books.map(b => b.id));
    }
  };

  // Apply bulk edit
  const applyBulkEdit = async () => {
    if (selectedBooks.length === 0) {
      toast.error('No books selected');
      return;
    }

    try {
      for (const bookId of selectedBooks) {
        const book = allBooks.find(b => b.id === bookId);
        if (!book) continue;

        const updates = {};
        
        if (bulkEditData.status) updates.status = bulkEditData.status;
        if (bulkEditData.collection) updates.collection = bulkEditData.collection;
        if (bulkEditData.is_locked !== null) updates.is_locked = bulkEditData.is_locked;
        
        if (bulkEditData.tags) {
          const newTags = bulkEditData.tags.split(',').map(t => t.trim()).filter(Boolean);
          updates.cultural_tags = [...new Set([...(book.cultural_tags || []), ...newTags])];
        }

        if (Object.keys(updates).length > 0) {
          await base44.entities.Book.update(bookId, updates);
        }
      }

      queryClient.invalidateQueries(['books']);
      setSelectedBooks([]);
      setShowBulkEditDialog(false);
      setBulkEditData({ status: '', collection: '', tags: '', is_locked: null });
      toast.success(`${selectedBooks.length} books updated successfully!`);
    } catch (error) {
      console.error('Error bulk updating books:', error);
      toast.error('Failed to update books');
    }
  };

  const BookForm = ({ book, onSave, onCancel }) => {
    const [formData, setFormData] = useState(book || {
      title_en: '',
      title_pt: '',
      subtitle_en: '',
      subtitle_pt: '',
      author: '',
      collection: 'culture',
      cover_image_url: '',
      cultural_tags: [],
      age_recommendation: '6-12 years',
      is_locked: false,
      page_count: 12,
      order_index: books.length
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <Card className="p-6 mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title (English)</label>
              <Input
                value={formData.title_en}
                onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Title (Portuguese)</label>
              <Input
                value={formData.title_pt}
                onChange={(e) => setFormData({ ...formData, title_pt: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Subtitle (English)</label>
              <Input
                value={formData.subtitle_en}
                onChange={(e) => setFormData({ ...formData, subtitle_en: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subtitle (Portuguese)</label>
              <Input
                value={formData.subtitle_pt}
                onChange={(e) => setFormData({ ...formData, subtitle_pt: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Author</label>
            <Input
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              placeholder="Author name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Collection</label>
              <Select
                value={formData.collection}
                onValueChange={(value) => setFormData({ ...formData, collection: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amazon">🌿 Amazon</SelectItem>
                  <SelectItem value="culture">🎨 Culture</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Page Count</label>
              <Input
                type="number"
                value={formData.page_count}
                onChange={(e) => setFormData({ ...formData, page_count: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Cover Image URL</label>
            <Input
              value={formData.cover_image_url}
              onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Cultural Tags (comma-separated)</label>
            <Input
              value={formData.cultural_tags?.join(', ') || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                cultural_tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
              })}
              placeholder="Folklore, Carnival, Music"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_locked}
                onChange={(e) => setFormData({ ...formData, is_locked: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Locked (requires purchase)</span>
            </label>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              Save Book
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    );
  };

  if (isLoading) {
    return <div className="p-8">Loading books...</div>;
  }

  return (
    <>
      {/* Book Creation Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-5xl w-full my-8">
            <BookCreationWizard
              onComplete={(book) => {
                setShowWizard(false);
                queryClient.invalidateQueries(['books']);
                toast.success(`Livro "${book.title_pt}" criado com sucesso! 🎉`);
              }}
              onCancel={() => setShowWizard(false)}
            />
          </div>
        </div>
      )}

    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manage Books</h1>
          <p className="text-gray-600">Add, edit, or remove books from the library</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowWizard(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Criar com Assistente
          </Button>
          <Button
            onClick={() => setIsCreating(true)}
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Rápido
          </Button>
        </div>
      </div>

      {/* Advanced Search & Filters */}
      <Card className="p-4 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Search className="w-5 h-5 text-gray-400" />
          <h3 className="font-semibold text-gray-700">Busca e Filtros</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="md:col-span-2">
            <Input
              placeholder="Buscar por título ou autor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Collection Filter */}
          <Select value={collectionFilter} onValueChange={setCollectionFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Coleção" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Coleções</SelectItem>
              <SelectItem value="amazon">🌿 Amazon</SelectItem>
              <SelectItem value="culture">🎨 Culture</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Status</SelectItem>
              <SelectItem value="draft">📝 Rascunhos</SelectItem>
              <SelectItem value="published">✅ Publicados</SelectItem>
              <SelectItem value="archived">📦 Arquivados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between pt-3 border-t">
          <p className="text-sm text-gray-600">
            Exibindo <strong>{books.length}</strong> de <strong>{allBooks.length}</strong> livros
          </p>
          
          {/* Clear Filters */}
          {(searchQuery || statusFilter !== 'all' || collectionFilter !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setCollectionFilter('all');
                setAuthorFilter('');
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Limpar Filtros
            </Button>
          )}
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedBooks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckSquare className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900">
                  {selectedBooks.length} {selectedBooks.length === 1 ? 'livro selecionado' : 'livros selecionados'}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowBulkEditDialog(true)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar em Massa
                </Button>
                <Button
                  onClick={() => setSelectedBooks([])}
                  size="sm"
                  variant="outline"
                >
                  <XSquare className="w-4 h-4 mr-2" />
                  Desmarcar Todos
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Select All */}
      {books.length > 0 && (
        <div className="mb-4 flex items-center gap-2">
          <Checkbox
            checked={selectedBooks.length === books.length && books.length > 0}
            onCheckedChange={toggleSelectAll}
          />
          <span className="text-sm text-gray-600">
            Selecionar todos os {books.length} livros visíveis
          </span>
        </div>
      )}

      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <BookForm
              onSave={(data) => createMutation.mutate(data)}
              onCancel={() => setIsCreating(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {books.map((book) => (
          <Card key={book.id} className={`p-6 ${selectedBooks.includes(book.id) ? 'ring-2 ring-blue-500' : ''}`}>
            {editingBook?.id === book.id ? (
              <BookForm
                book={editingBook}
                onSave={(data) => updateMutation.mutate({ id: book.id, data })}
                onCancel={() => setEditingBook(null)}
              />
            ) : (
              <div className="flex items-start gap-4">
                {/* Selection Checkbox */}
                <Checkbox
                  checked={selectedBooks.includes(book.id)}
                  onCheckedChange={() => toggleBookSelection(book.id)}
                  className="mt-1"
                />
                
                {book.cover_image_url && (
                  <img
                    src={book.cover_image_url}
                    alt={book.title_en}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800">{book.title_en}</h3>
                  <p className="text-gray-600">{book.title_pt}</p>
                  {book.author && (
                    <p className="text-sm text-gray-500 mt-1">by {book.author}</p>
                  )}
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      book.status === 'draft' ? 'bg-orange-100 text-orange-800' :
                      book.status === 'published' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {book.status === 'draft' ? '📝 Rascunho' : 
                       book.status === 'published' ? '✅ Publicado' : '📦 Arquivado'}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {book.collection === 'amazon' ? '🌿 Amazon' : '🎨 Culture'}
                    </span>
                    {book.is_locked && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        🔒 Locked
                      </span>
                    )}
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                      {book.page_count} pages
                    </span>
                  </div>
                  {book.cultural_tags?.length > 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      Tags: {book.cultural_tags.join(', ')}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedBook(selectedBook?.id === book.id ? null : book)}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    {selectedBook?.id === book.id ? 'Hide Pages' : 'Manage Pages'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAudioGenerationBookId(audioGenerationBookId === book.id ? null : book.id)}
                    className="text-purple-600"
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    Audio
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setEditingBook(book)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this book? This will also delete all its pages.')) {
                        deleteMutation.mutate(book.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            )}

            {/* Audio Generation */}
            {audioGenerationBookId === book.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t"
              >
                <h4 className="font-semibold text-lg mb-4">Batch Generate Audio</h4>
                <div className="flex items-center gap-4">
                  <Select
                    value={audioGenerationLanguage}
                    onValueChange={setAudioGenerationLanguage}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">🇺🇸 English</SelectItem>
                      <SelectItem value="pt">🇧🇷 Portuguese</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => handleBatchGenerateAudio(book.id, audioGenerationLanguage)}
                    disabled={isGeneratingAudio}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isGeneratingAudio ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 mr-2" />
                        Generate All Pages
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  This will generate audio narration for all pages that don't have audio yet. Existing audio will be skipped.
                </p>
              </motion.div>
            )}

            {/* Pages Management */}
            {selectedBook?.id === book.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-lg">Pages for {book.title_en}</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => renumberPages(book.id)}
                    className="text-blue-600"
                  >
                    Renumber Pages
                  </Button>
                </div>
                {pages.length === 0 ? (
                  <p className="text-gray-500 text-sm">No pages found for this book.</p>
                ) : (
                  <div className="space-y-3">
                    {pages
                      .sort((a, b) => (a.page_number || 0) - (b.page_number || 0))
                      .map((page) => (
                        <div
                          key={page.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-semibold text-gray-700">
                                Page {page.page_number}
                              </span>
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                {page.page_type || 'story'}
                              </span>
                              {page.illustration_url && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center gap-1">
                                  <Palette className="w-3 h-3" />
                                  Has Illustration
                                </span>
                              )}
                            </div>
                            {page.story_text_en && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                {page.story_text_en}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {page.illustration_url && (
                              <label className="flex items-center gap-2 text-xs cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={page.page_type === 'coloring'}
                                  onChange={(e) => {
                                    updatePageMutation.mutate({
                                      id: page.id,
                                      data: { page_type: e.target.checked ? 'coloring' : 'story' }
                                    });
                                  }}
                                  className="rounded"
                                />
                                <span className="text-gray-700">Enable Coloring</span>
                              </label>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this page?')) {
                                  deletePageMutation.mutate(page.id);
                                }
                              }}
                            >
                              <Trash2 className="w-3 h-3 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </motion.div>
            )}
          </Card>
        ))}
      </div>

      {/* Bulk Edit Dialog */}
      <Dialog open={showBulkEditDialog} onOpenChange={setShowBulkEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar {selectedBooks.length} Livros</DialogTitle>
            <DialogDescription>
              As mudanças serão aplicadas a todos os livros selecionados. Deixe em branco para não alterar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select value={bulkEditData.status} onValueChange={(value) => setBulkEditData({...bulkEditData, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Não alterar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Não alterar</SelectItem>
                  <SelectItem value="draft">📝 Rascunho</SelectItem>
                  <SelectItem value="published">✅ Publicado</SelectItem>
                  <SelectItem value="archived">📦 Arquivado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Coleção</label>
              <Select value={bulkEditData.collection} onValueChange={(value) => setBulkEditData({...bulkEditData, collection: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Não alterar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Não alterar</SelectItem>
                  <SelectItem value="amazon">🌿 Amazon</SelectItem>
                  <SelectItem value="culture">🎨 Culture</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Adicionar Tags (separadas por vírgula)
              </label>
              <Input
                placeholder="Folclore, Amazônia, Cultura"
                value={bulkEditData.tags}
                onChange={(e) => setBulkEditData({...bulkEditData, tags: e.target.value})}
              />
              <p className="text-xs text-gray-500 mt-1">
                As tags serão adicionadas às tags existentes
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Acesso</label>
              <Select 
                value={bulkEditData.is_locked === null ? '' : bulkEditData.is_locked ? 'locked' : 'unlocked'} 
                onValueChange={(value) => setBulkEditData({
                  ...bulkEditData, 
                  is_locked: value === '' ? null : value === 'locked'
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Não alterar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Não alterar</SelectItem>
                  <SelectItem value="locked">🔒 Bloqueado (Premium)</SelectItem>
                  <SelectItem value="unlocked">🔓 Desbloqueado (Grátis)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={applyBulkEdit} className="bg-blue-600 hover:bg-blue-700">
              Aplicar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
}