import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

export default function BugReportForm({ onClose, profileId, currentUrl }) {
  const [reportReason, setReportReason] = useState('bug_report');
  const [reportDescription, setReportDescription] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleScreenshot = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo 5MB.');
        return;
      }
      setScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeScreenshot = () => {
    setScreenshot(null);
    setScreenshotPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!profileId) {
        toast.error('Não foi possível identificar o perfil do usuário.');
        setSubmitting(false);
        return;
      }

      let screenshotUrl = null;

      // Upload screenshot if provided
      if (screenshot) {
        setUploading(true);
        try {
          const uploadResult = await base44.integrations.Core.UploadFile({
            file: screenshot
          });
          screenshotUrl = uploadResult.file_url;
        } catch (error) {
          console.error('Erro ao fazer upload do screenshot:', error);
          toast.error('Erro ao fazer upload da imagem. Continuando sem ela...');
        } finally {
          setUploading(false);
        }
      }

      // Create bug report
      const contentPreview = screenshotUrl 
        ? `URL: ${currentUrl}\nScreenshot: ${screenshotUrl}`
        : `URL: ${currentUrl}`;

      await base44.entities.UserReport.create({
        reporter_profile_id: profileId,
        reported_content_type: 'application_bug',
        reported_content_id: currentUrl,
        report_reason: reportReason,
        report_description: reportDescription,
        status: 'pending',
        priority: reportReason === 'bug_report' ? 'high' : 'medium',
        ai_analysis: screenshotUrl ? { screenshot_url: screenshotUrl } : {}
      });

      toast.success('Relatório enviado com sucesso! Obrigado pela sua ajuda 🎉');
      onClose();
    } catch (error) {
      console.error('Erro ao enviar relatório:', error);
      toast.error('Erro ao enviar relatório. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="reportReason">Tipo de Problema</Label>
        <Select value={reportReason} onValueChange={setReportReason}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bug_report">🐛 Bug / Erro Técnico</SelectItem>
            <SelectItem value="inappropriate_language">⚠️ Linguagem Inapropriada</SelectItem>
            <SelectItem value="spam">📧 Spam</SelectItem>
            <SelectItem value="other">📝 Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="reportDescription">Descrição Detalhada</Label>
        <Textarea
          id="reportDescription"
          value={reportDescription}
          onChange={(e) => setReportDescription(e.target.value)}
          required
          rows={5}
          placeholder="Descreva o problema: O que aconteceu? O que você esperava que acontecesse? Como podemos reproduzir?"
          className="resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Página atual: {currentUrl}
        </p>
      </div>

      <div>
        <Label>Screenshot (Opcional)</Label>
        <div className="mt-2">
          {screenshotPreview ? (
            <div className="relative">
              <img 
                src={screenshotPreview} 
                alt="Screenshot preview" 
                className="w-full rounded-lg border"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={removeScreenshot}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={handleScreenshot}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              Anexar Screenshot
            </Button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          PNG, JPG ou JPEG. Máximo 5MB.
        </p>
      </div>

      <div className="flex gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          disabled={submitting || uploading}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={submitting || uploading}
          className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            'Enviar Relatório'
          )}
        </Button>
      </div>
    </form>
  );
}