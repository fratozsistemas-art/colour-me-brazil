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
  }
];

export async function checkAndAwardAchievements(profileId) {
  try {
    // Get profile
    const profiles = await base44.entities.UserProfile.list();
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;

    // Get existing achievements
    const existingAchievements = await base44.entities.Achievement.filter({ profile_id: profileId });
    const unlockedIds = existingAchievements.map(a => a.achievement_id);

    // Calculate stats
    const coloringSessions = await base44.entities.ColoringSession.filter({ profile_id: profileId });
    const completedSessions = coloringSessions.filter(s => s.is_completed);
    
    const stats = {
      pagesColored: completedSessions.length,
      booksCompleted: profile.books_completed?.length || 0,
      booksViewed: profile.books_viewed?.length || 0,
      totalTime: profile.total_coloring_time || 0,
      fastestPageTime: Math.min(...coloringSessions.map(s => s.coloring_time).filter(t => t > 0)) || 0
    };

    // Check each achievement
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
      }
    }

    // Award new achievements
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