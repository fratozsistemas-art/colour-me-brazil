import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Sparkles } from 'lucide-react';

export default function MatchingGame({ gameConfig, onComplete, language = 'en' }) {
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matches, setMatches] = useState([]);
  const [wrongPairs, setWrongPairs] = useState([]);
  const [attempts, setAttempts] = useState(0);
  
  const leftItems = gameConfig.pairs?.map(p => ({ id: p.id, text: language === 'en' ? p.left_en : p.left_pt, image: p.left_image })) || [];
  const rightItems = [...(gameConfig.pairs?.map(p => ({ id: p.id, text: language === 'en' ? p.right_en : p.right_pt, image: p.right_image })) || [])].sort(() => Math.random() - 0.5);

  useEffect(() => {
    if (selectedLeft !== null && selectedRight !== null) {
      setAttempts(prev => prev + 1);
      
      if (selectedLeft === selectedRight) {
        // Correct match
        setMatches([...matches, selectedLeft]);
        setTimeout(() => {
          setSelectedLeft(null);
          setSelectedRight(null);
        }, 500);
      } else {
        // Wrong match
        setWrongPairs([[selectedLeft, selectedRight]]);
        setTimeout(() => {
          setSelectedLeft(null);
          setSelectedRight(null);
          setWrongPairs([]);
        }, 1000);
      }
    }
  }, [selectedLeft, selectedRight]);

  useEffect(() => {
    if (matches.length === leftItems.length && leftItems.length > 0) {
      // Game completed
      setTimeout(() => {
        onComplete({ 
          completed: true, 
          score: Math.max(100 - (attempts - leftItems.length) * 10, 50),
          attempts 
        });
      }, 1000);
    }
  }, [matches]);

  const isMatched = (id) => matches.includes(id);
  const isWrong = (leftId, rightId) => wrongPairs.some(([l, r]) => l === leftId && r === rightId);

  return (
    <div className="grid grid-cols-2 gap-6 p-6">
      {/* Left Column */}
      <div className="space-y-3">
        {leftItems.map((item) => (
          <motion.div
            key={`left-${item.id}`}
            whileHover={!isMatched(item.id) ? { scale: 1.05 } : {}}
            whileTap={!isMatched(item.id) ? { scale: 0.95 } : {}}
          >
            <Button
              onClick={() => !isMatched(item.id) && setSelectedLeft(item.id)}
              disabled={isMatched(item.id)}
              className={`w-full h-auto p-4 text-left justify-start ${
                isMatched(item.id)
                  ? 'bg-green-100 border-green-400 text-green-800 cursor-not-allowed opacity-50'
                  : selectedLeft === item.id
                  ? 'bg-blue-200 border-blue-500 text-blue-900'
                  : 'bg-white hover:bg-blue-50 border-gray-300 text-gray-800'
              } border-2 transition-all`}
              variant="outline"
            >
              <div className="flex items-center gap-3">
                {item.image && (
                  <img src={item.image} alt="" className="w-12 h-12 object-cover rounded" />
                )}
                <span className="flex-1">{item.text}</span>
                {isMatched(item.id) && <CheckCircle2 className="w-5 h-5 text-green-600" />}
              </div>
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Right Column */}
      <div className="space-y-3">
        {rightItems.map((item) => (
          <motion.div
            key={`right-${item.id}`}
            whileHover={!isMatched(item.id) ? { scale: 1.05 } : {}}
            whileTap={!isMatched(item.id) ? { scale: 0.95 } : {}}
          >
            <Button
              onClick={() => !isMatched(item.id) && setSelectedRight(item.id)}
              disabled={isMatched(item.id)}
              className={`w-full h-auto p-4 text-left justify-start ${
                isMatched(item.id)
                  ? 'bg-green-100 border-green-400 text-green-800 cursor-not-allowed opacity-50'
                  : selectedRight === item.id
                  ? isWrong(selectedLeft, item.id)
                    ? 'bg-red-200 border-red-500 text-red-900'
                    : 'bg-blue-200 border-blue-500 text-blue-900'
                  : 'bg-white hover:bg-blue-50 border-gray-300 text-gray-800'
              } border-2 transition-all`}
              variant="outline"
            >
              <div className="flex items-center gap-3">
                {item.image && (
                  <img src={item.image} alt="" className="w-12 h-12 object-cover rounded" />
                )}
                <span className="flex-1">{item.text}</span>
                {isMatched(item.id) && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                {isWrong(selectedLeft, item.id) && <XCircle className="w-5 h-5 text-red-600" />}
              </div>
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Progress */}
      <div className="col-span-2 text-center">
        <p className="text-sm text-gray-600">
          {matches.length} / {leftItems.length} {language === 'en' ? 'matched' : 'combinações'}
        </p>
      </div>
    </div>
  );
}