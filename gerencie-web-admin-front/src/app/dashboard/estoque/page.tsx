"use client";

import { InventoryFilters } from "@/components/inventory/inventory-filters";
import { InventorySummaryCards } from "@/components/inventory/inventory-summary-cards";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { MobileConsumptionSheet } from "@/components/inventory/mobile-consumption-sheet";
import { MobileInventoryActions } from "@/components/inventory/mobile-inventory-actions";
import { MobileInventoryList } from "@/components/inventory/mobile-inventory-list";
import { ProductDetailsSheet } from "@/components/inventory/product-details-sheet";
import { StockAdjustmentDialog } from "@/components/inventory/stock-adjustment-dialog";
import { StockConsumptionDialog } from "@/components/inventory/stock-consumption-dialog";
import { ProductFormDialog } from "@/components/products/product-form-dialog";
import { PurchaseFormDialog } from "@/components/purchases/purchase-form-dialog";
import { PurchaseForm } from "@/components/purchases/purchase-form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { inventoryService } from "@/services/inventoryService";
import { productService } from "@/services/productService";
import { GetInventoryRequest } from "@/types/req/GetInventoryRequest";
import { InventoryItem, InventoryStatus, InventorySummary } from "@/types/res/InventoryResponse";
import { Product } from "@/types/res/ProductResponse";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, History, Home, Package, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { DashboardPageHeader } from '@/components/dashboard/dashboard-page-header';

export default function EstoquePage() {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [isMobilePurchaseActive, setIsMobilePurchaseActive] = useState(false);
  const [purchaseInitialProduct, setPurchaseInitialProduct] = useState<Product | null>(null);

  const [detailsItem, setDetailsItem] = useState<InventoryItem | null>(null);
  const [isEditingOpen, setIsEditingOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
  const [adjustmentItem, setAdjustmentItem] = useState<InventoryItem | null>(null);

  const [isConsumptionOpen, setIsConsumptionOpen] = useState(false);
  const [isConsumptionListOpen, setIsConsumptionListOpen] = useState(false);
  const [consumptionItem, setConsumptionItem] = useState<InventoryItem | null>(null);

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);

  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);

  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  const [mobileItems, setMobileItems] = useState<InventoryItem[]>([]);
  const [mobilePage, setMobilePage] = useState(1);
  const [mobileHasMore, setMobileHasMore] = useState(true);
  const [isMobileLoading, setIsMobileLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<string>("todos");
  const [categories, setCategories] = useState<number[]>([]);

  const [sortBy, setSortBy] = useState<GetInventoryRequest['sort_by']>('name');
  const [sortDir, setSortDir] = useState<GetInventoryRequest['sort_dir']>('desc');

  const [mobileUpdateTrigger, setMobileUpdateTrigger] = useState<{ id: number, delta: number, ts: number } | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
      setMobilePage(1);
      setMobileItems([]);
      setMobileHasMore(true);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const loadInventory = useCallback(async () => {
    setIsLoadingList(true);
    try {
      const data = await inventoryService.getInventory({
        page,
        per_page: perPage,
        search: debouncedSearch || null,
        status: status === 'todos' ? undefined : (status as any),
        categories: categories.length > 0 ? categories : undefined,
        sort_by: sortBy,
        sort_dir: sortDir
      });

      setItems(data.items);
      setHasNextPage(data.nextPage !== null);
      setHasPrevPage(data.prevPage !== null);
    } catch (error) {
      console.error("Failed to load inventory", error);
      toast({
        title: "Mensagem de Alerta",
        description: "Não foi possível carregar o estoque.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingList(false);
    }
  }, [page, perPage, debouncedSearch, status, categories, sortBy, sortDir, toast]);

  const loadMobileInventory = useCallback(async () => {
    setIsMobileLoading(true);
    try {
      const data = await inventoryService.getInventory({
        page: mobilePage,
        per_page: 10,
        search: debouncedSearch || null,
        status: status === 'todos' ? undefined : (status as any),
        categories: categories.length > 0 ? categories : undefined,
        sort_by: sortBy,
        sort_dir: sortDir
      });

      if (data.items.length === 0) {
        setMobileHasMore(false);
      } else {
        setMobileItems(prev => mobilePage === 1 ? data.items : [...prev, ...data.items]);
        setMobileHasMore(data.nextPage !== null);
      }
    } catch (error) {
      console.error("Failed to load mobile inventory", error);
      setMobileHasMore(false);
    } finally {
      setIsMobileLoading(false);
    }
  }, [mobilePage, debouncedSearch, status, categories, sortBy, sortDir]);

  const loadSummary = useCallback(async () => {
    setIsLoadingSummary(true);
    try {
      const data = await inventoryService.getSummary();
      setSummary(data);
    } catch (error) {
      console.error("Failed to load summary", error);
    } finally {
      setIsLoadingSummary(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  useEffect(() => {
    loadMobileInventory();
  }, [loadMobileInventory]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field as any);
      setSortDir('asc');
    }
  };

  const handleStatusSelect = (newStatus: InventoryStatus | 'todos') => {
    setStatus(newStatus);
    setPage(1);
    setMobilePage(1);
    setMobileItems([]);
    setMobileHasMore(true);
  };

  const lastUpdateDate = summary?.ultima_atualizacao
    ? format(new Date(summary.ultima_atualizacao), "d 'de' MMMM, HH:mm", { locale: ptBR })
    : "...";

  return (
    <div className="flex flex-col min-h-screen">
      {isMobile && isMobilePurchaseActive ? (
        <div className="bg-white min-h-screen">
          <div className="p-4 border-b flex items-center gap-4 bg-white sticky top-0 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsMobilePurchaseActive(false);
                setPurchaseInitialProduct(null);
                window.scrollTo(0, 0);
              }}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-green-600" />
              Registrar Compra
            </h2>
          </div>
          <div className="p-4 pb-32">
            <PurchaseForm
              initialProduct={purchaseInitialProduct}
              onSuccess={() => {
                setIsMobilePurchaseActive(false);
                setPurchaseInitialProduct(null);
                loadInventory();
                loadSummary();
                window.scrollTo(0, 0);
              }}
              onCancel={() => {
                setIsMobilePurchaseActive(false);
                setPurchaseInitialProduct(null);
                window.scrollTo(0, 0);
              }}
            />
          </div>
        </div>
      ) : isMobile && isConsumptionListOpen ? (
        <MobileConsumptionSheet
          onBack={() => {
            setIsConsumptionListOpen(false);
            window.scrollTo(0, 0);
          }}
          onSelectProduct={(item) => {
            setConsumptionItem(item);
            setIsConsumptionOpen(true);
          }}
          updateTrigger={mobileUpdateTrigger}
        />
      ) : (
        <div className="p-8 max-w-[1600px] mx-auto min-h-screen">
          <DashboardPageHeader
            title="Estoque"
            description={`Última atualização: ${lastUpdateDate}`}
            icon={Package}
            breadcrumbs={[
              { label: 'Home', icon: Home },
              { label: 'Estoque' }
            ]}
            actions={
              <>
                <Link href="/dashboard/estoque/historico">
                  <Button variant="outline" className="gap-2 bg-white hover:bg-gray-50 text-gray-700 border-gray-200 shadow-sm">
                    <History className="h-4 w-4" />
                    Ver Histórico
                  </Button>
                </Link>
                <Button
                  onClick={() => setIsPurchaseOpen(true)}
                  className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-600/20"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Registrar Compra
                </Button>
              </>
            }
            mobileActions={
              <MobileInventoryActions
                onRegisterConsumption={() => {
                  setIsConsumptionListOpen(true);
                }}
                onRegisterPurchase={() => {
                  setIsMobilePurchaseActive(true);
                }}
              />
            }
          />

          <InventorySummaryCards
            summary={summary}
            selectedStatus={status}
            onSelectStatus={handleStatusSelect}
            loading={isLoadingSummary}
          />

          <div className="space-y-4">
            <InventoryFilters
              search={search}
              onSearchChange={setSearch}
              status={status}
              onStatusChange={(val) => { setStatus(val); setPage(1); setMobilePage(1); setMobileItems([]); setMobileHasMore(true); }}
              selectedCategories={categories}
              onCategoriesChange={(ids) => { setCategories(ids); setPage(1); setMobilePage(1); setMobileItems([]); setMobileHasMore(true); }}
            />

            <div className="text-sm text-gray-500 font-medium ml-1">
              {summary?.total_itens || 0} itens
            </div>

            <div className="hidden md:block">
              <InventoryTable
                items={items}
                isLoading={isLoadingList}
                sortBy={sortBy}
                onSort={handleSort}
                onEdit={(item) => {
                  setDetailsItem(item);
                }}
                onConsumption={(item) => {
                  setConsumptionItem(item);
                  setIsConsumptionOpen(true);
                }}
                onManualAdjustment={(item) => {
                  setAdjustmentItem(item);
                  setIsAdjustmentOpen(true);
                }}
              />
            </div>

            <div className="md:hidden">
              <MobileInventoryList
                items={mobileItems}
                isLoading={isMobileLoading}
                hasMore={mobileHasMore}
                onLoadMore={() => setMobilePage(prev => prev + 1)}
                onEdit={(item) => setDetailsItem(item)}
                onConsumption={(item) => {
                  setConsumptionItem(item);
                  setIsConsumptionOpen(true);
                }}
                onManualAdjustment={(item) => {
                  setAdjustmentItem(item);
                  setIsAdjustmentOpen(true);
                }}
              />
            </div>

            <div className="hidden md:flex items-center justify-between py-4">
              <div className="text-sm text-muted-foreground">
                Página {page}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasPrevPage || isLoadingList}
                  onClick={() => setPage(p => p - 1)}
                  className="bg-white"
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasNextPage || isLoadingList}
                  onClick={() => setPage(p => p + 1)}
                  className="bg-white"
                >
                  Próxima
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <PurchaseFormDialog
        open={isPurchaseOpen}
        onOpenChange={(isOpen) => {
          setIsPurchaseOpen(isOpen);
          if (!isOpen) setPurchaseInitialProduct(null);
        }}
        onSuccess={() => {
          loadInventory();
          loadSummary();
        }}
        initialProduct={purchaseInitialProduct}
      />

      <ProductDetailsSheet
        open={detailsItem !== null}
        onOpenChange={(open) => !open && setDetailsItem(null)}
        item={detailsItem}
        onRegisterPurchase={(item) => {
          const product: any = {
            id: item.product_id,
            name: item.product_name,
            brand: { id: 0, name: item.brand_name },
            product_categories: item.categories.map(c => ({ category: { name: c.name }, category_id: c.id })),
            unit_type: item.unit_type,
            account_product: { id: item.account_product_id }
          };
          setPurchaseInitialProduct(product);
          if (isMobile) {
            setIsMobilePurchaseActive(true);
          } else {
            setIsPurchaseOpen(true);
          }
          setDetailsItem(null);
        }}
        onConsumption={(item) => {
          setConsumptionItem(item);
          setIsConsumptionOpen(true);
          setDetailsItem(null);
        }}
        onManualAdjustment={(item) => {
          setAdjustmentItem(item);
          setIsAdjustmentOpen(true);
          setDetailsItem(null);
        }}
        onConfigure={async (item) => {
          try {
            const fullProduct = await productService.getProductById(item.product_id);

            if (!fullProduct.brand && item.brand_name) {
              fullProduct.brand = { id: fullProduct.brand_id, name: item.brand_name } as any;
            }

            if (!fullProduct.account_product && ((item.min_limit ?? 0) > 0 || (item.max_limit ?? 0) > 0)) {
              fullProduct.account_product = {
                id: item.account_product_id || 0,
                account_id: 0,
                product_id: item.product_id,
                min_limit: item.min_limit ?? 0,
                max_limit: item.max_limit ?? 0,
                created_at: Date.now(),
                custom_name: '',
                is_favorite: false,
                is_archived: false,
              };
            }

            setEditingProduct(fullProduct);
            setIsEditingOpen(true);
          } catch {
            toast({ title: "Mensagem de Alerta", description: "Falha ao carregar produto", variant: "destructive" });
          }
        }}
      />

      {isEditingOpen && (
        <ProductFormDialog
          open={isEditingOpen}
          onOpenChange={setIsEditingOpen}
          product={editingProduct}
          onSave={async (data) => {
            try {
              if (editingProduct) {
                await productService.updateProduct(editingProduct.id, data);
                toast({ title: "Produto atualizado com sucesso!", variant: "success" });
                setIsEditingOpen(false);
                loadInventory();
                loadSummary();
                if (detailsItem && detailsItem.product_id === editingProduct.id) {
                  setDetailsItem(null);
                }
              }
            } catch (e: any) {
              toast({ title: "Mensagem de Alerta", description: e.message || "Falha ao salvar", variant: "destructive" });
            }
          }}
        />
      )}

      <StockAdjustmentDialog
        open={isAdjustmentOpen}
        onOpenChange={(open) => {
          setIsAdjustmentOpen(open);
          if (!open) setAdjustmentItem(null);
        }}
        item={adjustmentItem}
        onConfirm={async (newQty, reason) => {
          if (!adjustmentItem) return;
          try {
            await inventoryService.adjustStock({
              account_product_id: adjustmentItem.account_product_id,
              quantity: Number(newQty),
              motive: reason
            });
            toast({ title: "Estoque ajustado com sucesso!", variant: "success" });
            loadInventory();
            setMobilePage(1);
            setMobileItems([]);
            setMobileHasMore(true);
            loadSummary();
          } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            toast({
              title: "Mensagem de Alerta",
              description: backendMessage || "Não foi possível ajustar o estoque.",
              variant: "destructive"
            });
            throw error;
          }
        }}
      />

      <StockConsumptionDialog
        open={isConsumptionOpen}
        onOpenChange={(open) => {
          setIsConsumptionOpen(open);
          if (!open) setConsumptionItem(null);
        }}
        item={consumptionItem}
        onConfirm={async (parsedConsumedQty) => {
          if (!consumptionItem) return;
          try {
            await inventoryService.consumptionStock({
              account_product_id: consumptionItem.account_product_id,
              quantity: parsedConsumedQty
            });

            setMobileUpdateTrigger({
              id: consumptionItem.id,
              delta: -parsedConsumedQty,
              ts: Date.now()
            });

            toast({ title: "Consumo registrado com sucesso!", variant: "success" });
            loadInventory();
            setMobilePage(1);
            setMobileItems([]);
            setMobileHasMore(true);
            loadSummary();
          } catch (error: any) {
            const backendMessage = error.response?.data?.message;
            toast({
              title: "Mensagem de Alerta",
              description: backendMessage || "Não foi possível registrar o consumo.",
              variant: "destructive"
            });
            console.error(error);
          }
        }}
      />
    </div>
  );
}
