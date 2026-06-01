"use client";

import { SupplierFilters } from "@/components/suppliers/supplier-filters";
import { SupplierFormDialog } from "@/components/suppliers/supplier-form-dialog";
import { SupplierTable } from "@/components/suppliers/supplier-table";
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
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supplierService } from "@/services/supplierService";
import { Scope, SortDirection } from "@/types/common";
import { Supplier } from "@/types/res/SupplierResponse";
import { ChevronRight, Home } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";

export default function FornecedoresPage() {
  const { toast } = useToast();

  // --- State ---
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [hasNextPage, setHasNextPage] = useState(false); // Controlled by response
  const [hasPrevPage, setHasPrevPage] = useState(false); // Controlled by response

  // Filters
  const [search, setSearch] = useState("");
  // const [scope, setScope] = useState<Scope>('all'); // If API supports scope, we use it. 
  // User asked for "parte de sistema e adicionado pessoal", so Scope is needed.
  const [scope, setScope] = useState<Scope>('all');

  // Sorting
  const [sortBy, setSortBy] = useState<string>('belongs_to_account');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Delete Confirmation State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on search change
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const loadSuppliers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await supplierService.getSuppliers({
        page,
        per_page: perPage,
        search: debouncedSearch,
        scope,
        sort_by: sortBy,
        sort_dir: sortDir
      });

      setSuppliers(data.items);
      setHasNextPage(data.nextPage !== null);
      setHasPrevPage(data.prevPage !== null);

    } catch (error) {
      console.error("Failed to load suppliers", error);
      toast({
        title: "Mensagem de Alerta",
        description: "Não foi possível carregar os fornecedores.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, perPage, debouncedSearch, scope, sortBy, sortDir, toast]);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  // --- Handlers ---

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  // CRUD Handlers
  const handleCreateClick = () => {
    // Initialize empty supplier for creation
    setSelectedSupplier({
      id: 0,
      name: '',
      address: '', // UI maps this to 'adress' in payload
      owner_account_id: 1, // Default to user (mocked as > 0)
      created_at: Date.now(),
      deleted: false
    } as Supplier);
    setIsEditOpen(true);
  };

  const handleSaveSupplier = async (data: { name: string; address: string }) => {
    // Data comes from form dialog
    try {
      if (selectedSupplier && selectedSupplier.id !== 0) {
        // Update
        await supplierService.updateSupplier(selectedSupplier.id, {
          name: data.name,
          address: data.address
        });
        toast({ title: "Sucesso", description: "Fornecedor atualizado com sucesso.", variant: "success" });
      } else {
        // Create
        await supplierService.createSupplier({
          name: data.name,
          address: data.address
        });
        toast({ title: "Sucesso", description: "Fornecedor criado com sucesso.", variant: "success" });
      }

      setIsEditOpen(false);
      loadSuppliers();
    } catch (error) {
      console.error("Operation failed", error);
      toast({ title: "Mensagem de Alerta", description: "Falha ao salvar fornecedor.", variant: "destructive" });
    }
  };

  // Trigger Delete Modal
  const handleDeleteClick = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setIsDeleteOpen(true);
  };

  // Confirm Delete Action
  const handleConfirmDelete = async () => {
    if (!supplierToDelete) return;
    setIsDeleting(true);

    try {
      await supplierService.deleteSupplier(supplierToDelete.id);
      toast({ title: "Sucesso", description: "Fornecedor excluído com sucesso.", variant: "success" });
      loadSuppliers();
    } catch (error) {
      console.error("Delete failed", error);
      toast({ title: "Mensagem de Alerta", description: "Falha ao excluir fornecedor.", variant: "destructive" });
    } finally {
      setIsDeleteOpen(false);
      setSupplierToDelete(null);
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <Home className="h-4 w-4" />
        <ChevronRight className="h-4 w-4" />
        <span>Fornecedores</span>
      </div>

      <h1 className="text-3xl font-semibold mb-6">Fornecedores</h1>

      {/* Actions */}
      <div className="flex justify-between items-end mb-6">
        <Button
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
          disabled={isLoading}
          onClick={handleCreateClick}
        >
          <FaPlus size={14} /> ADICIONAR FORNECEDOR
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
      <SupplierFilters
        search={search}
        onSearchChange={setSearch}
      />

      {/* Table */}
      <SupplierTable
        suppliers={suppliers}
        isLoading={isLoading}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={handleSort}
        onEdit={(s) => { setSelectedSupplier(s); setIsEditOpen(true); }}
        onDelete={handleDeleteClick}
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

      {/* Form Modal */}
      <SupplierFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        supplier={selectedSupplier}
        onSave={handleSaveSupplier}
        isLoading={isLoading}
      />

      {/* DELETE CONFIRMATION ALERT */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Excluir fornecedor?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {supplierToDelete && (
                <span>
                  Tem certeza que deseja excluir o fornecedor <strong>{supplierToDelete.name}</strong>?
                  <br />
                  Essa ação não pode ser desfeita e removerá seus dados permanentemente.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleConfirmDelete(); }}
              className="bg-red-600 hover:bg-red-700"
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
