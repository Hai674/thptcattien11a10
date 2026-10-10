import { useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/supabase/config';
import { getCurrentUser } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { User } from '@/types';

/**
 * Custom Hook theo dõi trạng thái đăng nhập thời gian thực với Supabase Auth
 * Đồng bộ trực tiếp vào Zustand store và trả về quyền hạn người dùng
 */
export function useAuth() {
  const { user, loading, setUser, updateUser, clearUser, setLoading } = useAuthStore();

  useEffect(() => {
    let isMounted = true;

    // 1. Nếu vừa đăng xuất thì không khôi phục phiên
    if (typeof window !== 'undefined' && sessionStorage.getItem('just_logged_out') === 'true') {
      clearUser();
      setLoading(false);
      return;
    }

    // 2. Kiểm tra phiên lưu trong localStorage trước (tài khoản demo hoặc đã lưu)
    const savedUserStr = localStorage.getItem('auth_user_11a10');
    if (savedUserStr) {
      try {
        const savedUser: User = JSON.parse(savedUserStr);
        setUser(savedUser);
        setLoading(false);
        // Nếu chưa cấu hình Supabase thực tế, hoàn tất luôn
        if (!isSupabaseConfigured) return;
      } catch (err) {
        console.error('Lỗi đọc user từ localStorage:', err);
      }
    }

    // Nếu chưa cấu hình Supabase và không có user lưu trong máy
    if (!isSupabaseConfigured) {
      if (!savedUserStr) {
        clearUser();
      }
      setLoading(false);
      return;
    }

    // Nếu chưa có user trong máy thì bật loading ngắn
    if (!savedUserStr) {
      setLoading(true);
    }

    // Bộ đếm thời gian an toàn: Tự động tắt loading sau tối đa 1.5 giây để không bao giờ bị treo
    const safetyTimer = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 1500);

    // Lấy session Supabase hiện tại
    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        if (!isMounted) return;
        if (sessionStorage.getItem('just_logged_out') === 'true') {
          clearUser();
          return;
        }
        try {
          if (session?.user) {
            const profile = await getCurrentUser(session.user.id);
            if (profile && isMounted) {
              setUser(profile);
            } else if (isMounted) {
              const fallbackUser: User = {
                uid: session.user.id,
                email: session.user.email || null,
                displayName: session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || 'Thành viên 11A10',
                photoURL: session.user.user_metadata?.avatar_url || null,
                role: 'member',
                classId: '11A10',
                status: 'active',
              };
              setUser(fallbackUser);
            }
          } else {
            const currentSaved = localStorage.getItem('auth_user_11a10');
            if (!currentSaved && isMounted) {
              clearUser();
            }
          }
        } catch (error) {
          console.error('Lỗi khi tải session Supabase:', error);
        } finally {
          if (isMounted) setLoading(false);
        }
      })
      .catch((error) => {
        console.warn('Lỗi getSession Supabase:', error);
        if (isMounted) setLoading(false);
      })
      .finally(() => {
        clearTimeout(safetyTimer);
      });

    // Lắng nghe thay đổi trạng thái Auth theo thời gian thực
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        if (event === 'SIGNED_OUT' || sessionStorage.getItem('just_logged_out') === 'true') {
          clearUser();
          if (isMounted) setLoading(false);
          return;
        }
        try {
          if (session?.user) {
            const profile = await getCurrentUser(session.user.id);
            if (profile && isMounted) {
              setUser(profile);
            } else if (isMounted) {
              const fallbackUser: User = {
                uid: session.user.id,
                email: session.user.email || null,
                displayName: session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || 'Thành viên 11A10',
                photoURL: session.user.user_metadata?.avatar_url || null,
                role: 'member',
                classId: '11A10',
                status: 'active',
              };
              setUser(fallbackUser);
            }
          } else if (isMounted) {
            clearUser();
          }
        } catch (error) {
          console.error('Lỗi onAuthStateChange Supabase:', error);
        } finally {
          if (isMounted) setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, [setUser, clearUser, setLoading]);

  const isAdmin = user?.role === 'admin';
  const isMember = user?.role === 'member' || user?.role === 'admin';
  const isActive = user?.status === 'active';

  return {
    user,
    loading,
    isAdmin,
    isMember,
    isActive,
    setUser,
    updateUser,
    clearUser,
  };
}
