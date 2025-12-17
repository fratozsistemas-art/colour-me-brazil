import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Clock, Image, FileText } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';

export default function ContentApprovalQueue({ submissions = [], childProfiles = [] }) {
  const queryClient = useQueryClient();

  const approveSubmission = useMutation({
    mutationFn: (submissionId) => base44.entities.UserSubmission.update(submissionId, {
      status: 'approved'
    }),
    onSuccess: () => queryClient.invalidateQueries(['userSubmissions'])
  });

  const rejectSubmission = useMutation({
    mutationFn: (submissionId) => base44.entities.UserSubmission.update(submissionId, {
      status: 'rejected'
    }),
    onSuccess: () => queryClient.invalidateQueries(['userSubmissions'])
  });

  const pendingSubmissions = submissions.filter(s => s.status === 'pending');

  const getChildName = (profileId) => {
    const profile = childProfiles.find(p => p.id === profileId);
    return profile?.child_name || 'Unknown';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-600" />
          Pending Approvals
          {pendingSubmissions.length > 0 && (
            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
              {pendingSubmissions.length}
            </span>
          )}
        </h3>
      </div>

      {pendingSubmissions.length === 0 ? (
        <Card className="p-6 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
          <p className="text-gray-600 text-sm">No pending submissions</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {pendingSubmissions.map((submission) => (
            <motion.div
              key={submission.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-4">
                <div className="flex items-start gap-4">
                  {/* Preview */}
                  <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {submission.content_type === 'coloring_page' ? (
                      submission.content_url ? (
                        <img 
                          src={submission.content_url} 
                          alt="Submission" 
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Image className="w-8 h-8 text-gray-400" />
                      )
                    ) : (
                      <FileText className="w-8 h-8 text-gray-400" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-800">{submission.title}</h4>
                        <p className="text-sm text-gray-600">
                          by {getChildName(submission.profile_id)}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-semibold">
                        {submission.content_type}
                      </span>
                    </div>

                    {submission.description && (
                      <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                        {submission.description}
                      </p>
                    )}

                    <div className="text-xs text-gray-500 mb-3">
                      Submitted {new Date(submission.created_date).toLocaleDateString()}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => approveSubmission.mutate(submission.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (confirm('Reject this submission?')) {
                            rejectSubmission.mutate(submission.id);
                          }
                        }}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}