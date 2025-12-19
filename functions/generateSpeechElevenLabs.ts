import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, language = 'en', voice_id } = await req.json();

    if (!text) {
      return Response.json({ error: 'Text is required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'ElevenLabs API key not configured' }, { status: 500 });
    }

    // Select voice based on language
    // Rachel (English) - 21m00Tcm4TlvDq8ikWAM
    // Matilda (Portuguese) - XrExE9yKIg1WjnnlVkGX
    const defaultVoiceId = voice_id || (language === 'pt' ? 'XrExE9yKIg1WjnnlVkGX' : '21m00Tcm4TlvDq8ikWAM');

    // Call ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${defaultVoiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', errorText);
      return Response.json({ 
        error: 'Failed to generate speech',
        details: errorText 
      }, { status: response.status });
    }

    // Get audio as array buffer
    const audioBuffer = await response.arrayBuffer();
    const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });

    // Create a File object from the blob
    const audioFile = new File([audioBlob], 'speech.mp3', { type: 'audio/mpeg' });

    // Upload to Base44 storage
    const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({
      file: audioFile
    });

    return Response.json({
      audio_url: uploadResult.file_url,
      voice_id: defaultVoiceId,
      language: language
    });

  } catch (error) {
    console.error('Error generating speech:', error);
    return Response.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
});