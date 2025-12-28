import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Download, Lock, Wifi, WifiOff, Sparkles } from 'lucide-react';
import BookCard from '../components/library/BookCard';
import ProfileSelector from '../components/profile/ProfileSelector';
import StoryReader from '../components/story/StoryReader';
import ColoringCanvas from '../components/coloring/ColoringCanvas';
import PurchaseModal from '../components/shop/PurchaseModal';
import { checkAndAwardAchievements, awardPoints } from '../components/achievementManager';
import StreakWidget from '../components/gamification/StreakWidget';
import DailyChallengeCard from '../components/gamification/DailyChallengeCard';
import DailyQuestCard from '../components/gamification/DailyQuestCard';
import LevelProgressBar from '../components/gamification/LevelProgressBar';
import { updateStreak, checkStreakAchievements } from '../components/gamification/streakManager';
import { resetDailyChallenge } from '../components/gamification/dailyChallengeManager';
import { resetDailyQuest } from '../components/gamification/DailyQuestManager';
import { setupOfflineSync, syncOfflineData, getAllDownloadedBooks } from '../components/offlineManager';
import ForYouSection from '../components/recommendations/ForYouSection';
import { getRecommendations, getReadingPath, getBecauseYouRead } from '../components/recommendations/recommendationEngine';

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
  const [recommendations, setRecommendations] = useState([]);
  const [readingPath, setReadingPath] = useState(null);
  const [becauseYouRead, setBecauseYouRead] = useState(null);
  const [showForYou, setShowForYou] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [purchaseBook, setPurchaseBook] = useState(null);
  
  const queryClient = useQueryClient();

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          // Redirect to home or show login prompt
          window.location.href = '/';
          return;
        }
      } catch (error) {
        console.error('Auth error:', error);
        window.location.href = '/';
        return;
      }
      setIsCheckingAuth(false);
    };
    checkAuth();
  }, []);

  // Fetch user profiles with error handling - only profiles linked to current user's account
  const { data: profiles = [], error: profilesError } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser) return [];

        // Get the current user's parent account
        const parentAccounts = await base44.entities.ParentAccount.filter({ 
          parent_user_id: currentUser.id 
        });
        
        if (parentAccounts.length === 0) return [];

        const parentAccount = parentAccounts[0];
        
        // Filter UserProfiles by parent_account_id
        return await base44.entities.UserProfile.filter({ 
          parent_account_id: parentAccount.id 
        });
      } catch (error) {
        console.error('Failed to load profiles:', error);
        return [];
      }
    },
  });

  // Fetch books with error handling
  const { data: books = [], isLoading: booksLoading, error: booksError } = useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      try {
        return await base44.entities.Book.list('order_index');
      } catch (error) {
        console.error('Failed to load books:', error);
        return [];
      }
    },
  });

  // Load saved profile from localStorage and generate recommendations
  useEffect(() => {
    const savedProfileId = localStorage.getItem('currentProfileId');
    if (savedProfileId && profiles.length > 0) {
      const profile = profiles.find(p => p.id === savedProfileId);
      if (profile) {
        setCurrentProfile(profile);
        // Update streak and reset daily challenge/quest on load
        updateStreak(profile.id);
        resetDailyChallenge(profile.id);
        resetDailyQuest(profile.id);
        
        // Generate recommendations when profile and books are loaded
        if (books.length > 0) {
          loadRecommendations(profile);
        }
      }
    }
  }, [profiles, books]);

  const loadRecommendations = async (profile) => {
    try {
      const recs = await getRecommendations(profile, books);
      setRecommendations(recs);
      
      const path = getReadingPath(profile, books, recs);
      setReadingPath(path);
      
      const because = getBecauseYouRead(profile, books);
      setBecauseYouRead(because);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  // Setup offline sync and online/offline detection
  useEffect(() => {
    setupOfflineSync();
    
    const handleOnline = async () => {
      setIsOnline(true);
      const result = await syncOfflineData();
      if (result.success && (result.results.coloringSessions > 0 || result.results.readingProgress > 0)) {
        queryClient.invalidateQueries(['profiles']);
        queryClient.invalidateQueries(['coloringSessions']);
        // Show success notification
        console.log('Synced offline data:', result.message);
      }
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
      // New profile created - get or create parent account first
      const user = await base44.auth.me();
      let parentAccount = await base44.entities.ParentAccount.filter({ 
        parent_email: user.email 
      });
      
      if (parentAccount.length === 0) {
        // Create parent account if it doesn't exist
        parentAccount = [await base44.entities.ParentAccount.create({
          parent_user_id: user.id,
          parent_email: user.email,
          parent_name: user.full_name || user.email,
          child_profiles: [],
          content_approval_required: false,
          screen_time_limit: 0,
          allowed_features: ['reading', 'coloring', 'quizzes', 'showcase', 'forum']
        })];
      }
      
      // Create profile with parent_account_id
      const newProfile = await base44.entities.UserProfile.create({
        ...profileData,
        parent_account_id: parentAccount[0].id
      });
      
      // Update parent account to include this profile
      await base44.entities.ParentAccount.update(parentAccount[0].id, {
        child_profiles: [...(parentAccount[0].child_profiles || []), newProfile.id]
      });
      
      setCurrentProfile(newProfile);
      localStorage.setItem('currentProfileId', newProfile.id);
    }
  };

  const handleBookClick = async (book) => {
    if (book.is_locked) {
      // Show purchase modal
      setPurchaseBook(book);
    } else {
      // Load pages for this book
      const pages = await base44.entities.Page.filter({ book_id: book.id });
      setStoryPages(pages.sort((a, b) => a.page_number - b.page_number));
      
      // Attach profileId to book for quiz tracking
      setSelectedBook({ ...book, profileId: currentProfile.id });
      
      // Update current book ID and streak
      await base44.entities.UserProfile.update(currentProfile.id, {
        current_book_id: book.id
      });
      const streakResult = await updateStreak(currentProfile.id);
      if (streakResult) {
        await checkStreakAchievements(currentProfile.id, streakResult.current_streak);
      }

      // Log book started activity with metadata
      await base44.entities.UserActivityLog.create({
        profile_id: currentProfile.id,
        activity_type: 'book_started',
        book_id: book.id,
        points_earned: 0,
        metadata: { collection: book.collection }
      });

      // Reload recommendations after book interaction
      queryClient.invalidateQueries(['profiles']);
    }
  };

  const updateReadingProgress = async (bookId, pageIndex) => {
    if (!currentProfile) return;
    
    // Check if online
    if (!navigator.onLine) {
      const { saveReadingProgressOffline } = await import('../components/offlineManager');
      await saveReadingProgressOffline(currentProfile.id, bookId, pageIndex);
      
      // Update local state
      setCurrentProfile(prev => ({
        ...prev,
        reading_progress: {
          ...(prev.reading_progress || {}),
          [bookId]: pageIndex
        }
      }));
      return;
    }

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

      // Log book completed activity
      await base44.entities.UserActivityLog.create({
        profile_id: currentProfile.id,
        activity_type: 'book_completed',
        book_id: bookId,
        points_earned: 50
      });

      queryClient.invalidateQueries(['profiles']);
    }
  };

  const handleColorPage = (page) => {
    setColoringPage(page);
  };

  const saveColoringSession = useMutation({
    mutationFn: async (sessionData) => {
      if (!sessionData || typeof sessionData !== 'object') {
        throw new Error('Coloring session data is missing.');
      }

      if (!coloringPage?.id || !currentProfile?.id) {
        throw new Error('Missing coloring context for save.');
      }

      const {
        canvas = null,
        is_completed = false,
        coloring_time = 0,
        ...restData
      } = sessionData;
      
      // Check if online
      if (!navigator.onLine) {
        // Save offline
        const { saveColoringSessionOffline } = await import('../components/offlineManager');
        await saveColoringSessionOffline(currentProfile.id, coloringPage.id, {
          book_id: coloringPage.book_id,
          ...restData,
          coloring_time,
          is_completed
        });
        return { offline: true };
      }

      // If completed, save as ColoredArtwork
      if (is_completed && canvas) {
        try {
          // Convert canvas to blob
          if (typeof canvas.toBlob !== 'function') {
            throw new Error('Invalid canvas element.');
          }

          const blob = await new Promise((resolve, reject) => {
            canvas.toBlob((result) => {
              if (result) {
                resolve(result);
              } else {
                reject(new Error('Canvas conversion failed.'));
              }
            }, 'image/png', 1.0);
          });
          
          // Upload the artwork
          const uploadResult = await base44.integrations.Core.UploadFile({
            file: blob
          });
          
          // Create ColoredArtwork entity
          await base44.entities.ColoredArtwork.create({
            profile_id: currentProfile.id,
            book_id: coloringPage.book_id,
            page_id: coloringPage.id,
            artwork_url: uploadResult.file_url,
            coloring_time_seconds: coloring_time,
            is_showcased: false
          });
        } catch (error) {
          console.error('Error saving artwork:', error);
        }
      }
      
      const existing = await base44.entities.ColoringSession.filter({
        profile_id: currentProfile.id,
        page_id: coloringPage.id
      });

      if (existing.length > 0) {
        // Update existing session
        return base44.entities.ColoringSession.update(existing[0].id, {
          ...restData,
          coloring_time,
          is_completed,
          last_modified: new Date().toISOString()
        });
      } else {
        // Create new session
        return base44.entities.ColoringSession.create({
          profile_id: currentProfile.id,
          page_id: coloringPage.id,
          book_id: coloringPage.book_id,
          ...restData,
          coloring_time,
          is_completed,
          last_modified: new Date().toISOString()
        });
      }
    },
    onSuccess: async (result, sessionData) => {
      if (!sessionData || typeof sessionData !== 'object') {
        setColoringPage(null);
        return;
      }

      if (result?.offline) {
        setColoringPage(null);
        return;
      }

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

      // Log coloring activity
      if (sessionData.is_completed) {
        await base44.entities.UserActivityLog.create({
          profile_id: currentProfile.id,
          activity_type: 'page_colored',
          book_id: coloringPage.book_id,
          page_id: coloringPage.id,
          points_earned: 10
        });
      }
      
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

  // Check for purchase success/cancel in URL (must be before conditional returns)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const purchaseStatus = urlParams.get('purchase');
    const bookId = urlParams.get('book_id');

    if (purchaseStatus === 'success' && bookId) {
      // Refresh books to reflect purchase
      queryClient.invalidateQueries(['books']);
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (purchaseStatus === 'cancelled') {
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Handle database errors gracefully
  if (booksError || profilesError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-gray-600">Unable to load library from database.</p>
        <p className="text-sm text-gray-500">Try the <a href="/ManifestLibrary" className="text-blue-600 underline">Manifest Library</a> instead.</p>
      </div>
    );
  }

  // If no profile selected, show profile selector
  if (!currentProfile) {
    return <ProfileSelector onProfileCreated={handleProfileCreated} existingProfiles={profiles} />;
  }

  return (
    <>
      {/* Purchase Modal */}
      {purchaseBook && (
        <PurchaseModal
          book={purchaseBook}
          onClose={() => setPurchaseBook(null)}
          onPurchaseComplete={() => {
            setPurchaseBook(null);
            queryClient.invalidateQueries(['books']);
          }}
        />
      )}

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
          bookData={selectedBook}
          onSave={(data) => {
            if (!data) {
              return;
            }
            saveColoringSession.mutate(data);
          }}
          onClose={() => setColoringPage(null)}
        />
      )}

      <div className="max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        {/* Level Progress */}
        <div className="mb-6">
          <LevelProgressBar profile={currentProfile} />
        </div>

        {/* Streak, Daily Challenge, and Daily Quest */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <StreakWidget 
            currentStreak={currentProfile.current_streak || 0} 
            longestStreak={currentProfile.longest_streak || 0}
          />
          <DailyChallengeCard 
            profile={currentProfile}
            onChallengeComplete={async () => {
              await checkAndAwardAchievements(currentProfile.id);
              queryClient.invalidateQueries(['profiles']);
            }}
          />
          <DailyQuestCard 
            profile={currentProfile}
          />
        </div>

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
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4" style={{ borderColor: '#06A77D' }}>
            <div className="text-2xl font-bold" style={{ color: '#06A77D' }}>{stats.total}</div>
            <div className="text-sm" style={{ color: '#6C757D' }}>Total Books</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4" style={{ borderColor: '#2E86AB' }}>
            <div className="text-2xl font-bold" style={{ color: '#2E86AB' }}>{stats.unlocked}</div>
            <div className="text-sm" style={{ color: '#6C757D' }}>Unlocked</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4" style={{ borderColor: '#FF6B35' }}>
            <div className="text-2xl font-bold" style={{ color: '#FF6B35' }}>{stats.completed}</div>
            <div className="text-sm" style={{ color: '#6C757D' }}>Completed</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4" style={{ borderColor: '#FF8C42' }}>
            <div className="text-2xl font-bold" style={{ color: '#FF8C42' }}>{downloadedCount}</div>
            <div className="text-sm" style={{ color: '#6C757D' }}>Downloaded</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4" style={{ borderColor: '#FFD23F' }}>
            <div className="text-2xl font-bold" style={{ color: '#FFD23F' }}>
              {Math.round((currentProfile.pages_colored?.length || 0) / (stats.total * 12) * 100)}%
            </div>
            <div className="text-sm" style={{ color: '#6C757D' }}>Progress</div>
          </div>
        </div>
      </div>

      {/* For You Section */}
      {showForYou && recommendations.length > 0 && (
        <div className="mb-8">
          <ForYouSection
            recommendations={recommendations}
            readingPath={readingPath}
            becauseYouRead={becauseYouRead}
            userProfile={currentProfile}
            onBookClick={handleBookClick}
            language={currentProfile.preferred_language || 'en'}
          />

          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={() => setShowForYou(false)}
              className="text-gray-600"
            >
              {currentProfile.preferred_language === 'en' ? 'Browse All Books' : 'Ver Todos os Livros'}
            </Button>
          </div>
          <div className="border-t mt-8 mb-8"></div>
        </div>
      )}

      {/* Toggle Button */}
      {!showForYou && recommendations.length > 0 && (
        <div className="mb-6">
          <Button
            onClick={() => setShowForYou(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {currentProfile.preferred_language === 'en' ? 'Show Recommendations' : 'Mostrar Recomendações'}
          </Button>
        </div>
      )}

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
              style={selectedCollection === 'all' ? { 
                background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
                color: '#FFFFFF',
                border: 'none'
              } : {}}
            >
              <Filter className="w-4 h-4" />
              All
            </Button>
            <Button
              variant={selectedCollection === 'amazon' ? 'default' : 'outline'}
              onClick={() => setSelectedCollection('amazon')}
              style={selectedCollection === 'amazon' ? { 
                background: 'linear-gradient(135deg, #06A77D 0%, #2E86AB 100%)',
                color: '#FFFFFF',
                border: 'none'
              } : {}}
            >
              🌿 Amazon
            </Button>
            <Button
              variant={selectedCollection === 'culture' ? 'default' : 'outline'}
              onClick={() => setSelectedCollection('culture')}
              style={selectedCollection === 'culture' ? { 
                background: 'linear-gradient(135deg, #2E86AB 0%, #FF6B35 100%)',
                color: '#FFFFFF',
                border: 'none'
              } : {}}
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
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#FF6B35' }}></div>
          <p style={{ color: '#6C757D' }} className="mt-4">Loading books...</p>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No books found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-24 md:pb-8 auto-rows-fr">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              userProfile={currentProfile}
              onClick={() => handleBookClick(book)}
              onDownloadChange={loadDownloadedCount}
              onPurchaseClick={setPurchaseBook}
              showProgress={true}
            />
          ))}
        </div>
      )}
      </div>
    </>
  );
}
