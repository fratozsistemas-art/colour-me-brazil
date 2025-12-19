import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, Lock, Unlock } from 'lucide-react';
import { toast } from 'sonner';

export default function CuratorContentLibrary({ books }) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');

  const deleteBookMutation = useMutation({
    mutationFn: (id) => base44.entities.Book.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['books']);
      toast.success('Book deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete book: ' + error.message);
    }
  });

  const toggleLockMutation = useMutation({
    mutationFn: ({ id, isLocked }) => base44.entities.Book.update(id, { is_locked: !isLocked }),
    onSuccess: () => {
      queryClient.invalidateQueries(['books']);
      toast.success('Book lock status updated');
    }
  });

  const handleDelete = (book) => {
    if (confirm(`Are you sure you want to delete "${book.title_en}"? This cannot be undone.`)) {
      deleteBookMutation.mutate(book.id);
    }
  };

  const filteredBooks = books.filter(book => {
    if (filter === 'all') return true;
    if (filter === 'locked') return book.is_locked;
    if (filter === 'unlocked') return !book.is_locked;
    if (filter === 'amazon') return book.collection === 'amazon';
    if (filter === 'culture') return book.collection === 'culture';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
        >
          All ({books.length})
        </Button>
        <Button
          variant={filter === 'amazon' ? 'default' : 'outline'}
          onClick={() => setFilter('amazon')}
          size="sm"
        >
          🌿 Amazon
        </Button>
        <Button
          variant={filter === 'culture' ? 'default' : 'outline'}
          onClick={() => setFilter('culture')}
          size="sm"
        >
          🎨 Culture
        </Button>
        <Button
          variant={filter === 'locked' ? 'default' : 'outline'}
          onClick={() => setFilter('locked')}
          size="sm"
        >
          🔒 Locked
        </Button>
        <Button
          variant={filter === 'unlocked' ? 'default' : 'outline'}
          onClick={() => setFilter('unlocked')}
          size="sm"
        >
          🔓 Unlocked
        </Button>
      </div>

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">No books found</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <Card key={book.id} className="p-6 hover:shadow-lg transition-shadow">
              {book.cover_image_url && (
                <img
                  src={book.cover_image_url}
                  alt={book.title_en}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              
              <h4 className="font-bold text-gray-800 mb-1">{book.title_en}</h4>
              <p className="text-sm text-gray-600 mb-3">{book.title_pt}</p>
              
              <div className="flex gap-2 mb-4 flex-wrap">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {book.collection === 'amazon' ? '🌿 Amazon' : '🎨 Culture'}
                </span>
                {book.is_locked && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    🔒 Locked
                  </span>
                )}
                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                  {book.page_count} pages
                </span>
              </div>

              {book.cultural_tags?.length > 0 && (
                <p className="text-xs text-gray-500 mb-4">
                  {book.cultural_tags.join(', ')}
                </p>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleLockMutation.mutate({ id: book.id, isLocked: book.is_locked })}
                  className="flex-1"
                >
                  {book.is_locked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = `/Library?book=${book.id}`}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(book)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}