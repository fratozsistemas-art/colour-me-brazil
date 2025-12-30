import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Copy, CheckCircle2, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';

export default function ShareButton({ 
  title, 
  text, 
  url, 
  imageUrl,
  customMessage,
  variant = "outline",
  size = "default",
  showText = true
}) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (platform) => {
    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    const shareText = customMessage || text || 'Check out my progress on Colour Me Brazil!';
    const shareTitle = title || 'Colour Me Brazil';
    
    const shareData = {
      title: shareTitle,
      text: shareText,
      url: shareUrl
    };

    if (platform === 'native' && navigator.share) {
      try {
        // Try to add image if supported
        if (imageUrl && navigator.canShare) {
          try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const file = new File([blob], 'share.png', { type: blob.type });
            if (navigator.canShare({ files: [file] })) {
              shareData.files = [file];
            }
          } catch (error) {
            console.log('Could not add image to share:', error);
          }
        }
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success('Link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Error copying:', err);
        toast.error('Failed to copy link');
      }
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank', 'width=600,height=400');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400');
    } else if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400');
    } else if (platform === 'instagram') {
      // Instagram doesn't support direct sharing via URL
      handleShare('copy');
      toast.info('Link copied! Open Instagram and paste it in your post or story');
    } else if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size}>
          {copied ? (
            <CheckCircle2 className="w-4 h-4 mr-2" />
          ) : (
            <Share2 className="w-4 h-4 mr-2" />
          )}
          {showText && (copied ? 'Copied!' : 'Share')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {navigator.share && (
          <DropdownMenuItem onClick={() => handleShare('native')}>
            <Share2 className="w-4 h-4 mr-2" />
            Share...
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => handleShare('copy')}>
          <Copy className="w-4 h-4 mr-2" />
          Copy Link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('facebook')}>
          <Facebook className="w-4 h-4 mr-2" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('twitter')}>
          <Twitter className="w-4 h-4 mr-2" />
          Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('linkedin')}>
          <Linkedin className="w-4 h-4 mr-2" />
          LinkedIn
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('instagram')}>
          <Instagram className="w-4 h-4 mr-2" />
          Instagram
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('whatsapp')}>
          💬 WhatsApp
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}