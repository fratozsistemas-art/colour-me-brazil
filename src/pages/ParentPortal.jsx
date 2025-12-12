import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, Shield, Clock, Award, BookOpen, Palette, 
  TrendingUp, Calendar, Star, Settings 
} from 'lucide-react';
import { toast } from 'sonner';

export default function ParentPortal() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const queryClient = useQueryClient();

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          base44.auth.redirectToLogin(window.location.pathname);
          return;
        }
      } catch (error) {
        base44.auth.redirectToLogin(window.location.pathname);
        return;
      }
      setIsCheckingAuth(false);
    };
    checkAuth();
  }, []);

  // Fetch parent account
  const { data: parentAccounts = [] } = useQuery({
    queryKey: ['parentAccount'],
    queryFn: () => base44.entities.ParentAccount.list(),
  });

  const parentAccount = parentAccounts[0];

  // Fetch child profiles
  const { data: childProfiles = [] } = useQuery({
    queryKey: ['childProfiles'],
    queryFn: async () => {
      if (!parentAccount?.child_profiles?.length) return [];
      const profiles = await base44.entities.UserProfile.list();
      return profiles.filter(p => parentAccount.child_profiles.includes(p.id));
    },
    enabled: !!parentAccount,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (settings) => {
      return base44.entities.ParentAccount.update(parentAccount.id, settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['parentAccount']);
      toast.success('Settings updated successfully!');
    },
  });

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!parentAccount) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-blue-500" />
          <h2 className="text-2xl font-bold mb-4">Welcome to Parent Portal</h2>
          <p className="text-gray-600 mb-6">
            Create a parent account to monitor your child's progress and manage settings.
          </p>
          <Button onClick={() => {
            // Create parent account logic here
            toast.info('Parent account setup coming soon!');
          }}>
            Create Parent Account
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-24 md:pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Parent Portal</h1>
        <p className="text-gray-600">Monitor and manage your child's learning journey</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="safety">Safety</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {childProfiles.map(child => (
              <Card key={child.id} className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl">{child.avatar_icon}</div>
                  <div>
                    <h3 className="font-bold">{child.child_name}</h3>
                    <p className="text-sm text-gray-600">Level {child.level || 1}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Books Completed</span>
                    <span className="font-semibold">{child.books_completed?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Pages Colored</span>
                    <span className="font-semibold">{child.pages_colored?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Points</span>
                    <span className="font-semibold">{child.total_points || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Streak</span>
                    <span className="font-semibold">{child.current_streak || 0} days</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          {childProfiles.map(child => (
            <Card key={child.id} className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="text-4xl">{child.avatar_icon}</div>
                <div>
                  <h3 className="text-2xl font-bold">{child.child_name}</h3>
                  <p className="text-gray-600">Detailed Progress Report</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <BookOpen className="w-8 h-8 text-blue-600 mb-2" />
                  <h4 className="font-semibold mb-1">Reading</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {child.books_completed?.length || 0} books
                  </p>
                  <p className="text-sm text-gray-600">completed</p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <Palette className="w-8 h-8 text-purple-600 mb-2" />
                  <h4 className="font-semibold mb-1">Coloring</h4>
                  <p className="text-2xl font-bold text-purple-600">
                    {child.pages_colored?.length || 0} pages
                  </p>
                  <p className="text-sm text-gray-600">colored</p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <Award className="w-8 h-8 text-green-600 mb-2" />
                  <h4 className="font-semibold mb-1">Achievements</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {child.achievements?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">unlocked</p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Time Spent</span>
                  <span className="text-sm text-gray-600">
                    {Math.round((child.total_coloring_time || 0) / 60)} minutes
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Current Streak</span>
                  <span className="text-sm text-gray-600">{child.current_streak || 0} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Longest Streak</span>
                  <span className="text-sm text-gray-600">{child.longest_streak || 0} days</span>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-6">Parental Controls</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Content Approval Required</Label>
                  <p className="text-sm text-gray-600">
                    Approve child's submissions before they're posted
                  </p>
                </div>
                <Switch
                  checked={parentAccount.content_approval_required}
                  onCheckedChange={(checked) => {
                    updateSettingsMutation.mutate({ content_approval_required: checked });
                  }}
                />
              </div>

              <div>
                <Label className="text-base font-medium mb-2 block">Daily Screen Time Limit</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    min="0"
                    value={parentAccount.screen_time_limit || 0}
                    onChange={(e) => {
                      updateSettingsMutation.mutate({ 
                        screen_time_limit: parseInt(e.target.value) || 0 
                      });
                    }}
                    className="w-32"
                  />
                  <span className="text-sm text-gray-600">minutes (0 = no limit)</span>
                </div>
              </div>

              <div>
                <Label className="text-base font-medium mb-3 block">Allowed Features</Label>
                <div className="grid grid-cols-2 gap-3">
                  {['reading', 'coloring', 'quizzes', 'showcase', 'forum', 'shop'].map(feature => (
                    <div key={feature} className="flex items-center gap-2">
                      <Switch
                        checked={parentAccount.allowed_features?.includes(feature)}
                        onCheckedChange={(checked) => {
                          const current = parentAccount.allowed_features || [];
                          const updated = checked
                            ? [...current, feature]
                            : current.filter(f => f !== feature);
                          updateSettingsMutation.mutate({ allowed_features: updated });
                        }}
                      />
                      <span className="capitalize">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Safety Tab */}
        <TabsContent value="safety" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <h3 className="text-xl font-bold">Safety & Privacy</h3>
                <p className="text-gray-600">Keep your child safe online</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">✓ All content is moderated</h4>
                <p className="text-sm text-green-700">
                  Community submissions are reviewed before being published
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">✓ Age-appropriate content</h4>
                <p className="text-sm text-green-700">
                  All stories and activities are designed for children 6-12 years old
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">✓ No personal data shared</h4>
                <p className="text-sm text-green-700">
                  Children's profiles use only first names and avatars
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}