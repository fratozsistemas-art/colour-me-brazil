import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle, Eye, Settings, Bell } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ContentModerationSettings({ parentAccount, onUpdate }) {
  const [settings, setSettings] = useState({
    content_approval_required: parentAccount?.content_approval_required || false,
    allowed_features: parentAccount?.allowed_features || ['reading', 'coloring', 'quizzes', 'showcase', 'forum']
  });
  const [saving, setSaving] = useState(false);

  const features = [
    { id: 'reading', label: 'Leitura', icon: '📚', description: 'Acesso a livros e histórias' },
    { id: 'coloring', label: 'Colorir', icon: '🎨', description: 'Páginas para colorir' },
    { id: 'quizzes', label: 'Quiz', icon: '🎯', description: 'Quizzes educacionais' },
    { id: 'showcase', label: 'Vitrine', icon: '✨', description: 'Compartilhar trabalhos artísticos' },
    { id: 'forum', label: 'Fórum', icon: '💬', description: 'Participar de discussões' }
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.entities.ParentAccount.update(parentAccount.id, settings);
      toast.success('Configurações de moderação atualizadas');
      onUpdate && onUpdate(settings);
    } catch (error) {
      toast.error('Erro ao salvar configurações');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <CardTitle>Configurações de Moderação de Conteúdo</CardTitle>
        </div>
        <CardDescription>
          Configure como o conteúdo criado por seu filho é moderado e publicado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Approval Requirement */}
        <div className="flex items-start justify-between p-4 border rounded-lg">
          <div className="space-y-1 flex-1">
            <Label htmlFor="approval-required" className="text-base font-semibold">
              Aprovação Parental Obrigatória
            </Label>
            <p className="text-sm text-gray-600">
              Todo conteúdo criado pela criança precisa da sua aprovação antes de ser publicado
            </p>
          </div>
          <Switch
            id="approval-required"
            checked={settings.content_approval_required}
            onCheckedChange={(checked) => 
              setSettings(prev => ({ ...prev, content_approval_required: checked }))
            }
          />
        </div>

        {/* AI Moderation Info */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Moderação com IA Ativada:</strong> Nosso sistema analisa automaticamente todo conteúdo 
            em busca de linguagem inadequada, informações pessoais, comportamento predatório e outros riscos. 
            Você será notificado sobre quaisquer problemas detectados.
          </AlertDescription>
        </Alert>

        {/* Feature Access Control */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Recursos Permitidos</Label>
          <p className="text-sm text-gray-600">
            Selecione quais recursos da plataforma seu filho pode acessar
          </p>
          
          <div className="grid gap-3">
            {features.map(feature => (
              <div key={feature.id} className="flex items-start justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{feature.icon}</span>
                  <div>
                    <div className="font-medium">{feature.label}</div>
                    <div className="text-sm text-gray-600">{feature.description}</div>
                  </div>
                </div>
                <Switch
                  checked={settings.allowed_features.includes(feature.id)}
                  onCheckedChange={(checked) => {
                    setSettings(prev => ({
                      ...prev,
                      allowed_features: checked 
                        ? [...prev.allowed_features, feature.id]
                        : prev.allowed_features.filter(f => f !== feature.id)
                    }));
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full"
        >
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>

        {/* LGPD Compliance Notice */}
        <div className="text-xs text-gray-500 pt-4 border-t">
          <p className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            <strong>Conformidade LGPD:</strong> Todas as ações de moderação são registradas e os dados são protegidos conforme a Lei Geral de Proteção de Dados.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}