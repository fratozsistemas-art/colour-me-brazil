import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, MessageSquare, User, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function CuratorSubmissionReview({ submissions, profiles }) {
  const queryClient = useQueryClient();
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [feedback, setFeedback] = useState('');

  const updateSubmissionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.UserSubmission.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['userSubmissions']);
      toast.success('Submission updated successfully');
      setSelectedSubmission(null);
      setFeedback('');
    },
    onError: (error) => {
      toast.error('Failed to update submission: ' + error.message);
    }
  });

  const handleApprove = (submission) => {
    updateSubmissionMutation.mutate({
      id: submission.id,
      data: {
        status: 'approved',
        reviewed_by: 'curator',
        review_date: new Date().toISOString(),
        feedback: feedback || 'Approved'
      }
    });
  };

  const handleReject = (submission) => {
    if (!feedback) {
      toast.error('Please provide feedback for rejection');
      return;
    }
    updateSubmissionMutation.mutate({
      id: submission.id,
      data: {
        status: 'rejected',
        reviewed_by: 'curator',
        review_date: new Date().toISOString(),
        feedback: feedback
      }
    });
  };

  const getProfileName = (profileId) => {
    const profile = profiles.find(p => p.id === profileId);
    return profile?.child_name || 'Unknown User';
  };

  if (submissions.length === 0) {
    return (
      <Card className="p-12 text-center">
        <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">All Caught Up!</h3>
        <p className="text-gray-600">No pending submissions to review</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-800">
          Pending Submissions ({submissions.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {submissions.map((submission) => (
          <Card key={submission.id} className="p-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{submission.title || 'Untitled'}</h4>
                    <p className="text-sm text-gray-600">
                      by {getProfileName(submission.profile_id)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  {new Date(submission.created_date).toLocaleDateString()}
                </div>
              </div>

              {/* Content Type */}
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  {submission.submission_type}
                </span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  {submission.status}
                </span>
              </div>

              {/* Content */}
              {submission.content_url && (
                <div>
                  <img
                    src={submission.content_url}
                    alt={submission.title}
                    className="w-full max-w-md rounded-lg border-2 border-gray-200"
                  />
                </div>
              )}

              {submission.description && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{submission.description}</p>
                </div>
              )}

              {/* Review Actions */}
              {selectedSubmission?.id === submission.id ? (
                <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Review Feedback</span>
                  </div>
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide feedback for the submitter..."
                    className="h-24"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(submission)}
                      disabled={updateSubmissionMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(submission)}
                      disabled={updateSubmissionMutation.isPending}
                      variant="destructive"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedSubmission(null);
                        setFeedback('');
                      }}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={() => setSelectedSubmission(submission)}
                    variant="outline"
                    className="flex-1"
                  >
                    Review
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}