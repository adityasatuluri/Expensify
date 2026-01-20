'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { generateToken, TokenStorage, UserStorage } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { hashPin } from '@/lib/pinHash';
import PinInput from '@/components/pin-input';

type SetupStep = 'initial' | 'pin' | 'confirm-pin' | 'balance' | 'account';

export default function SetupPage() {
  const [step, setStep] = useState<SetupStep>('initial');
  const [initialBalance, setInitialBalance] = useState('');
  const [accountName, setAccountName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleContinueBalance = () => {
    if (!initialBalance) {
      setError('Please enter initial balance.');
      return;
    }

    const balance = parseFloat(initialBalance);
    if (isNaN(balance) || balance < 0) {
      setError('Please enter a valid balance.');
      return;
    }

    setStep('account');
    setError('');
  };

  const handleCompleteSetup = async () => {
    if (!accountName) {
      setError('Please enter account name.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const userId = 'single-user';
      const balance = parseFloat(initialBalance);

      // For single-user mode, we just set up the token
      const { token, expiresAt } = generateToken(userId);
      TokenStorage.set(token, expiresAt);
      UserStorage.setUserId(userId);

      console.log('[v0] Setup complete, redirecting to dashboard');
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('[v0] Setup error:', errorMessage);
      setError(`Failed to complete setup: ${errorMessage}`);
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'initial') {
      router.push('/auth/login');
    } else if (step === 'balance') {
      setStep('initial');
    } else if (step === 'account') {
      setStep('balance');
    }
  };

  const handlePinComplete = (newPin: string) => {
    if (step === 'pin') {
      setPin(newPin);
      setStep('confirm-pin');
    } else if (step === 'confirm-pin') {
      if (newPin === pin) {
        setStep('balance');
      } else {
        setError('PINs do not match. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex flex-col items-center justify-center p-4 sm:p-6">
      <Card className="w-full max-w-md p-6 sm:p-8 shadow-lg">
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Header */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-4xl sm:text-5xl font-bold text-primary">₹</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-center">Expensify</h1>
            <p className="text-xs sm:text-sm text-muted-foreground text-center">
              Set up your account
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex gap-2 justify-center">
            <div
              className={`h-2 w-8 rounded-full ${
                ['balance', 'account'].includes(step) ? 'bg-primary' : 'bg-muted'
              }`}
            />
            <div
              className={`h-2 w-8 rounded-full ${
                step === 'account' ? 'bg-primary' : 'bg-muted'
              }`}
            />
          </div>

          {/* Content */}
          <div className="space-y-4 sm:space-y-6">
            {step === 'initial' && (
              <div className="flex flex-col gap-3 sm:gap-4">
                <p className="text-center text-xs sm:text-sm text-foreground">
                  Let's get your expense tracker ready. Just enter your initial
                  balance and account name to get started.
                </p>
                <Button
                  className="w-full text-sm"
                  onClick={() => setStep('balance')}
                >
                  Get Started
                </Button>
              </div>
            )}

            {step === 'balance' && (
              <div className="flex flex-col gap-3 sm:gap-4">
                <div>
                  <label className="text-xs sm:text-sm font-medium text-foreground mb-2 block">
                    Initial Balance (₹)
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(e.target.value)}
                    step="0.01"
                    min="0"
                    className="text-sm"
                  />
                </div>
                <Button
                  className="w-full text-sm"
                  onClick={handleContinueBalance}
                  disabled={isLoading}
                >
                  Continue
                </Button>
              </div>
            )}

            {step === 'account' && (
              <div className="flex flex-col gap-3 sm:gap-4">
                <div>
                  <label className="text-xs sm:text-sm font-medium text-foreground mb-2 block">
                    Account Name
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Main Bank Account"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <Button
                  className="w-full text-sm"
                  onClick={handleCompleteSetup}
                  disabled={isLoading}
                >
                  {isLoading ? 'Setting up...' : 'Complete Setup'}
                </Button>
              </div>
            )}

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                <p className="text-xs sm:text-sm text-destructive">{error}</p>
              </div>
            )}
          </div>

          {/* Back Button */}
          <Button variant="outline" onClick={handleBack} className="text-sm bg-transparent">
            Back
          </Button>
        </div>
      </Card>
    </div>
  );
}
