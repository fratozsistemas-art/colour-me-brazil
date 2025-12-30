import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Music, Play, Pause, Check, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function AudioSelector({ 
  selectedAudioUrl, 
  onAudioSelected, 
  language = 'en',
  audioType = 'narration' 
}) {
  const [uploadingFile, setUploadingFile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [playingAudio, setPlayingAudio] = useState(null);
  const audioRef = React.useRef(null);

  // Fetch audio library
  const { data: audioLibrary = [] } = useQuery({
    queryKey: ['audioLibrary', language, audioType],
    queryFn: () => base44.entities.AudioLibrary.filter({
      language,
      audio_type: audioType
    }),
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast.error('Por favor, selecione um arquivo de áudio');
      return;
    }

    setUploadingFile(true);
    try {
      // Upload file
      const uploadResult = await base44.integrations.Core.UploadFile({ file });

      // Get audio duration
      const audio = new Audio(uploadResult.file_url);
      const duration = await new Promise((resolve) => {
        audio.addEventListener('loadedmetadata', () => {
          resolve(Math.floor(audio.duration));
        });
      });

      // Save to audio library
      const user = await base44.auth.me();
      await base44.entities.AudioLibrary.create({
        title: file.name.replace(/\.[^/.]+$/, ''),
        description: 'Uploaded audio file',
        audio_url: uploadResult.file_url,
        language,
        duration_seconds: duration,
        audio_type: audioType,
        uploaded_by: user.id
      });

      onAudioSelected(uploadResult.file_url);
      toast.success('Áudio carregado com sucesso!');
    } catch (error) {
      console.error('Error uploading audio:', error);
      toast.error('Erro ao carregar áudio: ' + error.message);
    } finally {
      setUploadingFile(false);
    }
  };

  const handlePlayPause = (audioUrl) => {
    if (playingAudio === audioUrl) {
      audioRef.current?.pause();
      setPlayingAudio(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setPlayingAudio(audioUrl);
      }
    }
  };

  const filteredAudio = audioLibrary.filter(audio =>
    audio.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    audio.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Tabs defaultValue="library" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="library">
            <Music className="w-4 h-4 mr-2" />
            Biblioteca de Áudio
          </TabsTrigger>
          <TabsTrigger value="upload">
            <Upload className="w-4 h-4 mr-2" />
            Carregar Novo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar áudio..."
              className="pl-10"
            />
          </div>

          {/* Audio List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredAudio.length === 0 ? (
              <Card className="p-8 text-center">
                <Music className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">
                  Nenhum áudio encontrado na biblioteca
                </p>
              </Card>
            ) : (
              filteredAudio.map((audio) => (
                <Card
                  key={audio.id}
                  className={`p-3 cursor-pointer transition-all ${
                    selectedAudioUrl === audio.audio_url 
                      ? 'border-2 border-blue-500 bg-blue-50' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => onAudioSelected(audio.audio_url)}
                >
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayPause(audio.audio_url);
                      }}
                      className="h-8 w-8"
                    >
                      {playingAudio === audio.audio_url ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-800 truncate">
                        {audio.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {Math.floor(audio.duration_seconds / 60)}:{(audio.duration_seconds % 60).toString().padStart(2, '0')}
                      </p>
                    </div>
                    {selectedAudioUrl === audio.audio_url && (
                      <Check className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="upload" className="space-y-3">
          <Card className="p-6 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-700 mb-4">
              Selecione um arquivo de áudio para fazer upload
            </p>
            <label>
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                disabled={uploadingFile}
                className="hidden"
              />
              <Button disabled={uploadingFile} asChild>
                <span>
                  {uploadingFile ? 'Carregando...' : 'Escolher Arquivo de Áudio'}
                </span>
              </Button>
            </label>
            <p className="text-xs text-gray-500 mt-3">
              Formatos aceitos: MP3, WAV, OGG
            </p>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Hidden Audio Player */}
      <audio
        ref={audioRef}
        onEnded={() => setPlayingAudio(null)}
        className="hidden"
      />

      {/* Current Selection */}
      {selectedAudioUrl && (
        <Card className="p-3 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Áudio selecionado
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAudioSelected(null)}
            >
              Limpar
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}