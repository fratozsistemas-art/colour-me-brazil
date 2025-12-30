import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Trophy, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTodayChallenge } from './dailyChallengeManager';
import confetti from 'canvas-confetti';

export default function DailyChallengeCard({ profile, onChallengeComplete }) {
  const [challenge, setChallenge] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      loadChallenge();
    }
  }, [profile]);

  const loadChallenge = async () => {
    if (!profile?.id) return;
    
    setLoading(true);
    try {
      const todayChallenge = await getTodayChallenge();
      setChallenge(todayChallenge);
      
      // Check if already completed today
      const today = new Date().toISOString().split('T')[0];
      if (profile?.daily_challenge_completed && profile?.daily_challenge_date === today) {
        setIsCompleted(true);
        setProgress(100);
      } else {
        // Calculate current progress based on profile data
        const currentProgress = calculateProgress(todayChallenge, profile);
        setProgress(currentProgress);
        
        if (currentProgress >= 100) {
          setIsCompleted(true);
          celebrateCompletion();
          if (onChallengeComplete) {
            onChallengeComplete(todayChallenge);
          }
        }
      }
    } catch (error) {
      console.error('Error loading challenge:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (challenge, profile) => {
    if (!challenge) return 0;

    let currentValue = 0;
    
    switch (challenge.challenge_type) {
      case 'read_pages':
        currentValue = Object.values(profile.reading_progress || {}).reduce((sum, page) => sum + page + 1, 0);
        break;
      case 'color_pages':
        currentValue = profile.pages_colored?.length || 0;
        break;
      case 'answer_quizzes':
        currentValue = profile.quizzes_correct || 0;
        break;
      case 'read_book':
        currentValue = profile.books_completed?.length || 0;
        break;
      case 'spend_time_coloring':
        currentValue = profile.total_coloring_time || 0;
        break;
      default:
        currentValue = 0;
    }

    return Math.min((currentValue / challenge.target_value) * 100, 100);
  };

  const celebrateCompletion = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      </Card>
    );
  }

  if (!challenge) {
    return null;
  }

  const language = profile?.preferred_language || 'en';
  const title = language === 'en' ? challenge.title_en : challenge.title_pt;
  const description = language === 'en' ? challenge.description_en : challenge.description_pt;

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 overflow-hidden relative">
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{challenge.icon}</div>
            <div>
              <h3 className="font-bold text-lg text-gray-800">Daily Challenge</h3>
              <p className="text-sm text-gray-600">{title}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-yellow-600">
              <Trophy className="w-4 h-4" />
              <span className="font-bold">{challenge.points_reward}</span>
            </div>
            <p className="text-xs text-gray-500">points</p>
          </div>
        </div>

        <p className="text-sm text-gray-700 mb-4">{description}</p>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 mb-2">
            <span>Progress</span>
            <span className="font-bold">{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Completion Status */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center gap-2 p-3 bg-green-100 border border-green-300 rounded-lg"
            >
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <p className="font-bold text-green-800">Challenge Completed!</p>
                <p className="text-xs text-green-700">+{challenge.points_reward} points earned</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-300/30 to-pink-300/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-300/30 to-purple-300/30 rounded-full blur-3xl"></div>
    </Card>
  );
}