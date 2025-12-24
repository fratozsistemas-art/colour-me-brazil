import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { profile_id, theme, focus_area } = await req.json();

    if (!profile_id) {
      return Response.json({ error: 'Missing profile_id' }, { status: 400 });
    }

    // Fetch comprehensive profile data
    const [profile, activityLogs, quizResults, books, pages, quizzes] = await Promise.all([
      base44.asServiceRole.entities.UserProfile.filter({ id: profile_id }).then(p => p[0]),
      base44.asServiceRole.entities.UserActivityLog.filter({ profile_id }),
      base44.asServiceRole.entities.QuizResult.filter({ profile_id }),
      base44.asServiceRole.entities.Book.list(),
      base44.asServiceRole.entities.Page.list(),
      base44.asServiceRole.entities.Quiz.list()
    ]);

    // Calculate performance metrics
    const quizAccuracy = quizResults.length > 0
      ? (quizResults.filter(q => q.is_correct).length / quizResults.length) * 100
      : 70;

    const recentPerformance = quizResults.slice(-10);
    const recentAccuracy = recentPerformance.length > 0
      ? (recentPerformance.filter(q => q.is_correct).length / recentPerformance.length) * 100
      : quizAccuracy;

    const averageQuizTime = quizResults.length > 0
      ? quizResults.reduce((sum, q) => sum + (q.time_taken_seconds || 30), 0) / quizResults.length
      : 30;

    // Generate adaptive learning path with AI
    const pathPrompt = `You are an educational AI designing an adaptive learning path for a Brazilian child (age 6-12).

CHILD PROFILE:
- Name: ${profile.child_name}
- Reading Level: ${profile.reading_level}
- Vocabulary: ${profile.vocabulary_preference}
- Current Level: ${profile.level}
- Books Completed: ${profile.books_completed?.length || 0}
- Quiz Accuracy: ${quizAccuracy.toFixed(1)}% (Recent: ${recentAccuracy.toFixed(1)}%)
- Average Quiz Time: ${Math.round(averageQuizTime)}s
- Learning Streak: ${profile.current_streak} days

AVAILABLE CONTENT:
- Books: ${books.length} (Collections: Amazon, Culture)
- Quizzes: ${quizzes.length}
- Coloring Pages: Available for most books

REQUEST:
Theme: ${theme || 'mixed'}
Focus Area: ${focus_area || 'balanced learning'}

DESIGN a personalized 6-8 activity learning path that:
1. Starts with appropriate difficulty based on reading level
2. Sequences activities logically (book → quiz → coloring → reflection)
3. Includes branching options based on performance:
   - If quiz score > 80%: advance to challenging content
   - If quiz score 60-80%: reinforce with coloring/reflection
   - If quiz score < 60%: offer easier alternative or review
4. Adapts to learning speed (${averageQuizTime < 25 ? 'fast' : 'moderate'} learner)
5. Maintains engagement with variety
6. Aligns with Brazilian cultural context

ACTIVITY TYPES:
- book: Reading a complete book
- quiz: Comprehension questions
- coloring: Creative coloring activity
- challenge: Special task (e.g., find 5 cultural elements)
- reflection: Think about what you learned

Respond with JSON array of activities with branching logic.`;

    const aiPath = await base44.integrations.Core.InvokeLLM({
      prompt: pathPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          path_title: { type: "string" },
          path_description: { type: "string" },
          difficulty_level: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
          learning_goals: { type: "array", items: { type: "string" } },
          estimated_duration_minutes: { type: "number" },
          activities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                type: { type: "string" },
                content_id: { type: "string" },
                title: { type: "string" },
                order: { type: "number" },
                required: { type: "boolean" },
                unlock_condition: {
                  type: "object",
                  properties: {
                    previous_activity_id: { type: "string" },
                    min_score: { type: "number" }
                  }
                },
                branching_options: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      condition: { type: "string" },
                      next_activity_id: { type: "string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    // Create the learning path
    const learningPath = await base44.asServiceRole.entities.LearningPath.create({
      profile_id,
      title: aiPath.path_title,
      description: aiPath.path_description,
      theme: theme || 'mixed',
      difficulty_level: aiPath.difficulty_level,
      activities: aiPath.activities,
      learning_goals: aiPath.learning_goals || [],
      estimated_duration_minutes: aiPath.estimated_duration_minutes || 60,
      is_adaptive: true,
      status: 'active'
    });

    // Initialize progress tracking
    await base44.asServiceRole.entities.PathProgress.create({
      profile_id,
      path_id: learningPath.id,
      current_activity_id: aiPath.activities[0].id,
      completed_activities: [],
      activity_scores: {},
      time_spent_per_activity: {},
      progress_percentage: 0,
      performance_trend: 'stable',
      last_activity_date: new Date().toISOString()
    });

    return Response.json({
      success: true,
      learning_path: learningPath,
      message: 'Trilha de aprendizado personalizada criada!'
    });

  } catch (error) {
    console.error('Generate learning path error:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
});