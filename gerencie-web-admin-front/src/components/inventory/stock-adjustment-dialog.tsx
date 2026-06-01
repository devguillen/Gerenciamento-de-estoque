"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { InventoryItem } from "@/types/res/InventoryResponse";
import { formatQuantity } from "@/lib/utils";

const MAX_QUANTITY = 999999.999;

interface StockAdjustmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item: InventoryItem | null;
    onConfirm: (newQuantity: number, reason: string) => Promise<void>;
}

const ADJUSTMENT_REASONS = [
    { label: "Consumo interno", value: "INTERNAL_USE" },
    { label: "Perda", value: "LOSS" },
    { label: "Vencimento", value: "EXPIRED" },
    { label: "Recontagem", value: "RECOUNT" },
    { label: "Erro de registro", value: "ERROR" },
    { label: "Falha de sistema", value: "SYSTEM_FAILURE" },
    { label: "Uso para teste", value: "TEST_SAMPLE" }
];

export function StockAdjustmentDialog({
    open,
    onOpenChange,
    item,
    onConfirm
}: StockAdjustmentDialogProps) {
    const [newQuantity, setNewQuantity] = useState<string>("");
    const [reason, setReason] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open && item) {
            setNewQuantity("");
            setReason("");
        }
    }, [open, item]);

    const currentQty = Number(item?.quantity || 0);
    const unitLabel = item?.unit_type === 'unidade' ? 'unidade(s)' : item?.unit_type;
    const parsedNewQty = Number(newQuantity);
    const difference = parsedNewQty - currentQty;

    const isValidNumber = !isNaN(parsedNewQty) && newQuantity !== "";
    const isOverLimit = parsedNewQty > MAX_QUANTITY;

    const handleSubmit = async () => {
        if (!isValidNumber || !reason) return;

        setIsSubmitting(true);
        try {
            await onConfirm(parsedNewQty, reason);
            onOpenChange(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!item) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="p-2 bg-emerald-100 rounded-full">
                            <RefreshCw className="h-5 w-5 text-emerald-600" />
                        </div>
                        Ajustar estoque
                    </DialogTitle>
                    <p className="text-sm text-gray-500 mt-1">
                        {item.product_name} ({item.brand_name})
                    </p>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">Quantidade atual</span>
                        <span className="text-lg font-bold text-gray-900">
                            {formatQuantity(currentQty)} {unitLabel}
                        </span>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="new-quantity">Nova quantidade ({unitLabel})</Label>
                        <Input
                            id="new-quantity"
                            type="number"
                            step="1"
                            value={newQuantity}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val.length <= 15) {
                                    setNewQuantity(val);
                                }
                            }}
                            placeholder="0"
                            className={`text-center text-lg font-medium ${(parsedNewQty < 0 || isOverLimit) ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                        />
                        {parsedNewQty < 0 && (
                            <p className="text-xs text-red-500 font-medium flex items-center gap-1 mt-1">
                                <AlertCircle className="h-3 w-3" />
                                A quantidade não pode ser negativa
                            </p>
                        )}
                        {isOverLimit && (
                            <p className="text-xs text-red-500 font-medium flex items-center gap-1 mt-1">
                                <AlertCircle className="h-3 w-3" />
                                Quantidade excede o limite máximo permitido ({formatQuantity(MAX_QUANTITY)})
                            </p>
                        )}
                    </div>

                    {isValidNumber && parsedNewQty >= 0 && difference !== 0 && (
                        <div className={`p-4 rounded-lg flex items-start gap-3 ${difference > 0 ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800'}`}>
                            {difference < 0 && <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />}
                            <div>
                                <div className="font-bold text-lg">
                                    {difference > 0 ? '+' : ''}{formatQuantity(difference)} {unitLabel}
                                </div>
                                <div className="text-sm opacity-90">
                                    {difference > 0
                                        ? 'Será registrado como entrada por ajuste'
                                        : 'Será registrado como ajuste de inventário'
                                    }
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label>Motivo do ajuste</Label>
                        <Select value={reason} onValueChange={setReason}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um motivo..." />
                            </SelectTrigger>
                            <SelectContent>
                                {ADJUSTMENT_REASONS.map(r => (
                                    <SelectItem key={r.label} value={r.value}>{r.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!isValidNumber || parsedNewQty < 0 || isOverLimit || !reason || isSubmitting || difference === 0}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        {isSubmitting ? "Salvando..." : "Confirmar ajuste"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
