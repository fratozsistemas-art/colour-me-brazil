import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ShoppingBag, Check, Lock, Star } from 'lucide-react';
import { toast } from 'sonner';

export default function RewardsShop() {
  const [currentProfile, setCurrentProfile] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const queryClient = useQueryClient();

  // Fetch current profile
  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => base44.entities.UserProfile.list(),
  });

  useEffect(() => {
    const savedProfileId = localStorage.getItem('currentProfileId');
    if (savedProfileId && profiles.length > 0) {
      const profile = profiles.find(p => p.id === savedProfileId);
      if (profile) setCurrentProfile(profile);
    }
  }, [profiles]);

  // Fetch items and inventory
  const { data: items = [] } = useQuery({
    queryKey: ['virtualItems'],
    queryFn: () => base44.entities.VirtualItem.list(),
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ['userInventory', currentProfile?.id],
    queryFn: () => base44.entities.UserItemInventory.filter({ profile_id: currentProfile.id }),
    enabled: !!currentProfile,
  });

  const redeemItemMutation = useMutation({
    mutationFn: async (item) => {
      // Check if user has enough points
      if (currentProfile.total_points < item.points_cost) {
        throw new Error('Not enough points');
      }

      // Deduct points
      await base44.entities.UserProfile.update(currentProfile.id, {
        total_points: currentProfile.total_points - item.points_cost
      });

      // Add to inventory
      return base44.entities.UserItemInventory.create({
        profile_id: currentProfile.id,
        item_id: item.id,
        redeemed_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userInventory']);
      queryClient.invalidateQueries(['profiles']);
      toast.success('Item redeemed successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to redeem item');
    }
  });

  const categories = [
    { id: 'all', name: 'All Items', icon: ShoppingBag },
    { id: 'avatar_accessory', name: 'Avatars', icon: Star },
    { id: 'profile_theme', name: 'Themes', icon: Sparkles },
    { id: 'coloring_tool', name: 'Tools', icon: '🎨' },
    { id: 'special_badge', name: 'Badges', icon: '🏅' }
  ];

  const filteredItems = items.filter(item => 
    selectedCategory === 'all' || item.item_type === selectedCategory
  );

  const ownedItemIds = inventory.map(inv => inv.item_id);

  if (!currentProfile) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-600">Please select a profile to continue.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-24 md:pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Rewards Shop</h1>
        <p className="text-gray-600">Redeem your points for amazing rewards!</p>
        
        <div className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Your Points</p>
              <p className="text-4xl font-bold">{currentProfile.total_points || 0}</p>
            </div>
            <Sparkles className="w-16 h-16 opacity-80" />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map(cat => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(cat.id)}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            {typeof cat.icon === 'string' ? (
              <span>{cat.icon}</span>
            ) : (
              <cat.icon className="w-4 h-4" />
            )}
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => {
          const isOwned = ownedItemIds.includes(item.id);
          const canAfford = currentProfile.total_points >= item.points_cost;

          return (
            <Card key={item.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{item.icon || '🎁'}</div>
                {isOwned && (
                  <Badge className="bg-green-500">
                    <Check className="w-3 h-3 mr-1" />
                    Owned
                  </Badge>
                )}
                {item.is_limited && !isOwned && (
                  <Badge className="bg-red-500">Limited</Badge>
                )}
              </div>

              <h3 className="font-bold text-lg mb-2">
                {currentProfile.preferred_language === 'en' ? item.name_en : item.name_pt}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {currentProfile.preferred_language === 'en' ? item.description_en : item.description_pt}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  <span className="font-bold text-lg">{item.points_cost}</span>
                </div>

                <Button
                  onClick={() => redeemItemMutation.mutate(item)}
                  disabled={isOwned || !canAfford || redeemItemMutation.isPending}
                  className={`${
                    isOwned ? 'bg-gray-400' : 
                    canAfford ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 
                    'bg-gray-300'
                  }`}
                >
                  {isOwned ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Owned
                    </>
                  ) : canAfford ? (
                    'Redeem'
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Locked
                    </>
                  )}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <div className="text-6xl mb-4">🎁</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No items available</h3>
          <p className="text-gray-500">Check back later for new rewards!</p>
        </div>
      )}
    </div>
  );
}