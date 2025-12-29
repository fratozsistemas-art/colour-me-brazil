import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { jsPDF } from 'npm:jspdf@2.5.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookId, profileId } = await req.json();

    if (!bookId || !profileId) {
      return Response.json({ error: 'Missing bookId or profileId' }, { status: 400 });
    }

    // Fetch custom book
    const books = await base44.asServiceRole.entities.CustomBook.filter({ id: bookId });
    if (books.length === 0) {
      return Response.json({ error: 'Book not found' }, { status: 404 });
    }

    const customBook = books[0];

    // Verify ownership
    if (customBook.profile_id !== profileId) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Create PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Cover page
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text(customBook.title, 105, 100, { align: 'center' });

    if (customBook.description) {
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      const descLines = doc.splitTextToSize(customBook.description, 160);
      doc.text(descLines, 105, 120, { align: 'center' });
    }

    doc.setFontSize(10);
    doc.text('Created with Colour Me Brazil', 105, 280, { align: 'center' });

    // Fetch all content
    const allBooks = await base44.asServiceRole.entities.Book.list();
    const allArtworks = await base44.asServiceRole.entities.ColoredArtwork.filter({ 
      profile_id: profileId 
    });

    // Add pages
    for (let i = 0; i < customBook.pages.length; i++) {
      const page = customBook.pages[i];
      doc.addPage();

      // Page number
      doc.setFontSize(10);
      doc.text(`Page ${i + 1}`, 105, 287, { align: 'center' });

      if (page.type === 'text') {
        // Text page
        doc.setFontSize(12);
        const lines = doc.splitTextToSize(page.custom_text, 170);
        doc.text(lines, 20, 40);
      } else if (page.type === 'story') {
        // Story page
        const book = allBooks.find(b => b.id === page.content_id);
        if (book) {
          doc.setFontSize(18);
          doc.setFont(undefined, 'bold');
          doc.text(book.title_en, 105, 40, { align: 'center' });
          
          if (book.subtitle_en) {
            doc.setFontSize(12);
            doc.setFont(undefined, 'normal');
            doc.text(book.subtitle_en, 105, 50, { align: 'center' });
          }

          // Try to add book cover if available
          if (book.cover_image_url) {
            try {
              const imgResponse = await fetch(book.cover_image_url);
              if (imgResponse.ok) {
                const imgBlob = await imgResponse.blob();
                const arrayBuffer = await imgBlob.arrayBuffer();
                const uint8Array = new Uint8Array(arrayBuffer);
                
                let binary = '';
                const len = uint8Array.byteLength;
                for (let i = 0; i < len; i++) {
                  binary += String.fromCharCode(uint8Array[i]);
                }
                const base64 = btoa(binary);
                const imgData = `data:image/png;base64,${base64}`;
                
                doc.addImage(imgData, 'PNG', 55, 70, 100, 100);
              }
            } catch (error) {
              console.error('Error adding book cover:', error);
            }
          }
        }
      } else if (page.type === 'coloring' || page.type === 'artwork') {
        // Artwork page
        const artwork = allArtworks.find(a => a.id === page.content_id);
        if (artwork) {
          try {
            // Fetch image and convert to base64
            const imgResponse = await fetch(artwork.artwork_url);
            if (!imgResponse.ok) throw new Error('Failed to fetch image');
            
            const imgBlob = await imgResponse.blob();
            const arrayBuffer = await imgBlob.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            
            // Convert to base64 more efficiently
            let binary = '';
            const len = uint8Array.byteLength;
            for (let i = 0; i < len; i++) {
              binary += String.fromCharCode(uint8Array[i]);
            }
            const base64 = btoa(binary);
            const imgData = `data:image/png;base64,${base64}`;

            // Calculate dimensions to fit page while maintaining aspect ratio
            const maxWidth = 170;
            const maxHeight = 220;
            
            // Add image to PDF centered
            doc.addImage(imgData, 'PNG', 20, 30, maxWidth, maxHeight);
          } catch (error) {
            console.error('Error adding image:', error);
            doc.setFontSize(10);
            doc.text('[Artwork - Failed to load image]', 105, 140, { align: 'center' });
          }
        }
      }
    }

    // Generate PDF
    const pdfBytes = doc.output('arraybuffer');
    const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

    // Upload PDF to storage
    const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({
      file: pdfBlob
    });

    return Response.json({
      success: true,
      pdf_url: uploadResult.file_url
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return Response.json({ 
      error: 'Failed to generate PDF',
      details: error.message 
    }, { status: 500 });
  }
});