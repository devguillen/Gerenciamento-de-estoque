import { GetSuppliersRequest } from "@/types/req/GetSuppliersRequest";
import { CreateSupplierRequest, UpdateSupplierRequest } from "@/types/req/SupplierMutationRequest";
import { Supplier } from "@/types/res/SupplierResponse";
import { PaginatedResponse } from "@/types/res/PaginatedResponse";
import { api } from "./api";

export const supplierService = {
    getSuppliers: async (params: GetSuppliersRequest): Promise<PaginatedResponse<Supplier>> => {
        const response = await api.app.get<PaginatedResponse<Supplier>>('/account/suppliers', {
            params: {
                ...params,
                page: params.page || 1,
                per_page: params.per_page || 10,
                scope: params.scope || 'all',
                search: params.search,
                sort_by: params.sort_by || 'created_at',
                sort_dir: params.sort_dir || 'desc'
            }
        });
        return response.data;
    },

    updateSupplier: async (id: number, payload: Omit<UpdateSupplierRequest, 'id'>): Promise<Supplier> => {
        // According to instructions, PATCH /suppliers takes the ID in the body
        const response = await api.app.patch<Supplier>('/suppliers', {
            suppliers_id: id,
            ...payload,
            address: payload.address === "" ? null : payload.address,
            adress: payload.address === "" ? null : payload.address
        });
        return response.data;
    },

    createSupplier: async (payload: CreateSupplierRequest): Promise<Supplier> => {
        const response = await api.app.post<Supplier>('/suppliers', {
            ...payload,
            adress: payload.address
        });
        return response.data;
    },

    deleteSupplier: async (id: number): Promise<void> => {
        await api.app.delete('/suppliers', {
            data: { suppliers_id: id }
        });
    }
};


