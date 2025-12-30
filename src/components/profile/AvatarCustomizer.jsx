import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Sparkles } from 'lucide-react';
import { BRAZILIAN_FAUNA_AVATARS } from './BrazilianFaunaAvatars';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AvatarCustomizer({ currentAvatar, profileId, onAvatarChange }) {
  const [uploading, setUploading] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 2MB.');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, envie uma imagem válida.');
      return;
    }

    setUploading(true);
    try {
      const uploadResult = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.UserProfile.update(profileId, {
        profile_picture_url: uploadResult.file_url
      });
      toast.success('Avatar personalizado enviado!');
      onAvatarChange(uploadResult.file_url);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao enviar imagem.');
    } finally {
      setUploading(false);
    }
  };

  const handleSelectPredefined = async (avatarId) => {
    setSelectedAvatar(avatarId);
    await base44.entities.UserProfile.update(profileId, {
      avatar_icon: avatarId
    });
    toast.success('Avatar atualizado!');
    onAvatarChange(avatarId);
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-purple-500" />
        Escolha seu Avatar
      </h3>

      <Tabs defaultValue="fauna" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="fauna">🐆 Fauna Brasileira</TabsTrigger>
          <TabsTrigger value="custom">📸 Personalizado</TabsTrigger>
        </TabsList>

        <TabsContent value="fauna" className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Escolha um animal da fauna brasileira para representar você!
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {BRAZILIAN_FAUNA_AVATARS.map((avatar) => (
              <motion.div
                key={avatar.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  className={`p-3 cursor-pointer transition-all ${
                    selectedAvatar === avatar.id
                      ? 'border-4 border-blue-500 bg-blue-50'
                      : 'hover:border-2 hover:border-blue-300'
                  }`}
                  onClick={() => handleSelectPredefined(avatar.id)}
                >
                  <div className="aspect-square bg-gradient-to-br from-green-50 to-blue-50 rounded-lg mb-2 p-2">
                    {avatar.svg}
                  </div>
                  <p className="text-xs font-semibold text-center">{avatar.namePt}</p>
                  <p className="text-xs text-gray-500 text-center">{avatar.emoji}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Alert className="bg-blue-50 border-blue-200">
            <Upload className="w-4 h-4" />
            <AlertDescription>
              Envie uma foto do seu filho ou uma imagem favorita. 
              <strong> Máximo 2MB.</strong> Recomendamos fotos do rosto ou desenhos.
            </AlertDescription>
          </Alert>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
            <label
              htmlFor="avatar-upload"
              className="cursor-pointer flex flex-col items-center gap-3"
            >
              <Upload className="w-12 h-12 text-gray-400" />
              <div>
                <p className="font-semibold text-gray-700">
                  {uploading ? 'Enviando...' : 'Clique para enviar'}
                </p>
                <p className="text-sm text-gray-500">PNG, JPG - Máx 2MB</p>
              </div>
            </label>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}