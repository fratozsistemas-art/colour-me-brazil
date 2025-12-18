import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { GoogleGenerativeAI } from 'npm:@google/generative-ai';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pageId, language, text, forceRegenerate = false } = await req.json();

    if (!pageId || !language || !text) {
      return Response.json(
        { error: 'pageId, language, and text are required' },
        { status: 400 }
      );
    }

    // Check if audio already exists for this page and language
    const pages = await base44.asServiceRole.entities.Page.filter({ id: pageId });
    if (pages.length === 0) {
      return Response.json({ error: 'Page not found' }, { status: 404 });
    }

    const page = pages[0];
    const audioField = language === 'pt' ? 'audio_narration_pt_url' : 'audio_narration_en_url';

    if (!forceRegenerate && page[audioField]) {
      return Response.json({
        success: true,
        audioUrl: page[audioField],
        message: 'Audio already exists'
      });
    }

    // Initialize Gemini
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Generate audio using Gemini text-to-speech
    const prompt = `Convert this text to speech in ${language === 'pt' ? 'Brazilian Portuguese (pt-BR)' : 'US English (en-US)'} with clear pronunciation suitable for children: ${text}`;
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
      }
    });

    // Note: Gemini doesn't have direct TTS API yet
    // For now, we'll use the Core.GenerateAudio integration if available
    // or return a message that TTS needs to be set up differently
    
    // Alternative: Use Google Cloud Text-to-Speech or other TTS service
    // For this implementation, I'll create a placeholder that can be replaced
    // with actual TTS implementation
    
    return Response.json({
      success: false,
      error: 'Gemini does not support text-to-speech directly. Please use Google Cloud Text-to-Speech API or another TTS service.',
      suggestion: 'Consider using ElevenLabs, Google Cloud TTS, or Amazon Polly for audio generation'
    }, { status: 501 });

  } catch (error) {
    console.error('Error generating audio:', error);
    return Response.json(
      { error: error.message || 'Failed to generate audio' },
      { status: 500 }
    );
  }
});