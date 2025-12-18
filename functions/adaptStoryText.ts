import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { story_text, language, reading_level, vocabulary_preference, cultural_context } = await req.json();

    if (!story_text || !language) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Create adaptation prompt based on preferences
    const levelDescriptions = {
      beginner: 'Use simple, short sentences (5-10 words). Use basic vocabulary suitable for ages 6-8. Break complex ideas into multiple simple sentences.',
      intermediate: 'Use moderate sentence complexity (10-15 words). Use age-appropriate vocabulary for ages 8-10. Balance simplicity with engaging descriptions.',
      advanced: 'Use varied sentence structures. Include richer vocabulary and more descriptive language suitable for ages 10-12. Maintain engagement with more sophisticated storytelling.'
    };

    const vocabDescriptions = {
      simple: 'Use only common, everyday words. Avoid idioms or complex expressions.',
      standard: 'Use standard vocabulary with occasional new words that can be understood from context.',
      enriched: 'Include educational vocabulary, cultural terms, and descriptive language. Explain complex words naturally within the story.'
    };

    const adaptationPrompt = `You are adapting a Brazilian cultural story for children. 

ORIGINAL STORY (${language === 'en' ? 'English' : 'Portuguese'}):
${story_text}

ADAPTATION REQUIREMENTS:
- Reading Level: ${reading_level || 'intermediate'} - ${levelDescriptions[reading_level || 'intermediate']}
- Vocabulary: ${vocabulary_preference || 'standard'} - ${vocabDescriptions[vocabulary_preference || 'standard']}
- Language: ${language === 'en' ? 'English' : 'Portuguese'}
${cultural_context ? `- Cultural Context: ${cultural_context}` : ''}

IMPORTANT INSTRUCTIONS:
1. Preserve the core story, cultural elements, and key messages
2. Maintain the same emotional tone and educational value
3. Keep character names and cultural references exactly as they are
4. Adapt sentence structure and vocabulary to match the specified reading level
5. Ensure the adapted text flows naturally and engagingly
6. Keep the length similar to the original (do not significantly shorten or lengthen)
7. Return ONLY the adapted story text, no explanations or meta-commentary

Provide the adapted story now:`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: adaptationPrompt
    });

    return Response.json({
      adapted_text: result,
      original_length: story_text.length,
      adapted_length: result.length,
      reading_level: reading_level || 'intermediate',
      vocabulary: vocabulary_preference || 'standard'
    });

  } catch (error) {
    console.error('Error adapting story:', error);
    return Response.json({ 
      error: error.message || 'Failed to adapt story' 
    }, { status: 500 });
  }
});