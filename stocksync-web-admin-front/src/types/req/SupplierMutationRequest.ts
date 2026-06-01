export interface CreateSupplierRequest {
    name: string;
    address: string; // Corrected spelling
}

export interface UpdateSupplierRequest {
    id: number;
    name: string;
    address: string;
}
