import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { signIn } from 'aws-amplify/auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { isCognitoConfigured } from '../lib/cognito';

interface LoginProps {
  onLoginSuccess: (email: string) => void;
  onSignUpClick: () => void;
}

export const Login = ({ onLoginSuccess, onSignUpClick }: LoginProps) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const useCognito = isCognitoConfigured();

  const handleCognitoLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields.');
      setIsLoading(false);
      return;
    }

    try {
      const user = await signIn({
        username: email,
        password: password,
      });
      console.log('Cognito login successful:', user);
      onLoginSuccess(email);
    } catch (err: any) {
      console.error('Cognito login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMockLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    onLoginSuccess(email);
  };

  const handleSubmit = useCognito ? handleCognitoLogin : handleMockLogin;

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 selection:bg-primary/20">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader className="text-center mb-6">
          <CardTitle className="text-4xl font-bold tracking-tight text-foreground mb-2">JW Service Tracker</CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Organize and track your field ministry elegantly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full py-3 h-12" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border text-center space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Don't have an account?{' '}
                <button
                  onClick={onSignUpClick}
                  className="text-primary hover:underline font-medium"
                >
                  Create one
                </button>
              </p>
            </div>

            <div className="text-xs text-muted-foreground">
              {useCognito ? (
                <p>Using AWS Cognito for authentication.</p>
              ) : (
                <p>Mock login mode is enabled. Use any email and password (min 6 characters) to login locally.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
