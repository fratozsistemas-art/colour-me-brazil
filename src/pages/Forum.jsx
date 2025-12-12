import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { MessageSquare, Pin, Lock, Plus, ArrowLeft, Send, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { awardPoints } from '../components/achievementManager';
import PollCard from '../components/forum/PollCard';

export default function Forum() {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTopic, setNewTopic] = useState({ title: '', category: 'general', content: '' });
  const [replyText, setReplyText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showPollModal, setShowPollModal] = useState(false);
  const [newPoll, setNewPoll] = useState({
    question_en: '',
    question_pt: '',
    options: [
      { text_en: '', text_pt: '', votes: 0 },
      { text_en: '', text_pt: '', votes: 0 }
    ]
  });
  const queryClient = useQueryClient();

  const currentProfileId = localStorage.getItem('currentProfileId');

  const { data: topics = [] } = useQuery({
    queryKey: ['forumTopics'],
    queryFn: () => base44.entities.ForumTopic.list('-created_date'),
  });

  const { data: replies = [] } = useQuery({
    queryKey: ['forumReplies'],
    queryFn: () => base44.entities.ForumReply.list('-created_date'),
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => base44.entities.UserProfile.list(),
  });

  const { data: polls = [] } = useQuery({
    queryKey: ['forumPolls'],
    queryFn: () => base44.entities.ForumPoll.list(),
  });

  const { data: pollVotes = [] } = useQuery({
    queryKey: ['pollVotes'],
    queryFn: () => base44.entities.PollVote.list(),
  });

  const createTopic = useMutation({
    mutationFn: async (topicData) => {
      await base44.entities.ForumTopic.create({
        ...topicData,
        profile_id: currentProfileId
      });
      await awardPoints(currentProfileId, 'forum_topic_created', 15);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['forumTopics']);
      setShowCreateModal(false);
      setNewTopic({ title: '', category: 'general', content: '' });
    },
  });

  const addReply = useMutation({
    mutationFn: async ({ topicId, content }) => {
      await base44.entities.ForumReply.create({
        topic_id: topicId,
        profile_id: currentProfileId,
        content
      });
      const topic = topics.find(t => t.id === topicId);
      await base44.entities.ForumTopic.update(topicId, {
        replies_count: (topic.replies_count || 0) + 1
      });
      await awardPoints(currentProfileId, 'forum_reply_posted', 5);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['forumReplies']);
      queryClient.invalidateQueries(['forumTopics']);
      setReplyText('');
    },
  });

  const createPoll = useMutation({
    mutationFn: async (pollData) => {
      if (!selectedTopic) return;
      await base44.entities.ForumPoll.create({
        ...pollData,
        topic_id: selectedTopic.id,
        total_votes: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['forumPolls']);
      setShowPollModal(false);
      setNewPoll({
        question_en: '',
        question_pt: '',
        options: [
          { text_en: '', text_pt: '', votes: 0 },
          { text_en: '', text_pt: '', votes: 0 }
        ]
      });
    },
  });

  const votePoll = useMutation({
    mutationFn: async ({ pollId, optionIndex }) => {
      await base44.entities.PollVote.create({
        poll_id: pollId,
        profile_id: currentProfileId,
        option_index: optionIndex
      });
      
      const poll = polls.find(p => p.id === pollId);
      const updatedOptions = [...poll.options];
      updatedOptions[optionIndex].votes += 1;
      
      await base44.entities.ForumPoll.update(pollId, {
        options: updatedOptions,
        total_votes: (poll.total_votes || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['forumPolls']);
      queryClient.invalidateQueries(['pollVotes']);
    },
  });

  const categories = [
    { id: 'all', name: 'All Topics', icon: '📚' },
    { id: 'folklore', name: 'Folklore', icon: '🦜' },
    { id: 'culture', name: 'Culture', icon: '🎭' },
    { id: 'art', name: 'Art & Coloring', icon: '🎨' },
    { id: 'general', name: 'General', icon: '💬' }
  ];

  const filteredTopics = selectedCategory === 'all' 
    ? topics 
    : topics.filter(t => t.category === selectedCategory);

  const pinnedTopics = filteredTopics.filter(t => t.is_pinned);
  const regularTopics = filteredTopics.filter(t => !t.is_pinned);

  const getProfile = (profileId) => profiles.find(p => p.id === profileId);
  const getTopicReplies = (topicId) => replies.filter(r => r.topic_id === topicId);
  const getTopicPoll = (topicId) => polls.find(p => p.topic_id === topicId);
  const getUserPollVote = (pollId) => {
    const vote = pollVotes.find(v => v.poll_id === pollId && v.profile_id === currentProfileId);
    return vote ? vote.option_index : null;
  };

  if (selectedTopic) {
    const topicReplies = getTopicReplies(selectedTopic.id);
    const topicProfile = getProfile(selectedTopic.profile_id);
    const topicPoll = getTopicPoll(selectedTopic.id);
    const userVote = topicPoll ? getUserPollVote(topicPoll.id) : null;

    return (
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => setSelectedTopic(null)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Topics
        </Button>

        <Card className="p-6 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
              {topicProfile?.child_name?.[0] || '?'}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{selectedTopic.title}</h1>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span>By {topicProfile?.child_name}</span>
                <span>•</span>
                <span className="px-2 py-1 bg-gray-100 rounded">
                  {categories.find(c => c.id === selectedTopic.category)?.icon} {selectedTopic.category}
                </span>
              </div>
            </div>
            {!topicPoll && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPollModal(true)}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Add Poll
              </Button>
            )}
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{selectedTopic.content}</p>
        </Card>

        {topicPoll && (
          <div className="mb-6">
            <PollCard
              poll={topicPoll}
              userVote={userVote}
              onVote={(optionIndex) => votePoll.mutate({ pollId: topicPoll.id, optionIndex })}
              language="en"
            />
          </div>
        )}

        <div className="space-y-4 mb-6">
          <h2 className="text-xl font-bold">Replies ({topicReplies.length})</h2>
          {topicReplies.map((reply) => {
            const replyProfile = getProfile(reply.profile_id);
            return (
              <Card key={reply.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {replyProfile?.child_name?.[0] || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold mb-1">{replyProfile?.child_name}</div>
                    <p className="text-gray-700">{reply.content}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {!selectedTopic.is_locked && (
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Add a Reply</h3>
            <div className="flex gap-2">
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                className="flex-1"
              />
              <Button
                onClick={() => addReply.mutate({ topicId: selectedTopic.id, content: replyText })}
                disabled={!replyText.trim()}
                className="self-end"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Community Forum 💬</h1>
          <p className="text-gray-600">Discuss Brazilian culture, folklore, and connect with others</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Topic
        </Button>
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(cat.id)}
            className="whitespace-nowrap"
          >
            {cat.icon} {cat.name}
          </Button>
        ))}
      </div>

      {/* Pinned Topics */}
      {pinnedTopics.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
            <Pin className="w-5 h-5" />
            Pinned Topics
          </h2>
          <div className="space-y-3">
            {pinnedTopics.map((topic) => {
              const profile = getProfile(topic.profile_id);
              return (
                <Card
                  key={topic.id}
                  className="p-4 cursor-pointer hover:shadow-lg transition-shadow bg-yellow-50"
                  onClick={() => setSelectedTopic(topic)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Pin className="w-4 h-4 text-yellow-600" />
                        <h3 className="font-bold text-lg">{topic.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{topic.content}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>By {profile?.child_name}</span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {topic.replies_count || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Regular Topics */}
      <div className="space-y-3">
        {regularTopics.map((topic) => {
          const profile = getProfile(topic.profile_id);
          const category = categories.find(c => c.id === topic.category);
          return (
            <motion.div key={topic.id} whileHover={{ x: 4 }}>
              <Card
                className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedTopic(topic)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{category?.icon}</span>
                      <h3 className="font-bold text-lg">{topic.title}</h3>
                      {topic.is_locked && <Lock className="w-4 h-4 text-gray-400" />}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{topic.content}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>By {profile?.child_name}</span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {topic.replies_count || 0} replies
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Create Topic Modal */}
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
              <h2 className="text-2xl font-bold mb-4">Create New Topic</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <Input
                    value={newTopic.title}
                    onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                    placeholder="What's your topic about?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={newTopic.category}
                    onChange={(e) => setNewTopic({ ...newTopic, category: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  >
                    {categories.slice(1).map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Content</label>
                  <Textarea
                    value={newTopic.content}
                    onChange={(e) => setNewTopic({ ...newTopic, content: e.target.value })}
                    placeholder="Share your thoughts, questions, or ideas..."
                    rows={6}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => createTopic.mutate(newTopic)}
                    disabled={!newTopic.title.trim() || !newTopic.content.trim()}
                  >
                    Create Topic
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showPollModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setShowPollModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-6">Create Poll</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Question (English)</label>
                  <Input
                    value={newPoll.question_en}
                    onChange={(e) => setNewPoll({ ...newPoll, question_en: e.target.value })}
                    placeholder="What's your favorite Brazilian tradition?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Question (Portuguese)</label>
                  <Input
                    value={newPoll.question_pt}
                    onChange={(e) => setNewPoll({ ...newPoll, question_pt: e.target.value })}
                    placeholder="Qual é a sua tradição brasileira favorita?"
                  />
                </div>
                {newPoll.options.map((option, index) => (
                  <div key={index} className="grid grid-cols-2 gap-2">
                    <Input
                      value={option.text_en}
                      onChange={(e) => {
                        const opts = [...newPoll.options];
                        opts[index].text_en = e.target.value;
                        setNewPoll({ ...newPoll, options: opts });
                      }}
                      placeholder={`Option ${index + 1} (EN)`}
                    />
                    <Input
                      value={option.text_pt}
                      onChange={(e) => {
                        const opts = [...newPoll.options];
                        opts[index].text_pt = e.target.value;
                        setNewPoll({ ...newPoll, options: opts });
                      }}
                      placeholder={`Opção ${index + 1} (PT)`}
                    />
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => setNewPoll({
                    ...newPoll,
                    options: [...newPoll.options, { text_en: '', text_pt: '', votes: 0 }]
                  })}
                  className="w-full"
                >
                  + Add Option
                </Button>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <Button variant="outline" onClick={() => setShowPollModal(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => createPoll.mutate(newPoll)}
                  disabled={!newPoll.question_en || !newPoll.question_pt || 
                    newPoll.options.some(o => !o.text_en || !o.text_pt)}
                >
                  Create Poll
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}