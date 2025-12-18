import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      book_title, 
      original_story, 
      variation_type, 
      language, 
      user_interests,
      cultural_theme 
    } = await req.json();

    if (!book_title || !original_story || !variation_type || !language) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const variationPrompts = {
      sequel: `Create a sequel story that continues after the events of "${book_title}". Build upon the characters and themes, introducing a new adventure or challenge. Maintain the same cultural context and educational value.`,
      alternative: `Create an alternative version of "${book_title}" where events unfold differently. Keep the same characters and setting but explore a different path or outcome. Preserve the cultural elements and lessons.`,
      expanded: `Expand the story of "${book_title}" by adding more details, character development, and cultural context. Enrich the narrative while maintaining the core story and message.`,
      personalized: `Reimagine "${book_title}" incorporating these interests: ${user_interests || 'adventure, nature, friendship'}. Adapt the story to include elements the reader loves while preserving the Brazilian cultural essence and educational value.`
    };

    const mainPrompt = `You are a creative children's storyteller specializing in Brazilian culture.

ORIGINAL STORY: "${book_title}"
${original_story}

TASK: ${variationPrompts[variation_type]}

REQUIREMENTS:
- Language: ${language === 'en' ? 'English' : 'Portuguese'}
- Cultural Theme: ${cultural_theme || 'Brazilian culture and traditions'}
- Length: Similar to original (approximately ${Math.floor(original_story.length / 50)} sentences)
- Style: Engaging, age-appropriate (6-12 years), educational
- Preserve: Brazilian cultural authenticity, positive values, educational elements

${user_interests ? `PERSONALIZATION: Naturally incorporate: ${user_interests}` : ''}

IMPORTANT:
1. Make it engaging and fun for children
2. Include cultural learning moments
3. Use vivid, descriptive language
4. Maintain appropriate reading level
5. End with a positive message or lesson
6. Return ONLY the story text (no title, no explanations)

Create the ${variation_type} story now:`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: mainPrompt
    });

    return Response.json({
      variation_text: result,
      variation_type,
      book_title,
      language,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating story variation:', error);
    return Response.json({ 
      error: error.message || 'Failed to generate story variation' 
    }, { status: 500 });
  }
});