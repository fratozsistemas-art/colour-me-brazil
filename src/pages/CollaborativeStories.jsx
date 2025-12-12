import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Users, Heart, BookOpen, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { awardPoints } from '../components/achievementManager';

export default function CollaborativeStories() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [contributionText, setContributionText] = useState('');
  const [newStory, setNewStory] = useState({
    title_en: '',
    title_pt: '',
    theme: 'folklore',
    current_text: ''
  });
  
  const queryClient = useQueryClient();
  const currentProfileId = localStorage.getItem('currentProfileId');

  const { data: stories = [] } = useQuery({
    queryKey: ['collaborativeStories'],
    queryFn: () => base44.entities.CollaborativeStory.list('-created_date'),
  });

  const { data: contributions = [] } = useQuery({
    queryKey: ['storyContributions'],
    queryFn: () => base44.entities.StoryContribution.list('order_index'),
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => base44.entities.UserProfile.list(),
  });

  const createStory = useMutation({
    mutationFn: async (storyData) => {
      await base44.entities.CollaborativeStory.create({
        ...storyData,
        creator_profile_id: currentProfileId
      });
      await awardPoints(currentProfileId, 20);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['collaborativeStories']);
      setShowCreateModal(false);
      setNewStory({ title_en: '', title_pt: '', theme: 'folklore', current_text: '' });
    },
  });

  const addContribution = useMutation({
    mutationFn: async ({ storyId, text }) => {
      const story = stories.find(s => s.id === storyId);
      const storyContributions = contributions.filter(c => c.story_id === storyId);
      const orderIndex = storyContributions.length;
      
      await base44.entities.StoryContribution.create({
        story_id: storyId,
        profile_id: currentProfileId,
        contribution_text: text,
        order_index: orderIndex
      });
      
      const newText = story.current_text + ' ' + text;
      const isComplete = newText.length >= (story.max_length || 5000);
      
      await base44.entities.CollaborativeStory.update(storyId, {
        current_text: newText,
        contributors_count: (story.contributors_count || 1) + 1,
        is_complete: isComplete
      });
      
      await awardPoints(currentProfileId, 10);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['collaborativeStories']);
      queryClient.invalidateQueries(['storyContributions']);
      setContributionText('');
    },
  });

  const getProfile = (profileId) => profiles.find(p => p.id === profileId);
  const getStoryContributions = (storyId) => 
    contributions.filter(c => c.story_id === storyId).sort((a, b) => a.order_index - b.order_index);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Collaborative Stories 📖</h1>
          <p className="text-gray-600">Build stories together, one sentence at a time!</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Start Story
        </Button>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story) => {
          const creator = getProfile(story.creator_profile_id);
          const progressPercent = Math.min((story.current_text?.length || 0) / (story.max_length || 5000) * 100, 100);
          
          return (
            <motion.div key={story.id} whileHover={{ y: -4 }}>
              <Card className={`p-6 cursor-pointer hover:shadow-xl transition-shadow ${
                story.is_complete ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400' : ''
              }`} onClick={() => setSelectedStory(story)}>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold flex-1">{story.title_en}</h3>
                  {story.is_complete && (
                    <span className="px-2 py-1 bg-green-600 text-white rounded text-xs font-bold">
                      Complete
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                  {story.current_text || 'Be the first to contribute!'}
                </p>

                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(progressPercent)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                      {creator?.child_name?.[0] || '?'}
                    </div>
                    <span className="text-gray-600">{creator?.child_name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {story.contributors_count || 1}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {story.likes_count || 0}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Create Story Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-6">Start a Collaborative Story</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title (English)</label>
                  <Input
                    value={newStory.title_en}
                    onChange={(e) => setNewStory({ ...newStory, title_en: e.target.value })}
                    placeholder="The Legend of..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Title (Portuguese)</label>
                  <Input
                    value={newStory.title_pt}
                    onChange={(e) => setNewStory({ ...newStory, title_pt: e.target.value })}
                    placeholder="A Lenda de..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Theme</label>
                  <select
                    value={newStory.theme}
                    onChange={(e) => setNewStory({ ...newStory, theme: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="folklore">Folklore</option>
                    <option value="adventure">Adventure</option>
                    <option value="mystery">Mystery</option>
                    <option value="culture">Culture</option>
                    <option value="nature">Nature</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Opening (1-3 sentences)</label>
                  <Textarea
                    value={newStory.current_text}
                    onChange={(e) => setNewStory({ ...newStory, current_text: e.target.value })}
                    placeholder="Once upon a time in the heart of the Amazon..."
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-6">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => createStory.mutate(newStory)}
                  disabled={!newStory.title_en || !newStory.title_pt || !newStory.current_text}
                >
                  Start Story
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Story Modal */}
      <AnimatePresence>
        {selectedStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedStory(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-3xl font-bold mb-6">{selectedStory.title_en}</h2>
              
              <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 mb-6">
                <p className="text-lg leading-relaxed whitespace-pre-wrap">
                  {selectedStory.current_text}
                </p>
              </Card>

              {!selectedStory.is_complete && (
                <div className="mb-6">
                  <h3 className="font-bold mb-3">Add Your Contribution (1-3 sentences)</h3>
                  <div className="flex gap-2">
                    <Textarea
                      value={contributionText}
                      onChange={(e) => setContributionText(e.target.value)}
                      placeholder="Continue the story..."
                      rows={3}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => addContribution.mutate({ 
                        storyId: selectedStory.id, 
                        text: contributionText 
                      })}
                      disabled={!contributionText.trim()}
                      className="self-end bg-purple-600 hover:bg-purple-700"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-bold mb-3">Contributors ({selectedStory.contributors_count || 1})</h3>
                <div className="space-y-2">
                  {getStoryContributions(selectedStory.id).map((contribution) => {
                    const contributor = getProfile(contribution.profile_id);
                    return (
                      <div key={contribution.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {contributor?.child_name?.[0] || '?'}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{contributor?.child_name}</div>
                          <p className="text-sm text-gray-700">{contribution.contribution_text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}