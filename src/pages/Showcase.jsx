import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Heart, MessageCircle, Share2, Star, Plus, Filter, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { awardPoints } from '../components/achievementManager';

export default function Showcase() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const queryClient = useQueryClient();

  const currentProfileId = localStorage.getItem('currentProfileId');

  const { data: showcaseItems = [] } = useQuery({
    queryKey: ['showcaseItems'],
    queryFn: () => base44.entities.ShowcaseItem.list('-created_date'),
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => base44.entities.UserProfile.list(),
  });

  const { data: likes = [] } = useQuery({
    queryKey: ['likes'],
    queryFn: () => base44.entities.Like.list(),
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['comments'],
    queryFn: () => base44.entities.Comment.list('-created_date'),
  });

  const toggleLike = useMutation({
    mutationFn: async (itemId) => {
      const existingLike = likes.find(
        l => l.showcase_item_id === itemId && l.profile_id === currentProfileId
      );

      if (existingLike) {
        await base44.entities.Like.delete(existingLike.id);
        const item = showcaseItems.find(i => i.id === itemId);
        await base44.entities.ShowcaseItem.update(itemId, {
          likes_count: Math.max(0, (item.likes_count || 0) - 1)
        });
      } else {
        await base44.entities.Like.create({
          profile_id: currentProfileId,
          showcase_item_id: itemId
        });
        const item = showcaseItems.find(i => i.id === itemId);
        await base44.entities.ShowcaseItem.update(itemId, {
          likes_count: (item.likes_count || 0) + 1
        });
        await awardPoints(currentProfileId, 'like_given', 2);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['likes']);
      queryClient.invalidateQueries(['showcaseItems']);
    },
  });

  const addComment = useMutation({
    mutationFn: async ({ itemId, content }) => {
      await base44.entities.Comment.create({
        profile_id: currentProfileId,
        showcase_item_id: itemId,
        content
      });
      const item = showcaseItems.find(i => i.id === itemId);
      await base44.entities.ShowcaseItem.update(itemId, {
        comments_count: (item.comments_count || 0) + 1
      });
      await awardPoints(currentProfileId, 'comment_given', 5);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['comments']);
      queryClient.invalidateQueries(['showcaseItems']);
      setCommentText('');
    },
  });

  const filteredItems = showcaseItems.filter(item => {
    const matchesCategory = filterCategory === 'all' || item.content_type === filterCategory;
    const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getProfile = (profileId) => profiles.find(p => p.id === profileId);
  const isLiked = (itemId) => likes.some(l => l.showcase_item_id === itemId && l.profile_id === currentProfileId);
  const getItemComments = (itemId) => comments.filter(c => c.showcase_item_id === itemId);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Community Showcase 🎨</h1>
        <p className="text-gray-600">Discover amazing artwork and stories from our community</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-md mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search showcase..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterCategory('all')}
          >
            All
          </Button>
          <Button
            variant={filterCategory === 'coloring_page' ? 'default' : 'outline'}
            onClick={() => setFilterCategory('coloring_page')}
          >
            🎨 Art
          </Button>
          <Button
            variant={filterCategory === 'story' ? 'default' : 'outline'}
            onClick={() => setFilterCategory('story')}
          >
            📖 Stories
          </Button>
        </div>
      </div>

      {/* Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const profile = getProfile(item.profile_id);
          const itemLiked = isLiked(item.id);
          
          return (
            <motion.div
              key={item.id}
              whileHover={{ y: -4 }}
              className="cursor-pointer"
              onClick={() => setSelectedItem(item)}
            >
              <Card className="overflow-hidden hover:shadow-xl transition-shadow">
                {item.content_type === 'coloring_page' && item.content_url && (
                  <img
                    src={item.content_url}
                    alt={item.title}
                    className="w-full h-64 object-cover"
                  />
                )}
                {item.is_featured && (
                  <div className="absolute top-3 right-3 bg-yellow-500 text-white p-2 rounded-full shadow-lg">
                    <Star className="w-4 h-4" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                        {profile?.child_name?.[0] || '?'}
                      </div>
                      <span className="text-sm text-gray-700">{profile?.child_name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike.mutate(item.id);
                        }}
                        className="flex items-center gap-1 hover:text-red-500 transition-colors"
                      >
                        <Heart className={`w-4 h-4 ${itemLiked ? 'fill-red-500 text-red-500' : ''}`} />
                        <span className="text-sm">{item.likes_count || 0}</span>
                      </button>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm">{item.comments_count || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {selectedItem.content_type === 'coloring_page' && (
                  <img
                    src={selectedItem.content_url}
                    alt={selectedItem.title}
                    className="w-full rounded-lg mb-4"
                  />
                )}
                <h2 className="text-2xl font-bold mb-2">{selectedItem.title}</h2>
                <p className="text-gray-600 mb-4">{selectedItem.description}</p>
                
                <div className="flex items-center gap-4 mb-6 pb-4 border-b">
                  <button
                    onClick={() => toggleLike.mutate(selectedItem.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isLiked(selectedItem.id)
                        ? 'bg-red-50 text-red-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked(selectedItem.id) ? 'fill-red-600' : ''}`} />
                    <span>{selectedItem.likes_count || 0} Likes</span>
                  </button>
                  <Button variant="outline">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>

                {/* Comments Section */}
                <div>
                  <h3 className="font-semibold mb-4">Comments ({selectedItem.comments_count || 0})</h3>
                  
                  <div className="space-y-4 mb-4">
                    {getItemComments(selectedItem.id).map((comment) => {
                      const commentProfile = getProfile(comment.profile_id);
                      return (
                        <div key={comment.id} className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {commentProfile?.child_name?.[0] || '?'}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-sm">{commentProfile?.child_name}</div>
                            <p className="text-gray-700">{comment.content}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-2">
                    <Textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1"
                      rows={2}
                    />
                    <Button
                      onClick={() => addComment.mutate({ itemId: selectedItem.id, content: commentText })}
                      disabled={!commentText.trim()}
                    >
                      Post
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}