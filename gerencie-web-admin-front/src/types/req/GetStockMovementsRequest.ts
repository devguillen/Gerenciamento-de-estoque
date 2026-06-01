import { StockMovementType } from "@/constants/stock-movement";

export interface GetStockMovementsRequest {
    page: number;
    per_page: number;
    search?: string | null;
    sort_by: 'date' | 'type' | 'product_name';
    sort_dir: 'asc' | 'desc';
    types?: StockMovementType[];
    date_filter_type: 'today' | 'last_7' | 'last_30' | 'last_15' | 'custom';
    start_date?: number | null;
    end_date?: number | null;
    product_id?: number;
    category_ids?: number[];
}
