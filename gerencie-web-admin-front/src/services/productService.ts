import { GetProductsRequest } from "@/types/req/GetProductsRequest";
import { ProductMutationRequest } from "@/types/req/ProductMutationRequest";
import { PaginatedProductResponse, Product } from "@/types/res/ProductResponse";
import { api } from "./api";

export const productService = {
    getProducts: async (params: GetProductsRequest): Promise<PaginatedProductResponse> => {
        const response = await api.app.get<PaginatedProductResponse>('/account/products', {
            params: params
        });
        return response.data;
    },

    getProductById: async (id: number): Promise<Product> => {
        const response = await api.app.get<Product>(`/product/${id}`);
        return response.data;
    },

    updateProduct: async (id: number, data: ProductMutationRequest): Promise<void> => {
        await api.app.patch(`/product/${id}`, data);
    },

    createProduct: async (data: ProductMutationRequest): Promise<Product> => {
        const response = await api.app.post<Product>('/product', data);
        return response.data;
    },

    deleteProduct: async (id: number): Promise<void> => {
        await api.app.delete(`/product/${id}`);
    }
};
