import React from 'react';
import { Card } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { HelpCircle, Shield, CreditCard, Book, Users, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function FAQ() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-12">
        <HelpCircle className="w-16 h-16 mx-auto mb-4 text-blue-600" />
        <h1 className="text-4xl font-bold mb-2">Frequently Asked Questions</h1>
        <p className="text-gray-600 text-lg">
          Find answers to common questions about Colour Me Brazil
        </p>
      </div>

      <Alert className="mb-8 bg-blue-50 border-blue-200">
        <AlertDescription className="text-blue-900">
          Can't find what you're looking for? Contact us at{' '}
          <a href="mailto:support@colourmebrazil.com" className="underline font-semibold">
            support@colourmebrazil.com
          </a>
        </AlertDescription>
      </Alert>

      {/* General Questions */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Book className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold">General Questions</h2>
        </div>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="what-is">
            <AccordionTrigger>What is Colour Me Brazil?</AccordionTrigger>
            <AccordionContent>
              Colour Me Brazil is an interactive bilingual (English/Portuguese) learning platform 
              for children aged 6-12. It combines storytelling, coloring activities, and cultural 
              education to teach children about Brazilian culture, folklore, and the Amazon rainforest.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="age-appropriate">
            <AccordionTrigger>Is it appropriate for my child?</AccordionTrigger>
            <AccordionContent>
              Yes! The platform is specifically designed for children aged 6-12 with:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Age-appropriate content</li>
                <li>Safe, moderated community features</li>
                <li>COPPA-compliant privacy protection</li>
                <li>Parental controls and monitoring</li>
                <li>Educational focus with no advertising</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="languages">
            <AccordionTrigger>What languages are supported?</AccordionTrigger>
            <AccordionContent>
              Currently, we support English and Portuguese (Brazilian). All stories and 
              educational content are available in both languages, making it perfect for 
              bilingual learning or language practice.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="devices">
            <AccordionTrigger>What devices can I use?</AccordionTrigger>
            <AccordionContent>
              Colour Me Brazil works on:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Desktop computers (Windows, Mac, Linux)</li>
                <li>Tablets (iPad, Android tablets)</li>
                <li>Smartphones (iOS, Android)</li>
                <li>Can be installed as a Progressive Web App (PWA)</li>
                <li>Works offline after initial download</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="offline">
            <AccordionTrigger>Can it be used offline?</AccordionTrigger>
            <AccordionContent>
              Yes! You can download books and content for offline reading. This is perfect for:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Long car trips</li>
                <li>Airplane flights</li>
                <li>Areas with limited internet</li>
                <li>Reducing screen time dependency on constant connection</li>
              </ul>
              Downloaded content will sync progress when you're back online.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>

      {/* Privacy & Safety */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold">Privacy & Safety</h2>
        </div>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="coppa">
            <AccordionTrigger>Is Colour Me Brazil COPPA compliant?</AccordionTrigger>
            <AccordionContent>
              Yes! We are fully compliant with COPPA (Children's Online Privacy Protection Act). 
              This means:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>We obtain verifiable parental consent before collecting any child data</li>
                <li>We collect minimal information (first name, age, reading progress)</li>
                <li>Parents have full control to review, modify, or delete their child's data</li>
                <li>We never share child information for marketing purposes</li>
                <li>No third-party advertising or tracking</li>
              </ul>
              Read our{' '}
              <Link to={createPageUrl('COPPACompliance')} className="text-blue-600 underline">
                COPPA Compliance Statement
              </Link>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="data-collected">
            <AccordionTrigger>What data do you collect?</AccordionTrigger>
            <AccordionContent>
              <strong>From children (with parental consent):</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>First name only (no last name)</li>
                <li>Age (not exact birthdate)</li>
                <li>Language preference</li>
                <li>Reading progress and achievements</li>
                <li>Colored artwork (if shared publicly)</li>
              </ul>
              <strong className="block mt-3">From parents/guardians:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Email address (for account management)</li>
                <li>Payment information (processed securely by Stripe)</li>
              </ul>
              <strong className="block mt-3">We do NOT collect:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>❌ Home addresses</li>
                <li>❌ Phone numbers</li>
                <li>❌ Photos or videos of children</li>
                <li>❌ Precise geolocation</li>
                <li>❌ Social security numbers</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="parental-controls">
            <AccordionTrigger>What parental controls are available?</AccordionTrigger>
            <AccordionContent>
              Parents have complete control through the Parent Portal:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>View all activity and progress</li>
                <li>Enable/disable social features (forum, showcase)</li>
                <li>Set content restrictions</li>
                <li>Receive daily/weekly progress reports</li>
                <li>Review and delete child's content</li>
                <li>Export all child data</li>
                <li>Delete account at any time</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="content-moderation">
            <AccordionTrigger>How is content moderated?</AccordionTrigger>
            <AccordionContent>
              Safety is our top priority:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>All user-generated content is pre-moderated before publication</li>
                <li>AI + human moderation for forum posts and comments</li>
                <li>Profanity filters and content screening</li>
                <li>Report system for inappropriate content</li>
                <li>No private messaging between children</li>
                <li>Anonymous usernames (first name + number only)</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>

      {/* Account & Billing */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="w-6 h-6 text-orange-600" />
          <h2 className="text-2xl font-bold">Account & Billing</h2>
        </div>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="free-content">
            <AccordionTrigger>Is there free content available?</AccordionTrigger>
            <AccordionContent>
              Yes! We offer:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Several free books and stories</li>
                <li>Limited coloring pages</li>
                <li>Basic gamification features</li>
                <li>Community forum access</li>
              </ul>
              Premium subscriptions unlock additional content, exclusive stories, 
              and advanced features.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="pricing">
            <AccordionTrigger>How much does a subscription cost?</AccordionTrigger>
            <AccordionContent>
              We offer flexible pricing:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Monthly subscription: $9.99/month</li>
                <li>Annual subscription: $89.99/year (save 25%)</li>
                <li>Family plan (up to 5 children): $14.99/month</li>
              </ul>
              All subscriptions include:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Access to all premium content</li>
                <li>Unlimited downloads for offline use</li>
                <li>No ads</li>
                <li>Priority support</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="cancel">
            <AccordionTrigger>Can I cancel anytime?</AccordionTrigger>
            <AccordionContent>
              Yes! You can cancel your subscription at any time with no penalties. 
              Your access will continue until the end of your current billing period. 
              No refunds for partial months, but you keep all downloaded content.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="multiple-children">
            <AccordionTrigger>Can I create profiles for multiple children?</AccordionTrigger>
            <AccordionContent>
              Absolutely! One parent account can create up to 5 child profiles. 
              Each child gets:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Individual reading progress tracking</li>
                <li>Personal achievement collection</li>
                <li>Separate colored artwork gallery</li>
                <li>Customized recommendations</li>
              </ul>
              Consider our Family Plan for the best value with multiple children.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>

      {/* Technical Support */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Technical Support</h2>
        </div>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="not-working">
            <AccordionTrigger>The app isn't working properly</AccordionTrigger>
            <AccordionContent>
              Try these troubleshooting steps:
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Clear your browser cache and cookies</li>
                <li>Update to the latest browser version</li>
                <li>Try a different browser (Chrome, Firefox, Safari, Edge)</li>
                <li>Check your internet connection</li>
                <li>Disable browser extensions temporarily</li>
                <li>Try on a different device</li>
              </ol>
              If issues persist, contact{' '}
              <a href="mailto:support@colourmebrazil.com" className="text-blue-600 underline">
                support@colourmebrazil.com
              </a>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="reset-password">
            <AccordionTrigger>How do I reset my password?</AccordionTrigger>
            <AccordionContent>
              To reset your password:
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Go to the login page</li>
                <li>Click "Forgot Password"</li>
                <li>Enter your email address</li>
                <li>Check your email for a reset link</li>
                <li>Click the link and create a new password</li>
              </ol>
              If you don't receive the email, check your spam folder or contact support.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="download-issue">
            <AccordionTrigger>Downloads aren't working</AccordionTrigger>
            <AccordionContent>
              Common download issues and solutions:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>Insufficient storage:</strong> Free up device storage space</li>
                <li><strong>Poor connection:</strong> Use a stable WiFi connection</li>
                <li><strong>Browser restrictions:</strong> Allow downloads in browser settings</li>
                <li><strong>Corrupted download:</strong> Delete and try downloading again</li>
              </ul>
              Maximum offline storage is 500MB. Manage downloads in Settings → Offline.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="contact-support">
            <AccordionTrigger>How do I contact support?</AccordionTrigger>
            <AccordionContent>
              We're here to help! Reach us at:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>General Support:</strong> support@colourmebrazil.com</li>
                <li><strong>Privacy Questions:</strong> privacy@colourmebrazil.com</li>
                <li><strong>COPPA Concerns:</strong> coppa@colourmebrazil.com</li>
                <li><strong>Bug Reports:</strong> Use the bug report button in-app</li>
              </ul>
              Response time: Usually within 24-48 hours.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>

      {/* Educational Content */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-6 h-6 text-pink-600" />
          <h2 className="text-2xl font-bold">Educational Content</h2>
        </div>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="learning-outcomes">
            <AccordionTrigger>What will my child learn?</AccordionTrigger>
            <AccordionContent>
              Our content promotes:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>Cultural Awareness:</strong> Brazilian traditions, festivals, and customs</li>
                <li><strong>Environmental Education:</strong> Amazon rainforest and biodiversity</li>
                <li><strong>Language Skills:</strong> Bilingual reading comprehension</li>
                <li><strong>Art & Creativity:</strong> Color theory, artistic expression</li>
                <li><strong>Reading Habit:</strong> Daily reading motivation through gamification</li>
                <li><strong>Global Citizenship:</strong> Appreciation for diverse cultures</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="curriculum">
            <AccordionTrigger>Does it align with school curriculum?</AccordionTrigger>
            <AccordionContent>
              While not a replacement for formal education, our content complements:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Reading comprehension standards (Common Core aligned)</li>
                <li>Geography and social studies</li>
                <li>Art education</li>
                <li>World language learning</li>
                <li>Environmental science</li>
              </ul>
              Many teachers use it as supplementary material for cultural studies units.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="new-content">
            <AccordionTrigger>How often is new content added?</AccordionTrigger>
            <AccordionContent>
              We regularly add new content:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>New books: 2-3 per month</li>
                <li>Coloring pages: Weekly additions</li>
                <li>Seasonal content: Holiday-themed stories</li>
                <li>Community events: Monthly challenges</li>
              </ul>
              Premium subscribers get early access to new releases!
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>

      {/* Still have questions? */}
      <Card className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
          <p className="text-gray-700 mb-4">
            We're happy to help! Contact our support team.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="mailto:support@colourmebrazil.com"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Email Support
            </a>
            <Link
              to={createPageUrl('PrivacyPolicy')}
              className="inline-flex items-center px-4 py-2 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
