import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Trophy, Medal, Crown, TrendingUp, Book, Palette, Flame, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Leaderboard() {
  const [timeframe, setTimeframe] = useState('all_time');
  const [category, setCategory] = useState('points');

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const allProfiles = await base44.entities.UserProfile.list();
      return allProfiles;
    }
  });

  // Sort profiles based on selected category
  const sortedProfiles = [...filteredProfiles].sort((a, b) => {
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
      default:
        return 0;
    }
  });

  const topThree = sortedProfiles.slice(0, 3);
  const restOfLeaderboard = sortedProfiles.slice(3, 20);

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'points': return <Star className="w-4 h-4" />;
      case 'books': return <Book className="w-4 h-4" />;
      case 'coloring': return <Palette className="w-4 h-4" />;
      case 'streak': return <Flame className="w-4 h-4" />;
      case 'level': return <TrendingUp className="w-4 h-4" />;
      default: return <Trophy className="w-4 h-4" />;
    }
  };

  const getCategoryValue = (profile, cat) => {
    switch (cat) {
      case 'points': return profile.total_points || 0;
      case 'books': return profile.books_completed?.length || 0;
      case 'coloring': return profile.pages_colored?.length || 0;
      case 'streak': return `${profile.current_streak || 0} days`;
      case 'level': return `Level ${profile.level || 1}`;
      default: return 0;
    }
  };

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'points': return 'Points';
      case 'books': return 'Books Completed';
      case 'coloring': return 'Pages Colored';
      case 'streak': return 'Current Streak';
      case 'level': return 'Level';
      default: return '';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="mt-4 text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Trophy className="w-10 h-10 text-yellow-500" />
          <span className="text-gradient-brand">Leaderboard</span>
        </h1>
        <p className="text-gray-600">See how you rank against other young explorers!</p>
      </div>

      {/* Category Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {['points', 'level', 'books', 'coloring', 'streak'].map((cat) => (
            <Button
              key={cat}
              variant={category === cat ? 'default' : 'outline'}
              onClick={() => setCategory(cat)}
              className="flex items-center gap-2"
              style={category === cat ? {
                background: 'linear-gradient(135deg, #FF6B35 0%, #2E86AB 100%)',
                color: '#FFFFFF'
              } : {}}
            >
              {getCategoryIcon(cat)}
              <span className="capitalize">{cat}</span>
            </Button>
          ))}
        </div>
      </Card>

      {/* Top 3 Podium */}
      <div className="mb-8 grid grid-cols-3 gap-4 items-end">
        {/* 2nd Place */}
        {topThree[1] && (
          <Card className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-gray-400">
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-3xl border-4 border-white shadow-lg">
                  {topThree[1].avatar_icon}
                </div>
              </div>
              <Medal className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <h3 className="font-bold text-lg mb-1">{topThree[1].child_name}</h3>
              <p className="text-sm text-gray-600 mb-2">Level {topThree[1].level || 1}</p>
              <div className="bg-white rounded-lg p-2">
                <p className="text-xl font-bold text-gray-700">
                  {getCategoryValue(topThree[1], category)}
                </p>
                <p className="text-xs text-gray-500">{getCategoryLabel(category)}</p>
              </div>
            </div>
          </Card>
        )}

        {/* 1st Place */}
        {topThree[0] && (
          <Card className="p-6 bg-gradient-to-br from-yellow-100 to-yellow-300 border-4 border-yellow-500 transform scale-110">
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center text-4xl border-4 border-white shadow-xl">
                  {topThree[0].avatar_icon}
                </div>
              </div>
              <Crown className="w-10 h-10 text-yellow-600 mx-auto mb-2 animate-pulse" />
              <h3 className="font-bold text-xl mb-1">{topThree[0].child_name}</h3>
              <p className="text-sm text-yellow-700 mb-2">Level {topThree[0].level || 1}</p>
              <div className="bg-white rounded-lg p-3">
                <p className="text-2xl font-bold text-yellow-600">
                  {getCategoryValue(topThree[0], category)}
                </p>
                <p className="text-xs text-gray-500">{getCategoryLabel(category)}</p>
              </div>
            </div>
          </Card>
        )}

        {/* 3rd Place */}
        {topThree[2] && (
          <Card className="p-6 bg-gradient-to-br from-orange-100 to-orange-200 border-4 border-orange-400">
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center text-3xl border-4 border-white shadow-lg">
                  {topThree[2].avatar_icon}
                </div>
              </div>
              <Medal className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <h3 className="font-bold text-lg mb-1">{topThree[2].child_name}</h3>
              <p className="text-sm text-gray-600 mb-2">Level {topThree[2].level || 1}</p>
              <div className="bg-white rounded-lg p-2">
                <p className="text-xl font-bold text-orange-600">
                  {getCategoryValue(topThree[2], category)}
                </p>
                <p className="text-xs text-gray-500">{getCategoryLabel(category)}</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Rest of Leaderboard */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Top Explorers</h2>
        <div className="space-y-3">
          {restOfLeaderboard.map((profile, index) => (
            <div
              key={profile.id}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="text-2xl font-bold text-gray-400 w-8 text-center">
                #{index + 4}
              </div>
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-200 to-purple-300 flex items-center justify-center text-2xl border-2 border-white shadow">
                {profile.avatar_icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{profile.child_name}</h3>
                <p className="text-sm text-gray-500">Level {profile.level || 1}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-blue-600">
                  {getCategoryValue(profile, category)}
                </p>
                <p className="text-xs text-gray-500">{getCategoryLabel(category)}</p>
              </div>
            </div>
          ))}
        </div>

        {sortedProfiles.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No profiles yet. Be the first!</p>
          </div>
        )}
      </Card>
    </div>
  );
}