
"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { PurchaseForm } from "./purchase-form";
import { Product } from "@/types/res/ProductResponse";
import { ShoppingCart } from "lucide-react";

interface PurchaseFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    initialProduct?: Product | null;
}

export function PurchaseFormDialog({
    open,
    onOpenChange,
    onSuccess,
    initialProduct
}: PurchaseFormDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-100 rounded-full text-green-600">
                            <ShoppingCart size={20} />
                        </div>
                        <DialogTitle>Registrar Compra</DialogTitle>
                    </div>
                </DialogHeader>

                <PurchaseForm
                    onSuccess={() => {
                        onSuccess();
                        onOpenChange(false);
                    }}
                    onCancel={() => onOpenChange(false)}
                    initialProduct={initialProduct}
                />
            </DialogContent>
        </Dialog>
    );
}
