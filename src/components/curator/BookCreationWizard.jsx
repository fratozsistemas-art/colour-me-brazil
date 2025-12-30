import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Upload, BookOpen, Palette, Volume2, 
  Eye, ChevronRight, ChevronLeft, CheckCircle2, X 
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import BatchPageUploader from './BatchPageUploader';
import RichTextEditor from './RichTextEditor';
import AudioSelector from './AudioSelector';

export default function BookCreationWizard({ onComplete, onCancel }) {
  const [step, setStep] = useState(1);
  const [bookData, setBookData] = useState({
    title_en: '',
    title_pt: '',
    subtitle_en: '',
    subtitle_pt: '',
    author: '',
    collection: 'culture',
    cover_image_url: '',
    cultural_tags: [],
    age_recommendation: '6-12 years',
    status: 'draft',
    is_locked: false,
    page_count: 12,
    order_index: 0
  });
  const [pages, setPages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingPageIndex, setEditingPageIndex] = useState(null);

  const culturalTagOptions = [
    'Folclore', 'Amazônia', 'Carnaval', 'Capoeira', 'Samba',
    'Natureza', 'Animais', 'Lendas', 'Festas', 'Arte', 'Música'
  ];

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setBookData(prev => ({ ...prev, cover_image_url: result.file_url }));
      toast.success('Capa enviada com sucesso!');
    } catch (error) {
      toast.error('Erro ao enviar capa');
    } finally {
      setUploading(false);
    }
  };

  const handleBatchUpload = (uploadedPages) => {
    const newPages = uploadedPages.map(up => ({
      page_number: up.pageNumber,
      illustration_url: up.illustrationUrl,
      story_text_en: up.storyText || '',
      story_text_pt: '',
      page_type: 'story',
      audio_narration_en_url: '',
      audio_narration_pt_url: ''
    }));

    setPages(prev => {
      const combined = [...prev, ...newPages];
      return combined.sort((a, b) => a.page_number - b.page_number);
    });

    setBookData(prev => ({
      ...prev,
      page_count: Math.max(prev.page_count, pages.length + newPages.length)
    }));

    toast.success(`${newPages.length} páginas adicionadas!`);
  };

  const updatePage = (index, field, value) => {
    setPages(prev => prev.map((page, i) => 
      i === index ? { ...page, [field]: value } : page
    ));
  };

  const removePage = (index) => {
    setPages(prev => prev.filter((_, i) => i !== index));
  };

  const handlePublish = async (isDraft = false) => {
    setSaving(true);
    try {
      // Create book
      const createdBook = await base44.entities.Book.create({
        ...bookData,
        status: isDraft ? 'draft' : 'published',
        page_count: pages.length
      });

      // Create pages
      for (const page of pages) {
        await base44.entities.Page.create({
          ...page,
          book_id: createdBook.id
        });
      }

      toast.success(isDraft ? '💾 Rascunho salvo!' : '🚀 Livro publicado com sucesso!');
      onComplete && onComplete(createdBook);
    } catch (error) {
      console.error('Error publishing book:', error);
      toast.error('Erro ao publicar livro: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                step >= s 
                  ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white' 
                  : 'bg-gray-200 text-gray-400'
              }`}>
                {step > s ? <CheckCircle2 className="w-6 h-6" /> : s}
              </div>
              {s < 5 && (
                <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-blue-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-600 px-1">
          <span>Info</span>
          <span>Config</span>
          <span>Upload</span>
          <span>Editar</span>
          <span>Preview</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="p-6 space-y-4">
              <h2 className="text-2xl font-bold mb-4">📖 Informações Básicas</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Título (Inglês) *</label>
                  <Input
                    value={bookData.title_en}
                    onChange={(e) => setBookData({ ...bookData, title_en: e.target.value })}
                    placeholder="The Amazon Adventure"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Título (Português) *</label>
                  <Input
                    value={bookData.title_pt}
                    onChange={(e) => setBookData({ ...bookData, title_pt: e.target.value })}
                    placeholder="A Aventura na Amazônia"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Subtítulo (Inglês)</label>
                  <Input
                    value={bookData.subtitle_en}
                    onChange={(e) => setBookData({ ...bookData, subtitle_en: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Subtítulo (Português)</label>
                  <Input
                    value={bookData.subtitle_pt}
                    onChange={(e) => setBookData({ ...bookData, subtitle_pt: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Autor</label>
                <Input
                  value={bookData.author}
                  onChange={(e) => setBookData({ ...bookData, author: e.target.value })}
                  placeholder="Nome do autor"
                />
              </div>

              {/* Cover Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Capa do Livro *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  {bookData.cover_image_url ? (
                    <div className="relative">
                      <img 
                        src={bookData.cover_image_url} 
                        alt="Book cover" 
                        className="max-h-64 mx-auto rounded-lg shadow-lg"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setBookData({ ...bookData, cover_image_url: '' })}
                        className="mt-3"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remover
                      </Button>
                    </div>
                  ) : (
                    <>
                      <input
                        type="file"
                        id="cover-upload"
                        accept="image/*"
                        onChange={handleCoverUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                      <label htmlFor="cover-upload" className="cursor-pointer">
                        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                        <p className="font-semibold">
                          {uploading ? 'Enviando...' : 'Clique para enviar capa'}
                        </p>
                        <p className="text-sm text-gray-500">PNG ou JPG</p>
                      </label>
                    </>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Settings */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="p-6 space-y-4">
              <h2 className="text-2xl font-bold mb-4">⚙️ Configurações</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Coleção *</label>
                  <Select
                    value={bookData.collection}
                    onValueChange={(value) => setBookData({ ...bookData, collection: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="amazon">🌿 Amazônia</SelectItem>
                      <SelectItem value="culture">🎨 Cultura</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Faixa Etária</label>
                  <Select
                    value={bookData.age_recommendation}
                    onValueChange={(value) => setBookData({ ...bookData, age_recommendation: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3-5 years">3-5 anos</SelectItem>
                      <SelectItem value="6-8 years">6-8 anos</SelectItem>
                      <SelectItem value="9-12 years">9-12 anos</SelectItem>
                      <SelectItem value="6-12 years">6-12 anos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tags Culturais</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {culturalTagOptions.map((tag) => (
                    <Badge
                      key={tag}
                      variant={bookData.cultural_tags.includes(tag) ? 'default' : 'outline'}
                      className="cursor-pointer hover:bg-blue-100"
                      onClick={() => {
                        setBookData(prev => ({
                          ...prev,
                          cultural_tags: prev.cultural_tags.includes(tag)
                            ? prev.cultural_tags.filter(t => t !== tag)
                            : [...prev.cultural_tags, tag]
                        }));
                      }}
                    >
                      {tag}
                      {bookData.cultural_tags.includes(tag) && ' ✓'}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <input
                  type="checkbox"
                  id="locked"
                  checked={bookData.is_locked}
                  onChange={(e) => setBookData({ ...bookData, is_locked: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="locked" className="text-sm font-medium">
                  🔒 Livro requer compra (Premium)
                </label>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Batch Upload */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">⬆️ Upload em Lote</h2>
              <p className="text-gray-600 mb-6">
                Arraste múltiplas imagens para criar páginas rapidamente
              </p>

              <BatchPageUploader onPagesUploaded={handleBatchUpload} />

              {pages.length > 0 && (
                <Card className="p-4 bg-green-50 border-green-200 mt-4">
                  <p className="text-sm text-green-800">
                    ✓ {pages.length} páginas carregadas. Continue para editar.
                  </p>
                </Card>
              )}
            </Card>
          </motion.div>
        )}

        {/* Step 4: Edit Pages */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">✏️ Editar Páginas</h2>

              {pages.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Volte e adicione páginas primeiro</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pages.map((page, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        {page.illustration_url && (
                          <img
                            src={page.illustration_url}
                            alt={`Page ${page.page_number}`}
                            className="w-24 h-24 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span className="font-semibold">Página {page.page_number}</span>
                              <Badge className="ml-2">{page.page_type}</Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant={editingPageIndex === index ? 'default' : 'outline'}
                                onClick={() => setEditingPageIndex(editingPageIndex === index ? null : index)}
                              >
                                {editingPageIndex === index ? 'Minimizar' : 'Editar'}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removePage(index)}
                              >
                                <X className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {editingPageIndex === index && (
                        <div className="space-y-4 pt-4 border-t">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Texto (Inglês)</label>
                              <RichTextEditor
                                value={page.story_text_en || ''}
                                onChange={(value) => updatePage(index, 'story_text_en', value)}
                                language="en"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Texto (Português)</label>
                              <RichTextEditor
                                value={page.story_text_pt || ''}
                                onChange={(value) => updatePage(index, 'story_text_pt', value)}
                                language="pt"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Áudio (EN)</label>
                              <AudioSelector
                                selectedAudioUrl={page.audio_narration_en_url || ''}
                                onAudioSelected={(url) => updatePage(index, 'audio_narration_en_url', url)}
                                language="en"
                                audioType="narration"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Áudio (PT)</label>
                              <AudioSelector
                                selectedAudioUrl={page.audio_narration_pt_url || ''}
                                onAudioSelected={(url) => updatePage(index, 'audio_narration_pt_url', url)}
                                language="pt"
                                audioType="narration"
                              />
                            </div>
                          </div>

                          <Select
                            value={page.page_type}
                            onValueChange={(value) => updatePage(index, 'page_type', value)}
                          >
                            <SelectTrigger className="w-[200px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="story">📖 História</SelectItem>
                              <SelectItem value="coloring">🎨 Colorir</SelectItem>
                              <SelectItem value="about">ℹ️ Sobre</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* Step 5: Preview */}
        {step === 5 && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Eye className="w-6 h-6 text-purple-500" />
                Pré-visualização
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  {bookData.cover_image_url && (
                    <img 
                      src={bookData.cover_image_url} 
                      alt="Book cover" 
                      className="w-full rounded-lg shadow-lg mb-4"
                    />
                  )}
                  <h3 className="text-2xl font-bold mb-2">{bookData.title_pt}</h3>
                  <p className="text-gray-600 mb-1">{bookData.subtitle_pt}</p>
                  {bookData.author && (
                    <p className="text-sm text-gray-500 mb-3">Por {bookData.author}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge>{bookData.collection === 'amazon' ? '🌿 Amazônia' : '🎨 Cultura'}</Badge>
                    <Badge variant="outline">{bookData.age_recommendation}</Badge>
                    {bookData.is_locked && <Badge variant="secondary">🔒 Premium</Badge>}
                    <Badge variant="outline">{pages.length} páginas</Badge>
                  </div>

                  {bookData.cultural_tags.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Tags:</p>
                      <div className="flex flex-wrap gap-1">
                        {bookData.cultural_tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Páginas ({pages.length})</h4>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {pages.map((page, idx) => (
                      <Card key={idx} className="p-3">
                        <div className="flex items-start gap-3">
                          {page.illustration_url && (
                            <img 
                              src={page.illustration_url} 
                              alt={`Page ${page.page_number}`}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold">Pág. {page.page_number}</span>
                              <Badge variant="outline" className="text-xs">{page.page_type}</Badge>
                            </div>
                            <div 
                              className="text-xs text-gray-600 line-clamp-2 prose-sm"
                              dangerouslySetInnerHTML={{ __html: page.story_text_pt || page.story_text_en || 'Sem texto' }}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>

              {/* Publish Buttons */}
              <div className="mt-6 pt-6 border-t space-y-3">
                <Button
                  onClick={() => handlePublish(false)}
                  disabled={saving || pages.length === 0}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-lg py-6"
                >
                  {saving ? 'Publicando...' : '🚀 Publicar Livro'}
                </Button>
                <Button
                  onClick={() => handlePublish(true)}
                  disabled={saving}
                  variant="outline"
                  className="w-full"
                >
                  💾 Salvar como Rascunho
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => step > 1 ? setStep(step - 1) : onCancel && onCancel()}
          disabled={saving}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          {step === 1 ? 'Cancelar' : 'Voltar'}
        </Button>
        
        {step < 5 && (
          <Button
            onClick={() => {
              if (step === 1 && (!bookData.title_en || !bookData.title_pt || !bookData.cover_image_url)) {
                toast.error('Preencha títulos e envie uma capa');
                return;
              }
              setStep(step + 1);
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Próximo
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}