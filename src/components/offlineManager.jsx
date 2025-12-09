import { base44 } from '@/api/base44Client';

const CACHE_NAME = 'colour-me-brazil-v1';
const DB_NAME = 'ColourMeBrazilDB';
const DB_VERSION = 1;

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
      await cache.put(url, response);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error caching file:', url, error);
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
    await saveToIndexedDB('downloads', {
      book_id: bookId,
      status: 'error',
      error: error.message,
      failed_at: new Date().toISOString()
    });
    throw error;
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
    throw error;
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

// Sync when online
export async function syncOfflineData() {
  if (!navigator.onLine) return;

  try {
    // Get all downloaded books and check if they need updates
    const db = await openDB();
    const transaction = db.transaction(['books'], 'readonly');
    const store = transaction.objectStore('books');
    const books = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    // Check each book for updates
    for (const localBook of books) {
      const remoteBooks = await base44.entities.Book.filter({ id: localBook.book_id });
      const remoteBook = remoteBooks[0];
      
      if (remoteBook && remoteBook.updated_date > localBook.updated_date) {
        // Book has been updated, re-download
        await downloadBook(localBook.book_id);
      }
    }

    return { success: true, synced: books.length };
  } catch (error) {
    console.error('Error syncing offline data:', error);
    return { success: false, error: error.message };
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