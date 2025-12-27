import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { HardDrive, Download, Trash2, RefreshCw, CheckCircle2, Loader2, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { 
  getAllDownloadedBooks, 
  deleteDownloadedBook, 
  downloadBook,
  batchDownloadBooks,
  getStorageUsage 
} from '../offlineManager';
import { toast } from 'sonner';

export default function OfflineSettings() {
  const [downloadedBooks, setDownloadedBooks] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [storageInfo, setStorageInfo] = useState({ used: 0, total: 0, percentage: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingIds, setDownloadingIds] = useState([]);
  const [selectedForBatch, setSelectedForBatch] = useState([]);
  const [batchDownloading, setBatchDownloading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    loadData();
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [downloaded, storage, books] = await Promise.all([
        getAllDownloadedBooks(),
        getStorageUsage(),
        base44.entities.Book.list()
      ]);
      
      setDownloadedBooks(downloaded);
      setStorageInfo(storage);
      setAllBooks(books);
    } catch (error) {
      console.error('Error loading offline data:', error);
      toast.error('Failed to load offline data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (bookId) => {
    try {
      await deleteDownloadedBook(bookId);
      await loadData();
      toast.success('Book removed from offline storage');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete book');
    }
  };

  const handleDownload = async (bookId) => {
    if (!isOnline) {
      toast.error('You must be online to download books');
      return;
    }

    setDownloadingIds([...downloadingIds, bookId]);
    try {
      await downloadBook(bookId, (progress) => {
        console.log(`Download progress: ${progress}%`);
      });
      await loadData();
      toast.success('Book downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download book');
    } finally {
      setDownloadingIds(downloadingIds.filter(id => id !== bookId));
    }
  };

  const handleBatchDownload = async () => {
    if (!isOnline) {
      toast.error('You must be online to download books');
      return;
    }

    if (selectedForBatch.length === 0) {
      toast.error('Please select books to download');
      return;
    }

    setBatchDownloading(true);
    try {
      await batchDownloadBooks(selectedForBatch, (bookId, progress) => {
        console.log(`Book ${bookId}: ${progress}%`);
      });
      await loadData();
      setSelectedForBatch([]);
      toast.success(`${selectedForBatch.length} books downloaded successfully`);
    } catch (error) {
      console.error('Batch download error:', error);
      toast.error('Some downloads failed');
    } finally {
      setBatchDownloading(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('Are you sure you want to remove all downloaded books?')) return;

    try {
      for (const book of downloadedBooks) {
        await deleteDownloadedBook(book.bookId);
      }
      await loadData();
      toast.success('All books removed from offline storage');
    } catch (error) {
      console.error('Delete all error:', error);
      toast.error('Failed to delete all books');
    }
  };

  const toggleBatchSelect = (bookId) => {
    setSelectedForBatch(prev => 
      prev.includes(bookId) 
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  const availableBooks = allBooks.filter(
    book => !downloadedBooks.some(d => d.bookId === book.id) && !book.is_locked
  );

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-3">
          {isOnline ? (
            <>
              <Wifi className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-semibold text-green-700">Online</p>
                <p className="text-xs text-green-600">Downloads and sync available</p>
              </div>
            </>
          ) : (
            <>
              <WifiOff className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-semibold text-orange-700">Offline</p>
                <p className="text-xs text-orange-600">Using downloaded content only</p>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Storage Usage */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <HardDrive className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-800">Storage Usage</h3>
        </div>
        
        <div className="space-y-3">
          <Progress value={storageInfo.percentage} className="h-3" />
          <div className="flex justify-between text-sm text-gray-600">
            <span>{(storageInfo.used / 1024 / 1024).toFixed(2)} MB used</span>
            <span>{storageInfo.percentage.toFixed(1)}% of {(storageInfo.total / 1024 / 1024).toFixed(0)} MB</span>
          </div>
        </div>
      </Card>

      {/* Downloaded Books */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-bold text-gray-800">Downloaded Books</h3>
            <span className="text-sm text-gray-500">({downloadedBooks.length})</span>
          </div>
          {downloadedBooks.length > 0 && (
            <Button
              onClick={handleDeleteAll}
              variant="outline"
              size="sm"
              className="text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove All
            </Button>
          )}
        </div>

        {downloadedBooks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No books downloaded yet</p>
        ) : (
          <div className="space-y-2">
            {downloadedBooks.map((item) => {
              const book = allBooks.find(b => b.id === item.bookId);
              if (!book) return null;

              return (
                <motion.div
                  key={item.bookId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {book.cover_image_url && (
                      <img 
                        src={book.cover_image_url} 
                        alt="" 
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-800">{book.title_en}</p>
                      <p className="text-xs text-gray-500">
                        {item.pageCount} pages • {(item.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDelete(item.bookId)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Available for Download */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Download className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-800">Available for Download</h3>
            <span className="text-sm text-gray-500">({availableBooks.length})</span>
          </div>
          {selectedForBatch.length > 0 && (
            <Button
              onClick={handleBatchDownload}
              disabled={batchDownloading || !isOnline}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {batchDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download {selectedForBatch.length} Selected
                </>
              )}
            </Button>
          )}
        </div>

        {availableBooks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">All available books are downloaded</p>
        ) : (
          <div className="space-y-2">
            {availableBooks.map((book) => {
              const isDownloading = downloadingIds.includes(book.id);
              const isSelected = selectedForBatch.includes(book.id);

              return (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleBatchSelect(book.id)}
                      disabled={isDownloading || !isOnline}
                      className="w-4 h-4"
                    />
                    {book.cover_image_url && (
                      <img 
                        src={book.cover_image_url} 
                        alt="" 
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-800">{book.title_en}</p>
                      <p className="text-xs text-gray-500">{book.page_count || 12} pages</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDownload(book.id)}
                    disabled={isDownloading || !isOnline}
                    variant="outline"
                    size="sm"
                    className="text-blue-600"
                  >
                    {isDownloading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Sync Information */}
      <Card className="p-4 bg-blue-50">
        <div className="flex items-start gap-3">
          <RefreshCw className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Automatic Sync</p>
            <p className="text-blue-700">
              Your reading progress, coloring sessions, and mini-game completions are automatically 
              saved offline and synced when you reconnect to the internet.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}