import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Trash2, WifiOff, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const OFFLINE_STORAGE_KEY = 'colourme_offline_books';
const MAX_STORAGE_MB = 50;

export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export function saveBookOffline(bookId, bookData) {
  try {
    const stored = localStorage.getItem(OFFLINE_STORAGE_KEY);
    const books = stored ? JSON.parse(stored) : {};
    
    // Check storage size
    const currentSize = new Blob([JSON.stringify(books)]).size / (1024 * 1024);
    const newSize = new Blob([JSON.stringify(bookData)]).size / (1024 * 1024);
    
    if (currentSize + newSize > MAX_STORAGE_MB) {
      throw new Error('Armazenamento offline cheio. Remova alguns livros.');
    }
    
    books[bookId] = {
      ...bookData,
      downloadedAt: new Date().toISOString()
    };
    
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(books));
    return true;
  } catch (error) {
    console.error('Error saving offline:', error);
    return false;
  }
}

export function getOfflineBook(bookId) {
  try {
    const stored = localStorage.getItem(OFFLINE_STORAGE_KEY);
    if (!stored) return null;
    
    const books = JSON.parse(stored);
    return books[bookId] || null;
  } catch (error) {
    console.error('Error getting offline book:', error);
    return null;
  }
}

export function removeOfflineBook(bookId) {
  try {
    const stored = localStorage.getItem(OFFLINE_STORAGE_KEY);
    if (!stored) return true;
    
    const books = JSON.parse(stored);
    delete books[bookId];
    
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(books));
    return true;
  } catch (error) {
    console.error('Error removing offline book:', error);
    return false;
  }
}

export function getOfflineBooks() {
  try {
    const stored = localStorage.getItem(OFFLINE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error getting offline books:', error);
    return {};
  }
}

export function isBookOffline(bookId) {
  const books = getOfflineBooks();
  return !!books[bookId];
}

export function getStorageUsage() {
  try {
    const stored = localStorage.getItem(OFFLINE_STORAGE_KEY);
    if (!stored) return { used: 0, max: MAX_STORAGE_MB, percentage: 0 };
    
    const sizeMB = new Blob([stored]).size / (1024 * 1024);
    return {
      used: sizeMB.toFixed(2),
      max: MAX_STORAGE_MB,
      percentage: (sizeMB / MAX_STORAGE_MB) * 100
    };
  } catch (error) {
    return { used: 0, max: MAX_STORAGE_MB, percentage: 0 };
  }
}

export default function OfflineManager({ profileId }) {
  const isOnline = useOfflineStatus();
  const [offlineBooks, setOfflineBooks] = useState({});
  const [storage, setStorage] = useState({ used: 0, max: MAX_STORAGE_MB, percentage: 0 });

  useEffect(() => {
    refreshOfflineData();
  }, []);

  const refreshOfflineData = () => {
    setOfflineBooks(getOfflineBooks());
    setStorage(getStorageUsage());
  };

  const handleRemoveBook = (bookId) => {
    if (removeOfflineBook(bookId)) {
      toast.success('Livro removido do modo offline');
      refreshOfflineData();
    } else {
      toast.error('Erro ao remover livro');
    }
  };

  const bookList = Object.entries(offlineBooks);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <WifiOff className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-lg">Modo Offline</h3>
          </div>
          <Badge variant={isOnline ? 'default' : 'secondary'}>
            {isOnline ? '🟢 Online' : '🔴 Offline'}
          </Badge>
        </div>

        {/* Storage Usage */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between text-sm mb-1">
            <span>Armazenamento Usado</span>
            <span className="font-semibold">{storage.used}MB / {storage.max}MB</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(storage.percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Offline Books List */}
        <div>
          <h4 className="font-medium text-sm mb-2">Livros Disponíveis Offline ({bookList.length})</h4>
          {bookList.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              Nenhum livro baixado para modo offline ainda
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {bookList.map(([bookId, book]) => (
                <div
                  key={bookId}
                  className="flex items-center justify-between p-2 bg-white border rounded-lg"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{book.title || 'Livro'}</p>
                      <p className="text-xs text-gray-500">
                        Baixado em {new Date(book.downloadedAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveBook(bookId)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {!isOnline && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ Você está offline. Apenas livros baixados estão disponíveis.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}