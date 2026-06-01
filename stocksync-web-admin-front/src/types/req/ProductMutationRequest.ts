export interface ProductMutationRequest {
    name: string;
    brand_id: number;
    unit_type: string;
    category_ids: number[];
    min_limit: number;
    max_limit: number;
}
