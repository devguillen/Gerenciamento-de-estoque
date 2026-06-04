'use client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { logout } from '@/lib/actions';
import type { User } from '@/lib/definitions';
import { getCadastrosForRole, getMenuForRole, type Role } from '@/lib/rbac';
import { cn } from '@/lib/utils';
import { ChevronDown, Home, LogOut, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, useContext, type ReactElement, type ReactNode } from 'react';

/* ========================================================================
   CONTEXTO DO USUÁRIO DO DASHBOARD
   ======================================================================== */

type DashboardUserContextType = {
  user: User | null;
};

const DashboardUserContext = createContext<DashboardUserContextType | undefined>(undefined);

export function useDashboardUser() {
  const ctx = useContext(DashboardUserContext);
  if (!ctx) {
    throw new Error('useDashboardUser deve ser usado dentro de DashboardClientLayout');
  }
  return ctx;
}

/* ========================================================================
   LAYOUT
   ======================================================================== */

export default function DashboardClientLayout({
  user,
  children,
}: {
  user: User | null;
  children: ReactNode;
}) {
  const pathname = usePathname();

  if (!user) return null;

  const userRole = (user.role as Role) || 'viewer';
  const navLinks = getMenuForRole(userRole);
  const cadastrosLinks = getCadastrosForRole(userRole);

  const roleLabels: Record<Role, string> = {
      'admin': 'Administrador',
      'stock_manager': 'Gerente de Estoque',
      'viewer': 'Visualizador'
  };

  const roleLabel = roleLabels[userRole] || 'Usuário';

  const isCadastrosActive = cadastrosLinks.some(link => pathname.startsWith(link.href));

  return (
    <DashboardUserContext.Provider value={{ user }}>
      <div className="min-h-screen flex flex-col bg-gray-50/50">
        <header className="bg-card border-b sticky top-0 z-30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-8">
                <Link href="/dashboard" className="flex items-center justify-center rounded-md bg-emerald-600 p-2 text-white transition hover:bg-emerald-700">
                  <Home className="h-5 w-5" />
                </Link>
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "transition-colors hover:text-primary",
                        pathname === link.href
                          ? "text-primary font-semibold"
                          : "text-muted-foreground"
                      )}
                    >
                      {link.text}
                    </Link>
                  ))}

                  {cadastrosLinks.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className={cn(
                            "flex items-center gap-1 transition-colors hover:text-primary focus:outline-none",
                            isCadastrosActive
                              ? "text-primary font-semibold"
                              : "text-muted-foreground"
                          )}
                        >
                          Cadastros
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-44">
                        {cadastrosLinks.map((link) => (
                          <DropdownMenuItem key={link.href} asChild>
                            <Link
                              href={link.href}
                              className={cn(
                                "w-full cursor-pointer",
                                pathname === link.href && "font-semibold text-primary"
                              )}
                            >
                              {link.text}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </nav>
              </div>
              <div className="flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 text-sm font-medium">
                      <UserIcon className="h-5 w-5 text-muted-foreground" />
                      Olá, {roleLabel}
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>{roleLabel}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/perfil" className="w-full cursor-pointer">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Perfil</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <form action={logout}>
                      <DropdownMenuItem asChild>
                        <button type="submit" className="w-full text-left">
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </button>
                      </DropdownMenuItem>
                    </form>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
      </div>
    </DashboardUserContext.Provider>
  );
}
