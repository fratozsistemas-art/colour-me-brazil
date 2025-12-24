import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Flame, Star, TrendingUp, Gift } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function GamificationWidget({ profile }) {
  const { data: recentActivity = [] } = useQuery({
    queryKey: ['recent-activity', profile.id],
    queryFn: async () => {
      const response = await base44.functions.invoke('secureEntityQuery', {
        entity_name: 'UserActivityLog',
        operation: 'filter',
        query: { profile_id: profile.id }
      });
      return response.data.data || [];
    }
  });

  const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 1500, 2500, 4000, 6000, 8500, 11500, 15000, 20000];
  const currentThreshold = LEVEL_THRESHOLDS[profile.level - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[profile.level] || currentThreshold + 5000;
  const progressToNext = profile.level < LEVEL_THRESHOLDS.length 
    ? ((profile.total_points - currentThreshold) / (nextThreshold - currentThreshold)) * 100
    : 100;

  const recentPoints = recentActivity
    .filter(a => {
      const activityDate = new Date(a.created_date);
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return activityDate >= dayAgo;
    })
    .reduce((sum, a) => sum + (a.points_earned || 0), 0);

  return (
    <div className="space-y-3">
      {/* Level & Points Card */}
      <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm opacity-90">Nível {profile.level}</div>
              <div className="text-2xl font-bold">{profile.total_points} pontos</div>
            </div>
            <div className="text-4xl">⭐</div>
          </div>
          <Progress value={progressToNext} className="h-2 bg-white/20" />
          <div className="text-xs mt-1 opacity-90">
            {profile.level < LEVEL_THRESHOLDS.length 
              ? `${nextThreshold - profile.total_points} pontos até nível ${profile.level + 1}`
              : 'Nível máximo alcançado!'}
          </div>
          {recentPoints > 0 && (
            <Badge className="mt-2 bg-white/20">
              +{recentPoints} pts hoje
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <Flame className="w-6 h-6 mx-auto mb-1 text-orange-500" />
            <div className="text-2xl font-bold">{profile.current_streak}</div>
            <div className="text-xs text-gray-600">Dias de sequência</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 text-center">
            <Trophy className="w-6 h-6 mx-auto mb-1 text-yellow-500" />
            <div className="text-2xl font-bold">{profile.achievements?.length || 0}</div>
            <div className="text-xs text-gray-600">Conquistas</div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Link to={createPageUrl('Leaderboard')}>
          <Button variant="outline" size="sm" className="w-full">
            <TrendingUp className="w-3 h-3 mr-1" />
            Ranking
          </Button>
        </Link>
        <Link to={createPageUrl('RewardsShop')}>
          <Button variant="outline" size="sm" className="w-full">
            <Gift className="w-3 h-3 mr-1" />
            Loja
          </Button>
        </Link>
      </div>
    </div>
  );
}