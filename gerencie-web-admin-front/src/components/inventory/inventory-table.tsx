
"use client";

import { Badge } from "@/components/ui/badge";
import { formatQuantity } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getStockMovementLabel } from "@/constants/stock-movement";
import { InventoryItem, InventoryStatus } from "@/types/res/InventoryResponse";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowUpDown, MoreHorizontal, Package } from "lucide-react";
import Link from "next/link";



interface InventoryTableProps {
  items: InventoryItem[];
  isLoading: boolean;
  sortBy?: string;
  onSort: (field: any) => void;
  onEdit?: (item: InventoryItem) => void;
  onManualAdjustment?: (item: InventoryItem) => void;
  onConsumption?: (item: InventoryItem) => void;
}

export function InventoryTable({
  items,
  isLoading,
  sortBy,
  onSort,
  onEdit,
  onManualAdjustment,
  onConsumption
}: InventoryTableProps) {
  // ...


  const resolveStatusBadge = (status: InventoryStatus) => {
    switch (status) {
      case 'em_falta': return <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200">Em falta</Badge>;
      case 'baixo': return <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-200">Baixo</Badge>;
      case 'ok': return <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-200">Ok</Badge>;
      case 'acima': return <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200">Acima</Badge>;
      case 'sem_meta': return <Badge variant="outline" className="text-gray-500">Sem meta</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatMovementTime = (date: string | null) => {
    if (!date) return "-";
    try {
      return `há ${formatDistanceToNow(new Date(date), { locale: ptBR })}`;
    } catch {
      return "-";
    }
  };

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[350px] px-6 py-4 cursor-pointer" onClick={() => onSort('name')}>
              <div className="flex items-center gap-1">
                Produto
                {sortBy === 'name' && <ArrowUpDown className="h-4 w-4" />}
              </div>
            </TableHead>
            <TableHead className="px-6 py-4">Categoria</TableHead>
            <TableHead className="px-6 py-4 cursor-pointer" onClick={() => onSort('quantity')}>
              <div className="flex items-center gap-1">
                Disponível
                {sortBy === 'quantity' && <ArrowUpDown className="h-4 w-4" />}
              </div>
            </TableHead>
            <TableHead className="px-6 py-4">Meta</TableHead>
            <TableHead className="px-6 py-4 cursor-pointer" onClick={() => onSort('urgency')}>
              <div className="flex items-center gap-1">
                Status
                {sortBy === 'urgency' && <ArrowUpDown className="h-4 w-4" />}
              </div>
            </TableHead>
            <TableHead className="px-6 py-4 cursor-pointer" onClick={() => onSort('last_movement')}>
              <div className="flex items-center gap-1">
                Última mov.
                {sortBy === 'last_movement' && <ArrowUpDown className="h-4 w-4" />}
              </div>
            </TableHead>
            <TableHead className="text-right px-6 py-4">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="h-64 text-center">
                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p>Carregando estoque...</p>
                </div>
              </TableCell>
            </TableRow>
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-96 text-center">
                <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
                  <div className="bg-gray-50 p-6 rounded-full mb-4">
                    <Package className="h-12 w-12 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum item encontrado</h3>
                  <p className="text-gray-500 max-w-sm mx-auto">
                    Não encontramos produtos que correspondam à sua busca ou filtros.
                    Tente ajustar os critérios ou registre uma nova compra.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{item.display_name}</span>
                    <span className="text-sm text-gray-500">{item.brand_name}</span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {item.categories.slice(0, 2).map(cat => (
                      <Badge key={cat.id} variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                        {cat.name}
                      </Badge>
                    ))}
                    {item.categories.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{item.categories.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <span className="font-bold">{formatQuantity(Number(item.quantity))}</span> <span className="text-gray-500 text-sm">{item.unit_type}(s)</span>
                </TableCell>
                <TableCell className="px-6 py-4">
                  {item.min_limit !== null || item.max_limit !== null ? (
                    <span className="text-sm text-gray-600">
                      {item.min_limit ?? "?"} – {item.max_limit ?? "?"}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">-</span>
                  )}
                </TableCell>
                <TableCell className="px-6 py-4">
                  {resolveStatusBadge(item.status)}
                </TableCell>
                <TableCell className="px-6 py-4">
                  <div className="flex flex-col text-sm">
                    {item.last_movement_type && (
                      <span className="text-gray-700">{getStockMovementLabel(item.last_movement_type)}</span>
                    )}
                    <span className="text-gray-400 text-xs">{formatMovementTime(item.last_movement_occurred_at)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right px-6 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit?.(item)}>
                          Ver detalhes / Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onConsumption?.(item)}>
                          Registrar consumo
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onManualAdjustment?.(item)}>
                          Ajustar estoque
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/estoque/historico?product_id=${item.product_id}`} className="w-full cursor-pointer">
                            Ver histórico
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
