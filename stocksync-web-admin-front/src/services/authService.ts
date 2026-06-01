import { LoginRequest, MagicLinkLoginRequest, UpdatePasswordRequest } from '@/types/req/AuthRequest';
import { LoginResponse, UserResponse } from '@/types/res/AuthResponse';
import { api } from './api';

export const authService = {
    login: async (data: LoginRequest): Promise<LoginResponse> => {
        const response = await api.auth.post<LoginResponse>('/auth/login', data);
        return response.data;
    },

    getMe: async (token: string): Promise<UserResponse> => {
        const response = await api.auth.get<UserResponse>('/auth/me', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    },

    requestResetLink: async (email: string): Promise<void> => {
        await api.auth.get(`/reset/request-reset-link?email=${encodeURIComponent(email)}`);
    },

    magicLinkLogin: async (data: MagicLinkLoginRequest): Promise<LoginResponse> => {
        const response = await api.auth.post<LoginResponse>('/reset/magic-link-login', data);
        return response.data;
    },

    updatePassword: async (data: UpdatePasswordRequest, token: string): Promise<void> => {
        await api.auth.post('/reset/update_password', data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }
};
