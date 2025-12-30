import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, XCircle, Eye, Clock, BookOpen, Palette, Mic, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ModerationQueue from '@/components/moderation/ModerationQueue';

export default function ContentModeration() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };
    loadUser();
  }, []);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [newTags, setNewTags] = useState([]);
  const queryClient = useQueryClient();

  const { data: submissions = [] } = useQuery({
    queryKey: ['submissions'],
    queryFn: () => base44.entities.UserSubmission.list('-created_date'),
  });

  const updateSubmission = useMutation({
    mutationFn: ({ id, data }) => base44.entities.UserSubmission.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['submissions']);
      setSelectedSubmission(null);
      setFeedback('');
      setNewTags([]);
    },
  });

  const handleApprove = (submission) => {
    const updatedTags = [...(submission.cultural_tags || []), ...newTags];
    updateSubmission.mutate({
      id: submission.id,
      data: {
        status: 'approved',
        cultural_tags: updatedTags
      }
    });
  };

  const handleReject = (submission) => {
    if (!feedback.trim()) {
      alert('Please provide feedback for rejection');
      return;
    }
    updateSubmission.mutate({
      id: submission.id,
      data: {
        status: 'rejected',
        description: `${submission.description}\n\nRejection Feedback: ${feedback}`
      }
    });
  };

  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const approvedSubmissions = submissions.filter(s => s.status === 'approved');
  const rejectedSubmissions = submissions.filter(s => s.status === 'rejected');

  const getTypeIcon = (type) => {
    switch (type) {
      case 'story': return BookOpen;
      case 'coloring_page': return Palette;
      case 'audio': return Mic;
      default: return BookOpen;
    }
  };

  const SubmissionCard = ({ submission }) => {
    const Icon = getTypeIcon(submission.submission_type);
    const isSelected = selectedSubmission?.id === submission.id;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
      >
        <Card
          className={`p-4 cursor-pointer transition-all ${
            isSelected ? 'border-2 border-blue-500 bg-blue-50' : 'hover:shadow-lg'
          }`}
          onClick={() => setSelectedSubmission(submission)}
        >
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              submission.status === 'pending' ? 'bg-yellow-100' :
              submission.status === 'approved' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <Icon className={`w-6 h-6 ${
                submission.status === 'pending' ? 'text-yellow-600' :
                submission.status === 'approved' ? 'text-green-600' : 'text-red-600'
              }`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 truncate">{submission.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2 mt-1">{submission.description}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span>By: {submission.submitter_name}</span>
                {submission.submitter_age && <span>Age: {submission.submitter_age}</span>}
                <span>{submission.language === 'en' ? '🇺🇸 EN' : '🇧🇷 PT'}</span>
              </div>
              {submission.cultural_tags && submission.cultural_tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {submission.cultural_tags.map((tag, idx) => (
                    <span key={idx} className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Content Moderation</h1>
        <p className="text-gray-600">Review and manage user-submitted content</p>
      </div>

      {/* Enhanced Moderation Queue */}
      {user && <ModerationQueue user={user} />}

      <div className="mt-8 border-t pt-8">
        <h2 className="text-2xl font-bold mb-4">Legacy Submission Review</h2>
      
        {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div>
              <div className="text-3xl font-bold text-yellow-700">{pendingSubmissions.length}</div>
              <div className="text-sm text-yellow-600">Pending Review</div>
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-3xl font-bold text-green-700">{approvedSubmissions.length}</div>
              <div className="text-sm text-green-600">Approved</div>
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-600" />
            <div>
              <div className="text-3xl font-bold text-red-700">{rejectedSubmissions.length}</div>
              <div className="text-sm text-red-600">Rejected</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submissions List */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="pending">Pending ({pendingSubmissions.length})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({approvedSubmissions.length})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({rejectedSubmissions.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4 mt-4">
              {pendingSubmissions.length === 0 ? (
                <Card className="p-12 text-center">
                  <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No pending submissions</p>
                </Card>
              ) : (
                pendingSubmissions.map(submission => (
                  <SubmissionCard key={submission.id} submission={submission} />
                ))
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4 mt-4">
              {approvedSubmissions.length === 0 ? (
                <Card className="p-12 text-center">
                  <CheckCircle2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No approved submissions yet</p>
                </Card>
              ) : (
                approvedSubmissions.map(submission => (
                  <SubmissionCard key={submission.id} submission={submission} />
                ))
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4 mt-4">
              {rejectedSubmissions.length === 0 ? (
                <Card className="p-12 text-center">
                  <XCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No rejected submissions</p>
                </Card>
              ) : (
                rejectedSubmissions.map(submission => (
                  <SubmissionCard key={submission.id} submission={submission} />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Review Panel */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-24">
            {selectedSubmission ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800">Review</h2>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedSubmission(null)}>
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">{selectedSubmission.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{selectedSubmission.description}</p>
                  
                  {selectedSubmission.story_text && (
                    <div className="bg-gray-50 p-3 rounded-lg mb-3">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {selectedSubmission.story_text}
                      </p>
                    </div>
                  )}

                  {selectedSubmission.content_url && (
                    <div className="mb-3">
                      {selectedSubmission.submission_type === 'coloring_page' ? (
                        <img 
                          src={selectedSubmission.content_url} 
                          alt={selectedSubmission.title}
                          className="w-full rounded-lg border"
                        />
                      ) : selectedSubmission.submission_type === 'audio' ? (
                        <audio controls className="w-full">
                          <source src={selectedSubmission.content_url} />
                        </audio>
                      ) : (
                        <a 
                          href={selectedSubmission.content_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View Content
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {selectedSubmission.status === 'pending' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Tag className="w-4 h-4 inline mr-1" />
                        Add Tags
                      </label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          className="flex-1 px-3 py-2 border rounded-lg text-sm"
                          placeholder="Add tag..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.target.value.trim()) {
                              setNewTags([...newTags, e.target.value.trim()]);
                              e.target.value = '';
                            }
                          }}
                        />
                      </div>
                      {newTags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {newTags.map((tag, idx) => (
                            <span 
                              key={idx}
                              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full cursor-pointer"
                              onClick={() => setNewTags(newTags.filter((_, i) => i !== idx))}
                            >
                              {tag} ×
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Feedback (for rejection)
                      </label>
                      <Textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Provide feedback if rejecting..."
                        rows={4}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApprove(selectedSubmission)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        disabled={updateSubmission.isPending}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleReject(selectedSubmission)}
                        variant="outline"
                        className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
                        disabled={updateSubmission.isPending}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </>
                )}

                {selectedSubmission.status !== 'pending' && (
                  <div className={`p-4 rounded-lg ${
                    selectedSubmission.status === 'approved' 
                      ? 'bg-green-50 text-green-800' 
                      : 'bg-red-50 text-red-800'
                  }`}>
                    <p className="font-semibold">
                      {selectedSubmission.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Eye className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Select a submission to review</p>
              </div>
            )}
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
}