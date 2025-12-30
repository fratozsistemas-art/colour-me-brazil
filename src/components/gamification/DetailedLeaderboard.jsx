import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Trophy, Medal, Crown, Star, Book, Palette, Flame, 
  TrendingUp, Target, Zap, Award 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DetailedLeaderboard({ parentAccountId }) {
  const [category, setCategory] = useState('points');
  const [timeframe, setTimeframe] = useState('all_time');
  const [showDetails, setShowDetails] = useState(null);

  const currentProfileId = localStorage.getItem('currentProfileId');

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['leaderboard', parentAccountId],
    queryFn: async () => {
      const allProfiles = await base44.entities.UserProfile.filter({
        parent_account_id: parentAccountId
      });
      return allProfiles;
    },
    enabled: !!parentAccountId
  });

  // Sort profiles
  const sortedProfiles = [...profiles].sort((a, b) => {
    switch (category) {
      case 'points':
        return (b.total_points || 0) - (a.total_points || 0);
      case 'books':
        return (b.books_completed?.length || 0) - (a.books_completed?.length || 0);
      case 'coloring':
        return (b.pages_colored?.length || 0) - (a.pages_colored?.length || 0);
      case 'streak':
        return (b.current_streak || 0) - (a.current_streak || 0);
      case 'level':
        return (b.level || 1) - (a.level || 1);
      case 'achievements':
        return (b.achievements?.length || 0) - (a.achievements?.length || 0);
      default:
        return 0;
    }
  });

  const getCategoryValue = (profile) => {
    switch (category) {
      case 'points': return profile.total_points || 0;
      case 'books': return profile.books_completed?.length || 0;
      case 'coloring': return profile.pages_colored?.length || 0;
      case 'streak': return profile.current_streak || 0;
      case 'level': return profile.level || 1;
      case 'achievements': return profile.achievements?.length || 0;
      default: return 0;
    }
  };

  const getCategoryLabel = () => {
    switch (category) {
      case 'points': return 'Pontos';
      case 'books': return 'Livros';
      case 'coloring': return 'Páginas';
      case 'streak': return 'Dias';
      case 'level': return 'Nível';
      case 'achievements': return 'Conquistas';
      default: return '';
    }
  };

  const categories = [
    { id: 'points', label: 'Pontos', icon: Star, color: 'from-yellow-500 to-orange-500' },
    { id: 'level', label: 'Nível', icon: TrendingUp, color: 'from-blue-500 to-purple-500' },
    { id: 'books', label: 'Livros', icon: Book, color: 'from-green-500 to-teal-500' },
    { id: 'coloring', label: 'Colorir', icon: Palette, color: 'from-pink-500 to-purple-500' },
    { id: 'streak', label: 'Sequência', icon: Flame, color: 'from-orange-500 to-red-500' },
    { id: 'achievements', label: 'Conquistas', icon: Award, color: 'from-purple-500 to-pink-500' }
  ];

  const topThree = sortedProfiles.slice(0, 3);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Selector */}
      <Card className="p-4">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Button
                key={cat.id}
                variant={category === cat.id ? 'default' : 'outline'}
                onClick={() => setCategory(cat.id)}
                className={`flex flex-col items-center gap-2 h-auto py-3 ${
                  category === cat.id ? `bg-gradient-to-br ${cat.color} text-white` : ''
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{cat.label}</span>
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Podium - Top 3 */}
      <div className="grid grid-cols-3 gap-4 items-end min-h-[300px]">
        {/* 2nd Place */}
        {topThree[1] && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="col-start-1"
          >
            <Card className={`p-6 bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-gray-400 ${
              topThree[1].id === currentProfileId ? 'ring-4 ring-blue-500' : ''
            }`}>
              <div className="text-center">
                <div className="text-6xl mb-2">🥈</div>
                <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-4xl border-4 border-white shadow-lg">
                  {topThree[1].avatar_icon}
                </div>
                <h3 className="font-bold text-lg mb-1">{topThree[1].child_name}</h3>
                <p className="text-sm text-gray-600 mb-3">Nível {topThree[1].level || 1}</p>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-3xl font-bold text-gray-700">
                    {getCategoryValue(topThree[1])}
                  </p>
                  <p className="text-xs text-gray-500">{getCategoryLabel()}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* 1st Place */}
        {topThree[0] && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="col-start-2 transform scale-110"
          >
            <Card className={`p-6 bg-gradient-to-br from-yellow-100 to-yellow-300 border-4 border-yellow-500 ${
              topThree[0].id === currentProfileId ? 'ring-4 ring-blue-500' : ''
            }`}>
              <div className="text-center">
                <div className="text-6xl mb-2 animate-bounce">👑</div>
                <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center text-5xl border-4 border-white shadow-xl">
                  {topThree[0].avatar_icon}
                </div>
                <h3 className="font-bold text-xl mb-1">{topThree[0].child_name}</h3>
                <p className="text-sm text-yellow-700 mb-3">Nível {topThree[0].level || 1}</p>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-4xl font-bold text-yellow-600">
                    {getCategoryValue(topThree[0])}
                  </p>
                  <p className="text-xs text-gray-500">{getCategoryLabel()}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* 3rd Place */}
        {topThree[2] && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="col-start-3"
          >
            <Card className={`p-6 bg-gradient-to-br from-orange-100 to-orange-200 border-4 border-orange-400 ${
              topThree[2].id === currentProfileId ? 'ring-4 ring-blue-500' : ''
            }`}>
              <div className="text-center">
                <div className="text-6xl mb-2">🥉</div>
                <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center text-4xl border-4 border-white shadow-lg">
                  {topThree[2].avatar_icon}
                </div>
                <h3 className="font-bold text-lg mb-1">{topThree[2].child_name}</h3>
                <p className="text-sm text-gray-600 mb-3">Nível {topThree[2].level || 1}</p>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-3xl font-bold text-orange-600">
                    {getCategoryValue(topThree[2])}
                  </p>
                  <p className="text-xs text-gray-500">{getCategoryLabel()}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Rest of Leaderboard */}
      {sortedProfiles.length > 3 && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">🏆 Ranking Completo</h3>
          <div className="space-y-2">
            {sortedProfiles.slice(3).map((profile, index) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                  profile.id === currentProfileId
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-500'
                    : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                }`}>
                  <div className="text-2xl font-bold text-gray-400 w-10 text-center">
                    #{index + 4}
                  </div>
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-200 to-purple-300 flex items-center justify-center text-3xl border-2 border-white shadow">
                    {profile.avatar_icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg">{profile.child_name}</h4>
                    <p className="text-sm text-gray-500">Nível {profile.level || 1}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      {getCategoryValue(profile)}
                    </p>
                    <p className="text-xs text-gray-500">{getCategoryLabel()}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDetails(showDetails === profile.id ? null : profile.id)}
                  >
                    {showDetails === profile.id ? 'Ocultar' : 'Ver'}
                  </Button>
                </div>

                {/* Detailed Stats */}
                <AnimatePresence>
                  {showDetails === profile.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="ml-16 mt-2 grid grid-cols-2 md:grid-cols-4 gap-3"
                    >
                      <Card className="p-3 bg-yellow-50 border-yellow-200">
                        <Star className="w-5 h-5 text-yellow-600 mb-1" />
                        <p className="text-xl font-bold">{profile.total_points || 0}</p>
                        <p className="text-xs text-gray-600">Pontos</p>
                      </Card>
                      <Card className="p-3 bg-green-50 border-green-200">
                        <Book className="w-5 h-5 text-green-600 mb-1" />
                        <p className="text-xl font-bold">{profile.books_completed?.length || 0}</p>
                        <p className="text-xs text-gray-600">Livros</p>
                      </Card>
                      <Card className="p-3 bg-purple-50 border-purple-200">
                        <Palette className="w-5 h-5 text-purple-600 mb-1" />
                        <p className="text-xl font-bold">{profile.pages_colored?.length || 0}</p>
                        <p className="text-xs text-gray-600">Páginas</p>
                      </Card>
                      <Card className="p-3 bg-orange-50 border-orange-200">
                        <Flame className="w-5 h-5 text-orange-600 mb-1" />
                        <p className="text-xl font-bold">{profile.current_streak || 0}</p>
                        <p className="text-xs text-gray-600">Sequência</p>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {profiles.length === 0 && (
        <Card className="p-12 text-center">
          <Trophy className="w-20 h-20 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">Nenhum perfil encontrado</p>
          <p className="text-sm text-gray-400 mt-2">Crie perfis para começar a competir!</p>
        </Card>
      )}
    </div>
  );
}