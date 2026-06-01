import { ChevronRight, Home, LucideIcon } from "lucide-react";
import { Card, CardContent } from "../ui/card";

interface ComingSoonProps {
    title: string;
    description: string;
    icon: LucideIcon;
    pageTitle: string;
}

export function ComingSoon({ title, description, icon: Icon, pageTitle }: ComingSoonProps) {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col mb-6">
                 <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Home className="h-4 w-4" />
                    <ChevronRight className="h-4 w-4" />
                    <span>{pageTitle}</span>
                </div>
                <h1 className="text-3xl font-bold">{pageTitle}</h1>
            </div>

            <Card className="border-2 border-dashed border-gray-200">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="p-4 bg-emerald-50 rounded-full mb-6 relative">
                         <Icon className="h-12 w-12 text-emerald-600" />
                         <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                        </span>
                    </div>
                
                    <h2 className="text-2xl font-semibold mb-2">{title}</h2>
                    <p className="text-muted-foreground max-w-md mx-auto mb-6">
                        {description}
                    </p>
                    <div className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
                        Em breve na v2.0
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
