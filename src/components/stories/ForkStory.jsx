import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { GitBranch, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { awardPoints } from '../achievementManager';

export default function ForkStory({ story, currentVersion, onForkComplete }) {
  const [showForkModal, setShowForkModal] = useState(false);
  const [forkData, setForkData] = useState({
    title_en: story.title_en + ' (Alternate)',
    title_pt: story.title_pt + ' (Alternativa)',
    fork_reason: ''
  });

  const queryClient = useQueryClient();
  const currentProfileId = localStorage.getItem('currentProfileId');

  const forkStory = useMutation({
    mutationFn: async () => {
      // Create the new forked story
      const forkedStory = await base44.entities.CollaborativeStory.create({
        title_en: forkData.title_en,
        title_pt: forkData.title_pt,
        theme: story.theme,
        current_text: currentVersion?.content || story.current_text,
        creator_profile_id: currentProfileId,
        max_length: story.max_length
      });

      // Record the fork relationship
      await base44.entities.StoryFork.create({
        original_story_id: story.id,
        forked_story_id: forkedStory.id,
        forked_by_profile_id: currentProfileId,
        fork_point_version: currentVersion?.version_number || 0,
        fork_reason: forkData.fork_reason
      });

      // Award points for forking
      await awardPoints(currentProfileId, 15);

      return forkedStory;
    },
    onSuccess: (forkedStory) => {
      queryClient.invalidateQueries(['collaborativeStories']);
      queryClient.invalidateQueries(['storyForks']);
      setShowForkModal(false);
      onForkComplete?.(forkedStory);
    }
  });

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowForkModal(true)}
        className="flex items-center gap-2 border-purple-500 text-purple-600 hover:bg-purple-50"
      >
        <GitBranch className="w-4 h-4" />
        Fork Story
      </Button>

      <AnimatePresence>
        {showForkModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setShowForkModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <GitBranch className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Fork This Story</h2>
                  <p className="text-sm text-gray-600">
                    Create your own version and take it in a new direction!
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    New Title (English)
                  </label>
                  <Input
                    value={forkData.title_en}
                    onChange={(e) => setForkData({ ...forkData, title_en: e.target.value })}
                    placeholder="Give your fork a unique title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    New Title (Portuguese)
                  </label>
                  <Input
                    value={forkData.title_pt}
                    onChange={(e) => setForkData({ ...forkData, title_pt: e.target.value })}
                    placeholder="Dê um título único ao seu fork..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Why are you forking this story? (optional)
                  </label>
                  <Textarea
                    value={forkData.fork_reason}
                    onChange={(e) => setForkData({ ...forkData, fork_reason: e.target.value })}
                    placeholder="I want to explore what happens if the character chose a different path..."
                    rows={3}
                  />
                </div>

                <Card className="p-4 bg-purple-50 border-purple-200">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div className="text-sm text-purple-900">
                      <p className="font-semibold mb-1">What happens when you fork?</p>
                      <ul className="list-disc list-inside space-y-1 text-purple-800">
                        <li>You'll get a copy of the story at this point</li>
                        <li>You can continue writing from here in your own direction</li>
                        <li>The original story remains unchanged</li>
                        <li>You'll earn 15 points for creating a fork!</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="flex gap-2 justify-end mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowForkModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => forkStory.mutate()}
                  disabled={!forkData.title_en.trim() || !forkData.title_pt.trim()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  <GitBranch className="w-4 h-4 mr-2" />
                  Create Fork
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}