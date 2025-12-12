import React from 'react';
import { Card } from '@/components/ui/card';
import { Target, TrendingUp, Award, CheckCircle, XCircle } from 'lucide-react';

export default function QuizPerformance({ profile, quizResults = [] }) {
  const totalQuizzes = profile.quizzes_attempted || 0;
  const correctQuizzes = profile.quizzes_correct || 0;
  const accuracy = totalQuizzes > 0 ? Math.round((correctQuizzes / totalQuizzes) * 100) : 0;

  // Recent quiz results (last 10)
  const recentResults = [...quizResults]
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 10);

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Target className="w-5 h-5" />
        Quiz Performance
      </h3>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-600">{totalQuizzes}</div>
          <div className="text-xs text-gray-600">Total Quizzes</div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 text-center">
          <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-600">{correctQuizzes}</div>
          <div className="text-xs text-gray-600">Correct</div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-600">{accuracy}%</div>
          <div className="text-xs text-gray-600">Accuracy</div>
        </div>
      </div>

      {/* Current Streak */}
      {profile.consecutive_quizzes_correct > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-orange-600" />
            <span className="font-semibold text-orange-800">
              Current Streak: {profile.consecutive_quizzes_correct} correct in a row! 🔥
            </span>
          </div>
        </div>
      )}

      {/* Recent Results */}
      {recentResults.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-700 mb-3">Recent Quizzes</h4>
          <div className="space-y-2">
            {recentResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  result.is_correct
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {result.is_correct ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      result.is_correct ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {result.is_correct ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    {result.points_earned > 0 && (
                      <span className="text-green-600 font-semibold">
                        +{result.points_earned} pts
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalQuizzes === 0 && (
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No quizzes attempted yet</p>
          <p className="text-sm text-gray-400 mt-1">Quiz results will appear here</p>
        </div>
      )}
    </Card>
  );
}