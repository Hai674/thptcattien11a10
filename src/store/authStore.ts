import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  updateUser: (partial: Partial<User>) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
}

const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('auth_user_11a10');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const initialUser = getStoredUser();

/**
 * Zustand Store quản lý trạng thái xác thực toàn cục
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: initialUser,
  loading: false,
  setUser: (user) => {
    if (user) {
      localStorage.setItem('auth_user_11a10', JSON.stringify(user));
    }
    set({ user, loading: false });
  },
  updateUser: (partial) => {
    set((state) => {
      if (!state.user) return state;
      const updated = { ...state.user, ...partial };
      localStorage.setItem('auth_user_11a10', JSON.stringify(updated));
      return { user: updated };
    });
  },
  clearUser: () => {
    localStorage.removeItem('auth_user_11a10');
    set({ user: null, loading: false });
  },
  setLoading: (loading) => set({ loading }),
}));
