import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const ACHIEVEMENTS = [
  { id: 'first_book', name: 'Primeira Leitura', check: (p) => p.books_completed?.length >= 1 },
  { id: 'bookworm', name: 'Amante de Livros', check: (p) => p.books_completed?.length >= 10 },
  { id: 'library_master', name: 'Mestre da Biblioteca', check: (p) => p.books_completed?.length >= 50 },
  { id: 'first_color', name: 'Primeiro Artista', check: (p) => p.pages_colored?.length >= 1 },
  { id: 'colorful', name: 'Colorido', check: (p) => p.pages_colored?.length >= 25 },
  { id: 'artist', name: 'Grande Artista', check: (p) => p.pages_colored?.length >= 100 },
  { id: 'streak_7', name: 'Sequência de Uma Semana', check: (p) => p.current_streak >= 7 },
  { id: 'streak_30', name: 'Sequência de Um Mês', check: (p) => p.current_streak >= 30 },
  { id: 'streak_100', name: 'Centenário', check: (p) => p.longest_streak >= 100 },
  { id: 'quiz_master', name: 'Mestre dos Quizzes', check: (p, stats) => stats.quiz_accuracy >= 90 && stats.quizzes_total >= 20 },
  { id: 'early_bird', name: 'Madrugador', check: (p) => p.early_morning_sessions >= 10 },
  { id: 'night_owl', name: 'Coruja Noturna', check: (p) => p.night_sessions >= 10 },
  { id: 'social_butterfly', name: 'Borboleta Social', check: (p) => p.total_likes_given >= 50 },
  { id: 'level_10', name: 'Nível 10', check: (p) => p.level >= 10 },
  { id: 'level_25', name: 'Nível 25', check: (p) => p.level >= 25 },
  { id: 'points_1000', name: '1000 Pontos', check: (p) => p.total_points >= 1000 },
  { id: 'points_10000', name: '10000 Pontos', check: (p) => p.total_points >= 10000 }
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { profile_id } = await req.json();

    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ id: profile_id });
    if (profiles.length === 0) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }
    const profile = profiles[0];

    // Get quiz stats
    const quizResults = await base44.asServiceRole.entities.QuizResult.filter({ profile_id });
    const stats = {
      quizzes_total: quizResults.length,
      quiz_accuracy: quizResults.length > 0 
        ? (quizResults.filter(q => q.is_correct).length / quizResults.length) * 100 
        : 0
    };

    const currentAchievements = profile.achievements || [];
    const newAchievements = [];

    for (const achievement of ACHIEVEMENTS) {
      if (!currentAchievements.includes(achievement.id) && achievement.check(profile, stats)) {
        newAchievements.push(achievement);
      }
    }

    if (newAchievements.length > 0) {
      await base44.asServiceRole.entities.UserProfile.update(profile_id, {
        achievements: [...currentAchievements, ...newAchievements.map(a => a.id)]
      });

      // Log achievements
      for (const achievement of newAchievements) {
        await base44.asServiceRole.entities.UserActivityLog.create({
          profile_id,
          activity_type: 'achievement_earned',
          metadata: { achievement_id: achievement.id, achievement_name: achievement.name }
        });
      }
    }

    return Response.json({
      success: true,
      new_achievements: newAchievements,
      total_achievements: currentAchievements.length + newAchievements.length
    });

  } catch (error) {
    console.error('Check achievements error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});