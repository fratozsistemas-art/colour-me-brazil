import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, XCircle, Eye, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ModerationEventsLog({ profileId, parentAccountId }) {
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['moderation-events', profileId],
    queryFn: async () => {
      const response = await base44.functions.invoke('secureEntityQuery', {
        entity_name: 'ModerationEvent',
        operation: 'filter',
        query: { 
          profile_id: profileId,
          parent_account_id: parentAccountId
        }
      });
      return response.data.data || [];
    }
  });

  const markAsReviewed = useMutation({
    mutationFn: async (eventId) => {
      await base44.functions.invoke('secureEntityQuery', {
        entity_name: 'ModerationEvent',
        operation: 'update',
        id: eventId,
        data: { parent_reviewed: true }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['moderation-events']);
      toast.success('Evento marcado como revisado');
    }
  });

  const riskLevelConfig = {
    none: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Nenhum' },
    low: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Baixo' },
    medium: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle, label: 'Médio' },
    high: { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle, label: 'Alto' },
    critical: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Crítico' }
  };

  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.created_date) - new Date(a.created_date)
  );

  const unreviewedCount = events.filter(e => !e.parent_reviewed && e.risk_level !== 'none').length;

  if (isLoading) {
    return <div className="text-center py-8">Carregando eventos...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Registro de Moderação</CardTitle>
            <CardDescription>
              Histórico de análises de conteúdo por IA
            </CardDescription>
          </div>
          {unreviewedCount > 0 && (
            <Badge variant="destructive">
              {unreviewedCount} {unreviewedCount === 1 ? 'pendente' : 'pendentes'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
            <p>Nenhum evento de moderação registrado</p>
            <p className="text-sm">Seu filho está usando o app com segurança! 🎉</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedEvents.map(event => {
              const config = riskLevelConfig[event.risk_level] || riskLevelConfig.none;
              const Icon = config.icon;
              
              return (
                <div 
                  key={event.id} 
                  className={`p-4 border rounded-lg ${!event.parent_reviewed && event.risk_level !== 'none' ? 'bg-yellow-50 border-yellow-300' : ''}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={config.color}>
                        <Icon className="w-3 h-3 mr-1" />
                        {config.label}
                      </Badge>
                      <Badge variant="outline">{event.content_type}</Badge>
                      <Badge variant={
                        event.moderation_result === 'approved' ? 'default' :
                        event.moderation_result === 'flagged' ? 'secondary' : 'destructive'
                      }>
                        {event.moderation_result === 'approved' ? '✓ Aprovado' :
                         event.moderation_result === 'flagged' ? '⚠ Sinalizado' : '✕ Bloqueado'}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-500">
                      {format(new Date(event.created_date), "dd/MM/yy HH:mm", { locale: ptBR })}
                    </span>
                  </div>

                  <div className="text-sm mb-2">
                    <strong>Prévia:</strong> {event.content_preview}
                  </div>

                  {event.detected_issues.length > 0 && (
                    <div className="text-sm mb-2">
                      <strong>Problemas detectados:</strong> {event.detected_issues.join(', ')}
                    </div>
                  )}

                  <div className="text-sm text-gray-700 mb-3">
                    <strong>Análise:</strong> {event.ai_reasoning}
                  </div>

                  {!event.parent_reviewed && event.risk_level !== 'none' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => markAsReviewed.mutate(event.id)}
                      disabled={markAsReviewed.isPending}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Marcar como Revisado
                    </Button>
                  )}

                  {event.parent_reviewed && (
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Revisado pelos pais
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}