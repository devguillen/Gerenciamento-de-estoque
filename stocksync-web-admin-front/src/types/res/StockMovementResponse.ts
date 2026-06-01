import { StockMovementType } from "@/constants/stock-movement";
import { Category } from "./CategoryResponse";

export interface StockMovementItem {
    id: number;
    occurred_at: number; // Timestamp
    movement_type: StockMovementType;
    delta: number;
    balance_after: number;
    note: string | null;
    product_name: string;
    unit_type: string;
    brand_name: string;
    supplier_name?: string | null;
    categories: Category[];
}

export interface PaginatedStockMovementResponse {
    curPage: number;
    itemsReceived: number;
    items: StockMovementItem[];
    // Standard pagination fields usually present, but user specified response format above. 
    // Adapting to standard pagination if missing from user example (often backend sends total/pages).
    // User example: { curPage, itemsReceived, items }. Assuming that's it.
    // I'll add totalItems/totalPages as optional just in case standard backend wrapper adds them.
    totalItems?: number;
    totalPages?: number;
    nextPage?: number | null;
    prevPage?: number | null;
}
