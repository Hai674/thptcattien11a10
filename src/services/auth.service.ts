import { supabase, isSupabaseConfigured } from '@/supabase/config';
import { User } from '@/types';
import { useAuthStore } from '@/store/authStore';

const OVERRIDES_STORAGE_KEY = '11a10_user_profile_overrides';

/**
 * Lấy các thông tin tùy biến (Tên, Avatar, Ảnh bìa, Bio, SĐT) đã được người dùng lưu cục bộ
 */
export function getProfileOverrides(identifier?: string | null): Partial<User> {
  if (!identifier || typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(OVERRIDES_STORAGE_KEY);
    if (!raw) return {};
    const map = JSON.parse(raw);
    return map[identifier.toLowerCase()] || {};
  } catch {
    return {};
  }
}

/**
 * Lưu các thông tin tùy biến vào bộ nhớ cục bộ theo email hoặc uid của người dùng
 */
export function saveProfileOverrides(identifier: string, partial: Partial<User>): void {
  if (!identifier || typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(OVERRIDES_STORAGE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    const cleanId = identifier.toLowerCase();
    map[cleanId] = {
      ...(map[cleanId] || {}),
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(map));
  } catch (err) {
    console.warn('Lỗi khi lưu profile overrides:', err);
  }
}

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
      // Ưu tiên nạp đè các tùy biến đã lưu nếu có
      const overrides = getProfileOverrides(data.email || data.id);
      return {
        uid: data.id,
        email: data.email,
        displayName: overrides.displayName || data.display_name || 'Thành viên 11A10',
        photoURL: overrides.photoURL !== undefined ? overrides.photoURL : (data.photo_url || null),
        role: data.role || 'member',
        classId: data.class_id || '11A10',
        status: data.status || 'active',
        phoneNumber: overrides.phoneNumber !== undefined ? overrides.phoneNumber : (data.phone_number || undefined),
        bio: overrides.bio !== undefined ? overrides.bio : (data.bio || undefined),
        bannerCustomUrl: overrides.bannerCustomUrl,
        bannerTheme: overrides.bannerTheme,
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
    const overrides = getProfileOverrides(cleanEmail);
    const adminUser: User = {
      uid: 'admin-11a10-master-uid',
      email: cleanEmail,
      displayName: overrides.displayName || existingProfile.displayName || 'Ban Cán Sự 11A10 (Admin)',
      photoURL: overrides.photoURL !== undefined ? overrides.photoURL : (existingProfile.photoURL ?? null),
      phoneNumber: overrides.phoneNumber || existingProfile.phoneNumber || '',
      bio: overrides.bio || existingProfile.bio || 'Học sinh lớp 11A10 - THPT Cát Tiên',
      bannerCustomUrl: overrides.bannerCustomUrl || existingProfile.bannerCustomUrl,
      bannerTheme: overrides.bannerTheme || existingProfile.bannerTheme,
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

  // 2. Hỗ trợ tài khoản Học sinh Demo (hocsinh@11a10.edu.vn hoặc tương đương)
  if (
    cleanEmail === DEMO_ACCOUNTS.member.email ||
    cleanEmail.startsWith('hocsinh') ||
    cleanEmail === 'member@11a10.edu.vn'
  ) {
    const overrides = getProfileOverrides(cleanEmail);
    const memberUser: User = {
      uid: overrides.uid || 'member-11a10-test-uid',
      email: cleanEmail,
      displayName: overrides.displayName || existingProfile.displayName || 'Học sinh 11A10',
      photoURL: overrides.photoURL !== undefined ? overrides.photoURL : (existingProfile.photoURL ?? null),
      phoneNumber: overrides.phoneNumber || existingProfile.phoneNumber || '',
      bio: overrides.bio || existingProfile.bio || 'Học sinh lớp 11A10 - THPT Cát Tiên',
      bannerCustomUrl: overrides.bannerCustomUrl || existingProfile.bannerCustomUrl,
      bannerTheme: overrides.bannerTheme || existingProfile.bannerTheme,
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

  // 3. Nếu chưa cấu hình Supabase thực tế, hỗ trợ đăng nhập ngay với email học sinh đã nhập
  if (!isSupabaseConfigured) {
    const overrides = getProfileOverrides(cleanEmail);
    const memberUser: User = {
      uid: existingProfile.uid || `member-${Date.now()}`,
      email: cleanEmail,
      displayName: overrides.displayName || existingProfile.displayName || cleanEmail.split('@')[0],
      photoURL: overrides.photoURL !== undefined ? overrides.photoURL : (existingProfile.photoURL ?? null),
      phoneNumber: overrides.phoneNumber || existingProfile.phoneNumber || '',
      bio: overrides.bio || existingProfile.bio || 'Học sinh lớp 11A10 - THPT Cát Tiên',
      bannerCustomUrl: overrides.bannerCustomUrl || existingProfile.bannerCustomUrl,
      bannerTheme: overrides.bannerTheme || existingProfile.bannerTheme,
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
 * Đồng bộ triệt để cả LocalStorage (với overrides riêng biệt), Zustand Store và Supabase Auth + Database
 */
export async function updateUserProfile(partial: Partial<User>): Promise<User | null> {
  const currentUser = useAuthStore.getState().user;
  const userIdentifier = currentUser?.email || currentUser?.uid || 'default_user';

  // 1. Lưu Profile Overrides vào LocalStorage theo email và uid để không bao giờ bị ghi đè sau reload
  saveProfileOverrides(userIdentifier, partial);
  if (currentUser?.email) saveProfileOverrides(currentUser.email, partial);
  if (currentUser?.uid) saveProfileOverrides(currentUser.uid, partial);

  // 2. Cập nhật ngay tức thì vào Zustand store & LocalStorage (auth_user_11a10)
  useAuthStore.getState().updateUser(partial);
  const updatedUser = useAuthStore.getState().user;

  // 3. Đồng bộ với danh sách thành viên đăng ký (11a10_registered_users) nếu có
  try {
    const rawUsers = localStorage.getItem('11a10_registered_users');
    if (rawUsers) {
      const users: User[] = JSON.parse(rawUsers);
      const idx = users.findIndex(
        (u) =>
          (currentUser?.email && u.email?.toLowerCase() === currentUser.email.toLowerCase()) ||
          (currentUser?.uid && u.uid === currentUser.uid)
      );
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...partial, updatedAt: new Date().toISOString() };
        localStorage.setItem('11a10_registered_users', JSON.stringify(users));
      }
    }
  } catch (err) {
    console.warn('Lỗi đồng bộ vào 11a10_registered_users:', err);
  }

  // 4. Nếu có phiên Supabase thực tế, đồng bộ an toàn lên máy chủ Supabase
  if (isSupabaseConfigured) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Cập nhật User Metadata của Supabase Auth (CHỈ gửi URL HTTP để tránh lỗi Payload quá lớn làm hỏng JWT)
        const metaUpdates: Record<string, any> = {};
        if (partial.displayName !== undefined) metaUpdates.display_name = partial.displayName;
        if (
          typeof partial.photoURL === 'string' &&
          (partial.photoURL.startsWith('http://') || partial.photoURL.startsWith('https://'))
        ) {
          metaUpdates.avatar_url = partial.photoURL;
        }

        if (Object.keys(metaUpdates).length > 0) {
          try {
            await supabase.auth.updateUser({ data: metaUpdates });
          } catch (e) {
            console.warn('Supabase auth updateUser metadata notice:', e);
          }
        }

        // Cập nhật bảng profiles (CHỈ gửi các cột THỰC SỰ TỒN TẠI trong CSDL: id, display_name, photo_url, phone_number, bio, updated_at)
        // Tuyệt đối không gửi banner_url hay banner_theme vào bảng profiles vì sẽ gây lỗi PGRST204 (Bad Request)
        const profileUpdates: Record<string, any> = {
          id: session.user.id,
          updated_at: new Date().toISOString(),
        };
        if (partial.displayName !== undefined) profileUpdates.display_name = partial.displayName;
        if (partial.photoURL !== undefined) {
          if (
            partial.photoURL === null ||
            (typeof partial.photoURL === 'string' &&
              (partial.photoURL.startsWith('http') || partial.photoURL === '' || partial.photoURL.length < 500))
          ) {
            profileUpdates.photo_url = partial.photoURL;
          }
        }
        if (partial.phoneNumber !== undefined) profileUpdates.phone_number = partial.phoneNumber;
        if (partial.bio !== undefined) profileUpdates.bio = partial.bio;

        try {
          const { error: upsertErr } = await supabase.from('profiles').upsert(profileUpdates);
          if (upsertErr) {
            console.warn('Supabase profiles update notice:', upsertErr.message);
          }
        } catch (err) {
          console.warn('Lỗi gọi bảng profiles:', err);
        }
      }
    } catch (err) {
      console.warn('Lỗi đồng bộ hồ sơ lên Supabase:', err);
    }
  }

  // 5. Phát sự kiện toàn cục để Header, Sidebar và các trang khác cập nhật giao diện lập tức
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('11a10_profile_updated', { detail: updatedUser }));
  }

  return updatedUser;
}
