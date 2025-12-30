import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Book, Palette, Trophy, Star, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ActivityTimeline({ profileId }) {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activities', profileId],
    queryFn: () => base44.entities.UserActivityLog.filter({ profile_id: profileId }),
  });

  const { data: books = [] } = useQuery({
    queryKey: ['books'],
    queryFn: () => base44.entities.Book.list(),
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements', profileId],
    queryFn: () => base44.entities.Achievement.filter({ profile_id: profileId }),
  });

  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.created_date) - new Date(a.created_date)
  ).slice(0, 50);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'book_started':
      case 'book_completed':
        return <Book className="w-5 h-5" />;
      case 'page_colored':
        return <Palette className="w-5 h-5" />;
      case 'achievement_unlocked':
        return <Trophy className="w-5 h-5" />;
      case 'level_up':
        return <TrendingUp className="w-5 h-5" />;
      case 'quiz_completed':
        return <CheckCircle2 className="w-5 h-5" />;
      default:
        return <Star className="w-5 h-5" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'book_started':
        return 'from-blue-50 to-blue-100 border-blue-200';
      case 'book_completed':
        return 'from-green-50 to-green-100 border-green-200';
      case 'page_colored':
        return 'from-purple-50 to-purple-100 border-purple-200';
      case 'achievement_unlocked':
        return 'from-yellow-50 to-yellow-100 border-yellow-200';
      case 'level_up':
        return 'from-orange-50 to-orange-100 border-orange-200';
      case 'quiz_completed':
        return 'from-teal-50 to-teal-100 border-teal-200';
      default:
        return 'from-gray-50 to-gray-100 border-gray-200';
    }
  };

  const getActivityMessage = (activity) => {
    const book = books.find(b => b.id === activity.book_id);
    const achievement = achievements.find(a => a.achievement_id === activity.metadata?.achievement_id);

    switch (activity.activity_type) {
      case 'book_started':
        return `Começou a ler "${book?.title_pt || 'um livro'}"`;
      case 'book_completed':
        return `Completou "${book?.title_pt || 'um livro'}" 🎉`;
      case 'page_colored':
        return `Coloriu uma página${book ? ` de "${book.title_pt}"` : ''}`;
      case 'achievement_unlocked':
        return `Desbloqueou conquista: ${achievement?.name_pt || 'Nova conquista!'}`;
      case 'level_up':
        return `Subiu para o Nível ${activity.metadata?.new_level || '?'}! 🎊`;
      case 'quiz_completed':
        return 'Completou um quiz';
      case 'daily_challenge_completed':
        return 'Completou o desafio diário! 🌟';
      case 'daily_quest_completed':
        return 'Completou a missão diária! ⚔️';
      default:
        return activity.activity_type.replace(/_/g, ' ');
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">📜 Histórico de Atividades</h3>
        <Badge variant="outline" className="text-sm">
          {sortedActivities.length} atividades recentes
        </Badge>
      </div>

      {sortedActivities.length === 0 ? (
        <Card className="p-12 text-center">
          <Clock className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Nenhuma atividade ainda</p>
          <p className="text-sm text-gray-400 mt-2">Comece a explorar para ver seu histórico aqui!</p>
        </Card>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-pink-200" />

          <div className="space-y-3">
            {sortedActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`ml-12 p-4 bg-gradient-to-br ${getActivityColor(activity.activity_type)} border relative`}>
                  {/* Timeline dot */}
                  <div className="absolute -left-9 top-1/2 -translate-y-1/2">
                    <div className="w-8 h-8 rounded-full bg-white border-4 border-blue-500 flex items-center justify-center shadow-md">
                      {getActivityIcon(activity.activity_type)}
                    </div>
                  </div>

                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 mb-1">
                        {getActivityMessage(activity)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(activity.created_date), { 
                          addSuffix: true,
                          locale: ptBR 
                        })}
                      </p>
                    </div>
                    {activity.points_earned > 0 && (
                      <Badge className="bg-yellow-500 text-white">
                        +{activity.points_earned} pts
                      </Badge>
                    )}
                  </div>

                  {/* Additional metadata */}
                  {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="flex flex-wrap gap-2 text-xs">
                        {activity.metadata.collection && (
                          <Badge variant="outline">
                            {activity.metadata.collection === 'amazon' ? '🌿 Amazônia' : '🎨 Cultura'}
                          </Badge>
                        )}
                        {activity.metadata.time_spent && (
                          <Badge variant="outline">
                            ⏱️ {Math.floor(activity.metadata.time_spent / 60)}min
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}