import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Palette, Brain, Trophy, Play, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LearningPathCard({ path, progress, onStart, onContinue }) {
  const activityIcons = {
    book: BookOpen,
    quiz: Brain,
    coloring: Palette,
    challenge: Trophy
  };

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-blue-100 text-blue-800',
    advanced: 'bg-purple-100 text-purple-800'
  };

  const trendIcons = {
    improving: '📈',
    stable: '➡️',
    struggling: '📉'
  };

  const isStarted = progress?.completed_activities?.length > 0;
  const isCompleted = path.status === 'completed';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`hover:shadow-xl transition-all ${isCompleted ? 'border-green-500 border-2' : ''}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 mb-2">
                {isCompleted && '✅'} {path.title}
              </CardTitle>
              <CardDescription>{path.description}</CardDescription>
            </div>
            <Badge className={difficultyColors[path.difficulty_level]}>
              {path.difficulty_level}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress Bar */}
          {isStarted && (
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Progresso</span>
                <span className="font-semibold">{Math.round(progress.progress_percentage)}%</span>
              </div>
              <Progress value={progress.progress_percentage} className="h-2" />
            </div>
          )}

          {/* Activity Preview */}
          <div className="flex flex-wrap gap-2">
            {path.activities.slice(0, 6).map((activity, index) => {
              const Icon = activityIcons[activity.type] || BookOpen;
              const isCompleted = progress?.completed_activities?.includes(activity.id);
              
              return (
                <div
                  key={activity.id}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                    isCompleted 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}
                  title={activity.title}
                >
                  {isCompleted ? '✓' : <Icon className="w-3 h-3" />}
                </div>
              );
            })}
            {path.activities.length > 6 && (
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs bg-gray-100 text-gray-500">
                +{path.activities.length - 6}
              </div>
            )}
          </div>

          {/* Learning Goals */}
          {path.learning_goals?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">Objetivos de Aprendizado:</p>
              <div className="flex flex-wrap gap-1">
                {path.learning_goals.slice(0, 3).map((goal, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {goal}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>~{path.estimated_duration_minutes} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              <span>{path.completion_reward_points} pts</span>
            </div>
            {progress?.performance_trend && (
              <div className="flex items-center gap-1">
                <span>{trendIcons[progress.performance_trend]}</span>
                <span className="capitalize">{progress.performance_trend}</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <Button 
            onClick={isStarted ? onContinue : onStart}
            disabled={isCompleted}
            className="w-full"
            variant={isCompleted ? 'outline' : 'default'}
          >
            {isCompleted ? (
              <>✓ Concluído</>
            ) : isStarted ? (
              <>
                <Play className="w-4 h-4 mr-2" />
                Continuar
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Começar Trilha
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}