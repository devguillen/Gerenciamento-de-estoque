"use client";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { categoryService } from "@/services/categoryService";
import { Category } from "@/types/res/CategoryResponse";
import { Check, ChevronsUpDown, Filter as FilterIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";

interface ProductFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedCategories: number[];
  onCategoriesChange: (ids: number[]) => void;
}

export function ProductFilters({
  search,
  onSearchChange,
  selectedCategories,
  onCategoriesChange
}: ProductFiltersProps) {
  
  // Category Async Logic
  const [openCombobox, setOpenCombobox] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    // Basic debounce for category search inside the combobox?
    // Or just load top 50 categories initially and filter locally?
    // User requested "pagination legal para procurar as categorias".
    // For simplicity V1, let's fetch first page of categories sorted by name.
    // If strict search needed, we'd need a useEffect on `categorySearch` to refetch.
    
    // Let's implement dynamic fetch
    const fetchCats = async () => {
        setLoadingCategories(true);
        try {
            const data = await categoryService.getCategories({
                page: 1,
                per_page: 50,
                search: categorySearch,
                sort_by: 'category.name',
                sort_dir: 'asc'
            });
            setCategories(data.items);
        } catch (e) {
            console.error("Failed to load categories filter", e);
        } finally {
            setLoadingCategories(false);
        }
    };
    
    const timeout = setTimeout(fetchCats, 300);
    return () => clearTimeout(timeout);
  }, [categorySearch]);

  const handleSelectCategory = (id: number) => {
      if (selectedCategories.includes(id)) {
          onCategoriesChange(selectedCategories.filter(c => c !== id));
      } else {
          onCategoriesChange([...selectedCategories, id]);
      }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 bg-white p-4 border rounded-md shadow-sm gap-4">
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="flex items-center gap-2 text-emerald-600 font-medium whitespace-nowrap">
          <FilterIcon className="h-4 w-4" /> Filtros:
        </div>

        {/* Category Multi-Select Combobox */}
        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
        <PopoverTrigger asChild>
            <Button
            variant="outline"
            role="combobox"
            aria-expanded={openCombobox}
            className="w-[250px] justify-between"
            >
            {selectedCategories.length > 0
                ? `${selectedCategories.length} cat. selecionada(s)`
                : "Filtrar por Categoria..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0">
            <Command shouldFilter={false}> {/* Disable local filtering, we do server side */}
            <CommandInput 
                placeholder="Buscar categoria..." 
                value={categorySearch} 
                onValueChange={setCategorySearch} 
            />
            <CommandList>
                {loadingCategories && <div className="p-2 text-sm text-muted-foreground text-center">Carregando...</div>}
                {!loadingCategories && categories.length === 0 && (
                     <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
                )}
                <CommandGroup>
                {categories.map((category) => (
                    <CommandItem
                        key={category.id}
                        value={String(category.id)} // Value for selection logic
                        onSelect={() => handleSelectCategory(category.id)}
                    >
                    <Check
                        className={cn(
                        "mr-2 h-4 w-4",
                        selectedCategories.includes(category.id) ? "opacity-100" : "opacity-0"
                        )}
                    />
                    {category.name}
                    </CommandItem>
                ))}
                </CommandGroup>
            </CommandList>
            </Command>
        </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center gap-2 border px-3 py-2 rounded-md bg-white w-full sm:w-1/3">
        <FaSearch className="text-gray-500" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="outline-none border-0 h-auto p-0 focus-visible:ring-0"
          placeholder="Pesquisar produto ou marca..."
        />
      </div>
    </div>
  );
}
