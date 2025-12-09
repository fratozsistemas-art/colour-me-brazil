import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Download, Lock, Wifi, WifiOff } from 'lucide-react';
import BookCard from '../components/library/BookCard';
import ProfileSelector from '../components/profile/ProfileSelector';
import StoryReader from '../components/story/StoryReader';
import ColoringCanvas from '../components/coloring/ColoringCanvas';
import { checkAndAwardAchievements, awardPoints } from '../components/achievementManager';
import { setupOfflineSync, syncOfflineData, getAllDownloadedBooks } from '../components/offlineManager';

export default function Library() {
  const [currentProfile, setCurrentProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [showLockedBooks, setShowLockedBooks] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [storyPages, setStoryPages] = useState([]);
  const [coloringPage, setColoringPage] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [downloadedCount, setDownloadedCount] = useState(0);
  
  const queryClient = useQueryClient();

  // Fetch user profiles
  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => base44.entities.UserProfile.list(),
  });

  // Fetch books
  const { data: books = [], isLoading: booksLoading } = useQuery({
    queryKey: ['books'],
    queryFn: () => base44.entities.Book.list('order_index'),
  });

  // Load saved profile from localStorage
  useEffect(() => {
    const savedProfileId = localStorage.getItem('currentProfileId');
    if (savedProfileId && profiles.length > 0) {
      const profile = profiles.find(p => p.id === savedProfileId);
      if (profile) {
        setCurrentProfile(profile);
      }
    }
  }, [profiles]);

  // Setup offline sync and online/offline detection
  useEffect(() => {
    setupOfflineSync();
    
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineData();
    };
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    loadDownloadedCount();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadDownloadedCount = async () => {
    const downloaded = await getAllDownloadedBooks();
    setDownloadedCount(downloaded.length);
  };

  const handleProfileCreated = async (profileData) => {
    if (profileData.id) {
      // Existing profile selected
      setCurrentProfile(profileData);
      localStorage.setItem('currentProfileId', profileData.id);
    } else {
      // New profile created
      const newProfile = await base44.entities.UserProfile.create(profileData);
      setCurrentProfile(newProfile);
      localStorage.setItem('currentProfileId', newProfile.id);
    }
  };

  const handleBookClick = async (book) => {
    if (book.is_locked) {
      // Show paywall (will be implemented in Sprint 4)
      alert('This book is locked. Purchase the full collection to unlock!');
    } else {
      // Load pages for this book
      const pages = await base44.entities.Page.filter({ book_id: book.id });
      setStoryPages(pages.sort((a, b) => a.page_number - b.page_number));
      setSelectedBook(book);
      
      // Update current book ID
      await base44.entities.UserProfile.update(currentProfile.id, {
        current_book_id: book.id
      });
    }
  };

  const updateReadingProgress = async (bookId, pageIndex) => {
    if (!currentProfile) return;
    
    const newProgress = {
      ...(currentProfile.reading_progress || {}),
      [bookId]: pageIndex
    };
    
    await base44.entities.UserProfile.update(currentProfile.id, {
      reading_progress: newProgress
    });
    
    queryClient.invalidateQueries(['profiles']);
  };

  const markBookCompleted = async (bookId) => {
    if (!currentProfile) return;
    
    const booksCompleted = currentProfile.books_completed || [];
    if (!booksCompleted.includes(bookId)) {
      await base44.entities.UserProfile.update(currentProfile.id, {
        books_completed: [...booksCompleted, bookId]
      });
      
      // Award points for completing a book
      await awardPoints(currentProfile.id, 'book_completed');
      await checkAndAwardAchievements(currentProfile.id);
      queryClient.invalidateQueries(['profiles']);
    }
  };

  const handleColorPage = (page) => {
    setColoringPage(page);
  };

  const saveColoringSession = useMutation({
    mutationFn: async (sessionData) => {
      const existing = await base44.entities.ColoringSession.filter({
        profile_id: currentProfile.id,
        page_id: coloringPage.id
      });

      if (existing.length > 0) {
        // Update existing session
        return base44.entities.ColoringSession.update(existing[0].id, {
          ...sessionData,
          last_modified: new Date().toISOString()
        });
      } else {
        // Create new session
        return base44.entities.ColoringSession.create({
          profile_id: currentProfile.id,
          page_id: coloringPage.id,
          book_id: coloringPage.book_id,
          ...sessionData,
          last_modified: new Date().toISOString()
        });
      }
    },
    onSuccess: async () => {
      // Update profile progress
      const sessions = await base44.entities.ColoringSession.filter({ 
        profile_id: currentProfile.id 
      });
      
      const completedPages = sessions.filter(s => s.is_completed).map(s => s.page_id);
      const totalTime = sessions.reduce((sum, s) => sum + (s.coloring_time || 0), 0);
      
      await base44.entities.UserProfile.update(currentProfile.id, {
        pages_colored: completedPages,
        total_coloring_time: totalTime
      });

      // Check for new achievements
      await checkAndAwardAchievements(currentProfile.id);
      
      queryClient.invalidateQueries(['profiles']);
      queryClient.invalidateQueries(['coloringSessions']);
      setColoringPage(null);
    }
  });

  // Filter books
  const filteredBooks = books.filter(book => {
    const matchesSearch = 
      book.title_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.title_pt?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCollection = 
      selectedCollection === 'all' || book.collection === selectedCollection;
    
    const matchesLockStatus = showLockedBooks || !book.is_locked;

    return matchesSearch && matchesCollection && matchesLockStatus;
  });

  // Collection stats
  const stats = {
    total: books.length,
    unlocked: books.filter(b => !b.is_locked).length,
    completed: currentProfile?.books_completed?.length || 0,
    amazon: books.filter(b => b.collection === 'amazon').length,
    culture: books.filter(b => b.collection === 'culture').length
  };

  // If no profile selected, show profile selector
  if (!currentProfile) {
    return <ProfileSelector onProfileCreated={handleProfileCreated} existingProfiles={profiles} />;
  }

  return (
    <>
      {/* Story Reader Modal */}
      {selectedBook && storyPages.length > 0 && !coloringPage && (
        <StoryReader
          book={selectedBook}
          pages={storyPages}
          currentPageIndex={currentProfile?.reading_progress?.[selectedBook.id] || 0}
          onClose={() => {
            setSelectedBook(null);
            setStoryPages([]);
          }}
          onColorPage={handleColorPage}
          onPageChange={(pageIndex) => updateReadingProgress(selectedBook.id, pageIndex)}
          onBookComplete={() => markBookCompleted(selectedBook.id)}
          preferredLanguage={currentProfile?.narration_language || 'en'}
        />
      )}

      {/* Coloring Canvas Modal */}
      {coloringPage && (
        <ColoringCanvas
          pageId={coloringPage.id}
          bookId={coloringPage.book_id}
          profileId={currentProfile?.id}
          illustrationUrl={coloringPage.illustration_url}
          onSave={(data) => saveColoringSession.mutate(data)}
          onClose={() => setColoringPage(null)}
        />
      )}

      <div className="max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">
              Welcome back, {currentProfile.child_name}! 👋
            </h1>
            <p className="text-gray-600 mt-2 flex items-center gap-2">
              Ready to explore Brazilian culture through coloring?
              {isOnline ? (
                <span className="text-green-600 text-sm flex items-center gap-1">
                  <Wifi className="w-4 h-4" /> Online
                </span>
              ) : (
                <span className="text-orange-600 text-sm flex items-center gap-1">
                  <WifiOff className="w-4 h-4" /> Offline Mode
                </span>
              )}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              localStorage.removeItem('currentProfileId');
              setCurrentProfile(null);
            }}
          >
            Switch Profile
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="text-2xl font-bold text-green-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Books</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="text-2xl font-bold text-blue-600">{stats.unlocked}</div>
            <div className="text-sm text-gray-600">Unlocked</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="text-2xl font-bold text-purple-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="text-2xl font-bold text-orange-600">{downloadedCount}</div>
            <div className="text-sm text-gray-600">Downloaded</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="text-2xl font-bold text-yellow-600">
              {Math.round((currentProfile.pages_colored?.length || 0) / (stats.total * 12) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Progress</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-6 shadow-md mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Collection Filter */}
          <div className="flex gap-2">
            <Button
              variant={selectedCollection === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCollection('all')}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              All
            </Button>
            <Button
              variant={selectedCollection === 'amazon' ? 'default' : 'outline'}
              onClick={() => setSelectedCollection('amazon')}
            >
              🌿 Amazon
            </Button>
            <Button
              variant={selectedCollection === 'culture' ? 'default' : 'outline'}
              onClick={() => setSelectedCollection('culture')}
            >
              🎨 Culture
            </Button>
          </div>
        </div>

        {/* Additional Filters */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showLockedBooks}
              onChange={(e) => setShowLockedBooks(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-700">Show locked books</span>
          </label>
          <div className="text-sm text-gray-500">
            Showing {filteredBooks.length} of {books.length} books
          </div>
        </div>
      </div>

      {/* Books Grid */}
      {booksLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="text-gray-600 mt-4">Loading books...</p>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No books found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-24 md:pb-8">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              userProfile={currentProfile}
              onClick={() => handleBookClick(book)}
              onDownloadChange={loadDownloadedCount}
            />
          ))}
        </div>
      )}
      </div>
    </>
  );
}