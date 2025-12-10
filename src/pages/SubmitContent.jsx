import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Upload, BookOpen, Palette, Mic, Send, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SubmitContent() {
  const [submissionType, setSubmissionType] = useState('story');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [storyText, setStoryText] = useState('');
  const [language, setLanguage] = useState('en');
  const [culturalTags, setCulturalTags] = useState([]);
  const [submitterName, setSubmitterName] = useState('');
  const [submitterAge, setSubmitterAge] = useState('');
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const tagOptions = [
    'Folklore', 'Amazon', 'Indigenous', 'Nature', 'Magic', 
    'Rivers', 'Animals', 'Culture', 'Festival', 'Music', 'Dance'
  ];

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const toggleTag = (tag) => {
    if (culturalTags.includes(tag)) {
      setCulturalTags(culturalTags.filter(t => t !== tag));
    } else {
      setCulturalTags([...culturalTags, tag]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let contentUrl = '';
      
      // Upload file if present
      if (file) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        contentUrl = file_url;
      }

      // Create submission
      await base44.entities.UserSubmission.create({
        submission_type: submissionType,
        title,
        description,
        content_url: contentUrl,
        story_text: submissionType === 'story' ? storyText : undefined,
        language,
        cultural_tags: culturalTags,
        submitter_name: submitterName,
        submitter_age: submitterAge ? parseInt(submitterAge) : undefined,
        status: 'pending'
      });

      setSubmitted(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setTitle('');
        setDescription('');
        setStoryText('');
        setCulturalTags([]);
        setSubmitterName('');
        setSubmitterAge('');
        setFile(null);
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting:', error);
      alert('Error submitting content. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeOptions = [
    { 
      value: 'story', 
      label: 'Story', 
      labelPt: 'História',
      icon: BookOpen, 
      description: 'Share a Brazilian folklore story',
      descriptionPt: 'Compartilhe uma história do folclore brasileiro'
    },
    { 
      value: 'coloring_page', 
      label: 'Coloring Page', 
      labelPt: 'Página para Colorir',
      icon: Palette, 
      description: 'Upload your own coloring illustration',
      descriptionPt: 'Envie sua própria ilustração para colorir'
    },
    { 
      value: 'audio', 
      label: 'Audio Narration', 
      labelPt: 'Narração em Áudio',
      icon: Mic, 
      description: 'Record a story narration',
      descriptionPt: 'Grave uma narração de história'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3"
          >
            <CheckCircle2 className="w-6 h-6" />
            <div>
              <p className="font-semibold">Submission Successful! 🎉</p>
              <p className="text-sm">We'll review your content soon!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          {language === 'en' ? 'Share Your Creativity' : 'Compartilhe Sua Criatividade'}
        </h1>
        <p className="text-gray-600">
          {language === 'en' 
            ? 'Help us grow our collection with your stories, art, and narrations!' 
            : 'Ajude-nos a crescer nossa coleção com suas histórias, arte e narrações!'}
        </p>
      </div>

      {/* Language Toggle */}
      <div className="flex justify-end mb-6">
        <div className="bg-white rounded-lg shadow-md p-1 flex gap-1">
          <Button
            size="sm"
            variant={language === 'en' ? 'default' : 'ghost'}
            onClick={() => setLanguage('en')}
            className="text-sm"
          >
            🇺🇸 English
          </Button>
          <Button
            size="sm"
            variant={language === 'pt' ? 'default' : 'ghost'}
            onClick={() => setLanguage('pt')}
            className="text-sm"
          >
            🇧🇷 Português
          </Button>
        </div>
      </div>

      {/* Submission Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {typeOptions.map((option) => {
          const Icon = option.icon;
          return (
            <motion.div
              key={option.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`p-6 cursor-pointer transition-all ${
                  submissionType === option.value
                    ? 'border-2 border-purple-500 bg-purple-50'
                    : 'hover:border-gray-300'
                }`}
                onClick={() => setSubmissionType(option.value)}
              >
                <Icon className={`w-8 h-8 mb-3 ${
                  submissionType === option.value ? 'text-purple-600' : 'text-gray-600'
                }`} />
                <h3 className="font-semibold text-lg mb-1">
                  {language === 'en' ? option.label : option.labelPt}
                </h3>
                <p className="text-sm text-gray-600">
                  {language === 'en' ? option.description : option.descriptionPt}
                </p>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Submission Form */}
      <Card className="p-8 bg-white shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'en' ? 'Your Name' : 'Seu Nome'}
              </label>
              <Input
                type="text"
                value={submitterName}
                onChange={(e) => setSubmitterName(e.target.value)}
                placeholder={language === 'en' ? 'Enter your name' : 'Digite seu nome'}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'en' ? 'Your Age (optional)' : 'Sua Idade (opcional)'}
              </label>
              <Input
                type="number"
                value={submitterAge}
                onChange={(e) => setSubmitterAge(e.target.value)}
                placeholder="8"
                min="1"
                max="99"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Title' : 'Título'} *
            </label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={language === 'en' ? 'Give your submission a title' : 'Dê um título à sua submissão'}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Description' : 'Descrição'}
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={language === 'en' ? 'Tell us about your submission' : 'Conte-nos sobre sua submissão'}
              rows={3}
            />
          </div>

          {/* Story Text (only for story type) */}
          {submissionType === 'story' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'en' ? 'Story Text' : 'Texto da História'}
              </label>
              <Textarea
                value={storyText}
                onChange={(e) => setStoryText(e.target.value)}
                placeholder={language === 'en' 
                  ? 'Write your Brazilian folklore story here...' 
                  : 'Escreva sua história do folclore brasileiro aqui...'}
                rows={8}
              />
            </div>
          )}

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {submissionType === 'coloring_page' && (language === 'en' ? 'Upload Illustration (PNG/JPG)' : 'Enviar Ilustração (PNG/JPG)')}
              {submissionType === 'audio' && (language === 'en' ? 'Upload Audio (MP3/WAV)' : 'Enviar Áudio (MP3/WAV)')}
              {submissionType === 'story' && (language === 'en' ? 'Upload Illustration (optional)' : 'Enviar Ilustração (opcional)')}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
              <input
                type="file"
                onChange={handleFileChange}
                accept={submissionType === 'audio' ? 'audio/*' : 'image/*'}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">
                  {file ? file.name : (language === 'en' ? 'Click to upload' : 'Clique para enviar')}
                </p>
              </label>
            </div>
          </div>

          {/* Cultural Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'en' ? 'Cultural Tags' : 'Tags Culturais'}
            </label>
            <div className="flex flex-wrap gap-2">
              {tagOptions.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                    culturalTags.includes(tag)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg py-6"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                {language === 'en' ? 'Submitting...' : 'Enviando...'}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                {language === 'en' ? 'Submit Content' : 'Enviar Conteúdo'}
              </div>
            )}
          </Button>
        </form>
      </Card>

      {/* Info Box */}
      <Card className="mt-6 p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">
          {language === 'en' ? '📌 Submission Guidelines' : '📌 Diretrizes de Submissão'}
        </h3>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• {language === 'en' ? 'All submissions will be reviewed by our team' : 'Todas as submissões serão revisadas por nossa equipe'}</li>
          <li>• {language === 'en' ? 'Content should be appropriate for children ages 6-14' : 'O conteúdo deve ser apropriado para crianças de 6 a 14 anos'}</li>
          <li>• {language === 'en' ? 'Stories should relate to Brazilian culture or folklore' : 'As histórias devem estar relacionadas à cultura ou folclore brasileiro'}</li>
          <li>• {language === 'en' ? 'Images should be clear line art suitable for coloring' : 'As imagens devem ser arte de linha clara adequada para colorir'}</li>
        </ul>
      </Card>
    </div>
  );
}