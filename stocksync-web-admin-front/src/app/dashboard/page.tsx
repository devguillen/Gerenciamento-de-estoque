'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardUser } from '@/app/dashboard/client-layout';
import { dashboardService } from '@/services/dashboardService';
import {
    ChevronRight,
    ClipboardList,
    Clock,
    DollarSign,
    Home,
    Info,
    Package,
    TrendingDown,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

// Mock Data for charts
const lineChartData = [
  { name: 'Fev', value: 200 },
  { name: 'Mar', value: 280 },
  { name: 'Abr', value: 450 },
  { name: 'Mai', value: 400 },
  { name: 'Jun', value: 500 },
  { name: 'Jul', value: 480 },
  { name: 'Ago', value: 420 },
  { name: 'Set', value: 480 },
  { name: 'Out', value: 550 },
];

const pieChartData = [
    { name: 'Alimentos básicos', value: 15, color: '#f43f5e' },
    { name: 'Biscoitos/Salgadinhos', value: 20, color: '#1f2937' },
    { name: 'Carnes/Aves/Peixes', value: 13, color: '#2dd4bf' },
    { name: 'Congelados', value: 32, color: '#3b82f6' },
    { name: 'Feira', value: 20, color: '#f97316' },
    { name: 'Frios', value: 2, color: '#14b8a6' },
    { name: 'Higiene/Beleza', value: 10, color: '#ef4444' },
    { name: 'Limpeza', value: 5, color: '#a855f7' },
    { name: 'Matinais', value: 7, color: '#eab308' },
    { name: 'Molhos/Condimentos/Conservas', value: 3, color: '#4f46e5' },
];

const CustomLegend = (props: any) => {
    const { payload } = props;
    const columns = Math.ceil(payload.length / 5);
    const itemsPerColumn = 5;

    return (
        <div className="grid grid-cols-2 gap-x-8 text-sm text-muted-foreground">
            {Array.from({ length: columns }).map((_, colIndex) => (
                <div key={`col-${colIndex}`} className="flex flex-col gap-2">
                    {payload.slice(colIndex * itemsPerColumn, (colIndex + 1) * itemsPerColumn).map((entry: any, index: number) => (
                        <div key={`item-${index}`} className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                <span style={{ backgroundColor: entry.color, width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block' }} />
                                <span>{entry.value}</span>
                            </div>
                            <span>{`${entry.payload?.payload?.value}%`}</span>
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user?.token) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const stats = await dashboardService.getStats();
        setTotalProducts(stats.totalProducts);
        setLowStockProducts(stats.lowStockProducts);
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
      change: '+55%',
      changeText: 'que o mês anterior',
      changeColor: 'text-green-600'
    },
    {
      title: 'Produtos em baixa',
      value: lowStockProducts,
      icon: <TrendingDown className="h-7 w-7 text-primary-foreground" />,
      iconBg: 'bg-purple-600',
      change: '+3%',
      changeText: 'que a semana passada',
      changeColor: 'text-green-600'
    },
    {
      title: 'Valor em estoque',
      value: 'R$ 104,97',
      icon: <DollarSign className="h-7 w-7 text-primary-foreground" />,
      iconBg: 'bg-yellow-500',
      change: '+1%',
      changeText: 'que o mês anterior',
      changeColor: 'text-green-600'
    },
    {
      title: 'Custo do repositório',
      value: 'R$ 148,30',
      icon: <ClipboardList className="h-7 w-7 text-primary-foreground" />,
      iconBg: 'bg-emerald-500',
      description: '6 itens pendentes',
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

       <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
            <div className="p-1 bg-emerald-100 rounded-full">
                <Info className="h-5 w-5 text-emerald-700" />
            </div>
            <div>
                <h3 className="font-semibold text-emerald-900">Dashboard conectada à API</h3>
                <p className="text-emerald-800 text-sm mt-1">
                    Os cards de produtos usam dados reais do backend. Gráficos e histórico continuam em modo demonstração até a próxima etapa.
                </p>
            </div>
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
              {stat.change && (
                  <div className="flex items-center gap-1 text-sm mt-4">
                      <span className={stat.changeColor}>{stat.change}</span>
                      <span className="text-muted-foreground">{stat.changeText}</span>
                  </div>
              )}
              {stat.description && <p className="text-sm text-muted-foreground mt-4">{stat.description}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
            <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base font-medium">Gasto por categoria de produto</CardTitle>
                    <Info className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row items-center gap-4">
                    <div className="w-1/2 relative flex items-center justify-center">
                         <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} labelLine={false}>
                                    {pieChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold">R$ 148,30</span>
                            <span className="text-sm text-muted-foreground">TOTAL</span>
                        </div>
                    </div>
                    <div className="w-full md:w-1/2">
                       <CustomLegend payload={pieChartData} />
                    </div>
                </CardContent>
            </Card>
            <Card className="lg:col-span-3">
                 <CardContent className="p-6 h-full">
                     <ResponsiveContainer width="100%" height={300}>
                         <LineChart data={lineChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} />
                             <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                             <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                             <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '0.5rem',
                                    fontSize: '12px'
                                }}
                                labelStyle={{ fontWeight: 'bold' }}
                             />
                             <Line type="monotone" dataKey="value" stroke="#1f2937" strokeWidth={2} dot={{ r: 5, fill: '#1f2937' }} activeDot={{ r: 7 }} />
                         </LineChart>
                     </ResponsiveContainer>
                 </CardContent>
            </Card>
        </div>
      
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-medium">Histórico de consumo dos últimos 6 meses</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    <span className="text-green-600 font-semibold">(+15%)</span> de aumento em relação a Fevereiro.
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-12">
                    <Clock className="h-3 w-3" />
                    <span>atualizado 4 min atrás</span>
                </div>
            </CardContent>
        </Card>

    </div>
  );
}
