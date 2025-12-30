import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock, Eye, AlertTriangle, Info } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AgeBasedContentRestrictions({ profile, parentAccount, onUpdate }) {
  const [restrictions, setRestrictions] = useState({
    max_age_content: profile?.max_age_content || 12,
    blocked_tags: profile?.blocked_tags || [],
    allow_ai_generated: profile?.allow_ai_generated !== false,
    allow_user_submissions: profile?.allow_user_submissions !== false,
    restrict_forum: profile?.restrict_forum || false,
    restrict_showcase: profile?.restrict_showcase || false
  });

  const [saving, setSaving] = useState(false);

  const culturalTags = [
    'Folclore', 'Lendas', 'Carnaval', 'Capoeira', 'Samba',
    'História', 'Natureza', 'Animais', 'Arte', 'Música',
    'Festas', 'Comida', 'Esportes', 'Dança'
  ];

  const toggleTag = (tag) => {
    setRestrictions(prev => ({
      ...prev,
      blocked_tags: prev.blocked_tags.includes(tag)
        ? prev.blocked_tags.filter(t => t !== tag)
        : [...prev.blocked_tags, tag]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.entities.UserProfile.update(profile.id, restrictions);
      toast.success('Restrições de conteúdo atualizadas!');
      onUpdate && onUpdate(restrictions);
    } catch (error) {
      console.error('Error saving restrictions:', error);
      toast.error('Erro ao salvar restrições');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="w-4 h-4" />
        <AlertDescription>
          Configure restrições de conteúdo baseadas na idade e preferências do seu filho.
          Essas configurações filtram automaticamente o conteúdo exibido.
        </AlertDescription>
      </Alert>

      {/* Age Restriction */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-bold">Restrição por Idade</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Idade máxima do conteúdo permitido</Label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 8, 10, 12].map((age) => (
                <Button
                  key={age}
                  variant={restrictions.max_age_content === age ? 'default' : 'outline'}
                  onClick={() => setRestrictions(prev => ({ ...prev, max_age_content: age }))}
                  className="w-full"
                >
                  {age} anos
                </Button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Livros recomendados para idade superior serão ocultados
            </p>
          </div>
        </div>
      </Card>

      {/* Theme Restrictions */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-bold">Temas Bloqueados</h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Selecione temas culturais que você NÃO quer que seu filho veja
        </p>
        
        <div className="flex flex-wrap gap-2">
          {culturalTags.map((tag) => (
            <Badge
              key={tag}
              variant={restrictions.blocked_tags.includes(tag) ? 'destructive' : 'outline'}
              className="cursor-pointer text-sm py-2 px-3"
              onClick={() => toggleTag(tag)}
            >
              {restrictions.blocked_tags.includes(tag) && '🚫 '}
              {tag}
            </Badge>
          ))}
        </div>
        
        <p className="text-xs text-gray-500 mt-3">
          Tags bloqueadas: {restrictions.blocked_tags.length}
        </p>
      </Card>

      {/* Feature Restrictions */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-bold">Restrições de Funcionalidades</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Label htmlFor="ai-content" className="font-medium">
                Permitir conteúdo gerado por IA
              </Label>
              <p className="text-xs text-gray-600">
                Histórias e imagens criadas por inteligência artificial
              </p>
            </div>
            <Switch
              id="ai-content"
              checked={restrictions.allow_ai_generated}
              onCheckedChange={(checked) => 
                setRestrictions(prev => ({ ...prev, allow_ai_generated: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Label htmlFor="user-submissions" className="font-medium">
                Permitir conteúdo de usuários
              </Label>
              <p className="text-xs text-gray-600">
                Histórias e arte compartilhadas por outros usuários
              </p>
            </div>
            <Switch
              id="user-submissions"
              checked={restrictions.allow_user_submissions}
              onCheckedChange={(checked) => 
                setRestrictions(prev => ({ ...prev, allow_user_submissions: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Label htmlFor="restrict-forum" className="font-medium">
                Restringir acesso ao fórum
              </Label>
              <p className="text-xs text-gray-600">
                Bloquear participação em discussões da comunidade
              </p>
            </div>
            <Switch
              id="restrict-forum"
              checked={restrictions.restrict_forum}
              onCheckedChange={(checked) => 
                setRestrictions(prev => ({ ...prev, restrict_forum: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Label htmlFor="restrict-showcase" className="font-medium">
                Restringir visualização do showcase
              </Label>
              <p className="text-xs text-gray-600">
                Bloquear acesso à galeria pública de trabalhos
              </p>
            </div>
            <Switch
              id="restrict-showcase"
              checked={restrictions.restrict_showcase}
              onCheckedChange={(checked) => 
                setRestrictions(prev => ({ ...prev, restrict_showcase: checked }))
              }
            />
          </div>
        </div>
      </Card>

      {/* LGPD Notice */}
      <Alert className="bg-green-50 border-green-200">
        <Shield className="w-4 h-4" />
        <AlertDescription className="text-xs">
          <strong>Conformidade LGPD:</strong> Todas as restrições são aplicadas automaticamente 
          e registradas para conformidade com a Lei Geral de Proteção de Dados. 
          Dados sensíveis de crianças são protegidos com criptografia adicional.
        </AlertDescription>
      </Alert>

      {/* Save Button */}
      <Button 
        onClick={handleSave} 
        disabled={saving}
        className="w-full bg-green-600 hover:bg-green-700"
      >
        {saving ? 'Salvando...' : 'Salvar Restrições'}
      </Button>
    </div>
  );
}