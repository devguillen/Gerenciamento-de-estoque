'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/authService';
import { AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await authService.requestResetLink(email);
      setSuccess(true);
    } catch (err: any) {
      const message = err.response?.data?.message;
      if (message === 'Invalid email format.') {
        setError('Formato de e-mail inválido.');
      } else if (message === 'No user found for that email.') {
        setError('Usuário não encontrado.');
      } else {
        setError(message || 'Erro ao solicitar link de recuperação.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col space-y-4 text-center">
        <Alert className="bg-green-50 text-green-700 border-green-200">
          <AlertDescription>
            Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha em instantes.
          </AlertDescription>
        </Alert>
        <Button variant="outline" asChild className="w-full mt-4">
          <Link href="/login">Voltar para Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Seu e-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="exemplo@email.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading}>
        {loading ? <Loader2 className="animate-spin mr-2" /> : null}
        {loading ? 'ENVIAR LINK' : 'ENVIAR LINK'}
      </Button>

      <div className="mt-4 text-center text-sm">
        <Link
          href="/login"
          className="underline"
        >
          Voltar para o login
        </Link>
      </div>
    </form>
  );
}
