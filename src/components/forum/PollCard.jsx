import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PollCard({ poll, userVote, onVote, language = 'en' }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const question = language === 'en' ? poll.question_en : poll.question_pt;
  const hasVoted = userVote !== null;
  
  const handleVote = () => {
    if (selectedOption !== null && !hasVoted) {
      onVote(selectedOption);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
      <div className="flex items-start gap-3 mb-4">
        <BarChart3 className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">{question}</h3>
          <p className="text-sm text-gray-600">
            {poll.total_votes || 0} {poll.total_votes === 1 ? 'vote' : 'votes'}
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {poll.options.map((option, index) => {
          const percentage = poll.total_votes > 0 
            ? Math.round((option.votes / poll.total_votes) * 100) 
            : 0;
          const isSelected = selectedOption === index;
          const isUserVote = userVote === index;
          
          return (
            <motion.div
              key={index}
              whileHover={!hasVoted ? { scale: 1.02 } : {}}
              onClick={() => !hasVoted && setSelectedOption(index)}
              className={`relative overflow-hidden rounded-lg border-2 transition-all cursor-pointer ${
                hasVoted
                  ? 'bg-white border-gray-300'
                  : isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-300'
              }`}
            >
              {hasVoted && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  className="absolute inset-0 bg-gradient-to-r from-blue-200 to-purple-200 opacity-50"
                />
              )}
              
              <div className="relative p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isUserVote && (
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  )}
                  <span className="font-medium">
                    {language === 'en' ? option.text_en : option.text_pt}
                  </span>
                </div>
                {hasVoted && (
                  <span className="text-sm font-bold text-gray-700">
                    {percentage}%
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {!hasVoted && (
        <Button
          onClick={handleVote}
          disabled={selectedOption === null}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          Submit Vote
        </Button>
      )}
      
      {hasVoted && (
        <div className="text-center text-sm text-gray-600">
          ✓ You voted for: {language === 'en' ? poll.options[userVote].text_en : poll.options[userVote].text_pt}
        </div>
      )}
    </Card>
  );
}