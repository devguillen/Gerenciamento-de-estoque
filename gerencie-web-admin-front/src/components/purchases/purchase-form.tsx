"use client";

import { ProductFormDialog } from "@/components/products/product-form-dialog";
import { ProductSearchSelector } from "@/components/purchases/product-search-selector";
import { SupplierSelector } from "@/components/purchases/supplier-selector";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { productService } from "@/services/productService";
import { purchaseService } from "@/services/purchaseService";
import { CreatePurchaseRequest } from "@/types/req/CreatePurchaseRequest";
import { ProductMutationRequest } from "@/types/req/ProductMutationRequest";
import { Product } from "@/types/res/ProductResponse";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, CheckCircle2, Loader2, ShoppingCart, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const MAX_QUANTITY = 999999.999;
const MAX_PRICE = 9999999.99;

interface PurchaseFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    initialProduct?: Product | null;
}

interface PurchaseItemUI {
    product: Product;
    quantity: number;
    totalPrice: number;
}

export function PurchaseForm({
    onSuccess,
    onCancel,
    initialProduct
}: PurchaseFormProps) {
    const { toast } = useToast();

    const [date, setDate] = useState<Date | undefined>(new Date());
    const [supplierId, setSupplierId] = useState<number | null>(null);
    const [notes, setNotes] = useState("");
    const [items, setItems] = useState<PurchaseItemUI[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isProductFormOpen, setIsProductFormOpen] = useState(false);
    const [createdProduct, setCreatedProduct] = useState<Product | null>(null);

    const addItem = useCallback((product: Product) => {
        if (items.find(i => i.product.id === product.id)) {
            toast({
                title: "Produto já adicionado",
                description: "Edite a quantidade na lista abaixo.",
            });
            return;
        }

        setItems(prev => [...prev, {
            product,
            quantity: 1,
            totalPrice: 0
        }]);
    }, [items, toast]);

    useEffect(() => {
        if (createdProduct && !isProductFormOpen) {
            addItem(createdProduct);
            setCreatedProduct(null);
        }
    }, [createdProduct, isProductFormOpen, addItem]);

    const [initialProductAdded, setInitialProductAdded] = useState(false);

    useEffect(() => {
        if (initialProduct && !initialProductAdded) {
            addItem(initialProduct);
            setInitialProductAdded(true);
        }
    }, [initialProduct, initialProductAdded, addItem]);

    const removeItem = (productId: number) => {
        setItems(items.filter(i => i.product.id !== productId));
    };

    const updateItem = (productId: number, field: 'quantity' | 'totalPrice', value: number) => {
        setItems(items.map(item => {
            if (item.product.id === productId) {
                return { ...item, [field]: value };
            }
            return item;
        }));
    };

    const handleCreateNewProduct = () => {
        setIsProductFormOpen(true);
    };

    const handleSaveNewProduct = async (data: ProductMutationRequest) => {
        try {
            const created = await productService.createProduct(data) as unknown as Product;
            const fullProduct = await productService.getProductById(created.id);
            setCreatedProduct(fullProduct);
            setIsProductFormOpen(false);
            toast({ title: "Sucesso", description: "Produto criado e adicionado à compra!" });
        } catch (e: any) {
            toast({ title: "Mensagem de Alerta", description: e.message || "Problema ao criar produto", variant: "destructive" });
            throw e;
        }
    };

    const handleSubmit = async () => {
        if (!date) {
            toast({ title: "Data obrigatória", variant: "destructive" });
            return;
        }
        if (items.length === 0) {
            toast({ title: "Adicione pelo menos um item", variant: "destructive" });
            return;
        }

        const hasInvalidItems = items.some(i => i.quantity > MAX_QUANTITY || i.totalPrice > MAX_PRICE);
        if (hasInvalidItems) {
            toast({ title: "Valores inválidos", description: "Um ou mais itens excedem os limites permitidos.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        try {
            const payload: CreatePurchaseRequest = {
                occurred_at: date.toISOString(),
                supplier_id: supplierId,
                notes: notes,
                currency: 'BRL',
                total_amount: items.reduce((acc, item) => acc + item.totalPrice, 0),
                items: items.map(i => ({
                    account_product_id: i.product.account_product?.id || 0,
                    product_id: i.product.id,
                    quantity: i.quantity,
                    item_total_price: i.totalPrice
                }))
            };

            await purchaseService.createPurchase(payload);
            toast({ title: "Compra registrada com sucesso!", variant: "success" });
            onSuccess();
        } catch (e) {
            console.error(e);
            toast({ title: "Erro ao registrar compra", description: "Verifique os dados e tente novamente.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 py-4">
            <p className="text-sm text-gray-500">
                Adicione itens e quantidades compradas para atualizar seu estoque.
            </p>
            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 block">
                        Data de compra
                    </label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full pl-3 text-left font-normal border-gray-200 h-10 flex items-center justify-between",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <span>
                                    {date ? (
                                        format(date, "d 'de' MMMM, yyyy", { locale: ptBR })
                                    ) : (
                                        "Selecione uma data"
                                    )}
                                </span>
                                <CalendarIcon className="h-4 w-4 text-gray-400" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                disabled={(date) =>
                                    date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-gray-700">
                            Local / Mercado
                        </label>
                        <span className="text-xs text-gray-400 font-normal">(opcional)</span>
                    </div>
                    <SupplierSelector
                        value={supplierId}
                        onChange={setSupplierId}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 block">
                        Adicionar produto
                    </label>
                    <ProductSearchSelector
                        onSelect={addItem}
                        onCreateNew={handleCreateNewProduct}
                    />
                </div>
            </div>

            <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700 block">
                    Itens da compra ({items.length})
                </label>

                <div className="space-y-3">
                    {items.length === 0 ? (
                        <div className="border border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
                            <ShoppingCart className="h-10 w-10 mb-2 opacity-20" />
                            <p className="font-medium text-gray-500">Nenhum item adicionado</p>
                            <p className="text-xs">Use a busca acima para adicionar produtos</p>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.product.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-4">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-900 leading-snug break-words">
                                            {item.product.name}
                                        </h3>
                                        <div className="flex flex-wrap gap-2 items-center mt-1">
                                            <span className="text-sm text-gray-500 truncate max-w-[120px]">
                                                {item.product.brand?.name}
                                            </span>
                                            {item.product.product_categories?.[0] && (
                                                <Badge variant="secondary" className="bg-gray-100 text-gray-600 font-normal border-0 hover:bg-gray-100 h-5 px-1.5 text-[10px]">
                                                    {item.product.product_categories[0].category.name}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-gray-400 hover:text-red-500 h-8 w-8 shrink-0 -mt-1 -mr-1"
                                        onClick={() => removeItem(item.product.id)}
                                        aria-label="Remover item"
                                    >
                                        <Trash2 size={18} />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-2 gap-4 items-end pt-1">
                                    <div className="space-y-1.5">
                                        <label
                                            htmlFor={`qty-${item.product.id}`}
                                            className="text-[10px] uppercase font-bold text-gray-400 tracking-wider"
                                        >
                                            QTD ({item.product.unit_type || 'un'})
                                        </label>
                                        <Input
                                            id={`qty-${item.product.id}`}
                                            type="number"
                                            min={1}
                                            step="1"
                                            className={cn(
                                                "border-gray-200 focus-visible:ring-emerald-500 h-10",
                                                item.quantity > MAX_QUANTITY && "text-red-600 border-red-200"
                                            )}
                                            value={item.quantity}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val.length <= 15) {
                                                    updateItem(item.product.id, 'quantity', Number(val));
                                                }
                                            }}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label
                                            htmlFor={`price-${item.product.id}`}
                                            className="text-[10px] uppercase font-bold text-gray-400 tracking-wider"
                                        >
                                            Valor Total
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">R$</span>
                                            <Input
                                                id={`price-${item.product.id}`}
                                                type="number"
                                                min={0}
                                                step="0.01"
                                                className={cn(
                                                    "pl-9 border-gray-200 focus-visible:ring-emerald-500 h-10",
                                                    item.totalPrice > MAX_PRICE && "text-red-600 border-red-200"
                                                )}
                                                value={item.totalPrice || ''}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val.length <= 15) {
                                                        updateItem(item.product.id, 'totalPrice', Number(val));
                                                    }
                                                }}
                                                placeholder="0,00"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))

                    )}
                </div>

                {items.length > 0 && (
                    <div className="flex justify-end pt-2">
                        <p className="text-sm font-medium text-gray-700">
                            Total investido: <span className="text-green-600 ml-1">R$ {items.reduce((acc, i) => acc + i.totalPrice, 0).toFixed(2).replace('.', ',')}</span>
                        </p>
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700">
                        Observações
                    </label>
                    <span className="text-xs text-gray-400 font-normal">(opcional)</span>
                </div>
                <Textarea
                    placeholder="Anotações sobre a compra..."
                    className="min-h-[100px] border-gray-200 focus-visible:ring-emerald-500 resize-none p-3"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
            </div>


            <div className="space-y-4 pt-4">
                <Button
                    className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20 text-base font-bold uppercase tracking-wide flex items-center justify-center gap-3 disabled:bg-emerald-300"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <CheckCircle2 className="h-5 w-5" />
                    )}
                    SALVAR COMPRA
                </Button>
                <Button
                    variant="ghost"
                    onClick={onCancel}
                    className="w-full text-gray-400 font-bold uppercase tracking-wider text-sm hover:bg-transparent"
                >
                    CANCELAR
                </Button>
            </div>

            {isProductFormOpen && (
                <ProductFormDialog
                    open={isProductFormOpen}
                    onOpenChange={setIsProductFormOpen}
                    product={null}
                    onSave={handleSaveNewProduct}
                />
            )}
        </div>
    );
}
