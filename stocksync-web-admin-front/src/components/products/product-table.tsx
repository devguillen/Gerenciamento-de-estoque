"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SortDirection } from "@/types/common";
import { ProductSortField } from "@/types/req/GetProductsRequest";
import { Product, ProductCategory } from "@/types/res/ProductResponse";
import { ArrowDown, ArrowUp, Globe, Loader2, Plus, User } from "lucide-react";
import { FaEdit, FaTrash } from "react-icons/fa";

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  sortBy: ProductSortField;
  sortDir: SortDirection;
  onSort: (field: ProductSortField) => void;
  onConfigure: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductTable({
  products,
  isLoading,
  sortBy,
  sortDir,
  onSort,
  onConfigure,
  onEdit,
  onDelete
}: ProductTableProps) {
  
  const getSortIcon = (field: ProductSortField) => {
    if (sortBy !== field) return null;
    return sortDir === "asc" ? (
      <ArrowUp className="ml-1 h-3 w-3" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3" />
    );
  };

  const getLimitValue = (p: Product, type: 'min' | 'max') => {
      const val = p.account_product ? (type === 'min' ? p.account_product.min_limit : p.account_product.max_limit) : (type === 'min' ? p.min_limit : p.max_limit);
      return val;
  };

  const isConfigured = (p: Product) => {
      return !!p.account_product;
  }

  return (
    <div className="bg-white border rounded-md shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th
              className="text-left p-3 font-medium cursor-pointer hover:bg-gray-100 transition-colors w-1/3"
              onClick={() => onSort("product.name")}
            >
              <div className="flex items-center">
                Produto {getSortIcon("product.name")}
              </div>
            </th>
            <th
              className="text-left p-3 font-medium cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => onSort("brand.name")}
            >
              <div className="flex items-center">
                Marca {getSortIcon("brand.name")}
              </div>
            </th>
             <th
              className="text-left p-3 font-medium"
            >
              Categorias
            </th>
            <th
              className="text-center p-3 font-medium cursor-pointer hover:bg-gray-100 transition-colors w-24"
              onClick={() => onSort("min_limit")}
            >
               <div className="flex items-center justify-center">
                Min {getSortIcon("min_limit")}
              </div>
            </th>
            <th
              className="text-center p-3 font-medium cursor-pointer hover:bg-gray-100 transition-colors w-24"
              onClick={() => onSort("max_limit")}
            >
               <div className="flex items-center justify-center">
                Max {getSortIcon("max_limit")}
              </div>
            </th>
            <th className="w-20 text-center font-medium">Ações</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={6} className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              </td>
            </tr>
          ) : products.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-8 text-center text-muted-foreground">
                Nenhum produto encontrado.
              </td>
            </tr>
          ) : (
            products.map((p) => {
              const configured = isConfigured(p);
              return (
              <tr
                key={p.id}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="p-3">
                    <div className="flex items-center gap-2">
                         <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                     {p.owner_account_id === 0 ? (
                                        <Globe className="h-3.5 w-3.5 text-emerald-500" />
                                    ) : (
                                        <User className="h-3.5 w-3.5 text-green-600" />
                                    )}
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{p.owner_account_id === 0 ? "Produto do Sistema" : "Meu Produto"}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                       
                        <div>
                            <div className="font-medium">{p.account_product?.custom_name || p.name}</div>
                            {p.unit_type && <div className="text-xs text-muted-foreground uppercase">{p.unit_type}</div>}
                        </div>
                    </div>
                </td>
                <td className="p-3 text-sm text-gray-700">{p.brand.name}</td>
                <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                        {p.product_categories.map((pc: ProductCategory) => (
                            <Badge key={pc.id} variant="secondary" className="text-xs font-normal">
                                {pc.category.name}
                            </Badge>
                        ))}
                    </div>
                </td>
                <td className="p-3 text-center">
                    {configured ? (
                        <div className="font-medium text-gray-700">
                             {getLimitValue(p, 'min')}
                        </div>
                    ) : (
                         <span className="text-gray-300">-</span>
                    )}
                </td>
                <td className="p-3 text-center">
                    {configured ? (
                        <div className="font-medium text-gray-700">
                             {getLimitValue(p, 'max')}
                        </div>
                    ) : (
                         <span className="text-gray-300">-</span>
                    )}
                </td>
                <td className="p-3 text-center text-muted-foreground text-sm flex justify-center gap-2">
                    {!configured ? (
                          <Button 
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs flex items-center gap-1 border-emerald-200 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
                            onClick={() => onConfigure(p)}
                        >
                            <Plus className="h-3 w-3" /> Adicionar
                        </Button>
                    ) : (
                        <>
                             <Button 
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                title="Editar limites"
                                onClick={() => onConfigure(p)}
                            >
                                <FaEdit className="h-4 w-4 text-gray-500 hover:text-emerald-600" />
                            </Button>

                            {(p.owner_account_id !== 0 || configured) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => onDelete(p)}
                                >
                                    <FaTrash className="h-4 w-4 text-gray-500 hover:text-red-600" />
                                </Button>
                            )}
                        </>
                    )}
                </td>
              </tr>
            )})
          )}
        </tbody>
      </table>
    </div>
  );
}
