import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Voice mappings for ElevenLabs
const VOICE_MAPPINGS = {
  default: 'pNInz6obpgDQGcFmaJgB', // Adam
  child_male: 'IKne3meq5aSn9XLyUdCD', // Charlie
  child_female: 'jsCqWAovK2LkecY7zXl4', // Emily
  gentle: 'EXAVITQu4vr4xnSDxMaL', // Sarah
  energetic: 'TxGEqnHWrfWFTfGW9XjX' // Josh
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, language = 'pt', voice_preference = 'default', speed = 1.0 } = await req.json();

    if (!text) {
      return Response.json({ error: 'Text is required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'ElevenLabs API key not configured' }, { status: 500 });
    }

    // Select voice ID based on preference
    const voiceId = VOICE_MAPPINGS[voice_preference] || VOICE_MAPPINGS.default;

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

    // Get audio data
    const audioBuffer = await response.arrayBuffer();
    
    // Upload to Base44 storage
    const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
    const file = new File([audioBlob], `tts-${Date.now()}.mp3`, { type: 'audio/mpeg' });
    
    const uploadResponse = await base44.integrations.Core.UploadFile({
      file: file
    });

    return Response.json({
      success: true,
      audio_url: uploadResponse.file_url,
      voice_used: voice_preference,
      speed
    });

  } catch (error) {
    console.error('TTS generation error:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
});