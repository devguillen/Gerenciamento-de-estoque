import { api } from './api';

export interface DashboardStats {
    totalProducts: number;
    lowStockProducts: number;
}

export interface CategoryStockItem {
    name: string;
    value: number;
    rawValue: number;
    color: string;
}

export interface StockByCategoryResponse {
    data: CategoryStockItem[];
    total: number;
}

export const dashboardService = {
    getStats: async (): Promise<DashboardStats> => {
        const response = await api.app.get<DashboardStats>('/dashboard/stats');
        return response.data;
    },

    getStockByCategory: async (): Promise<StockByCategoryResponse> => {
        const response = await api.app.get<StockByCategoryResponse>('/dashboard/stock-by-category');
        return response.data;
    },
};
