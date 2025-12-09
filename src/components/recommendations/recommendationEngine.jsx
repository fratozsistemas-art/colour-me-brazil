import { base44 } from '@/api/base44Client';

/**
 * Calculate book recommendation score based on user profile
 */
export async function getRecommendations(profile, allBooks) {
  if (!profile || !allBooks || allBooks.length === 0) return [];

  const completedBookIds = profile.books_completed || [];
  const readingProgress = profile.reading_progress || {};
  const quizzesCorrect = profile.quizzes_correct || 0;
  const preferences = profile.preferred_language || 'en';

  // Get books not yet completed
  const availableBooks = allBooks.filter(book => 
    !completedBookIds.includes(book.id) && !book.is_locked
  );

  // Score each available book
  const scoredBooks = await Promise.all(
    availableBooks.map(async (book) => {
      let score = 0;
      const reasons = [];

      // 1. Check if book is in progress (highest priority)
      if (readingProgress[book.id] !== undefined) {
        score += 50;
        const progress = Math.round((readingProgress[book.id] / (book.page_count || 12)) * 100);
        reasons.push(`${progress}% completed`);
      }

      // 2. Genre/collection preference based on completed books
      if (completedBookIds.length > 0) {
        const completedBooks = allBooks.filter(b => completedBookIds.includes(b.id));
        const favoriteCollection = getMostFrequentCollection(completedBooks);
        
        if (book.collection === favoriteCollection) {
          score += 30;
          reasons.push('Matches your favorite genre');
        }
      }

      // 3. Cultural tags alignment
      if (completedBookIds.length > 0) {
        const completedBooks = allBooks.filter(b => completedBookIds.includes(b.id));
        const favoriteTags = getMostFrequentTags(completedBooks);
        
        const matchingTags = book.cultural_tags?.filter(tag => 
          favoriteTags.includes(tag)
        ) || [];
        
        if (matchingTags.length > 0) {
          score += matchingTags.length * 10;
          reasons.push(`Themes: ${matchingTags.join(', ')}`);
        }
      }

      // 4. Quiz performance bonus (high quiz score = recommend harder/more content)
      if (quizzesCorrect >= 10) {
        score += 15;
        reasons.push('Advanced reader level');
      } else if (quizzesCorrect >= 5) {
        score += 10;
        reasons.push('Intermediate reader level');
      }

      // 5. Book popularity (if many users completed it)
      const completionRate = await getBookCompletionRate(book.id);
      if (completionRate > 0.7) {
        score += 20;
        reasons.push('Popular with readers');
      } else if (completionRate > 0.4) {
        score += 10;
        reasons.push('Well-liked');
      }

      // 6. New user recommendations (if no completed books)
      if (completedBookIds.length === 0) {
        // Recommend Amazon collection for new users
        if (book.collection === 'amazon' && book.order_index <= 3) {
          score += 40;
          reasons.push('Great for beginners');
        }
      }

      return {
        ...book,
        recommendationScore: score,
        recommendationReasons: reasons
      };
    })
  );

  // Sort by score and return top recommendations
  return scoredBooks
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .filter(book => book.recommendationScore > 0)
    .slice(0, 6);
}

/**
 * Get personalized reading path (sequential book suggestions)
 */
export function getReadingPath(profile, allBooks, recommendations) {
  const completedBookIds = profile.books_completed || [];
  const completedCount = completedBookIds.length;

  // Beginner path (0-3 books)
  if (completedCount <= 3) {
    return {
      title_en: 'Start Your Journey',
      title_pt: 'Comece Sua Jornada',
      description_en: 'Perfect books to start your Brazilian culture adventure',
      description_pt: 'Livros perfeitos para começar sua aventura cultural brasileira',
      books: recommendations.slice(0, 3)
    };
  }

  // Intermediate path (4-8 books)
  if (completedCount <= 8) {
    return {
      title_en: 'Continue Exploring',
      title_pt: 'Continue Explorando',
      description_en: 'Dive deeper into Brazilian folklore and culture',
      description_pt: 'Mergulhe mais fundo no folclore e cultura brasileira',
      books: recommendations.slice(0, 4)
    };
  }

  // Advanced path (9+ books)
  return {
    title_en: 'Master Collection',
    title_pt: 'Coleção Mestre',
    description_en: 'Complete your cultural mastery',
    description_pt: 'Complete seu domínio cultural',
    books: recommendations.slice(0, 4)
  };
}

/**
 * Get "Because You Read..." recommendations
 */
export function getBecauseYouRead(profile, allBooks) {
  const completedBookIds = profile.books_completed || [];
  
  if (completedBookIds.length === 0) return null;

  // Get most recently completed book
  const lastCompletedId = completedBookIds[completedBookIds.length - 1];
  const lastBook = allBooks.find(b => b.id === lastCompletedId);
  
  if (!lastBook) return null;

  // Find similar books (same collection and overlapping tags)
  const similarBooks = allBooks
    .filter(book => 
      book.id !== lastBook.id &&
      !completedBookIds.includes(book.id) &&
      !book.is_locked &&
      (book.collection === lastBook.collection ||
       book.cultural_tags?.some(tag => lastBook.cultural_tags?.includes(tag)))
    )
    .slice(0, 3);

  return {
    referenceBook: lastBook,
    recommendations: similarBooks
  };
}

/**
 * Helper: Get most frequent collection from books
 */
function getMostFrequentCollection(books) {
  const counts = {};
  books.forEach(book => {
    counts[book.collection] = (counts[book.collection] || 0) + 1;
  });
  
  return Object.keys(counts).reduce((a, b) => 
    counts[a] > counts[b] ? a : b, 'amazon'
  );
}

/**
 * Helper: Get most frequent tags from books
 */
function getMostFrequentTags(books) {
  const tagCounts = {};
  
  books.forEach(book => {
    book.cultural_tags?.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  return Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tag]) => tag);
}

/**
 * Helper: Get book completion rate across all users
 */
async function getBookCompletionRate(bookId) {
  try {
    const allProfiles = await base44.entities.UserProfile.list();
    const totalProfiles = allProfiles.length;
    
    if (totalProfiles === 0) return 0;
    
    const completions = allProfiles.filter(p => 
      p.books_completed?.includes(bookId)
    ).length;
    
    return completions / totalProfiles;
  } catch (error) {
    console.error('Error calculating completion rate:', error);
    return 0;
  }
}