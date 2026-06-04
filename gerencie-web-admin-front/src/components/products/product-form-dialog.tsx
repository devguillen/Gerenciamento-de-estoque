"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ProductMutationRequest } from "@/types/req/ProductMutationRequest";
import { Product } from "@/types/res/ProductResponse";
import { useEffect, useState } from "react";
import { BrandSelector } from "./brand-selector";
import { CategorySelector } from "./category-selector";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSave: (data: ProductMutationRequest) => void;
  isLoading?: boolean;
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  onSave,
  isLoading
}: ProductFormDialogProps) {
    const [formData, setFormData] = useState<ProductMutationRequest>({
        name: '',
        brand_id: 0,
        unit_type: '',
        category_ids: [],
        min_limit: 0,
        max_limit: 0
    });
    const [addToStock, setAddToStock] = useState(false);
    const [initialStock, setInitialStock] = useState(1);

    useEffect(() => {
        if (open && product) {
            // Edit / Configure
            // Setup defaults from product
            setFormData({
                name: product.name,
                brand_id: product.brand_id,
                unit_type: product.unit_type || '', // Handle null
                category_ids: product.product_categories.map(pc => pc.category_id),
                min_limit: product.account_product ? product.account_product.min_limit : product.min_limit,
                max_limit: product.account_product ? product.account_product.max_limit : product.max_limit
            });
        } else if (open && !product) {
            // Create New
             setFormData({
                name: '',
                brand_id: 0,
                unit_type: 'unidade',
                category_ids: [],
                min_limit: 0,
                max_limit: 0
            });
            setAddToStock(false);
            setInitialStock(1);
        }
    }, [open, product]);

    const isSystemProduct = product ? product.owner_account_id === 0 : false;

    const handleSave = () => {
        onSave({
            ...formData,
            initial_stock: addToStock ? initialStock : undefined,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {product ? (isSystemProduct ? 'Configurar Produto' : 'Editar Produto') : 'Novo Produto'}
                    </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 pt-4">
                    {/* Identification Fields - Disabled if System Product */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Nome</label>
                        <Input 
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            disabled={isSystemProduct}
                        />
                    </div>
                     <div className="space-y-1">
                        <label className="text-sm font-medium">Marca</label>
                        <BrandSelector 
                            value={formData.brand_id} 
                            onChange={id => setFormData({...formData, brand_id: id})}
                            disabled={isSystemProduct}
                            initialBrand={product?.brand}
                        />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                             <label className="text-sm font-medium">Tipo Unidade</label>
                             <Input 
                                value={formData.unit_type}
                                onChange={e => setFormData({...formData, unit_type: e.target.value})}
                                disabled={isSystemProduct}
                                placeholder="ex: unidade, kg, l"
                             />
                        </div>
                     </div>

                    {/* Classification */}
                     <div className="space-y-1">
                        <label className="text-sm font-medium">Categorias</label>
                        <CategorySelector 
                             value={formData.category_ids}
                             onChange={ids => setFormData({...formData, category_ids: ids})}
                             disabled={isSystemProduct}
                        />
                         {isSystemProduct && <p className="text-xs text-muted-foreground">Categorias de produtos de sistema não podem ser alteradas.</p>}
                    </div>

                    <div className="border-t pt-4 mt-4">
                        <h4 className="text-sm font-medium mb-3">Meus Limites de Estoque</h4>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Mínimo</label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={formData.min_limit}
                                    onChange={e => setFormData({...formData, min_limit: Number(e.target.value)})}
                                />
                            </div>
                             <div className="space-y-1">
                                <label className="text-sm font-medium">Máximo</label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={formData.max_limit}
                                    onChange={e => setFormData({...formData, max_limit: Number(e.target.value)})}
                                />
                            </div>
                        </div>
                    </div>

                    {!product && (
                        <div className="border-t pt-4 mt-4 space-y-3">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="add-to-stock"
                                    checked={addToStock}
                                    onCheckedChange={v => setAddToStock(!!v)}
                                />
                                <label htmlFor="add-to-stock" className="text-sm font-medium cursor-pointer">
                                    Adicionar ao estoque agora
                                </label>
                            </div>
                            {addToStock && (
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Quantidade inicial</label>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={initialStock}
                                        onChange={e => setInitialStock(Math.max(1, Number(e.target.value)))}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={isLoading}>Salvar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
