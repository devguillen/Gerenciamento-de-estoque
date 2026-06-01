export interface LoginRequest {
    email: string;
    password: string;
}

export interface MagicLinkLoginRequest {
    magic_token: string;
    email: string;
}

export interface UpdatePasswordRequest {
    password: string;
    confirm_password: string;
}
