import { base44 } from '@/api/base44Client';
import { MASTERY_BADGES } from './tierSystem';

export async function checkAndAwardMasteryBadges(profileId) {
  try {
    const profiles = await base44.entities.UserProfile.list();
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return [];

    const books = await base44.entities.Book.list();
    const coloringSessions = await base44.entities.ColoringSession.filter({ profile_id: profileId });
    const forumTopics = await base44.entities.ForumTopic.filter({ profile_id: profileId });
    const storyContributions = await base44.entities.StoryContribution.filter({ profile_id: profileId });
    const readingPaths = await base44.entities.ReadingPath.filter({ creator_profile_id: profileId });
    const existingBadges = await base44.entities.MasteryBadge.filter({ profile_id: profileId });

    const newBadges = [];

    // Folklore Master
    if (!existingBadges.find(b => b.badge_type === 'folklore_master')) {
      const folkloreBooks = books.filter(b => b.cultural_tags?.includes('Folklore'));
      const completedFolklore = folkloreBooks.filter(b => profile.books_completed?.includes(b.id));
      if (completedFolklore.length >= folkloreBooks.length && folkloreBooks.length > 0) {
        newBadges.push({
          profile_id: profileId,
          badge_type: 'folklore_master',
          name_en: 'Folklore Master',
          name_pt: 'Mestre do Folclore',
          description_en: 'Complete all folklore-themed books',
          description_pt: 'Complete todos os livros de folclore',
          icon: '🦜',
          tier: 1,
          progress: completedFolklore.length,
          required_progress: folkloreBooks.length,
          unlocked_at: new Date().toISOString()
        });
      }
    }

    // Amazon Explorer
    if (!existingBadges.find(b => b.badge_type === 'amazon_explorer')) {
      const amazonBooks = books.filter(b => b.collection === 'amazon');
      const completedAmazon = amazonBooks.filter(b => profile.books_completed?.includes(b.id));
      if (completedAmazon.length >= amazonBooks.length && amazonBooks.length > 0) {
        newBadges.push({
          profile_id: profileId,
          badge_type: 'amazon_explorer',
          name_en: 'Amazon Explorer',
          name_pt: 'Explorador da Amazônia',
          description_en: 'Complete all Amazon collection books',
          description_pt: 'Complete toda a coleção Amazônica',
          icon: '🌿',
          tier: 1,
          progress: completedAmazon.length,
          required_progress: amazonBooks.length,
          unlocked_at: new Date().toISOString()
        });
      }
    }

    // Quiz Genius
    if (!existingBadges.find(b => b.badge_type === 'quiz_genius')) {
      if ((profile.quizzes_correct || 0) >= 50) {
        newBadges.push({
          profile_id: profileId,
          badge_type: 'quiz_genius',
          name_en: 'Quiz Genius',
          name_pt: 'Gênio dos Quiz',
          description_en: 'Answer 50 quizzes correctly',
          description_pt: 'Responda 50 questionários corretamente',
          icon: '🧠',
          tier: 1,
          progress: profile.quizzes_correct || 0,
          required_progress: 50,
          unlocked_at: new Date().toISOString()
        });
      }
    }

    // Art Virtuoso
    if (!existingBadges.find(b => b.badge_type === 'art_virtuoso')) {
      const completedSessions = coloringSessions.filter(s => s.is_completed);
      if (completedSessions.length >= 100) {
        newBadges.push({
          profile_id: profileId,
          badge_type: 'art_virtuoso',
          name_en: 'Art Virtuoso',
          name_pt: 'Virtuoso da Arte',
          description_en: 'Color 100 pages',
          description_pt: 'Pinte 100 páginas',
          icon: '🎨',
          tier: 1,
          progress: completedSessions.length,
          required_progress: 100,
          unlocked_at: new Date().toISOString()
        });
      }
    }

    // Storyteller
    if (!existingBadges.find(b => b.badge_type === 'storyteller')) {
      if (storyContributions.length >= 25) {
        newBadges.push({
          profile_id: profileId,
          badge_type: 'storyteller',
          name_en: 'Master Storyteller',
          name_pt: 'Mestre Contador',
          description_en: 'Contribute to 25 collaborative stories',
          description_pt: 'Contribua para 25 histórias colaborativas',
          icon: '📖',
          tier: 1,
          progress: storyContributions.length,
          required_progress: 25,
          unlocked_at: new Date().toISOString()
        });
      }
    }

    // Curator
    if (!existingBadges.find(b => b.badge_type === 'curator')) {
      const popularPaths = readingPaths.filter(p => (p.followers_count || 0) >= 20);
      if (popularPaths.length >= 5) {
        newBadges.push({
          profile_id: profileId,
          badge_type: 'curator',
          name_en: 'Path Curator',
          name_pt: 'Curador de Caminhos',
          description_en: 'Create 5 reading paths with 20+ followers',
          description_pt: 'Crie 5 caminhos de leitura com 20+ seguidores',
          icon: '🗺️',
          tier: 1,
          progress: popularPaths.length,
          required_progress: 5,
          unlocked_at: new Date().toISOString()
        });
      }
    }

    if (newBadges.length > 0) {
      await base44.entities.MasteryBadge.bulkCreate(newBadges);
    }

    return newBadges;
  } catch (error) {
    console.error('Error checking mastery badges:', error);
    return [];
  }
}

export async function getMasteryBadgeProgress(profileId) {
  try {
    const profile = await base44.entities.UserProfile.list().then(p => p.find(pr => pr.id === profileId));
    if (!profile) return [];

    const books = await base44.entities.Book.list();
    const coloringSessions = await base44.entities.ColoringSession.filter({ profile_id: profileId });
    const storyContributions = await base44.entities.StoryContribution.filter({ profile_id: profileId });
    const readingPaths = await base44.entities.ReadingPath.filter({ creator_profile_id: profileId });
    const existingBadges = await base44.entities.MasteryBadge.filter({ profile_id: profileId });

    return MASTERY_BADGES.map(badgeDef => {
      const existing = existingBadges.find(b => b.badge_type === badgeDef.id);
      let progress = 0;

      switch (badgeDef.id) {
        case 'folklore_master':
          const folkloreBooks = books.filter(b => b.cultural_tags?.includes('Folklore'));
          progress = folkloreBooks.filter(b => profile.books_completed?.includes(b.id)).length;
          break;
        case 'amazon_explorer':
          const amazonBooks = books.filter(b => b.collection === 'amazon');
          progress = amazonBooks.filter(b => profile.books_completed?.includes(b.id)).length;
          break;
        case 'quiz_genius':
          progress = profile.quizzes_correct || 0;
          break;
        case 'art_virtuoso':
          progress = coloringSessions.filter(s => s.is_completed).length;
          break;
        case 'linguist':
          progress = profile.words_clicked || 0;
          break;
        case 'storyteller':
          progress = storyContributions.length;
          break;
        case 'curator':
          progress = readingPaths.filter(p => (p.followers_count || 0) >= 20).length;
          break;
      }

      return {
        ...badgeDef,
        progress,
        unlocked: !!existing,
        unlockedAt: existing?.unlocked_at
      };
    });
  } catch (error) {
    console.error('Error getting mastery badge progress:', error);
    return [];
  }
}