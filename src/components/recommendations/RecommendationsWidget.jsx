import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, BookOpen, Palette, Brain, RefreshCw, ExternalLink, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function RecommendationsWidget({ profileId }) {
  const [generating, setGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: recommendations = [], isLoading } = useQuery({
    queryKey: ['recommendations', profileId],
    queryFn: async () => {
      const response = await base44.functions.invoke('generateRecommendations', {
        profile_id: profileId,
        force_refresh: false
      });
      return response.data.recommendations || [];
    },
    enabled: !!profileId
  });

  const handleRefresh = async () => {
    setGenerating(true);
    try {
      await base44.functions.invoke('generateRecommendations', {
        profile_id: profileId,
        force_refresh: true
      });
      queryClient.invalidateQueries(['recommendations']);
      toast.success('Novas recomendações geradas!');
    } catch (error) {
      toast.error('Erro ao gerar recomendações');
    } finally {
      setGenerating(false);
    }
  };

  const markAsClicked = useMutation({
    mutationFn: async (recId) => {
      await base44.entities.ContentRecommendation.update(recId, { clicked: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['recommendations']);
    }
  });

  const typeConfig = {
    book: { icon: BookOpen, color: 'bg-blue-100 text-blue-800', label: 'Livro' },
    coloring_page: { icon: Palette, color: 'bg-purple-100 text-purple-800', label: 'Colorir' },
    quiz: { icon: Brain, color: 'bg-green-100 text-green-800', label: 'Quiz' },
    reading_path: { icon: TrendingUp, color: 'bg-orange-100 text-orange-800', label: 'Trilha' },
    cross_learning: { icon: Sparkles, color: 'bg-pink-100 text-pink-800', label: 'Conexão' }
  };

  const sortedRecs = [...recommendations]
    .filter(r => !r.clicked)
    .sort((a, b) => (b.priority || 0) - (a.priority || 0))
    .slice(0, 6);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3" />
            <p className="text-gray-600">Carregando recomendações...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <div>
              <CardTitle>Recomendações Personalizadas</CardTitle>
              <CardDescription>
                Conteúdo selecionado com IA para você
              </CardDescription>
            </div>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleRefresh}
            disabled={generating}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${generating ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {sortedRecs.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-600 mb-3">Nenhuma recomendação disponível</p>
            <Button onClick={handleRefresh} disabled={generating}>
              Gerar Recomendações
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {sortedRecs.map((rec, index) => {
              const config = typeConfig[rec.recommendation_type] || typeConfig.book;
              const Icon = config.icon;

              return (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4"
                    style={{ borderLeftColor: config.color.includes('blue') ? '#3b82f6' : 
                                               config.color.includes('purple') ? '#9333ea' :
                                               config.color.includes('green') ? '#22c55e' :
                                               config.color.includes('orange') ? '#f97316' : '#ec4899' }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={config.color}>
                            <Icon className="w-3 h-3 mr-1" />
                            {config.label}
                          </Badge>
                          {rec.confidence_score >= 80 && (
                            <Badge variant="outline" className="text-xs">
                              ⭐ Altamente recomendado
                            </Badge>
                          )}
                        </div>
                        <Badge variant="secondary">{rec.confidence_score}%</Badge>
                      </div>

                      <h4 className="font-semibold text-gray-800 mb-1">
                        {rec.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {rec.description}
                      </p>

                      {rec.learning_goals.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {rec.learning_goals.slice(0, 3).map((goal, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {goal}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {rec.metadata?.estimated_time_minutes && (
                        <div className="text-xs text-gray-500 mb-3">
                          ⏱️ Tempo estimado: {rec.metadata.estimated_time_minutes} min
                        </div>
                      )}

                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          markAsClicked.mutate(rec.id);
                          // Navigate based on type
                          if (rec.recommendation_type === 'book') {
                            window.location.href = createPageUrl('Library');
                          }
                        }}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Explorar Agora
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {sortedRecs.length > 0 && (
          <div className="mt-4 pt-4 border-t text-center">
            <p className="text-xs text-gray-500">
              Recomendações baseadas em seu histórico de atividades e preferências de aprendizado
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}