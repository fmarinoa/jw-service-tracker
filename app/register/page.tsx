'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/app/actions/auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const [identifier, setIdentifier] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await registerUser({ identifier, name, password });
      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-black text-primary mb-2">Crear Cuenta</CardTitle>
          <CardDescription>Regístrate para empezar a trackear tu servicio.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-foreground mb-1">Nombre</label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Tu nombre completo"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-foreground mb-1">Celular</label>
              <Input
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="ej: 999888777"
                maxLength={9}
                required
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Ingresa tus 9 dígitos (se guardará con +51).
              </p>
            </div>
            <div>
              <label className="block text-sm font-bold text-foreground mb-1">Contraseña</label>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full h-12 mt-2" disabled={isLoading}>
              {isLoading ? 'Registrando...' : 'Registrarse'}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-primary font-bold hover:underline">
              Inicia Sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
