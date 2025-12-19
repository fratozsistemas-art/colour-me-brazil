import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Upload, CheckCircle, TrendingUp, Users } from 'lucide-react';
import CuratorContentCreation from '../components/curator/CuratorContentCreation';
import CuratorSubmissionReview from '../components/curator/CuratorSubmissionReview';
import CuratorContentPerformance from '../components/curator/CuratorContentPerformance';
import CuratorContentLibrary from '../components/curator/CuratorContentLibrary';

export default function CuratorDashboard() {
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          base44.auth.redirectToLogin(window.location.pathname);
          return;
        }
        const currentUser = await base44.auth.me();
        
        if (currentUser.role !== 'curator' && currentUser.role !== 'admin') {
          window.location.href = '/';
          return;
        }
        
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin(window.location.pathname);
      }
      setIsCheckingAuth(false);
    };
    checkAuth();
  }, []);

  const { data: books = [] } = useQuery({
    queryKey: ['books'],
    queryFn: () => base44.entities.Book.list(),
    enabled: !!user
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ['userSubmissions'],
    queryFn: () => base44.entities.UserSubmission.list('-created_date'),
    enabled: !!user
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => base44.entities.UserProfile.list(),
    enabled: !!user
  });

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const curatedBooks = books.filter(b => b.created_by === user?.email);
  const totalReaders = profiles.filter(p => 
    p.books_completed?.some(bookId => curatedBooks.find(b => b.id === bookId))
  ).length;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Curator Dashboard</h1>
        <p className="text-gray-600">
          Create and manage educational content for Colour Me Brazil
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">My Books</p>
              <p className="text-3xl font-bold text-blue-800">{curatedBooks.length}</p>
            </div>
            <BookOpen className="w-12 h-12 text-blue-600 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Pending Reviews</p>
              <p className="text-3xl font-bold text-purple-800">{pendingSubmissions.length}</p>
            </div>
            <Upload className="w-12 h-12 text-purple-600 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Total Readers</p>
              <p className="text-3xl font-bold text-green-800">{totalReaders}</p>
            </div>
            <Users className="w-12 h-12 text-green-600 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Approved</p>
              <p className="text-3xl font-bold text-orange-800">
                {submissions.filter(s => s.status === 'approved').length}
              </p>
            </div>
            <CheckCircle className="w-12 h-12 text-orange-600 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="create">Create Content</TabsTrigger>
          <TabsTrigger value="library">My Library</TabsTrigger>
          <TabsTrigger value="review">Review Submissions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="mt-6">
          <CuratorContentCreation user={user} />
        </TabsContent>

        <TabsContent value="library" className="mt-6">
          <CuratorContentLibrary books={curatedBooks} />
        </TabsContent>

        <TabsContent value="review" className="mt-6">
          <CuratorSubmissionReview 
            submissions={pendingSubmissions}
            profiles={profiles}
          />
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <CuratorContentPerformance 
            books={curatedBooks}
            profiles={profiles}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}