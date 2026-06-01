import { Scope, SortDirection } from "@/types/common";

export interface GetSuppliersRequest {
    page?: number;
    per_page?: number;
    search?: string;
    scope?: Scope;
    sort_by?: string;
    sort_dir?: SortDirection;
}
