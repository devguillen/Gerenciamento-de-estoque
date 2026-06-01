"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { InventoryItem, InventoryStatus } from "@/types/res/InventoryResponse";
import { Badge } from "@/components/ui/badge";
import { formatQuantity } from "@/lib/utils";

const MAX_QUANTITY = 999999.999;

import { ProductSearchSelector } from "@/components/purchases/product-search-selector";
import { inventoryService } from "@/services/inventoryService";
import { Loader2 } from "lucide-react";

interface StockConsumptionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item: InventoryItem | null;
    onConfirm: (finalQuantity: number) => Promise<void>;
}

export function StockConsumptionDialog({
    open,
    onOpenChange,
    item: initialItem,
    onConfirm
}: StockConsumptionDialogProps) {
    const [item, setItem] = useState<InventoryItem | null>(initialItem);
    const [consumedQuantity, setConsumedQuantity] = useState<string>("1");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingItem, setIsLoadingItem] = useState(false);

    useEffect(() => {
        if (open) {
            setItem(initialItem);
            setConsumedQuantity("1");
        }
    }, [open, initialItem]);

    const handleProductSelect = async (product: any) => {
        setIsLoadingItem(true);
        try {
            // Find inventory item for this product to get current quantity
            // We search by name and then filter by product_id to be sure
            const response = await inventoryService.getInventory({
                search: product.name,
                per_page: 50,
                page: 1
            });

            const found = response.items.find((i: InventoryItem) => i.product_id === product.id);

            if (found) {
                setItem(found);
            } else {
                // Convert Product to InventoryItem if logical, OR show error.
                // If not found in inventory, implies quantity 0 or not linked.
                // Check if linked
                if (product.account_product) {
                    // Linked but maybe not returned in search? Or just 0 qty.
                    // Construct a temporary item with 0 stock
                    const tempItem: InventoryItem = {
                        id: 0, // placeholder
                        account_product_id: product.account_product.id,
                        product_id: product.id,
                        quantity: 0,
                        product_name: product.name,
                        display_name: product.name,
                        brand_name: product.brand?.name || '',
                        unit_type: product.unit_type || 'un',
                        status: 'em_falta',
                        categories: product.product_categories?.map((pc: any) => pc.category) || [],
                        account_id: 0,
                        updated_at: new Date().toISOString(),
                        last_movement_type: null,
                        last_movement_occurred_at: null,
                        last_movement_source: null,
                        last_movement_id: null,
                        last_movement_delta: null,
                        custom_name: null,
                        min_limit: null,
                        max_limit: null,
                        urgency_rank: 0
                    };
                    setItem(tempItem);
                } else {
                    // Not linked. Cannot consume.
                    // Ideally we should alert.
                    alert("Este produto ainda não está vinculado ao seu estoque. Registre uma compra primeiro.");
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingItem(false);
        }
    };

    if (!open) return null;

    // Phase 1: Product Selection (if no item)
    if (!item) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Registrar consumo</DialogTitle>
                        <div className="text-sm text-muted-foreground mt-0.5">
                            Selecione o produto que foi consumido
                        </div>
                    </DialogHeader>
                    {isLoadingItem ? (
                        <div className="py-8 flex flex-col items-center justify-center text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin mb-2" />
                            <p>Buscando informações do estoque...</p>
                        </div>
                    ) : (
                        <div className="py-4">
                            <ProductSearchSelector
                                onSelect={handleProductSelect}
                                onCreateNew={() => { }} // No creation in consumption
                                allowCreate={false}
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        );
    }



    const currentQty = Number(item.quantity || 0);
    const parsedConsumedQty = Number(consumedQuantity);

    // Validation
    const isIntegerUnit = item.unit_type.toLowerCase() === 'un' || item.unit_type.toLowerCase() === 'caixa' || item.unit_type.toLowerCase() === 'pacote';
    const isValidNumber = !isNaN(parsedConsumedQty) && parsedConsumedQty > 0;
    const isOverLimit = parsedConsumedQty > MAX_QUANTITY;
    const isIntegerValid = isIntegerUnit ? Number.isInteger(parsedConsumedQty) : true;
    const hasEnoughStock = isValidNumber && parsedConsumedQty <= currentQty && !isOverLimit;

    const finalQuantity = currentQty - parsedConsumedQty;
    const handleSubmit = async () => {
        if (!isValidNumber || !isIntegerValid || !hasEnoughStock) return;

        setIsSubmitting(true);
        try {
            await onConfirm(parsedConsumedQty);
            onOpenChange(false);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleIncrement = (delta: number) => {
        const newVal = (Number(consumedQuantity) || 0) + delta;
        if (newVal >= 0) setConsumedQuantity(String(newVal));
    };

    // Determine status preview
    const getStatusPreview = (qty: number): InventoryStatus => {
        if (qty <= 0) return 'em_falta';
        if (item.min_limit && qty <= item.min_limit) return 'baixo';
        if (item.max_limit && qty > item.max_limit) return 'acima';
        if (item.min_limit) return 'ok';
        return 'sem_meta';
    };

    const afterStatus = getStatusPreview(finalQuantity);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md rounded-3xl">
                <DialogHeader className="text-center sm:text-left">
                    <div className="flex flex-col items-center gap-3 mb-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                            <Minus className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div className="text-center">
                            <DialogTitle className="text-center">Registrar consumo</DialogTitle>
                            <div className="text-sm text-muted-foreground mt-1 font-medium">
                                {item.display_name}
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6 py-2">

                    {/* Informational Cards */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Atual</div>
                            <div className="text-xl font-bold text-slate-900">
                                {formatQuantity(currentQty)} <span className="text-sm font-normal text-slate-500">{item.unit_type}</span>
                            </div>
                        </div>
                        <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                            <div className="text-xs text-emerald-600/80 font-medium uppercase tracking-wider mb-1">Após Consumo</div>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-bold text-slate-900">
                                    {hasEnoughStock ? formatQuantity(finalQuantity) : '-'}
                                </span>
                                {hasEnoughStock && (
                                    <Badge variant="outline" className={`text-[10px] h-5 ${afterStatus === 'em_falta' ? 'text-red-600 bg-red-50 border-red-200' :
                                        afterStatus === 'baixo' ? 'text-amber-600 bg-amber-50 border-amber-200' :
                                            'text-green-600 bg-green-50 border-green-200'
                                        }`}>
                                        {afterStatus.replace('_', ' ')}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label>Quantidade consumida ({item.unit_type})</Label>

                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-12 w-12 shrink-0 border-slate-200"
                                onClick={() => handleIncrement(-1)}
                                disabled={Number(consumedQuantity) <= 0}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>

                            <Input
                                type="number"
                                step="1"
                                value={consumedQuantity}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val.length <= 15) {
                                        setConsumedQuantity(val);
                                    }
                                }}
                                className="h-12 text-center text-lg shadow-sm"
                                placeholder="0"
                            />

                            <Button
                                variant="outline"
                                size="icon"
                                className="h-12 w-12 shrink-0 border-slate-200"
                                onClick={() => handleIncrement(1)}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Error Message */}
                        {!hasEnoughStock && isValidNumber && (
                            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded animate-in fade-in slide-in-from-top-1">
                                <AlertCircle className="h-4 w-4" />
                                Quantidade maior que o estoque disponível.
                            </div>
                        )}

                        {isIntegerUnit && !isIntegerValid && (
                            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
                                <AlertCircle className="h-4 w-4" />
                                Apenas números inteiros permitidos para {item.unit_type}.
                            </div>
                        )}

                        {isOverLimit && (
                            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded animate-in fade-in slide-in-from-top-1">
                                <AlertCircle className="h-4 w-4" />
                                Quantidade excede o limite máximo permitido ({formatQuantity(MAX_QUANTITY)}).
                            </div>
                        )}
                    </div>

                    {hasEnoughStock && isValidNumber && (
                        <div className="flex items-start gap-3 p-4 bg-emerald-50/50 border border-emerald-100 rounded-lg text-sm text-emerald-900">
                            <div className="bg-emerald-100 p-1.5 rounded-full shrink-0">
                                <Minus className="h-3.5 w-3.5 text-emerald-700" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-medium text-emerald-900">Confirmação de saída</p>
                                <p className="text-emerald-700/80 leading-relaxed">
                                    Será registrado o consumo de <span className="font-semibold text-emerald-900">{formatQuantity(parsedConsumedQty)} {item.unit_type}</span>.
                                    <br />
                                    O estoque passará de {formatQuantity(currentQty)} para <span className="font-semibold text-emerald-900">{formatQuantity(finalQuantity)} {item.unit_type}</span>.
                                </p>
                            </div>
                        </div>
                    )}

                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!isValidNumber || !hasEnoughStock || !isIntegerValid || isSubmitting}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium min-w-[140px]"
                    >
                        {isSubmitting ? "Confirmando..." : "Confirmar consumo"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
