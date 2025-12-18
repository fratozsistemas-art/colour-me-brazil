import { base44 } from '@/api/base44Client';

const CACHE_NAME = 'colour-me-brazil-v1';
const DB_NAME = 'ColourMeBrazilDB';
const DB_VERSION = 2;

// Initialize IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('books')) {
        db.createObjectStore('books', { keyPath: 'book_id' });
      }
      if (!db.objectStoreNames.contains('pages')) {
        db.createObjectStore('pages', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('downloads')) {
        db.createObjectStore('downloads', { keyPath: 'book_id' });
      }
      if (!db.objectStoreNames.contains('coloring_sessions')) {
        const sessionsStore = db.createObjectStore('coloring_sessions', { keyPath: 'id' });
        sessionsStore.createIndex('profile_id', 'profile_id', { unique: false });
        sessionsStore.createIndex('synced', 'synced', { unique: false });
      }
      if (!db.objectStoreNames.contains('reading_progress')) {
        const progressStore = db.createObjectStore('reading_progress', { keyPath: 'id' });
        progressStore.createIndex('profile_id', 'profile_id', { unique: false });
        progressStore.createIndex('synced', 'synced', { unique: false });
      }
    };
  });
}

// Save book data to IndexedDB
async function saveToIndexedDB(storeName, data) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(data);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Get data from IndexedDB
async function getFromIndexedDB(storeName, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Cache file in Cache API
async function cacheFile(url) {
  if (!url) return null;
  
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await fetch(url);
    if (response.ok) {
      await cache.put(url, response.clone());
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error caching file:', url, error?.message || error);
    return false;
  }
}

// Download a single book with progress tracking
export async function downloadBook(bookId, onProgress) {
  try {
    // Get book and pages data
    const books = await base44.entities.Book.filter({ id: bookId });
    const book = books[0];
    if (!book) throw new Error('Book not found');

    const pages = await base44.entities.Page.filter({ book_id: bookId });
    pages.sort((a, b) => a.page_number - b.page_number);

    // Save download status
    await saveToIndexedDB('downloads', {
      book_id: bookId,
      status: 'downloading',
      progress: 0,
      started_at: new Date().toISOString()
    });

    // Calculate total files to download
    const filesToDownload = [];
    pages.forEach(page => {
      if (page.illustration_url) filesToDownload.push(page.illustration_url);
      if (page.audio_narration_en_url) filesToDownload.push(page.audio_narration_en_url);
      if (page.audio_narration_pt_url) filesToDownload.push(page.audio_narration_pt_url);
    });
    if (book.cover_image_url) filesToDownload.push(book.cover_image_url);

    const totalFiles = filesToDownload.length;
    let downloadedFiles = 0;

    // Download files with progress
    for (const url of filesToDownload) {
      await cacheFile(url);
      downloadedFiles++;
      const progress = Math.round((downloadedFiles / totalFiles) * 100);
      
      await saveToIndexedDB('downloads', {
        book_id: bookId,
        status: 'downloading',
        progress,
        started_at: new Date().toISOString()
      });
      
      if (onProgress) onProgress(progress);
    }

    // Save book and pages data to IndexedDB
    await saveToIndexedDB('books', { ...book, book_id: bookId });
    for (const page of pages) {
      await saveToIndexedDB('pages', page);
    }

    // Mark as complete
    await saveToIndexedDB('downloads', {
      book_id: bookId,
      status: 'completed',
      progress: 100,
      completed_at: new Date().toISOString()
    });

    // Update book entity
    await base44.entities.Book.update(bookId, { is_downloaded: true });

    return { success: true, book, pages };
  } catch (error) {
    console.error('Error downloading book:', error);
    const errorMessage = error?.message || error?.toString() || 'Download failed';
    await saveToIndexedDB('downloads', {
      book_id: bookId,
      status: 'error',
      error: errorMessage,
      failed_at: new Date().toISOString()
    }).catch(() => {}); // Ignore if saving error status fails
    throw new Error(errorMessage);
  }
}

// Delete downloaded book
export async function deleteDownloadedBook(bookId) {
  try {
    const db = await openDB();
    
    // Get pages to delete their cached files
    const pages = await base44.entities.Page.filter({ book_id: bookId });
    const cache = await caches.open(CACHE_NAME);
    
    // Delete cached files
    for (const page of pages) {
      if (page.illustration_url) await cache.delete(page.illustration_url);
      if (page.audio_narration_en_url) await cache.delete(page.audio_narration_en_url);
      if (page.audio_narration_pt_url) await cache.delete(page.audio_narration_pt_url);
    }

    // Delete from IndexedDB
    const transaction = db.transaction(['books', 'pages', 'downloads'], 'readwrite');
    transaction.objectStore('books').delete(bookId);
    transaction.objectStore('downloads').delete(bookId);
    
    for (const page of pages) {
      transaction.objectStore('pages').delete(page.id);
    }

    // Update book entity
    await base44.entities.Book.update(bookId, { is_downloaded: false });

    return { success: true };
  } catch (error) {
    console.error('Error deleting downloaded book:', error);
    const errorMessage = error?.message || error?.toString() || 'Delete failed';
    throw new Error(errorMessage);
  }
}

// Get download status
export async function getDownloadStatus(bookId) {
  try {
    const status = await getFromIndexedDB('downloads', bookId);
    return status || { status: 'not_downloaded', progress: 0 };
  } catch (error) {
    return { status: 'not_downloaded', progress: 0 };
  }
}

// Check if book is downloaded
export async function isBookDownloaded(bookId) {
  try {
    const book = await getFromIndexedDB('books', bookId);
    return !!book;
  } catch (error) {
    return false;
  }
}

// Get offline book data
export async function getOfflineBook(bookId) {
  try {
    const book = await getFromIndexedDB('books', bookId);
    if (!book) return null;

    const db = await openDB();
    const pages = await new Promise((resolve, reject) => {
      const transaction = db.transaction(['pages'], 'readonly');
      const store = transaction.objectStore('pages');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const allPages = request.result;
        const bookPages = allPages.filter(p => p.book_id === bookId);
        resolve(bookPages.sort((a, b) => a.page_number - b.page_number));
      };
      request.onerror = () => reject(request.error);
    });

    return { book, pages };
  } catch (error) {
    console.error('Error getting offline book:', error);
    return null;
  }
}

// Save coloring session offline
export async function saveColoringSessionOffline(profileId, pageId, sessionData) {
  const db = await openDB();
  const transaction = db.transaction(['coloring_sessions'], 'readwrite');
  const store = transaction.objectStore('coloring_sessions');
  
  const session = {
    id: `${profileId}_${pageId}`,
    profile_id: profileId,
    page_id: pageId,
    ...sessionData,
    synced: false,
    last_modified: new Date().toISOString()
  };
  
  return new Promise((resolve, reject) => {
    const request = store.put(session);
    request.onsuccess = () => resolve(session);
    request.onerror = () => reject(request.error);
  });
}

// Save reading progress offline
export async function saveReadingProgressOffline(profileId, bookId, pageIndex) {
  const db = await openDB();
  const transaction = db.transaction(['reading_progress'], 'readwrite');
  const store = transaction.objectStore('reading_progress');
  
  const progress = {
    id: `${profileId}_${bookId}`,
    profile_id: profileId,
    book_id: bookId,
    page_index: pageIndex,
    synced: false,
    timestamp: new Date().toISOString()
  };
  
  return new Promise((resolve, reject) => {
    const request = store.put(progress);
    request.onsuccess = () => resolve(progress);
    request.onerror = () => reject(request.error);
  });
}

// Get unsynced data
async function getUnsyncedData() {
  const db = await openDB();
  const unsyncedData = {
    coloringSessions: [],
    readingProgress: []
  };
  
  // Get unsynced coloring sessions
  const sessionsTx = db.transaction(['coloring_sessions'], 'readonly');
  const sessionsStore = sessionsTx.objectStore('coloring_sessions');
  const allSessions = await new Promise((resolve, reject) => {
    const request = sessionsStore.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  unsyncedData.coloringSessions = allSessions.filter(s => !s.synced);
  
  // Get unsynced reading progress
  const progressTx = db.transaction(['reading_progress'], 'readonly');
  const progressStore = progressTx.objectStore('reading_progress');
  const allProgress = await new Promise((resolve, reject) => {
    const request = progressStore.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  unsyncedData.readingProgress = allProgress.filter(p => !p.synced);
  
  return unsyncedData;
}

// Sync when online
export async function syncOfflineData() {
  if (!navigator.onLine) return { success: false, message: 'No internet connection' };

  try {
    const results = {
      coloringSessions: 0,
      readingProgress: 0,
      bookUpdates: 0,
      errors: []
    };

    // Get unsynced data
    const unsyncedData = await getUnsyncedData();

    // Sync coloring sessions
    for (const session of unsyncedData.coloringSessions) {
      try {
        const existing = await base44.entities.ColoringSession.filter({
          profile_id: session.profile_id,
          page_id: session.page_id
        });

        if (existing.length > 0) {
          await base44.entities.ColoringSession.update(existing[0].id, {
            strokes: session.strokes,
            coloring_time: session.coloring_time,
            is_completed: session.is_completed,
            thumbnail_data: session.thumbnail_data,
            last_modified: session.last_modified
          });
        } else {
          await base44.entities.ColoringSession.create({
            profile_id: session.profile_id,
            page_id: session.page_id,
            book_id: session.book_id,
            strokes: session.strokes,
            coloring_time: session.coloring_time,
            is_completed: session.is_completed,
            thumbnail_data: session.thumbnail_data,
            last_modified: session.last_modified
          });
        }

        // Mark as synced
        const db = await openDB();
        const tx = db.transaction(['coloring_sessions'], 'readwrite');
        const store = tx.objectStore('coloring_sessions');
        session.synced = true;
        await new Promise((resolve, reject) => {
          const request = store.put(session);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
        
        results.coloringSessions++;
      } catch (error) {
        console.error('Error syncing coloring session:', error);
        results.errors.push({ type: 'coloring_session', error: error.message });
      }
    }

    // Sync reading progress
    for (const progress of unsyncedData.readingProgress) {
      try {
        const profiles = await base44.entities.UserProfile.filter({ id: progress.profile_id });
        if (profiles.length > 0) {
          const currentProgress = profiles[0].reading_progress || {};
          currentProgress[progress.book_id] = progress.page_index;
          
          await base44.entities.UserProfile.update(progress.profile_id, {
            reading_progress: currentProgress
          });

          // Mark as synced
          const db = await openDB();
          const tx = db.transaction(['reading_progress'], 'readwrite');
          const store = tx.objectStore('reading_progress');
          progress.synced = true;
          await new Promise((resolve, reject) => {
            const request = store.put(progress);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
          });
          
          results.readingProgress++;
        }
      } catch (error) {
        console.error('Error syncing reading progress:', error);
        results.errors.push({ type: 'reading_progress', error: error.message });
      }
    }

    // Check downloaded books for updates
    const db = await openDB();
    const transaction = db.transaction(['books'], 'readonly');
    const store = transaction.objectStore('books');
    const books = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    for (const localBook of books) {
      try {
        const remoteBooks = await base44.entities.Book.filter({ id: localBook.book_id });
        const remoteBook = remoteBooks[0];
        
        if (remoteBook && remoteBook.updated_date > localBook.updated_date) {
          await downloadBook(localBook.book_id);
          results.bookUpdates++;
        }
      } catch (error) {
        console.error('Error checking book updates:', error);
        results.errors.push({ type: 'book_update', error: error.message });
      }
    }

    return { 
      success: true, 
      results,
      message: `Synced ${results.coloringSessions} coloring sessions, ${results.readingProgress} reading progress, ${results.bookUpdates} book updates`
    };
  } catch (error) {
    console.error('Error syncing offline data:', error);
    return { success: false, message: error?.message || error?.toString() || 'Sync failed' };
  }
}

// Listen for online/offline events
export function setupOfflineSync() {
  window.addEventListener('online', () => {
    console.log('Back online, syncing data...');
    syncOfflineData();
  });

  window.addEventListener('offline', () => {
    console.log('Gone offline, offline mode active');
  });
}

// Get all downloaded books
export async function getAllDownloadedBooks() {
  try {
    const db = await openDB();
    const transaction = db.transaction(['books'], 'readonly');
    const store = transaction.objectStore('books');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting downloaded books:', error);
    return [];
  }
}