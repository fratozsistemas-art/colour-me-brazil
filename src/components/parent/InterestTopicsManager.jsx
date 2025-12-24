import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Sparkles, Plus, X, Lightbulb } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const SUGGESTED_TOPICS = [
  '🦖 Dinossauros',
  '🚀 Espaço e Astronomia',
  '🎨 Arte Brasileira',
  '🌳 Floresta Amazônica',
  '🐆 Animais da Mata',
  '⚽ Futebol',
  '🎭 Folclore Brasileiro',
  '🌊 Oceanos e Vida Marinha',
  '🏛️ História do Brasil',
  '🎵 Música e Dança',
  '🍲 Culinária Regional',
  '🦜 Aves Brasileiras',
  '🌿 Plantas e Natureza',
  '🏖️ Praias e Litoral',
  '🎪 Festas Populares'
];

export default function InterestTopicsManager({ profile, onUpdate }) {
  const [topics, setTopics] = useState(profile.interest_topics || []);
  const [newTopic, setNewTopic] = useState('');
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleAddTopic = (topic) => {
    const cleanTopic = topic.replace(/[🦖🚀🎨🌳🐆⚽🎭🌊🏛️🎵🍲🦜🌿🏖️🎪]/g, '').trim();
    if (!topics.includes(cleanTopic) && topics.length < 10) {
      setTopics([...topics, cleanTopic]);
      setNewTopic('');
    }
  };

  const handleRemoveTopic = (topic) => {
    setTopics(topics.filter(t => t !== topic));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.entities.UserProfile.update(profile.id, {
        interest_topics: topics
      });
      toast.success('Tópicos de interesse atualizados!');
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Erro ao salvar tópicos');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateContent = async () => {
    if (topics.length === 0) {
      toast.error('Adicione pelo menos um tópico de interesse');
      return;
    }

    setGenerating(true);
    try {
      // Generate personalized recommendations and learning path
      await Promise.all([
        base44.functions.invoke('generateRecommendations', {
          profile_id: profile.id,
          force_refresh: true,
          interest_topics: topics
        }),
        base44.functions.invoke('generateLearningPath', {
          profile_id: profile.id,
          focus_area: topics.join(', ')
        })
      ]);

      toast.success('Conteúdo personalizado gerado!');
    } catch (error) {
      toast.error('Erro ao gerar conteúdo');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          Tópicos de Interesse
        </CardTitle>
        <CardDescription>
          Configure os interesses de {profile.child_name} para gerar conteúdo e trilhas personalizadas
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Topics */}
        <div>
          <p className="text-sm font-semibold mb-2">Tópicos Selecionados ({topics.length}/10):</p>
          <div className="flex flex-wrap gap-2 min-h-[60px] p-3 bg-gray-50 rounded-lg">
            {topics.map((topic) => (
              <Badge key={topic} className="bg-purple-100 text-purple-800 px-3 py-1">
                {topic}
                <button
                  onClick={() => handleRemoveTopic(topic)}
                  className="ml-2 hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            {topics.length === 0 && (
              <p className="text-sm text-gray-400 italic">Nenhum tópico selecionado ainda</p>
            )}
          </div>
        </div>

        {/* Add Custom Topic */}
        <div>
          <p className="text-sm font-semibold mb-2">Adicionar Tópico Personalizado:</p>
          <div className="flex gap-2">
            <Input
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder="Ex: Robótica, Programação..."
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newTopic.trim()) {
                  handleAddTopic(newTopic);
                }
              }}
            />
            <Button
              onClick={() => handleAddTopic(newTopic)}
              disabled={!newTopic.trim() || topics.length >= 10}
              variant="outline"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Suggested Topics */}
        <div>
          <p className="text-sm font-semibold mb-2">Sugestões Populares:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_TOPICS.filter(t => {
              const cleanTopic = t.replace(/[🦖🚀🎨🌳🐆⚽🎭🌊🏛️🎵🍲🦜🌿🏖️🎪]/g, '').trim();
              return !topics.includes(cleanTopic);
            }).slice(0, 8).map((topic) => (
              <Button
                key={topic}
                variant="outline"
                size="sm"
                onClick={() => handleAddTopic(topic)}
                disabled={topics.length >= 10}
                className="text-xs"
              >
                {topic}
              </Button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1"
          >
            {saving ? 'Salvando...' : 'Salvar Tópicos'}
          </Button>
          <Button
            onClick={handleGenerateContent}
            disabled={generating || topics.length === 0}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {generating ? 'Gerando...' : 'Gerar Conteúdo'}
          </Button>
        </div>

        {topics.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              💡 O conteúdo será adaptado para incluir: <strong>{topics.slice(0, 3).join(', ')}</strong>
              {topics.length > 3 && ` e mais ${topics.length - 3}`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}