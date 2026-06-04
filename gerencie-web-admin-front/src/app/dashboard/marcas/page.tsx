"use client";

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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { brandService } from "@/services/brandService";
import { Brand } from "@/types/res/BrandResponse";
import { ChevronRight, Home, Pencil, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";

export default function MarcasPage() {
  const { toast } = useToast();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  // Form dialog state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [formName, setFormName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Delete dialog state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const loadBrands = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await brandService.getBrands(debouncedSearch, page, 10);
      setBrands(data.items);
      setHasNextPage(data.nextPage !== null);
      setHasPrevPage(data.prevPage !== null);
    } catch {
      toast({ title: "Erro", description: "Não foi possível carregar as marcas.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, page, toast]);

  useEffect(() => {
    loadBrands();
  }, [loadBrands]);

  const openCreate = () => {
    setSelectedBrand(null);
    setFormName("");
    setIsFormOpen(true);
  };

  const openEdit = (brand: Brand) => {
    setSelectedBrand(brand);
    setFormName(brand.name);
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    const name = formName.trim();
    if (!name) return;
    setIsSaving(true);
    try {
      if (selectedBrand) {
        await brandService.updateBrand(selectedBrand.id, name);
        toast({ title: "Sucesso", description: "Marca atualizada com sucesso.", variant: "success" });
      } else {
        await brandService.createBrand(name);
        toast({ title: "Sucesso", description: "Marca criada com sucesso.", variant: "success" });
      }
      setIsFormOpen(false);
      loadBrands();
    } catch {
      toast({ title: "Erro", description: "Falha ao salvar marca.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const openDelete = (brand: Brand) => {
    setBrandToDelete(brand);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!brandToDelete) return;
    setIsDeleting(true);
    try {
      await brandService.deleteBrand(brandToDelete.id);
      toast({ title: "Sucesso", description: "Marca excluída com sucesso.", variant: "success" });
      loadBrands();
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      if (msg === "Cannot delete brand with associated products.") {
        toast({ title: "Atenção", description: "Não é possível excluir uma marca com produtos associados.", variant: "destructive" });
      } else {
        toast({ title: "Erro", description: "Falha ao excluir marca.", variant: "destructive" });
      }
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
      setBrandToDelete(null);
    }
  };

  const isSystemBrand = (brand: Brand) => brand.owner_account_id === 0;

  return (
    <div className="p-8 max-w-[900px] mx-auto">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <Home className="h-4 w-4" />
        <ChevronRight className="h-4 w-4" />
        <span>Cadastros</span>
        <ChevronRight className="h-4 w-4" />
        <span>Marcas</span>
      </div>

      <h1 className="text-3xl font-semibold mb-6">Marcas</h1>

      <div className="flex items-center justify-between mb-4">
        <Input
          placeholder="Buscar marca..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Button
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
          onClick={openCreate}
        >
          <FaPlus size={14} /> ADICIONAR MARCA
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : brands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  Nenhuma marca encontrada.
                </TableCell>
              </TableRow>
            ) : (
              brands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {isSystemBrand(brand) ? "Sistema" : "Minha conta"}
                  </TableCell>
                  <TableCell className="text-right">
                    {!isSystemBrand(brand) && (
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(brand)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openDelete(brand)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Página {page}</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={!hasPrevPage || isLoading} onClick={() => setPage(p => p - 1)}>
            Anterior
          </Button>
          <Button variant="outline" size="sm" disabled={!hasNextPage || isLoading} onClick={() => setPage(p => p + 1)}>
            Próxima
          </Button>
        </div>
      </div>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{selectedBrand ? "Editar Marca" : "Nova Marca"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <label className="text-sm font-medium">Nome</label>
            <Input
              placeholder="Ex: Nestlé, Unilever..."
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isSaving || !formName.trim()}>
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir marca?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a marca <strong>{brandToDelete?.name}</strong>?
              {" "}Marcas com produtos associados não podem ser excluídas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleDelete(); }}
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
