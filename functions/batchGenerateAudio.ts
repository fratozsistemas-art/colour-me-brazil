import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
    }

    const { bookId, language, forceRegenerate = false } = await req.json();

    // Get all pages for the book
    const filter = bookId ? { book_id: bookId } : {};
    const pages = await base44.asServiceRole.entities.Page.filter(filter);

    const results = [];
    const errors = [];

    for (const page of pages) {
      try {
        // Skip if no text for this language
        const text = language === 'pt' ? page.story_text_pt : page.story_text_en;
        if (!text) {
          results.push({ pageId: page.id, skipped: true, reason: 'No text' });
          continue;
        }

        // Check if audio already exists
        const audioField = language === 'pt' ? 'audio_narration_pt_url' : 'audio_narration_en_url';
        if (!forceRegenerate && page[audioField]) {
          results.push({ pageId: page.id, skipped: true, reason: 'Audio exists' });
          continue;
        }

        // Generate audio using the generateSpeechGemini function
        const audioResponse = await base44.asServiceRole.functions.invoke('generateSpeechGemini', {
          text,
          language,
          voiceSettings: {
            speed: 0.95,
            pitch: 0.0,
            volume: 0.0
          }
        });

        if (audioResponse.data?.success) {
          // Update the page with the audio URL
          await base44.asServiceRole.entities.Page.update(page.id, {
            [audioField]: audioResponse.data.audioUrl
          });

          results.push({
            pageId: page.id,
            success: true,
            audioUrl: audioResponse.data.audioUrl
          });
        } else {
          errors.push({
            pageId: page.id,
            error: audioResponse.data?.error || 'Failed to generate audio'
          });
        }

        // Rate limiting - wait 1 second between requests
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        errors.push({
          pageId: page.id,
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      totalPages: pages.length,
      generated: results.filter(r => r.success).length,
      skipped: results.filter(r => r.skipped).length,
      errors: errors.length,
      results,
      errors
    });

  } catch (error) {
    console.error('Error in batch generation:', error);
    return Response.json(
      { error: error.message || 'Failed to batch generate audio' },
      { status: 500 }
    );
  }
});