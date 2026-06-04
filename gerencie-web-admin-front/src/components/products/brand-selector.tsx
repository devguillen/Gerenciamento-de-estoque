"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { brandService } from "@/services/brandService";
import { Brand } from "@/types/res/BrandResponse";
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";

interface BrandSelectorProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  initialBrand?: { id: number; name: string };
}

export function BrandSelector({
  value,
  onChange,
  disabled,
  initialBrand,
}: BrandSelectorProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Add brand dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [creating, setCreating] = useState(false);

  const [internalSelectedBrand, setInternalSelectedBrand] =
    useState<{ id: number; name: string } | null>(
      initialBrand && initialBrand.id === value ? initialBrand : null
    );

  useEffect(() => {
    if (initialBrand && initialBrand.id === value) {
      setInternalSelectedBrand(initialBrand);
    }
  }, [initialBrand, value]);

  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true);
      try {
        const data = await brandService.getBrands(search);
        setBrands(data.items);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      const timeout = setTimeout(fetchBrands, 300);
      return () => clearTimeout(timeout);
    }
  }, [search, open]);

  const brandInList = brands.find((b) => b.id === value);
  const displayBrand =
    brandInList || (internalSelectedBrand?.id === value ? internalSelectedBrand : null);

  const openAddDialog = () => {
    setNewBrandName(search);
    setAddDialogOpen(true);
    setOpen(false);
  };

  const handleCreate = async () => {
    const name = newBrandName.trim();
    if (!name) return;
    setCreating(true);
    try {
      const newBrand = await brandService.createBrand(name);
      setBrands((prev) => [newBrand, ...prev]);
      setInternalSelectedBrand(newBrand);
      onChange(newBrand.id);
      setAddDialogOpen(false);
      setNewBrandName("");
      setSearch("");
      toast({ title: "Sucesso", description: "Marca criada com sucesso!", variant: "success" });
    } catch {
      toast({ title: "Erro", description: "Falha ao criar marca.", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            {displayBrand
              ? displayBrand.name
              : value
                ? `Marca ID ${value}`
                : "Selecione a marca..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Procurar marca..."
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

              {!loading && brands.length === 0 && !search && (
                <CommandEmpty>Nenhuma marca encontrada.</CommandEmpty>
              )}

              {!loading && brands.length === 0 && search && (
                <CommandEmpty>Nenhuma marca encontrada.</CommandEmpty>
              )}

              <CommandGroup>
                {brands.map((brand) => (
                  <CommandItem
                    key={brand.id}
                    value={String(brand.id)}
                    onSelect={() => {
                      setInternalSelectedBrand(brand);
                      onChange(brand.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === brand.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {brand.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <CommandSeparator />
            <div className="p-1">
              <Button
                variant="ghost"
                className="w-full justify-start text-sm text-muted-foreground hover:text-foreground"
                onClick={openAddDialog}
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar marca
              </Button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Nova Marca</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <label className="text-sm font-medium">Nome da marca</label>
            <Input
              placeholder="Ex: Nestlé, Unilever..."
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={creating || !newBrandName.trim()}>
              {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
