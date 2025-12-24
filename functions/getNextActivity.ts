import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { profile_id, path_id, completed_activity_id, score, time_spent_seconds } = await req.json();

    if (!profile_id || !path_id) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Fetch path and progress
    const [paths, progresses] = await Promise.all([
      base44.asServiceRole.entities.LearningPath.filter({ id: path_id }),
      base44.asServiceRole.entities.PathProgress.filter({ profile_id, path_id })
    ]);

    if (paths.length === 0) {
      return Response.json({ error: 'Path not found' }, { status: 404 });
    }

    const path = paths[0];
    const progress = progresses[0] || null;

    if (!progress) {
      return Response.json({ error: 'Progress not found' }, { status: 404 });
    }

    // Update progress if activity was completed
    if (completed_activity_id) {
      const newCompletedActivities = [...progress.completed_activities, completed_activity_id];
      const newActivityScores = { ...progress.activity_scores, [completed_activity_id]: score || 0 };
      const newTimeSpent = { ...progress.time_spent_per_activity, [completed_activity_id]: time_spent_seconds || 0 };

      await base44.asServiceRole.entities.PathProgress.update(progress.id, {
        completed_activities: newCompletedActivities,
        activity_scores: newActivityScores,
        time_spent_per_activity: newTimeSpent,
        progress_percentage: (newCompletedActivities.length / path.activities.length) * 100,
        last_activity_date: new Date().toISOString()
      });
    }

    // Find current activity
    const currentActivity = path.activities.find(a => a.id === progress.current_activity_id);

    // Determine next activity based on branching logic
    let nextActivity = null;

    if (completed_activity_id && currentActivity?.branching_options) {
      // Check branching conditions
      for (const branch of currentActivity.branching_options) {
        if (branch.condition === 'score_high' && score >= 80) {
          nextActivity = path.activities.find(a => a.id === branch.next_activity_id);
          break;
        } else if (branch.condition === 'score_medium' && score >= 60 && score < 80) {
          nextActivity = path.activities.find(a => a.id === branch.next_activity_id);
          break;
        } else if (branch.condition === 'score_low' && score < 60) {
          nextActivity = path.activities.find(a => a.id === branch.next_activity_id);
          break;
        }
      }
    }

    // If no branching match, get next sequential activity
    if (!nextActivity) {
      const currentIndex = path.activities.findIndex(a => a.id === progress.current_activity_id);
      const nextIndex = currentIndex + 1;
      
      if (nextIndex < path.activities.length) {
        nextActivity = path.activities[nextIndex];
      }
    }

    // Update current activity in progress
    if (nextActivity) {
      await base44.asServiceRole.entities.PathProgress.update(progress.id, {
        current_activity_id: nextActivity.id,
        next_recommended_activity: nextActivity.id
      });
    } else {
      // Path completed
      await base44.asServiceRole.entities.LearningPath.update(path_id, {
        status: 'completed'
      });

      await base44.asServiceRole.entities.PathProgress.update(progress.id, {
        progress_percentage: 100
      });

      // Award completion points
      await base44.functions.invoke('awardPoints', {
        profile_id,
        activity_type: 'path_completed',
        metadata: { path_id, path_title: path.title }
      });
    }

    // Calculate performance trend
    const recentScores = Object.values(progress.activity_scores).slice(-3);
    let performanceTrend = 'stable';
    
    if (recentScores.length >= 2) {
      const avgRecent = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
      if (avgRecent > 75) performanceTrend = 'improving';
      else if (avgRecent < 60) performanceTrend = 'struggling';
    }

    await base44.asServiceRole.entities.PathProgress.update(progress.id, {
      performance_trend: performanceTrend
    });

    return Response.json({
      success: true,
      next_activity: nextActivity,
      path_completed: !nextActivity,
      progress_percentage: nextActivity ? ((progress.completed_activities.length + 1) / path.activities.length) * 100 : 100,
      performance_trend: performanceTrend,
      adaptive_message: nextActivity ? getAdaptiveMessage(performanceTrend, score) : 'Parabéns! Você completou esta trilha de aprendizado! 🎉'
    });

  } catch (error) {
    console.error('Get next activity error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});

function getAdaptiveMessage(trend, score) {
  if (trend === 'improving' || score >= 80) {
    return 'Excelente trabalho! Vamos aumentar um pouco o desafio.';
  } else if (trend === 'struggling' || score < 60) {
    return 'Vamos reforçar esse conteúdo com uma atividade especial.';
  }
  return 'Você está indo muito bem! Continue assim.';
}