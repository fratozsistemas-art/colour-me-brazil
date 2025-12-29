import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import DOMPurify from 'dompurify';

// ✅ CRITICAL FIX: XSS Protection - Input sanitization
const sanitizeInput = (input) => {
  if (!input || typeof input !== 'string') return '';
  
  // ✅ Remove HTML tags and malicious scripts
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML allowed
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  }).trim();
};

// ✅ Validate profile name (COPPA compliance)
const validateProfileName = (name) => {
  const sanitized = sanitizeInput(name);
  
  if (!sanitized || sanitized.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' };
  }
  
  if (sanitized.length > 50) {
    return { valid: false, error: 'Name too long (max 50 characters)' };
  }
  
  // ✅ Only allow letters, spaces, hyphens, apostrophes
  if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(sanitized)) {
    return { valid: false, error: 'Name contains invalid characters' };
  }
  
  return { valid: true, sanitized };
};

export default function ProfileForm({ onSubmit, onCancel }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // ✅ CRITICAL: Validate and sanitize input
    const validation = validateProfileName(name);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit({ child_name: validation.sanitized });
    } catch (err) {
      setError(err.message || 'Failed to create profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Child's Name</label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter first name"
            maxLength={50}
            required
            autoComplete="off"
          />
          {error && (
            <p className="text-red-600 text-sm mt-1">{error}</p>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Profile'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}