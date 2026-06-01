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
    getBrands: async (search?: string, page: number = 1): Promise<PaginatedBrandResponse> => {
        const response = await api.app.get<PaginatedBrandResponse>('/brand', {
            params: {
                search,
                page,
                per_page: 20 // Default reasonable limit for dropdowns
            }
        });
        return response.data;
    },

    createBrand: async (name: string): Promise<Brand> => {
        // API documentation says POST /brand returns... actually it likely returns the created brand object or at least ID.
        // Assuming it returns the created Brand object based on typical patterns, but checking doc:
        // "Insere uma nova marca para a conta... Example Value Schema { name: string }" -> Response schema usually mirrors resource.
        // Let's assume it returns the Brand.
        const response = await api.app.post<Brand>('/brand', { name });
        return response.data;
    }
};
