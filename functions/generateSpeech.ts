import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Expanded voice mappings for ElevenLabs
const VOICE_MAPPINGS = {
  // Default voices by language
  'default_en': '21m00Tcm4TlvDq8ikWAM', // Rachel - clear English
  'default_pt': 'pNInz6obpgDQGcFmaJgB', // Adam - Portuguese
  
  // Child-friendly voices
  'child_male': 'IKne3meq5aSn9XLyUdCD', // Charlie - energetic boy
  'child_female': 'jsCqWAovK2LkecY7zXl4', // Emily - cheerful girl
  
  // Gentle/soft voices
  'gentle': 'EXAVITQu4vr4xnSDxMaL', // Sarah - calm and soothing
  'soft': 'XrExE9yKIg1WjnnlVkGX', // Matilda - soft-spoken
  
  // Energetic voices
  'energetic': 'TxGEqnHWrfWFTfGW9XjX', // Josh - enthusiastic
  'excited': 'pFZP5JQG7iQjIQuC4Bku', // Lily - upbeat
  
  // Storytelling voices
  'storyteller': 'onwK4e9ZLuTAKqWW03F9', // Daniel - narrator style
  'dramatic': 'ThT5KcBeYPX3keUQqHPh', // Dorothy - expressive
  
  // Additional diverse voices
  'warm': 'ErXwobaYiN019PkySvjV', // Antoni - warm and friendly
  'professional': 'VR6AewLTigWG4xSOukaG', // Arnold - clear and professional
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      text, 
      language = 'en',
      voice_preference = 'default',
      custom_audio_url = null,
      page_id = null,
      save_to_page = false
    } = await req.json();

    // If custom audio URL is provided, return it directly
    if (custom_audio_url) {
      return Response.json({
        success: true,
        audio_url: custom_audio_url,
        source: 'custom',
        language: language
      });
    }

    if (!text) {
      return Response.json({ error: 'Text is required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'ElevenLabs API key not configured' }, { status: 500 });
    }

    // Select voice ID based on preference
    let voiceId;
    if (VOICE_MAPPINGS[voice_preference]) {
      voiceId = VOICE_MAPPINGS[voice_preference];
    } else {
      // Fallback to default based on language
      voiceId = language === 'pt' ? VOICE_MAPPINGS.default_pt : VOICE_MAPPINGS.default_en;
    }

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
    
    const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({ file });

    // If page_id is provided and save_to_page is true, update the page
    if (page_id && save_to_page) {
      const audioField = language === 'pt' ? 'audio_narration_pt_url' : 'audio_narration_en_url';
      await base44.asServiceRole.entities.Page.update(page_id, {
        [audioField]: uploadResult.file_url
      });
    }

    return Response.json({
      success: true,
      audio_url: uploadResult.file_url,
      voice_id: voiceId,
      voice_preference: voice_preference,
      language: language,
      source: 'elevenlabs'
    });

  } catch (error) {
    console.error('Error generating speech:', error);
    return Response.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
});