
export interface Purchase {
    id: number;
    created_at: number;
    account_id: number;
    occurred_at: number;
    supplier_id: number;
    notes: string;
    total_amount: number;
    currency: string;
    created_by_user_id: number;
}

export interface UpdatedItem {
    account_product_id: number;
    delta: number;
    qty_after: number;
}

export interface PurchaseResponse {
    purchase: Purchase;
    updated_items: UpdatedItem[];
}
