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
  const [creating, setCreating] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [internalSelectedBrand, setInternalSelectedBrand] =
    useState<{ id: number; name: string } | null>(
      initialBrand && initialBrand.id === value ? initialBrand : null
    );

  // Sincroniza estado interno quando vem initialBrand de fora
  useEffect(() => {
    if (initialBrand && initialBrand.id === value) {
      setInternalSelectedBrand(initialBrand);
    }
  }, [initialBrand, value]);

  // Busca marcas com debounce quando o popover está aberto
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

  const confirmCreate = async () => {
    if (!search) return;
    setCreating(true);
    try {
      const newBrand = await brandService.createBrand(search);
      setBrands((prev) => [newBrand, ...prev]);
      setInternalSelectedBrand(newBrand);
      onChange(newBrand.id);
      setOpen(false);
      setShowConfirmation(false);

      toast({
        title: "Sucesso",
        description: "Marca criada com sucesso!",
        variant: "success",
      });

      setSearch("");
    } catch (e) {
      console.error("Failed to create brand", e);
      toast({
        title: "Erro",
        description: "Falha ao criar marca.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
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

            {!loading && search && !brands.some(b => b.name.toLowerCase() === search.toLowerCase()) && (
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
        </Command>
      </PopoverContent>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Criar nova marca?</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja mesmo criar a marca <strong>&quot;{search}&quot;</strong>?
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
