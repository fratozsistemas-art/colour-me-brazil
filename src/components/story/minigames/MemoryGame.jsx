import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function MemoryGame({ gameConfig, onComplete, language = 'en' }) {
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    // Create pairs of cards
    const items = gameConfig.items || [];
    const cardPairs = [...items, ...items]
      .map((item, index) => ({
        ...item,
        uniqueId: index,
        pairId: item.id
      }))
      .sort(() => Math.random() - 0.5);
    setCards(cardPairs);
  }, []);

  useEffect(() => {
    if (flippedIndices.length === 2) {
      setMoves(prev => prev + 1);
      const [first, second] = flippedIndices;
      
      if (cards[first].pairId === cards[second].pairId) {
        // Match found
        setMatchedPairs([...matchedPairs, cards[first].pairId]);
        setFlippedIndices([]);
      } else {
        // No match - flip back after delay
        setTimeout(() => {
          setFlippedIndices([]);
        }, 1000);
      }
    }
  }, [flippedIndices]);

  useEffect(() => {
    if (matchedPairs.length === (gameConfig.items?.length || 0) && cards.length > 0) {
      setTimeout(() => {
        onComplete({ 
          completed: true, 
          score: Math.max(100 - moves * 5, 50),
          moves 
        });
      }, 500);
    }
  }, [matchedPairs]);

  const handleCardClick = (index) => {
    if (flippedIndices.length < 2 && 
        !flippedIndices.includes(index) && 
        !matchedPairs.includes(cards[index].pairId)) {
      setFlippedIndices([...flippedIndices, index]);
    }
  };

  const isFlipped = (index) => 
    flippedIndices.includes(index) || matchedPairs.includes(cards[index].pairId);

  return (
    <div className="p-6">
      <div className="grid grid-cols-4 gap-3 mb-4">
        {cards.map((card, index) => (
          <motion.div
            key={card.uniqueId}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => handleCardClick(index)}
              disabled={isFlipped(index)}
              className={`w-full aspect-square p-0 ${
                isFlipped(index)
                  ? 'bg-gradient-to-br from-blue-100 to-purple-100'
                  : 'bg-gradient-to-br from-gray-200 to-gray-300'
              } border-2 transition-all`}
              variant="outline"
            >
              {isFlipped(index) ? (
                <div className="flex flex-col items-center justify-center gap-1 p-2">
                  {card.image && (
                    <img src={card.image} alt="" className="w-12 h-12 object-contain" />
                  )}
                  <span className="text-xs font-medium text-center">
                    {language === 'en' ? card.text_en : card.text_pt}
                  </span>
                </div>
              ) : (
                <div className="text-4xl">❓</div>
              )}
            </Button>
          </motion.div>
        ))}
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          {language === 'en' ? 'Moves' : 'Jogadas'}: {moves} | {matchedPairs.length} / {gameConfig.items?.length || 0}
        </p>
      </div>
    </div>
  );
}