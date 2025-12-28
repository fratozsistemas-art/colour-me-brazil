import { useState, useEffect } from 'react';
import { 
  getOfflineBook, 
  isBookDownloaded,
  saveColoringSessionOffline,
  saveReadingProgressOffline,
  saveMiniGameProgressOffline
} from '../offlineManager';

export function useOfflineMode() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('Back online');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('Gone offline');
    };

    const handleSyncComplete = (event) => {
      const { results } = event.detail;
      const total = results.coloringSessions + 
                   results.readingProgress + 
                   results.annotations +
                   results.bookmarks;
      setPendingSyncCount(0);
      console.log(`Synced ${total} items`);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('offline-sync-complete', handleSyncComplete);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('offline-sync-complete', handleSyncComplete);
    };
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
    pendingSyncCount
  };
}

export async function loadBookData(bookId, isOnline) {
  // Try offline first if offline or as fallback
  if (!isOnline) {
    const offlineData = await getOfflineBook(bookId);
    if (offlineData) {
      return {
        book: offlineData.book,
        pages: offlineData.pages,
        source: 'offline'
      };
    }
    throw new Error('Book not available offline');
  }

  // Online - fetch from API
  try {
    const { base44 } = await import('@/api/base44Client');
    const books = await base44.entities.Book.filter({ id: bookId });
    const book = books[0];
    
    if (!book) throw new Error('Book not found');

    const pages = await base44.entities.Page.filter({ book_id: bookId });
    pages.sort((a, b) => a.page_number - b.page_number);

    return {
      book,
      pages,
      source: 'online'
    };
  } catch (error) {
    // Fallback to offline if online fetch fails
    const offlineData = await getOfflineBook(bookId);
    if (offlineData) {
      return {
        book: offlineData.book,
        pages: offlineData.pages,
        source: 'offline-fallback'
      };
    }
    throw error;
  }
}

export async function saveProgress(type, data, isOnline) {
  if (isOnline) {
    // Try to save online first
    try {
      const { base44 } = await import('@/api/base44Client');
      
      switch (type) {
        case 'coloring':
          await base44.entities.ColoringSession.create(data);
          break;
        case 'reading':
          const profiles = await base44.entities.UserProfile.filter({ id: data.profileId });
          if (profiles.length > 0) {
            const currentProgress = profiles[0].reading_progress || {};
            currentProgress[data.bookId] = data.pageIndex;
            await base44.entities.UserProfile.update(data.profileId, {
              reading_progress: currentProgress
            });
          }
          break;
        case 'minigame':
          const progressRecords = await base44.entities.StoryProgress.filter({
            profile_id: data.profileId,
            book_id: data.bookId
          });
          if (progressRecords.length > 0) {
            const completedGames = progressRecords[0].completed_minigames || [];
            if (!completedGames.includes(data.gameId)) {
              await base44.entities.StoryProgress.update(progressRecords[0].id, {
                completed_minigames: [...completedGames, data.gameId]
              });
            }
          }
          break;
      }
      return { success: true, saved: 'online' };
    } catch (error) {
      console.error('Online save failed, falling back to offline:', error);
      // Fall through to offline save
    }
  }

  // Save offline
  switch (type) {
    case 'coloring':
      await saveColoringSessionOffline(
        data.profile_id,
        data.page_id,
        data
      );
      break;
    case 'reading':
      await saveReadingProgressOffline(
        data.profileId,
        data.bookId,
        data.pageIndex
      );
      break;
    case 'minigame':
      await saveMiniGameProgressOffline(
        data.profileId,
        data.gameId,
        data.result
      );
      break;
  }

  return { success: true, saved: 'offline' };
}