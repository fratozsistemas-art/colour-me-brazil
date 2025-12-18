import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

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

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
    }

    // Use Google Cloud Text-to-Speech API
    const languageCode = language === 'pt' ? 'pt-BR' : 'en-US';
    const voiceName = language === 'pt' 
      ? (voiceSettings?.voiceName || 'pt-BR-Standard-A')
      : (voiceSettings?.voiceName || 'en-US-Neural2-C');

    // Call Google Cloud TTS API
    const ttsResponse = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode,
            name: voiceName,
            ssmlGender: voiceSettings?.gender || 'NEUTRAL'
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: voiceSettings?.speed || 1.0,
            pitch: voiceSettings?.pitch || 0.0,
            volumeGainDb: voiceSettings?.volume || 0.0
          }
        })
      }
    );

    if (!ttsResponse.ok) {
      const errorData = await ttsResponse.json();
      throw new Error(errorData.error?.message || 'TTS API request failed');
    }

    const ttsData = await ttsResponse.json();
    const audioContent = ttsData.audioContent;

    if (!audioContent) {
      throw new Error('No audio content returned from TTS API');
    }

    // Convert base64 to blob
    const audioBlob = Uint8Array.from(atob(audioContent), c => c.charCodeAt(0));

    // Upload to Base44 storage
    const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({
      file: new Blob([audioBlob], { type: 'audio/mpeg' })
    });

    return Response.json({
      success: true,
      audioUrl: uploadResult.file_url,
      language: languageCode,
      voiceName
    });

  } catch (error) {
    console.error('Error generating speech:', error);
    return Response.json(
      { error: error.message || 'Failed to generate speech' },
      { status: 500 }
    );
  }
});