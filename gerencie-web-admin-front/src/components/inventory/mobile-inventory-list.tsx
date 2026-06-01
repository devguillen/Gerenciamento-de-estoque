
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { getStockMovementLabel } from "@/constants/stock-movement";
import { InventoryItem, InventoryStatus } from "@/types/res/InventoryResponse";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, MoreHorizontal, Package } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

interface MobileInventoryListProps {
    items: InventoryItem[];
    isLoading: boolean;
    hasMore?: boolean;
    onLoadMore?: () => void;
    onEdit?: (item: InventoryItem) => void;
    onManualAdjustment?: (item: InventoryItem) => void;
    onConsumption?: (item: InventoryItem) => void;
}

export function MobileInventoryList({
    items,
    isLoading,
    hasMore = false,
    onLoadMore,
    onEdit,
    onManualAdjustment,
    onConsumption
}: MobileInventoryListProps) {

    const resolveStatusBadge = (status: InventoryStatus) => {
        switch (status) {
            case 'em_falta': return <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200">Em falta</Badge>;
            case 'baixo': return <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-200">Baixo</Badge>;
            case 'ok': return <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-200">Ok</Badge>;
            case 'acima': return <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200">Acima</Badge>;
            case 'sem_meta': return <Badge variant="outline" className="text-gray-500">Sem meta</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const formatMovementTime = (date: string | null) => {
        if (!date) return "-";
        try {
            return `há ${formatDistanceToNow(new Date(date), { locale: ptBR })}`;
        } catch {
            return "-";
        }
    };

    const observerTarget = useRef(null);

    useEffect(() => {
        if (!onLoadMore) return;

        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !isLoading) {
                    onLoadMore();
                }
            },
            {
                threshold: 0.1,
                rootMargin: '200px'
            }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [hasMore, isLoading, onLoadMore]);

    if (isLoading && items.length === 0) {
        return (
            <div className="space-y-4 px-4 pb-20">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse h-32" />
                ))}
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-in fade-in zoom-in duration-300">
                <div className="bg-white p-6 rounded-full shadow-sm mb-4">
                    <Package className="h-10 w-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Nada por aqui</h3>
                <p className="text-sm text-gray-500 max-w-[250px]">
                    Não encontramos itens para sua busca ou filtros.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4 px-4 pb-20">
            {items.map((item) => (
                <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-col">
                            <span className="font-semibold text-gray-900 text-lg">{item.display_name}</span>
                            <span className="text-sm text-gray-500">{item.brand_name}</span>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 -mr-2">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-5 w-5 text-gray-400" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onEdit?.(item)}>
                                    Ver detalhes / Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onConsumption?.(item)}>
                                    Registrar consumo
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onManualAdjustment?.(item)}>
                                    Ajustar estoque
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/estoque/historico?product_id=${item.product_id}`} className="w-full cursor-pointer">
                                        Ver histórico
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Categories */}
                    <div className="flex flex-wrap gap-1 mb-4">
                        {item.categories.slice(0, 3).map(cat => (
                            <Badge key={cat.id} variant="secondary" className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
                                {cat.name}
                            </Badge>
                        ))}
                    </div>

                    <div className="w-full h-px bg-gray-100 my-3" />

                    <div className="grid grid-cols-2 gap-y-4 gap-x-2">

                        <div className="flex flex-col">
                            <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Disponível</span>
                            <div className="flex items-baseline gap-1 mt-0.5">
                                <span className="text-xl font-bold text-gray-900">{Number(item.quantity)}</span>
                                <span className="text-sm text-gray-500">{item.unit_type}(s)</span>
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Meta</span>
                            <span className="text-sm text-gray-700 font-medium mt-1">
                                {item.min_limit !== null || item.max_limit !== null ? (
                                    `${item.min_limit ?? "?"} – ${item.max_limit ?? "?"}`
                                ) : (
                                    "-"
                                )}
                            </span>
                        </div>

                        <div className="flex flex-col">
                            <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Última mov.</span>
                            <div className="flex flex-col mt-0.5">
                                {item.last_movement_type && (
                                    <span className="text-sm font-medium text-gray-900">{getStockMovementLabel(item.last_movement_type)}</span>
                                )}
                                <span className="text-xs text-gray-400">
                                    {formatMovementTime(item.last_movement_occurred_at)}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col items-start justify-center">
                            {resolveStatusBadge(item.status)}
                        </div>

                    </div>
                </div>
            ))}

            <div ref={observerTarget} className="h-4 flex justify-center py-4">
                {isLoading && <Loader2 className="h-6 w-6 animate-spin text-gray-400" />}
            </div>

            {!isLoading && !hasMore && (
                <div className="flex items-center justify-center p-4">
                    <span className="text-xs text-gray-400 uppercase font-bold tracking-widest">Fim do estoque</span>
                </div>
            )}
        </div>
    );
}
