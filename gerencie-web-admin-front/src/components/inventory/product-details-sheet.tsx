"use client";

import { Badge } from "@/components/ui/badge";
import { formatQuantity } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { getStockMovementLabel, StockMovementType } from "@/constants/stock-movement";
import { inventoryService } from "@/services/inventoryService";
import { InventoryItem } from "@/types/res/InventoryResponse";
import { StockMovementItem } from "@/types/res/StockMovementResponse";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Box,
    ExternalLink,
    Loader2,
    Minus,
    Plus,
    RefreshCw,
    Settings,
    ShoppingCart
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface ProductDetailsSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item: InventoryItem | null;
    onRegisterPurchase: (item: InventoryItem) => void;
    onConfigure: (item: InventoryItem) => Promise<void> | void;
    onConsumption: (item: InventoryItem) => void;
    onManualAdjustment: (item: InventoryItem) => void;
}

export function ProductDetailsSheet({
    open,
    onOpenChange,
    item,
    onRegisterPurchase,
    onConfigure,
    onConsumption,
    onManualAdjustment
}: ProductDetailsSheetProps) {
    const [recentMovements, setRecentMovements] = useState<StockMovementItem[]>([]);
    const [isLoadingMovements, setIsLoadingMovements] = useState(false);
    const [isConfiguring, setIsConfiguring] = useState(false);

    useEffect(() => {
        if (open && item) {
            loadRecentMovements(item.product_id);
        } else {
            setRecentMovements([]);
        }
    }, [open, item]);

    const loadRecentMovements = async (productId: number) => {
        setIsLoadingMovements(true);
        try {
            const data = await inventoryService.getStockMovements({
                page: 1,
                per_page: 5,
                product_id: productId,
                sort_by: 'date',
                sort_dir: 'desc',
                date_filter_type: 'custom', // Use custom with no dates to get all history sorted by date
                start_date: null,
                end_date: null
            });
            setRecentMovements(data.items);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingMovements(false);
        }
    };

    if (!item) return null;

    const resolveStatusBadge = (status: string) => {
        switch (status) {
            case 'em_falta': return <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200 border-0">Em falta</Badge>;
            case 'baixo': return <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-0">Baixo</Badge>;
            case 'ok': return <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-200 border-0">Ok</Badge>;
            case 'acima': return <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200 border-0">Acima</Badge>;
            case 'sem_meta': return <Badge variant="outline" className="text-gray-500 border-0 bg-gray-100">Sem meta</Badge>;
            default: return <Badge variant="outline" className="border-0 bg-gray-100">{status}</Badge>;
        }
    };

    const resolveMovementIcon = (type: StockMovementType) => {
        switch (type) {
            case StockMovementType.PURCHASE: return <ShoppingCart className="h-4 w-4 text-green-600" />;
            case StockMovementType.CONSUMPTION: return <Minus className="h-4 w-4 text-orange-600" />; // Or specific Check icon
            default: return <Box className="h-4 w-4 text-gray-500" />;
        }
    };

    const formatTimeAgo = (date: number) => {
        return `há ${formatDistanceToNow(new Date(date), { locale: ptBR, addSuffix: false })}`;
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader className="pb-6 border-b">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <SheetTitle className="text-2xl font-bold text-gray-900">{item.product_name}</SheetTitle>
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                                <span>{item.brand_name}</span>
                                <span>•</span>
                                <span>{item.categories.map(c => c.name).join(", ")}</span>
                            </div>
                        </div>
                        {resolveStatusBadge(item.status)}
                    </div>
                </SheetHeader>

                <div className="py-6 space-y-6">
                    {/* Big Quantity */}
                    <div className="bg-gray-50 rounded-xl p-6 text-center border shadow-sm">
                        <p className="text-sm text-gray-500 font-medium mb-1">Quantidade atual</p>
                        <div className="flex items-baseline justify-center gap-2">
                            <span className="text-5xl font-bold text-gray-900">{formatQuantity(Number(item.quantity))}</span>
                            <span className="text-xl text-gray-500 font-medium">{item.unit_type}(s)</span>
                        </div>
                        <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-white border text-sm text-gray-600 shadow-sm">
                            <span className="text-gray-400 mr-2 uppercase text-[10px] font-bold tracking-wider">Meta</span>
                            <span className="font-semibold">
                                {
                                    (item.min_limit && item.min_limit > 0) || (item.max_limit && item.max_limit > 0) ? (
                                        <>
                                            {item.min_limit && item.min_limit > 0 ? item.min_limit : "não configurado"} – {item.max_limit && item.max_limit > 0 ? item.max_limit : "não configurado"}
                                        </>
                                    ) : (
                                        "Não configurado"
                                    )
                                }
                            </span>
                        </div>
                    </div>

                    {/* Actions Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            className="bg-green-500 hover:bg-green-600 text-white h-auto py-4 flex flex-col gap-1 items-center justify-center shadow-sm shadow-green-500/20"
                            onClick={() => onRegisterPurchase(item)}
                        >
                            <Plus className="h-6 w-6 mb-1" />
                            Registrar Compra
                        </Button>

                        <Button
                            className="bg-orange-300 hover:bg-orange-400 text-white h-auto py-4 flex flex-col gap-1 items-center justify-center shadow-sm shadow-orange-300/20 border-0"
                            onClick={() => onConsumption(item)}
                        >
                            <Minus className="h-6 w-6 mb-1" />
                            Registrar Consumo
                        </Button>

                        <Button
                            variant="outline"
                            className="h-auto py-3 gap-2 bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
                            onClick={() => onManualAdjustment(item)}
                        >
                            <RefreshCw className="h-4 w-4" />
                            Ajustar
                        </Button>

                        <Button
                            variant="outline"
                            className="h-auto py-3 gap-2 bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
                            onClick={async () => {
                                setIsConfiguring(true);
                                await onConfigure(item);
                                setIsConfiguring(false);
                            }}
                            disabled={isConfiguring}
                        >
                            {isConfiguring ? <Loader2 className="h-4 w-4 animate-spin" /> : <Settings className="h-4 w-4" />}
                            Configurar
                        </Button>
                    </div>

                    {/* Recent Movements */}
                    <div className="pt-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                Últimas movimentações
                                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{recentMovements.length}</span>
                            </h3>
                            <Link
                                href={`/dashboard/estoque/historico?product_id=${item.product_id}`}
                                className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-medium"
                            >
                                Ver todas <ExternalLink className="h-3 w-3" />
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {isLoadingMovements ? (
                                <div className="text-center py-8 text-gray-400">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                    Carregando...
                                </div>
                            ) : recentMovements.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg border border-dashed">
                                    Nenhuma movimentação recente
                                </p>
                            ) : (
                                recentMovements.map(move => (
                                    <div key={move.id} className="flex items-center justify-between p-3 bg-gray-50/50 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${move.delta > 0 ? 'bg-green-100' : 'bg-orange-100'}`}>
                                                {resolveMovementIcon(move.movement_type)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {getStockMovementLabel(move.movement_type)}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {formatTimeAgo(move.occurred_at)}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`text-sm font-bold ${move.delta > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                                            {move.delta > 0 ? '+' : ''}{formatQuantity(Number(move.delta))}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </SheetContent>
        </Sheet>
    );
}
