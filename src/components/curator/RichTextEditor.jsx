import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Code } from 'lucide-react';

export default function RichTextEditor({ value, onChange, language = 'en', placeholder }) {
  const [viewMode, setViewMode] = useState('edit');

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline',
    'list', 'bullet',
    'align'
  ];

  // Convert HTML to plain text for preview
  const getPlainText = (html) => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  };

  return (
    <div className="space-y-3">
      <Tabs value={viewMode} onValueChange={setViewMode}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit">
            <Code className="w-4 h-4 mr-2" />
            Editar
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="w-4 h-4 mr-2" />
            Pré-visualização
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="mt-3">
          <ReactQuill
            theme="snow"
            value={value}
            onChange={onChange}
            modules={modules}
            formats={formats}
            placeholder={placeholder || `Escreva o texto da história em ${language === 'en' ? 'inglês' : 'português'}...`}
            className="bg-white rounded-lg"
          />
        </TabsContent>

        <TabsContent value="preview" className="mt-3">
          <div className="bg-white border rounded-lg p-6 min-h-[200px]">
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: value || '<p class="text-gray-400">Nenhum conteúdo para pré-visualizar</p>' }}
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="text-xs text-gray-500">
        Caracteres: {getPlainText(value).length}
      </div>
    </div>
  );
}