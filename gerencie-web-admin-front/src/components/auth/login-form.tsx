'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export function LoginForm() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('login') as string;
    const password = formData.get('password') as string;

    try {
      await login({ email, password });
      // Redirect is handled in AuthContext or here if preferred, but Context has it.
    } catch (err: any) {
      let errorMessage = 'Falha ao realizar login.';

      // Axios error handling
      if (err.response?.data) {
        const { message, code } = err.response.data;

        if (code === 'ERROR_CODE_ACCESS_DENIED' || message === 'Invalid Credentials.') {
          errorMessage = 'Usuário ou senha incorretos.';
        } else if (message === 'Invalid email format.') {
          errorMessage = 'Formato de e-mail inválido.';
        } else if (message) {
          errorMessage = message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="login">Login</Label>
        <Input
          id="login"
          name="login"
          type="text"
          placeholder=""
          required
        />
      </div>
      <div className="grid gap-2">
        <div className="flex items-center">
          <Label htmlFor="password">Senha</Label>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder=""
          required
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
        {loading ? 'ENTRANDO...' : 'ENTRAR'}
      </Button>

      <div className="mt-4 text-center text-sm">
        <Link
          href="/forgot-password"
          className="underline"
        >
          Esqueci minha senha
        </Link>
      </div>
    </form>
  );
}
