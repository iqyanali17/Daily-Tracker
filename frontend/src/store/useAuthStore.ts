import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: { name: string; email: string } | null;
  login: (token: string, user: { name: string; email: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      isAuthenticated: false,
      user: null,
      login: (token, user) => set({ token, isAuthenticated: true, user }),
      logout: () => set({ token: null, isAuthenticated: false, user: null }),
    }),
    {
      name: 'dailytracker-auth', // This key is used to save data in localStorage
    }
  )
);
