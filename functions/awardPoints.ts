import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Points configuration
const POINTS_CONFIG = {
  book_started: 10,
  book_completed: 100,
  page_read: 5,
  page_colored: 25,
  quiz_correct: 15,
  quiz_perfect: 50, // All correct in a book
  daily_challenge: 30,
  daily_quest: 40,
  streak_milestone_7: 100,
  streak_milestone_30: 500,
  first_showcase: 50,
  recommendation_completed_high: 75, // High confidence rec
  recommendation_completed_medium: 50,
  achievement_unlocked: 20
};

// Level thresholds
const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 1000, 1500, 2500, 4000, 6000, 8500, 
  11500, 15000, 20000, 26000, 33000, 41000, 50000
];

function calculateLevel(totalPoints) {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalPoints >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { profile_id, activity_type, metadata } = await req.json();

    if (!profile_id || !activity_type) {
      return Response.json({ 
        error: 'Missing required parameters: profile_id, activity_type' 
      }, { status: 400 });
    }

    // Get profile
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ id: profile_id });
    if (profiles.length === 0) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }
    const profile = profiles[0];

    // Calculate points to award
    let pointsToAward = POINTS_CONFIG[activity_type] || 0;
    let bonusMultiplier = 1;
    const bonusReasons = [];

    // Apply bonuses
    if (profile.current_streak >= 7) {
      bonusMultiplier += 0.1;
      bonusReasons.push('Sequência de 7 dias');
    }
    if (profile.current_streak >= 30) {
      bonusMultiplier += 0.2;
      bonusReasons.push('Sequência de 30 dias');
    }
    if (profile.level >= 10) {
      bonusMultiplier += 0.05;
      bonusReasons.push('Nível alto');
    }

    pointsToAward = Math.round(pointsToAward * bonusMultiplier);

    // Update profile points and level
    const newTotalPoints = profile.total_points + pointsToAward;
    const newLevel = calculateLevel(newTotalPoints);
    const leveledUp = newLevel > profile.level;

    await base44.asServiceRole.entities.UserProfile.update(profile_id, {
      total_points: newTotalPoints,
      level: newLevel
    });

    // Log activity
    await base44.asServiceRole.entities.UserActivityLog.create({
      profile_id,
      activity_type,
      points_earned: pointsToAward,
      metadata: {
        ...metadata,
        bonus_multiplier: bonusMultiplier,
        bonus_reasons: bonusReasons,
        previous_level: profile.level,
        new_level: newLevel
      }
    });

    // Check for new achievements
    const achievementCheck = await fetch(`${Deno.env.get('FUNCTIONS_URL')}/checkAchievements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.get('Authorization')
      },
      body: JSON.stringify({ profile_id })
    });

    const achievementResult = await achievementCheck.json();
    const newAchievements = achievementResult.new_achievements || [];

    // Award achievement points
    if (newAchievements.length > 0) {
      const achievementPoints = newAchievements.length * POINTS_CONFIG.achievement_unlocked;
      await base44.asServiceRole.entities.UserProfile.update(profile_id, {
        total_points: newTotalPoints + achievementPoints
      });
    }

    return Response.json({
      success: true,
      points_awarded: pointsToAward,
      bonus_multiplier: bonusMultiplier,
      bonus_reasons: bonusReasons,
      new_total: newTotalPoints + (newAchievements.length * POINTS_CONFIG.achievement_unlocked),
      previous_level: profile.level,
      new_level: newLevel,
      leveled_up: leveledUp,
      new_achievements: newAchievements
    });

  } catch (error) {
    console.error('Award points error:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
});