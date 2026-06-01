export interface AccountCategory {
    id: number;
    created_at: number;
    account_id: number;
    category_id: number;
    priority: number; // 1-5
}

export interface Category {
    id: number;
    created_at: number;
    name: string;
    owner_account_id: number; // 0 for system, >0 for user
    priority_sort: number;
    account_category?: AccountCategory; // Optional, present if linked/overridden
}
