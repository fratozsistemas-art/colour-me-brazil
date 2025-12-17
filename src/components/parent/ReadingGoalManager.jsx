import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Plus, Target, Calendar, CheckCircle2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function ReadingGoalManager({ parentAccountId, childProfile, goals = [] }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    goal_type: 'books_per_week',
    target_value: 2,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reward_message: 'Great job! Keep reading!'
  });

  const queryClient = useQueryClient();

  const createGoal = useMutation({
    mutationFn: (goalData) => base44.entities.ReadingGoal.create({
      ...goalData,
      parent_account_id: parentAccountId,
      child_profile_id: childProfile.id
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['readingGoals']);
      setShowCreateModal(false);
      setNewGoal({
        goal_type: 'books_per_week',
        target_value: 2,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reward_message: 'Great job! Keep reading!'
      });
    }
  });

  const deleteGoal = useMutation({
    mutationFn: (goalId) => base44.entities.ReadingGoal.delete(goalId),
    onSuccess: () => queryClient.invalidateQueries(['readingGoals'])
  });

  const goalTypes = {
    books_per_week: { label: 'Books per Week', unit: 'books' },
    pages_per_day: { label: 'Pages per Day', unit: 'pages' },
    reading_time_daily: { label: 'Minutes per Day', unit: 'mins' },
    books_by_date: { label: 'Books by Date', unit: 'books' }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          Reading Goals
        </h3>
        <Button 
          size="sm" 
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Goal
        </Button>
      </div>

      {goals.length === 0 ? (
        <Card className="p-6 text-center">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-600 text-sm">No goals set yet</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowCreateModal(true)}
            className="mt-3"
          >
            Create First Goal
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => {
            const progress = Math.min((goal.current_progress / goal.target_value) * 100, 100);
            const isComplete = goal.current_progress >= goal.target_value;

            return (
              <Card key={goal.id} className={`p-4 ${isComplete ? 'bg-green-50 border-green-200' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-800">
                        {goalTypes[goal.goal_type]?.label}
                      </h4>
                      {isComplete && (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Target: {goal.target_value} {goalTypes[goal.goal_type]?.unit}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(goal.start_date).toLocaleDateString()} - {new Date(goal.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm('Delete this goal?')) {
                        deleteGoal.mutate(goal.id);
                      }
                    }}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progress: {goal.current_progress} / {goal.target_value}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {isComplete && goal.reward_message && (
                  <div className="mt-3 p-2 bg-green-100 border border-green-200 rounded text-sm text-green-800">
                    🎉 {goal.reward_message}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Goal Modal */}
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
              className="bg-white rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4">Create Reading Goal</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Goal Type</label>
                  <select
                    value={newGoal.goal_type}
                    onChange={(e) => setNewGoal({ ...newGoal, goal_type: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  >
                    {Object.entries(goalTypes).map(([key, { label }]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Target Value</label>
                  <Input
                    type="number"
                    min="1"
                    value={newGoal.target_value}
                    onChange={(e) => setNewGoal({ ...newGoal, target_value: parseInt(e.target.value) })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">Start Date</label>
                    <Input
                      type="date"
                      value={newGoal.start_date}
                      onChange={(e) => setNewGoal({ ...newGoal, start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">End Date</label>
                    <Input
                      type="date"
                      value={newGoal.end_date}
                      onChange={(e) => setNewGoal({ ...newGoal, end_date: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Reward Message</label>
                  <Input
                    value={newGoal.reward_message}
                    onChange={(e) => setNewGoal({ ...newGoal, reward_message: e.target.value })}
                    placeholder="Great job! Keep it up!"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-6">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button onClick={() => createGoal.mutate(newGoal)}>
                  Create Goal
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}