"use client";

import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PriorityLabels } from "@/types/common";
import { Filter as FilterIcon } from "lucide-react";
import { FaSearch } from "react-icons/fa";

interface CategoryFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  priority: number | null;
  onPriorityChange: (value: string) => void;
}

export function CategoryFilters({
  search,
  onSearchChange,
  priority,
  onPriorityChange
}: CategoryFiltersProps) {
  return (
    <div className="flex justify-between items-center mb-4 bg-white p-4 border rounded-md shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-emerald-600 font-medium">
          <FilterIcon className="h-4 w-4" /> Filtros:
        </div>

        <Select
          onValueChange={onPriorityChange}
          value={priority ? String(priority) : "all"}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Prioridades</SelectItem>
            {Object.entries(PriorityLabels)
              .filter(([key]) => Number(key) !== 0) // Filter out Unconfigured
              .map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 border px-3 py-2 rounded-md bg-white w-1/3">
        <FaSearch className="text-gray-500" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="outline-none border-0 h-auto p-0 focus-visible:ring-0"
          placeholder="Pesquisar categoria..."
        />
      </div>
    </div>
  );
}
