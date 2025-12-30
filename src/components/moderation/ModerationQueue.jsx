import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle2, XCircle, Eye, AlertTriangle, 
  Clock, Flag, MessageSquare, Image as ImageIcon 
} from 'lucide-react';
import { toast } from 'sonner';
import { hasPermission } from '@/components/utils/rbac';

export default function ModerationQueue({ user }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [moderationNote, setModerationNote] = useState('');
  const queryClient = useQueryClient();

  // Check permissions
  const canModerate = hasPermission(user, 'MODERATE_CONTENT');

  // Fetch pending submissions
  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['moderation-queue'],
    queryFn: async () => {
      const items = await base44.entities.UserSubmission.filter({
        status: 'pending'
      }, '-created_date');
      return items;
    },
    enabled: canModerate
  });

  // Fetch user reports
  const { data: reports = [] } = useQuery({
    queryKey: ['user-reports'],
    queryFn: async () => {
      const items = await base44.entities.UserReport.filter({
        status: 'pending'
      }, '-created_date');
      return items;
    },
    enabled: canModerate
  });

  // Approve submission
  const approveMutation = useMutation({
    mutationFn: async ({ id, note }) => {
      await base44.entities.UserSubmission.update(id, {
        status: 'approved'
      });
      
      // Log moderation event
      await base44.entities.ModerationEvent.create({
        content_type: 'submission',
        content_id: id,
        moderator_id: user.id,
        action: 'approved',
        reason: note || 'Content approved',
        timestamp: new Date().toISOString()
      });
    },
    onSuccess: () => {
      toast.success('Conteúdo aprovado com sucesso!');
      queryClient.invalidateQueries(['moderation-queue']);
      setSelectedItem(null);
      setModerationNote('');
    },
    onError: (error) => {
      toast.error('Erro ao aprovar conteúdo');
      console.error(error);
    }
  });

  // Reject submission
  const rejectMutation = useMutation({
    mutationFn: async ({ id, note }) => {
      await base44.entities.UserSubmission.update(id, {
        status: 'rejected'
      });
      
      // Log moderation event
      await base44.entities.ModerationEvent.create({
        content_type: 'submission',
        content_id: id,
        moderator_id: user.id,
        action: 'rejected',
        reason: note || 'Content rejected',
        timestamp: new Date().toISOString()
      });
    },
    onSuccess: () => {
      toast.success('Conteúdo rejeitado');
      queryClient.invalidateQueries(['moderation-queue']);
      setSelectedItem(null);
      setModerationNote('');
    },
    onError: (error) => {
      toast.error('Erro ao rejeitar conteúdo');
      console.error(error);
    }
  });

  // Resolve report
  const resolveReportMutation = useMutation({
    mutationFn: async ({ id, action, note }) => {
      await base44.entities.UserReport.update(id, {
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        resolution_action: action,
        resolution_note: note
      });
      
      // Log moderation event
      await base44.entities.ModerationEvent.create({
        content_type: 'report',
        content_id: id,
        moderator_id: user.id,
        action: action,
        reason: note || `Report ${action}`,
        timestamp: new Date().toISOString()
      });
    },
    onSuccess: () => {
      toast.success('Denúncia resolvida');
      queryClient.invalidateQueries(['user-reports']);
      setSelectedItem(null);
      setModerationNote('');
    }
  });

  if (!canModerate) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Você não tem permissão para acessar esta área.</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
          <p className="text-gray-600 mt-4">Carregando fila de moderação...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{submissions.length}</div>
                <div className="text-sm text-gray-600">Submissões Pendentes</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Flag className="w-8 h-8 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{reports.length}</div>
                <div className="text-sm text-gray-600">Denúncias Ativas</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{submissions.length + reports.length}</div>
                <div className="text-sm text-gray-600">Total na Fila</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Submissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Submissões de Usuários
          </CardTitle>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhuma submissão pendente</p>
          ) : (
            <div className="space-y-4">
              {submissions.map(submission => (
                <Card key={submission.id} className="border-l-4 border-orange-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">
                            {submission.submission_type}
                          </Badge>
                          <Badge>{submission.language.toUpperCase()}</Badge>
                        </div>
                        <h3 className="font-bold mb-1">{submission.title}</h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {submission.description}
                        </p>
                        {submission.submitter_name && (
                          <p className="text-xs text-gray-500">
                            Por: {submission.submitter_name}
                            {submission.submitter_age && ` (${submission.submitter_age} anos)`}
                          </p>
                        )}
                        {submission.cultural_tags?.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {submission.cultural_tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedItem({ ...submission, type: 'submission' })}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Revisar
                        </Button>
                      </div>
                    </div>
                    
                    {submission.content_url && (
                      <div className="mt-3">
                        <img 
                          src={submission.content_url} 
                          alt={submission.title}
                          className="max-h-48 rounded border"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5" />
            Denúncias de Usuários
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhuma denúncia pendente</p>
          ) : (
            <div className="space-y-4">
              {reports.map(report => (
                <Card key={report.id} className="border-l-4 border-red-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="destructive">
                            {report.report_type}
                          </Badge>
                          <Badge variant="outline">
                            {report.content_type}
                          </Badge>
                        </div>
                        <p className="text-sm mb-2">{report.reason}</p>
                        <p className="text-xs text-gray-500">
                          Denunciado em: {new Date(report.created_date).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedItem({ ...report, type: 'report' })}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Revisar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Moderation Dialog */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <CardHeader>
              <CardTitle>
                {selectedItem.type === 'submission' ? 'Revisar Submissão' : 'Revisar Denúncia'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedItem.type === 'submission' ? (
                <>
                  <div>
                    <h3 className="font-bold mb-2">{selectedItem.title}</h3>
                    <p className="text-sm text-gray-600">{selectedItem.description}</p>
                  </div>
                  {selectedItem.content_url && (
                    <img 
                      src={selectedItem.content_url} 
                      alt={selectedItem.title}
                      className="w-full rounded border"
                    />
                  )}
                  {selectedItem.story_text && (
                    <div className="p-4 bg-gray-50 rounded">
                      <p className="text-sm whitespace-pre-wrap">{selectedItem.story_text}</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <Badge variant="destructive" className="mb-2">
                      {selectedItem.report_type}
                    </Badge>
                    <p className="text-sm">{selectedItem.reason}</p>
                  </div>
                </>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Nota de Moderação (opcional)
                </label>
                <Textarea
                  value={moderationNote}
                  onChange={(e) => setModerationNote(e.target.value)}
                  placeholder="Adicione observações sobre sua decisão..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                {selectedItem.type === 'submission' ? (
                  <>
                    <Button
                      onClick={() => approveMutation.mutate({ 
                        id: selectedItem.id, 
                        note: moderationNote 
                      })}
                      disabled={approveMutation.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Aprovar
                    </Button>
                    <Button
                      onClick={() => rejectMutation.mutate({ 
                        id: selectedItem.id, 
                        note: moderationNote 
                      })}
                      disabled={rejectMutation.isPending}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Rejeitar
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => resolveReportMutation.mutate({ 
                        id: selectedItem.id, 
                        action: 'content_removed',
                        note: moderationNote 
                      })}
                      disabled={resolveReportMutation.isPending}
                      variant="destructive"
                      className="flex-1"
                    >
                      Remover Conteúdo
                    </Button>
                    <Button
                      onClick={() => resolveReportMutation.mutate({ 
                        id: selectedItem.id, 
                        action: 'no_action',
                        note: moderationNote 
                      })}
                      disabled={resolveReportMutation.isPending}
                      variant="outline"
                      className="flex-1"
                    >
                      Sem Ação
                    </Button>
                  </>
                )}
                <Button
                  onClick={() => {
                    setSelectedItem(null);
                    setModerationNote('');
                  }}
                  variant="ghost"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}