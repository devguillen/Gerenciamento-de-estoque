"use client";

import { CategoryFilters } from "@/components/categories/category-filters";
import { CategoryFormDialog } from "@/components/categories/category-form-dialog";
import { CategoryTable } from "@/components/categories/category-table";
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
import { categoryService } from "@/services/categoryService";
import { Scope, SortDirection } from "@/types/common";
import { CategorySortField } from "@/types/req/CategoryRequest";
import { Category } from "@/types/res/CategoryResponse";
import { ChevronRight, Home } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";

export default function CategoriasPage() {
  const { toast } = useToast();

  // --- State ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState<number | null>(null);
  const [scope, setScope] = useState<Scope>('all');

  // Sorting
  const [sortBy, setSortBy] = useState<CategorySortField>('priority_sort');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Delete Confirmation State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on search change
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await categoryService.getCategories({
        page,
        per_page: perPage,
        search: debouncedSearch,
        priority,
        scope,
        sort_by: sortBy,
        sort_dir: sortDir
      });

      setCategories(data.items);
      setHasNextPage(data.nextPage !== null);
      setHasPrevPage(data.prevPage !== null);

    } catch (error) {
      console.error("Failed to load categories", error);
      toast({
        title: "Mensagem de Alerta",
        description: "Não foi possível carregar as categorias.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, perPage, debouncedSearch, priority, scope, sortBy, sortDir, toast]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // --- Handlers ---

  const handleSort = (field: CategorySortField) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  const handlePriorityFilterChange = (val: string) => {
    if (val === "all") {
      setPriority(null);
    } else {
      setPriority(Number(val));
    }
    setPage(1);
  };

  // CRUD Handlers
  const handleCreateClick = () => {
    // Initialize empty category for creation
    setSelectedCategory({
      id: 0, // 0 indicates new
      name: '',
      priority_sort: 1, // Default to Low
      owner_account_id: 1, // Mock > 0 for "Minha" behavior in disabled checks
      created_at: Date.now() // Expects number/timestamp per interface
    } as Category);
    setIsEditOpen(true);
  };

  const handleSaveCategory = async (category: Category) => {
    try {
      if (category.id === 0) {
        // Create
        if (!category.name.trim()) {
          toast({ title: "Mensagem de Alerta", description: "Nome é obrigatório", variant: "destructive" });
          return;
        }

        await categoryService.createCategory({
          name: category.name,
          priority: category.priority_sort
        });
        toast({ title: "Sucesso", description: "Categoria criada com sucesso.", variant: "success" });
      } else {
        // Update / Configure
        await categoryService.updateCategory(category.id, {
          name: category.name,
          priority: category.priority_sort
        });
        toast({ title: "Sucesso", description: "Categoria atualizada com sucesso.", variant: "success" });
      }

      setIsEditOpen(false);
      loadCategories();
    } catch (error: any) {
      console.error("Operation failed", error);
      const errorMessage = error?.response?.data?.message || "Falha ao salvar categoria.";

      if (errorMessage === "Esta categoria já existe.") {
        toast({ title: "Mensagem de Alerta", description: "Já existe uma categoria com esse nome.", variant: "destructive" });
      } else {
        toast({ title: "Mensagem de Alerta", description: "Falha ao salvar categoria.", variant: "destructive" });
      }
    }
  };

  // Trigger Delete Modal
  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteOpen(true);
  };

  // Confirm Delete Action
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await categoryService.deleteCategory(categoryToDelete.id);
      toast({ title: "Sucesso", description: "Categoria excluída com sucesso.", variant: "success" });
      loadCategories();
    } catch (error) {
      console.error("Delete failed", error);
      toast({ title: "Mensagem de Alerta", description: "Falha ao excluir categoria.", variant: "destructive" });
    } finally {
      setIsDeleteOpen(false);
      setCategoryToDelete(null);
    }
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <Home className="h-4 w-4" />
        <ChevronRight className="h-4 w-4" />
        <span>Categorias</span>
      </div>

      <h1 className="text-3xl font-semibold mb-6">Categorias</h1>

      {/* Actions */}
      <div className="flex justify-between items-end mb-6">
        <Button
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
          disabled={isLoading}
          onClick={handleCreateClick}
        >
          <FaPlus size={14} /> ADICIONAR CATEGORIA
        </Button>

        {/* Scope Tabs */}
        <Tabs value={scope} onValueChange={(v) => { setScope(v as Scope); setPage(1); }} className="w-[400px]">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="system">Sistema</TabsTrigger>
            <TabsTrigger value="mine">Minhas</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Filters */}
      <CategoryFilters
        search={search}
        onSearchChange={setSearch}
        priority={priority}
        onPriorityChange={handlePriorityFilterChange}
      />

      {/* Table */}
      <CategoryTable
        categories={categories}
        isLoading={isLoading}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={handleSort}
        onEdit={(c) => { setSelectedCategory(c); setIsEditOpen(true); }}
        onConfigure={(c) => { setSelectedCategory(c); setIsEditOpen(true); }}
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
      <CategoryFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        category={selectedCategory}
        onSave={handleSaveCategory}
      />

      {/* DELETE CONFIRMATION ALERT (Kept in page for now as it's a global action) */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              {categoryToDelete && (
                categoryToDelete.owner_account_id === 0 ? (
                  <span>
                    Você está prestes a desassociar a categoria <strong>"{categoryToDelete.name}"</strong> da sua conta.
                    <br /><br />
                    Ela continuará existindo no sistema, mas suas configurações personalizadas serão perdidas. Você poderá configurá-la novamente no futuro.
                  </span>
                ) : (
                  <span>
                    Essa ação não pode ser desfeita. Isso excluirá permanentemente a categoria
                    <strong> "{categoryToDelete.name}" </strong>
                    e removerá seus dados de nossos servidores.
                  </span>
                )
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

