import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, Heart, Share2, Download, X, Clock, Palette, 
  Filter, Grid3x3, LayoutGrid, ChevronLeft, ChevronRight,
  Trash2, Edit2
} from 'lucide-react';
import ShareButton from '../components/social/ShareButton';
import { createPageUrl } from '../utils';
import ColoringCanvas from '../components/coloring/ColoringCanvas';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function ArtGallery() {
  const [currentProfile, setCurrentProfile] = useState(null);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [filterShowcased, setFilterShowcased] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editingArtwork, setEditingArtwork] = useState(null);
  const [deletingArtwork, setDeletingArtwork] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check authentication and load profile
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          base44.auth.redirectToLogin(createPageUrl('ArtGallery'));
          return;
        }
        
        // Load current profile
        const savedProfileId = localStorage.getItem('currentProfileId');
        if (savedProfileId) {
          const profiles = await base44.entities.UserProfile.filter({ id: savedProfileId });
          if (profiles.length > 0) {
            setCurrentProfile(profiles[0]);
          }
        }
      } catch (error) {
        base44.auth.redirectToLogin(createPageUrl('ArtGallery'));
      }
    };
    checkAuth();
  }, []);

  // Fetch artwork
  const { data: allArtwork = [], isLoading, refetch } = useQuery({
    queryKey: ['artwork', currentProfile?.id],
    queryFn: () => currentProfile 
      ? base44.entities.ColoredArtwork.filter({ profile_id: currentProfile.id })
      : Promise.resolve([]),
    enabled: !!currentProfile
  });

  // Fetch books for titles
  const { data: books = [] } = useQuery({
    queryKey: ['books'],
    queryFn: () => base44.entities.Book.list(),
  });

  // Filter artwork
  const filteredArtwork = allArtwork.filter(art => {
    if (filterShowcased === 'showcased') return art.is_showcased;
    if (filterShowcased === 'private') return !art.is_showcased;
    return true;
  }).sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  const handleToggleShowcase = async (artwork) => {
    await base44.entities.ColoredArtwork.update(artwork.id, {
      is_showcased: !artwork.is_showcased
    });
  };

  const handleDownload = (artwork) => {
    const link = document.createElement('a');
    link.href = artwork.artwork_url;
    link.download = `artwork-${artwork.id}.png`;
    link.click();
  };

  const handleDelete = async () => {
    if (!deletingArtwork) return;
    
    setIsDeleting(true);
    try {
      await base44.entities.ColoredArtwork.delete(deletingArtwork.id);
      toast.success('Artwork deleted successfully');
      setDeletingArtwork(null);
      refetch();
      if (selectedArtwork?.id === deletingArtwork.id) {
        setSelectedArtwork(null);
      }
    } catch (error) {
      console.error('Error deleting artwork:', error);
      toast.error('Failed to delete artwork');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (artwork) => {
    setEditingArtwork(artwork);
  };

  const handleSaveEdit = async (data) => {
    if (!editingArtwork) return;

    try {
      // Convert canvas to blob and upload
      const blob = await new Promise(resolve => 
        data.canvas.toBlob(resolve, 'image/png', 1.0)
      );
      
      const uploadResult = await base44.integrations.Core.UploadFile({
        file: blob
      });

      // Update the artwork
      await base44.entities.ColoredArtwork.update(editingArtwork.id, {
        artwork_url: uploadResult.file_url,
        coloring_time_seconds: (editingArtwork.coloring_time_seconds || 0) + data.coloring_time
      });

      toast.success('Artwork updated successfully!');
      setEditingArtwork(null);
      refetch();
    } catch (error) {
      console.error('Error updating artwork:', error);
      toast.error('Failed to update artwork');
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : filteredArtwork.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < filteredArtwork.length - 1 ? prev + 1 : 0));
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  if (!currentProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please select a profile first</p>
          <Button onClick={() => window.location.href = createPageUrl('Library')}>Go to Library</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              🎨 {currentProfile.child_name}'s Art Gallery
            </h1>
            <p className="text-gray-600">
              Your collection of beautiful colored artwork
            </p>
          </div>
          <Button variant="outline" onClick={() => window.location.href = createPageUrl('Library')}>
            Back to Library
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="text-3xl font-bold text-purple-600">{allArtwork.length}</div>
            <div className="text-sm text-gray-600">Total Artwork</div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="text-3xl font-bold text-blue-600">
              {allArtwork.filter(a => a.is_showcased).length}
            </div>
            <div className="text-sm text-gray-600">Showcased</div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100">
            <div className="text-3xl font-bold text-green-600">
              {Math.floor(allArtwork.reduce((sum, a) => sum + (a.coloring_time_seconds || 0), 0) / 60)}
            </div>
            <div className="text-sm text-gray-600">Minutes Coloring</div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100">
            <div className="text-3xl font-bold text-orange-600">
              {new Set(allArtwork.map(a => a.book_id)).size}
            </div>
            <div className="text-sm text-gray-600">Books Colored</div>
          </Card>
        </div>

        {/* Filters and View Mode */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white p-4 rounded-xl shadow-md">
          <div className="flex gap-2">
            <Button
              variant={filterShowcased === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterShowcased('all')}
              size="sm"
            >
              All ({allArtwork.length})
            </Button>
            <Button
              variant={filterShowcased === 'showcased' ? 'default' : 'outline'}
              onClick={() => setFilterShowcased('showcased')}
              size="sm"
            >
              <Eye className="w-4 h-4 mr-1" />
              Showcased ({allArtwork.filter(a => a.is_showcased).length})
            </Button>
            <Button
              variant={filterShowcased === 'private' ? 'default' : 'outline'}
              onClick={() => setFilterShowcased('private')}
              size="sm"
            >
              Private ({allArtwork.filter(a => !a.is_showcased).length})
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              onClick={() => setViewMode('grid')}
              size="sm"
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'masonry' ? 'default' : 'outline'}
              onClick={() => setViewMode('masonry')}
              size="sm"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Gallery */}
      {filteredArtwork.length === 0 ? (
        <Card className="p-12 text-center">
          <Palette className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No artwork yet</h3>
          <p className="text-gray-500 mb-6">
            Start coloring some pages to build your gallery!
          </p>
          <Button 
            className="bg-gradient-to-r from-orange-500 to-pink-500"
            onClick={() => window.location.href = createPageUrl('Library')}
          >
            Start Coloring
          </Button>
        </Card>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6'
        }>
          {filteredArtwork.map((artwork, index) => {
            const book = books.find(b => b.id === artwork.book_id);
            return (
              <motion.div
                key={artwork.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={viewMode === 'masonry' ? 'break-inside-avoid' : ''}
              >
                <Card className="overflow-hidden hover:shadow-xl transition-shadow group cursor-pointer">
                  <div 
                    className="relative aspect-square bg-gray-100"
                    onClick={() => {
                      setSelectedArtwork(artwork);
                      setCurrentIndex(index);
                    }}
                  >
                    <img
                      src={artwork.artwork_url}
                      alt="Artwork"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <Eye className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 line-clamp-1">
                          {book ? book.title_en : 'Untitled'}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {new Date(artwork.created_date).toLocaleDateString()}
                        </p>
                      </div>
                      {artwork.is_showcased && (
                        <Eye className="w-5 h-5 text-blue-500" />
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(artwork.coloring_time_seconds || 0)}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleShowcase(artwork)}
                        className="flex-1"
                      >
                        {artwork.is_showcased ? 'Hide' : 'Showcase'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(artwork)}
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(artwork)}
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeletingArtwork(artwork)}
                        className="text-red-500 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedArtwork && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedArtwork(null)}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              onClick={() => setSelectedArtwork(null)}
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Navigation */}
            {filteredArtwork.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevious();
                    setSelectedArtwork(filteredArtwork[currentIndex > 0 ? currentIndex - 1 : filteredArtwork.length - 1]);
                  }}
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                    setSelectedArtwork(filteredArtwork[currentIndex < filteredArtwork.length - 1 ? currentIndex + 1 : 0]);
                  }}
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
              </>
            )}

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
                  src={selectedArtwork.artwork_url}
                  alt="Artwork"
                  className="w-full"
                />
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-1">
                        {books.find(b => b.id === selectedArtwork.book_id)?.title_en || 'Untitled'}
                      </h3>
                      <p className="text-gray-600">
                        Colored on {new Date(selectedArtwork.created_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(selectedArtwork.coloring_time_seconds || 0)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => handleToggleShowcase(selectedArtwork)}
                      className="flex-1"
                      variant={selectedArtwork.is_showcased ? 'outline' : 'default'}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {selectedArtwork.is_showcased ? 'Hide from Showcase' : 'Add to Showcase'}
                    </Button>
                    <Button
                      onClick={() => {
                        handleEdit(selectedArtwork);
                        setSelectedArtwork(null);
                      }}
                      variant="outline"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDownload(selectedArtwork)}
                      variant="outline"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <ShareButton
                      title="Minha Arte"
                      text={`Confira minha arte do ${books.find(b => b.id === selectedArtwork.book_id)?.title_pt || 'livro'}! 🎨`}
                      imageUrl={selectedArtwork.artwork_url}
                      customMessage={`Criei esta linda arte no Colour Me Brazil! Tempo gasto: ${formatTime(selectedArtwork.coloring_time_seconds || 0)} ⏱️🎨`}
                      variant="outline"
                    />
                    <Button
                      onClick={() => {
                        setDeletingArtwork(selectedArtwork);
                        setSelectedArtwork(null);
                      }}
                      variant="outline"
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </motion.div>

              {filteredArtwork.length > 1 && (
                <div className="text-center text-white mt-4">
                  {currentIndex + 1} / {filteredArtwork.length}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingArtwork} onOpenChange={(open) => !open && setDeletingArtwork(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Artwork?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this artwork? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Artwork Modal */}
      {editingArtwork && (
        <ColoringCanvas
          pageId={editingArtwork.page_id}
          bookId={editingArtwork.book_id}
          profileId={currentProfile.id}
          illustrationUrl={editingArtwork.artwork_url}
          onSave={handleSaveEdit}
          onClose={() => setEditingArtwork(null)}
          initialStrokes={[]}
        />
      )}
      </div>
      );
      }