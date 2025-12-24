import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Voice mappings for ElevenLabs (child-friendly voices)
const VOICE_MAPPINGS = {
  'pt-BR-Standard-A': 'pNInz6obpgDQGcFmaJgB', // Adam
  'pt-BR-Standard-B': 'EXAVITQu4vr4xnSDxMaL', // Sarah
  'en-US-Neural2-C': 'jsCqWAovK2LkecY7zXl4', // Emily (child-female)
  'en-US-Neural2-D': 'IKne3meq5aSn9XLyUdCD', // Charlie (child-male)
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
    }

    const { text, language = 'en', voiceSettings } = await req.json();

    if (!text) {
      return Response.json({ error: 'text is required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!apiKey) {
      return Response.json({ 
        success: false,
        error: 'ELEVENLABS_API_KEY not configured. Please set it in the dashboard.' 
      }, { status: 200 });
    }

    const languageCode = language === 'pt' ? 'pt-BR' : 'en-US';
    const requestedVoice = language === 'pt' 
      ? (voiceSettings?.voiceName || 'pt-BR-Standard-A')
      : (voiceSettings?.voiceName || 'en-US-Neural2-C');
    
    const voiceId = VOICE_MAPPINGS[requestedVoice] || VOICE_MAPPINGS['en-US-Neural2-C'];

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
            stability: voiceSettings?.stability || 0.5,
            similarity_boost: voiceSettings?.similarity_boost || 0.75,
            style: 0.5,
            use_speaker_boost: voiceSettings?.use_speaker_boost || true
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', errorText);
      return Response.json({
        success: false,
        error: `ElevenLabs error (${response.status}): Failed to generate speech`,
        details: errorText
      }, { status: 200 });
    }

    const audioBuffer = await response.arrayBuffer();
    const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
    const file = new File([audioBlob], `speech-${Date.now()}.mp3`, { type: 'audio/mpeg' });

    const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({
      file
    });

    return Response.json({
      success: true,
      audio_url: uploadResult.file_url,
      language: languageCode,
      voiceName: requestedVoice
    });

  } catch (error) {
    console.error('Error generating speech:', error);
    return Response.json({
      success: false,
      error: error.message || 'Failed to generate speech',
      stack: error.stack
    }, { status: 200 });
  }
});