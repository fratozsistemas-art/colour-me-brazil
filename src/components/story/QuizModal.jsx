import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Lightbulb, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function QuizModal({ quiz, language, onComplete, onClose, profileId }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  if (!quiz) return null;

  const question = language === 'en' ? quiz.question_en : quiz.question_pt;
  const explanation = language === 'en' ? quiz.explanation_en : quiz.explanation_pt;

  const handleAnswer = async (optionIndex) => {
    if (showResult) return;
    
    setSelectedOption(optionIndex);
    const correct = quiz.options[optionIndex].is_correct;
    setIsCorrect(correct);
    setShowResult(true);
    
    // Track quiz attempt in profile
    if (profileId) {
      try {
        const { base44 } = await import('@/api/base44Client');
        const profiles = await base44.entities.UserProfile.filter({ id: profileId });
        if (profiles.length > 0) {
          const profile = profiles[0];
          const newQuizzesAttempted = (profile.quizzes_attempted || 0) + 1;
          const newQuizzesCorrect = correct ? (profile.quizzes_correct || 0) + 1 : profile.quizzes_correct;
          const newConsecutiveCorrect = correct ? (profile.consecutive_quizzes_correct || 0) + 1 : 0;
          
          await base44.entities.UserProfile.update(profileId, {
            quizzes_attempted: newQuizzesAttempted,
            quizzes_correct: newQuizzesCorrect,
            consecutive_quizzes_correct: newConsecutiveCorrect,
            total_points: (profile.total_points || 0) + (correct ? 10 : 0)
          });
        }
      } catch (error) {
        console.error('Error tracking quiz:', error);
      }
    }
    
    if (onComplete) {
      onComplete({ correct, optionIndex });
    }
  };

  const handleContinue = () => {
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/70 flex items-center justify-center z-30 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ 
              background: 'linear-gradient(135deg, #FF6B35 0%, #2E86AB 100%)'
            }}>
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Quiz Time! 🧠</h3>
            <p className="text-sm text-gray-500">Test your knowledge</p>
          </div>
        </div>

        <p className="text-lg font-medium text-gray-700 mb-6 leading-relaxed">
          {question}
        </p>

        <div className="space-y-3 mb-6">
          {quiz.options.map((option, index) => {
            const optionText = language === 'en' ? option.text_en : option.text_pt;
            const isSelected = selectedOption === index;
            const isCorrectOption = option.is_correct;
            
            let buttonStyle = 'border-2 border-gray-200 hover:border-blue-300 bg-white';
            
            if (showResult && isSelected) {
              buttonStyle = isCorrect 
                ? 'border-2 border-green-500 bg-green-50' 
                : 'border-2 border-red-500 bg-red-50';
            } else if (showResult && isCorrectOption) {
              buttonStyle = 'border-2 border-green-500 bg-green-50';
            }

            return (
              <motion.button
                key={index}
                whileHover={!showResult ? { scale: 1.02 } : {}}
                whileTap={!showResult ? { scale: 0.98 } : {}}
                onClick={() => handleAnswer(index)}
                disabled={showResult}
                className={`w-full p-4 rounded-xl text-left transition-all ${buttonStyle} ${
                  showResult ? 'cursor-default' : 'cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">{optionText}</span>
                  {showResult && isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      {isCorrect ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600" />
                      )}
                    </motion.div>
                  )}
                  {showResult && !isSelected && isCorrectOption && (
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-4 rounded-xl mb-4 ${
                isCorrect ? 'bg-green-50 border-2 border-green-200' : 'bg-blue-50 border-2 border-blue-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <Trophy className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                ) : (
                  <Lightbulb className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                )}
                <div>
                  <p className={`font-semibold mb-1 ${isCorrect ? 'text-green-800' : 'text-blue-800'}`}>
                    {isCorrect ? '🎉 Correct!' : '💡 Good try!'}
                  </p>
                  {explanation && (
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {explanation}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {showResult && (
          <Button
            onClick={handleContinue}
            className="w-full"
            style={{ 
              background: 'linear-gradient(135deg, #06A77D 0%, #2E86AB 100%)',
              color: '#FFFFFF'
            }}
          >
            Continue Reading
          </Button>
        )}
      </motion.div>
    </motion.div>
  );
}