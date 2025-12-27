import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

/**
 * Age Gate Component - COPPA Compliance
 * Prevents children under 13 from creating accounts without parental consent
 */
export default function AgeGate({ onAgeVerified, onUnderAge }) {
  const [birthYear, setBirthYear] = useState('');
  const [error, setError] = useState('');

  const handleVerify = () => {
    if (!birthYear) {
      setError('Please select your birth year');
      return;
    }

    const year = parseInt(birthYear);
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;

    if (age < 13) {
      // User is under 13 - requires parental consent
      onUnderAge(age);
    } else if (age >= 13 && age < 18) {
      // Teen - may proceed with parental notification
      onAgeVerified({ age, requiresParentalNotice: true });
    } else if (age >= 18) {
      // Adult - can create child profiles or use themselves
      onAgeVerified({ age, requiresParentalNotice: false });
    } else {
      setError('Please enter a valid birth year');
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" 
         style={{ background: 'linear-gradient(to bottom right, #FFF8F0, #A8DADC)' }}>
      <Card className="max-w-md w-full p-8">
        <div className="text-center mb-6">
          <ShieldCheck className="w-16 h-16 mx-auto mb-4 text-blue-600" />
          <h1 className="text-3xl font-bold mb-2">Age Verification</h1>
          <p className="text-gray-600">
            To protect children's privacy, we need to verify your age before proceeding.
          </p>
        </div>

        <Alert className="mb-6">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            <strong>COPPA Compliance:</strong> If you are under 13, you'll need a parent
            or guardian to create an account for you.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <label htmlFor="birthYear" className="block text-sm font-medium mb-2">
              What year were you born? *
            </label>
            <select
              id="birthYear"
              value={birthYear}
              onChange={(e) => {
                setBirthYear(e.target.value);
                setError('');
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select your birth year...</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={handleVerify} 
            className="w-full" 
            size="lg"
            disabled={!birthYear}
          >
            Continue
          </Button>

          <p className="text-xs text-center text-gray-500">
            We use this information only to verify age requirements and protect children's privacy.
            We do not store your birthdate.
          </p>
        </div>

        <div className="mt-6 pt-6 border-t">
          <p className="text-xs text-gray-500 text-center">
            By continuing, you acknowledge that you have read our{' '}
            <a href="/PrivacyPolicy" className="text-blue-600 underline">Privacy Policy</a>
            {' '}and{' '}
            <a href="/TermsOfService" className="text-blue-600 underline">Terms of Service</a>
          </p>
        </div>
      </Card>
    </div>
  );
}
