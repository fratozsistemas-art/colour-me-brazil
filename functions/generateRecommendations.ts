import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { profile_id, force_refresh, interest_topics } = await req.json();

    if (!profile_id) {
      return Response.json({ 
        error: 'Missing required parameter: profile_id' 
      }, { status: 400 });
    }

    // Fetch user profile
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ id: profile_id });
    if (profiles.length === 0) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }
    const profile = profiles[0];

    // Check if we have recent recommendations (less than 24h old)
    if (!force_refresh) {
      const existingRecs = await base44.asServiceRole.entities.ContentRecommendation.filter({
        profile_id,
        clicked: false
      });
      
      const recentRecs = existingRecs.filter(rec => {
        const createdDate = new Date(rec.created_date);
        const hoursSinceCreated = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);
        return hoursSinceCreated < 24;
      });

      if (recentRecs.length > 0) {
        return Response.json({
          success: true,
          recommendations: recentRecs,
          cached: true
        });
      }
    }

    // Gather comprehensive profile data
    const [activityLogs, quizResults, coloredArtwork, books, pages, crossInsights] = await Promise.all([
      base44.asServiceRole.entities.UserActivityLog.filter({ profile_id }),
      base44.asServiceRole.entities.QuizResult.filter({ profile_id }),
      base44.asServiceRole.entities.ColoredArtwork.filter({ profile_id }),
      base44.asServiceRole.entities.Book.list(),
      base44.asServiceRole.entities.Page.list(),
      base44.asServiceRole.entities.CrossInsight?.list() || Promise.resolve([])
    ]);

    // Calculate statistics
    const completedBooks = profile.books_completed || [];
    const readingHistory = activityLogs.filter(a => a.activity_type === 'book_started' || a.activity_type === 'book_completed');
    const coloringHistory = coloredArtwork.map(a => a.page_id);
    
    const quizAccuracy = quizResults.length > 0
      ? (quizResults.filter(q => q.is_correct).length / quizResults.length) * 100
      : 0;

    const averageColoringTime = coloredArtwork.length > 0
      ? coloredArtwork.reduce((sum, a) => sum + (a.coloring_time_seconds || 0), 0) / coloredArtwork.length
      : 0;

    // Build recommendation prompt
    const recommendationPrompt = `You are an AI educational content recommender for a Brazilian children's learning app (ages 6-12).

CHILD PROFILE:
- Name: ${profile.child_name}
- Reading Level: ${profile.reading_level}
- Vocabulary Preference: ${profile.vocabulary_preference}
- Language: ${profile.preferred_language}
- Current Level: ${profile.level}
- Total Points: ${profile.total_points}
- Current Streak: ${profile.current_streak} days

LEARNING STATISTICS:
- Books Completed: ${completedBooks.length}
- Pages Colored: ${profile.pages_colored?.length || 0}
- Quiz Accuracy: ${quizAccuracy.toFixed(1)}%
- Total Reading Time: ${Math.round(profile.total_reading_time / 60)} minutes
- Total Coloring Time: ${Math.round(profile.total_coloring_time / 60)} minutes
- Average Time Per Artwork: ${Math.round(averageColoringTime / 60)} minutes

AVAILABLE CONTENT:
Books: ${books.length} total (${books.filter(b => !completedBooks.includes(b.id)).length} unread)
Collections: Amazon, Culture
Coloring Pages: Available for most books

COMPLETED BOOKS:
${completedBooks.slice(-5).map(id => books.find(b => b.id === id)?.title_en || id).join(', ')}

INTEREST TOPICS (Parent-Configured):
${(interest_topics || profile.interest_topics || []).join(', ') || 'Not specified'}

CROSS-LEARNING INSIGHTS:
${crossInsights.slice(0, 3).map(ci => `- ${ci.title || 'Insight'}: ${ci.summary || ''}`).join('\n')}

TASK: Generate 8 personalized content recommendations that:
1. Match the child's reading level and interests
2. **PRIORITIZE content related to their interest topics** (${(interest_topics || profile.interest_topics || []).slice(0, 3).join(', ')})
3. Provide appropriate challenge (not too easy, not too hard)
4. Build on completed content
5. Introduce new themes/skills that connect to their interests
6. Balance reading, coloring, and quizzes
7. Connect different learning areas (use CrossInsights)
8. Consider Brazilian cultural context
9. If interest topics are specified, make sure at least 5 of 8 recommendations relate to those topics

Respond with a JSON array of 8 recommendation objects:
[
  {
    "recommendation_type": "book|coloring_page|quiz|reading_path|cross_learning",
    "content_id": "actual_id_from_available_content",
    "title": "Content title in ${profile.preferred_language}",
    "description": "Why this is perfect for ${profile.child_name} (1-2 sentences)",
    "reasoning": "Detailed pedagogical reasoning",
    "confidence_score": 0-100,
    "learning_goals": ["goal1", "goal2"],
    "cross_insights": ["insight_id"],
    "priority": 0-10,
    "metadata": {
      "difficulty": "beginner|intermediate|advanced",
      "estimated_time_minutes": number,
      "theme": "string"
    }
  }
]`;

    // Generate recommendations with AI
    const aiRecommendations = await base44.integrations.Core.InvokeLLM({
      prompt: recommendationPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                recommendation_type: { type: "string" },
                content_id: { type: "string" },
                title: { type: "string" },
                description: { type: "string" },
                reasoning: { type: "string" },
                confidence_score: { type: "number" },
                learning_goals: { type: "array", items: { type: "string" } },
                cross_insights: { type: "array", items: { type: "string" } },
                priority: { type: "number" },
                metadata: { type: "object" }
              }
            }
          }
        }
      }
    });

    const recommendations = aiRecommendations.recommendations || [];

    // Save recommendations to database
    const savedRecommendations = [];
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expire in 7 days

    for (const rec of recommendations) {
      try {
        const saved = await base44.asServiceRole.entities.ContentRecommendation.create({
          profile_id,
          recommendation_type: rec.recommendation_type,
          content_id: rec.content_id,
          title: rec.title,
          description: rec.description,
          reasoning: rec.reasoning,
          confidence_score: rec.confidence_score,
          learning_goals: rec.learning_goals || [],
          cross_insights: rec.cross_insights || [],
          metadata: rec.metadata || {},
          priority: rec.priority || 0,
          expires_at: expiresAt.toISOString(),
          clicked: false,
          completed: false
        });
        savedRecommendations.push(saved);
      } catch (error) {
        console.error('Failed to save recommendation:', error);
      }
    }

    return Response.json({
      success: true,
      recommendations: savedRecommendations,
      generated_at: new Date().toISOString(),
      profile: {
        name: profile.child_name,
        level: profile.level,
        reading_level: profile.reading_level
      }
    });

  } catch (error) {
    console.error('Recommendation generation error:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
});