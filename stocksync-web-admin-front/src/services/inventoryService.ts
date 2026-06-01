import { GetInventoryRequest } from "@/types/req/GetInventoryRequest";
import { InventorySummary, PaginatedInventoryResponse } from "@/types/res/InventoryResponse";
import { api } from "./api";

import { GetStockMovementsRequest } from "@/types/req/GetStockMovementsRequest";
import { PaginatedStockMovementResponse } from "@/types/res/StockMovementResponse";

export const inventoryService = {
    getInventory: async (params: GetInventoryRequest): Promise<PaginatedInventoryResponse> => {
        const response = await api.app.get<PaginatedInventoryResponse>('/account/inventory', {
            params: params,
        });

        const items = response.data.items.map(item => ({
            ...item,
            categories: typeof item.categories === 'string'
                ? JSON.parse(item.categories as any)
                : item.categories
        }));

        return {
            ...response.data,
            items
        };
    },

    getSummary: async (): Promise<InventorySummary> => {
        const response = await api.app.get<InventorySummary>('/inventory/summary');
        return response.data;
    },

    getStockMovements: async (params: GetStockMovementsRequest): Promise<PaginatedStockMovementResponse> => {
        const response = await api.app.get<PaginatedStockMovementResponse>('/account/stock_movements', {
            params
        });
        if (response.data && response.data.items) {
            const items = response.data.items.map(item => ({
                ...item,
                categories: typeof item.categories === 'string'
                    ? JSON.parse(item.categories as any)
                    : item.categories
            }));
            return {
                ...response.data,
                items
            };
        }
        return response.data;
    },

    adjustStock: async (data: { account_product_id: number, quantity: number, motive: string }): Promise<void> => {
        await api.app.post('/adjustment', data);
    },
    consumptionStock: async (data: { account_product_id: number, quantity: number, motive?: string }): Promise<void> => {
        await api.app.post('/consumption', data);
    }
};
