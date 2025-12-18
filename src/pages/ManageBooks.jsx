import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ManageBooks() {
  const [editingBook, setEditingBook] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  const { data: books = [], isLoading } = useQuery({
    queryKey: ['books'],
    queryFn: () => base44.entities.Book.list()
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
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manage Books</h1>
          <p className="text-gray-600">Add, edit, or remove books from the library</p>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Book
        </Button>
      </div>

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
          <Card key={book.id} className="p-6">
            {editingBook?.id === book.id ? (
              <BookForm
                book={editingBook}
                onSave={(data) => updateMutation.mutate({ id: book.id, data })}
                onCancel={() => setEditingBook(null)}
              />
            ) : (
              <div className="flex items-start gap-4">
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
                    size="icon"
                    onClick={() => setEditingBook(book)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this book?')) {
                        deleteMutation.mutate(book.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}