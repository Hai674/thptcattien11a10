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

const isAccountAdmin = (email?: string | null): boolean => {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return clean === 'haivanong2007@gmail.com' || clean === 'admin@11a10.edu.vn' || clean.includes('admin');
};

const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  try {
    let user: User | null = null;
    const raw = localStorage.getItem('auth_user_11a10');
    if (raw) {
      user = JSON.parse(raw);
    }
    // Hợp nhất ngay các tùy biến hồ sơ mới nhất nếu có
    const activeRaw = localStorage.getItem('11a10_active_profile');
    if (activeRaw) {
      const active = JSON.parse(activeRaw);
      if (user) {
        user = {
          ...user,
          ...active,
        };
      } else {
        user = {
          uid: 'admin-11a10-master-uid',
          email: 'admin@11a10.edu.vn',
          displayName: active.displayName || 'Ban Cán Sự 11A10',
          photoURL: active.photoURL !== undefined ? active.photoURL : null,
          bannerCustomUrl: active.bannerCustomUrl,
          phoneNumber: active.phoneNumber,
          bio: active.bio,
          role: 'admin',
          classId: '11A10',
          status: 'active',
          updatedAt: active.updatedAt || new Date().toISOString(),
        };
      }
    }
    if (user && isAccountAdmin(user.email)) {
      user.role = 'admin';
      user.status = 'active';
    }
    return user;
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
    let finalUser = user;
    if (finalUser && isAccountAdmin(finalUser.email)) {
      finalUser = { ...finalUser, role: 'admin', status: 'active' };
    }
    if (finalUser) {
      try {
        localStorage.setItem('auth_user_11a10', JSON.stringify(finalUser));
      } catch (err) {
        console.warn('Lỗi lưu auth_user_11a10 vào localStorage:', err);
      }
    }
    set({ user: finalUser, loading: false });
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
      let updated: User = {
        ...baseUser,
        ...partial,
        updatedAt: new Date().toISOString(),
      };
      if (isAccountAdmin(updated.email)) {
        updated = { ...updated, role: 'admin', status: 'active' };
      }
      try {
        localStorage.setItem('auth_user_11a10', JSON.stringify(updated));
        // Cập nhật luôn active profile đồng thời
        const activeProfile = {
          displayName: updated.displayName,
          photoURL: updated.photoURL,
          bannerCustomUrl: updated.bannerCustomUrl,
          phoneNumber: updated.phoneNumber,
          bio: updated.bio,
          updatedAt: updated.updatedAt,
        };
        localStorage.setItem('11a10_active_profile', JSON.stringify(activeProfile));
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

