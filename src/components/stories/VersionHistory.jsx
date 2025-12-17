import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, ChevronRight, User, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VersionHistory({ storyId, onSelectVersion }) {
  const [showHistory, setShowHistory] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);

  const { data: versions = [] } = useQuery({
    queryKey: ['storyVersions', storyId],
    queryFn: () => base44.entities.StoryVersion.filter({ story_id: storyId }),
    enabled: !!storyId && showHistory,
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => base44.entities.UserProfile.list(),
    enabled: showHistory,
  });

  const getProfile = (profileId) => profiles.find(p => p.id === profileId);

  const sortedVersions = [...versions].sort((a, b) => b.version_number - a.version_number);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowHistory(!showHistory)}
        className="flex items-center gap-2"
      >
        <History className="w-4 h-4" />
        Version History ({versions.length})
      </Button>

      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setShowHistory(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <History className="w-6 h-6" />
                Version History
              </h2>

              <div className="flex gap-4 flex-1 overflow-hidden">
                {/* Version List */}
                <div className="w-1/3 overflow-y-auto border-r pr-4">
                  <div className="space-y-2">
                    {sortedVersions.map((version) => {
                      const editor = getProfile(version.edited_by_profile_id);
                      const isSelected = selectedVersion?.id === version.id;

                      return (
                        <Card
                          key={version.id}
                          className={`p-3 cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-2 border-purple-500 bg-purple-50' 
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedVersion(version)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-sm">
                              Version {version.version_number}
                            </span>
                            <ChevronRight className={`w-4 h-4 transition-transform ${
                              isSelected ? 'rotate-90' : ''
                            }`} />
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <User className="w-3 h-3" />
                            <span>{editor?.child_name || 'Unknown'}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {new Date(version.created_date).toLocaleString()}
                            </span>
                          </div>

                          {version.change_summary && (
                            <p className="text-xs text-gray-600 mt-2 italic">
                              "{version.change_summary}"
                            </p>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* Version Content */}
                <div className="flex-1 overflow-y-auto">
                  {selectedVersion ? (
                    <div>
                      <div className="mb-4 pb-4 border-b">
                        <h3 className="text-lg font-bold mb-2">
                          Version {selectedVersion.version_number}
                        </h3>
                        <div className="text-sm text-gray-600">
                          Edited by {getProfile(selectedVersion.edited_by_profile_id)?.child_name}
                        </div>
                      </div>

                      <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {selectedVersion.content}
                        </p>
                      </Card>

                      <div className="mt-4">
                        <Button
                          onClick={() => {
                            onSelectVersion?.(selectedVersion);
                            setShowHistory(false);
                          }}
                          className="w-full"
                        >
                          View This Version
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <p>Select a version to view details</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}