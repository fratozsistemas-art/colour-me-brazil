import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Eye, MessageCircle, Award, Calendar, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ShareButton from '../social/ShareButton';

export default function FamilyArtGallery({ parentAccount }) {
  const [selectedArt, setSelectedArt] = useState(null);
  const [filterChild, setFilterChild] = useState('all');

  // Fetch all child profiles
  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles', parentAccount?.id],
    queryFn: async () => {
      const allProfiles = await base44.entities.UserProfile.list();
      return allProfiles.filter(p => parentAccount?.child_profiles?.includes(p.id));
    },
    enabled: !!parentAccount,
  });

  // Fetch all artwork from family
  const { data: allArtwork = [] } = useQuery({
    queryKey: ['familyArtwork', parentAccount?.id],
    queryFn: async () => {
      const profileIds = parentAccount.child_profiles || [];
      const artworkPromises = profileIds.map(id =>
        base44.entities.ColoredArtwork.filter({ profile_id: id })
      );
      const results = await Promise.all(artworkPromises);
      return results.flat().sort((a, b) => 
        new Date(b.created_date) - new Date(a.created_date)
      );
    },
    enabled: !!parentAccount,
  });

  // Fetch books for titles
  const { data: books = [] } = useQuery({
    queryKey: ['books'],
    queryFn: () => base44.entities.Book.list(),
  });

  const filteredArtwork = filterChild === 'all' 
    ? allArtwork 
    : allArtwork.filter(art => art.profile_id === filterChild);

  const getChildName = (profileId) => {
    return profiles.find(p => p.id === profileId)?.child_name || 'Unknown';
  };

  const getChildAvatar = (profileId) => {
    const profile = profiles.find(p => p.id === profileId);
    const icon = profile?.avatar_icon;
    if (icon === 'jaguar') return '🐆';
    if (icon === 'toucan') return '🦜';
    if (icon === 'sloth') return '🦥';
    return '👤';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">🎨 Galeria de Arte da Família</h2>
        <p className="text-gray-600">
          Celebre a criatividade das crianças! Todas as obras de arte ficam aqui.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="text-3xl font-bold text-purple-600">{allArtwork.length}</div>
          <div className="text-sm text-gray-600">Total de Obras</div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="text-3xl font-bold text-blue-600">{profiles.length}</div>
          <div className="text-sm text-gray-600">Artistas</div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100">
          <div className="text-3xl font-bold text-green-600">
            {Math.floor(allArtwork.reduce((sum, a) => sum + (a.coloring_time_seconds || 0), 0) / 60)}
          </div>
          <div className="text-sm text-gray-600">Minutos Criando</div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="text-3xl font-bold text-orange-600">
            {new Set(allArtwork.map(a => a.book_id)).size}
          </div>
          <div className="text-sm text-gray-600">Livros Coloridos</div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filterChild === 'all' ? 'default' : 'outline'}
          onClick={() => setFilterChild('all')}
          size="sm"
        >
          Todos ({allArtwork.length})
        </Button>
        {profiles.map((profile) => (
          <Button
            key={profile.id}
            variant={filterChild === profile.id ? 'default' : 'outline'}
            onClick={() => setFilterChild(profile.id)}
            size="sm"
          >
            {getChildAvatar(profile.id)} {profile.child_name} (
            {allArtwork.filter(a => a.profile_id === profile.id).length})
          </Button>
        ))}
      </div>

      {/* Gallery Grid */}
      {filteredArtwork.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Nenhuma obra de arte ainda
          </h3>
          <p className="text-gray-500">
            As crianças começarão a criar arte em breve!
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredArtwork.map((artwork, index) => {
            const book = books.find(b => b.id === artwork.book_id);
            return (
              <motion.div
                key={artwork.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
                  onClick={() => setSelectedArt(artwork)}
                >
                  <div className="relative aspect-square bg-gray-100">
                    <img
                      src={artwork.artwork_url}
                      alt="Artwork"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{getChildAvatar(artwork.profile_id)}</span>
                      <span className="text-sm font-medium text-gray-800">
                        {getChildName(artwork.profile_id)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-1">
                      {book?.title_pt || 'Sem título'}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {new Date(artwork.created_date).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {selectedArt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedArt(null)}
          >
            <div
              className="max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="bg-white rounded-xl overflow-hidden shadow-2xl"
              >
                <img
                  src={selectedArt.artwork_url}
                  alt="Artwork"
                  className="w-full max-h-[60vh] object-contain bg-gray-100"
                />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{getChildAvatar(selectedArt.profile_id)}</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          Obra de {getChildName(selectedArt.profile_id)}
                        </h3>
                        <p className="text-gray-600">
                          {books.find(b => b.id === selectedArt.book_id)?.title_pt || 'Sem título'}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-purple-100 text-purple-700">
                      <Award className="w-3 h-3 mr-1" />
                      Galeria Familiar
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedArt.created_date).toLocaleDateString('pt-BR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                    {selectedArt.coloring_time_seconds > 0 && (
                      <div>
                        ⏱️ {Math.floor(selectedArt.coloring_time_seconds / 60)}min
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <ShareButton
                      title={`Arte de ${getChildName(selectedArt.profile_id)}`}
                      text={`Confira esta linda arte criada no Colour Me Brazil! 🎨`}
                      imageUrl={selectedArt.artwork_url}
                      customMessage={`${getChildName(selectedArt.profile_id)} criou esta obra de arte incrível! 🎨✨`}
                      variant="outline"
                    />
                    <Button
                      variant="outline"
                      onClick={() => setSelectedArt(null)}
                      className="flex-1"
                    >
                      Fechar
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}