import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, User } from 'lucide-react';
import { BRAZILIAN_FAUNA_AVATARS } from './BrazilianFaunaAvatars';

const AVATAR_OPTIONS = BRAZILIAN_FAUNA_AVATARS;

export default function ProfileSelector({ onProfileCreated, existingProfiles = [] }) {
  const [isCreating, setIsCreating] = useState(existingProfiles.length === 0);
  const [childName, setChildName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0].id);
  const [preferredLanguage, setPreferredLanguage] = useState('en');

  const handleCreateProfile = () => {
    if (childName.trim().length >= 2) {
      onProfileCreated({
        child_name: childName.trim(),
        avatar_icon: selectedAvatar,
        preferred_language: preferredLanguage,
        narration_language: preferredLanguage
      });
    }
  };

  const handleSelectProfile = (profile) => {
    onProfileCreated(profile);
  };

  if (isCreating) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-100 via-yellow-100 to-blue-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          <Card className="p-8 shadow-2xl bg-white/95 backdrop-blur">
            <div className="text-center mb-8">
              <motion.div
                initial={{ rotate: -10 }}
                animate={{ rotate: 10 }}
                transition={{ repeat: Infinity, duration: 2, repeatType: 'reverse' }}
                className="inline-block mb-4"
              >
                <Sparkles className="w-16 h-16 text-yellow-500" />
              </motion.div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Welcome to Colour Me Brazil!
              </h1>
              <p className="text-gray-600">Let's create your coloring profile</p>
            </div>

            <div className="space-y-6">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  What's your name?
                </label>
                <Input
                  type="text"
                  placeholder="Enter your name"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  className="text-lg p-6"
                  maxLength={20}
                />
              </div>

              {/* Avatar Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Choose your Brazilian animal spirit
                </label>
                <div className="grid grid-cols-5 gap-3 max-h-64 overflow-y-auto">
                  {AVATAR_OPTIONS.map((avatar) => {
                    const isSelected = selectedAvatar === avatar.id;
                    const displayName = preferredLanguage === 'en' ? avatar.nameEn : avatar.namePt;
                    const tagline = preferredLanguage === 'en' ? avatar.taglineEn : avatar.taglinePt;
                    
                    return (
                      <motion.button
                        key={avatar.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedAvatar(avatar.id)}
                        className={`aspect-square rounded-xl border-4 p-2 flex flex-col items-center justify-center transition-all relative group ${
                          isSelected
                            ? 'border-green-500 bg-green-50 shadow-lg'
                            : 'border-gray-200 hover:border-green-300 bg-white'
                        }`}
                        title={`${displayName} - ${tagline}`}
                      >
                        <div className="text-3xl mb-1">{avatar.emoji}</div>
                        <div className="text-[8px] font-semibold text-center text-gray-600 leading-tight">
                          {displayName}
                        </div>
                        
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                          {tagline}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Language Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Preferred Language / Idioma Preferido
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={preferredLanguage === 'en' ? 'default' : 'outline'}
                    onClick={() => setPreferredLanguage('en')}
                    className="py-6 text-lg"
                  >
                    🇺🇸 English
                  </Button>
                  <Button
                    type="button"
                    variant={preferredLanguage === 'pt' ? 'default' : 'outline'}
                    onClick={() => setPreferredLanguage('pt')}
                    className="py-6 text-lg"
                  >
                    🇧🇷 Português
                  </Button>
                </div>
              </div>

              {/* Create Button */}
              <Button
                onClick={handleCreateProfile}
                disabled={childName.trim().length < 2}
                className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                Start Coloring! 🎨
              </Button>

              {existingProfiles.length > 0 && (
                <Button
                  onClick={() => setIsCreating(false)}
                  variant="outline"
                  className="w-full"
                >
                  Back to Profile Selection
                </Button>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Profile Selection Screen
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-100 via-yellow-100 to-blue-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        <Card className="p-8 shadow-2xl bg-white/95 backdrop-blur">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Who's coloring today?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <AnimatePresence>
              {existingProfiles.map((profile) => {
                const avatar = AVATAR_OPTIONS.find(a => a.id === profile.avatar_icon);
                return (
                  <motion.button
                    key={profile.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelectProfile(profile)}
                    className="p-6 rounded-2xl border-2 border-gray-200 hover:border-green-400 bg-white shadow-md hover:shadow-xl transition-all"
                  >
                    <div className="text-6xl mb-3">{avatar?.emoji || '👤'}</div>
                    <div className="font-bold text-lg text-gray-800">{profile.child_name}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {profile.books_completed?.length || 0} books completed
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>

            {/* Add New Profile Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCreating(true)}
              className="p-6 rounded-2xl border-2 border-dashed border-gray-300 hover:border-green-400 bg-gray-50 hover:bg-green-50 transition-all flex flex-col items-center justify-center"
            >
              <User className="w-12 h-12 text-gray-400 mb-3" />
              <div className="font-semibold text-gray-600">Add New Profile</div>
            </motion.button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}