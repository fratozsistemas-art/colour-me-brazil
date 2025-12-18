import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Book, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ManifestBookReader from '../books/ManifestBookReader';

export default function LibraryGrid({ profileId, language = 'en' }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      // Fetch the books index file
      const response = await fetch('/assets/books/index.json');
      if (!response.ok) {
        throw new Error('Failed to load books index');
      }
      const data = await response.json();
      setBooks(data.books || []);
      setLoading(false);
    } catch (err) {
      console.error('Error loading books:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleBookClick = (bookSlug) => {
    setSelectedBook(bookSlug);
  };

  const filteredBooks = books.filter(book => {
    const title = book.title[language] || book.title.en || '';
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (selectedBook) {
    return (
      <ManifestBookReader
        bookSlug={selectedBook}
        profileId={profileId}
        language={language}
        onClose={() => setSelectedBook(null)}
        onSaveProgress={(data) => {
          console.log('Progress saved:', data);
          // TODO: Save progress to user profile or local storage
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-orange-500" />
          <p className="text-gray-600">Loading books...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 max-w-md">
          <h3 className="text-xl font-bold text-red-600 mb-4">Error Loading Books</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadBooks}>Retry</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Book Library</h1>
        <p className="text-gray-600">
          {language === 'en' ? 'Browse and read stories' : 'Navegue e leia histórias'}
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder={language === 'en' ? 'Search books...' : 'Buscar livros...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <Book className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {language === 'en' ? 'No books found' : 'Nenhum livro encontrado'}
          </h3>
          <p className="text-gray-500">
            {language === 'en' ? 'Try adjusting your search' : 'Tente ajustar sua busca'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredBooks.map((book) => (
            <motion.div
              key={book.slug}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card
                className="overflow-hidden cursor-pointer hover:shadow-xl transition-all"
                onClick={() => handleBookClick(book.slug)}
              >
                <div className="aspect-[3/4] relative bg-gradient-to-br from-gray-100 to-gray-200">
                  <img
                    src={`/assets/books/${book.slug}/thumbs/${book.thumbnail}`}
                    alt={book.title[language] || book.title.en}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="267"%3E%3Crect fill="%23ddd" width="200" height="267"/%3E%3Ctext x="50%25" y="50%25" fill="%23999" text-anchor="middle" dy=".3em" font-family="sans-serif"%3ENo Image%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-gray-800 text-sm line-clamp-2">
                    {book.title[language] || book.title.en}
                  </h3>
                  {book.author && (
                    <p className="text-xs text-gray-500 mt-1">{book.author[language] || book.author.en}</p>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}