import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookId, bookTitle, bookTheme } = await req.json();

    if (!bookId || !bookTitle) {
      return Response.json({ error: 'bookId and bookTitle are required' }, { status: 400 });
    }

    // Generate watercolor cover image
    const prompt = `Beautiful watercolor illustration for children's book cover: "${bookTitle}". Brazilian folklore and Amazon rainforest theme. ${bookTheme || 'Mystical and magical atmosphere'}. Soft pastel watercolors, indigenous Brazilian art style, enchanting and child-friendly, detailed botanical and cultural elements, storybook illustration quality`;

    const result = await base44.integrations.Core.GenerateImage({
      prompt: prompt
    });

    // Update book with new cover image
    await base44.asServiceRole.entities.Book.update(bookId, {
      cover_image_url: result.url
    });

    return Response.json({
      success: true,
      imageUrl: result.url,
      bookId: bookId
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
});