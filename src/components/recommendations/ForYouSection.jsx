import React from 'react';
import { Card } from '@/components/ui/card';
import { Sparkles, TrendingUp, BookOpen, Star } from 'lucide-react';
import BookCard from '../library/BookCard';
import { motion } from 'framer-motion';

export default function ForYouSection({ 
  recommendations, 
  readingPath, 
  becauseYouRead,
  userProfile,
  onBookClick,
  language = 'en'
}) {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Top Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {language === 'en' ? 'Recommended For You' : 'Recomendado Para Você'}
            </h2>
            <p className="text-sm text-gray-600">
              {language === 'en' ? 'Based on your reading journey' : 'Baseado na sua jornada de leitura'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.slice(0, 3).map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="relative">
                <BookCard
                  book={book}
                  userProfile={userProfile}
                  onClick={() => onBookClick(book)}
                />
                {book.recommendationReasons && book.recommendationReasons.length > 0 && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="font-medium">
                        {book.recommendationScore > 50 ? 'Top Pick' : 'For You'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              {book.recommendationReasons && book.recommendationReasons.length > 0 && (
                <div className="mt-2 text-xs text-gray-600">
                  <span className="font-medium">Why: </span>
                  {book.recommendationReasons.slice(0, 2).join(' • ')}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Reading Path */}
      {readingPath && readingPath.books.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {language === 'en' ? readingPath.title_en : readingPath.title_pt}
              </h2>
              <p className="text-sm text-gray-600">
                {language === 'en' ? readingPath.description_en : readingPath.description_pt}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {readingPath.books.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <BookCard
                  book={book}
                  userProfile={userProfile}
                  onClick={() => onBookClick(book)}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Because You Read */}
      {becauseYouRead && becauseYouRead.recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {language === 'en' 
                  ? `Because You Read "${becauseYouRead.referenceBook.title_en}"` 
                  : `Porque Você Leu "${becauseYouRead.referenceBook.title_pt}"`
                }
              </h2>
              <p className="text-sm text-gray-600">
                {language === 'en' ? 'Similar stories you might enjoy' : 'Histórias similares que você pode gostar'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {becauseYouRead.recommendations.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <BookCard
                  book={book}
                  userProfile={userProfile}
                  onClick={() => onBookClick(book)}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* More Recommendations */}
      {recommendations.length > 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {language === 'en' ? 'More Suggestions' : 'Mais Sugestões'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.slice(3, 6).map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <BookCard
                  book={book}
                  userProfile={userProfile}
                  onClick={() => onBookClick(book)}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}