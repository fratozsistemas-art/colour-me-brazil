import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Palette, Sparkles, Type } from 'lucide-react';

export default function ContentSelector({ profileId, onSelect, onClose }) {
  const [customText, setCustomText] = useState('');

  const { data: books = [] } = useQuery({
    queryKey: ['books'],
    queryFn: () => base44.entities.Book.list()
  });

  const { data: coloredArtworks = [] } = useQuery({
    queryKey: ['colored-artworks', profileId],
    queryFn: () => base44.entities.ColoredArtwork.filter({ profile_id: profileId }),
    enabled: !!profileId
  });

  const { data: aiArtworks = [] } = useQuery({
    queryKey: ['ai-artworks', profileId],
    queryFn: () => base44.entities.ColoredArtwork.filter({ 
      profile_id: profileId,
      is_ai_generated: true 
    }),
    enabled: !!profileId
  });

  const handleSelectStory = (book) => {
    onSelect({
      type: 'story',
      id: book.id,
      title: book.title_en,
      preview: book.cover_image_url
    });
  };

  const handleSelectArtwork = (artwork) => {
    onSelect({
      type: artwork.is_ai_generated ? 'artwork' : 'coloring',
      id: artwork.id,
      preview: artwork.artwork_url
    });
  };

  const handleAddCustomText = () => {
    if (!customText.trim()) return;
    onSelect({
      type: 'text',
      id: `text-${Date.now()}`,
      custom_text: customText
    });
    setCustomText('');
  };

  return (
    <Tabs defaultValue="stories" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="stories" className="gap-2">
          <BookOpen className="w-4 h-4" />
          Stories
        </TabsTrigger>
        <TabsTrigger value="coloring" className="gap-2">
          <Palette className="w-4 h-4" />
          Coloring
        </TabsTrigger>
        <TabsTrigger value="ai-art" className="gap-2">
          <Sparkles className="w-4 h-4" />
          AI Art
        </TabsTrigger>
        <TabsTrigger value="text" className="gap-2">
          <Type className="w-4 h-4" />
          Text
        </TabsTrigger>
      </TabsList>

      <TabsContent value="stories" className="mt-4">
        <div className="grid grid-cols-3 gap-4 max-h-[400px] overflow-y-auto">
          {books.map((book) => (
            <Card
              key={book.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleSelectStory(book)}
            >
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {book.cover_image_url ? (
                  <img src={book.cover_image_url} alt={book.title_en} className="w-full h-full object-cover" />
                ) : (
                  <BookOpen className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium line-clamp-2">{book.title_en}</p>
              </div>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="coloring" className="mt-4">
        <div className="grid grid-cols-3 gap-4 max-h-[400px] overflow-y-auto">
          {coloredArtworks.filter(a => !a.is_ai_generated).map((artwork) => (
            <Card
              key={artwork.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleSelectArtwork(artwork)}
            >
              <div className="aspect-square">
                <img src={artwork.artwork_url} alt="Colored artwork" className="w-full h-full object-cover" />
              </div>
            </Card>
          ))}
          {coloredArtworks.filter(a => !a.is_ai_generated).length === 0 && (
            <div className="col-span-3 text-center py-8 text-gray-500">
              No colored artworks yet
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="ai-art" className="mt-4">
        <div className="grid grid-cols-3 gap-4 max-h-[400px] overflow-y-auto">
          {aiArtworks.map((artwork) => (
            <Card
              key={artwork.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleSelectArtwork(artwork)}
            >
              <div className="aspect-square">
                <img src={artwork.artwork_url} alt="AI artwork" className="w-full h-full object-cover" />
              </div>
            </Card>
          ))}
          {aiArtworks.length === 0 && (
            <div className="col-span-3 text-center py-8 text-gray-500">
              No AI artworks yet
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="text" className="mt-4">
        <div className="space-y-4">
          <Textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Write your own text for this page..."
            rows={6}
          />
          <Button onClick={handleAddCustomText} disabled={!customText.trim()}>
            Add Text Page
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
}