
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supplierService } from "@/services/supplierService";
import { Supplier } from "@/types/res/SupplierResponse";
import { Check, ChevronsUpDown, Loader2, MapPin, Plus } from "lucide-react";
import { useEffect, useState } from "react";

interface SupplierSelectorProps {
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
  initialSupplier?: { id: number; name: string; address?: string };
}

export function SupplierSelector({
  value,
  onChange,
  disabled,
  initialSupplier
}: SupplierSelectorProps) {

  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [internalSelectedSupplier, setInternalSelectedSupplier] = useState<Supplier | null>(
    initialSupplier && initialSupplier.id === value ? initialSupplier as Supplier : null
  );

  useEffect(() => {
    if (initialSupplier && initialSupplier.id === value) {
      setInternalSelectedSupplier(initialSupplier as Supplier);
    }
  }, [initialSupplier, value]);

  useEffect(() => {
    const fetchSuppliers = async () => {
      setLoading(true);
      try {
        const data = await supplierService.getSuppliers({
          search,
          page: 1,
          per_page: 20
        });
        setSuppliers(data.items);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      const timeout = setTimeout(fetchSuppliers, 300);
      return () => clearTimeout(timeout);
    }
  }, [search, open]);

  const supplierInList = suppliers.find((s) => s.id === value);
  const displaySupplier = supplierInList || (internalSelectedSupplier?.id === value ? internalSelectedSupplier : null);

  const confirmCreate = async () => {
    if (!search) return;
    setCreating(true);
    try {
      const newSupplier = await supplierService.createSupplier({
        name: search,
        address: '',
      });
      setSuppliers((prev) => [newSupplier, ...prev]);
      setInternalSelectedSupplier(newSupplier);
      onChange(newSupplier.id);
      setOpen(false);
      setShowConfirmation(false);

      toast({
        title: "Sucesso",
        description: "Fornecedor criado com sucesso!",
        variant: "success",
      });

      setSearch("");
    } catch (e) {
      console.error("Failed to create supplier", e);
      toast({
        title: "Erro",
        description: "Falha ao criar fornecedor.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {displaySupplier
            ? displaySupplier.name
            : "Selecione..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[calc(100vw-2rem)] md:w-[300px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Ex: Supermercado Extra"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {loading && (
              <div className="p-2 text-center text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin inline mr-1" />
                Carregando...
              </div>
            )}

            {!loading && suppliers.length === 0 && !search && (
              <CommandEmpty>Nenhum fornecedor encontrado.</CommandEmpty>
            )}

            {!loading && search && !suppliers.some(s => s.name.toLowerCase() === search.toLowerCase()) && (
              <div className="p-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm"
                  onClick={() => setShowConfirmation(true)}
                  disabled={creating}
                >
                  {creating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Criar &quot;{search}&quot;
                </Button>
              </div>
            )}

            <CommandGroup>
              {suppliers.map((supplier) => (
                <CommandItem
                  key={supplier.id}
                  value={String(supplier.id)}
                  onSelect={() => {
                    setInternalSelectedSupplier(supplier);
                    onChange(supplier.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === supplier.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{supplier.name}</span>
                    {supplier.address && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {supplier.address}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Criar novo fornecedor?</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja mesmo criar o fornecedor <strong>&quot;{search}&quot;</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCreate} disabled={creating}>
              {creating ? "Criando..." : "Criar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Popover>
  );
}
