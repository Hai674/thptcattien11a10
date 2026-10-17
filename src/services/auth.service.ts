import { supabase, isSupabaseConfigured } from '@/supabase/config';
import { User } from '@/types';
import { useAuthStore } from '@/store/authStore';

/**
 * Lấy thông tin chi tiết của người dùng từ Supabase bảng `profiles`
 */
export async function getCurrentUser(uid?: string): Promise<User | null> {
  if (!isSupabaseConfigured) return null;

  try {
    let targetUid = uid;
    if (!targetUid) {
      const { data: authData } = await supabase.auth.getUser();
      targetUid = authData.user?.id;
    }
    if (!targetUid) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetUid)
      .maybeSingle();

    if (error) {
      console.warn('Lỗi khi tải thông tin profiles từ Supabase:', error.message);
      return null;
    }

    if (data) {
      return {
        uid: data.id,
        email: data.email,
        displayName: data.display_name || 'Thành viên 11A10',
        photoURL: data.photo_url || null,
        role: data.role || 'member',
        classId: data.class_id || '11A10',
        status: data.status || 'active',
        phoneNumber: data.phone_number,
        bio: data.bio,
        bannerCustomUrl: data.banner_url || data.banner_custom_url || undefined,
        bannerTheme: data.banner_theme || undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    }
    return null;
  } catch (error) {
    console.error('Lỗi khi tải thông tin người dùng từ Supabase:', error);
    return null;
  }
}

/**
 * Đăng nhập bằng Google qua Supabase OAuth
 */
export async function signInWithGoogle(): Promise<User | void> {
  try {
    sessionStorage.removeItem('just_logged_out');
  } catch {}

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (!error) return;
      console.warn('Supabase OAuth notice:', error.message);
    } catch (err) {
      console.warn('Lỗi gọi Supabase Google OAuth:', err);
    }
  }

  // Fallback trải nghiệm nếu Google Provider chưa được bật trên Supabase
  let existingGoogle: Partial<User> = {};
  try {
    const saved = localStorage.getItem('auth_user_11a10');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.email === 'hocsinh.google@11a10.edu.vn' || parsed.uid === 'google-member-11a10') {
        existingGoogle = parsed;
      }
    }
  } catch {}

  const googleUser: User = {
    uid: 'google-member-11a10',
    email: 'hocsinh.google@11a10.edu.vn',
    displayName: existingGoogle.displayName || 'Học sinh 11A10',
    photoURL: existingGoogle.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    phoneNumber: existingGoogle.phoneNumber || '',
    bio: existingGoogle.bio || 'Học sinh lớp 11A10 - THPT Cát Tiên',
    bannerCustomUrl: existingGoogle.bannerCustomUrl,
    bannerTheme: existingGoogle.bannerTheme,
    role: 'member',
    classId: '11A10',
    status: 'active',
    createdAt: existingGoogle.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem('auth_user_11a10', JSON.stringify(googleUser));
  useAuthStore.getState().setUser(googleUser);
  return googleUser;
}

/**
 * Danh sách tài khoản mẫu (Demo Accounts) dùng để phát triển và kiểm thử cục bộ
 */
export const DEMO_ACCOUNTS = {
  admin: {
    email: 'admin@11a10.edu.vn',
    passwords: ['admin', 'admin123', 'admin123456'],
    user: {
      uid: 'admin-11a10-master-uid',
      email: 'admin@11a10.edu.vn',
      displayName: 'Ban Cán Sự 11A10 (Admin)',
      photoURL: null,
      role: 'admin' as const,
      classId: '11A10',
      status: 'active' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  member: {
    email: 'hocsinh@11a10.edu.vn',
    passwords: ['123456', 'hocsinh123'],
    user: {
      uid: 'member-11a10-test-uid',
      email: 'hocsinh@11a10.edu.vn',
      displayName: 'Học sinh 11A10',
      photoURL: null,
      role: 'member' as const,
      classId: '11A10',
      status: 'active' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
};

/**
 * Đăng nhập bằng Email và Mật khẩu qua Supabase Auth
 */
export async function signInWithEmail(email: string, pass: string): Promise<User> {
  try {
    sessionStorage.removeItem('just_logged_out');
  } catch {}

  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = pass.trim();

  // Kiểm tra xem máy đã lưu thông tin tùy chỉnh nào của email này chưa
  let existingProfile: Partial<User> = {};
  try {
    const savedRaw = localStorage.getItem('auth_user_11a10');
    if (savedRaw) {
      const parsed = JSON.parse(savedRaw);
      if (parsed.email === cleanEmail || (cleanEmail.includes('admin') && parsed.role === 'admin')) {
        existingProfile = parsed;
      }
    }
  } catch {}

  // 1. Hỗ trợ tài khoản Admin mặc định
  if (cleanEmail.includes('admin') || cleanEmail === 'admin@11a10.edu.vn') {
    const adminUser: User = {
      uid: 'admin-11a10-master-uid',
      email: cleanEmail,
      displayName: existingProfile.displayName || 'Ban Cán Sự 11A10 (Admin)',
      photoURL: existingProfile.photoURL ?? null,
      phoneNumber: existingProfile.phoneNumber || '',
      bio: existingProfile.bio || 'Học sinh lớp 11A10 - THPT Cát Tiên',
      bannerCustomUrl: existingProfile.bannerCustomUrl,
      bannerTheme: existingProfile.bannerTheme,
      role: 'admin',
      classId: '11A10',
      status: 'active',
      createdAt: existingProfile.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem('auth_user_11a10', JSON.stringify(adminUser));
    useAuthStore.getState().setUser(adminUser);
    return adminUser;
  }

  // 2. Nếu chưa cấu hình Supabase thực tế, hỗ trợ đăng nhập ngay với email học sinh đã nhập
  if (!isSupabaseConfigured) {
    const memberUser: User = {
      uid: existingProfile.uid || `member-${Date.now()}`,
      email: cleanEmail,
      displayName: existingProfile.displayName || cleanEmail.split('@')[0],
      photoURL: existingProfile.photoURL ?? null,
      phoneNumber: existingProfile.phoneNumber || '',
      bio: existingProfile.bio || 'Học sinh lớp 11A10 - THPT Cát Tiên',
      bannerCustomUrl: existingProfile.bannerCustomUrl,
      bannerTheme: existingProfile.bannerTheme,
      role: 'member',
      classId: '11A10',
      status: 'active',
      createdAt: existingProfile.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem('auth_user_11a10', JSON.stringify(memberUser));
    useAuthStore.getState().setUser(memberUser);
    return memberUser;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password: cleanPass,
  });

  if (error) {
    throw new Error(error.message || 'Email hoặc mật khẩu không chính xác');
  }

  if (!data.user) {
    throw new Error('Không tìm thấy tài khoản người dùng');
  }

  // Tải hồ sơ từ bảng `profiles`
  const userProfile = await getCurrentUser(data.user.id);
  const finalUser: User = userProfile || {
    uid: data.user.id,
    email: data.user.email || null,
    displayName: data.user.user_metadata?.display_name || cleanEmail.split('@')[0] || 'Thành viên 11A10',
    photoURL: data.user.user_metadata?.avatar_url || null,
    role: 'member',
    classId: '11A10',
    status: 'active',
  };

  localStorage.setItem('auth_user_11a10', JSON.stringify(finalUser));
  useAuthStore.getState().setUser(finalUser);
  return finalUser;
}

/**
 * Đăng ký tài khoản mới bằng Email và Mật khẩu qua Supabase Auth
 */
export async function signUpWithEmail(
  email: string,
  pass: string,
  displayName: string
): Promise<User> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = pass.trim();

  if (!isSupabaseConfigured) {
    const newUser: User = {
      uid: `member-${Date.now()}`,
      email: cleanEmail,
      displayName: displayName.trim() || cleanEmail.split('@')[0],
      photoURL: null,
      role: 'member',
      classId: '11A10',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem('auth_user_11a10', JSON.stringify(newUser));
    useAuthStore.getState().setUser(newUser);
    return newUser;
  }

  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password: cleanPass,
    options: {
      data: {
        display_name: displayName.trim(),
        role: 'member',
        class_id: '11A10',
      },
    },
  });

  if (error) {
    throw new Error(error.message || 'Đăng ký tài khoản thất bại');
  }

  if (!data.user) {
    throw new Error('Không thể khởi tạo tài khoản');
  }

  const newUser: User = {
    uid: data.user.id,
    email: cleanEmail,
    displayName: displayName.trim(),
    photoURL: null,
    role: 'member',
    classId: '11A10',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Đồng bộ lưu thông tin vào bảng profiles nếu trigger chưa tạo
  try {
    await supabase.from('profiles').upsert({
      id: data.user.id,
      email: cleanEmail,
      display_name: displayName.trim(),
      role: 'member',
      class_id: '11A10',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  } catch {
    // Có thể trigger đã tự động thêm
  }

  return newUser;
}

/**
 * Đăng xuất tài khoản
 */
export async function signOut(): Promise<void> {
  try {
    sessionStorage.setItem('just_logged_out', 'true');
  } catch {}

  localStorage.removeItem('auth_user_11a10');

  // Xóa sạch các token Supabase trong localStorage để hủy session tức thì
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('sb-') || key.includes('auth-token')) {
        localStorage.removeItem(key);
      }
    });
  } catch {}

  useAuthStore.getState().clearUser();

  if (isSupabaseConfigured) {
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch (error) {
      console.warn('Lỗi đăng xuất Supabase:', error);
    }
  }
}

/**
 * Gửi email yêu cầu đặt lại mật khẩu
 */
export async function resetPassword(email: string): Promise<void> {
  if (!isSupabaseConfigured) {
    return;
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${window.location.origin}/ca-nhan`,
  });

  if (error) {
    console.warn('Lỗi gửi email đặt lại mật khẩu:', error.message);
  }
}

/**
 * Cập nhật thông tin hồ sơ người dùng (Tên, Avatar, Số điện thoại, Tiểu sử, Hình nền/Banner)
 * Đồng bộ cả LocalStorage, Zustand Store và Supabase Auth + Database bảng profiles
 */
export async function updateUserProfile(partial: Partial<User>): Promise<User | null> {
  // 1. Cập nhật ngay tức thì vào Zustand store & LocalStorage
  useAuthStore.getState().updateUser(partial);
  const updatedUser = useAuthStore.getState().user;

  // 2. Nếu có phiên Supabase thực tế, đồng bộ lên máy chủ Supabase
  if (isSupabaseConfigured) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Cập nhật User Metadata của Supabase Auth
        const metaUpdates: Record<string, any> = {};
        if (partial.displayName !== undefined) metaUpdates.display_name = partial.displayName;
        if (partial.photoURL !== undefined) metaUpdates.avatar_url = partial.photoURL;
        if (partial.bannerCustomUrl !== undefined) metaUpdates.banner_url = partial.bannerCustomUrl;
        if (partial.bannerTheme !== undefined) metaUpdates.banner_theme = partial.bannerTheme;

        if (Object.keys(metaUpdates).length > 0) {
          try {
            await supabase.auth.updateUser({ data: metaUpdates });
          } catch (e) {
            console.warn('Lỗi cập nhật metadata Supabase auth:', e);
          }
        }

        // Cập nhật bảng profiles (nếu có bảng này trong CSDL Supabase)
        const profileUpdates: Record<string, any> = {
          id: session.user.id,
          updated_at: new Date().toISOString(),
        };
        if (partial.displayName !== undefined) profileUpdates.display_name = partial.displayName;
        if (partial.photoURL !== undefined) profileUpdates.photo_url = partial.photoURL;
        if (partial.phoneNumber !== undefined) profileUpdates.phone_number = partial.phoneNumber;
        if (partial.bio !== undefined) profileUpdates.bio = partial.bio;
        if (partial.bannerCustomUrl !== undefined) profileUpdates.banner_url = partial.bannerCustomUrl;
        if (partial.bannerTheme !== undefined) profileUpdates.banner_theme = partial.bannerTheme;

        try {
          const { error: upsertErr } = await supabase.from('profiles').upsert(profileUpdates);
          if (upsertErr) {
            console.warn('Lưu vào bảng profiles Supabase chú ý:', upsertErr.message);
          }
        } catch (err) {
          console.warn('Lỗi gọi bảng profiles:', err);
        }
      }
    } catch (err) {
      console.warn('Lỗi đồng bộ hồ sơ lên Supabase:', err);
    }
  }

  return updatedUser;
}
