import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Flag } from 'lucide-react';
import ReportContentModal from './ReportContentModal';

export default function ReportButton({ contentType, contentId, contentPreview, variant = 'ghost', size = 'sm' }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button 
        variant={variant} 
        size={size}
        onClick={() => setShowModal(true)}
        className="text-gray-500 hover:text-red-600"
      >
        <Flag className="w-4 h-4" />
      </Button>
      
      <ReportContentModal
        open={showModal}
        onClose={() => setShowModal(false)}
        contentType={contentType}
        contentId={contentId}
        contentPreview={contentPreview}
      />
    </>
  );
}