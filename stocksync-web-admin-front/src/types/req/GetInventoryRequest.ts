
export interface GetInventoryRequest {
    page: number;
    per_page: number;
    search?: string | null;
    sort_by?: 'name' | 'urgency' | 'quantity' | 'last_movement';
    sort_dir?: 'asc' | 'desc';
    categories?: number[];
    status?: 'todos' | 'em_falta' | 'baixo' | 'ok' | 'acima' | 'sem_meta';
}
