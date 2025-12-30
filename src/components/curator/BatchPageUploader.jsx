import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Upload, X, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function BatchPageUploader({ onPagesUploaded }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
    }
  }, []);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files).filter(file =>
      file.type.startsWith('image/')
    );
    
    if (selectedFiles.length > 0) {
      addFiles(selectedFiles);
    }
  };

  const addFiles = (newFiles) => {
    const filesWithMetadata = newFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      preview: URL.createObjectURL(file),
      pageNumber: files.length + index + 1,
      storyText: ''
    }));
    
    setFiles(prev => [...prev, ...filesWithMetadata]);
  };

  const removeFile = (id) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== id);
      // Renumber pages
      return updated.map((f, idx) => ({ ...f, pageNumber: idx + 1 }));
    });
  };

  const updateFileText = (id, text) => {
    setFiles(prev => prev.map(f => 
      f.id === id ? { ...f, storyText: text } : f
    ));
  };

  const handleUploadAll = async () => {
    if (files.length === 0) {
      toast.error('Adicione pelo menos uma imagem');
      return;
    }

    setUploading(true);
    const progress = files.map(() => ({ status: 'pending', url: null }));
    setUploadProgress(progress);

    const uploadedPages = [];

    for (let i = 0; i < files.length; i++) {
      const fileData = files[i];
      
      try {
        // Update progress
        progress[i] = { status: 'uploading', url: null };
        setUploadProgress([...progress]);

        // Upload illustration
        const uploadResult = await base44.integrations.Core.UploadFile({
          file: fileData.file
        });

        progress[i] = { status: 'success', url: uploadResult.file_url };
        setUploadProgress([...progress]);

        uploadedPages.push({
          pageNumber: fileData.pageNumber,
          illustrationUrl: uploadResult.file_url,
          storyText: fileData.storyText
        });
      } catch (error) {
        console.error(`Error uploading file ${i + 1}:`, error);
        progress[i] = { status: 'error', url: null };
        setUploadProgress([...progress]);
      }
    }

    if (uploadedPages.length > 0) {
      onPagesUploaded(uploadedPages);
      setFiles([]);
      setUploadProgress([]);
      toast.success(`${uploadedPages.length} páginas carregadas com sucesso!`);
    }

    setUploading(false);
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <Upload className={`w-12 h-12 mx-auto mb-3 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
        <p className="text-gray-700 font-medium mb-2">
          Arraste e solte imagens aqui
        </p>
        <p className="text-sm text-gray-500 mb-4">
          ou
        </p>
        <label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button variant="outline" asChild>
            <span>
              <ImageIcon className="w-4 h-4 mr-2" />
              Selecionar Arquivos
            </span>
          </Button>
        </label>
        <p className="text-xs text-gray-500 mt-3">
          Formatos aceitos: PNG, JPG, JPEG. Múltiplos arquivos permitidos.
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-700">
              {files.length} {files.length === 1 ? 'Imagem' : 'Imagens'} Carregadas
            </h4>
            <Button
              onClick={handleUploadAll}
              disabled={uploading}
              className="bg-green-600 hover:bg-green-700"
            >
              {uploading ? 'Enviando...' : `Carregar Todas (${files.length})`}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {files.map((fileData, index) => {
              const status = uploadProgress[index];
              
              return (
                <Card key={fileData.id} className="p-3">
                  <div className="flex gap-3">
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <img
                        src={fileData.preview}
                        alt={`Page ${fileData.pageNumber}`}
                        className="w-full h-full object-cover rounded"
                      />
                      {status?.status === 'uploading' && (
                        <div className="absolute inset-0 bg-blue-500/50 flex items-center justify-center rounded">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                        </div>
                      )}
                      {status?.status === 'success' && (
                        <div className="absolute inset-0 bg-green-500/50 flex items-center justify-center rounded">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                      )}
                      {status?.status === 'error' && (
                        <div className="absolute inset-0 bg-red-500/50 flex items-center justify-center rounded">
                          <AlertCircle className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">
                          Página {fileData.pageNumber}
                        </span>
                        {!uploading && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFile(fileData.id)}
                            className="h-6 w-6"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <Input
                        value={fileData.storyText}
                        onChange={(e) => updateFileText(fileData.id, e.target.value)}
                        placeholder="Texto da página (opcional)"
                        className="text-xs h-8"
                        disabled={uploading}
                      />
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {fileData.file.name}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}