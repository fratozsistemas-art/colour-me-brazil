import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify authentication
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, language = 'en', voiceName } = await req.json();

    if (!text) {
      return Response.json({ error: 'Text is required' }, { status: 400 });
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      return Response.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
    }

    // Select voice based on language
    const defaultVoice = language === 'pt' ? 'Aoede' : 'Kore';
    const selectedVoice = voiceName || defaultVoice;

    // Call Gemini API for TTS
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: text
            }]
          }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: selectedVoice
                }
              }
            }
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.text();
      console.error('Gemini API error:', errorData);
      return Response.json({ 
        error: 'Failed to generate speech',
        details: errorData 
      }, { status: geminiResponse.status });
    }

    const geminiData = await geminiResponse.json();
    
    // Extract audio data from response
    const audioData = geminiData.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!audioData) {
      return Response.json({ error: 'No audio data in response' }, { status: 500 });
    }

    // Convert base64 to blob
    const audioBuffer = Uint8Array.from(atob(audioData), c => c.charCodeAt(0));
    const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
    
    // Upload to Base44 storage
    const formData = new FormData();
    formData.append('file', audioBlob, `narration_${Date.now()}.wav`);
    
    const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({
      file: audioBlob
    });

    return Response.json({
      success: true,
      audio_url: uploadResult.file_url,
      voice: selectedVoice,
      language: language
    });

  } catch (error) {
    console.error('Error generating speech:', error);
    return Response.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
});