
export interface PurchaseItemRequest {
    account_product_id: number;
    product_id?: number; // Should be sent when account_product_id is 0
    quantity: number;
    item_total_price: number;
}

export interface CreatePurchaseRequest {
    occurred_at: string; // ISO Date String
    supplier_id: number | null;
    notes?: string;
    currency: string;
    total_amount: number | null; // Optional validation or calculated backend
    items: PurchaseItemRequest[];
}
