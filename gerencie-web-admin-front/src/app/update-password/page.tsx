'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/authService';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function UpdatePasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [initializing, setInitializing] = useState(true);
    const [initError, setInitError] = useState<string | null>(null);
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    // Form states
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [updateError, setUpdateError] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            const magicToken = searchParams.get('magic_token');
            const email = searchParams.get('email');

            if (!magicToken || !email) {
                setInitError('Link inválido ou expirado.');
                setInitializing(false);
                return;
            }

            try {
                // Exchange magic token for session
                const res = await authService.magicLinkLogin({ magic_token: magicToken, email });

                setAuthToken(res.authToken);

                // We need to set the session cookie here!
                const { createSession } = await import('@/lib/session');

                const userToStore = {
                    id: res.user_id,
                    name: res.name || 'Usuário',
                    email: res.email || email,
                    role: res.role || 'admin',
                    token: res.authToken
                };
                await createSession(userToStore as any);

                // Clean URL
                router.replace('/update-password');

            } catch (error) {
                console.error('Magic link failed', error);
                setInitError('Link inválido ou expirado.');
            } finally {
                setInitializing(false);
            }
        };

        // Only run if we haven't verified yet and params exist
        if (initializing && !authToken) {
            init();
        }
    }, [searchParams, initializing, router, authToken]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setUpdateError('As senhas não coincidem.');
            return;
        }

        if (!authToken) {
            setUpdateError('Sessão inválida. Tente reiniciar o processo.');
            return;
        }

        setLoading(true);
        setUpdateError(null);

        try {
            await authService.updatePassword({ password, confirm_password: confirmPassword }, authToken);

            setIsSuccess(true);

            toast({
                title: "Senha Alterada!",
                description: "Sua senha foi atualizada com sucesso. Redirecionando...",
                variant: "success",
            });

            setTimeout(() => {
                router.push('/dashboard');
            }, 3000);
        } catch (error: any) {
            const message = error.response?.data?.message;
            if (message === 'Input does not meet minimum length requirement of 8 characters.') {
                setUpdateError('A senha deve ter pelo menos 8 caracteres, incluindo letra maiúscula, minúscula, número e caractere especial');
            } else {
                setUpdateError(message || 'Erro ao atualizar senha.');
            }
            setLoading(false);
        }
    };

    if (initializing) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Validando link de segurança...</p>
            </div>
        );
    }

    if (initError) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{initError}</AlertDescription>
                </Alert>
                <Button variant="link" onClick={() => router.push('/login')}>Voltar para Login</Button>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-6 text-center animate-in fade-in zoom-in duration-500">
                <div className="rounded-full bg-green-100 p-3">
                    <CheckCircle2 className="h-16 w-16 text-green-600" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-green-700">Senha Atualizada!</h2>
                    <p className="text-muted-foreground">Você será redirecionado para o dashboard em instantes.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto w-[350px] space-y-6 py-12">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold">Nova Senha</h1>
                <p className="text-muted-foreground">Defina sua nova senha para continuar.</p>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="password">Nova Senha</Label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>

                {updateError && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{updateError}</AlertDescription>
                    </Alert>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? 'Atualizando...' : 'Atualizar Senha'}
                </Button>
            </form>
        </div>
    );
}

export default function UpdatePasswordPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <div className="min-h-screen flex items-center justify-center bg-background">
                <UpdatePasswordForm />
            </div>
        </Suspense>
    );
}
