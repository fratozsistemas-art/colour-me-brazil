import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Users, TrendingUp, Award, Calendar, Settings } from 'lucide-react';
import ChildProgressCard from '../components/parent/ChildProgressCard';
import ChildProgressOverview from '../components/parentportal/ChildProgressOverview';
import ChildActivityFeed from '../components/parentportal/ChildActivityFeed';
import ReadingHistory from '../components/parentportal/ReadingHistory';
import QuizPerformance from '../components/parentportal/QuizPerformance';
import ReadingGoalManager from '../components/parent/ReadingGoalManager';
import ContentApprovalQueue from '../components/parent/ContentApprovalQueue';

export default function ParentPortal() {
  const [parentAccount, setParentAccount] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          base44.auth.redirectToLogin(window.location.pathname);
          return;
        }
        const user = await base44.auth.me();
        
        // Find parent account for this user
        const accounts = await base44.entities.ParentAccount.filter({ 
          parent_email: user.email 
        });
        
        if (accounts.length > 0) {
          setParentAccount(accounts[0]);
        }
      } catch (error) {
        base44.auth.redirectToLogin(window.location.pathname);
        return;
      }
      setIsCheckingAuth(false);
    };
    checkAuth();
  }, []);

  // Fetch child profiles
  const { data: allProfiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => base44.entities.UserProfile.list(),
    enabled: !!parentAccount,
  });

  // Fetch achievements
  const { data: allAchievements = [] } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => base44.entities.Achievement.list(),
    enabled: !!parentAccount,
  });

  // Fetch reading goals
  const { data: allGoals = [] } = useQuery({
    queryKey: ['readingGoals'],
    queryFn: () => base44.entities.ReadingGoal.list(),
    enabled: !!parentAccount,
  });

  // Fetch user submissions
  const { data: allSubmissions = [] } = useQuery({
    queryKey: ['userSubmissions'],
    queryFn: () => base44.entities.UserSubmission.list('-created_date'),
    enabled: !!parentAccount,
  });

  const childProfiles = allProfiles.filter(p => 
    parentAccount?.child_profiles?.includes(p.id)
  );

  const childSubmissions = allSubmissions.filter(s =>
    parentAccount?.child_profiles?.includes(s.profile_id)
  );

  const getChildStats = (profileId) => {
    const achievements = allAchievements.filter(a => a.profile_id === profileId);
    return {
      achievements: achievements.length
    };
  };

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
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Parent Account Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            No parent account is associated with this user account.
          </p>
          <p className="text-sm text-gray-500">
            Please contact support to set up a parent account.
          </p>
        </Card>
      </div>
    );
  }

  if (!selectedChild) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Parent Dashboard</h1>
          <p className="text-gray-600">
            Welcome, {parentAccount.parent_name}! Monitor your children's reading progress.
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Children</p>
                <p className="text-3xl font-bold text-blue-800">{childProfiles.length}</p>
              </div>
              <Users className="w-12 h-12 text-blue-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Total Books Read</p>
                <p className="text-3xl font-bold text-green-800">
                  {childProfiles.reduce((sum, p) => sum + (p.books_completed?.length || 0), 0)}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Pending Approvals</p>
                <p className="text-3xl font-bold text-purple-800">
                  {childSubmissions.filter(s => s.status === 'pending').length}
                </p>
              </div>
              <Award className="w-12 h-12 text-purple-600 opacity-50" />
            </div>
          </Card>
        </div>

        {/* Content Approval Queue */}
        {parentAccount.content_approval_required && childSubmissions.length > 0 && (
          <div className="mb-8">
            <ContentApprovalQueue 
              submissions={childSubmissions}
              childProfiles={childProfiles}
            />
          </div>
        )}

        {/* Children Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Children</h2>
          {childProfiles.length === 0 ? (
            <Card className="p-8 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No child profiles found</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {childProfiles.map((profile) => (
                <ChildProgressCard
                  key={profile.id}
                  profile={profile}
                  stats={getChildStats(profile.id)}
                  onSelect={setSelectedChild}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Child Detail View
  const childGoals = allGoals.filter(g => g.child_profile_id === selectedChild.id);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => setSelectedChild(null)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="flex items-center gap-4 mb-6">
          <div className="text-5xl">
            {selectedChild.avatar_icon === 'jaguar' && '🐆'}
            {selectedChild.avatar_icon === 'toucan' && '🦜'}
            {selectedChild.avatar_icon === 'sloth' && '🦥'}
            {!['jaguar', 'toucan', 'sloth'].includes(selectedChild.avatar_icon) && '👤'}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {selectedChild.child_name}'s Progress
            </h1>
            <p className="text-gray-600">
              Level {selectedChild.level || 1} • {selectedChild.total_points || 0} points
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="reading">Reading</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <ChildProgressOverview profileId={selectedChild.id} />
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <ChildActivityFeed profileId={selectedChild.id} />
        </TabsContent>

        <TabsContent value="reading" className="mt-6">
          <ReadingHistory profileId={selectedChild.id} />
        </TabsContent>

        <TabsContent value="quizzes" className="mt-6">
          <QuizPerformance profileId={selectedChild.id} />
        </TabsContent>

        <TabsContent value="goals" className="mt-6">
          <ReadingGoalManager
            parentAccountId={parentAccount.id}
            childProfile={selectedChild}
            goals={childGoals}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}