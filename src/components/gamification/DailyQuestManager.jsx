import { base44 } from '@/api/base44Client';

const DAILY_QUESTS = [
  {
    id: 'color_3_pages',
    name_en: 'Colorful Journey',
    name_pt: 'Jornada Colorida',
    description_en: 'Color 3 different pages today',
    description_pt: 'Colorir 3 páginas diferentes hoje',
    icon: '🎨',
    reward_points: 50,
    reward_item_id: null,
    checkProgress: (profile, activities) => {
      const today = new Date().toDateString();
      const coloredToday = activities.filter(
        a => a.activity_type === 'page_colored' && 
        new Date(a.created_date).toDateString() === today
      );
      return { current: coloredToday.length, target: 3 };
    }
  },
  {
    id: 'complete_2_books',
    name_en: 'Book Worm',
    name_pt: 'Ratinho de Biblioteca',
    description_en: 'Complete 2 books today',
    description_pt: 'Complete 2 livros hoje',
    icon: '📚',
    reward_points: 100,
    reward_item_id: null,
    checkProgress: (profile, activities) => {
      const today = new Date().toDateString();
      const completedToday = activities.filter(
        a => a.activity_type === 'book_completed' && 
        new Date(a.created_date).toDateString() === today
      );
      return { current: completedToday.length, target: 2 };
    }
  },
  {
    id: 'perfect_quizzes',
    name_en: 'Quiz Master',
    name_pt: 'Mestre dos Questionários',
    description_en: 'Answer 5 quizzes correctly without mistakes',
    description_pt: 'Responda 5 questionários corretamente sem erros',
    icon: '🧠',
    reward_points: 75,
    reward_item_id: 'brain_hat',
    checkProgress: (profile, activities) => {
      const today = new Date().toDateString();
      const quizzesToday = activities.filter(
        a => a.activity_type === 'quiz_completed' && 
        new Date(a.created_date).toDateString() === today &&
        a.metadata?.is_correct === true
      );
      return { current: quizzesToday.length, target: 5 };
    }
  },
  {
    id: 'spend_30_minutes',
    name_en: 'Dedicated Artist',
    name_pt: 'Artista Dedicado',
    description_en: 'Spend 30 minutes coloring or reading',
    description_pt: 'Passe 30 minutos colorindo ou lendo',
    icon: '⏱️',
    reward_points: 60,
    reward_item_id: null,
    checkProgress: (profile, activities) => {
      const today = new Date().toDateString();
      const todayActivities = activities.filter(
        a => new Date(a.created_date).toDateString() === today
      );
      const totalTime = todayActivities.reduce((sum, a) => {
        return sum + (a.metadata?.time_spent || 0);
      }, 0);
      return { current: Math.floor(totalTime / 60), target: 30 };
    }
  },
  {
    id: 'explore_culture',
    name_en: 'Culture Explorer',
    name_pt: 'Explorador Cultural',
    description_en: 'Read pages from both Amazon and Culture collections',
    description_pt: 'Leia páginas das coleções Amazônia e Cultura',
    icon: '🌍',
    reward_points: 80,
    reward_item_id: 'explorer_badge',
    checkProgress: (profile, activities) => {
      const today = new Date().toDateString();
      const booksToday = activities.filter(
        a => a.activity_type === 'book_started' && 
        new Date(a.created_date).toDateString() === today
      );
      const collections = new Set(booksToday.map(a => a.metadata?.collection));
      const hasAmazon = collections.has('amazon');
      const hasCulture = collections.has('culture');
      return { current: (hasAmazon ? 1 : 0) + (hasCulture ? 1 : 0), target: 2 };
    }
  },
  {
    id: 'social_butterfly',
    name_en: 'Social Butterfly',
    name_pt: 'Borboleta Social',
    description_en: 'Give 10 likes in the showcase',
    description_pt: 'Dê 10 curtidas na vitrine',
    icon: '❤️',
    reward_points: 40,
    reward_item_id: 'butterfly_wings',
    checkProgress: (profile, activities) => {
      const today = new Date().toDateString();
      const likesToday = activities.filter(
        a => a.activity_type === 'like_given' && 
        new Date(a.created_date).toDateString() === today
      );
      return { current: likesToday.length, target: 10 };
    }
  }
];

export async function getTodaysDailyQuest(profileId) {
  try {
    const profiles = await base44.entities.UserProfile.filter({ id: profileId });
    if (profiles.length === 0) return null;
    
    const profile = profiles[0];
    const today = new Date().toDateString();
    
    // Check if quest already exists for today
    if (profile.daily_quest_date === today) {
      const questId = profile.daily_quest_id || getDailyQuestForDate(today).id;
      const quest = DAILY_QUESTS.find(q => q.id === questId);
      return quest;
    }
    
    // New day, get new quest
    const quest = getDailyQuestForDate(today);
    await base44.entities.UserProfile.update(profileId, {
      daily_quest_date: today,
      daily_quest_id: quest.id,
      daily_quest_completed: false
    });
    
    return quest;
  } catch (error) {
    console.error('Error getting daily quest:', error);
    return null;
  }
}

export async function checkQuestProgress(profileId) {
  try {
    const quest = await getTodaysDailyQuest(profileId);
    if (!quest) return null;
    
    const profiles = await base44.entities.UserProfile.filter({ id: profileId });
    if (profiles.length === 0) return null;
    const profile = profiles[0];
    
    if (profile.daily_quest_completed) {
      return { quest, progress: { current: quest.checkProgress().target, target: quest.checkProgress().target }, completed: true };
    }
    
    // Get today's activities
    const activities = await base44.entities.UserActivityLog.filter({ profile_id: profileId });
    const progress = quest.checkProgress(profile, activities);
    
    // Check if completed
    if (progress.current >= progress.target) {
      // Award rewards
      await base44.entities.UserProfile.update(profileId, {
        daily_quest_completed: true,
        daily_quests_completed: (profile.daily_quests_completed || 0) + 1,
        total_points: (profile.total_points || 0) + quest.reward_points
      });
      
      // If there's a reward item, add to inventory
      if (quest.reward_item_id) {
        const item = await base44.entities.VirtualItem.filter({ id: quest.reward_item_id });
        if (item.length > 0) {
          await base44.entities.UserItemInventory.create({
            profile_id: profileId,
            item_id: quest.reward_item_id,
            redeemed_at: new Date().toISOString()
          });
        }
      }
      
      // Log activity
      await base44.entities.UserActivityLog.create({
        profile_id: profileId,
        activity_type: 'daily_quest_completed',
        points_earned: quest.reward_points,
        metadata: { quest_id: quest.id, reward_item: quest.reward_item_id }
      });
      
      return { quest, progress, completed: true };
    }
    
    return { quest, progress, completed: false };
  } catch (error) {
    console.error('Error checking quest progress:', error);
    return null;
  }
}

export function getDailyQuestForDate(date) {
  const dateStr = typeof date === 'string' ? date : date.toDateString();
  const hash = dateStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return DAILY_QUESTS[hash % DAILY_QUESTS.length];
}

export async function resetDailyQuest(profileId) {
  try {
    const profiles = await base44.entities.UserProfile.filter({ id: profileId });
    if (profiles.length === 0) return;
    
    const profile = profiles[0];
    const today = new Date().toDateString();
    
    if (profile.daily_quest_date !== today) {
      await base44.entities.UserProfile.update(profileId, {
        daily_quest_completed: false,
        daily_quest_date: today
      });
    }
  } catch (error) {
    console.error('Error resetting daily quest:', error);
  }
}