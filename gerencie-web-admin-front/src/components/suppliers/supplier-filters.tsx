"use client";

import { Input } from "@/components/ui/input";
import { Filter as FilterIcon } from "lucide-react";
import { FaSearch } from "react-icons/fa";

interface SupplierFiltersProps {
    search: string;
    onSearchChange: (value: string) => void;
}

export function SupplierFilters({
    search,
    onSearchChange
}: SupplierFiltersProps) {
    return (
        <div className="flex justify-between items-center mb-4 bg-white p-4 border rounded-md shadow-sm">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-emerald-600 font-medium">
                    <FilterIcon className="h-4 w-4" /> Filtros:
                </div>
                {/* If we had more filters like 'Scope', we would put them here similar to CategoryFilters */}
                <span className="text-sm text-muted-foreground">Nome</span>
            </div>

            <div className="flex items-center gap-2 border px-3 py-2 rounded-md bg-white w-1/3">
                <FaSearch className="text-gray-500" />
                <Input
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="outline-none border-0 h-auto p-0 focus-visible:ring-0"
                    placeholder="Pesquisar fornecedor..."
                />
            </div>
        </div>
    );
}
