import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '../utils';
import { User, Mail, MapPin, MessageSquare, Upload, Star } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileSettings() {
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    display_name: '',
    avatar_url: '',
    bio: '',
    location: ''
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const queryClient = useQueryClient();

  // Check auth and get user
  useEffect(() => {
    const loadUser = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          base44.auth.redirectToLogin(createPageUrl('ProfileSettings'));
          return;
        }
        const user = await base44.auth.me();
        setCurrentUser(user);
      } catch (error) {
        base44.auth.redirectToLogin(createPageUrl('ProfileSettings'));
      }
    };
    loadUser();
  }, []);

  // Fetch user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['shopProfile', currentUser?.id],
    queryFn: async () => {
      const profiles = await base44.entities.ShopUserProfile.filter({ 
        user_id: currentUser.id 
      });
      return profiles[0] || null;
    },
    enabled: !!currentUser
  });

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        avatar_url: profile.avatar_url || '',
        bio: profile.bio || '',
        location: profile.location || ''
      });
    } else if (currentUser) {
      // Initialize with user's name
      setFormData(prev => ({
        ...prev,
        display_name: currentUser.full_name || currentUser.email.split('@')[0]
      }));
    }
  }, [profile, currentUser]);

  // Fetch user's reviews
  const { data: reviews = [] } = useQuery({
    queryKey: ['userReviews', profile?.id],
    queryFn: () => base44.entities.ProductReview.filter({ 
      profile_id: profile.id 
    }),
    enabled: !!profile
  });

  // Save profile mutation
  const saveProfileMutation = useMutation({
    mutationFn: async (data) => {
      if (profile) {
        return base44.entities.ShopUserProfile.update(profile.id, data);
      } else {
        return base44.entities.ShopUserProfile.create({
          ...data,
          user_id: currentUser.id
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['shopProfile']);
      toast.success('Profile updated successfully!');
    },
    onError: (error) => {
      toast.error('Failed to update profile');
      console.error(error);
    }
  });

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, avatar_url: result.file_url }));
      toast.success('Avatar uploaded!');
    } catch (error) {
      toast.error('Failed to upload avatar');
      console.error(error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveProfileMutation.mutate(formData);
  };

  if (isLoading || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Profile Settings</h1>
        <p className="text-gray-600">Manage your public profile and review information</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Profile Form */}
        <Card className="md:col-span-2 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex items-center gap-6">
              <div className="relative">
                {formData.avatar_url ? (
                  <img
                    src={formData.avatar_url}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover border-4 border-orange-200"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center text-white text-3xl font-bold">
                    {formData.display_name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <label className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <Upload className="w-4 h-4 text-gray-600" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={uploadingAvatar}
                  />
                </label>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Profile Photo</h3>
                <p className="text-sm text-gray-500">
                  {uploadingAvatar ? 'Uploading...' : 'Click the icon to upload'}
                </p>
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Display Name *
              </label>
              <Input
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                placeholder="Your public name"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                This name will appear on your reviews
              </p>
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </label>
              <Input
                value={currentUser.email}
                disabled
                className="bg-gray-50"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Location
              </label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, Country"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Bio
              </label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.bio?.length || 0}/500 characters
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={saveProfileMutation.isPending}
              className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
            >
              {saveProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
            </Button>
          </form>
        </Card>

        {/* Profile Stats */}
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Your Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Reviews Posted</span>
                <span className="font-bold text-2xl text-orange-600">
                  {reviews.length}
                </span>
              </div>
              {profile?.verified_buyer && (
                <div className="flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-gray-700 font-medium">Verified Buyer</span>
                </div>
              )}
            </div>
          </Card>

          {reviews.length > 0 && (
            <Card className="p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Recent Reviews</h3>
              <div className="space-y-3">
                {reviews.slice(0, 3).map(review => (
                  <div key={review.id} className="border-b pb-3 last:border-0">
                    <div className="flex items-center gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < review.rating
                              ? 'text-yellow-500 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {review.review_text}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(review.created_date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}