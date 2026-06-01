"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Supplier } from "@/types/res/SupplierResponse";
import { ArrowDown, ArrowUp, Globe, Loader2, User, MapPin } from "lucide-react";
import { FaEdit, FaTrash } from "react-icons/fa";

interface SupplierTableProps {
    suppliers: Supplier[];
    isLoading: boolean;
    sortBy: string;
    sortDir: 'asc' | 'desc';
    onSort: (field: string) => void;
    onEdit: (supplier: Supplier) => void;
    onDelete: (supplier: Supplier) => void;
}

export function SupplierTable({
    suppliers,
    isLoading,
    sortBy,
    sortDir,
    onSort,
    onEdit,
    onDelete
}: SupplierTableProps) {

    const getSortIcon = (field: string) => {
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
                            onClick={() => onSort('name')}
                        >
                            <div className="flex items-center">
                                Fornecedor {getSortIcon('name')}
                                {/* Sorting by name might be preferred but API default is often ID/created_at. 
                    I'll stick to generic sort or created_at unless name is supported. 
                    User didn't specify sort field behavior, assuming created_at or name */}
                            </div>
                        </th>
                        <th className="text-left p-3 font-medium">
                            <div className="flex items-center">
                                Endereço
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
                    ) : suppliers.length === 0 ? (
                        <tr>
                            <td colSpan={3} className="p-8 text-center text-muted-foreground">
                                Nenhum fornecedor encontrado.
                            </td>
                        </tr>
                    ) : (
                        suppliers.map((s) => (
                            <tr
                                key={s.id}
                                className="border-b hover:bg-gray-50 transition-colors"
                            >
                                <td className="p-3">
                                    <div className="flex items-center gap-2">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    {s.owner_account_id === 0 ? (
                                                        <Globe className="h-3.5 w-3.5 text-emerald-500" />
                                                    ) : (
                                                        <User className="h-3.5 w-3.5 text-green-600" />
                                                    )}
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{s.owner_account_id === 0 ? "Fornecedor do Sistema" : "Meu Fornecedor"}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                        <span className="font-medium">{s.name}</span>
                                    </div>
                                </td>
                                <td className="p-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        {s.address ? (
                                            <>
                                                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                                {s.address}
                                            </>
                                        ) : (
                                            <span className="text-gray-400 italic">N/A</span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-3 text-center text-muted-foreground text-sm flex justify-center gap-2">
                                    <div className="flex gap-1">
                                        {/* Only allow actions if it matches "mine" criteria (owner_account_id != 0) */}
                                        {s.owner_account_id !== 0 ? (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={() => onEdit(s)}
                                                >
                                                    <FaEdit className="h-4 w-4 text-gray-500 hover:text-emerald-600" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={() => onDelete(s)}
                                                >
                                                    <FaTrash className="h-4 w-4 text-gray-500 hover:text-red-600" />
                                                </Button>
                                            </>
                                        ) : (
                                            <span className="text-xs text-gray-400 px-2 py-1">Sistema</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
