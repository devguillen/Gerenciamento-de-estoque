import { api } from './api';

export interface DashboardStats {
    totalProducts: number;
    lowStockProducts: number;
}

export const dashboardService = {
    getStats: async (): Promise<DashboardStats> => {
        const response = await api.app.get<DashboardStats>('/dashboard/stats');
        return response.data;
    },
};
