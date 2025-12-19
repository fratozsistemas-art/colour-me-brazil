import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, UserPlus, Edit, Trash2, Shield, Users, Mail, Calendar, CheckSquare, Square } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ManageUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const queryClient = useQueryClient();

  // Fetch all user profiles
  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date'),
  });

  // Fetch parent accounts
  const { data: parentAccounts = [] } = useQuery({
    queryKey: ['parentAccounts'],
    queryFn: () => base44.entities.ParentAccount.list(),
  });

  // Delete profile mutation
  const deleteProfile = useMutation({
    mutationFn: (profileId) => base44.entities.UserProfile.delete(profileId),
    onSuccess: () => {
      queryClient.invalidateQueries(['allProfiles']);
      setSelectedUser(null);
    }
  });

  // Bulk delete mutation
  const bulkDeleteProfiles = useMutation({
    mutationFn: async (profileIds) => {
      await Promise.all(profileIds.map(id => base44.entities.UserProfile.delete(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allProfiles']);
      setSelectedUserIds([]);
    }
  });

  const toggleUserSelection = (userId) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUserIds.length === filteredProfiles.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredProfiles.map(p => p.id));
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Delete ${selectedUserIds.length} selected users?`)) {
      bulkDeleteProfiles.mutate(selectedUserIds);
    }
  };

  // Filter profiles
  const filteredProfiles = profiles.filter(profile =>
    profile.child_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getParentForProfile = (profileId) => {
    return parentAccounts.find(parent => 
      parent.child_profiles?.includes(profileId)
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">User Management</h1>
        <p className="text-gray-600">Manage user profiles and accounts</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Users</p>
              <p className="text-3xl font-bold text-blue-800">{profiles.length}</p>
            </div>
            <Users className="w-12 h-12 text-blue-600 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Active Users</p>
              <p className="text-3xl font-bold text-green-800">
                {profiles.filter(p => {
                  const lastActive = new Date(p.last_activity_date);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return lastActive >= weekAgo;
                }).length}
              </p>
            </div>
            <Shield className="w-12 h-12 text-green-600 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Parent Accounts</p>
              <p className="text-3xl font-bold text-purple-800">{parentAccounts.length}</p>
            </div>
            <Mail className="w-12 h-12 text-purple-600 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">New This Week</p>
              <p className="text-3xl font-bold text-orange-800">
                {profiles.filter(p => {
                  const created = new Date(p.created_date);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return created >= weekAgo;
                }).length}
              </p>
            </div>
            <Calendar className="w-12 h-12 text-orange-600 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="p-6 mb-6">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search users by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {selectedUserIds.length > 0 && (
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={bulkDeleteProfiles.isPending}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete {selectedUserIds.length} Selected
            </Button>
          )}
        </div>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-4 text-left">
                    <button
                      onClick={toggleSelectAll}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      {selectedUserIds.length === filteredProfiles.length ? (
                        <CheckSquare className="w-5 h-5" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Level
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Points
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Books
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Parent
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProfiles.map((profile, index) => {
                  const parent = getParentForProfile(profile.id);
                  
                  return (
                    <motion.tr
                      key={profile.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`hover:bg-gray-50 transition-colors ${
                        selectedUserIds.includes(profile.id) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="px-4 py-4">
                        <button
                          onClick={() => toggleUserSelection(profile.id)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          {selectedUserIds.includes(profile.id) ? (
                            <CheckSquare className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">
                            {profile.avatar_icon === 'jaguar' && '🐆'}
                            {profile.avatar_icon === 'toucan' && '🦜'}
                            {profile.avatar_icon === 'sloth' && '🦥'}
                            {!['jaguar', 'toucan', 'sloth'].includes(profile.avatar_icon) && '👤'}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">
                              {profile.child_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {profile.preferred_language === 'en' ? '🇺🇸 EN' : '🇧🇷 PT'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                          Level {profile.level || 1}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">⭐</span>
                          <span className="font-semibold">{profile.total_points || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-700">
                          {profile.books_completed?.length || 0} completed
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {parent ? (
                          <div className="text-sm">
                            <div className="font-medium text-gray-700">{parent.parent_name}</div>
                            <div className="text-xs text-gray-500">{parent.parent_email}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">No parent</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(profile.created_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedUser(profile)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm(`Delete ${profile.child_name}'s profile?`)) {
                                deleteProfile.mutate(profile.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedUser.child_name}'s Profile
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedUser(null)}
              >
                ✕
              </Button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600">Level</label>
                  <p className="text-lg font-bold text-gray-800">{selectedUser.level || 1}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Total Points</label>
                  <p className="text-lg font-bold text-gray-800">{selectedUser.total_points || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Books Completed</label>
                  <p className="text-lg font-bold text-gray-800">{selectedUser.books_completed?.length || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Pages Colored</label>
                  <p className="text-lg font-bold text-gray-800">{selectedUser.pages_colored?.length || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Current Streak</label>
                  <p className="text-lg font-bold text-gray-800">{selectedUser.current_streak || 0} days</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Longest Streak</label>
                  <p className="text-lg font-bold text-gray-800">{selectedUser.longest_streak || 0} days</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setSelectedUser(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}