import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  Upload, BookOpen, FileText, Palette, Volume2, 
  Eye, Save, ChevronRight, ChevronLeft, CheckCircle2, X 
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

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
    is_locked: false,
    page_count: 12,
    order_index: 0
  });
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState({
    page_number: 1,
    page_type: 'story',
    story_text_en: '',
    story_text_pt: '',
    illustration_url: ''
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const handleIllustrationUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setCurrentPage(prev => ({ ...prev, illustration_url: result.file_url }));
      toast.success('Ilustração enviada!');
    } catch (error) {
      toast.error('Erro ao enviar ilustração');
    } finally {
      setUploading(false);
    }
  };

  const addPage = () => {
    if (!currentPage.story_text_en && !currentPage.story_text_pt) {
      toast.error('Adicione pelo menos um texto de história');
      return;
    }
    
    setPages([...pages, currentPage]);
    setCurrentPage({
      page_number: pages.length + 2,
      page_type: 'story',
      story_text_en: '',
      story_text_pt: '',
      illustration_url: ''
    });
    toast.success(`Página ${pages.length + 1} adicionada!`);
  };

  const removePage = (index) => {
    setPages(pages.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
      // Create book
      const createdBook = await base44.entities.Book.create(bookData);

      // Create pages
      for (const page of pages) {
        await base44.entities.Page.create({
          ...page,
          book_id: createdBook.id
        });
      }

      toast.success('Livro publicado com sucesso! 🎉');
      onComplete && onComplete(createdBook);
    } catch (error) {
      console.error('Error publishing book:', error);
      toast.error('Erro ao publicar livro');
    } finally {
      setSaving(false);
    }
  };

  const totalSteps = 4;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                step >= s 
                  ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white' 
                  : 'bg-gray-200 text-gray-400'
              }`}>
                {step > s ? <CheckCircle2 className="w-6 h-6" /> : s}
              </div>
              {s < 4 && (
                <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-blue-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-600 px-2">
          <span>Info Básica</span>
          <span>Configurações</span>
          <span>Páginas</span>
          <span>Pré-visualização</span>
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
              <h2 className="text-2xl font-bold mb-4">📖 Informações Básicas do Livro</h2>
              
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
                        className="max-h-48 mx-auto rounded-lg"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setBookData({ ...bookData, cover_image_url: '' })}
                        className="mt-2"
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
                        <p className="text-sm text-gray-500">PNG ou JPG - Recomendado 800x1200px</p>
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
              <h2 className="text-2xl font-bold mb-4">⚙️ Configurações e Tags</h2>

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
                      className="cursor-pointer"
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
                <p className="text-xs text-gray-500">
                  Tags selecionadas: {bookData.cultural_tags.length}
                </p>
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

        {/* Step 3: Pages */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">📝 Adicionar Páginas</h2>

              {/* Current Page Form */}
              <div className="space-y-4 mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Nova Página #{currentPage.page_number}</h3>
                  <Select
                    value={currentPage.page_type}
                    onValueChange={(value) => setCurrentPage({ ...currentPage, page_type: value })}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="story">📖 História</SelectItem>
                      <SelectItem value="coloring">🎨 Colorir</SelectItem>
                      <SelectItem value="about">ℹ️ Sobre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Texto (Inglês)</label>
                    <Textarea
                      value={currentPage.story_text_en}
                      onChange={(e) => setCurrentPage({ ...currentPage, story_text_en: e.target.value })}
                      rows={4}
                      placeholder="Once upon a time in the Amazon..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Texto (Português)</label>
                    <Textarea
                      value={currentPage.story_text_pt}
                      onChange={(e) => setCurrentPage({ ...currentPage, story_text_pt: e.target.value })}
                      rows={4}
                      placeholder="Era uma vez na Amazônia..."
                    />
                  </div>
                </div>

                {/* Illustration Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Ilustração {currentPage.page_type === 'coloring' && '(Para colorir - PNG transparente)'}
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {currentPage.illustration_url ? (
                      <div>
                        <img 
                          src={currentPage.illustration_url} 
                          alt="Page illustration" 
                          className="max-h-32 mx-auto rounded mb-2"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage({ ...currentPage, illustration_url: '' })}
                        >
                          Remover
                        </Button>
                      </div>
                    ) : (
                      <>
                        <input
                          type="file"
                          id="illustration-upload"
                          accept="image/*"
                          onChange={handleIllustrationUpload}
                          className="hidden"
                        />
                        <label htmlFor="illustration-upload" className="cursor-pointer">
                          <Palette className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm">
                            {uploading ? 'Enviando...' : 'Enviar ilustração'}
                          </p>
                        </label>
                      </>
                    )}
                  </div>
                </div>

                <Button onClick={addPage} className="w-full bg-green-600 hover:bg-green-700">
                  Adicionar Página
                </Button>
              </div>

              {/* Pages List */}
              <div className="space-y-2">
                <h3 className="font-semibold mb-2">Páginas Adicionadas ({pages.length})</h3>
                {pages.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Nenhuma página adicionada ainda
                  </p>
                ) : (
                  pages.map((page, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="font-semibold text-gray-700">Pág. {page.page_number}</span>
                      <Badge>{page.page_type}</Badge>
                      <p className="flex-1 text-sm text-gray-600 truncate">
                        {page.story_text_pt || page.story_text_en || 'Sem texto'}
                      </p>
                      {page.illustration_url && <Palette className="w-4 h-4 text-green-500" />}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePage(idx)}
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Step 4: Preview */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Eye className="w-6 h-6 text-purple-500" />
                Pré-visualização do Livro
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Book Info */}
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
                      <p className="text-sm font-medium mb-2">Tags Culturais:</p>
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

                {/* Pages Preview */}
                <div>
                  <h4 className="font-semibold mb-3">Páginas ({pages.length})</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
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
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {page.story_text_pt || page.story_text_en}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>

              {/* Publish Button */}
              <div className="mt-6 pt-6 border-t">
                <Button
                  onClick={handlePublish}
                  disabled={saving || pages.length === 0 || !bookData.title_en || !bookData.title_pt}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-lg py-6"
                >
                  {saving ? (
                    'Publicando...'
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Publicar Livro
                    </>
                  )}
                </Button>
                {pages.length === 0 && (
                  <p className="text-xs text-red-500 text-center mt-2">
                    Adicione pelo menos uma página antes de publicar
                  </p>
                )}
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
        
        {step < 4 && (
          <Button
            onClick={() => {
              if (step === 1 && (!bookData.title_en || !bookData.title_pt || !bookData.cover_image_url)) {
                toast.error('Preencha título e envie uma capa');
                return;
              }
              if (step === 3 && pages.length === 0) {
                toast.error('Adicione pelo menos uma página');
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