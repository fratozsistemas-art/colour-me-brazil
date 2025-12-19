import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Save, BookOpen, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function CuratorContentCreation({ user }) {
  const queryClient = useQueryClient();
  const [creationType, setCreationType] = useState('book');
  const [bookData, setBookData] = useState({
    title_en: '',
    title_pt: '',
    subtitle_en: '',
    subtitle_pt: '',
    author: user?.full_name || '',
    collection: 'culture',
    cover_image_url: '',
    cultural_tags: [],
    age_recommendation: '6-12 years',
    is_locked: false,
    page_count: 12,
    order_index: 0
  });

  const [pageData, setPageData] = useState({
    book_id: '',
    page_number: 1,
    page_type: 'story',
    illustration_url: '',
    story_text_en: '',
    story_text_pt: '',
    cultural_fact_en: '',
    cultural_fact_pt: ''
  });

  const createBookMutation = useMutation({
    mutationFn: (data) => base44.entities.Book.create(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries(['books']);
      toast.success('Book created successfully!');
      setBookData({
        title_en: '',
        title_pt: '',
        subtitle_en: '',
        subtitle_pt: '',
        author: user?.full_name || '',
        collection: 'culture',
        cover_image_url: '',
        cultural_tags: [],
        age_recommendation: '6-12 years',
        is_locked: false,
        page_count: 12,
        order_index: 0
      });
      setPageData({ ...pageData, book_id: result.id });
    },
    onError: (error) => {
      toast.error('Failed to create book: ' + error.message);
    }
  });

  const createPageMutation = useMutation({
    mutationFn: (data) => base44.entities.Page.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['pages']);
      toast.success('Page created successfully!');
      setPageData({
        ...pageData,
        page_number: pageData.page_number + 1,
        illustration_url: '',
        story_text_en: '',
        story_text_pt: '',
        cultural_fact_en: '',
        cultural_fact_pt: ''
      });
    },
    onError: (error) => {
      toast.error('Failed to create page: ' + error.message);
    }
  });

  const handleCreateBook = () => {
    if (!bookData.title_en || !bookData.title_pt) {
      toast.error('Please fill in both English and Portuguese titles');
      return;
    }
    createBookMutation.mutate(bookData);
  };

  const handleCreatePage = () => {
    if (!pageData.book_id) {
      toast.error('Please select a book first');
      return;
    }
    if (!pageData.story_text_en || !pageData.story_text_pt) {
      toast.error('Please fill in story text in both languages');
      return;
    }
    createPageMutation.mutate(pageData);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant={creationType === 'book' ? 'default' : 'outline'}
            onClick={() => setCreationType('book')}
            className="flex-1"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Create Book
          </Button>
          <Button
            variant={creationType === 'page' ? 'default' : 'outline'}
            onClick={() => setCreationType('page')}
            className="flex-1"
          >
            <FileText className="w-4 h-4 mr-2" />
            Add Page
          </Button>
        </div>

        {creationType === 'book' ? (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Create New Book</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Title (English)*</Label>
                <Input
                  value={bookData.title_en}
                  onChange={(e) => setBookData({ ...bookData, title_en: e.target.value })}
                  placeholder="Enter English title"
                />
              </div>
              <div>
                <Label>Title (Portuguese)*</Label>
                <Input
                  value={bookData.title_pt}
                  onChange={(e) => setBookData({ ...bookData, title_pt: e.target.value })}
                  placeholder="Digite o título em português"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Subtitle (English)</Label>
                <Input
                  value={bookData.subtitle_en}
                  onChange={(e) => setBookData({ ...bookData, subtitle_en: e.target.value })}
                  placeholder="Enter subtitle"
                />
              </div>
              <div>
                <Label>Subtitle (Portuguese)</Label>
                <Input
                  value={bookData.subtitle_pt}
                  onChange={(e) => setBookData({ ...bookData, subtitle_pt: e.target.value })}
                  placeholder="Digite o subtítulo"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Author</Label>
                <Input
                  value={bookData.author}
                  onChange={(e) => setBookData({ ...bookData, author: e.target.value })}
                />
              </div>
              <div>
                <Label>Collection</Label>
                <Select
                  value={bookData.collection}
                  onValueChange={(value) => setBookData({ ...bookData, collection: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amazon">🌿 Amazon</SelectItem>
                    <SelectItem value="culture">🎨 Culture</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Cover Image URL</Label>
              <Input
                value={bookData.cover_image_url}
                onChange={(e) => setBookData({ ...bookData, cover_image_url: e.target.value })}
                placeholder="https://example.com/cover.jpg"
              />
            </div>

            <div>
              <Label>Cultural Tags (comma-separated)</Label>
              <Input
                value={bookData.cultural_tags.join(', ')}
                onChange={(e) => setBookData({ 
                  ...bookData, 
                  cultural_tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                })}
                placeholder="Folklore, Music, Dance"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={bookData.is_locked}
                  onChange={(e) => setBookData({ ...bookData, is_locked: e.target.checked })}
                  className="rounded"
                />
                <Label>Requires Purchase</Label>
              </div>
            </div>

            <Button
              onClick={handleCreateBook}
              disabled={createBookMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {createBookMutation.isPending ? 'Creating...' : 'Create Book'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Add Page to Book</h3>

            <div>
              <Label>Book ID*</Label>
              <Input
                value={pageData.book_id}
                onChange={(e) => setPageData({ ...pageData, book_id: e.target.value })}
                placeholder="Enter book ID"
              />
              <p className="text-xs text-gray-500 mt-1">
                Create a book first to get its ID
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Page Number</Label>
                <Input
                  type="number"
                  value={pageData.page_number}
                  onChange={(e) => setPageData({ ...pageData, page_number: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Page Type</Label>
                <Select
                  value={pageData.page_type}
                  onValueChange={(value) => setPageData({ ...pageData, page_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="story">Story</SelectItem>
                    <SelectItem value="coloring">Coloring</SelectItem>
                    <SelectItem value="about">About</SelectItem>
                    <SelectItem value="cover">Cover</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Illustration URL</Label>
              <Input
                value={pageData.illustration_url}
                onChange={(e) => setPageData({ ...pageData, illustration_url: e.target.value })}
                placeholder="https://example.com/illustration.png"
              />
            </div>

            <div>
              <Label>Story Text (English)*</Label>
              <Textarea
                value={pageData.story_text_en}
                onChange={(e) => setPageData({ ...pageData, story_text_en: e.target.value })}
                placeholder="Enter the story text in English..."
                className="h-32"
              />
            </div>

            <div>
              <Label>Story Text (Portuguese)*</Label>
              <Textarea
                value={pageData.story_text_pt}
                onChange={(e) => setPageData({ ...pageData, story_text_pt: e.target.value })}
                placeholder="Digite o texto da história em português..."
                className="h-32"
              />
            </div>

            <div>
              <Label>Cultural Fact (English)</Label>
              <Textarea
                value={pageData.cultural_fact_en}
                onChange={(e) => setPageData({ ...pageData, cultural_fact_en: e.target.value })}
                placeholder="Add a cultural fact in English..."
              />
            </div>

            <div>
              <Label>Cultural Fact (Portuguese)</Label>
              <Textarea
                value={pageData.cultural_fact_pt}
                onChange={(e) => setPageData({ ...pageData, cultural_fact_pt: e.target.value })}
                placeholder="Adicione um fato cultural em português..."
              />
            </div>

            <Button
              onClick={handleCreatePage}
              disabled={createPageMutation.isPending}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              {createPageMutation.isPending ? 'Adding...' : 'Add Page'}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}