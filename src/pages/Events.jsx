import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Sparkles, Calendar } from 'lucide-react';
import EventCard from '../components/events/EventCard';
import { motion } from 'framer-motion';

export default function Events() {
  const currentProfileId = localStorage.getItem('currentProfileId');
  const queryClient = useQueryClient();

  const { data: events = [] } = useQuery({
    queryKey: ['limitedEvents'],
    queryFn: () => base44.entities.LimitedEvent.list('-created_date'),
  });

  const { data: eventProgress = [] } = useQuery({
    queryKey: ['userEventProgress', currentProfileId],
    queryFn: () => base44.entities.UserEventProgress.filter({ profile_id: currentProfileId }),
    enabled: !!currentProfileId
  });

  const { data: profile } = useQuery({
    queryKey: ['profile', currentProfileId],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles.find(p => p.id === currentProfileId);
    },
    enabled: !!currentProfileId
  });

  const joinEvent = useMutation({
    mutationFn: async (eventId) => {
      const existing = eventProgress.find(p => p.event_id === eventId);
      if (!existing) {
        await base44.entities.UserEventProgress.create({
          profile_id: currentProfileId,
          event_id: eventId,
          current_progress: 0,
          is_completed: false
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userEventProgress']);
    }
  });

  const now = new Date();
  const activeEvents = events.filter(e => {
    const endDate = new Date(e.end_date);
    return e.is_active && endDate >= now;
  });

  const completedEvents = events.filter(e => {
    const progress = eventProgress.find(p => p.event_id === e.id);
    return progress?.is_completed;
  });

  const upcomingEvents = events.filter(e => {
    const startDate = new Date(e.start_date);
    return startDate > now;
  });

  const language = profile?.preferred_language || 'en';

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          <Sparkles className="w-10 h-10 text-yellow-500" />
          Limited-Time Events
        </h1>
        <p className="text-gray-600">Complete special challenges for exclusive rewards!</p>
      </div>

      {/* Active Events */}
      {activeEvents.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            🔥 Active Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeEvents.map((event) => {
              const progress = eventProgress.find(p => p.event_id === event.id);
              return (
                <EventCard
                  key={event.id}
                  event={event}
                  progress={progress}
                  language={language}
                  onJoin={() => joinEvent.mutate(event.id)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Events */}
      {completedEvents.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            ✅ Completed Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedEvents.map((event) => {
              const progress = eventProgress.find(p => p.event_id === event.id);
              return (
                <EventCard
                  key={event.id}
                  event={event}
                  progress={progress}
                  language={language}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Coming Soon
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                language={language}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {activeEvents.length === 0 && completedEvents.length === 0 && upcomingEvents.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No Events Right Now</h3>
          <p className="text-gray-600">Check back soon for exciting new challenges!</p>
        </motion.div>
      )}
    </div>
  );
}