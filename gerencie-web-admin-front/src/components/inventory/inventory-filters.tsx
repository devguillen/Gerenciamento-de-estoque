
"use client";

import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { categoryService } from "@/services/categoryService";
import { Category } from "@/types/res/CategoryResponse";
import { Check, Filter as FilterIcon, Search } from "lucide-react";
import { useEffect, useState } from "react";

interface InventoryFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  
  status: string;
  onStatusChange: (value: string) => void;

  selectedCategories: number[];
  onCategoriesChange: (ids: number[]) => void;
}

export function InventoryFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  selectedCategories,
  onCategoriesChange
}: InventoryFiltersProps) {

  // Category Logic
  const [openCombobox, setOpenCombobox] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
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
    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
      {/* Search */}
      <div className="relative w-full sm:w-1/2">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-white border-gray-200"
          placeholder="Pesquisar produto ou marca..."
        />
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        {/* Status Select */}
        <Select value={status} onValueChange={onStatusChange}>
           <SelectTrigger className="w-[180px] bg-white">
             <SelectValue placeholder="Status" />
           </SelectTrigger>
           <SelectContent>
             <SelectItem value="todos">Todas</SelectItem>
             <SelectItem value="em_falta">Em falta</SelectItem>
             <SelectItem value="baixo">Baixo</SelectItem>
             <SelectItem value="ok">Ok</SelectItem>
             <SelectItem value="acima">Acima</SelectItem>
             <SelectItem value="sem_meta">Sem meta</SelectItem>
           </SelectContent>
        </Select>

        {/* Categories "Filtros" Button */}
        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center bg-white gap-2">
                    <FilterIcon className="h-4 w-4" />
                    <span>Filtros</span>
                    {selectedCategories.length > 0 && (
                        <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {selectedCategories.length}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0" align="end">
                <Command shouldFilter={false}>
                    <CommandInput 
                        placeholder="Buscar categoria..." 
                        value={categorySearch} 
                        onValueChange={setCategorySearch} 
                    />
                    <CommandList>
                        {loadingCategories && <div className="p-2 text-sm text-center">Carregando...</div>}
                        <CommandGroup>
                        {categories.map((category) => (
                            <CommandItem
                                key={category.id}
                                value={String(category.id)}
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
    </div>
  );
}
