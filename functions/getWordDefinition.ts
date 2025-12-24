import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { word, language = 'en', context } = await req.json();

    if (!word) {
      return Response.json({ error: 'Word is required' }, { status: 400 });
    }

    // Check if definition already exists
    const existing = await base44.asServiceRole.entities.WordDefinition.filter({
      word: word.toLowerCase(),
      language
    });

    if (existing.length > 0) {
      return Response.json({
        success: true,
        definition: existing[0].definition,
        example: existing[0].example_sentence,
        pronunciation: existing[0].pronunciation_guide,
        cached: true
      });
    }

    // Generate definition using AI
    const prompt = `You are a children's dictionary for ages 6-12. Provide a simple, clear definition for the word "${word}" in ${language === 'pt' ? 'Portuguese (Brazilian)' : 'English'}.

${context ? `Context: "${context}"` : ''}

Respond with:
1. A child-friendly definition (1-2 simple sentences)
2. An example sentence using the word
3. Pronunciation guide (phonetic)
4. Part of speech (noun, verb, adjective, etc.)
5. Synonyms (2-3 simple words)

Make it fun and engaging for children!`;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          definition: { type: "string" },
          example_sentence: { type: "string" },
          pronunciation_guide: { type: "string" },
          part_of_speech: { type: "string" },
          synonyms: { type: "array", items: { type: "string" } }
        }
      }
    });

    // Save to database
    await base44.asServiceRole.entities.WordDefinition.create({
      word: word.toLowerCase(),
      language,
      definition: aiResponse.definition,
      example_sentence: aiResponse.example_sentence,
      pronunciation_guide: aiResponse.pronunciation_guide,
      part_of_speech: aiResponse.part_of_speech,
      synonyms: aiResponse.synonyms || []
    });

    // Generate pronunciation audio
    let audioUrl = null;
    try {
      const audioResponse = await base44.asServiceRole.functions.invoke('generateSpeechElevenLabs', {
        text: word,
        language,
        voice_preference: 'child_female',
        speed: 0.8
      });
      
      if (audioResponse.data.success) {
        audioUrl = audioResponse.data.audio_url;
      }
    } catch (error) {
      console.error('Failed to generate audio:', error);
    }

    return Response.json({
      success: true,
      word,
      definition: aiResponse.definition,
      example: aiResponse.example_sentence,
      pronunciation: aiResponse.pronunciation_guide,
      partOfSpeech: aiResponse.part_of_speech,
      synonyms: aiResponse.synonyms,
      audioUrl,
      cached: false
    });

  } catch (error) {
    console.error('Error getting word definition:', error);
    return Response.json({ 
      error: error.message || 'Failed to get definition' 
    }, { status: 500 });
  }
});