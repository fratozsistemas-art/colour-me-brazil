import { base44 } from '@/api/base44Client';

const ACHIEVEMENT_DEFINITIONS = [
  {
    id: 'first_stroke',
    name_en: 'First Stroke',
    name_pt: 'Primeira Pincelada',
    description_en: 'Colored your first page',
    description_pt: 'Coloriu sua primeira página',
    icon: '🎨',
    checkCondition: (profile, stats) => stats.pagesColored > 0
  },
  {
    id: 'first_book',
    name_en: 'First Book',
    name_pt: 'Primeiro Livro',
    description_en: 'Completed your first story',
    description_pt: 'Completou sua primeira história',
    icon: '📖',
    checkCondition: (profile, stats) => stats.booksCompleted > 0
  },
  {
    id: 'explorer',
    name_en: 'Explorer',
    name_pt: 'Explorador',
    description_en: 'Viewed all books',
    description_pt: 'Visualizou todos os livros',
    icon: '🌍',
    checkCondition: (profile, stats) => stats.booksViewed >= 12
  },
  {
    id: 'dedicated',
    name_en: 'Dedicated Artist',
    name_pt: 'Artista Dedicado',
    description_en: 'Colored 25 pages',
    description_pt: 'Coloriu 25 páginas',
    icon: '🌟',
    checkCondition: (profile, stats) => stats.pagesColored >= 25
  },
  {
    id: 'culture_master',
    name_en: 'Culture Master',
    name_pt: 'Mestre da Cultura',
    description_en: 'Completed all 12 books',
    description_pt: 'Completou todos os 12 livros',
    icon: '🏆',
    checkCondition: (profile, stats) => stats.booksCompleted >= 12
  },
  {
    id: 'bilingual',
    name_en: 'Bilingual Pro',
    name_pt: 'Bilíngue Profissional',
    description_en: 'Switched languages 10 times',
    description_pt: 'Mudou de idioma 10 vezes',
    icon: '🗣️',
    checkCondition: (profile, stats) => (profile.language_switches || 0) >= 10
  },
  {
    id: 'speed_artist',
    name_en: 'Speed Artist',
    name_pt: 'Artista Veloz',
    description_en: 'Completed a page in under 5 minutes',
    description_pt: 'Completou uma página em menos de 5 minutos',
    icon: '⚡',
    checkCondition: (profile, stats) => stats.fastestPageTime > 0 && stats.fastestPageTime < 300
  },
  {
    id: 'marathon',
    name_en: 'Marathon Session',
    name_pt: 'Sessão Maratona',
    description_en: 'Colored for 30+ minutes in one session',
    description_pt: 'Coloriu por mais de 30 minutos em uma sessão',
    icon: '⏱️',
    checkCondition: (profile, stats) => (profile.longest_session || 0) >= 1800
  },
  {
    id: 'quiz_master',
    name_en: 'Quiz Master',
    name_pt: 'Mestre dos Questionários',
    description_en: 'Answer 10 quizzes correctly',
    description_pt: 'Responda 10 questionários corretamente',
    icon: '🧠',
    checkCondition: (profile, stats) => stats.quizzesCorrect >= 10
  },
  {
    id: 'perfect_score',
    name_en: 'Perfect Score',
    name_pt: 'Pontuação Perfeita',
    description_en: 'Answer 5 quizzes in a row correctly',
    description_pt: 'Responda 5 questionários seguidos corretamente',
    icon: '💯',
    checkCondition: (profile, stats) => (profile.consecutive_quizzes_correct || 0) >= 5
  },
  {
    id: 'daily_champion',
    name_en: 'Daily Champion',
    name_pt: 'Campeão Diário',
    description_en: 'Complete 7 daily challenges',
    description_pt: 'Complete 7 desafios diários',
    icon: '⭐',
    checkCondition: (profile, stats) => (profile.daily_challenges_completed || 0) >= 7
  },
  {
    id: 'speed_reader',
    name_en: 'Speed Reader',
    name_pt: 'Leitor Veloz',
    description_en: 'Read 5 books in a week',
    description_pt: 'Leia 5 livros em uma semana',
    icon: '⚡',
    checkCondition: (profile, stats) => stats.booksCompletedThisWeek >= 5
  },
  {
    id: 'coloring_streak',
    name_en: 'Coloring Streak',
    name_pt: 'Sequência de Colorir',
    description_en: 'Color 10 pages consecutively',
    description_pt: 'Colorir 10 páginas consecutivamente',
    icon: '🎨',
    checkCondition: (profile, stats) => (profile.consecutive_pages_colored || 0) >= 10
  },
  {
    id: 'weekend_warrior',
    name_en: 'Weekend Warrior',
    name_pt: 'Guerreiro de Fim de Semana',
    description_en: 'Complete 3 books on a weekend',
    description_pt: 'Complete 3 livros em um fim de semana',
    icon: '🛡️',
    checkCondition: (profile, stats) => (profile.weekend_books_completed || 0) >= 3
  },
  {
    id: 'early_bird',
    name_en: 'Early Bird',
    name_pt: 'Madrugador',
    description_en: 'Read before 8 AM on 5 different days',
    description_pt: 'Leia antes das 8h em 5 dias diferentes',
    icon: '🌅',
    checkCondition: (profile, stats) => (profile.early_morning_sessions || 0) >= 5
  },
  {
    id: 'night_owl',
    name_en: 'Night Owl',
    name_pt: 'Coruja Noturna',
    description_en: 'Read after 9 PM on 5 different days',
    description_pt: 'Leia depois das 21h em 5 dias diferentes',
    icon: '🦉',
    checkCondition: (profile, stats) => (profile.night_sessions || 0) >= 5
  },
  {
    id: 'perfectionist',
    name_en: 'Perfectionist',
    name_pt: 'Perfeccionista',
    description_en: 'Spend over 20 minutes on a single page',
    description_pt: 'Passe mais de 20 minutos em uma única página',
    icon: '🎯',
    checkCondition: (profile, stats) => (profile.longest_page_time || 0) >= 1200
  },
  {
    id: 'socialite',
    name_en: 'Socialite',
    name_pt: 'Socialite',
    description_en: 'Give 50 likes in the showcase',
    description_pt: 'Dê 50 curtidas na vitrine',
    icon: '❤️',
    checkCondition: (profile, stats) => (profile.total_likes_given || 0) >= 50
  }
];

const POINTS_CONFIG = {
  first_stroke: 50,
  first_book: 100,
  explorer: 200,
  dedicated: 300,
  culture_master: 500,
  bilingual: 150,
  speed_artist: 100,
  marathon: 250,
  quiz_master: 150,
  perfect_score: 200,
  daily_champion: 300,
  speed_reader: 400,
  coloring_streak: 250,
  weekend_warrior: 300,
  early_bird: 150,
  night_owl: 150,
  perfectionist: 200,
  socialite: 250,
  page_colored: 10,
  book_completed: 50,
  quiz_correct: 10,
  daily_challenge_completed: 20,
  daily_quest_completed: 30,
  content_submitted: 25,
  like_given: 2,
  comment_given: 5,
  forum_topic_created: 15,
  forum_reply_posted: 5,
  showcase_item_posted: 20
};

    export function calculateLevel(points) {
    return Math.floor(points / 500) + 1;
    }

    export function getPointsForNextLevel(currentLevel) {
    return currentLevel * 500;
    }

    export async function awardPoints(profileId, pointType, amount) {
    try {
      const profiles = await base44.entities.UserProfile.list();
      const profile = profiles.find(p => p.id === profileId);
      if (!profile) return;

      const newPoints = (profile.total_points || 0) + (amount || POINTS_CONFIG[pointType] || 0);
      const newLevel = calculateLevel(newPoints);

      await base44.entities.UserProfile.update(profileId, {
        total_points: newPoints,
        level: newLevel
      });

      return { points: newPoints, level: newLevel };
    } catch (error) {
      console.error('Error awarding points:', error);
    }
    }

export async function checkAndAwardAchievements(profileId) {
  try {
    const profiles = await base44.entities.UserProfile.list();
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;

    const existingAchievements = await base44.entities.Achievement.filter({ profile_id: profileId });
    const unlockedIds = existingAchievements.map(a => a.achievement_id);

    const coloringSessions = await base44.entities.ColoringSession.filter({ profile_id: profileId });
    const completedSessions = coloringSessions.filter(s => s.is_completed);
    
    const coloringTimes = coloringSessions.map(s => s.coloring_time || 0).filter(t => t > 0);
    const fastestTime = coloringTimes.length > 0 ? Math.min(...coloringTimes) : 0;
    
    // Calculate books completed this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const activityLogs = await base44.entities.UserActivityLog.filter({ profile_id: profileId });
    const booksCompletedThisWeek = activityLogs.filter(
      log => log.activity_type === 'book_completed' && new Date(log.created_date) >= oneWeekAgo
    ).length;
    
    const stats = {
      pagesColored: completedSessions.length,
      booksCompleted: profile.books_completed?.length || 0,
      booksViewed: profile.books_viewed?.length || 0,
      totalTime: profile.total_coloring_time || 0,
      fastestPageTime: fastestTime,
      quizzesCorrect: profile.quizzes_correct || 0,
      booksCompletedThisWeek
    };

    const newAchievements = [];
    for (const achievement of ACHIEVEMENT_DEFINITIONS) {
      if (!unlockedIds.includes(achievement.id) && achievement.checkCondition(profile, stats)) {
        newAchievements.push({
          achievement_id: achievement.id,
          profile_id: profileId,
          name_en: achievement.name_en,
          name_pt: achievement.name_pt,
          description_en: achievement.description_en,
          description_pt: achievement.description_pt,
          icon: achievement.icon,
          unlocked_at: new Date().toISOString()
        });
        
        // Award points for achievement
        await awardPoints(profileId, achievement.id);
      }
    }

    if (newAchievements.length > 0) {
      await base44.entities.Achievement.bulkCreate(newAchievements);
      return newAchievements;
    }

    return [];
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
}

export function getAchievementDefinitions() {
  return ACHIEVEMENT_DEFINITIONS;
}

export async function getProfileAchievements(profileId) {
  try {
    const achievements = await base44.entities.Achievement.filter({ profile_id: profileId });
    const unlockedIds = achievements.map(a => a.achievement_id);
    
    return ACHIEVEMENT_DEFINITIONS.map(def => ({
      ...def,
      unlocked: unlockedIds.includes(def.id),
      unlockedAt: achievements.find(a => a.achievement_id === def.id)?.unlocked_at
    }));
  } catch (error) {
    console.error('Error getting achievements:', error);
    return [];
  }
}