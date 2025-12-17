import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';

export default function RealtimeCursors({ storyId, currentProfileId }) {
  const [activeCollaborators, setActiveCollaborators] = useState([]);
  const [profiles, setProfiles] = useState({});

  useEffect(() => {
    if (!storyId) return;

    // Load profiles
    loadProfiles();

    // Poll for active collaborators every 2 seconds
    const interval = setInterval(async () => {
      const collaborators = await base44.entities.ActiveCollaborator.filter({ 
        story_id: storyId 
      });
      
      // Filter out stale collaborators (inactive for more than 10 seconds)
      const now = new Date();
      const activeOnes = collaborators.filter(c => {
        if (c.profile_id === currentProfileId) return false; // Don't show own cursor
        const lastSeen = new Date(c.last_seen);
        const secondsAgo = (now - lastSeen) / 1000;
        return secondsAgo < 10;
      });
      
      setActiveCollaborators(activeOnes);
    }, 2000);

    return () => clearInterval(interval);
  }, [storyId, currentProfileId]);

  const loadProfiles = async () => {
    const allProfiles = await base44.entities.UserProfile.list();
    const profileMap = {};
    allProfiles.forEach(p => {
      profileMap[p.id] = p;
    });
    setProfiles(profileMap);
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {activeCollaborators.map((collaborator) => {
          const profile = profiles[collaborator.profile_id];
          if (!profile) return null;

          return (
            <motion.div
              key={collaborator.profile_id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium shadow-lg"
              style={{ 
                backgroundColor: collaborator.cursor_color + '20',
                borderColor: collaborator.cursor_color,
                borderWidth: '2px'
              }}
            >
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: collaborator.cursor_color }}
              />
              <span style={{ color: collaborator.cursor_color }}>
                {profile.child_name}
              </span>
              {collaborator.is_typing && (
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-xs"
                >
                  typing...
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}