import React, { useState } from 'react';
import { BrowserRouter as Router, useInRouterContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Wand2, Image, CheckCircle2, Loader2 } from 'lucide-react';

function GenerateCoversContent() {
  const [generating, setGenerating] = useState({});
  const [completed, setCompleted] = useState({});
  const queryClient = useQueryClient();

  const { data: books = [] } = useQuery({
    queryKey: ['books'],
    queryFn: () => base44.entities.Book.list('order_index'),
  });

  const generateCover = async (book) => {
    setGenerating(prev => ({ ...prev, [book.id]: true }));
    
    try {
      // Determine theme based on book data
      let theme = '';
      if (book.cultural_tags?.includes('Folklore')) {
        theme = 'Brazilian folklore legend with mystical creatures and indigenous patterns';
      } else if (book.cultural_tags?.includes('Amazon')) {
        theme = 'Amazon rainforest setting with lush vegetation and wildlife';
      } else if (book.cultural_tags?.includes('Carnival')) {
        theme = 'Vibrant carnival celebration with colorful costumes and music';
      } else if (book.cultural_tags?.includes('Wildlife')) {
        theme = 'Brazilian wildlife and biodiversity in natural habitat';
      }

      const response = await base44.functions.invoke('generateBookCover', {
        bookId: book.id,
        bookTitle: book.title_en,
        bookTheme: theme
      });

      if (response.data.success) {
        setCompleted(prev => ({ ...prev, [book.id]: true }));
        queryClient.invalidateQueries(['books']);
        
        setTimeout(() => {
          setCompleted(prev => ({ ...prev, [book.id]: false }));
        }, 3000);
      }
    } catch (error) {
      console.error('Error generating cover:', error);
      alert('Failed to generate cover: ' + error.message);
    } finally {
      setGenerating(prev => ({ ...prev, [book.id]: false }));
    }
  };

  const generateAllAmazonCovers = async () => {
    const amazonBooks = books.filter(b => b.collection === 'amazon');
    
    for (const book of amazonBooks) {
      await generateCover(book);
      // Wait 2 seconds between generations to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#1A2332' }}>
          Generate Watercolor Book Covers
        </h1>
        <p className="text-gray-600">
          Create AI-generated watercolor covers for your books with Brazilian folklore themes
        </p>
      </div>

      <div className="mb-6">
        <Button
          onClick={generateAllAmazonCovers}
          className="bg-gradient-to-r from-green-600 to-blue-600 text-white"
        >
          <Wand2 className="w-4 h-4 mr-2" />
          Generate All Amazon Collection Covers
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map(book => (
          <Card key={book.id} className="p-4">
            <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
              {book.cover_image_url ? (
                <img
                  src={book.cover_image_url}
                  alt={book.title_en}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Image className="w-12 h-12" />
                </div>
              )}
            </div>

            <h3 className="font-bold text-lg mb-1">{book.title_en}</h3>
            <p className="text-sm text-gray-500 mb-2">{book.subtitle_en}</p>
            
            <div className="flex flex-wrap gap-1 mb-3">
              {book.cultural_tags?.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            <Button
              onClick={() => generateCover(book)}
              disabled={generating[book.id]}
              className="w-full"
              variant={completed[book.id] ? 'default' : 'outline'}
              style={completed[book.id] ? {
                background: 'linear-gradient(135deg, #06A77D 0%, #2E86AB 100%)',
                color: '#FFFFFF'
              } : {}}
            >
              {generating[book.id] ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : completed[book.id] ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Generated!
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate Watercolor Cover
                </>
              )}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function GenerateCovers() {
  const inRouter = useInRouterContext();

  if (inRouter) {
    return <GenerateCoversContent />;
  }

  return (
    <Router>
      <GenerateCoversContent />
    </Router>
  );
}
