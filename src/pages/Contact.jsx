import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Phone, MapPin, Send, CheckCircle, Shield, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { sanitizeText } from '@/lib/sanitize';
import { logger } from '@/lib/logger';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const sanitizedData = {
        name: sanitizeText(formData.name),
        email: sanitizeText(formData.email),
        subject: sanitizeText(formData.subject),
        message: sanitizeText(formData.message),
      };

      // TODO: Implement actual email sending via cloud function
      // await base44.functions.sendContactEmail(sanitizedData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitted(true);
      toast.success('Message sent successfully!');
      
      // Reset form
      setTimeout(() => {
        setFormData({ name: '', email: '', subject: 'general', message: '' });
        setSubmitted(false);
      }, 5000);
    } catch (error) {
      logger.error('Failed to send message', error);
      toast.error('Failed to send message. Please try again or email us directly.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <CheckCircle className="w-20 h-20 mx-auto mb-6 text-green-600" />
        <h1 className="text-4xl font-bold mb-4 text-gray-800">
          Message Sent Successfully!
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Thank you for contacting us. We'll get back to you within 24-48 hours.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => setSubmitted(false)}>
            Send Another Message
          </Button>
          <Link to={createPageUrl('Home')}>
            <Button variant="outline">Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <Mail className="w-16 h-16 mx-auto mb-4 text-blue-600" />
        <h1 className="text-4xl font-bold mb-2">Contact Us</h1>
        <p className="text-gray-600 text-lg">
          We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Contact Form */}
        <div className="md:col-span-2">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <Label htmlFor="name">Your Name *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Subject */}
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="billing">Billing Question</option>
                  <option value="privacy">Privacy Concern</option>
                  <option value="coppa">COPPA Question</option>
                  <option value="content">Content Suggestion</option>
                  <option value="partnership">Partnership Opportunity</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Tell us how we can help..."
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Please provide as much detail as possible
                </p>
              </div>

              {/* Privacy Notice */}
              <Alert>
                <Shield className="w-4 h-4" />
                <AlertDescription className="text-sm">
                  Your information is protected and will only be used to respond to your inquiry. 
                  See our{' '}
                  <Link to={createPageUrl('PrivacyPolicy')} className="underline">
                    Privacy Policy
                  </Link>
                  .
                </AlertDescription>
              </Alert>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full gap-2" 
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  'Sending...'
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>

        {/* Contact Information */}
        <div className="space-y-6">
          {/* Email */}
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Email Us</h3>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">General:</p>
                  <a 
                    href="mailto:support@colourmebrazil.com"
                    className="text-blue-600 hover:underline block"
                  >
                    support@colourmebrazil.com
                  </a>
                  <p className="text-gray-600 mt-3">Privacy:</p>
                  <a 
                    href="mailto:privacy@colourmebrazil.com"
                    className="text-blue-600 hover:underline block"
                  >
                    privacy@colourmebrazil.com
                  </a>
                  <p className="text-gray-600 mt-3">COPPA:</p>
                  <a 
                    href="mailto:coppa@colourmebrazil.com"
                    className="text-blue-600 hover:underline block"
                  >
                    coppa@colourmebrazil.com
                  </a>
                </div>
              </div>
            </div>
          </Card>

          {/* Response Time */}
          <Card className="p-6 bg-green-50 border-green-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Response Time</h3>
                <p className="text-sm text-gray-700">
                  We typically respond within <strong>24-48 hours</strong> during 
                  business days. For urgent privacy concerns, we respond within 24 hours.
                </p>
              </div>
            </div>
          </Card>

          {/* FAQ Link */}
          <Card className="p-6 bg-purple-50 border-purple-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <HelpCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Quick Answers</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Looking for quick answers? Check our FAQ page first.
                </p>
                <Link to={createPageUrl('FAQ')}>
                  <Button variant="outline" size="sm" className="w-full">
                    Visit FAQ
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Office Address (if applicable) */}
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <MapPin className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Office Address</h3>
                <p className="text-sm text-gray-600">
                  Colour Me Brazil<br />
                  [Your Address Line 1]<br />
                  [City, State ZIP]<br />
                  [Country]
                </p>
              </div>
            </div>
          </Card>

          {/* Business Hours */}
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Phone className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Business Hours</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Monday - Friday: 9:00 AM - 6:00 PM EST</p>
                  <p>Saturday: 10:00 AM - 4:00 PM EST</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Additional Resources */}
      <div className="mt-12 grid md:grid-cols-3 gap-6">
        <Card className="p-6 text-center hover:shadow-lg transition-shadow">
          <Shield className="w-12 h-12 mx-auto mb-4 text-blue-600" />
          <h3 className="font-semibold mb-2">Privacy & Safety</h3>
          <p className="text-sm text-gray-600 mb-4">
            Learn about our COPPA compliance and data protection
          </p>
          <Link to={createPageUrl('PrivacyPolicy')}>
            <Button variant="outline" size="sm">Learn More</Button>
          </Link>
        </Card>

        <Card className="p-6 text-center hover:shadow-lg transition-shadow">
          <HelpCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
          <h3 className="font-semibold mb-2">Help Center</h3>
          <p className="text-sm text-gray-600 mb-4">
            Find answers to frequently asked questions
          </p>
          <Link to={createPageUrl('FAQ')}>
            <Button variant="outline" size="sm">Visit FAQ</Button>
          </Link>
        </Card>

        <Card className="p-6 text-center hover:shadow-lg transition-shadow">
          <Mail className="w-12 h-12 mx-auto mb-4 text-purple-600" />
          <h3 className="font-semibold mb-2">Report Issues</h3>
          <p className="text-sm text-gray-600 mb-4">
            Found a bug or technical issue? Let us know
          </p>
          <a href="mailto:bugs@colourmebrazil.com">
            <Button variant="outline" size="sm">Report Bug</Button>
          </a>
        </Card>
      </div>
    </div>
  );
}
