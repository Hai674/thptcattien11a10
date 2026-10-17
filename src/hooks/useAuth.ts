import { useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/supabase/config';
import { getCurrentUser, updateUserProfile, getProfileOverrides, isAccountAdmin } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { User } from '@/types';

/**
 * Custom Hook theo dõi trạng thái đăng nhập thời gian thực với Supabase Auth
 * Đồng bộ trực tiếp vào Zustand store và trả về quyền hạn người dùng
 */
export function useAuth() {
  const { user, loading, setUser, updateUser: storeUpdateUser, clearUser, setLoading } = useAuthStore();

  useEffect(() => {
    let isMounted = true;

    // Lắng nghe sự kiện cập nhật profile từ trang Profile để đồng bộ tức thì
    const handleProfileUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<User>;
      if (customEvent.detail && isMounted) {
        setUser(customEvent.detail);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('11a10_profile_updated', handleProfileUpdated);
    }

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
            const userIdentifier = session.user.email || session.user.id;
            const overrides = getProfileOverrides(userIdentifier);
            const localRaw = localStorage.getItem('auth_user_11a10');
            let localData: Partial<User> = {};
            if (localRaw) {
              try {
                localData = JSON.parse(localRaw);
              } catch {}
            }

            const isUserAdmin = Boolean(
              (session.user.email && isAccountAdmin(session.user.email)) ||
              (profile && profile.role === 'admin') ||
              (localData && localData.role === 'admin')
            );
            const isHai =
              session.user.email?.toLowerCase() === 'haivannong2007@gmail.com' ||
              session.user.email?.toLowerCase() === 'haivanong2007@gmail.com' ||
              Boolean(session.user.email?.toLowerCase().includes('haivannong')) ||
              Boolean(session.user.email?.toLowerCase().includes('haivanong'));

            if (profile && isMounted) {
              const mergedUser: User = {
                ...profile,
                displayName: overrides.displayName || localData.displayName || (isHai ? 'Nông Văn Hải (Admin)' : profile.displayName),
                photoURL: overrides.photoURL !== undefined ? overrides.photoURL : (localData.photoURL !== undefined ? localData.photoURL : profile.photoURL),
                bannerCustomUrl: overrides.bannerCustomUrl !== undefined ? overrides.bannerCustomUrl : (localData.bannerCustomUrl || profile.bannerCustomUrl),
                bannerTheme: overrides.bannerTheme !== undefined ? overrides.bannerTheme : (localData.bannerTheme || profile.bannerTheme),
                phoneNumber: overrides.phoneNumber !== undefined ? overrides.phoneNumber : (localData.phoneNumber || profile.phoneNumber),
                bio: overrides.bio !== undefined ? overrides.bio : (localData.bio || (isUserAdmin ? 'Quản trị viên lớp 11A10 - THPT Cát Tiên' : profile.bio)),
                role: isUserAdmin ? 'admin' : (profile.role || 'member'),
                status: 'active',
              };
              setUser(mergedUser);
            } else if (isMounted) {
              const fallbackUser: User = {
                uid: session.user.id,
                email: session.user.email || null,
                displayName: overrides.displayName || localData.displayName || session.user.user_metadata?.display_name || (isHai ? 'Nông Văn Hải (Admin)' : isUserAdmin ? 'Ban Cán Sự 11A10 (Admin)' : (session.user.email?.split('@')[0] || 'Thành viên 11A10')),
                photoURL: overrides.photoURL !== undefined ? overrides.photoURL : (localData.photoURL !== undefined ? localData.photoURL : (session.user.user_metadata?.avatar_url || null)),
                bannerCustomUrl: overrides.bannerCustomUrl !== undefined ? overrides.bannerCustomUrl : localData.bannerCustomUrl,
                bannerTheme: overrides.bannerTheme !== undefined ? overrides.bannerTheme : localData.bannerTheme,
                role: isUserAdmin ? 'admin' : 'member',
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
            const userIdentifier = session.user.email || session.user.id;
            const overrides = getProfileOverrides(userIdentifier);
            const localRaw = localStorage.getItem('auth_user_11a10');
            let localData: Partial<User> = {};
            if (localRaw) {
              try {
                localData = JSON.parse(localRaw);
              } catch {}
            }

            const isUserAdmin = Boolean(
              (session.user.email && isAccountAdmin(session.user.email)) ||
              (profile && profile.role === 'admin') ||
              (localData && localData.role === 'admin')
            );
            const isHai =
              session.user.email?.toLowerCase() === 'haivannong2007@gmail.com' ||
              session.user.email?.toLowerCase() === 'haivanong2007@gmail.com' ||
              Boolean(session.user.email?.toLowerCase().includes('haivannong')) ||
              Boolean(session.user.email?.toLowerCase().includes('haivanong'));

            if (profile && isMounted) {
              const mergedUser: User = {
                ...profile,
                displayName: overrides.displayName || localData.displayName || (isHai ? 'Nông Văn Hải (Admin)' : profile.displayName),
                photoURL: overrides.photoURL !== undefined ? overrides.photoURL : (localData.photoURL !== undefined ? localData.photoURL : profile.photoURL),
                bannerCustomUrl: overrides.bannerCustomUrl !== undefined ? overrides.bannerCustomUrl : (localData.bannerCustomUrl || profile.bannerCustomUrl),
                bannerTheme: overrides.bannerTheme !== undefined ? overrides.bannerTheme : (localData.bannerTheme || profile.bannerTheme),
                phoneNumber: overrides.phoneNumber !== undefined ? overrides.phoneNumber : (localData.phoneNumber || profile.phoneNumber),
                bio: overrides.bio !== undefined ? overrides.bio : (localData.bio || (isUserAdmin ? 'Quản trị viên lớp 11A10 - THPT Cát Tiên' : profile.bio)),
                role: isUserAdmin ? 'admin' : (profile.role || 'member'),
                status: 'active',
              };
              setUser(mergedUser);
            } else if (isMounted) {
              const fallbackUser: User = {
                uid: session.user.id,
                email: session.user.email || null,
                displayName: overrides.displayName || localData.displayName || session.user.user_metadata?.display_name || (isHai ? 'Nông Văn Hải (Admin)' : isUserAdmin ? 'Ban Cán Sự 11A10 (Admin)' : (session.user.email?.split('@')[0] || 'Thành viên 11A10')),
                photoURL: overrides.photoURL !== undefined ? overrides.photoURL : (localData.photoURL !== undefined ? localData.photoURL : (session.user.user_metadata?.avatar_url || null)),
                bannerCustomUrl: overrides.bannerCustomUrl !== undefined ? overrides.bannerCustomUrl : localData.bannerCustomUrl,
                bannerTheme: overrides.bannerTheme !== undefined ? overrides.bannerTheme : localData.bannerTheme,
                role: isUserAdmin ? 'admin' : 'member',
                classId: '11A10',
                status: 'active',
              };
              setUser(fallbackUser);
            }
          } else if (isMounted) {
            const currentSaved = localStorage.getItem('auth_user_11a10');
            if (!currentSaved) {
              clearUser();
            }
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
      if (typeof window !== 'undefined') {
        window.removeEventListener('11a10_profile_updated', handleProfileUpdated);
      }
      subscription.unsubscribe();
    };
  }, [setUser, clearUser, setLoading]);

  const handleUpdateUser = useCallback(async (partial: Partial<User>) => {
    return await updateUserProfile(partial);
  }, []);

  const isAdmin = user?.role === 'admin' || Boolean(user?.email && isAccountAdmin(user.email));
  const isMember = user?.role === 'member' || isAdmin;
  const isActive = user?.status === 'active';

  return {
    user,
    loading,
    isAdmin,
    isMember,
    isActive,
    setUser,
    updateUser: handleUpdateUser,
    clearUser,
  };
}
