import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

/**
 * Generate or get today's daily challenge
 */
export async function getTodayChallenge() {
  const today = format(new Date(), 'yyyy-MM-dd');
  
  try {
    const existing = await base44.entities.DailyChallenge.filter({ date: today });
    
    if (existing.length > 0) {
      return existing[0];
    }

    // Generate a new challenge for today
    const challenge = generateRandomChallenge(today);
    const created = await base44.entities.DailyChallenge.create(challenge);
    return created;
  } catch (error) {
    console.error('Error getting daily challenge:', error);
    return null;
  }
}

/**
 * Check if user has completed today's challenge
 */
export async function checkChallengeProgress(profileId, challengeType, currentValue) {
  try {
    const challenge = await getTodayChallenge();
    if (!challenge) return { completed: false, progress: 0 };

    const profile = await base44.entities.UserProfile.filter({ id: profileId });
    if (profile.length === 0) return { completed: false, progress: 0 };

    const userProfile = profile[0];
    const today = format(new Date(), 'yyyy-MM-dd');

    // Check if already completed today
    if (userProfile.daily_challenge_completed && userProfile.daily_challenge_date === today) {
      return { completed: true, progress: 100 };
    }

    // Check if challenge matches and is completed
    if (challenge.challenge_type === challengeType && currentValue >= challenge.target_value) {
      // Mark as completed
      await base44.entities.UserProfile.update(profileId, {
        daily_challenge_completed: true,
        daily_challenge_date: today,
        total_points: (userProfile.total_points || 0) + challenge.points_reward
      });

      return { completed: true, progress: 100 };
    }

    const progress = Math.min((currentValue / challenge.target_value) * 100, 100);
    return { completed: false, progress };
  } catch (error) {
    console.error('Error checking challenge progress:', error);
    return { completed: false, progress: 0 };
  }
}

/**
 * Reset daily challenge status (call this when a new day starts)
 */
export async function resetDailyChallenge(profileId) {
  const today = format(new Date(), 'yyyy-MM-dd');
  
  try {
    const profile = await base44.entities.UserProfile.filter({ id: profileId });
    if (profile.length === 0) return;

    const userProfile = profile[0];
    
    // Only reset if it's a new day
    if (userProfile.daily_challenge_date !== today) {
      await base44.entities.UserProfile.update(profileId, {
        daily_challenge_completed: false,
        daily_challenge_date: today
      });
    }
  } catch (error) {
    console.error('Error resetting daily challenge:', error);
  }
}

function generateRandomChallenge(date) {
  const challenges = [
    {
      challenge_type: 'read_pages',
      target_value: 5,
      title_en: 'Read 5 Pages',
      title_pt: 'Leia 5 Páginas',
      description_en: 'Read at least 5 story pages today',
      description_pt: 'Leia pelo menos 5 páginas de histórias hoje',
      icon: '📖',
      points_reward: 50
    },
    {
      challenge_type: 'color_pages',
      target_value: 2,
      title_en: 'Color 2 Pages',
      title_pt: 'Colorir 2 Páginas',
      description_en: 'Color at least 2 pages today',
      description_pt: 'Colorir pelo menos 2 páginas hoje',
      icon: '🎨',
      points_reward: 75
    },
    {
      challenge_type: 'answer_quizzes',
      target_value: 3,
      title_en: 'Answer 3 Quizzes',
      title_pt: 'Responda 3 Questionários',
      description_en: 'Answer 3 quizzes correctly',
      description_pt: 'Responda 3 questionários corretamente',
      icon: '🧠',
      points_reward: 60
    },
    {
      challenge_type: 'read_book',
      target_value: 1,
      title_en: 'Complete a Book',
      title_pt: 'Complete um Livro',
      description_en: 'Finish reading one complete book',
      description_pt: 'Termine de ler um livro completo',
      icon: '📚',
      points_reward: 100
    },
    {
      challenge_type: 'spend_time_coloring',
      target_value: 600,
      title_en: 'Color for 10 Minutes',
      title_pt: 'Colorir por 10 Minutos',
      description_en: 'Spend at least 10 minutes coloring',
      description_pt: 'Passe pelo menos 10 minutos colorindo',
      icon: '⏱️',
      points_reward: 40
    }
  ];

  const randomIndex = Math.floor(Math.random() * challenges.length);
  return {
    date,
    ...challenges[randomIndex]
  };
}