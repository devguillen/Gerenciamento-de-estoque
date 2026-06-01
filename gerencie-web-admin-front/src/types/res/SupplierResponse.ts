export interface Supplier {
    id: number;
    created_at: number;
    name: string;
    address: string | null;
    deleted: boolean;
    owner_account_id: number;
}
