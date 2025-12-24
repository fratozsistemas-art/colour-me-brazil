import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Gift, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';

export default function RewardUnlockModal({ reward, onClose, onClaim }) {
  React.useEffect(() => {
    if (reward) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [reward]);

  if (!reward) return null;

  return (
    <Dialog open={!!reward} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            🎉 Recompensa Desbloqueada!
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="text-center py-6"
        >
          <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-200 to-orange-300 flex items-center justify-center text-6xl shadow-xl">
            {reward.icon || '🎁'}
          </div>

          <h3 className="text-xl font-bold mb-2">{reward.name}</h3>
          <p className="text-gray-600 mb-4">{reward.description}</p>

          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {reward.type === 'avatar_accessory' && (
              <Badge className="bg-purple-100 text-purple-800">
                <Sparkles className="w-3 h-3 mr-1" />
                Item de Avatar
              </Badge>
            )}
            {reward.bonus_points && (
              <Badge className="bg-blue-100 text-blue-800">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{reward.bonus_points} pontos bônus
              </Badge>
            )}
          </div>

          <Button 
            onClick={onClaim} 
            size="lg"
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500"
          >
            <Gift className="w-4 h-4 mr-2" />
            Reivindicar Recompensa
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}