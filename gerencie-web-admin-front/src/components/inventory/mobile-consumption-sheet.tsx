
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { inventoryService } from "@/services/inventoryService";
import { InventoryItem } from "@/types/res/InventoryResponse";
import { ArrowLeft, Loader2, Search, TrendingDown } from "lucide-react";
import { formatQuantity } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface MobileConsumptionSheetProps {
    onBack: () => void;
    onSelectProduct: (item: InventoryItem) => void;
    updateTrigger?: { id: number, delta: number, ts: number } | null;
}

export function MobileConsumptionSheet({
    onBack,
    onSelectProduct,
    updateTrigger
}: MobileConsumptionSheetProps) {
    const [search, setSearch] = useState("");
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);

    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
            setItems([]);
            setHasMore(true);
        }, 500);
        return () => clearTimeout(handler);
    }, [search]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const data = await inventoryService.getInventory({
                    page,
                    per_page: 10,
                    search: debouncedSearch || undefined,
                    sort_by: 'name',
                    sort_dir: 'asc'
                });

                if (data.items.length === 0) {
                    setHasMore(false);
                } else {
                    setItems(prev => page === 1 ? data.items : [...prev, ...data.items]);
                    setHasMore(data.nextPage !== null);
                }
            } catch (e) {
                console.error(e);
                setHasMore(false);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [page, debouncedSearch]);

    const observerTarget = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !isLoading) {
                    setPage(prev => prev + 1);
                }
            },
            {
                threshold: 0.1,
                rootMargin: '200px'
            }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [hasMore, isLoading]);

    useEffect(() => {
        if (updateTrigger) {
            setItems(prev => prev.map(item => {
                if (item.id === updateTrigger.id) {
                    const newQty = Math.max(0, (Number(item.quantity) || 0) + updateTrigger.delta);
                    return { ...item, quantity: newQty };
                }
                return item;
            }));
        }
    }, [updateTrigger]);

    return (
        <div className="bg-white min-h-screen">
            <div className="p-4 border-b flex items-center gap-4 bg-white sticky top-0 z-10">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onBack}
                >
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-orange-600" />
                    Registrar consumo
                </h2>
            </div>

            <div className="p-4">
                <p className="text-sm text-gray-500 mb-6">
                    Selecione um item abaixo para registrar o consumo
                </p>

                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                        className="pl-10 h-12 text-base rounded-xl border-gray-200 bg-white"
                        placeholder="Pesquisar"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <h3 className="text-sm font-medium text-gray-500 mb-4 px-1">Itens</h3>

                <div className="space-y-3">
                    {items.map(item => (
                        <div key={item.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between gap-4">
                            <div className="flex flex-col flex-1">
                                <span className="text-base font-medium text-gray-900 line-clamp-1">{item.display_name}</span>
                                <span className="text-xs text-gray-500">{item.brand_name}</span>

                                <span className={`text-xs mt-1 font-medium ${(item.quantity || 0) > 0 ? 'text-emerald-600' : 'text-red-500'
                                    }`}>
                                    {formatQuantity(item.quantity)} {item.unit_type} restante
                                    {(item.min_limit ?? 0) > 0 && <span className="text-gray-400 font-normal"> (mínimo: {formatQuantity(item.min_limit || 0)} {item.unit_type})</span>}
                                </span>
                            </div>

                            <Button
                                variant="outline"
                                className="h-9 px-4 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 font-medium whitespace-nowrap"
                                onClick={() => onSelectProduct(item)}
                                disabled={Number(item.quantity) === 0}
                            >
                                Consumir
                            </Button>
                        </div>
                    ))}

                    <div ref={observerTarget} className="h-4 flex justify-center py-4">
                        {isLoading && <Loader2 className="h-6 w-6 animate-spin text-gray-400" />}
                    </div>

                    {!isLoading && items.length === 0 && (
                        <div className="text-center text-gray-400 py-10">
                            Nenhum item encontrado
                        </div>
                    )}

                    {!isLoading && !hasMore && (
                        <div className="text-center text-gray-400 py-10">
                            Fim da lista
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
