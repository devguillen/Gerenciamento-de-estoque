import { CreatePurchaseRequest } from "@/types/req/CreatePurchaseRequest";
import { PurchaseResponse } from "@/types/res/PurchaseResponse";
import { api } from "./api";

export const purchaseService = {
    createPurchase: async (data: CreatePurchaseRequest): Promise<PurchaseResponse> => {
        const response = await api.app.post<PurchaseResponse>('/purchase', data);
        return response.data;
    }
};
