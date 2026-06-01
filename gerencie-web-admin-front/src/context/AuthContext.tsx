'use client';

import { createSession, deleteSession } from '@/lib/session'; // We need to check if we can import this here. 
import { authService } from '@/services/authService';
import { LoginRequest } from '@/types/req/AuthRequest';
import { UserResponse } from '@/types/res/AuthResponse';
import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useEffect, useState } from 'react';
// session.ts uses "use server" implicitly via next/headers? No, it marks functions? 
// Actually session.ts imports 'next/headers' at top level? 
// Let's check session.ts again. It has 'use server' at top. So imports are fine, they act as RPC.

interface AuthContextType {
  user: UserResponse | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for active session on mount
    const initAuth = async () => {
      try {
        // We can check cookie manually on client or call a server action locally if needed
        // Since cookie is httpOnly: false, we can read it.
        const sessionCookie = document.cookie
          .split('; ')
          .find((row) => row.startsWith('session='));

        if (sessionCookie) {
          const value = sessionCookie.split('=')[1];
          if (value) {
             const parsed = JSON.parse(decodeURIComponent(value));
            // Map session shape to UserResponse
             setUser({
                 id: parsed.id !== 'no-id' ? Number(parsed.id) : 0,
                 name: parsed.name,
                 email: parsed.email,
                 role: parsed.role,
             });
          }
        }
      } catch (error) {
        console.error('Failed to restore session', error);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (data: LoginRequest) => {
    try {
      setLoading(true);
      const res = await authService.login(data);

      const userToStore = {
          id: res.user_id,
          name: res.name || 'Usuário',
          email: res.email || data.email,
          role: res.role || 'admin',
          token: res.authToken
      };
      
      // Call Server Action to set cookie
      await createSession(userToStore as any);
      
      setUser({
           id: userToStore.id,
           name: userToStore.name,
           email: userToStore.email,
           role: userToStore.role
      });
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await deleteSession();
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
