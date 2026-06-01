"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PriorityLabels } from "@/types/common";
import { CategorySortField } from "@/types/req/CategoryRequest";
import { Category } from "@/types/res/CategoryResponse";
import { ArrowDown, ArrowUp, Globe, Loader2, User } from "lucide-react";
import { FaEdit, FaTrash } from "react-icons/fa";

interface CategoryTableProps {
  categories: Category[];
  isLoading: boolean;
  sortBy: CategorySortField;
  sortDir: 'asc' | 'desc';
  onSort: (field: CategorySortField) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onConfigure: (category: Category) => void;
}

export function CategoryTable({
  categories,
  isLoading,
  sortBy,
  sortDir,
  onSort,
  onEdit,
  onDelete,
  onConfigure
}: CategoryTableProps) {
  
  const getSortIcon = (field: CategorySortField) => {
    if (sortBy !== field) return null;
    return sortDir === "asc" ? (
      <ArrowUp className="ml-1 h-3 w-3" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3" />
    );
  };

  return (
    <div className="bg-white border rounded-md shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th
              className="text-left p-3 font-medium cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => onSort("category.name")}
            >
              <div className="flex items-center">
                Categoria {getSortIcon("category.name")}
              </div>
            </th>
            <th
              className="text-left p-3 font-medium cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => onSort("priority_sort")}
            >
              <div className="flex items-center">
                Prioridade {getSortIcon("priority_sort")}
              </div>
            </th>
            <th className="w-20 text-center font-medium">Ações</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={3} className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              </td>
            </tr>
          ) : categories.length === 0 ? (
            <tr>
              <td colSpan={3} className="p-8 text-center text-muted-foreground">
                Nenhuma categoria encontrada.
              </td>
            </tr>
          ) : (
            categories.map((c) => (
              <tr
                key={c.id}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          {c.owner_account_id === 0 ? (
                            <Globe className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <User className="h-3.5 w-3.5 text-green-600" />
                          )}
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{c.owner_account_id === 0 ? "Categoria do Sistema" : "Minha Categoria"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <span className="font-medium">{c.name}</span>
                  </div>
                </td>
                <td className="p-3">
                  <Badge
                    className={`${
                      c.priority_sort >= 4
                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                        : c.priority_sort === 3
                        ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                        : c.priority_sort === 2
                        ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                        : c.priority_sort === 0
                        ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    } border-none`}
                  >
                    {PriorityLabels[c.priority_sort] || "Baixa"}
                  </Badge>
                </td>
                <td className="p-3 text-center text-muted-foreground text-sm flex justify-center gap-2">
                  {c.priority_sort === 0 ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => onConfigure(c)}
                    >
                      Configurar
                    </Button>
                  ) : (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => onEdit(c)}
                      >
                        <FaEdit className="h-4 w-4 text-gray-500 hover:text-emerald-600" />
                      </Button>
                      {(c.owner_account_id !== 0 || c.account_category) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => onDelete(c)}
                        >
                          <FaTrash className="h-4 w-4 text-gray-500 hover:text-red-600" />
                        </Button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
