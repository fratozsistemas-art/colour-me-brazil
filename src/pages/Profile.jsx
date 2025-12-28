import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trophy, Book, Palette, Clock, Star, Award, Zap, Globe, Shield, TrendingUp, Target, Camera, Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { getProfileAchievements, checkAndAwardAchievements, calculateLevel, getPointsForNextLevel } from '../components/achievementManager';
import LevelProgressBar from '../components/gamification/LevelProgressBar';
import ShareButton from '../components/social/ShareButton';
import TierDisplay from '../components/profile/TierDisplay';
import { getTierFromPoints } from '../components/gamification/tierSystem';
import { getMasteryBadgeProgress, checkAndAwardMasteryBadges } from '../components/gamification/masteryBadgeManager';
import AvatarDisplay from '../components/profile/AvatarDisplay';
import { BRAZILIAN_FAUNA_AVATARS } from '../components/profile/BrazilianFaunaAvatars';
import PersonalizationSettings from '../components/profile/PersonalizationSettings';
import AccessibilitySettings from '../components/accessibility/AccessibilitySettings';
import OfflineManager from '../components/offline/OfflineManager';
import ColoringHistory from '../components/profile/ColoringHistory';

export default function Profile() {
  const currentProfileId = localStorage.getItem('currentProfileId');
  const [isEditingBio, setIsEditingBio] = React.useState(false);
  const [editedBio, setEditedBio] = React.useState('');
  const [uploadingPicture, setUploadingPicture] = React.useState(false);

  const { data: profile, refetch: refetchProfile } = useQuery({
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

  const avatar = BRAZILIAN_FAUNA_AVATARS.find(a => a.id === profile.avatar_icon);
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

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploadingPicture(true);
    try {
      const uploadResult = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.UserProfile.update(profile.id, {
        profile_picture_url: uploadResult.file_url
      });
      toast.success('Profile picture updated!');
      refetchProfile();
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleSaveBio = async () => {
    try {
      await base44.entities.UserProfile.update(profile.id, {
        bio: editedBio
      });
      toast.success('Bio updated!');
      setIsEditingBio(false);
      refetchProfile();
    } catch (error) {
      console.error('Error updating bio:', error);
      toast.error('Failed to update bio');
    }
  };

  React.useEffect(() => {
    if (profile && !isEditingBio) {
      setEditedBio(profile.bio || '');
    }
  }, [profile, isEditingBio]);

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
          <div className="relative group">
            {profile.profile_picture_url ? (
              <img
                src={profile.profile_picture_url}
                alt={profile.child_name}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <AvatarDisplay
                avatarId={profile.avatar_icon}
                level={profile.level || 1}
                size="xlarge"
                showName={false}
                language={profile.preferred_language || 'en'}
              />
            )}
            {currentTier.rewards.avatarFrame && (
              <div className={`absolute inset-0 rounded-full border-4 ${currentTier.borderStyle} pointer-events-none`} />
            )}
            {profile.equipped_avatar_items?.length > 0 && (
              <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {profile.equipped_avatar_items.length}
              </div>
            )}
            <label
              htmlFor="profile-picture-upload"
              className="absolute bottom-0 right-0 bg-orange-500 text-white p-2 rounded-full cursor-pointer hover:bg-orange-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
            >
              <Camera className="w-4 h-4" />
              <input
                id="profile-picture-upload"
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                className="hidden"
                disabled={uploadingPicture}
              />
            </label>
            {uploadingPicture && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
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

            {/* Bio Section */}
            <div className="mb-4">
              {isEditingBio ? (
                <div className="space-y-2">
                  <Textarea
                    value={editedBio}
                    onChange={(e) => setEditedBio(e.target.value)}
                    placeholder="Write a short bio about yourself..."
                    maxLength={200}
                    className="text-sm"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSaveBio}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="w-3 h-3 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditingBio(false)}
                    >
                      <X className="w-3 h-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">{editedBio.length}/200</p>
                </div>
              ) : (
                <div>
                  {profile.bio ? (
                    <div className="relative group">
                      <p className="text-sm text-gray-600 italic mb-2">"{profile.bio}"</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsEditingBio(true)}
                        className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditingBio(true)}
                      className="text-xs"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Add Bio
                    </Button>
                  )}
                </div>
              )}
            </div>

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

      {/* Enhanced Statistics Section */}
      <Card className="p-8 mt-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <TrendingUp className="w-8 h-8" style={{ color: '#FF6B35' }} />
          Your Statistics
        </h2>

        {/* Key Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <Book className="w-6 h-6 text-orange-600" />
              <span className="text-xs font-semibold text-orange-600">BOOKS</span>
            </div>
            <div className="text-3xl font-bold text-orange-600 mb-1">
              {profile.books_completed?.length || 0}
            </div>
            <div className="text-xs text-gray-600">Completed</div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <Palette className="w-6 h-6 text-blue-600" />
              <span className="text-xs font-semibold text-blue-600">PAGES</span>
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {coloredPages}
            </div>
            <div className="text-xs text-gray-600">Colored</div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-teal-50 to-teal-100 border-2 border-teal-200">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-6 h-6 text-teal-600" />
              <span className="text-xs font-semibold text-teal-600">TIME</span>
            </div>
            <div className="text-3xl font-bold text-teal-600 mb-1">
              {Math.floor((profile.total_coloring_time || 0) / 3600)}h
            </div>
            <div className="text-xs text-gray-600">
              {Math.floor(((profile.total_coloring_time || 0) % 3600) / 60)}m coloring
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-6 h-6 text-purple-600" />
              <span className="text-xs font-semibold text-purple-600">STREAK</span>
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {profile.current_streak || 0}
            </div>
            <div className="text-xs text-gray-600">Days active</div>
          </Card>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Activity Breakdown Chart */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Activity Breakdown</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={[
                { name: 'Books', completed: profile.books_completed?.length || 0, inProgress: stats.booksInProgress, color: '#FF6B35' },
                { name: 'Pages', completed: coloredPages, total: totalPages, color: '#2E86AB' },
                { name: 'Achievements', completed: unlockedAchievements.length, total: achievements.length, color: '#FFD23F' }
              ]}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="#06A77D" radius={[8, 8, 0, 0]} />
                <Bar dataKey="inProgress" fill="#FFD23F" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Progress Pie Chart */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Overall Progress</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Completed', value: coloredPages, color: '#06A77D' },
                    { name: 'Remaining', value: Math.max(totalPages - coloredPages, 0), color: '#E5E7EB' }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {[
                    { name: 'Completed', value: coloredPages, color: '#06A77D' },
                    { name: 'Remaining', value: Math.max(totalPages - coloredPages, 0), color: '#E5E7EB' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center mt-2">
              <div className="text-4xl font-bold" style={{ color: '#06A77D' }}>{overallProgress}%</div>
              <div className="text-sm text-gray-600">Complete</div>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100">
            <Book className="w-8 h-8 mx-auto mb-2" style={{ color: '#FF6B35' }} />
            <div className="text-3xl font-bold" style={{ color: '#FF6B35' }}>
              {profile.books_completed?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Books Done</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100">
            <Palette className="w-8 h-8 mx-auto mb-2" style={{ color: '#2E86AB' }} />
            <div className="text-3xl font-bold" style={{ color: '#2E86AB' }}>{coloredPages}</div>
            <div className="text-sm text-gray-600">Pages Colored</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100">
            <Clock className="w-8 h-8 mx-auto mb-2" style={{ color: '#06A77D' }} />
            <div className="text-3xl font-bold" style={{ color: '#06A77D' }}>
              {Math.floor(stats.totalTime / 3600)}h
            </div>
            <div className="text-sm text-gray-600">Time Spent</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100">
            <Zap className="w-8 h-8 mx-auto mb-2" style={{ color: '#FF8C42' }} />
            <div className="text-3xl font-bold" style={{ color: '#FF8C42' }}>
              {(stats.totalStrokes / 1000).toFixed(1)}k
            </div>
            <div className="text-sm text-gray-600">Total Strokes</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-yellow-100">
            <Trophy className="w-8 h-8 mx-auto mb-2" style={{ color: '#FFD23F' }} />
            <div className="text-3xl font-bold" style={{ color: '#FFD23F' }}>
              {unlockedAchievements.length}
            </div>
            <div className="text-sm text-gray-600">Achievements</div>
          </div>
        </div>
      </Card>

      {/* Achievements and Mastery Badges Side by Side */}
      <div className="grid md:grid-cols-2 gap-8 mt-8">
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

          <div className="grid grid-cols-2 gap-4 max-h-[500px] overflow-y-auto">
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
                      : 'bg-gray-50 border-gray-200'
                  }`}
                  style={achievement.unlocked ? {
                    background: 'linear-gradient(135deg, #FFF8F0 0%, #FFD23F 30%)',
                    borderColor: '#FF8C42'
                  } : {}}
                >
                  <motion.div
                    animate={achievement.unlocked ? { rotate: [0, 10, -10, 0] } : {}}
                    transition={{ duration: 0.5 }}
                    className={`text-4xl mb-2 ${!achievement.unlocked ? 'grayscale opacity-40' : ''}`}
                  >
                    {achievement.icon}
                  </motion.div>
                  <div className={`font-semibold text-sm mb-1 ${achievement.unlocked ? 'text-gray-800' : 'text-gray-400'}`}>
                    {achievement.name_en}
                  </div>
                  <div className={`text-xs ${achievement.unlocked ? 'text-gray-600' : 'text-gray-400'}`}>
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

          <div className="grid grid-cols-2 gap-4 max-h-[500px] overflow-y-auto">
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
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="text-center">
                    <div className={`text-4xl mb-2 ${!badge.unlocked ? 'grayscale opacity-40' : ''}`}>
                      {badge.icon}
                    </div>
                    <div className={`font-bold text-sm mb-1 ${badge.unlocked ? 'text-gray-800' : 'text-gray-400'}`}>
                      {badge.name_en}
                    </div>
                    <p className={`text-xs mb-3 line-clamp-2 ${badge.unlocked ? 'text-gray-600' : 'text-gray-400'}`}>
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

      {/* Personalization and History */}
      <div className="grid md:grid-cols-2 gap-8 mt-8">
        <PersonalizationSettings profile={profile} onUpdate={refetchProfile} />
        <ColoringHistory profileId={currentProfileId} />
      </div>
    </div>
  );
}