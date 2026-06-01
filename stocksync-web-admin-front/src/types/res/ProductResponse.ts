import { Brand } from "./BrandResponse";
import { Category } from "./CategoryResponse";

export interface ProductCategory {
    id: number;
    created_at: number;
    product_id: number;
    category_id: number;
    category: Category;
}

export interface AccountProduct {
    id: number;
    created_at: number;
    account_id: number;
    product_id: number;
    custom_name: string;
    min_limit: number;
    max_limit: number;
    is_favorite: boolean;
    is_archived: boolean;
}

export interface Product {
    id: number;
    created_at: number;
    name: string;
    brand_id: number;
    unit_type: string;
    owner_account_id: number;
    min_limit: number; // Global limit (suggested?)
    max_limit: number; // Global limit (suggested?)
    brand: Brand;
    product_categories: ProductCategory[];
    account_product?: AccountProduct; // Nullable if not configured for this account yet? The API response example shows it present.
}

export interface PaginatedProductResponse {
    itemsReceived: number;
    curPage: number;
    nextPage: number | null;
    prevPage: number | null;
    offset: number;
    perPage: number;
    items: Product[];
}
