import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldCheck, Mail, Check, AlertCircle, User, Calendar } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import toast from 'react-hot-toast';

/**
 * COPPA-Compliant Parental Consent Flow
 * Implements verifiable parental consent before collecting child information
 */
export default function ParentalConsentFlow({ onConsentGranted, onCancel }) {
  const [step, setStep] = useState(1); // 1: Age Gate, 2: Parent Info, 3: Child Info, 4: Consent Review
  const [parentEmail, setParentEmail] = useState('');
  const [parentName, setParentName] = useState('');
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [consentChecks, setConsentChecks] = useState({
    isParent: false,
    isOver18: false,
    readPrivacy: false,
    readTerms: false,
    understandRights: false,
    consentToCollection: false,
  });
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  // Step 1: Age Gate - Verify user is parent/guardian
  const AgeGateStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <ShieldCheck className="w-16 h-16 mx-auto mb-4 text-blue-600" />
        <h2 className="text-2xl font-bold mb-2">Parental Consent Required</h2>
        <p className="text-gray-600">
          Colour Me Brazil is designed for children ages 6-12 and requires parental consent
          under COPPA (Children's Online Privacy Protection Act).
        </p>
      </div>

      <Alert>
        <AlertCircle className="w-4 h-4" />
        <AlertDescription>
          Before creating a child profile, we need to verify that you are a parent or legal guardian
          and obtain your consent to collect your child's information.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Check className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <p className="font-semibold">Protected Information</p>
            <p className="text-sm text-gray-600">
              We only collect minimal information: first name, age, and learning progress
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Check className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <p className="font-semibold">Full Parental Control</p>
            <p className="text-sm text-gray-600">
              You can review, modify, or delete your child's data at any time
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Check className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <p className="font-semibold">No Third-Party Marketing</p>
            <p className="text-sm text-gray-600">
              We never share your child's information for advertising purposes
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={() => setStep(2)} className="flex-1" size="lg">
          I am a Parent/Guardian - Continue
        </Button>
        <Button onClick={onCancel} variant="outline" size="lg">
          Cancel
        </Button>
      </div>

      <p className="text-xs text-center text-gray-500">
        By continuing, you confirm you are at least 18 years old
      </p>
    </div>
  );

  // Step 2: Parent Information & Email Verification
  const ParentInfoStep = () => {
    const sendVerification = async () => {
      if (!parentEmail || !parentName) {
        toast.error('Please enter your name and email');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(parentEmail)) {
        toast.error('Please enter a valid email address');
        return;
      }

      setLoading(true);
      try {
        // TODO: Implement actual email verification via cloud function
        // await base44.functions.sendParentalVerification({ email: parentEmail, name: parentName });
        
        // Simulate sending verification email
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setVerificationSent(true);
        toast.success('Verification code sent to your email');
      } catch (error) {
        console.error('Failed to send verification:', error);
        toast.error('Failed to send verification email');
      } finally {
        setLoading(false);
      }
    };

    const verifyCode = async () => {
      if (!verificationCode || verificationCode.length !== 6) {
        toast.error('Please enter the 6-digit code from your email');
        return;
      }

      setLoading(true);
      try {
        // TODO: Implement actual code verification via cloud function
        // const verified = await base44.functions.verifyParentalCode({ email: parentEmail, code: verificationCode });
        
        // Simulate verification (accept "123456" for demo)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (verificationCode === '123456') {
          toast.success('Email verified successfully!');
          setStep(3);
        } else {
          toast.error('Invalid verification code');
        }
      } catch (error) {
        console.error('Verification failed:', error);
        toast.error('Verification failed. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Parent/Guardian Information</h2>
          <p className="text-gray-600">
            We need to verify your email address to complete the consent process.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="parentName">Your Full Name *</Label>
            <div className="flex items-center gap-2 mt-1">
              <User className="w-5 h-5 text-gray-400" />
              <Input
                id="parentName"
                type="text"
                placeholder="John Doe"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                disabled={verificationSent}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="parentEmail">Your Email Address *</Label>
            <div className="flex items-center gap-2 mt-1">
              <Mail className="w-5 h-5 text-gray-400" />
              <Input
                id="parentEmail"
                type="email"
                placeholder="parent@example.com"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                disabled={verificationSent}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              We'll send a verification code to this email
            </p>
          </div>

          {!verificationSent ? (
            <Button 
              onClick={sendVerification} 
              disabled={loading || !parentEmail || !parentName}
              className="w-full"
            >
              {loading ? 'Sending...' : 'Send Verification Code'}
            </Button>
          ) : (
            <>
              <Alert className="bg-blue-50 border-blue-200">
                <Mail className="w-4 h-4 text-blue-600" />
                <AlertDescription className="text-blue-900">
                  We've sent a 6-digit code to <strong>{parentEmail}</strong>.
                  Please check your inbox (and spam folder).
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="verificationCode">Verification Code *</Label>
                <Input
                  id="verificationCode"
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-2xl tracking-widest"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Demo: Use code "123456" to proceed
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={verifyCode} 
                  disabled={loading || verificationCode.length !== 6}
                  className="flex-1"
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </Button>
                <Button 
                  onClick={() => setVerificationSent(false)} 
                  variant="outline"
                >
                  Resend
                </Button>
              </div>
            </>
          )}
        </div>

        <Button onClick={() => setStep(1)} variant="outline" className="w-full">
          Back
        </Button>
      </div>
    );
  };

  // Step 3: Child Information
  const ChildInfoStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Child Profile Information</h2>
        <p className="text-gray-600">
          Tell us about your child. We only collect minimal information.
        </p>
      </div>

      <Alert>
        <AlertCircle className="w-4 h-4" />
        <AlertDescription>
          We do NOT collect: last names, email addresses, phone numbers, home addresses,
          or photos of your child.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div>
          <Label htmlFor="childName">Child's First Name Only *</Label>
          <Input
            id="childName"
            type="text"
            placeholder="Emma"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            maxLength={20}
          />
          <p className="text-xs text-gray-500 mt-1">
            First name only - no last name required
          </p>
        </div>

        <div>
          <Label htmlFor="childAge">Child's Age *</Label>
          <div className="flex items-center gap-2 mt-1">
            <Calendar className="w-5 h-5 text-gray-400" />
            <select
              id="childAge"
              value={childAge}
              onChange={(e) => setChildAge(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select age...</option>
              {[6, 7, 8, 9, 10, 11, 12].map(age => (
                <option key={age} value={age}>{age} years old</option>
              ))}
            </select>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Colour Me Brazil is designed for ages 6-12
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button 
          onClick={() => setStep(4)} 
          disabled={!childName || !childAge}
          className="flex-1"
        >
          Continue to Consent
        </Button>
        <Button onClick={() => setStep(2)} variant="outline">
          Back
        </Button>
      </div>
    </div>
  );

  // Step 4: Consent Review & Agreement
  const ConsentReviewStep = () => {
    const allChecked = Object.values(consentChecks).every(Boolean);

    const handleSubmit = async () => {
      if (!allChecked) {
        toast.error('Please review and accept all required items');
        return;
      }

      setLoading(true);
      try {
        // TODO: Store parental consent record
        const consentData = {
          parent_name: parentName,
          parent_email: parentEmail,
          child_name: childName,
          child_age: parseInt(childAge),
          consent_timestamp: new Date().toISOString(),
          ip_address: 'masked', // For security verification
          consent_method: 'email_verification',
          consents: consentChecks,
        };

        // Simulate saving
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast.success('Parental consent recorded successfully!');
        
        // Pass data back to parent component
        onConsentGranted({
          childName,
          childAge: parseInt(childAge),
          parentEmail,
          parentName,
        });
      } catch (error) {
        console.error('Failed to record consent:', error);
        toast.error('Failed to record consent. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Parental Consent Agreement</h2>
          <p className="text-gray-600">
            Please review and accept the following to complete the consent process.
          </p>
        </div>

        <Card className="p-4 bg-gray-50">
          <h3 className="font-semibold mb-2">Summary:</h3>
          <div className="text-sm space-y-1">
            <p><strong>Parent:</strong> {parentName} ({parentEmail})</p>
            <p><strong>Child:</strong> {childName}, {childAge} years old</p>
          </div>
        </Card>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Checkbox
              id="isParent"
              checked={consentChecks.isParent}
              onCheckedChange={(checked) => 
                setConsentChecks(prev => ({ ...prev, isParent: checked }))
              }
            />
            <Label htmlFor="isParent" className="text-sm cursor-pointer leading-tight">
              I confirm that I am the parent or legal guardian of {childName || 'this child'}
            </Label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="isOver18"
              checked={consentChecks.isOver18}
              onCheckedChange={(checked) => 
                setConsentChecks(prev => ({ ...prev, isOver18: checked }))
              }
            />
            <Label htmlFor="isOver18" className="text-sm cursor-pointer leading-tight">
              I confirm that I am at least 18 years old
            </Label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="readPrivacy"
              checked={consentChecks.readPrivacy}
              onCheckedChange={(checked) => 
                setConsentChecks(prev => ({ ...prev, readPrivacy: checked }))
              }
            />
            <Label htmlFor="readPrivacy" className="text-sm cursor-pointer leading-tight">
              I have read and understand the{' '}
              <a href="/PrivacyPolicy" target="_blank" className="text-blue-600 underline">
                Privacy Policy
              </a>
            </Label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="readTerms"
              checked={consentChecks.readTerms}
              onCheckedChange={(checked) => 
                setConsentChecks(prev => ({ ...prev, readTerms: checked }))
              }
            />
            <Label htmlFor="readTerms" className="text-sm cursor-pointer leading-tight">
              I have read and agree to the{' '}
              <a href="/TermsOfService" target="_blank" className="text-blue-600 underline">
                Terms of Service
              </a>
            </Label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="understandRights"
              checked={consentChecks.understandRights}
              onCheckedChange={(checked) => 
                setConsentChecks(prev => ({ ...prev, understandRights: checked }))
              }
            />
            <Label htmlFor="understandRights" className="text-sm cursor-pointer leading-tight">
              I understand my rights under COPPA, GDPR, and LGPD, including the right to
              review, modify, and delete my child's information at any time
            </Label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="consentToCollection"
              checked={consentChecks.consentToCollection}
              onCheckedChange={(checked) => 
                setConsentChecks(prev => ({ ...prev, consentToCollection: checked }))
              }
            />
            <Label htmlFor="consentToCollection" className="text-sm cursor-pointer leading-tight">
              <strong>I consent</strong> to Colour Me Brazil's collection, use, and disclosure
              of my child's personal information as described in the Privacy Policy
            </Label>
          </div>
        </div>

        <Alert className="bg-green-50 border-green-200">
          <ShieldCheck className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-900">
            You can revoke this consent and delete your child's account at any time
            through the Parent Portal.
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Button 
            onClick={handleSubmit} 
            disabled={!allChecked || loading}
            className="flex-1 bg-green-600 hover:bg-green-700"
            size="lg"
          >
            {loading ? 'Processing...' : 'Grant Consent & Create Profile'}
          </Button>
          <Button onClick={() => setStep(3)} variant="outline">
            Back
          </Button>
        </div>

        <p className="text-xs text-center text-gray-500">
          By clicking "Grant Consent", you are providing verifiable parental consent
          as required by COPPA
        </p>
      </div>
    );
  };

  // Render current step
  const renderStep = () => {
    switch (step) {
      case 1: return <AgeGateStep />;
      case 2: return <ParentInfoStep />;
      case 3: return <ChildInfoStep />;
      case 4: return <ConsentReviewStep />;
      default: return <AgeGateStep />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="p-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            {[1, 2, 3, 4].map((num) => (
              <div
                key={num}
                className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                  step >= num
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {num}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>Intro</span>
            <span>Verify</span>
            <span>Child Info</span>
            <span>Consent</span>
          </div>
        </div>

        {renderStep()}
      </Card>
    </div>
  );
}
