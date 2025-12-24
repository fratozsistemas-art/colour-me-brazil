import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Route, Sparkles, Plus, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import LearningPathCard from '../components/learning-paths/LearningPathCard';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function LearningPaths() {
  const [profileId] = useState(() => localStorage.getItem('currentProfileId'));
  const [generating, setGenerating] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: paths = [], isLoading } = useQuery({
    queryKey: ['learning-paths', profileId],
    queryFn: async () => {
      const response = await base44.functions.invoke('secureEntityQuery', {
        entity_name: 'LearningPath',
        operation: 'filter',
        query: { profile_id: profileId }
      });
      return response.data.data || [];
    },
    enabled: !!profileId
  });

  const { data: progresses = [] } = useQuery({
    queryKey: ['path-progress', profileId],
    queryFn: async () => {
      const response = await base44.functions.invoke('secureEntityQuery', {
        entity_name: 'PathProgress',
        operation: 'filter',
        query: { profile_id: profileId }
      });
      return response.data.data || [];
    },
    enabled: !!profileId
  });

  const handleGeneratePath = async (theme = null) => {
    setGenerating(true);
    try {
      const response = await base44.functions.invoke('generateLearningPath', {
        profile_id: profileId,
        theme
      });

      if (response.data.success) {
        toast.success('Nova trilha de aprendizado criada!');
        queryClient.invalidateQueries(['learning-paths']);
        queryClient.invalidateQueries(['path-progress']);
      }
    } catch (error) {
      toast.error('Erro ao criar trilha');
    } finally {
      setGenerating(false);
    }
  };

  const handleStartPath = (pathId) => {
    navigate(`${createPageUrl('PathActivity')}?pathId=${pathId}`);
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-3" />
          <p className="text-gray-600">Carregando trilhas...</p>
        </div>
      </div>
    );
  }

  const activePaths = paths.filter(p => p.status === 'active');
  const completedPaths = paths.filter(p => p.status === 'completed');

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Route className="w-10 h-10 text-purple-600" />
          <span className="text-gradient-brand">Trilhas de Aprendizado</span>
        </h1>
        <p className="text-gray-600">
          Sequências personalizadas de atividades que se adaptam ao seu progresso
        </p>
      </div>

      {/* Create New Path */}
      <Card className="p-6 mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Criar Nova Trilha Personalizada
            </h3>
            <p className="text-sm text-gray-600">
              Nossa IA vai criar uma sequência de atividades perfeita para você
            </p>
          </div>
          <Button 
            onClick={() => handleGeneratePath()}
            disabled={generating}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            {generating ? (
              <>Criando...</>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Gerar Trilha
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Active Paths */}
      {activePaths.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            Trilhas Ativas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activePaths.map((path) => {
              const progress = progresses.find(p => p.path_id === path.id);
              return (
                <LearningPathCard
                  key={path.id}
                  path={path}
                  progress={progress}
                  onStart={() => handleStartPath(path.id)}
                  onContinue={() => handleStartPath(path.id)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Paths */}
      {completedPaths.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            ✅ Trilhas Concluídas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {completedPaths.map((path) => {
              const progress = progresses.find(p => p.path_id === path.id);
              return (
                <LearningPathCard
                  key={path.id}
                  path={path}
                  progress={progress}
                  onStart={() => {}}
                  onContinue={() => {}}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {paths.length === 0 && (
        <Card className="p-12 text-center">
          <Route className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-bold mb-2">Nenhuma trilha ainda</h3>
          <p className="text-gray-600 mb-6">
            Crie sua primeira trilha de aprendizado personalizada com IA
          </p>
          <Button 
            onClick={() => handleGeneratePath()}
            disabled={generating}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Criar Primeira Trilha
          </Button>
        </Card>
      )}
    </div>
  );
}