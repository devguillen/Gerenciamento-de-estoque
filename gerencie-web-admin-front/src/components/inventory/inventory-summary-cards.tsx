
import { cn } from "@/lib/utils";
import { InventoryStatus, InventorySummary } from "@/types/res/InventoryResponse";
import { AlertTriangle, CheckCircle, PackageOpen, TrendingUp } from "lucide-react";

interface InventorySummaryCardsProps {
  summary: InventorySummary | null;
  selectedStatus: string;
  onSelectStatus: (status: InventoryStatus | 'todos') => void;
  loading?: boolean;
}

export function InventorySummaryCards({ summary, selectedStatus, onSelectStatus, loading }: InventorySummaryCardsProps) {

  const cards = [
    {
      id: 'em_falta',
      label: 'Em falta',
      count: summary?.em_falta || 0,
      icon: PackageOpen,
      colorClass: "text-red-600",
      bgClass: "bg-red-50 border-red-100",
      indicatorColor: "bg-red-500"
    },
    {
      id: 'baixo',
      label: 'Baixo',
      count: summary?.baixo || 0,
      icon: AlertTriangle,
      colorClass: "text-amber-500", // Yellow/Orange
      bgClass: "bg-amber-50 border-amber-100",
      indicatorColor: "bg-amber-500"
    },
    {
      id: 'ok',
      label: 'Ok',
      count: summary?.ok || 0,
      icon: CheckCircle,
      colorClass: "text-green-600",
      bgClass: "bg-green-50 border-green-100",
      indicatorColor: "bg-green-500"
    },
    {
      id: 'acima',
      label: 'Acima',
      count: summary?.acima || 0,
      icon: TrendingUp,
      colorClass: "text-emerald-600",
      bgClass: "bg-emerald-50 border-emerald-100",
      indicatorColor: "bg-emerald-500"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => {
        const isSelected = selectedStatus === card.id;
        const Icon = card.icon;

        return (
          <div
            key={card.id}
            onClick={() => onSelectStatus(isSelected ? 'todos' : card.id as InventoryStatus)}
            className={cn(
              "cursor-pointer transition-all duration-200 relative overflow-hidden rounded-xl border p-4 shadow-sm",
              card.bgClass,
              isSelected ? "ring-2 ring-offset-2 ring-primary" : "hover:shadow-md"
            )}
          >
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className={cn("text-3xl font-bold mb-1", card.colorClass)}>
                  {loading ? "..." : card.count}
                </span>
                <span className={cn("text-sm font-medium opacity-80", card.colorClass)}>
                  {card.label}
                </span>
              </div>
              <Icon className={cn("h-5 w-5 opacity-60", card.colorClass)} />
            </div>

            {/* Simple decorative content or bottom bar if needed */}
          </div>
        )
      })}
    </div>
  );
}
