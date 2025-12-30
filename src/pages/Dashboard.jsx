import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  Trophy, Flame, Star, Book, Palette, Sparkles, 
  TrendingUp, Target, Gift, ChevronRight, Calendar,
  Zap, Award, Crown
} from 'lucide-react';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DailyChallengeCard from '@/components/gamification/DailyChallengeCard';
import DailyQuestCard from '@/components/gamification/DailyQuestCard';
import StreakWidget from '@/components/gamification/StreakWidget';
import ShareButton from '@/components/social/ShareButton';
import SharedReadingList from '@/components/family/SharedReadingList';
import FamilyMessaging from '@/components/family/FamilyMessaging';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [parentAccount, setParentAccount] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const profileId = localStorage.getItem('currentProfileId');
    if (!profileId) {
      toast.error('Selecione um perfil primeiro');
      setLoading(false);
      return;
    }

    try {
      const profiles = await base44.entities.UserProfile.filter({ id: profileId });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
        
        // Load parent account
        const accounts = await base44.entities.ParentAccount.filter({
          id: profiles[0].parent_account_id
        });
        if (accounts.length > 0) {
          setParentAccount(accounts[0]);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  // Recent achievements
  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements', profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      const allAchievements = await base44.entities.Achievement.filter({ profile_id: profile.id });
      return allAchievements.sort((a, b) => new Date(b.unlocked_at) - new Date(a.unlocked_at)).slice(0, 3);
    },
    enabled: !!profile
  });

  // Recommendations based on interests
  const { data: recommendations = [] } = useQuery({
    queryKey: ['recommendations', profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      const recs = await base44.entities.ContentRecommendation.filter({ 
        profile_id: profile.id 
      });
      return recs.filter(r => !r.clicked).sort((a, b) => b.priority - a.priority).slice(0, 4);
    },
    enabled: !!profile
  });

  // Reading progress
  const { data: books = [] } = useQuery({
    queryKey: ['books'],
    queryFn: () => base44.entities.Book.list(),
    enabled: !!profile
  });

  // Family messages (unread count)
  const { data: messages = [] } = useQuery({
    queryKey: ['familyMessages', profile?.id],
    queryFn: () => base44.entities.FamilyMessage.filter({
      recipient_profile_id: profile.id
    }),
    enabled: !!profile,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-gray-600">Carregando seu painel...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <Card className="p-8">
          <Sparkles className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Bem-vindo!</h2>
          <p className="text-gray-600 mb-4">Selecione ou crie um perfil para começar sua aventura</p>
          <a href={createPageUrl('Library')}>
            <Button className="bg-gradient-to-r from-orange-500 to-pink-500">
              Ir para Biblioteca
            </Button>
          </a>
        </Card>
      </div>
    );
  }

  const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 1500, 2500, 4000, 6000, 8500, 11500, 15000, 20000];
  const currentThreshold = LEVEL_THRESHOLDS[profile.level - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[profile.level] || currentThreshold + 5000;
  const progressToNext = profile.level < LEVEL_THRESHOLDS.length 
    ? ((profile.total_points - currentThreshold) / (nextThreshold - currentThreshold)) * 100
    : 100;

  const booksInProgress = books.filter(book => 
    profile.reading_progress?.[book.id] !== undefined && 
    !profile.books_completed?.includes(book.id)
  );

  const unreadMessages = messages.filter(m => !m.is_read);

  return (
    <div className="max-w-7xl mx-auto pb-24">
      {/* Welcome Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-4xl border-4 border-white shadow-lg">
            {profile.avatar_icon}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800">
              Olá, {profile.child_name}! 👋
            </h1>
            <p className="text-gray-600">Continue sua aventura pelo Brasil</p>
          </div>
          {unreadMessages.length > 0 && (
            <Badge className="bg-pink-500 text-white text-lg px-4 py-2 animate-pulse">
              {unreadMessages.length} {unreadMessages.length === 1 ? 'Mensagem Nova' : 'Mensagens Novas'}! 💌
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Family Collaboration Section */}
      {parentAccount && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Tabs defaultValue="messages" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="messages" className="gap-2">
                💌 Mensagens
                {unreadMessages.length > 0 && (
                  <Badge className="bg-red-500 text-white ml-1">{unreadMessages.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="readinglist">📚 Pedir Livros</TabsTrigger>
            </TabsList>

            <TabsContent value="messages">
              <FamilyMessaging
                childProfile={profile}
                parentAccount={parentAccount}
                isParentView={false}
              />
            </TabsContent>

            <TabsContent value="readinglist">
              <SharedReadingList
                childProfile={profile}
                parentAccount={parentAccount}
                isParentView={false}
              />
            </TabsContent>
          </Tabs>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm opacity-90 mb-1">Seu Progresso</div>
                    <div className="text-4xl font-bold">Nível {profile.level}</div>
                    <div className="text-lg opacity-90">{profile.total_points} pontos</div>
                  </div>
                  <div className="text-6xl">⭐</div>
                </div>
                <Progress value={progressToNext} className="h-3 bg-white/20 mb-2" />
                <div className="text-sm opacity-90">
                  {profile.level < LEVEL_THRESHOLDS.length 
                    ? `${nextThreshold - profile.total_points} pontos até nível ${profile.level + 1}`
                    : 'Nível máximo alcançado! 🎉'}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Challenges Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Target className="w-6 h-6 text-orange-500" />
              Desafios de Hoje
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DailyChallengeCard profile={profile} />
              <DailyQuestCard profile={profile} />
            </div>
          </motion.div>

          {/* Recommended Activities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-500" />
                Recomendado para Você
              </h2>
              <Button variant="ghost" size="sm" onClick={() => window.location.href = createPageUrl('Library')}>
                Ver Tudo <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            {recommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((rec) => (
                  <Card key={rec.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">
                          {rec.recommendation_type === 'book' ? '📚' : 
                           rec.recommendation_type === 'coloring_page' ? '🎨' : '✨'}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold mb-1">{rec.title}</h3>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {rec.description}
                          </p>
                          {rec.learning_goals?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {rec.learning_goals.slice(0, 2).map((goal, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {goal}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <Link to={createPageUrl('Library')}>
                            <Button size="sm" variant="outline" className="w-full">
                              Explorar <ChevronRight className="w-3 h-3 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Book className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Comece a explorar para receber recomendações personalizadas!</p>
                  <a href={createPageUrl('Library')}>
                    <Button className="mt-4 bg-gradient-to-r from-orange-500 to-pink-500">
                      Ir para Biblioteca
                    </Button>
                  </a>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Continue Reading */}
          {booksInProgress.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Book className="w-6 h-6 text-blue-500" />
                Continue Lendo
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {booksInProgress.slice(0, 2).map((book) => {
                  const currentPage = profile.reading_progress[book.id] || 0;
                  const progress = ((currentPage + 1) / (book.page_count || 12)) * 100;
                  
                  return (
                    <Card key={book.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          {book.cover_image_url && (
                            <img 
                              src={book.cover_image_url} 
                              alt={book.title_en}
                              className="w-20 h-20 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="font-bold mb-1 line-clamp-1">{book.title_en}</h3>
                            <p className="text-xs text-gray-500 mb-2">
                              Página {currentPage + 1} de {book.page_count || 12}
                            </p>
                            <Progress value={progress} className="h-2 mb-2" />
                            <a href={createPageUrl('Library')}>
                              <Button size="sm" variant="outline" className="w-full">
                                Continuar
                              </Button>
                            </a>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Streak Widget */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StreakWidget profile={profile} />
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Suas Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Livros Completos</span>
                  <span className="font-bold text-lg">{profile.books_completed?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Páginas Coloridas</span>
                  <span className="font-bold text-lg">{profile.pages_colored?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Quizzes Corretos</span>
                  <span className="font-bold text-lg">{profile.quizzes_correct || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Conquistas</span>
                  <span className="font-bold text-lg">{profile.achievements?.length || 0}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Achievements */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Conquistas Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {achievements.length > 0 ? (
                  <div className="space-y-3">
                    {achievements.map((achievement) => (
                      <div key={achievement.id} className="flex items-center gap-3 p-2 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50">
                        <div className="text-2xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm">
                            {achievement.name_pt || achievement.name_en}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(achievement.unlocked_at).toLocaleDateString()}
                          </div>
                        </div>
                        <Award className="w-4 h-4 text-yellow-600" />
                      </div>
                    ))}
                    <Link to={createPageUrl('Profile')}>
                      <Button variant="outline" size="sm" className="w-full">
                        Ver Todas <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      Complete desafios para desbloquear conquistas!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = createPageUrl('Library')}>
                  <Book className="w-4 h-4 mr-2" />
                  Explorar Livros
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = createPageUrl('ArtGallery')}>
                  <Palette className="w-4 h-4 mr-2" />
                  Minha Galeria
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = createPageUrl('Leaderboard')}>
                  <Crown className="w-4 h-4 mr-2" />
                  Ranking
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = createPageUrl('RewardsShop')}>
                  <Gift className="w-4 h-4 mr-2" />
                  Loja de Prêmios
                </Button>
                <ShareButton
                  title="Meu Progresso no Colour Me Brazil"
                  text={`Confira meu progresso no Colour Me Brazil! 📚🎨`}
                  customMessage={`📊 Meu Progresso no Colour Me Brazil:\n✅ ${profile?.books_completed?.length || 0} livros completados\n🎨 ${profile?.pages_colored?.length || 0} páginas coloridas\n⭐ Nível ${profile?.level || 1}\n🔥 ${profile?.current_streak || 0} dias de sequência\n\nJunte-se a mim explorando a cultura brasileira! 🇧🇷`}
                  variant="outline"
                  className="w-full justify-start"
                  showText={true}
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}