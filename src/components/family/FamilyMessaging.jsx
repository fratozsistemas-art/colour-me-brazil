import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Mail, Send, Heart, Star, Trophy, Sparkles, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function FamilyMessaging({ childProfile, parentAccount, isParentView = false }) {
  const [showComposeDialog, setShowComposeDialog] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💌');
  const [selectedType, setSelectedType] = useState('encouragement');

  const queryClient = useQueryClient();

  const messageTypes = [
    { id: 'encouragement', label: 'Incentivo', emoji: '💪', color: 'bg-blue-100 text-blue-700' },
    { id: 'milestone', label: 'Parabéns', emoji: '🎉', color: 'bg-purple-100 text-purple-700' },
    { id: 'reminder', label: 'Lembrete', emoji: '⏰', color: 'bg-orange-100 text-orange-700' },
    { id: 'general', label: 'Geral', emoji: '💌', color: 'bg-pink-100 text-pink-700' }
  ];

  const emojiOptions = ['💌', '💖', '🌟', '⭐', '🎉', '🏆', '👏', '🎨', '📚', '🦜', '🐆', '🌺'];

  // Fetch messages
  const { data: messages = [] } = useQuery({
    queryKey: ['familyMessages', childProfile?.id],
    queryFn: () => base44.entities.FamilyMessage.filter({
      recipient_profile_id: childProfile.id
    }, '-created_date'),
    enabled: !!childProfile,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData) => {
      return base44.entities.FamilyMessage.create(messageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['familyMessages']);
      toast.success('Mensagem enviada com amor! 💌');
      setShowComposeDialog(false);
      setMessageContent('');
      setSelectedEmoji('💌');
      setSelectedType('encouragement');
    },
    onError: (error) => {
      toast.error('Erro ao enviar: ' + error.message);
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (messageId) => {
      return base44.entities.FamilyMessage.update(messageId, {
        is_read: true,
        read_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['familyMessages']);
    }
  });

  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      toast.error('Escreva uma mensagem');
      return;
    }

    const user = await base44.auth.me();
    await sendMessageMutation.mutateAsync({
      parent_account_id: parentAccount.id,
      sender_user_id: user.id,
      sender_name: user.full_name || user.email,
      recipient_profile_id: childProfile.id,
      message_type: selectedType,
      content: messageContent,
      emoji: selectedEmoji,
      is_read: false
    });
  };

  const handleMarkAsRead = (messageId) => {
    markAsReadMutation.mutate(messageId);
  };

  const unreadMessages = messages.filter(m => !m.is_read);

  if (isParentView) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800">💌 Mensagens para {childProfile.child_name}</h3>
            <p className="text-sm text-gray-600">Envie notas de incentivo e carinho</p>
          </div>
          <Button
            onClick={() => setShowComposeDialog(true)}
            className="bg-gradient-to-r from-pink-500 to-purple-500"
          >
            <Send className="w-4 h-4 mr-2" />
            Nova Mensagem
          </Button>
        </div>

        {messages.length === 0 ? (
          <Card className="p-8 text-center">
            <Mail className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 mb-2">Nenhuma mensagem enviada ainda</p>
            <p className="text-sm text-gray-500">
              Envie palavras de incentivo para {childProfile.child_name}!
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => {
              const type = messageTypes.find(t => t.id === message.message_type);
              return (
                <Card key={message.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{message.emoji}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={type?.color}>{type?.label}</Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(message.created_date).toLocaleDateString('pt-BR')}
                        </span>
                        {message.is_read && (
                          <Badge variant="outline" className="text-green-600">
                            ✓ Lida
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-800">{message.content}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Compose Dialog */}
        <Dialog open={showComposeDialog} onOpenChange={setShowComposeDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>💌 Nova Mensagem para {childProfile.child_name}</DialogTitle>
              <DialogDescription>
                Envie uma mensagem de carinho e incentivo
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Message Type */}
              <div>
                <label className="text-sm font-medium mb-2 block">Tipo de Mensagem</label>
                <div className="grid grid-cols-2 gap-2">
                  {messageTypes.map((type) => (
                    <Button
                      key={type.id}
                      variant={selectedType === type.id ? 'default' : 'outline'}
                      onClick={() => setSelectedType(type.id)}
                      className="justify-start"
                      size="sm"
                    >
                      <span className="mr-2">{type.emoji}</span>
                      {type.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Emoji Selector */}
              <div>
                <label className="text-sm font-medium mb-2 block">Escolha um Emoji</label>
                <div className="flex flex-wrap gap-2">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`text-2xl p-2 rounded hover:bg-gray-100 transition-colors ${
                        selectedEmoji === emoji ? 'bg-blue-100 ring-2 ring-blue-500' : ''
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Content */}
              <div>
                <label className="text-sm font-medium mb-2 block">Sua Mensagem</label>
                <Textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Escreva uma mensagem carinhosa..."
                  rows={5}
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Ideias: "Estou orgulhoso(a) de você!", "Continue assim!", "Você é incrível!"
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowComposeDialog(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={!messageContent.trim() || sendMessageMutation.isPending}
                className="bg-gradient-to-r from-pink-500 to-purple-500"
              >
                <Send className="w-4 h-4 mr-2" />
                {sendMessageMutation.isPending ? 'Enviando...' : 'Enviar com Amor'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Child View
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">💌 Mensagens dos Seus Pais</h3>
          <p className="text-gray-600">Palavras especiais só para você!</p>
        </div>
        {unreadMessages.length > 0 && (
          <Badge className="bg-red-500 text-white text-lg px-4 py-2">
            {unreadMessages.length} {unreadMessages.length === 1 ? 'Nova' : 'Novas'}
          </Badge>
        )}
      </div>

      {messages.length === 0 ? (
        <Card className="p-12 text-center bg-gradient-to-br from-pink-50 to-purple-50">
          <div className="text-6xl mb-4">💌</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Você ainda não tem mensagens
          </h3>
          <p className="text-gray-500">
            Em breve seus pais enviarão mensagens especiais para você!
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => {
              const type = messageTypes.find(t => t.id === message.message_type);
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className={`p-6 relative overflow-hidden ${
                      !message.is_read ? 'border-2 border-pink-300 shadow-lg' : ''
                    }`}
                    onClick={() => !message.is_read && handleMarkAsRead(message.id)}
                  >
                    {!message.is_read && (
                      <div className="absolute top-0 right-0 bg-gradient-to-l from-pink-500 to-transparent w-32 h-full opacity-10" />
                    )}
                    <div className="flex items-start gap-4">
                      <div className="text-5xl">{message.emoji}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className={type?.color}>{type?.label}</Badge>
                          {!message.is_read && (
                            <Badge className="bg-pink-500 text-white animate-pulse">
                              NOVO!
                            </Badge>
                          )}
                        </div>
                        <p className="text-lg text-gray-800 leading-relaxed mb-3">
                          {message.content}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            De: <strong>{message.sender_name}</strong>
                          </span>
                          <span className="text-gray-500">
                            {new Date(message.created_date).toLocaleDateString('pt-BR', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}