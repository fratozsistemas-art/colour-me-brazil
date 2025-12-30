import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// BEST Voice mappings for ElevenLabs - optimized for children's stories
const VOICE_MAPPINGS = {
  pt: 'XrExE9yKIg1WjnnlVkGX', // Matilda - soft, warm, perfect for Portuguese storytelling
  en: '21m00Tcm4TlvDq8ikWAM' // Rachel - clear, friendly, great for English stories
};

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

    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'ELEVENLABS_API_KEY not configured' }, { status: 500 });
    }

    const voiceId = VOICE_MAPPINGS[language] || VOICE_MAPPINGS.en;

    // Call ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.7,        // Higher = more consistent, professional
            similarity_boost: 0.8, // Higher = more natural voice quality
            style: 0.3,            // Lower = calmer, better for children
            use_speaker_boost: true // Enhanced audio clarity
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('ElevenLabs error:', error);
      return Response.json({ error: 'Failed to generate audio' }, { status: 500 });
    }

    const audioBuffer = await response.arrayBuffer();
    const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
    const file = new File([audioBlob], `page-audio-${Date.now()}.mp3`, { type: 'audio/mpeg' });
    
    const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({ file });

    // Update page with audio URL
    await base44.asServiceRole.entities.Page.update(pageId, {
      [audioField]: uploadResult.file_url
    });

    return Response.json({
      success: true,
      audioUrl: uploadResult.file_url,
      message: 'Audio generated and saved'
    });

  } catch (error) {
    console.error('Error generating audio:', error);
    return Response.json(
      { error: error.message || 'Failed to generate audio' },
      { status: 500 }
    );
  }
});