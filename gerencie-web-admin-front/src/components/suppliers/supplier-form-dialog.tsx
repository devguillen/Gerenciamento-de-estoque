"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Supplier } from "@/types/res/SupplierResponse";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEffect, useState } from "react";

interface SupplierFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    supplier: Supplier | null;
    onSave: (data: { name: string; address: string }) => void; // Corrected to 'address'
    isLoading?: boolean;
}

export function SupplierFormDialog({
    open,
    onOpenChange,
    supplier,
    onSave,
    isLoading
}: SupplierFormDialogProps) {
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [errors, setErrors] = useState<{ name?: string }>({});

    // Unsaved changes handling
    const [showExitConfirmation, setShowExitConfirmation] = useState(false);

    // Derived state for dirtiness
    const isDirty = (() => {
        const initialName = supplier?.name || "";
        const initialAddress = supplier?.address || "";
        // Check if current values differ from initial values
        // Note: address can be null in supplier but string in state
        return name !== initialName || address !== initialAddress;
    })();

    useEffect(() => {
        if (open) {
            if (supplier) {
                setName(supplier.name || "");
                setAddress(supplier.address || "");
            } else {
                setName("");
                setAddress("");
            }
            setErrors({});
            // Don't reset dirty state manually, relies on comparison with 'supplier' prop
        }
    }, [supplier, open]);


    const handleSave = () => {
        if (!name.trim()) {
            setErrors({ name: "Nome do Fornecedor Obrigatório" });
            return;
        }

        onSave({
            name,
            address: address
        });
        // Dialog closes via parent updating 'open' prop, which resets state via effect
    };

    const handleOpenChangeWrapper = (newOpen: boolean) => {
        if (!newOpen && isDirty) {
            setShowExitConfirmation(true);
        } else {
            onOpenChange(newOpen);
        }
    };

    const handleCancelClick = () => {
        if (isDirty) {
            setShowExitConfirmation(true);
        } else {
            onOpenChange(false);
        }
    };

    const confirmExit = () => {
        setShowExitConfirmation(false);
        onOpenChange(false);
    };

    const isNew = !supplier || supplier.id === 0;
    const isSystemSupplier = supplier?.owner_account_id === 0;

    return (
        <>
            <Dialog open={open} onOpenChange={handleOpenChangeWrapper}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {isNew ? "Novo Fornecedor" : "Editar Fornecedor"} {isDirty && <span className="text-red-500 text-sm">(Alterado)</span>}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Nome</label>
                            <Input
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    if (errors.name) setErrors({ ...errors, name: undefined });
                                }}
                                disabled={isSystemSupplier && !isNew}
                                placeholder="Ex: Mercadinho do Zé"
                                className={errors.name ? "border-red-500" : ""}
                            />
                            {errors.name && (
                                <p className="text-xs text-red-500">{errors.name}</p>
                            )}
                            {isSystemSupplier && !isNew && (
                                <p className="text-xs text-muted-foreground">
                                    Fornecedores do sistema não podem ser renomeados.
                                </p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Endereço</label>
                            <Input
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Ex: Rua Faria Lima, 529"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={handleCancelClick}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} disabled={isLoading}>
                            {isNew ? "Criar" : "Salvar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={showExitConfirmation} onOpenChange={setShowExitConfirmation}>
                <AlertDialogContent className="z-[100]">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Descartar alterações?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Você tem alterações não salvas. Se sair agora, elas serão perdidas.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setShowExitConfirmation(false)}>Continuar editando</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmExit}>Descartar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
