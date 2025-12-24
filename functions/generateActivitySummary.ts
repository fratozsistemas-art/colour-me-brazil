import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { profile_id, period_days } = await req.json();

    if (!profile_id) {
      return Response.json({ 
        error: 'Missing required parameter: profile_id' 
      }, { status: 400 });
    }

    const days = period_days || 7;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Fetch user profile
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ id: profile_id });
    if (profiles.length === 0) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }
    const profile = profiles[0];

    // Verify parent authorization
    const parentAccounts = await base44.asServiceRole.entities.ParentAccount.filter({
      parent_user_id: user.id
    });
    
    const isAuthorized = parentAccounts.some(pa => 
      pa.child_profiles.includes(profile_id) || pa.id === profile.parent_account_id
    );
    
    if (!isAuthorized) {
      return Response.json({ error: 'Unauthorized - not child\'s parent' }, { status: 403 });
    }

    // Gather activity data
    const [activityLogs, moderationEvents, quizResults, coloredArtwork] = await Promise.all([
      base44.asServiceRole.entities.UserActivityLog.filter({ profile_id }),
      base44.asServiceRole.entities.ModerationEvent.filter({ profile_id }),
      base44.asServiceRole.entities.QuizResult.filter({ profile_id }),
      base44.asServiceRole.entities.ColoredArtwork.filter({ profile_id })
    ]);

    // Filter by date
    const recentActivity = activityLogs.filter(log => 
      new Date(log.created_date) >= cutoffDate
    );
    const recentModeration = moderationEvents.filter(event => 
      new Date(event.created_date) >= cutoffDate
    );
    const recentQuizzes = quizResults.filter(quiz => 
      new Date(quiz.created_date) >= cutoffDate
    );
    const recentArt = coloredArtwork.filter(art => 
      new Date(art.created_date) >= cutoffDate
    );

    // Build comprehensive data summary for AI
    const dataSummary = {
      child_name: profile.child_name,
      period_days: days,
      activity_counts: {
        books_completed: recentActivity.filter(a => a.activity_type === 'book_completed').length,
        pages_colored: recentActivity.filter(a => a.activity_type === 'page_colored').length,
        quizzes_completed: recentQuizzes.length,
        achievements_earned: recentActivity.filter(a => a.activity_type === 'achievement_earned').length
      },
      reading_stats: {
        total_reading_time: profile.total_reading_time,
        books_completed_total: profile.books_completed.length,
        current_streak: profile.current_streak,
        longest_streak: profile.longest_streak
      },
      quiz_performance: {
        total_attempted: recentQuizzes.length,
        correct: recentQuizzes.filter(q => q.is_correct).length,
        accuracy: recentQuizzes.length > 0 
          ? Math.round((recentQuizzes.filter(q => q.is_correct).length / recentQuizzes.length) * 100) 
          : 0
      },
      creative_output: {
        artworks_created: recentArt.length,
        total_coloring_time: recentArt.reduce((sum, art) => sum + (art.coloring_time_seconds || 0), 0),
        showcased: recentArt.filter(art => art.is_showcased).length
      },
      moderation_summary: {
        total_events: recentModeration.length,
        flagged: recentModeration.filter(e => e.moderation_result === 'flagged').length,
        blocked: recentModeration.filter(e => e.moderation_result === 'blocked').length,
        high_risk: recentModeration.filter(e => ['high', 'critical'].includes(e.risk_level)).length,
        common_issues: [...new Set(recentModeration.flatMap(e => e.detected_issues))]
      },
      preferences: {
        language: profile.preferred_language,
        reading_level: profile.reading_level,
        vocabulary: profile.vocabulary_preference
      }
    };

    // Generate AI summary
    const summaryPrompt = `You are an AI assistant helping parents understand their child's educational app activity.

Generate a comprehensive, warm, and insightful summary in Portuguese for the parent about their child's activity over the past ${days} days.

Child's Activity Data:
${JSON.stringify(dataSummary, null, 2)}

Your summary should include:
1. **Destaques Positivos** - Celebrate accomplishments and engagement
2. **Desenvolvimento Educacional** - Learning progress and skills
3. **Criatividade e Expressão** - Artistic and creative activities
4. **Segurança e Moderação** - Any content moderation events (be tactful)
5. **Recomendações** - Personalized suggestions for parents

Tone: Warm, encouraging, data-informed but accessible
Format: Well-structured paragraphs with emoji icons
Length: 400-600 words

IMPORTANT for Moderation Section:
- If there were NO moderation events: briefly mention the child used the app safely
- If there were minor flags: frame positively as learning opportunities
- If there were serious issues: be clear but supportive, focus on next steps`;

    const aiSummary = await base44.integrations.Core.InvokeLLM({
      prompt: summaryPrompt
    });

    return Response.json({
      success: true,
      profile: {
        id: profile.id,
        name: profile.child_name,
        avatar: profile.avatar_icon
      },
      period: {
        days,
        start_date: cutoffDate.toISOString(),
        end_date: new Date().toISOString()
      },
      statistics: dataSummary,
      ai_summary: aiSummary,
      moderation_events: recentModeration.map(e => ({
        id: e.id,
        date: e.created_date,
        type: e.content_type,
        result: e.moderation_result,
        risk_level: e.risk_level,
        reasoning: e.ai_reasoning,
        reviewed: e.parent_reviewed
      }))
    });

  } catch (error) {
    console.error('Activity summary error:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
});