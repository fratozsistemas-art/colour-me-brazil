import React from 'react';
import { Lock, Download, CheckCircle2, Cloud } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BookCard({ book, userProfile, onClick }) {
  const pagesColored = userProfile?.pages_colored?.filter(pageId => 
    pageId.startsWith(book.id)
  ).length || 0;
  
  const progressPercent = book.page_count > 0 
    ? Math.round((pagesColored / book.page_count) * 100) 
    : 0;

  const collectionColors = {
    amazon: 'from-green-600 to-emerald-500',
    culture: 'from-blue-600 to-purple-500'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer group"
    >
      <div className="bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl border-2 border-transparent hover:border-green-200">
        {/* Cover Image Container */}
        <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200">
          {book.cover_image_url ? (
            <img
              src={book.cover_image_url}
              alt={book.title_en}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className={`text-6xl bg-gradient-to-br ${collectionColors[book.collection]} bg-clip-text text-transparent font-bold`}>
                {book.title_en?.[0] || '?'}
              </div>
            </div>
          )}

          {/* Status Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {book.is_locked && (
              <div className="bg-yellow-500 text-white p-2 rounded-full shadow-lg">
                <Lock className="w-4 h-4" />
              </div>
            )}
            {book.is_downloaded && (
              <div className="bg-green-500 text-white p-2 rounded-full shadow-lg">
                <Download className="w-4 h-4" />
              </div>
            )}
            {progressPercent === 100 && (
              <div className="bg-blue-500 text-white p-2 rounded-full shadow-lg">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            )}
          </div>

          {/* Progress Ring */}
          {progressPercent > 0 && progressPercent < 100 && (
            <div className="absolute bottom-3 right-3">
              <div className="relative w-12 h-12">
                <svg className="transform -rotate-90 w-12 h-12">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="white"
                    strokeWidth="4"
                    fill="none"
                    className="opacity-30"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="white"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - progressPercent / 100)}`}
                    className="transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-bold drop-shadow-lg">
                    {progressPercent}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Collection Badge */}
          <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${collectionColors[book.collection]} shadow-lg`}>
            {book.collection === 'amazon' ? '🌿 Amazon' : '🎨 Culture'}
          </div>
        </div>

        {/* Book Info */}
        <div className="p-4">
          <h3 className="font-bold text-lg text-gray-800 line-clamp-2 mb-1 group-hover:text-green-600 transition-colors">
            {book.title_en}
          </h3>
          {book.subtitle_en && (
            <p className="text-sm text-gray-500 line-clamp-1 mb-2">
              {book.subtitle_en}
            </p>
          )}
          
          {/* Tags */}
          {book.cultural_tags && book.cultural_tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {book.cultural_tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Progress Bar */}
          {progressPercent > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs text-gray-600">
                <span>{pagesColored} of {book.page_count} pages</span>
                <span className="font-semibold text-green-600">{progressPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Download Status */}
          {!book.is_downloaded && !book.is_locked && (
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
              <Cloud className="w-4 h-4" />
              <span>Tap to download for offline use</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}