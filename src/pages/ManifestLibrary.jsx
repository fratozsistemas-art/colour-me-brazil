import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import LibraryGrid from '../components/library/LibraryGrid';
import ProfileSelector from '../components/profile/ProfileSelector';

export default function ManifestLibrary() {
  const [currentProfile, setCurrentProfile] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          base44.auth.redirectToLogin(window.location.pathname);
          return;
        }
      } catch (error) {
        base44.auth.redirectToLogin(window.location.pathname);
        return;
      }
      setIsCheckingAuth(false);
    };
    checkAuth();
  }, []);

  // Fetch user profiles
  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => base44.entities.UserProfile.list(),
  });

  // Load saved profile from localStorage
  useEffect(() => {
    const savedProfileId = localStorage.getItem('currentProfileId');
    if (savedProfileId && profiles.length > 0) {
      const profile = profiles.find(p => p.id === savedProfileId);
      if (profile) {
        setCurrentProfile(profile);
      }
    }
  }, [profiles]);

  const handleProfileCreated = async (profileData) => {
    if (profileData.id) {
      // Existing profile selected
      setCurrentProfile(profileData);
      localStorage.setItem('currentProfileId', profileData.id);
    } else {
      // New profile created
      const newProfile = await base44.entities.UserProfile.create(profileData);
      setCurrentProfile(newProfile);
      localStorage.setItem('currentProfileId', newProfile.id);
    }
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If no profile selected, show profile selector
  if (!currentProfile) {
    return <ProfileSelector onProfileCreated={handleProfileCreated} existingProfiles={profiles} />;
  }

  return (
    <LibraryGrid 
      profileId={currentProfile.id}
      language={currentProfile.preferred_language || 'en'}
    />
  );
}