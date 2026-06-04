import { Brand } from "@/types/res/BrandResponse";
import { api } from "./api";

export interface PaginatedBrandResponse {
    itemsReceived: number;
    curPage: number;
    nextPage: number | null;
    prevPage: number | null;
    offset: number;
    perPage: number;
    items: Brand[];
}

export const brandService = {
    getBrands: async (search?: string, page: number = 1, perPage: number = 20): Promise<PaginatedBrandResponse> => {
        const response = await api.app.get<PaginatedBrandResponse>('/brand', {
            params: { search, page, per_page: perPage }
        });
        return response.data;
    },

    createBrand: async (name: string): Promise<Brand> => {
        const response = await api.app.post<Brand>('/brand', { name });
        return response.data;
    },

    updateBrand: async (id: number, name: string): Promise<Brand> => {
        const response = await api.app.patch<Brand>(`/brand/${id}`, { name });
        return response.data;
    },

    deleteBrand: async (id: number): Promise<void> => {
        await api.app.delete(`/brand/${id}`);
    },
};
