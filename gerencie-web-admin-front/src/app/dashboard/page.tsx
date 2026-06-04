'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardUser } from '@/app/dashboard/client-layout';
import { CategoryStockItem, dashboardService } from '@/services/dashboardService';
import {
    ChevronRight,
    ClipboardList,
    DollarSign,
    Home,
    Info,
    Package,
    TrendingDown,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';

const CustomLegend = ({ payload }: { payload: CategoryStockItem[] }) => {
    const half = Math.ceil(payload.length / 2);
    const columns = [payload.slice(0, half), payload.slice(half)];

    return (
        <div className="grid grid-cols-2 gap-x-6 text-sm text-muted-foreground">
            {columns.map((col, ci) => (
                <div key={ci} className="flex flex-col gap-2">
                    {col.map((entry) => (
                        <div key={entry.name} className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                                <span
                                    style={{ backgroundColor: entry.color, width: 10, height: 10, borderRadius: '50%', flexShrink: 0 }}
                                />
                                <span className="truncate">{entry.name}</span>
                            </div>
                            <span className="font-medium shrink-0">{entry.value}%</span>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default function DashboardHomePage() {
  const { user } = useDashboardUser();
  const [totalProducts, setTotalProducts] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState(0);
  const [categoryData, setCategoryData] = useState<CategoryStockItem[]>([]);
  const [totalStock, setTotalStock] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user?.token) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [stats, stockByCategory] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getStockByCategory(),
        ]);
        setTotalProducts(stats.totalProducts);
        setLowStockProducts(stats.lowStockProducts);
        setCategoryData(stockByCategory.data);
        setTotalStock(stockByCategory.total);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user]);

  const stats = [
    {
      title: 'Produtos cadastrados',
      value: totalProducts,
      icon: <Package className="h-7 w-7 text-primary-foreground" />,
      iconBg: 'bg-gray-800',
    },
    {
      title: 'Produtos em baixa',
      value: lowStockProducts,
      icon: <TrendingDown className="h-7 w-7 text-primary-foreground" />,
      iconBg: 'bg-purple-600',
    },
    {
      title: 'Itens em estoque',
      value: totalStock,
      icon: <DollarSign className="h-7 w-7 text-primary-foreground" />,
      iconBg: 'bg-yellow-500',
    },
    {
      title: 'Categorias ativas',
      value: categoryData.length,
      icon: <ClipboardList className="h-7 w-7 text-primary-foreground" />,
      iconBg: 'bg-emerald-500',
    },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50/50">
      <div className="flex flex-col mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Home className="h-4 w-4" />
            <ChevronRight className="h-4 w-4" />
            <span>Home</span>
        </div>
        <h1 className="text-3xl font-bold">Home</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex flex-col space-y-2">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    {loading ? (
                        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
                    ) : (
                        <p className="text-3xl font-bold">{stat.value}</p>
                    )}
                </div>
                <div className={`p-3 rounded-lg ${stat.iconBg}`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-medium">Estoque por categoria</CardTitle>
          <Info className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground">Carregando...</div>
          ) : categoryData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              Nenhum produto em estoque ainda.
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative flex items-center justify-center shrink-0">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      labelLine={false}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string, props: any) => [
                        `${props.payload.rawValue} unid. (${value}%)`,
                        name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold">{totalStock}</span>
                  <span className="text-xs text-muted-foreground">unidades</span>
                </div>
              </div>
              <div className="flex-1 w-full">
                <CustomLegend payload={categoryData} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
