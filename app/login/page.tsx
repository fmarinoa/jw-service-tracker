'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!identifier || !password) {
      setError('Ingresa tus credenciales');
      setIsLoading(false);
      return;
    }

    try {
      const res = await signIn('credentials', {
        identifier,
        password,
        callbackUrl: '/',
        redirect: false,
      });
      
      if (res?.error) {
        setError('Credenciales incorrectas o usuario no encontrado.');
      } else {
        window.location.href = '/';
      }
    } catch (err) {
      setError('Ocurrió un error inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-black text-primary mb-2">JW Tracker</CardTitle>
          <CardDescription>Tu informe de servicio, simple y elegante.</CardDescription>
        </CardHeader>
        <CardContent>
          {registered && (
            <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 p-3 rounded-lg mb-6">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Registro exitoso. ¡Inicia sesión ahora!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">Celular</label>
              <Input
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="ej: 999888777"
                maxLength={9}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">Contraseña</label>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full h-12" disabled={isLoading}>
              {isLoading ? 'Iniciando...' : 'Entrar'}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-primary font-bold hover:underline">
              Regístrate aquí
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
