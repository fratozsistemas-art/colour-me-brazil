import { base44 } from '@/api/base44Client';

/**
 * Calculate book recommendation score based on user profile
 */
export async function getRecommendations(profile, allBooks) {
  if (!profile || !allBooks || allBooks.length === 0) return [];

  const completedBookIds = profile.books_completed || [];
  const readingProgress = profile.reading_progress || {};
  const quizzesCorrect = profile.quizzes_correct || 0;
  const bookRatings = profile.book_ratings || {};
  const bookCompletionTimes = profile.book_completion_times || {};
  const dismissedRecommendations = profile.dismissed_recommendations || [];
  const favoriteCollections = profile.favorite_collections || [];
  const favoriteTags = profile.favorite_tags || [];
  const interestTopics = profile.interest_topics || [];

  // Get books not yet completed and not dismissed
  const availableBooks = allBooks.filter(book => 
    !completedBookIds.includes(book.id) && 
    !book.is_locked &&
    !dismissedRecommendations.includes(book.id)
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

      // 2. Explicit favorite collections
      if (favoriteCollections.includes(book.collection)) {
        score += 40;
        reasons.push('Your favorite genre');
      }

      // 3. Explicit favorite tags
      const matchingFavTags = book.cultural_tags?.filter(tag => 
        favoriteTags.includes(tag)
      ) || [];
      if (matchingFavTags.length > 0) {
        score += matchingFavTags.length * 15;
        reasons.push(`Favorite themes: ${matchingFavTags.join(', ')}`);
      }

      // 4. Interest topics alignment
      const matchingInterests = book.cultural_tags?.filter(tag =>
        interestTopics.some(interest => 
          tag.toLowerCase().includes(interest.toLowerCase()) ||
          interest.toLowerCase().includes(tag.toLowerCase())
        )
      ) || [];
      if (matchingInterests.length > 0) {
        score += matchingInterests.length * 12;
        reasons.push(`Matches interests: ${matchingInterests.join(', ')}`);
      }

      // 5. Genre/collection preference based on completed books
      if (completedBookIds.length > 0) {
        const completedBooks = allBooks.filter(b => completedBookIds.includes(b.id));
        const inferredCollection = getMostFrequentCollection(completedBooks);
        
        if (book.collection === inferredCollection && !favoriteCollections.includes(book.collection)) {
          score += 25;
          reasons.push('Similar to books you enjoyed');
        }
      }

      // 6. Cultural tags alignment from completed books
      if (completedBookIds.length > 0) {
        const completedBooks = allBooks.filter(b => completedBookIds.includes(b.id));
        const inferredTags = getMostFrequentTags(completedBooks);
        
        const matchingTags = book.cultural_tags?.filter(tag => 
          inferredTags.includes(tag) && !favoriteTags.includes(tag)
        ) || [];
        
        if (matchingTags.length > 0) {
          score += matchingTags.length * 8;
          reasons.push(`Related themes: ${matchingTags.join(', ')}`);
        }
      }

      // 7. Ratings-based recommendations (books similar to highly rated ones)
      if (Object.keys(bookRatings).length > 0) {
        const highlyRatedBooks = Object.entries(bookRatings)
          .filter(([_, rating]) => rating >= 4)
          .map(([bookId, _]) => allBooks.find(b => b.id === bookId))
          .filter(Boolean);
        
        for (const ratedBook of highlyRatedBooks) {
          if (ratedBook.collection === book.collection) {
            score += 20;
            reasons.push('Similar to your highly-rated books');
            break;
          }
        }
      }

      // 8. Reading time preference (recommend books with similar completion times)
      const avgCompletionTime = Object.values(bookCompletionTimes).reduce((sum, time) => sum + time, 0) / 
                                 Math.max(Object.values(bookCompletionTimes).length, 1);
      
      if (avgCompletionTime > 0) {
        // Estimate if book matches user's reading pace
        const estimatedTime = (book.page_count || 12) * 180; // ~3 min per page
        const timeDifference = Math.abs(estimatedTime - avgCompletionTime) / avgCompletionTime;
        
        if (timeDifference < 0.3) {
          score += 15;
          reasons.push('Matches your reading pace');
        }
      }

      // 9. Completion rate factor (prefer books user is likely to finish)
      const userCompletionRate = completedBookIds.length / Math.max(Object.keys(readingProgress).length, 1);
      if (userCompletionRate > 0.7) {
        // User tends to finish books - recommend longer/complex ones
        if ((book.page_count || 12) > 10) {
          score += 10;
          reasons.push('Engaging for dedicated readers');
        }
      }

      // 10. Quiz performance bonus (high quiz score = recommend harder/more content)
      const quizAccuracy = profile.quizzes_attempted > 0 ? 
        quizzesCorrect / profile.quizzes_attempted : 0;
      
      if (quizAccuracy >= 0.8) {
        score += 20;
        reasons.push('Advanced reader level');
      } else if (quizAccuracy >= 0.6) {
        score += 12;
        reasons.push('Intermediate reader level');
      }

      // 11. Book popularity (if many users completed it)
      const completionRate = await getBookCompletionRate(book.id);
      if (completionRate > 0.7) {
        score += 18;
        reasons.push('Popular with readers');
      } else if (completionRate > 0.4) {
        score += 10;
        reasons.push('Well-liked');
      }

      // 12. New user recommendations (if no completed books)
      if (completedBookIds.length === 0) {
        // Recommend Amazon collection for new users
        if (book.collection === 'amazon' && book.order_index <= 3) {
          score += 40;
          reasons.push('Great for beginners');
        }
      }

      // 13. Diversity bonus (recommend books from collections user hasn't tried much)
      if (completedBookIds.length >= 3) {
        const completedBooks = allBooks.filter(b => completedBookIds.includes(b.id));
        const collectionCounts = {};
        completedBooks.forEach(b => {
          collectionCounts[b.collection] = (collectionCounts[b.collection] || 0) + 1;
        });
        
        const leastExploredCollection = Object.keys(collectionCounts).length > 0 ?
          Object.keys(collectionCounts).reduce((a, b) => 
            collectionCounts[a] < collectionCounts[b] ? a : b
          ) : null;
        
        if (book.collection !== leastExploredCollection && 
            (collectionCounts[book.collection] || 0) === 0) {
          score += 12;
          reasons.push('Explore new genres');
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
 * Dismiss a recommendation
 */
export async function dismissRecommendation(profileId, bookId) {
  try {
    const profiles = await base44.entities.UserProfile.filter({ id: profileId });
    if (profiles.length === 0) return;
    
    const profile = profiles[0];
    const dismissedRecommendations = profile.dismissed_recommendations || [];
    
    if (!dismissedRecommendations.includes(bookId)) {
      await base44.entities.UserProfile.update(profileId, {
        dismissed_recommendations: [...dismissedRecommendations, bookId]
      });
    }
  } catch (error) {
    console.error('Error dismissing recommendation:', error);
  }
}

/**
 * Rate a book
 */
export async function rateBook(profileId, bookId, rating) {
  try {
    const profiles = await base44.entities.UserProfile.filter({ id: profileId });
    if (profiles.length === 0) return;
    
    const profile = profiles[0];
    const bookRatings = profile.book_ratings || {};
    
    await base44.entities.UserProfile.update(profileId, {
      book_ratings: { ...bookRatings, [bookId]: rating }
    });
  } catch (error) {
    console.error('Error rating book:', error);
  }
}

/**
 * Track book completion time
 */
export async function trackBookCompletionTime(profileId, bookId, timeSpent) {
  try {
    const profiles = await base44.entities.UserProfile.filter({ id: profileId });
    if (profiles.length === 0) return;
    
    const profile = profiles[0];
    const bookCompletionTimes = profile.book_completion_times || {};
    
    await base44.entities.UserProfile.update(profileId, {
      book_completion_times: { ...bookCompletionTimes, [bookId]: timeSpent }
    });
  } catch (error) {
    console.error('Error tracking completion time:', error);
  }
}

/**
 * Add to favorite collections
 */
export async function toggleFavoriteCollection(profileId, collection) {
  try {
    const profiles = await base44.entities.UserProfile.filter({ id: profileId });
    if (profiles.length === 0) return;
    
    const profile = profiles[0];
    const favoriteCollections = profile.favorite_collections || [];
    
    const updated = favoriteCollections.includes(collection)
      ? favoriteCollections.filter(c => c !== collection)
      : [...favoriteCollections, collection];
    
    await base44.entities.UserProfile.update(profileId, {
      favorite_collections: updated
    });
  } catch (error) {
    console.error('Error toggling favorite collection:', error);
  }
}

/**
 * Add to favorite tags
 */
export async function toggleFavoriteTag(profileId, tag) {
  try {
    const profiles = await base44.entities.UserProfile.filter({ id: profileId });
    if (profiles.length === 0) return;
    
    const profile = profiles[0];
    const favoriteTags = profile.favorite_tags || [];
    
    const updated = favoriteTags.includes(tag)
      ? favoriteTags.filter(t => t !== tag)
      : [...favoriteTags, tag];
    
    await base44.entities.UserProfile.update(profileId, {
      favorite_tags: updated
    });
  } catch (error) {
    console.error('Error toggling favorite tag:', error);
  }
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
  const bookRatings = profile.book_ratings || {};
  
  if (completedBookIds.length === 0) return null;

  // Prioritize highly rated books, then most recent
  const sortedCompleted = completedBookIds
    .map(id => ({ id, rating: bookRatings[id] || 0 }))
    .sort((a, b) => b.rating - a.rating);
  
  const referenceBookId = sortedCompleted[0].id;
  const lastBook = allBooks.find(b => b.id === referenceBookId);
  
  if (!lastBook) return null;

  // Find similar books (same collection and overlapping tags)
  const similarBooks = allBooks
    .filter(book => 
      book.id !== lastBook.id &&
      !completedBookIds.includes(book.id) &&
      !book.is_locked &&
      !(profile.dismissed_recommendations || []).includes(book.id) &&
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