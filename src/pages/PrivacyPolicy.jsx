import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/legal/privacy-policy.md')
      .then(res => res.text())
      .then(text => {
        setContent(text);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load privacy policy:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-6 flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-800">Privacy Policy</h1>
        </div>
      </div>

      <Card className="p-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
          </div>
        ) : (
          <ScrollArea className="h-[700px] pr-4">
            <article className="prose prose-slate max-w-none">
              <ReactMarkdown>{content}</ReactMarkdown>
            </article>
          </ScrollArea>
        )}
      </Card>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-900">
          <strong>Questions about privacy?</strong> Contact us at{' '}
          <a href="mailto:privacy@colourmebrazil.com" className="underline">
            privacy@colourmebrazil.com
          </a>
        </p>
      </div>
    </div>
  );
}
