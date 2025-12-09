import { base44 } from '@/api/base44Client';
import { format, parseISO, differenceInDays, startOfDay } from 'date-fns';

/**
 * Check and update user's activity streak
 */
export async function updateStreak(profileId) {
  try {
    const profile = await base44.entities.UserProfile.filter({ id: profileId });
    if (!profile || profile.length === 0) return;

    const userProfile = profile[0];
    const today = format(new Date(), 'yyyy-MM-dd');
    const lastActivityDate = userProfile.last_activity_date;

    let newStreak = userProfile.current_streak || 0;
    let longestStreak = userProfile.longest_streak || 0;

    if (!lastActivityDate) {
      // First activity ever
      newStreak = 1;
    } else {
      const lastDate = startOfDay(parseISO(lastActivityDate));
      const todayDate = startOfDay(new Date());
      const daysDiff = differenceInDays(todayDate, lastDate);

      if (daysDiff === 0) {
        // Already updated today, no change
        return userProfile;
      } else if (daysDiff === 1) {
        // Consecutive day, increment streak
        newStreak += 1;
      } else {
        // Streak broken, reset to 1
        newStreak = 1;
      }
    }

    // Update longest streak if needed
    if (newStreak > longestStreak) {
      longestStreak = newStreak;
    }

    // Update profile
    await base44.entities.UserProfile.update(profileId, {
      current_streak: newStreak,
      longest_streak: longestStreak,
      last_activity_date: today
    });

    return { current_streak: newStreak, longest_streak: longestStreak };
  } catch (error) {
    console.error('Error updating streak:', error);
    return null;
  }
}

/**
 * Get streak bonus points based on streak length
 */
export function getStreakBonusPoints(streakDays) {
  if (streakDays >= 30) return 100;
  if (streakDays >= 14) return 50;
  if (streakDays >= 7) return 25;
  if (streakDays >= 3) return 10;
  return 0;
}

/**
 * Award streak milestone achievements
 */
export async function checkStreakAchievements(profileId, streakDays) {
  const achievements = [];
  
  if (streakDays === 3) {
    achievements.push('streak_3_days');
  }
  if (streakDays === 7) {
    achievements.push('streak_7_days');
  }
  if (streakDays === 14) {
    achievements.push('streak_14_days');
  }
  if (streakDays === 30) {
    achievements.push('streak_30_days');
  }

  for (const achievementId of achievements) {
    try {
      const existing = await base44.entities.Achievement.filter({
        profile_id: profileId,
        achievement_id: achievementId
      });

      if (existing.length === 0) {
        const achievementData = getStreakAchievementData(achievementId);
        await base44.entities.Achievement.create({
          achievement_id: achievementId,
          profile_id: profileId,
          unlocked_at: new Date().toISOString(),
          ...achievementData
        });

        // Award bonus points
        const bonusPoints = getStreakBonusPoints(streakDays);
        if (bonusPoints > 0) {
          const profile = await base44.entities.UserProfile.filter({ id: profileId });
          if (profile.length > 0) {
            await base44.entities.UserProfile.update(profileId, {
              total_points: (profile[0].total_points || 0) + bonusPoints
            });
          }
        }
      }
    } catch (error) {
      console.error('Error awarding streak achievement:', error);
    }
  }
}

function getStreakAchievementData(achievementId) {
  const achievements = {
    streak_3_days: {
      name_en: '3-Day Streak',
      name_pt: 'Sequência de 3 Dias',
      description_en: 'Read or color for 3 days in a row',
      description_pt: 'Leia ou coloriu por 3 dias seguidos',
      icon: '🔥'
    },
    streak_7_days: {
      name_en: 'Week Warrior',
      name_pt: 'Guerreiro da Semana',
      description_en: 'Keep a 7-day streak',
      description_pt: 'Mantenha uma sequência de 7 dias',
      icon: '⭐'
    },
    streak_14_days: {
      name_en: 'Two Week Champion',
      name_pt: 'Campeão de Duas Semanas',
      description_en: 'Keep a 14-day streak',
      description_pt: 'Mantenha uma sequência de 14 dias',
      icon: '🏆'
    },
    streak_30_days: {
      name_en: 'Monthly Master',
      name_pt: 'Mestre Mensal',
      description_en: 'Keep a 30-day streak!',
      description_pt: 'Mantenha uma sequência de 30 dias!',
      icon: '👑'
    }
  };

  return achievements[achievementId] || {};
}