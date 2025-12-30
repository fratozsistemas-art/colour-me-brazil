import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Tag, Heart, Sparkles, Save } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ReadingPreferencesExpanded({ profile, onUpdate }) {
  const [preferences, setPreferences] = useState({
    favorite_collections: profile?.favorite_collections || [],
    favorite_tags: profile?.favorite_tags || [],
    interest_topics: profile?.interest_topics || [],
    reading_level: profile?.reading_level || 'intermediate',
    vocabulary_preference: profile?.vocabulary_preference || 'standard'
  });

  const [customTopic, setCustomTopic] = useState('');

  const allCollections = [
    { id: 'amazon', label: 'Amazônia 🌿', emoji: '🌿' },
    { id: 'culture', label: 'Cultura 🎨', emoji: '🎨' }
  ];

  const commonTags = [
    'Folclore', 'Carnaval', 'Música', 'Natureza', 'Animais',
    'História', 'Arte', 'Esportes', 'Comida', 'Festas',
    'Lendas', 'Dança', 'Capoeira', 'Samba', 'Artesanato'
  ];

  const suggestedTopics = [
    '🦖 Dinossauros', '🚀 Espaço', '⚽ Futebol', '🎭 Teatro',
    '🎵 Música', '🎨 Arte Brasileira', '🌳 Natureza', '🦜 Animais',
    '🏰 História', '🔬 Ciência', '🍕 Culinária', '⚽ Esportes'
  ];

  const toggleCollection = (collectionId) => {
    setPreferences(prev => ({
      ...prev,
      favorite_collections: prev.favorite_collections.includes(collectionId)
        ? prev.favorite_collections.filter(c => c !== collectionId)
        : [...prev.favorite_collections, collectionId]
    }));
  };

  const toggleTag = (tag) => {
    setPreferences(prev => ({
      ...prev,
      favorite_tags: prev.favorite_tags.includes(tag)
        ? prev.favorite_tags.filter(t => t !== tag)
        : [...prev.favorite_tags, tag]
    }));
  };

  const toggleTopic = (topic) => {
    setPreferences(prev => ({
      ...prev,
      interest_topics: prev.interest_topics.includes(topic)
        ? prev.interest_topics.filter(t => t !== topic)
        : [...prev.interest_topics, topic]
    }));
  };

  const addCustomTopic = () => {
    if (customTopic.trim() && !preferences.interest_topics.includes(customTopic.trim())) {
      setPreferences(prev => ({
        ...prev,
        interest_topics: [...prev.interest_topics, customTopic.trim()]
      }));
      setCustomTopic('');
    }
  };

  const handleSave = async () => {
    try {
      await base44.entities.UserProfile.update(profile.id, preferences);
      toast.success('Preferências de leitura atualizadas!');
      onUpdate && onUpdate(preferences);
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Erro ao salvar preferências');
    }
  };

  return (
    <div className="space-y-6">
      {/* Favorite Collections */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-500" />
          Coleções Favoritas
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Selecione suas coleções favoritas para receber mais recomendações
        </p>
        <div className="flex gap-3">
          {allCollections.map((collection) => (
            <Button
              key={collection.id}
              variant={preferences.favorite_collections.includes(collection.id) ? 'default' : 'outline'}
              onClick={() => toggleCollection(collection.id)}
              className="flex items-center gap-2"
            >
              <span>{collection.emoji}</span>
              <span>{collection.label}</span>
              {preferences.favorite_collections.includes(collection.id) && (
                <Heart className="w-4 h-4 fill-current" />
              )}
            </Button>
          ))}
        </div>
      </Card>

      {/* Cultural Tags */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Tag className="w-5 h-5 text-green-500" />
          Temas Culturais Favoritos
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Escolha temas culturais que você mais gosta
        </p>
        <div className="flex flex-wrap gap-2">
          {commonTags.map((tag) => (
            <Badge
              key={tag}
              variant={preferences.favorite_tags.includes(tag) ? 'default' : 'outline'}
              className="cursor-pointer text-sm py-2 px-3"
              onClick={() => toggleTag(tag)}
            >
              {tag}
              {preferences.favorite_tags.includes(tag) && ' ✓'}
            </Badge>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Selecionados: {preferences.favorite_tags.length}
        </p>
      </Card>

      {/* Interest Topics */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          Interesses e Hobbies
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Conte-nos sobre seus interesses para personalizar as histórias
        </p>
        
        {/* Suggested Topics */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Sugestões populares:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedTopics.map((topic) => (
              <Badge
                key={topic}
                variant={preferences.interest_topics.includes(topic) ? 'default' : 'outline'}
                className="cursor-pointer text-sm py-2 px-3"
                onClick={() => toggleTopic(topic)}
              >
                {topic}
                {preferences.interest_topics.includes(topic) && ' ✓'}
              </Badge>
            ))}
          </div>
        </div>

        {/* Custom Topic Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustomTopic();
              }
            }}
            placeholder="Adicionar interesse personalizado..."
            className="flex-1 px-3 py-2 border rounded-lg text-sm"
          />
          <Button onClick={addCustomTopic} size="sm">
            Adicionar
          </Button>
        </div>

        {/* Selected Topics */}
        {preferences.interest_topics.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium text-gray-700 mb-2">Seus interesses:</p>
            <div className="flex flex-wrap gap-2">
              {preferences.interest_topics.map((topic, idx) => (
                <Badge
                  key={idx}
                  className="bg-purple-100 text-purple-700 cursor-pointer"
                  onClick={() => toggleTopic(topic)}
                >
                  {topic} ×
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Reading Level */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-3">Nível de Leitura</h3>
        <p className="text-sm text-gray-600 mb-4">
          Isso ajuda a IA a adaptar as histórias para o nível adequado
        </p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'beginner', label: 'Iniciante', desc: '5-7 anos', emoji: '🌱' },
            { value: 'intermediate', label: 'Intermediário', desc: '8-10 anos', emoji: '🌿' },
            { value: 'advanced', label: 'Avançado', desc: '11+ anos', emoji: '🌳' }
          ].map((level) => (
            <Card
              key={level.value}
              className={`p-4 cursor-pointer transition-all ${
                preferences.reading_level === level.value
                  ? 'border-2 border-blue-500 bg-blue-50'
                  : 'hover:border-blue-300'
              }`}
              onClick={() => setPreferences(prev => ({ ...prev, reading_level: level.value }))}
            >
              <div className="text-3xl text-center mb-2">{level.emoji}</div>
              <p className="font-semibold text-center text-sm">{level.label}</p>
              <p className="text-xs text-gray-500 text-center">{level.desc}</p>
            </Card>
          ))}
        </div>
      </Card>

      {/* Vocabulary Preference */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-3">Preferência de Vocabulário</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'simple', label: 'Simples', emoji: '😊' },
            { value: 'standard', label: 'Padrão', emoji: '📖' },
            { value: 'enriched', label: 'Enriquecido', emoji: '🎓' }
          ].map((vocab) => (
            <Button
              key={vocab.value}
              variant={preferences.vocabulary_preference === vocab.value ? 'default' : 'outline'}
              onClick={() => setPreferences(prev => ({ ...prev, vocabulary_preference: vocab.value }))}
              className="flex flex-col items-center py-4 h-auto"
            >
              <span className="text-2xl mb-1">{vocab.emoji}</span>
              <span className="text-sm">{vocab.label}</span>
            </Button>
          ))}
        </div>
      </Card>

      {/* Save Button */}
      <Button onClick={handleSave} className="w-full bg-green-600 hover:bg-green-700">
        <Save className="w-4 h-4 mr-2" />
        Salvar Preferências
      </Button>
    </div>
  );
}