export interface LoginResponse {
    authToken: string;
    user_id: number;
    name?: string;
    email?: string;
    role?: string;
}

export interface UserResponse {
    id: number;
    name: string;
    email: string;
    role: string | 'admin' | 'user';
    // Add other fields as needed based on actual API response
}
