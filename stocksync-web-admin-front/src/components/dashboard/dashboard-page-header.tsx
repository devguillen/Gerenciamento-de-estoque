'use client';

import { ChevronRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface BreadcrumbItem {
    label: string;
    href?: string;
    icon?: LucideIcon;
}

interface DashboardPageHeaderProps {
    title: string;
    description?: string;
    icon: LucideIcon;
    breadcrumbs: BreadcrumbItem[];
    actions?: ReactNode;
    mobileActions?: ReactNode;
    className?: string;
}

export function DashboardPageHeader({
    title,
    description,
    icon: Icon,
    breadcrumbs,
    actions,
    mobileActions,
    className,
}: DashboardPageHeaderProps) {
    return (
        <div className={cn("flex flex-col gap-4 mb-8", className)}>
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground mb-1">
                {breadcrumbs.map((item, index) => (
                    <div key={item.label} className="flex items-center gap-2">
                        {index === 0 && item.icon && <item.icon className="h-4 w-4" />}
                        <span>{item.label}</span>
                        {index < breadcrumbs.length - 1 && <ChevronRight className="h-4 w-4" />}
                    </div>
                ))}
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border shadow-sm flex-shrink-0">
                        <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
                            {title}
                        </h1>
                        {description && (
                            <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                <div className="hidden md:flex gap-3">
                    {actions}
                </div>

                {mobileActions && (
                    <div className="md:hidden w-full">
                        {mobileActions}
                    </div>
                )}
            </div>
        </div>
    );
}
