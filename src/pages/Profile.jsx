import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Book, Palette, Clock, Star, Award } from 'lucide-react';

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

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No profile selected. Please go to the Library.</p>
      </div>
    );
  }

  const AVATAR_OPTIONS = [
    { id: 'cat', emoji: '🐱' }, { id: 'dog', emoji: '🐶' }, { id: 'monkey', emoji: '🐵' },
    { id: 'parrot', emoji: '🦜' }, { id: 'butterfly', emoji: '🦋' }, { id: 'turtle', emoji: '🐢' },
    { id: 'dolphin', emoji: '🐬' }, { id: 'toucan', emoji: '🦤' }, { id: 'sun', emoji: '☀️' },
    { id: 'rainbow', emoji: '🌈' }, { id: 'star', emoji: '⭐' }, { id: 'flower', emoji: '🌺' },
    { id: 'rocket', emoji: '🚀' }, { id: 'palette', emoji: '🎨' }, { id: 'soccer', emoji: '⚽' }
  ];

  const avatar = AVATAR_OPTIONS.find(a => a.id === profile.avatar_icon);
  const totalPages = books.reduce((sum, book) => sum + (book.page_count || 0), 0);
  const coloredPages = profile.pages_colored?.length || 0;
  const overallProgress = totalPages > 0 ? Math.round((coloredPages / totalPages) * 100) : 0;

  // Mock achievements for MVP
  const achievements = [
    { id: 'first_stroke', name: 'First Stroke', description: 'Colored your first page', icon: '🎨', unlocked: coloredPages > 0 },
    { id: 'first_book', name: 'First Book', description: 'Completed your first story', icon: '📖', unlocked: (profile.books_completed?.length || 0) > 0 },
    { id: 'explorer', name: 'Explorer', description: 'Viewed all books', icon: '🌍', unlocked: false },
    { id: 'dedicated', name: 'Dedicated Artist', description: 'Colored 25 pages', icon: '🌟', unlocked: coloredPages >= 25 },
    { id: 'culture_master', name: 'Culture Master', description: 'Completed all 12 books', icon: '🏆', unlocked: (profile.books_completed?.length || 0) >= 12 },
    { id: 'bilingual', name: 'Bilingual Pro', description: 'Switched languages 10 times', icon: '🗣️', unlocked: false }
  ];

  const unlockedAchievements = achievements.filter(a => a.unlocked);

  return (
    <div className="max-w-6xl mx-auto pb-24 md:pb-8">
      {/* Profile Header */}
      <Card className="p-8 mb-8 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="text-8xl">{avatar?.emoji || '👤'}</div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">{profile.child_name}</h1>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Book className="w-4 h-4" />
                {profile.books_completed?.length || 0} books completed
              </span>
              <span className="flex items-center gap-1">
                <Palette className="w-4 h-4" />
                {coloredPages} pages colored
              </span>
              <span className="flex items-center gap-1">
                <Trophy className="w-4 h-4" />
                {unlockedAchievements.length} achievements
              </span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-green-600 mb-1">{overallProgress}%</div>
            <div className="text-sm text-gray-600">Overall Progress</div>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Statistics */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500" />
            Statistics
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Book className="w-6 h-6 text-green-600" />
                <span className="font-medium">Books Completed</span>
              </div>
              <span className="text-2xl font-bold text-green-600">
                {profile.books_completed?.length || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Palette className="w-6 h-6 text-blue-600" />
                <span className="font-medium">Pages Colored</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">{coloredPages}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-purple-600" />
                <span className="font-medium">Time Spent</span>
              </div>
              <span className="text-2xl font-bold text-purple-600">
                {Math.round((profile.total_coloring_time || 0) / 60)} min
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-yellow-600" />
                <span className="font-medium">Achievements</span>
              </div>
              <span className="text-2xl font-bold text-yellow-600">
                {unlockedAchievements.length}/{achievements.length}
              </span>
            </div>
          </div>
        </Card>

        {/* Achievements */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Award className="w-6 h-6 text-purple-500" />
            Achievements
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  achievement.unlocked
                    ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 shadow-lg'
                    : 'bg-gray-50 border-gray-200 opacity-50 grayscale'
                }`}
              >
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <div className="font-semibold text-sm text-gray-800 mb-1">
                  {achievement.name}
                </div>
                <div className="text-xs text-gray-600">
                  {achievement.description}
                </div>
              </div>
            ))}
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