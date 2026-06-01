import { Scope, SortDirection } from "../common";

export type CategorySortField = 'category.name' | 'category.owner_account_id' | 'priority_sort';

export interface GetCategoriesRequest {
    page?: number;
    per_page?: number;
    search?: string;
    priority?: number | null;
    scope?: Scope;
    sort_by?: CategorySortField;
    sort_dir?: SortDirection;
}
