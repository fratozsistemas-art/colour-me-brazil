import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Voice mappings for ElevenLabs
const VOICE_MAPPINGS = {
  'pt-BR': 'pNInz6obpgDQGcFmaJgB', // Adam (suitable for Portuguese)
  'en-US': '21m00Tcm4TlvDq8ikWAM', // Rachel (suitable for English)
  'Aoede': 'EXAVITQu4vr4xnSDxMaL', // Sarah (gentle)
  'Kore': 'jsCqWAovK2LkecY7zXl4' // Emily (child-friendly)
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, language = 'en', voiceName } = await req.json();

    if (!text) {
      return Response.json({ error: 'Text is required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'ElevenLabs API key not configured' }, { status: 500 });
    }

    // Select voice ID
    const voiceId = VOICE_MAPPINGS[voiceName] || 
                   (language === 'pt' ? VOICE_MAPPINGS['pt-BR'] : VOICE_MAPPINGS['en-US']);

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
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('ElevenLabs error:', error);
      return Response.json({ error: 'Failed to generate speech' }, { status: 500 });
    }

    const audioBuffer = await response.arrayBuffer();
    const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
    const file = new File([audioBlob], `speech-${Date.now()}.mp3`, { type: 'audio/mpeg' });
    
    const uploadResult = await base44.integrations.Core.UploadFile({ file });

    return Response.json({
      success: true,
      audio_url: uploadResult.file_url,
      voice: voiceName,
      language: language
    });

  } catch (error) {
    console.error('Error generating speech:', error);
    return Response.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
});