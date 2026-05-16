'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, LoginPayload, RegisterPayload } from '../services/api.service';

interface User {
  id: string;
  email: string;
  role: string;
  profile: { displayName: string; avatarUrl: string | null } | null;
  wallet: { points: number; coins: number; gems: number } | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  isAuthenticated: boolean;

  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  fetchMe: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isLoading: false,
      isInitialized: false,
      isAuthenticated: false,

      login: async (payload) => {
        set({ isLoading: true });
        try {
          const { accessToken } = await authApi.login(payload);
          localStorage.setItem('sv_access_token', accessToken);
          set({ accessToken, isAuthenticated: true });
          await get().fetchMe();
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (payload) => {
        set({ isLoading: true });
        try {
          const { accessToken } = await authApi.register(payload);
          localStorage.setItem('sv_access_token', accessToken);
          set({ accessToken, isAuthenticated: true });
          await get().fetchMe();
        } finally {
          set({ isLoading: false });
        }
      },

      fetchMe: async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('sv_access_token') : null;
        if (!token) {
          set({ isInitialized: true });
          return;
        }
        set({ isLoading: true });
        try {
          const user = await authApi.getMe();
          set({ user, isAuthenticated: true });
        } catch {
          set({ user: null, isAuthenticated: false });
        } finally {
          set({ isLoading: false, isInitialized: true });
        }
      },

      logout: () => {
        localStorage.removeItem('sv_access_token');
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
    }),
    {
      name: 'sv-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
