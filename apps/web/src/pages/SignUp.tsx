import React, { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { signUp, confirmSignUp } from '@aws-amplify/auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { isCognitoConfigured } from '../lib/cognito';

interface SignUpProps {
  onSignUpSuccess: (email: string) => void;
  onBackToLogin: () => void;
}

export const SignUp = ({ onSignUpSuccess, onBackToLogin }: SignUpProps) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [signUpSuccess, setSignUpSuccess] = useState<boolean>(false);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const useCognito = isCognitoConfigured();

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return 'Password must be at least 8 characters.';
    if (!/[a-z]/.test(pwd)) return 'Password must contain lowercase letters.';
    if (!/[A-Z]/.test(pwd)) return 'Password must contain uppercase letters.';
    if (!/[0-9]/.test(pwd)) return 'Password must contain numbers.';
    return null;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validations
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      setIsLoading(false);
      return;
    }

    const pwdError = validatePassword(password);
    if (pwdError) {
      setError(pwdError);
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    if (!useCognito) {
      // Mock mode - skip verification
      onSignUpSuccess(email);
      return;
    }

    try {
      const { userId } = await signUp({
        username: email,
        password: password,
        options: {
          userAttributes: {
            email: email,
          },
        },
      });

      console.log('Sign up successful, user ID:', userId);
      setSignUpSuccess(true);
    } catch (err: any) {
      console.error('Sign up error:', err);
      setError(err.message || 'Sign up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);

    if (!verificationCode) {
      setError('Please enter the verification code.');
      setIsVerifying(false);
      return;
    }

    try {
      await confirmSignUp({
        username: email,
        confirmationCode: verificationCode,
      });

      console.log('Email verified successfully');
      onSignUpSuccess(email);
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (signUpSuccess && useCognito) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 selection:bg-primary/20">
        <Card className="w-full max-w-md shadow-sm">
          <CardHeader className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground mb-2">Verify Your Email</CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              We sent a verification code to {email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerifyEmail} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Verification Code</label>
                <Input
                  type="text"
                  placeholder="123456"
                  value={verificationCode}
                  onChange={e => setVerificationCode(e.target.value)}
                  maxLength={6}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Check your email for the 6-digit code
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" className="w-full py-3 h-12" disabled={isVerifying}>
                {isVerifying ? 'Verifying...' : 'Verify Email'}
              </Button>
            </form>

            <button
              onClick={() => setSignUpSuccess(false)}
              className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground underline"
            >
              Back to sign up
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 selection:bg-primary/20">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader className="text-center mb-6">
          <CardTitle className="text-4xl font-bold tracking-tight text-foreground mb-2">Create Account</CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Join JW Service Tracker and start tracking your ministry.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email address</label>
              <Input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <Input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Min. 8 chars, uppercase, lowercase, numbers
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Confirm Password</label>
              <Input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full py-3 h-12" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <button
                onClick={onBackToLogin}
                className="text-primary hover:underline font-medium"
              >
                Sign In
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
