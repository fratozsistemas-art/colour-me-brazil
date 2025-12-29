import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Download, Trash2, Eye, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function GeneratedArtCard({ artwork, onDelete }) {
  const [showPreview, setShowPreview] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this artwork?')) return;
    
    setIsDeleting(true);
    try {
      await onDelete();
    } catch (error) {
      console.error('Error deleting artwork:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(artwork.artwork_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-art-${artwork.id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Error downloading artwork:', error);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
      >
        <Card className="overflow-hidden group cursor-pointer" onClick={() => setShowPreview(true)}>
          <div className="relative aspect-square">
            <img
              src={artwork.artwork_url}
              alt={artwork.ai_prompt || 'AI Generated Art'}
              className="w-full h-full object-cover"
            />
            
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Eye className="w-8 h-8 text-white" />
            </div>

            {/* AI Badge */}
            <div className="absolute top-2 left-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI
            </div>
          </div>

          <div className="p-3">
            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
              {artwork.ai_prompt || 'AI Generated Artwork'}
            </p>
            {artwork.ai_style && (
              <p className="text-xs text-purple-600 font-medium">
                Style: {artwork.ai_style}
              </p>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              AI Generated Artwork
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <img
              src={artwork.artwork_url}
              alt={artwork.ai_prompt || 'AI Generated Art'}
              className="w-full rounded-lg"
            />

            {artwork.ai_prompt && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-1">Prompt:</p>
                <p className="text-sm text-gray-600">{artwork.ai_prompt}</p>
              </div>
            )}

            {artwork.ai_style && (
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-purple-700 mb-1">Style:</p>
                <p className="text-sm text-purple-600">{artwork.ai_style}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleDownload} variant="outline" className="flex-1 gap-2">
                <Download className="w-4 h-4" />
                Download
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                variant="destructive"
                className="flex-1 gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}