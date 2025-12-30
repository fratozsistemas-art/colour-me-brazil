import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Book, Bell, Palette, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createPageUrl } from '../utils';
import ReadingPreferences from '../components/profile/ReadingPreferences';
import BookmarksManager from '../components/profile/BookmarksManager';
import ReadingHistoryView from '../components/profile/ReadingHistoryView';
import NotificationPreferences from '../components/profile/NotificationPreferences';
import AvatarCustomizer from '../components/profile/AvatarCustomizer';
import ReadingPreferencesExpanded from '../components/profile/ReadingPreferencesExpanded';
import ActivityTimeline from '../components/profile/ActivityTimeline';
import AgeBasedContentRestrictions from '../components/parent/AgeBasedContentRestrictions';

export default function ProfileSettings() {
  const queryClient = useQueryClient();
  const [currentProfileId, setCurrentProfileId] = useState(null);

  useEffect(() => {
    const profileId = localStorage.getItem('currentProfileId');
    if (!profileId) {
      window.location.href = createPageUrl('Library');
      return;
    }
    setCurrentProfileId(profileId);
  }, []);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['userProfile', currentProfileId],
    queryFn: async () => {
      if (!currentProfileId) return null;
      const profiles = await base44.entities.UserProfile.filter({ id: currentProfileId });
      return profiles[0] || null;
    },
    enabled: !!currentProfileId,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates) => {
      await base44.entities.UserProfile.update(currentProfileId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', currentProfileId] });
      toast.success('Settings saved successfully!');
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      toast.error('Failed to save settings');
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 max-w-md text-center">
          <p className="text-gray-600 mb-4">No profile found. Please select a profile first.</p>
          <Button onClick={() => window.location.href = createPageUrl('Library')}>
            Go to Library
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => window.location.href = createPageUrl('Library')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Library
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-gray-600">{profile.child_name}'s preferences</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="reading" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="reading" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Reading</span>
            </TabsTrigger>
            <TabsTrigger value="bookmarks" className="flex items-center gap-2">
              <Book className="w-4 h-4" />
              <span className="hidden sm:inline">Bookmarks</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Book className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reading">
            <ReadingPreferences
              profile={profile}
              onUpdate={(updates) => updateProfileMutation.mutate(updates)}
              isUpdating={updateProfileMutation.isPending}
            />
          </TabsContent>

          <TabsContent value="bookmarks">
            <BookmarksManager
              profile={profile}
              onUpdate={(updates) => updateProfileMutation.mutate(updates)}
            />
          </TabsContent>

          <TabsContent value="history">
            <ReadingHistoryView profile={profile} />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationPreferences
              profile={profile}
              onUpdate={(updates) => updateProfileMutation.mutate(updates)}
              isUpdating={updateProfileMutation.isPending}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}