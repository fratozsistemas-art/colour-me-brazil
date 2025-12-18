import React, { useState, useEffect } from 'react';
import { Lock, Download, CheckCircle2, Cloud, Trash2, Loader2, Volume2, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { getDownloadStatus, downloadBook, deleteDownloadedBook } from '../offlineManager';

export default function BookCard({ book, userProfile, onClick, onDownloadChange, showProgress = false, onPurchaseClick }) {
  const [downloadStatus, setDownloadStatus] = useState({ status: 'not_downloaded', progress: 0 });
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    loadDownloadStatus();
  }, [book.id]);

  const loadDownloadStatus = async () => {
    const status = await getDownloadStatus(book.id);
    setDownloadStatus(status);
    setIsDownloading(status.status === 'downloading');
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    if (isDownloading) return;

    try {
      setIsDownloading(true);
      await downloadBook(book.id, (progress) => {
        setDownloadStatus({ status: 'downloading', progress });
      });
      await loadDownloadStatus();
      if (onDownloadChange) onDownloadChange();
    } catch (error) {
      console.error('Download failed:', error);
      setDownloadStatus({ status: 'error', progress: 0 });
      setIsDownloading(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    try {
      await deleteDownloadedBook(book.id);
      await loadDownloadStatus();
      if (onDownloadChange) onDownloadChange();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const pagesColored = userProfile?.pages_colored?.filter(pageId => 
    pageId.startsWith(book.id)
  ).length || 0;
  
  const progressPercent = book.page_count > 0 
    ? Math.round((pagesColored / book.page_count) * 100) 
    : 0;

  const lastReadPage = userProfile?.reading_progress?.[book.id] || 0;
  const isCompleted = userProfile?.books_completed?.includes(book.id);
  const hasProgress = lastReadPage > 0;

  const collectionColors = {
    amazon: { gradient: 'linear-gradient(135deg, #06A77D 0%, #2E86AB 100%)', text: '#FFFFFF' },
    culture: { gradient: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)', text: '#FFFFFF' }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer group h-full"
    >
      <div className="bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl border-2 border-transparent h-full flex flex-col" style={{ borderColor: 'transparent' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#A8DADC'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}>
        {/* Cover Image Container */}
        <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0">
          {book.cover_image_url ? (
            <img
              src={book.cover_image_url}
              alt={book.title_en}
              className="w-full h-full object-contain p-2"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-6xl font-bold" style={{ 
                background: collectionColors[book.collection]?.gradient || 'linear-gradient(135deg, #2E86AB 0%, #06A77D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
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
            {isCompleted && (
              <div className="bg-purple-500 text-white p-2 rounded-full shadow-lg">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            )}
            {downloadStatus.status === 'completed' && (
              <div className="bg-green-500 text-white p-2 rounded-full shadow-lg">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            )}
            {isDownloading && (
              <div className="bg-blue-500 text-white p-2 rounded-full shadow-lg">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            )}
          </div>

          {/* Continue Reading Badge */}
          {hasProgress && !isCompleted && (
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white bg-blue-600 shadow-lg">
              Page {lastReadPage + 1}
            </div>
          )}

          {/* Download Progress Ring */}
          {isDownloading && downloadStatus.progress > 0 && (
            <div className="absolute bottom-3 left-3">
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
                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - downloadStatus.progress / 100)}`}
                    className="transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-bold drop-shadow-lg">
                    {downloadStatus.progress}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Coloring Progress Ring */}
          {!isDownloading && progressPercent > 0 && progressPercent < 100 && (
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

          {/* Collection Badge - only show if no progress badge */}
          {!hasProgress && (
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold shadow-lg" style={{ 
              background: collectionColors[book.collection]?.gradient || 'linear-gradient(135deg, #2E86AB 0%, #06A77D 100%)',
              color: collectionColors[book.collection]?.text || '#FFFFFF'
            }}>
              {book.collection === 'amazon' ? '🌿 Amazon' : '🎨 Culture'}
            </div>
          )}

          {/* Read-Aloud Progress Badge */}
          {showProgress && hasProgress && (
            <div className="absolute bottom-3 left-3 bg-blue-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
              <Volume2 className="w-3 h-3" />
              {Math.round(((lastReadPage + 1) / (book.page_count || 12)) * 100)}%
            </div>
          )}
        </div>

        {/* Book Info */}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-bold text-lg line-clamp-2 mb-1 transition-colors" style={{ color: '#1A2332' }} onMouseEnter={(e) => e.currentTarget.style.color = '#FF6B35'} onMouseLeave={(e) => e.currentTarget.style.color = '#1A2332'}>
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

          <div className="flex-grow" />

          {/* Progress Bar */}
          {progressPercent > 0 && (
            <div className="space-y-1 mt-3">
              <div className="flex justify-between items-center text-xs text-gray-600">
                <span>{pagesColored} of {book.page_count} pages</span>
                <span className="font-semibold" style={{ color: '#06A77D' }}>{progressPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
               <div
                 className="h-full rounded-full transition-all duration-500"
                 style={{ 
                   width: `${progressPercent}%`,
                   background: 'linear-gradient(135deg, #FF6B35 0%, #2E86AB 100%)'
                 }}
               />
              </div>
            </div>
          )}

          {/* Download Actions / Purchase Button */}
          <div className="mt-3">
            {book.is_locked ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onPurchaseClick) onPurchaseClick(book);
                }}
                className="flex items-center gap-2 text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 px-3 py-2 rounded-lg transition-all w-full justify-center"
              >
                <ShoppingCart className="w-3 h-3" />
                <span>Unlock - $4.99</span>
              </button>
            ) : downloadStatus.status === 'completed' ? (
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 text-xs text-red-600 hover:text-red-700 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>Remove offline copy</span>
              </button>
            ) : isDownloading ? (
              <div className="flex items-center gap-2 text-xs text-blue-600">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Downloading... {downloadStatus.progress}%</span>
              </div>
            ) : (
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 text-xs transition-colors"
                style={{ color: '#06A77D' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#2E86AB'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#06A77D'}
              >
                <Download className="w-3 h-3" />
                <span>Download for offline</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}