import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { jsPDF } from 'npm:jspdf@2.5.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { book_id, language = 'en' } = await req.json();

    if (!book_id) {
      return Response.json({ error: 'book_id is required' }, { status: 400 });
    }

    // Fetch book and all pages (including print_only pages)
    const books = await base44.entities.Book.filter({ id: book_id });
    if (books.length === 0) {
      return Response.json({ error: 'Book not found' }, { status: 404 });
    }
    
    const book = books[0];
    const pages = await base44.entities.Page.filter({ book_id });
    const sortedPages = pages.sort((a, b) => a.page_number - b.page_number);

    // Create PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    let isFirstPage = true;

    for (const page of sortedPages) {
      if (!isFirstPage) {
        doc.addPage();
      }
      isFirstPage = false;

      // Add page number footer
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${page.page_number}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

      // Add page content based on type
      if (page.page_type === 'cover') {
        // Cover page
        doc.setFontSize(24);
        doc.setTextColor(0);
        const title = language === 'en' ? book.title_en : book.title_pt;
        doc.text(title, pageWidth / 2, 80, { align: 'center', maxWidth: contentWidth });
        
        if (book.subtitle_en || book.subtitle_pt) {
          doc.setFontSize(14);
          doc.setTextColor(100);
          const subtitle = language === 'en' ? book.subtitle_en : book.subtitle_pt;
          doc.text(subtitle || '', pageWidth / 2, 100, { align: 'center', maxWidth: contentWidth });
        }
      } else if (page.illustration_url && page.page_type === 'coloring') {
        // Coloring page - add image
        try {
          const imgResponse = await fetch(page.illustration_url);
          const imgBlob = await imgResponse.blob();
          const imgBuffer = await imgBlob.arrayBuffer();
          const base64 = btoa(String.fromCharCode(...new Uint8Array(imgBuffer)));
          const imgFormat = page.illustration_url.toLowerCase().endsWith('.png') ? 'PNG' : 'JPEG';
          
          // Add image centered on page
          const imgWidth = contentWidth;
          const imgHeight = contentWidth; // Square aspect ratio
          const x = margin;
          const y = (pageHeight - imgHeight) / 2;
          
          doc.addImage(`data:image/${imgFormat.toLowerCase()};base64,${base64}`, imgFormat, x, y, imgWidth, imgHeight);
        } catch (error) {
          console.error('Error adding image:', error);
          doc.setFontSize(12);
          doc.text('Illustration unavailable', pageWidth / 2, pageHeight / 2, { align: 'center' });
        }
      } else {
        // Text page (story, about, credits)
        const text = language === 'en' ? page.story_text_en : page.story_text_pt;
        if (text) {
          doc.setFontSize(11);
          doc.setTextColor(0);
          const lines = doc.splitTextToSize(text, contentWidth);
          doc.text(lines, margin, margin + 10);
        }
      }
    }

    // Generate PDF as ArrayBuffer
    const pdfBytes = doc.output('arraybuffer');
    const bookTitle = language === 'en' ? book.title_en : book.title_pt;
    const filename = `${bookTitle.replace(/[^a-z0-9]/gi, '_')}_Printable.pdf`;

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    console.error('Error generating printable book:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});