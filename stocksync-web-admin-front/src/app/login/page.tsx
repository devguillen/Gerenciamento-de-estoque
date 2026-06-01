import { LoginForm } from '@/components/auth/login-form';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-left">
            <h1 className="text-3xl font-bold">Bem-vindo!</h1>
            <p className="text-balance text-muted-foreground">
              Faça login com sua conta para acessar o painel de estoque.
            </p>
          </div>
          <LoginForm />
        </div>
      </div>

      <div className="hidden bg-muted lg:block relative">
        <Image
          src="/fundo_login.jpg"
          alt="Prateleiras de um supermercado."
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-emerald-900/80 flex flex-col items-start justify-end p-20 text-white">
          <div className="max-w-md">
            <h2 className="text-4xl font-bold leading-tight">
              Seu estoque,
              <br />
              no controle das suas mãos.
            </h2>
            <p className="mt-4 text-lg text-emerald-200">
              Acompanhe o que entra e sai, planeje suas compras e aproveite ofertas — tudo em um só lugar, em tempo real.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
