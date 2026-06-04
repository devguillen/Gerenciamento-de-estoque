"use client";

import { ProductFilters } from "@/components/products/product-filters";
import { ProductFormDialog } from "@/components/products/product-form-dialog";
import { ProductTable } from "@/components/products/product-table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { inventoryService } from "@/services/inventoryService";
import { productService } from "@/services/productService";
import { Scope, SortDirection } from "@/types/common";
import { ProductSortField } from "@/types/req/GetProductsRequest";
import { ProductMutationRequest } from "@/types/req/ProductMutationRequest";
import { Product } from "@/types/res/ProductResponse";
import { ChevronRight, Home } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";

export default function ProdutosPage() {
    const { toast } = useToast();

    // --- State ---
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Pagination
    const [page, setPage] = useState(1);
    const [perPage] = useState(10);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPrevPage, setHasPrevPage] = useState(false);

    // Filters
    const [search, setSearch] = useState("");
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [scope, setScope] = useState<Scope>('all');

    // Sorting
    const [sortBy, setSortBy] = useState<ProductSortField>('belongs_to_account');
    const [sortDir, setSortDir] = useState<SortDirection>('desc');

    // Modal State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Delete State
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Debounce search
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [search]);

    const loadProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await productService.getProducts({
                page,
                per_page: perPage,
                search: debouncedSearch,
                // brand: null, 
                scope,
                sort_by: sortBy,
                sort_dir: sortDir,
                categories: selectedCategories.length > 0 ? selectedCategories : undefined
            });

            setProducts(data.items);
            setHasNextPage(data.nextPage !== null);
            setHasPrevPage(data.prevPage !== null);

        } catch (error) {
            console.error("Failed to load products", error);
            toast({
                title: "Mensagem de Alerta",
                description: "Não foi possível carregar os produtos.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }, [page, perPage, debouncedSearch, scope, sortBy, sortDir, selectedCategories, toast]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    // --- Handlers ---

    const handleSort = (field: ProductSortField) => {
        if (sortBy === field) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortDir('asc');
        }
    };

    const handleCreateClick = () => {
        setSelectedProduct(null);
        setIsFormOpen(true);
    };

    const handleConfigure = (p: Product) => {
        setSelectedProduct(p);
        setIsFormOpen(true);
    };

    const handleEdit = (p: Product) => {
        setSelectedProduct(p);
        setIsFormOpen(true);
    };

    const handleSaveProduct = async (data: ProductMutationRequest) => {
        const { initial_stock, ...productData } = data;
        try {
            if (selectedProduct) {
                // Update / Configure
                await productService.updateProduct(selectedProduct.id, productData);
                toast({ title: "Sucesso", description: "Produto atualizado com sucesso.", variant: "success" });
            } else {
                // Create
                if (!productData.name || productData.brand_id === 0) {
                    toast({ title: "Mensagem de Alerta", description: "Nome e Marca são obrigatórios.", variant: "destructive" });
                    return;
                }
                const created = await productService.createProduct(productData);
                if (initial_stock && initial_stock > 0 && created.account_product) {
                    await inventoryService.adjustStock({
                        account_product_id: created.account_product.id,
                        quantity: initial_stock,
                        motive: 'Estoque inicial',
                    });
                }
                toast({ title: "Sucesso", description: "Produto criado com sucesso.", variant: "success" });
            }
            setIsFormOpen(false);
            loadProducts();
        } catch (error: any) {
            console.error("Save failed", error);
            const errorMessage = error?.response?.data?.message;

            if (errorMessage === "Já existe um produto com este nome cadastrado para esta marca nesta conta.") {
                toast({ title: "Mensagem de Alerta", description: "Esse produto já existe", variant: "destructive" });
            } else {
                toast({ title: "Mensagem de Alerta", description: "Falha ao salvar produto.", variant: "destructive" });
            }
        }
    };

    const handleDelete = (p: Product) => {
        setProductToDelete(p);
        setIsDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;
        setIsDeleting(true);
        try {
            await productService.deleteProduct(productToDelete.id);
            toast({ title: "Produto excluído", description: "O produto foi removido com sucesso.", variant: "success" });
            setIsDeleteOpen(false);
            loadProducts();
        } catch (error) {
            console.error('Delete error:', error);
            toast({ title: "Mensagem de Alerta", description: "Falha ao excluir produto.", variant: "destructive" });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="p-8 max-w-[1200px] mx-auto">
            {/* Header */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Home className="h-4 w-4" />
                <ChevronRight className="h-4 w-4" />
                <span>Produtos</span>
            </div>

            <h1 className="text-3xl font-semibold mb-6">Produtos</h1>

            {/* Actions */}
            <div className="flex justify-between items-end mb-6">
                <Button
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
                    disabled={isLoading}
                    onClick={handleCreateClick}
                >
                    <FaPlus size={14} /> ADICIONAR PRODUTO
                </Button>

                {/* Scope Tabs */}
                <Tabs value={scope} onValueChange={(v) => { setScope(v as Scope); setPage(1); }} className="w-[400px]">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="all">Todos</TabsTrigger>
                        <TabsTrigger value="system">Sistema</TabsTrigger>
                        <TabsTrigger value="mine">Meus</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Filters */}
            <ProductFilters
                search={search}
                onSearchChange={setSearch}
                selectedCategories={selectedCategories}
                onCategoriesChange={(ids) => { setSelectedCategories(ids); setPage(1); }}
            />

            {/* Table */}
            <ProductTable
                products={products}
                isLoading={isLoading}
                sortBy={sortBy}
                sortDir={sortDir}
                onSort={handleSort}
                onConfigure={handleConfigure}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    Página {page}
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!hasPrevPage || isLoading}
                        onClick={() => setPage(p => p - 1)}
                    >
                        Anterior
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!hasNextPage || isLoading}
                        onClick={() => setPage(p => p + 1)}
                    >
                        Próxima
                    </Button>
                </div>
            </div>

            <ProductFormDialog
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                product={selectedProduct}
                onSave={handleSaveProduct}
            />

            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{productToDelete?.owner_account_id === 0 ? "Desassociar produto?" : "Excluir produto?"}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {productToDelete && (
                                productToDelete.owner_account_id === 0 ? (
                                    <span>
                                        Você está prestes a desassociar o produto <strong>"{productToDelete.name}"</strong> da sua conta.
                                        <br /><br />
                                        Ele continuará existindo no sistema, mas seus limites configurados serão perdidos. Você poderá configurá-lo novamente no futuro.
                                    </span>
                                ) : (
                                    <span>
                                        Tem certeza que deseja excluir o produto <strong>{productToDelete.name}</strong>?
                                        <br />
                                        Essa ação não pode ser desfeita.
                                    </span>
                                )
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => { e.preventDefault(); confirmDelete(); }}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Excluindo..." : "Excluir"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
