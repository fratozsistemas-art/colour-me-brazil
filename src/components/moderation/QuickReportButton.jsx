import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Flag } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function QuickReportButton({ 
  contentType, 
  contentId, 
  reportedUserId = null,
  variant = 'ghost',
  size = 'sm' 
}) {
  const [open, setOpen] = useState(false);
  const [reportType, setReportType] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reportType || !reason.trim()) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await base44.auth.me();
      
      await base44.entities.UserReport.create({
        reporter_id: user.id,
        content_type: contentType,
        content_id: contentId,
        reported_user_id: reportedUserId,
        report_type: reportType,
        reason: reason.trim(),
        status: 'pending'
      });

      toast.success('Denúncia enviada com sucesso. Nossa equipe irá revisar.');
      setOpen(false);
      setReportType('');
      setReason('');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Erro ao enviar denúncia. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size}>
          <Flag className="w-4 h-4 mr-1" />
          Denunciar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Denunciar Conteúdo</DialogTitle>
          <DialogDescription>
            Ajude-nos a manter uma comunidade segura. Descreva o problema abaixo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="report-type">Tipo de Problema</Label>
            <Select value={reportType} onValueChange={setReportType} required>
              <SelectTrigger id="report-type">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inappropriate">Conteúdo Inapropriado</SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="harassment">Assédio/Bullying</SelectItem>
                <SelectItem value="copyright">Violação de Direitos Autorais</SelectItem>
                <SelectItem value="violence">Violência</SelectItem>
                <SelectItem value="misinformation">Desinformação</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="reason">Detalhes</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Descreva o problema em detalhes..."
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !reportType || !reason.trim()}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Denúncia'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}