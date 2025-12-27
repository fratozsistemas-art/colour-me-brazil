import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Trophy, Star, Timer } from 'lucide-react';
import MatchingGame from './MatchingGame';
import MemoryGame from './MemoryGame';
import confetti from 'canvas-confetti';

const gameComponents = {
  matching: MatchingGame,
  memory: MemoryGame,
  // Add more game types as needed
};

export default function MiniGameModal({ 
  game, 
  onComplete, 
  onSkip, 
  language = 'en' 
}) {
  const [gameResult, setGameResult] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(true);

  React.useEffect(() => {
    if (!timerActive) return;
    
    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
      
      if (game.time_limit_seconds && timeElapsed >= game.time_limit_seconds) {
        handleGameComplete({ completed: false, timeout: true });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, timeElapsed]);

  const handleGameComplete = (result) => {
    setTimerActive(false);
    setGameResult(result);
    
    if (result.completed) {
      // Celebrate!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    setTimeout(() => {
      onComplete({
        ...result,
        timeElapsed,
        game_id: game.id
      });
    }, 2000);
  };

  const GameComponent = gameComponents[game.game_type];

  if (!GameComponent) {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <Card className="p-8 max-w-md">
          <p className="text-gray-600">
            {language === 'en' 
              ? 'This game type is not yet supported.' 
              : 'Este tipo de jogo ainda não é suportado.'}
          </p>
          <Button onClick={onSkip} className="mt-4 w-full">
            {language === 'en' ? 'Continue Story' : 'Continuar História'}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-4xl"
        >
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-orange-300 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Trophy className="w-8 h-8" />
                  <h2 className="text-2xl font-bold">
                    {language === 'en' ? game.title_en : game.title_pt}
                  </h2>
                </div>
                {!game.required_to_continue && !gameResult && (
                  <Button
                    onClick={onSkip}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                )}
              </div>
              
              <p className="text-white/90">
                {language === 'en' ? game.instructions_en : game.instructions_pt}
              </p>

              {/* Timer */}
              {game.time_limit_seconds && (
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <Timer className="w-4 h-4" />
                  <span>
                    {Math.max(0, game.time_limit_seconds - timeElapsed)}s {language === 'en' ? 'remaining' : 'restantes'}
                  </span>
                </div>
              )}
            </div>

            {/* Game Content */}
            {!gameResult ? (
              <GameComponent
                gameConfig={game.game_config}
                onComplete={handleGameComplete}
                language={language}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 text-center"
              >
                {gameResult.completed ? (
                  <>
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 10, 0],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ duration: 0.5 }}
                      className="text-8xl mb-4"
                    >
                      🎉
                    </motion.div>
                    <h3 className="text-3xl font-bold text-green-600 mb-2">
                      {language === 'en' ? 'Congratulations!' : 'Parabéns!'}
                    </h3>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      {[...Array(3)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-8 h-8 ${
                            gameResult.score >= (i + 1) * 33
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xl text-gray-700">
                      {language === 'en' ? 'Score' : 'Pontuação'}: {gameResult.score}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-6xl mb-4">😅</div>
                    <h3 className="text-2xl font-bold text-orange-600 mb-2">
                      {language === 'en' ? 'Good try!' : 'Boa tentativa!'}
                    </h3>
                    <p className="text-gray-700">
                      {language === 'en' 
                        ? "Don't worry, you can try again later!" 
                        : 'Não se preocupe, você pode tentar novamente mais tarde!'}
                    </p>
                  </>
                )}
              </motion.div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}