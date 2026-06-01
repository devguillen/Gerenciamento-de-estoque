import { env } from '@/lib/env';
import { deleteSession } from '@/lib/session';
import axios, { AxiosError, AxiosInstance } from 'axios';

// Create helper to configure interceptors
const configureInterceptors = (instance: AxiosInstance) => {
    // Request Interceptor: Inject Token
    instance.interceptors.request.use(
        async (config) => {
            let token: string | undefined;

            if (typeof window !== 'undefined') {
                // Client-side: Read from cookie manually
                // We do this to avoid importing server-only 'cookies()' which breaks client bundles
                const match = document.cookie.match(new RegExp('(^| )session=([^;]+)'));
                if (match) {
                    try {
                        const value = decodeURIComponent(match[2]);
                        const session = JSON.parse(value);
                        token = session.token;
                    } catch (e) {
                        // ignore parse error 
                    }
                }
            } else {
                // Server-side: Use getSession helper
                try {
                    // Dynamic import to avoid strict server-only checks at build time if this file is imported in client components
                    const { getSession } = await import('@/lib/session');
                    const session = await getSession();
                    if (session) {
                        token = session.token;
                    }
                } catch (e) {
                    console.warn("Failed to get session on server", e);
                }
            }

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            return config;
        },
        (error) => Promise.reject(error)
    );

    // Response Interceptor: Handle 401
    instance.interceptors.response.use(
        (response) => response,
        async (error: AxiosError) => {
            if (error.response?.status === 401) {
                if (typeof window !== 'undefined') {
                        await deleteSession();
                        window.location.href = '/login';
                    }
                }
            return Promise.reject(error);
        }
    );
};

const createApi = (baseURL: string): AxiosInstance => {
    const instance = axios.create({
        baseURL,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    configureInterceptors(instance);
    return instance;
};

export const api = {
    auth: createApi(env.authApiUrl),
    app: createApi(env.appApiUrl),
};
