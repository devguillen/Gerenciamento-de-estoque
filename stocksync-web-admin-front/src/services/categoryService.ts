import { GetCategoriesRequest } from "@/types/req/CategoryRequest";
import { CreateCategoryRequest } from "@/types/req/CreateCategoryRequest";
import { UpdateCategoryRequest } from "@/types/req/UpdateCategoryRequest";
import { Category } from "@/types/res/CategoryResponse";
import { PaginatedResponse } from "@/types/res/PaginatedResponse";
import { api } from "./api";

export const categoryService = {
    getCategories: async (params: GetCategoriesRequest): Promise<PaginatedResponse<Category>> => {
        // We accept the params and pass them as query params to the endpoint
        // Assuming the endpoint is '/category' based on typical REST/Xano patterns, 
        // or we can clarify if it's different. Given the user didn't specify the EXACT endpoint URL 
        // but gave strict input/outputs, we'll try '/category'. 
        // If the legacy code had '/category', we stick to it.
        const response = await api.app.get<PaginatedResponse<Category>>('/account/categories', {
            params: {
                ...params,
                // Ensure defaults if not provided, though the type allows optionals
                page: params.page || 1,
                per_page: params.per_page || 10,
                scope: params.scope || 'all',
                sort_by: params.sort_by || 'category.priority_sort',
                sort_dir: params.sort_dir || 'desc'
            }
        });
        return response.data;
    },

    updateCategory: async (id: number, payload: UpdateCategoryRequest): Promise<Category> => {
        const response = await api.app.patch<Category>(`/category/${id}`, payload);
        return response.data;
    },

    createCategory: async (payload: CreateCategoryRequest): Promise<Category> => {
        const response = await api.app.post<Category>('/category', payload);
        return response.data;
    },

    deleteCategory: async (id: number): Promise<void> => {
        await api.app.delete(`/category/${id}`);
    }
};
