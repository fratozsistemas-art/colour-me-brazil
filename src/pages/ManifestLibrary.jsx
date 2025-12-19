import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BookOpen, Play, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '../utils';
import { loadBookManifest } from '@/components/books/loadManifest';

const AVAILABLE_BOOKS = [
  {
    id: 'tales-of-amazon',
    title: 'Tales of the Amazon',
    author: 'Grace Nogueira',
    description: 'Discover the magical legends of the Amazon rainforest',
    coverImage: '/assets/books/tales-of-amazon/pages/01-cover.jpeg',
    collection: 'amazon'
  }
];

export default function ManifestLibrary() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBooks = async () => {
      const loadedBooks = [];
      
      for (const book of AVAILABLE_BOOKS) {
        try {
          const manifest = await loadBookManifest(book.id);
          loadedBooks.push({
            ...book,
            manifest,
            pageCount: manifest.pages.length
          });
        } catch (error) {
          console.error(`Failed to load manifest for ${book.id}:`, error);
        }
      }
      
      setBooks(loadedBooks);
      setLoading(false);
    };
    
    loadBooks();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          📚 Book Library (Manifest-Based)
        </h1>
        <p className="text-gray-600">
          Stories and coloring pages from the Amazon and Brazilian culture
        </p>
      </div>

      {/* Book Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book, index) => (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden hover:shadow-2xl transition-shadow group">
              {/* Cover Image */}
              <div className="relative aspect-[3/4] bg-gradient-to-br from-orange-100 to-pink-100">
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>

              {/* Book Info */}
              <div className="p-6">
                <div className="mb-3">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-600">by {book.author}</p>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {book.description}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    <span>{book.pageCount} pages</span>
                  </div>
                  <div className="px-2 py-1 bg-gray-100 rounded">
                    {book.collection}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    to={`${createPageUrl('ManifestBookReader')}?bookId=${book.id}&pageId=${book.manifest.pages[0].id}`}
                    className="flex-1"
                  >
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-pink-500">
                      <Play className="w-4 h-4 mr-2" />
                      Start Reading
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Info Box */}
      <Card className="mt-8 p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">
              Manifest-Based Content System
            </h3>
            <p className="text-sm text-blue-800">
              This library uses local manifests and assets for optimal offline performance and native app compatibility.
              Books are loaded from <code className="bg-blue-100 px-1 rounded">/public/assets/books/</code> with their content defined in <code className="bg-blue-100 px-1 rounded">manifest.json</code> files.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}