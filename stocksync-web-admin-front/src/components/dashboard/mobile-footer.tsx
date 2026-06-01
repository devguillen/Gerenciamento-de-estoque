'use client';

import { Home, ClipboardList, Package, Library } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const FOOTER_ITEMS = [
    {
        label: 'Home',
        icon: Home,
        href: '/dashboard',
    },
    {
        label: 'Lista',
        icon: ClipboardList,
        href: '/dashboard/lista',
    },
    {
        label: 'Estoque',
        icon: Package,
        href: '/dashboard/estoque',
    },
    {
        label: 'Repositório',
        icon: Library,
        href: '/dashboard/repositorio',
    },
];

export function MobileFooter() {
    const pathname = usePathname();
    const isMobile = useIsMobile();

    if (!isMobile) return null;

    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 h-16 max-w-screen">
            <nav className="flex items-center justify-around h-full">
                {FOOTER_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 w-full h-full transition-colors",
                                isActive ? "text-[#00A3FF]" : "text-gray-500"
                            )}
                        >
                            <Icon className={cn("h-6 w-6", isActive ? "text-[#00A3FF]" : "text-gray-500")} />
                            <span className="text-[10px] font-medium leading-none">
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </footer>
    );
}
