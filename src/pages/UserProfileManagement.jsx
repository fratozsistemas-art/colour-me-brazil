import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Edit2, Trash2, Plus, Check, BookOpen, Palette, Clock, Trophy, Star, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { AVATAR_OPTIONS } from '../components/profile/ProfileSelector';

export default function UserProfileManagement() {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [parentAccount, setParentAccount] = useState(null);
  const [editingProfile, setEditingProfile] = useState(null);
  const [deletingProfile, setDeletingProfile] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState(localStorage.getItem('currentProfileId'));

  const queryClient = useQueryClient();

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser) {
          window.location.href = '/';
          return;
        }
        setUser(currentUser);

        // Get parent account
        const accounts = await base44.entities.ParentAccount.filter({ 
          parent_user_id: currentUser.id 
        });
        
        if (accounts.length > 0) {
          setParentAccount(accounts[0]);
        } else {
          // Create parent account if doesn't exist
          const newAccount = await base44.entities.ParentAccount.create({
            parent_user_id: currentUser.id,
            parent_email: currentUser.email,
            parent_name: currentUser.full_name || currentUser.email,
            child_profiles: [],
            content_approval_required: false,
            screen_time_limit: 0,
            allowed_features: ['reading', 'coloring', 'quizzes', 'showcase', 'forum']
          });
          setParentAccount(newAccount);
        }
        
        setIsLoadingAuth(false);
      } catch (error) {
        console.error('Auth error:', error);
        window.location.href = '/';
      }
    };
    checkAuth();
  }, []);

  // Fetch profiles
  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ['profiles', parentAccount?.id],
    queryFn: async () => {
      if (!parentAccount) return [];
      return await base44.entities.UserProfile.filter({ 
        parent_account_id: parentAccount.id 
      });
    },
    enabled: !!parentAccount
  });

  // Fetch activity logs for selected profile
  const { data: activityLogs = [] } = useQuery({
    queryKey: ['activityLogs', selectedProfileId],
    queryFn: async () => {
      if (!selectedProfileId) return [];
      const logs = await base44.entities.UserActivityLog.filter({ 
        profile_id: selectedProfileId 
      });
      return logs.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 20);
    },
    enabled: !!selectedProfileId
  });

  // Create profile mutation
  const createProfileMutation = useMutation({
    mutationFn: async (profileData) => {
      const newProfile = await base44.entities.UserProfile.create({
        ...profileData,
        parent_account_id: parentAccount.id
      });

      // Update parent account
      await base44.entities.ParentAccount.update(parentAccount.id, {
        child_profiles: [...(parentAccount.child_profiles || []), newProfile.id]
      });

      return newProfile;
    },
    onSuccess: (newProfile) => {
      queryClient.invalidateQueries(['profiles']);
      setShowCreateModal(false);
      toast.success('Perfil criado com sucesso!');
      setSelectedProfileId(newProfile.id);
      localStorage.setItem('currentProfileId', newProfile.id);
    }
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await base44.entities.UserProfile.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['profiles']);
      setEditingProfile(null);
      toast.success('Perfil atualizado com sucesso!');
    }
  });

  // Delete profile mutation
  const deleteProfileMutation = useMutation({
    mutationFn: async (profileId) => {
      // Remove from parent account
      const updatedProfiles = parentAccount.child_profiles.filter(id => id !== profileId);
      await base44.entities.ParentAccount.update(parentAccount.id, {
        child_profiles: updatedProfiles
      });

      // Delete profile
      await base44.entities.UserProfile.delete(profileId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['profiles']);
      setDeletingProfile(null);
      toast.success('Perfil excluído com sucesso!');
      if (selectedProfileId === deletingProfile?.id) {
        setSelectedProfileId(null);
        localStorage.removeItem('currentProfileId');
      }
    }
  });

  const handleSelectProfile = (profileId) => {
    setSelectedProfileId(profileId);
    localStorage.setItem('currentProfileId', profileId);
    toast.success('Perfil selecionado!');
  };

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  const selectedProfile = profiles.find(p => p.id === selectedProfileId);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Gerenciamento de Perfis</h1>
        <p className="text-gray-600">Crie e gerencie perfis para cada criança</p>
      </div>

      {/* Create Profile Button */}
      <div className="mb-6">
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-orange-500 to-pink-500 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Criar Novo Perfil
        </Button>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {profilesLoading ? (
          <div>Carregando perfis...</div>
        ) : profiles.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="text-center py-12">
              <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">Nenhum perfil criado</h3>
              <p className="text-gray-600 mb-4">Crie o primeiro perfil para começar</p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Perfil
              </Button>
            </CardContent>
          </Card>
        ) : (
          profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              isSelected={profile.id === selectedProfileId}
              onSelect={handleSelectProfile}
              onEdit={setEditingProfile}
              onDelete={setDeletingProfile}
            />
          ))
        )}
      </div>

      {/* Selected Profile Stats & History */}
      {selectedProfile && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Estatísticas de {selectedProfile.child_name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <StatItem
                  icon={<BookOpen className="w-5 h-5 text-blue-500" />}
                  label="Livros Completados"
                  value={selectedProfile.books_completed?.length || 0}
                />
                <StatItem
                  icon={<Palette className="w-5 h-5 text-purple-500" />}
                  label="Páginas Coloridas"
                  value={selectedProfile.pages_colored?.length || 0}
                />
                <StatItem
                  icon={<Clock className="w-5 h-5 text-green-500" />}
                  label="Tempo de Colorir"
                  value={`${Math.round((selectedProfile.total_coloring_time || 0) / 60)} min`}
                />
                <StatItem
                  icon={<Star className="w-5 h-5 text-yellow-500" />}
                  label="Pontos Totais"
                  value={selectedProfile.total_points || 0}
                />
                <StatItem
                  icon={<Crown className="w-5 h-5 text-orange-500" />}
                  label="Nível"
                  value={selectedProfile.level || 1}
                />
              </div>
            </CardContent>
          </Card>

          {/* Activity History */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Atividades</CardTitle>
              <CardDescription>Últimas 20 atividades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {activityLogs.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Nenhuma atividade registrada</p>
                ) : (
                  activityLogs.map((log, idx) => (
                    <ActivityLogItem key={idx} log={log} />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create/Edit Profile Modal */}
      <ProfileFormModal
        open={showCreateModal || !!editingProfile}
        onClose={() => {
          setShowCreateModal(false);
          setEditingProfile(null);
        }}
        profile={editingProfile}
        onSubmit={(data) => {
          if (editingProfile) {
            updateProfileMutation.mutate({ id: editingProfile.id, data });
          } else {
            createProfileMutation.mutate(data);
          }
        }}
        isLoading={createProfileMutation.isPending || updateProfileMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deletingProfile} onOpenChange={() => setDeletingProfile(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o perfil de <strong>{deletingProfile?.child_name}</strong>?
              Todas as estatísticas e progresso serão perdidos permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingProfile(null)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteProfileMutation.mutate(deletingProfile.id)}
              disabled={deleteProfileMutation.isPending}
            >
              {deleteProfileMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Profile Card Component
function ProfileCard({ profile, isSelected, onSelect, onEdit, onDelete }) {
  const avatar = AVATAR_OPTIONS.find(a => a.id === profile.avatar_icon);
  
  return (
    <Card className={`transition-all ${isSelected ? 'ring-2 ring-orange-500 shadow-lg' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-5xl">{avatar?.emoji || '👤'}</div>
            <div>
              <CardTitle className="text-xl">{profile.child_name}</CardTitle>
              <p className="text-sm text-gray-500">Nível {profile.level || 1}</p>
            </div>
          </div>
          {isSelected && (
            <div className="bg-green-500 text-white rounded-full p-2">
              <Check className="w-4 h-4" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="bg-blue-50 rounded-lg p-2 text-center">
            <div className="font-bold text-blue-600">{profile.books_completed?.length || 0}</div>
            <div className="text-gray-600 text-xs">Livros</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-2 text-center">
            <div className="font-bold text-purple-600">{profile.pages_colored?.length || 0}</div>
            <div className="text-gray-600 text-xs">Páginas</div>
          </div>
          <div className="bg-green-50 rounded-lg p-2 text-center">
            <div className="font-bold text-green-600">{profile.total_points || 0}</div>
            <div className="text-gray-600 text-xs">Pontos</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-2 text-center">
            <div className="font-bold text-yellow-600">{profile.current_streak || 0}</div>
            <div className="text-gray-600 text-xs">Dias</div>
          </div>
        </div>

        <div className="flex gap-2">
          {!isSelected && (
            <Button 
              onClick={() => onSelect(profile.id)}
              className="flex-1"
              variant="outline"
            >
              Selecionar
            </Button>
          )}
          <Button 
            onClick={() => onEdit(profile)}
            variant="outline"
            size="icon"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button 
            onClick={() => onDelete(profile)}
            variant="outline"
            size="icon"
            className="text-red-500 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Profile Form Modal
function ProfileFormModal({ open, onClose, profile, onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    child_name: '',
    avatar_icon: 'toucan',
    bio: '',
    preferred_language: 'pt',
    narration_language: 'pt',
    reading_level: 'intermediate',
    vocabulary_preference: 'standard'
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        child_name: profile.child_name || '',
        avatar_icon: profile.avatar_icon || 'toucan',
        bio: profile.bio || '',
        preferred_language: profile.preferred_language || 'pt',
        narration_language: profile.narration_language || 'pt',
        reading_level: profile.reading_level || 'intermediate',
        vocabulary_preference: profile.vocabulary_preference || 'standard'
      });
    } else {
      setFormData({
        child_name: '',
        avatar_icon: 'toucan',
        bio: '',
        preferred_language: 'pt',
        narration_language: 'pt',
        reading_level: 'intermediate',
        vocabulary_preference: 'standard'
      });
    }
  }, [profile, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{profile ? 'Editar Perfil' : 'Criar Novo Perfil'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nome da Criança</label>
            <Input
              value={formData.child_name}
              onChange={(e) => setFormData({ ...formData, child_name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Avatar</label>
            <div className="grid grid-cols-4 gap-2">
              {AVATAR_OPTIONS.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, avatar_icon: avatar.id })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.avatar_icon === avatar.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl text-center">{avatar.emoji}</div>
                  <div className="text-xs text-center mt-1">{avatar.name}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <Textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Idioma Preferido</label>
              <Select
                value={formData.preferred_language}
                onValueChange={(value) => setFormData({ ...formData, preferred_language: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt">🇧🇷 Português</SelectItem>
                  <SelectItem value="en">🇺🇸 English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Nível de Leitura</label>
              <Select
                value={formData.reading_level}
                onValueChange={(value) => setFormData({ ...formData, reading_level: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Iniciante</SelectItem>
                  <SelectItem value="intermediate">Intermediário</SelectItem>
                  <SelectItem value="advanced">Avançado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : profile ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Stat Item Component
function StatItem({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-medium text-gray-700">{label}</span>
      </div>
      <span className="font-bold text-gray-900">{value}</span>
    </div>
  );
}

// Activity Log Item
function ActivityLogItem({ log }) {
  const activityLabels = {
    book_started: '📖 Começou a ler',
    book_completed: '✅ Completou livro',
    page_colored: '🎨 Coloriu página',
    quiz_completed: '🧠 Completou quiz',
    daily_challenge_completed: '⭐ Completou desafio',
    achievement_unlocked: '🏆 Desbloqueou conquista'
  };

  return (
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <p className="text-sm font-medium">
          {activityLabels[log.activity_type] || log.activity_type}
        </p>
        <p className="text-xs text-gray-500">
          {new Date(log.created_date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
      {log.points_earned > 0 && (
        <div className="text-xs font-bold text-yellow-600">
          +{log.points_earned} pts
        </div>
      )}
    </div>
  );
}