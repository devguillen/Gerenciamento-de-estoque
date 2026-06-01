
export interface InventoryItemCategory {
    id: number;
    name: string;
}

export type InventoryStatus = 'em_falta' | 'baixo' | 'ok' | 'acima' | 'sem_meta';

export interface InventoryItem {
    id: number;
    account_id: number;
    account_product_id: number;
    quantity: number;
    updated_at: string;
    last_movement_type: string | null;
    last_movement_occurred_at: string | null;
    last_movement_source: string | null;
    last_movement_id: number | null;
    last_movement_delta: number | null;

    product_id: number;
    custom_name: string | null;
    min_limit: number | null;
    max_limit: number | null;
    product_name: string;
    unit_type: string;
    brand_name: string;
    display_name: string;
    categories: InventoryItemCategory[];

    status: InventoryStatus;
    urgency_rank: number;
}

export interface InventorySummary {
    em_falta: number;
    baixo: number;
    ok: number;
    acima: number;
    sem_meta: number;
    total_itens: number;
    ultima_atualizacao: string | null;
}

export interface PaginatedInventoryResponse {
    itemsReceived: number;
    curPage: number;
    nextPage: number | null;
    prevPage: number | null;
    offset: number;
    perPage: number;
    items: InventoryItem[];
}
