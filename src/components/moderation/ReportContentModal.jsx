import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertTriangle, Shield, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ReportContentModal({ open, onClose, contentType, contentId, contentPreview }) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reasons = [
    { value: 'inappropriate_language', label: 'Linguagem inapropriada' },
    { value: 'bullying', label: 'Bullying ou assédio' },
    { value: 'spam', label: 'Spam ou propaganda' },
    { value: 'personal_info', label: 'Informações pessoais expostas' },
    { value: 'violence', label: 'Violência ou ameaças' },
    { value: 'adult_content', label: 'Conteúdo adulto' },
    { value: 'hate_speech', label: 'Discurso de ódio' },
    { value: 'other', label: 'Outro motivo' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reason) {
      toast.error('Por favor, selecione um motivo');
      return;
    }

    setSubmitting(true);

    try {
      const currentProfileId = localStorage.getItem('currentProfileId');
      
      const response = await base44.functions.invoke('processUserReport', {
        reported_content_type: contentType,
        reported_content_id: contentId,
        report_reason: reason,
        report_description: description,
        current_profile_id: currentProfileId
      });

      if (response.data.success) {
        toast.success(response.data.message || 'Denúncia enviada com sucesso!');
        onClose();
        setReason('');
        setDescription('');
      } else {
        toast.error(response.data.error || 'Erro ao enviar denúncia');
      }
    } catch (error) {
      console.error('Report error:', error);
      toast.error('Erro ao enviar denúncia');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Denunciar Conteúdo
          </DialogTitle>
          <DialogDescription>
            Ajude-nos a manter nossa comunidade segura reportando conteúdo inapropriado
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {contentPreview && (
            <div className="p-3 bg-gray-50 rounded-lg border">
              <p className="text-sm text-gray-600 line-clamp-3">{contentPreview}</p>
            </div>
          )}

          <div>
            <Label className="mb-3 block">Motivo da denúncia *</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              <div className="space-y-2">
                {reasons.map((r) => (
                  <div key={r.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={r.value} id={r.value} />
                    <Label htmlFor={r.value} className="font-normal cursor-pointer">
                      {r.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="description">Detalhes adicionais (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Forneça mais informações sobre o problema..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-800">
              Sua denúncia será analisada por nossa equipe de moderação e IA. 
              Você receberá feedback sobre a ação tomada.
            </p>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting} className="flex-1">
              <Send className="w-4 h-4 mr-2" />
              {submitting ? 'Enviando...' : 'Enviar Denúncia'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}