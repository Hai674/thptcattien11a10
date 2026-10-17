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
      try {
        localStorage.setItem('auth_user_11a10', JSON.stringify(user));
      } catch (err) {
        console.warn('Lỗi lưu auth_user_11a10 vào localStorage:', err);
      }
    }
    set({ user, loading: false });
  },
  updateUser: (partial) => {
    set((state) => {
      const baseUser = state.user || getStoredUser() || {
        uid: 'user-' + Date.now(),
        email: 'hocsinh@11a10.edu.vn',
        displayName: 'Học sinh 11A10',
        photoURL: null,
        role: 'member',
        classId: '11A10',
        status: 'active',
      };
      const updated: User = {
        ...baseUser,
        ...partial,
        updatedAt: new Date().toISOString(),
      };
      try {
        localStorage.setItem('auth_user_11a10', JSON.stringify(updated));
      } catch (err) {
        console.warn('Lỗi cập nhật auth_user_11a10 vào localStorage:', err);
      }
      return { user: updated };
    });
  },
  clearUser: () => {
    try {
      localStorage.removeItem('auth_user_11a10');
    } catch {}
    set({ user: null, loading: false });
  },
  setLoading: (loading) => set({ loading }),
}));
