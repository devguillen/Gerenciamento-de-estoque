
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { productService } from "@/services/productService";
import { Product } from "@/types/res/ProductResponse";
import { Loader2, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";

interface ProductSearchSelectorProps {
    onSelect: (product: Product) => void;
    onCreateNew: (name: string) => void;
    allowCreate?: boolean;
}

export function ProductSearchSelector({ onSelect, onCreateNew, allowCreate = true }: ProductSearchSelectorProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                // Fetch all products (system + account)
                const data = await productService.getProducts({
                    page: 1,
                    per_page: 20,
                    search: search,
                    sort_by: 'product.name',
                    sort_dir: 'asc',
                    scope: 'all'
                });
                setProducts(data.items);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        if (open) {
            const timeout = setTimeout(fetchProducts, 300);
            return () => clearTimeout(timeout);
        }
    }, [search, open]);

    return (
        <Popover open={open} onOpenChange={setOpen} modal={true}>
            <PopoverTrigger asChild>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <input
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Pesquisar produto ou marca..."
                        onClick={() => setOpen(true)}
                        readOnly // Prevent typing directly, force using CommandInput inside popover or just let it trigger popover
                    />
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-[calc(100vw-2rem)] md:w-[500px] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Pesquisar produto..."
                        value={search}
                        onValueChange={setSearch}
                    />
                    <CommandList>
                        {loading && (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                                Buscando produtos...
                            </div>
                        )}

                        {!loading && products.length === 0 && !search && (
                            <CommandEmpty>Digite para buscar...</CommandEmpty>
                        )}

                        {!loading && search && products.length === 0 && allowCreate && (
                            <div className="p-2">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start"
                                    onClick={() => {
                                        onCreateNew(search);
                                        setOpen(false);
                                    }}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Criar novo produto &quot;{search}&quot;
                                </Button>
                            </div>
                        )}

                        <CommandGroup heading="Produtos Encontrados">
                            {products.map(product => (
                                <CommandItem
                                    key={product.id}
                                    value={String(product.id)}
                                    onSelect={() => {
                                        onSelect(product);
                                        setOpen(false);
                                        setSearch("");
                                    }}
                                    className="flex justify-between items-center py-3"
                                >
                                    <div className="flex flex-col">
                                        <span className="font-medium">{product.name}</span>
                                        <span className="text-xs text-muted-foreground">{product.brand?.name || 'Sem marca'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {/* Show categories as badges */}
                                        {product.product_categories.slice(0, 1).map(pc => (
                                            <Badge key={pc.id} variant="secondary" className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700">
                                                {pc.category?.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
