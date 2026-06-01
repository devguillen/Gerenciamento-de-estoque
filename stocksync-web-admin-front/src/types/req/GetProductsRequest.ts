import { Scope, SortDirection } from "../common";

export type ProductSortField =
    | 'product.name'
    | 'belongs_to_account'
    | 'product.owner_account_id'
    | 'brand.name'
    | 'min_limit'
    | 'max_limit';

export interface GetProductsRequest {
    page?: number;
    per_page?: number;
    search?: string;
    brand?: string; // Search by brand name or id? User snippet said "brand: null", let's assume filtering by ID or Name if API supports it, user said "search" is for product name usually.
    scope?: Scope;
    sort_by?: ProductSortField;
    sort_dir?: SortDirection;
    categories?: number[]; // Array of Category IDs
}
