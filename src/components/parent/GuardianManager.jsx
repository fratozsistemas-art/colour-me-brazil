import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  UserPlus, Mail, Shield, X, Check, Clock, 
  Eye, Settings as SettingsIcon, FileCheck, Target, Users
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function GuardianManager({ parentAccount, currentUser }) {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [invitePermissions, setInvitePermissions] = useState({
    view_progress: true,
    manage_profiles: false,
    approve_content: false,
    manage_settings: false,
    set_goals: false,
    manage_guardians: false
  });
  const [editingGuardian, setEditingGuardian] = useState(null);

  const queryClient = useQueryClient();

  const isOwner = parentAccount.owner_user_id === currentUser.id;
  const currentGuardian = parentAccount.co_guardians?.find(g => g.user_id === currentUser.id);
  const canManageGuardians = isOwner || currentGuardian?.permissions?.manage_guardians;

  const inviteGuardianMutation = useMutation({
    mutationFn: async (guardianData) => {
      const newGuardian = {
        email: guardianData.email,
        name: guardianData.name,
        permissions: guardianData.permissions,
        status: 'pending',
        invited_at: new Date().toISOString()
      };

      const updatedGuardians = [...(parentAccount.co_guardians || []), newGuardian];

      await base44.entities.ParentAccount.update(parentAccount.id, {
        co_guardians: updatedGuardians
      });

      // TODO: Send email invitation
      try {
        await base44.integrations.Core.SendEmail({
          to: guardianData.email,
          subject: 'Convite para Gerenciar Conta Familiar - Colour Me Brazil',
          body: `
            Olá ${guardianData.name},

            Você foi convidado(a) por ${parentAccount.owner_name} para ser co-responsável da conta familiar no Colour Me Brazil.

            Para aceitar o convite, faça login ou crie uma conta em: ${window.location.origin}

            Este convite permite que você ajude a gerenciar e acompanhar o progresso das crianças.

            Atenciosamente,
            Equipe Colour Me Brazil
          `
        });
      } catch (error) {
        console.error('Failed to send invitation email:', error);
      }

      return newGuardian;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['parentAccount']);
      toast.success('Convite enviado com sucesso!');
      setShowInviteDialog(false);
      setInviteEmail('');
      setInviteName('');
      setInvitePermissions({
        view_progress: true,
        manage_profiles: false,
        approve_content: false,
        manage_settings: false,
        set_goals: false,
        manage_guardians: false
      });
    },
    onError: (error) => {
      toast.error('Erro ao enviar convite: ' + error.message);
    }
  });

  const updateGuardianMutation = useMutation({
    mutationFn: async ({ guardianEmail, updates }) => {
      const updatedGuardians = parentAccount.co_guardians.map(g => 
        g.email === guardianEmail ? { ...g, ...updates } : g
      );

      await base44.entities.ParentAccount.update(parentAccount.id, {
        co_guardians: updatedGuardians
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['parentAccount']);
      toast.success('Permissões atualizadas!');
      setEditingGuardian(null);
    },
    onError: (error) => {
      toast.error('Erro ao atualizar: ' + error.message);
    }
  });

  const removeGuardianMutation = useMutation({
    mutationFn: async (guardianEmail) => {
      const updatedGuardians = parentAccount.co_guardians.filter(g => g.email !== guardianEmail);

      await base44.entities.ParentAccount.update(parentAccount.id, {
        co_guardians: updatedGuardians
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['parentAccount']);
      toast.success('Responsável removido!');
    },
    onError: (error) => {
      toast.error('Erro ao remover: ' + error.message);
    }
  });

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    if (!inviteEmail || !inviteName) {
      toast.error('Preencha todos os campos');
      return;
    }
    inviteGuardianMutation.mutate({
      email: inviteEmail,
      name: inviteName,
      permissions: invitePermissions
    });
  };

  const handleAcceptInvite = async () => {
    const myInvite = parentAccount.co_guardians?.find(
      g => g.email === currentUser.email && g.status === 'pending'
    );

    if (myInvite) {
      await updateGuardianMutation.mutateAsync({
        guardianEmail: currentUser.email,
        updates: {
          status: 'active',
          user_id: currentUser.id,
          joined_at: new Date().toISOString()
        }
      });
    }
  };

  const permissionLabels = {
    view_progress: { label: 'Visualizar Progresso', icon: Eye, desc: 'Ver estatísticas e atividades das crianças' },
    manage_profiles: { label: 'Gerenciar Perfis', icon: Users, desc: 'Criar e editar perfis infantis' },
    approve_content: { label: 'Aprovar Conteúdo', icon: FileCheck, desc: 'Revisar e aprovar submissões' },
    manage_settings: { label: 'Gerenciar Configurações', icon: SettingsIcon, desc: 'Alterar configurações de segurança' },
    set_goals: { label: 'Definir Metas', icon: Target, desc: 'Criar e gerenciar metas de leitura' },
    manage_guardians: { label: 'Gerenciar Responsáveis', icon: Shield, desc: 'Convidar e remover outros responsáveis' }
  };

  // Check if current user has pending invite
  const myPendingInvite = parentAccount.co_guardians?.find(
    g => g.email === currentUser.email && g.status === 'pending'
  );

  return (
    <div className="space-y-6">
      {/* Pending Invite Banner */}
      {myPendingInvite && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                📧 Você foi convidado!
              </h3>
              <p className="text-blue-700 mb-4">
                {parentAccount.owner_name} convidou você para ser co-responsável desta conta familiar.
              </p>
            </div>
            <Button
              onClick={handleAcceptInvite}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Check className="w-4 h-4 mr-2" />
              Aceitar Convite
            </Button>
          </div>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Responsáveis</h2>
          <p className="text-gray-600">Gerencie quem pode acessar e gerenciar esta conta familiar</p>
        </div>
        {canManageGuardians && (
          <Button
            onClick={() => setShowInviteDialog(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Convidar Responsável
          </Button>
        )}
      </div>

      {/* Owner Card */}
      <Card className="p-6 border-2 border-orange-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Shield className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-800">{parentAccount.owner_name}</h3>
                <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full font-medium">
                  Proprietário
                </span>
              </div>
              <p className="text-sm text-gray-600">{parentAccount.owner_email}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Acesso Total</p>
            <p className="text-xs text-green-600 font-medium mt-1">✓ Todas as Permissões</p>
          </div>
        </div>
      </Card>

      {/* Co-Guardians List */}
      <div className="space-y-3">
        {parentAccount.co_guardians?.map((guardian, index) => {
          const Icon = guardian.status === 'pending' ? Clock : 
                      guardian.status === 'active' ? Check : X;
          const statusColor = guardian.status === 'pending' ? 'text-yellow-600' :
                            guardian.status === 'active' ? 'text-green-600' : 'text-gray-400';

          return (
            <Card key={index} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${statusColor}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800">{guardian.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        guardian.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        guardian.status === 'active' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {guardian.status === 'pending' ? 'Pendente' :
                         guardian.status === 'active' ? 'Ativo' : 'Removido'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{guardian.email}</p>

                    {/* Permissions Summary */}
                    {guardian.status === 'active' && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {Object.entries(guardian.permissions || {}).filter(([_, val]) => val).map(([key]) => {
                          const perm = permissionLabels[key];
                          if (!perm) return null;
                          const Icon = perm.icon;
                          return (
                            <div
                              key={key}
                              className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                            >
                              <Icon className="w-3 h-3" />
                              {perm.label}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {guardian.status === 'pending' && (
                      <p className="text-xs text-gray-500">
                        Convidado em {new Date(guardian.invited_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {canManageGuardians && guardian.email !== currentUser.email && (
                  <div className="flex gap-2">
                    {guardian.status === 'active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingGuardian(guardian)}
                      >
                        <SettingsIcon className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (confirm(`Remover ${guardian.name}?`)) {
                          removeGuardianMutation.mutate(guardian.email);
                        }
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          );
        })}

        {(!parentAccount.co_guardians || parentAccount.co_guardians.length === 0) && (
          <Card className="p-8 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 mb-2">Nenhum co-responsável adicionado</p>
            <p className="text-sm text-gray-500">
              Convide outros responsáveis para colaborar no cuidado das crianças
            </p>
          </Card>
        )}
      </div>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Convidar Co-Responsável</DialogTitle>
            <DialogDescription>
              Convide outro adulto para ajudar a gerenciar esta conta familiar
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleInviteSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Maria Silva"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="maria@exemplo.com"
                  required
                />
              </div>

              <div>
                <Label className="text-base mb-3 block">Permissões</Label>
                <div className="space-y-3">
                  {Object.entries(permissionLabels).map(([key, value]) => {
                    const Icon = value.icon;
                    return (
                      <div key={key} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <Switch
                          checked={invitePermissions[key]}
                          onCheckedChange={(checked) => 
                            setInvitePermissions(prev => ({ ...prev, [key]: checked }))
                          }
                          id={`perm-${key}`}
                        />
                        <div className="flex-1">
                          <label htmlFor={`perm-${key}`} className="flex items-center gap-2 cursor-pointer">
                            <Icon className="w-4 h-4 text-gray-600" />
                            <span className="font-medium text-gray-800">{value.label}</span>
                          </label>
                          <p className="text-xs text-gray-600 mt-1">{value.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowInviteDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={inviteGuardianMutation.isPending}>
                <Mail className="w-4 h-4 mr-2" />
                {inviteGuardianMutation.isPending ? 'Enviando...' : 'Enviar Convite'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Permissions Dialog */}
      {editingGuardian && (
        <Dialog open={!!editingGuardian} onOpenChange={() => setEditingGuardian(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Permissões - {editingGuardian.name}</DialogTitle>
              <DialogDescription>{editingGuardian.email}</DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              {Object.entries(permissionLabels).map(([key, value]) => {
                const Icon = value.icon;
                const [checked, setChecked] = useState(editingGuardian.permissions?.[key] || false);
                
                return (
                  <div key={key} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Switch
                      checked={checked}
                      onCheckedChange={(val) => {
                        setChecked(val);
                        editingGuardian.permissions[key] = val;
                      }}
                      id={`edit-perm-${key}`}
                    />
                    <div className="flex-1">
                      <label htmlFor={`edit-perm-${key}`} className="flex items-center gap-2 cursor-pointer">
                        <Icon className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-gray-800">{value.label}</span>
                      </label>
                      <p className="text-xs text-gray-600 mt-1">{value.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingGuardian(null)}>
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  updateGuardianMutation.mutate({
                    guardianEmail: editingGuardian.email,
                    updates: { permissions: editingGuardian.permissions }
                  });
                }}
                disabled={updateGuardianMutation.isPending}
              >
                {updateGuardianMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}