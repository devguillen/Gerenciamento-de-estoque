import { Button } from "@/components/ui/button";
import { History, Plus, ShoppingCart } from "lucide-react";
import Link from "next/link";

interface MobileInventoryActionsProps {
    onRegisterConsumption: () => void;
    onRegisterPurchase: () => void;
}

export function MobileInventoryActions({ onRegisterConsumption, onRegisterPurchase }: MobileInventoryActionsProps) {
    return (
        <div className="flex gap-4 justify-between mb-8 mt-12 px-4">
            <div className="flex flex-col items-center gap-2 flex-1">
                <Button
                    onClick={onRegisterConsumption}
                    className="h-20 w-20 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center p-0 shadow-lg shadow-emerald-600/20"
                >
                    <Plus className="h-8 w-8" />
                </Button>
                <span className="text-sm font-medium text-gray-700 text-center leading-tight">
                    Registrar<br />consumo
                </span>
            </div>

            <div className="flex flex-col items-center gap-2 flex-1">
                <Button
                    onClick={onRegisterPurchase}
                    className="h-20 w-20 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center p-0 shadow-lg shadow-emerald-600/20"
                >
                    <ShoppingCart className="h-8 w-8" />
                </Button>
                <span className="text-sm font-medium text-gray-700 text-center leading-tight">
                    Registrar<br />compra
                </span>
            </div>

            <div className="flex flex-col items-center gap-2 flex-1">
                <Link href="/dashboard/estoque/historico">
                    <Button
                        className="h-20 w-20 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center p-0 shadow-lg shadow-emerald-600/20"
                    >
                        <History className="h-8 w-8" />
                    </Button>
                </Link>
                <span className="text-sm font-medium text-gray-700 text-center leading-tight">
                    Ver histórico<br />de compras
                </span>
            </div>
        </div>
    );
}
