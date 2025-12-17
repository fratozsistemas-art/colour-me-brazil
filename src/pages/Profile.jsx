import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Book, Palette, Clock, Star, Award, Zap, Globe, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProfileAchievements, checkAndAwardAchievements, calculateLevel, getPointsForNextLevel } from '../components/achievementManager';
import LevelProgressBar from '../components/gamification/LevelProgressBar';
import ShareButton from '../components/social/ShareButton';
import TierDisplay from '../components/profile/TierDisplay';
import { getTierFromPoints } from '../components/gamification/tierSystem';
import { getMasteryBadgeProgress, checkAndAwardMasteryBadges } from '../components/gamification/masteryBadgeManager';

export default function Profile() {
  const currentProfileId = localStorage.getItem('currentProfileId');

  const { data: profile } = useQuery({
    queryKey: ['profile', currentProfileId],
    queryFn: async () => {
      if (!currentProfileId) return null;
      const profiles = await base44.entities.UserProfile.list();
      return profiles.find(p => p.id === currentProfileId);
    },
    enabled: !!currentProfileId
  });

  const { data: books = [] } = useQuery({
    queryKey: ['books'],
    queryFn: () => base44.entities.Book.list(),
  });

  const { data: achievements = [], refetch: refetchAchievements } = useQuery({
    queryKey: ['achievements', currentProfileId],
    queryFn: () => getProfileAchievements(currentProfileId),
    enabled: !!currentProfileId
  });

  const { data: coloringSessions = [] } = useQuery({
    queryKey: ['coloringSessions', currentProfileId],
    queryFn: () => base44.entities.ColoringSession.filter({ profile_id: currentProfileId }),
    enabled: !!currentProfileId
  });

  const { data: masteryBadges = [], refetch: refetchMasteryBadges } = useQuery({
    queryKey: ['masteryBadges', currentProfileId],
    queryFn: () => getMasteryBadgeProgress(currentProfileId),
    enabled: !!currentProfileId
  });

  // Check for new achievements and mastery badges on mount
  useEffect(() => {
    if (currentProfileId) {
      checkAndAwardAchievements(currentProfileId).then(newAchievements => {
        if (newAchievements.length > 0) {
          refetchAchievements();
        }
      });
      checkAndAwardMasteryBadges(currentProfileId).then(newBadges => {
        if (newBadges.length > 0) {
          refetchMasteryBadges();
        }
      });
    }
  }, [currentProfileId]);

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No profile selected. Please go to the Library.</p>
      </div>
    );
  }

  const AVATAR_OPTIONS = [
    { id: 'jaguar', emoji: '🐆' }, { id: 'sloth', emoji: '🦥' }, { id: 'toucan', emoji: '🦜' },
    { id: 'monkey', emoji: '🐒' }, { id: 'samba_dancer', emoji: '💃' }, { id: 'football', emoji: '⚽' },
    { id: 'carnival_mask', emoji: '🎭' }, { id: 'palm_tree', emoji: '🌴' }, { id: 'amazon_river', emoji: '🌊' },
    { id: 'coffee', emoji: '☕' }, { id: 'fruit', emoji: '🍹' }, { id: 'capybara', emoji: '🦫' },
    { id: 'macaw', emoji: '🦚' }, { id: 'flower', emoji: '🌺' }, { id: 'sun', emoji: '☀️' }
  ];

  const avatar = AVATAR_OPTIONS.find(a => a.id === profile.avatar_icon);
  const totalPages = books.reduce((sum, book) => sum + (book.page_count || 0), 0);
  const completedSessions = coloringSessions.filter(s => s.is_completed);
  const coloredPages = completedSessions.length;
  const overallProgress = totalPages > 0 ? Math.round((coloredPages / totalPages) * 100) : 0;

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const currentTier = getTierFromPoints(profile.total_points || 0);
  const unlockedMasteryBadges = masteryBadges.filter(b => b.unlocked);
  
  // Calculate detailed statistics
  const stats = {
    totalTime: coloringSessions.reduce((sum, s) => sum + (s.coloring_time || 0), 0),
    averageTimePerPage: coloredPages > 0 
      ? Math.round(coloringSessions.reduce((sum, s) => sum + (s.coloring_time || 0), 0) / coloredPages)
      : 0,
    longestSession: Math.max(...coloringSessions.map(s => s.coloring_time || 0), 0),
    totalStrokes: coloringSessions.reduce((sum, s) => {
      try {
        const strokes = JSON.parse(s.strokes || '[]');
        return sum + strokes.length;
      } catch {
        return sum;
      }
    }, 0),
    booksInProgress: [...new Set(coloringSessions.filter(s => !s.is_completed).map(s => s.book_id))].length
  };

  return (
    <div className="max-w-6xl mx-auto pb-24 md:pb-8">
      {/* Level Progress */}
      <div className="mb-6">
        <LevelProgressBar profile={profile} showDetails={true} />
      </div>

      {/* Profile Header */}
      <Card className={`p-8 mb-8 relative overflow-hidden ${currentTier.borderStyle}`}>
        <div 
          className={`absolute inset-0 bg-gradient-to-br opacity-10 ${currentTier.color}`}
        />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <div className="text-8xl">{avatar?.emoji || '👤'}</div>
            {currentTier.rewards.avatarFrame && (
              <div className={`absolute inset-0 rounded-full border-4 ${currentTier.borderStyle} pointer-events-none`} />
            )}
            {profile.equipped_avatar_items?.length > 0 && (
              <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {profile.equipped_avatar_items.length}
              </div>
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
              <h1 className="text-4xl font-bold text-gray-800">{profile.child_name}</h1>
              <span className="text-2xl">{currentTier.icon}</span>
            </div>
            <p className="text-gray-600 mb-1">
              {currentTier.rewards.title && (
                <span className="font-semibold text-purple-600">{currentTier.rewards.title} • </span>
              )}
              {currentTier.name} Tier {currentTier.tier}
            </p>
            <p className="text-gray-600 mb-3">Level {profile.level || 1} • {profile.total_points || 0} points</p>
            <div className="bg-white rounded-full h-3 overflow-hidden shadow-inner mb-2">
              <div 
                className="h-full transition-all duration-500"
                style={{ 
                  width: `${((profile.total_points || 0) % 500) / 5}%`,
                  background: 'linear-gradient(135deg, #FF6B35 0%, #2E86AB 100%)'
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mb-4">
              {500 - ((profile.total_points || 0) % 500)} points to level {(profile.level || 1) + 1}
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Book className="w-4 h-4" />
                {profile.books_completed?.length || 0} books
              </span>
              <span className="flex items-center gap-1">
                <Palette className="w-4 h-4" />
                {coloredPages} pages
              </span>
              <span className="flex items-center gap-1">
                <Trophy className="w-4 h-4" />
                {unlockedAchievements.length} achievements
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-center">
              <div className="text-5xl font-bold mb-1" style={{ color: '#FF6B35' }}>{overallProgress}%</div>
              <div className="text-sm" style={{ color: '#6C757D' }}>Progress</div>
            </div>
            <ShareButton
              title={`${profile.child_name}'s Profile`}
              text={`I'm Level ${profile.level || 1} on Colour Me Brazil! Check out my progress! 🎨`}
              variant="outline"
            />
          </div>
        </div>
      </Card>

      {/* Tier Progression */}
      <TierDisplay points={profile.total_points || 0} showRewards={true} />

      <div className="grid md:grid-cols-2 gap-8 mt-8">
        {/* Statistics */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500" />
            Statistics
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 rounded-lg" style={{ backgroundColor: '#FFF8F0' }}>
              <div className="flex items-center gap-3">
                <Book className="w-6 h-6" style={{ color: '#FF6B35' }} />
                <span className="font-medium">Books Completed</span>
              </div>
              <span className="text-2xl font-bold" style={{ color: '#FF6B35' }}>
                {profile.books_completed?.length || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-lg" style={{ backgroundColor: '#FFF8F0' }}>
              <div className="flex items-center gap-3">
                <Palette className="w-6 h-6" style={{ color: '#2E86AB' }} />
                <span className="font-medium">Pages Colored</span>
              </div>
              <span className="text-2xl font-bold" style={{ color: '#2E86AB' }}>{coloredPages}</span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-lg" style={{ backgroundColor: '#FFF8F0' }}>
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6" style={{ color: '#06A77D' }} />
                <span className="font-medium">Time Spent</span>
              </div>
              <span className="text-2xl font-bold" style={{ color: '#06A77D' }}>
                {Math.floor(stats.totalTime / 3600)}h {Math.floor((stats.totalTime % 3600) / 60)}m
              </span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-lg" style={{ backgroundColor: '#FFF8F0' }}>
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6" style={{ color: '#FF8C42' }} />
                <span className="font-medium">Total Strokes</span>
              </div>
              <span className="text-2xl font-bold" style={{ color: '#FF8C42' }}>
                {stats.totalStrokes.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-lg" style={{ backgroundColor: '#FFF8F0' }}>
              <div className="flex items-center gap-3">
                <Book className="w-6 h-6" style={{ color: '#A8DADC' }} />
                <span className="font-medium">Books In Progress</span>
              </div>
              <span className="text-2xl font-bold" style={{ color: '#2E86AB' }}>
                {stats.booksInProgress}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-lg" style={{ backgroundColor: '#FFF8F0' }}>
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6" style={{ color: '#FFD23F' }} />
                <span className="font-medium">Achievements</span>
              </div>
              <span className="text-2xl font-bold" style={{ color: '#FFD23F' }}>
                {unlockedAchievements.length}/{achievements.length}
              </span>
            </div>
          </div>
        </Card>

        {/* Achievements */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Award className="w-6 h-6 text-purple-500" />
              Achievements
            </span>
            <span className="text-sm font-normal text-gray-600">
              {unlockedAchievements.length} / {achievements.length}
            </span>
          </h2>
          
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(unlockedAchievements.length / achievements.length) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(135deg, #FFD23F 0%, #FF8C42 100%)' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <AnimatePresence>
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-xl border-2 text-center transition-all cursor-pointer hover:scale-105 ${
                    achievement.unlocked
                      ? 'shadow-lg'
                      : 'bg-gray-50 border-gray-200 opacity-50 grayscale hover:opacity-70'
                  }`}
                  style={achievement.unlocked ? {
                    background: 'linear-gradient(135deg, #FFF8F0 0%, #FFD23F 30%)',
                    borderColor: '#FF8C42'
                  } : {}}
                >
                  <motion.div
                    animate={achievement.unlocked ? { rotate: [0, 10, -10, 0] } : {}}
                    transition={{ duration: 0.5 }}
                    className="text-4xl mb-2"
                  >
                    {achievement.icon}
                  </motion.div>
                  <div className="font-semibold text-sm text-gray-800 mb-1">
                    {achievement.name_en}
                  </div>
                  <div className="text-xs text-gray-600">
                    {achievement.description_en}
                  </div>
                  {achievement.unlocked && achievement.unlockedAt && (
                    <div className="mt-2">
                      <div className="text-xs text-green-600 font-medium">
                        ✓ Unlocked
                      </div>
                      <ShareButton
                        title={achievement.name_en}
                        text={`I unlocked the "${achievement.name_en}" achievement on Colour Me Brazil! ${achievement.icon}`}
                        variant="ghost"
                        size="icon"
                        showText={false}
                      />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </Card>

        {/* Mastery Badges */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              Mastery Badges
            </span>
            <span className="text-sm font-normal text-gray-600">
              {unlockedMasteryBadges.length} / {masteryBadges.length}
            </span>
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {masteryBadges.map((badge, index) => {
              const progressPercent = Math.min((badge.progress / badge.requiredProgress) * 100, 100);
              
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    badge.unlocked
                      ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-400 shadow-lg'
                      : 'bg-gray-50 border-gray-200 opacity-70'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">{badge.icon}</div>
                    <div className="font-bold text-sm text-gray-800 mb-1">
                      {badge.name_en}
                    </div>
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {badge.description_en}
                    </p>
                    
                    {!badge.unlocked && (
                      <div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          {badge.progress} / {badge.requiredProgress}
                        </p>
                      </div>
                    )}
                    
                    {badge.unlocked && (
                      <div className="text-xs text-green-600 font-bold">
                        ✓ Mastered
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Settings Section */}
      <Card className="p-6 mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">Preferred Language</div>
              <div className="text-sm text-gray-600">
                {profile.preferred_language === 'en' ? '🇺🇸 English' : '🇧🇷 Português'}
              </div>
            </div>
            <Button variant="outline">Change</Button>
          </div>
          <div className="flex justify-between items-center pt-4 border-t">
            <div>
              <div className="font-medium">Account</div>
              <div className="text-sm text-gray-600">Member since {new Date(profile.created_date).toLocaleDateString()}</div>
            </div>
            <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
              Delete Profile
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}