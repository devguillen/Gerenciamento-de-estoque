"use client";

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
import { cn } from "@/lib/utils";
import { categoryService } from "@/services/categoryService";
import { Category } from "@/types/res/CategoryResponse";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface CategorySelectorProps {
  value: number[];
  onChange: (value: number[]) => void;
  disabled?: boolean;
}

export function CategorySelector({ value, onChange, disabled }: CategorySelectorProps) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchCats = async () => {
        setLoading(true);
        try {
            const data = await categoryService.getCategories({
                page: 1,
                per_page: 50,
                search: search,
                sort_by: 'category.name',
                sort_dir: 'asc'
            });
            setCategories(data.items);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    
    const timeout = setTimeout(fetchCats, 300);
    return () => clearTimeout(timeout);
  }, [search, open]);

  const handleSelect = (id: number) => {
      if (value.includes(id)) {
          onChange(value.filter(v => v !== id));
      } else {
          onChange([...value, id]);
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
          {value.length > 0 ? `${value.length} selecionada(s)` : "Selecione categorias..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Procurar categoria..." value={search} onValueChange={setSearch} />
          <CommandList>
             {loading && <div className="p-2 text-center text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin inline mr-1"/> Carregando...</div>}
             {!loading && categories.length === 0 && <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>}
            <CommandGroup>
              {categories.map((cat) => (
                <CommandItem
                  key={cat.id}
                  value={String(cat.id)}
                  onSelect={() => handleSelect(cat.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.includes(cat.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {cat.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
