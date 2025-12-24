import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Download, Calendar } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';

export default function AIActivitySummary({ profile }) {
  const [period, setPeriod] = useState('7');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['activity-summary', profile.id, period],
    queryFn: async () => {
      const response = await base44.functions.invoke('generateActivitySummary', {
        profile_id: profile.id,
        period_days: parseInt(period)
      });
      return response.data;
    },
    enabled: !!profile.id
  });

  const handleExport = () => {
    if (!data) return;
    
    const exportText = `RELATÓRIO DE ATIVIDADES - ${profile.child_name}
Período: ${period} dias
Data: ${new Date().toLocaleDateString('pt-BR')}

${data.ai_summary}

ESTATÍSTICAS DETALHADAS:
- Livros completados: ${data.statistics.activity_counts.books_completed}
- Páginas coloridas: ${data.statistics.activity_counts.pages_colored}
- Quizzes realizados: ${data.statistics.quiz_performance.total_attempted}
- Acurácia em quizzes: ${data.statistics.quiz_performance.accuracy}%
- Sequência atual: ${data.statistics.reading_stats.current_streak} dias
- Obras de arte criadas: ${data.statistics.creative_output.artworks_created}

EVENTOS DE MODERAÇÃO:
- Total: ${data.statistics.moderation_summary.total_events}
- Sinalizados: ${data.statistics.moderation_summary.flagged}
- Bloqueados: ${data.statistics.moderation_summary.blocked}
- Alto risco: ${data.statistics.moderation_summary.high_risk}
`;

    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${profile.child_name}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <CardTitle>Resumo Inteligente de Atividades</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 dias</SelectItem>
                <SelectItem value="14">14 dias</SelectItem>
                <SelectItem value="30">30 dias</SelectItem>
              </SelectContent>
            </Select>
            {data && (
              <Button size="sm" variant="outline" onClick={handleExport}>
                <Download className="w-3 h-3 mr-1" />
                Exportar
              </Button>
            )}
          </div>
        </div>
        <CardDescription>
          Análise com IA do progresso e comportamento de {profile.child_name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3" />
            <p className="text-gray-600">Gerando resumo com IA...</p>
          </div>
        ) : data ? (
          <div className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{data.ai_summary}</ReactMarkdown>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {data.statistics.activity_counts.books_completed}
                </div>
                <div className="text-xs text-gray-600">Livros Completados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {data.statistics.creative_output.artworks_created}
                </div>
                <div className="text-xs text-gray-600">Obras de Arte</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {data.statistics.quiz_performance.accuracy}%
                </div>
                <div className="text-xs text-gray-600">Acurácia</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {data.statistics.reading_stats.current_streak}
                </div>
                <div className="text-xs text-gray-600">Dias de Sequência</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            Nenhum dado disponível para o período selecionado
          </div>
        )}
      </CardContent>
    </Card>
  );
}