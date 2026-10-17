import { User, Role, UserStatus } from '@/types';

const STORAGE_KEY = '11a10_registered_users';

export const INITIAL_ADMIN_USERS: User[] = [
  {
    uid: 'admin-master',
    email: 'admin@11a10.edu.vn',
    displayName: 'Ban Cán Sự 11A10 (Admin)',
    photoURL: null,
    role: 'admin',
    classId: '11A10',
    status: 'active',
    createdAt: '2026-09-05T07:00:00.000Z',
    updatedAt: '2026-09-05T07:00:00.000Z',
  },
  {
    uid: 'admin-haivannong',
    email: 'haivannong2007@gmail.com',
    displayName: 'Nông Văn Hải (Admin)',
    photoURL: null,
    role: 'admin',
    classId: '11A10',
    status: 'active',
    createdAt: '2026-09-05T07:00:00.000Z',
    updatedAt: '2026-09-05T07:00:00.000Z',
  },
  {
    uid: 'admin-haivanong',
    email: 'haivanong2007@gmail.com',
    displayName: 'Nông Văn Hải (Admin)',
    photoURL: null,
    role: 'admin',
    classId: '11A10',
    status: 'active',
    createdAt: '2026-09-05T07:00:00.000Z',
    updatedAt: '2026-09-05T07:00:00.000Z',
  },
];

/**
 * Tải danh sách tài khoản đã đăng ký, tự động xóa sạch dữ liệu demo cũ (u4, u5, u6, dangkhoa, yennhi,...)
 */
export function loadUsersFromStorage(): User[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveUsersToStorage(INITIAL_ADMIN_USERS);
      return INITIAL_ADMIN_USERS;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveUsersToStorage(INITIAL_ADMIN_USERS);
      return INITIAL_ADMIN_USERS;
    }

    // Lọc bỏ triệt để các tài khoản demo cũ
    const cleaned = parsed.filter((u: User) => {
      const email = (u.email || '').toLowerCase();
      const name = (u.displayName || '').toLowerCase();
      const uid = u.uid || '';

      const isDemo =
        uid === 'u4' ||
        uid === 'u5' ||
        uid === 'u6' ||
        email.includes('dangkhoa') ||
        email.includes('yennhi') ||
        email.includes('hocsinh_vp') ||
        name.includes('đăng khoa') ||
        name.includes('yến nhi') ||
        name.includes('vi phạm quy chế');

      return !isDemo;
    });

    // Tự động chuyển tất cả tài khoản pending sang active (bỏ duyệt) và cấp quyền admin cho haivannong2007@gmail.com / haivanong2007@gmail.com
    let foundHai = false;
    const migrated = cleaned.map((u: User) => {
      let updatedUser = u.status === 'pending' ? { ...u, status: 'active' as const } : u;
      const isHaiEmail =
        updatedUser.email?.toLowerCase() === 'haivannong2007@gmail.com' ||
        updatedUser.email?.toLowerCase() === 'haivanong2007@gmail.com' ||
        Boolean(updatedUser.email?.toLowerCase().includes('haivannong')) ||
        Boolean(updatedUser.email?.toLowerCase().includes('haivanong'));
      if (isHaiEmail) {
        foundHai = true;
        updatedUser = { ...updatedUser, role: 'admin' as const, status: 'active' as const };
      }
      return updatedUser;
    });

    if (!foundHai) {
      migrated.push({
        uid: 'admin-haivannong',
        email: 'haivannong2007@gmail.com',
        displayName: 'Nông Văn Hải (Admin)',
        photoURL: null,
        role: 'admin',
        classId: '11A10',
        status: 'active',
        createdAt: '2026-09-05T07:00:00.000Z',
        updatedAt: new Date().toISOString(),
      });
    }

    if (migrated.length === 0) {
      saveUsersToStorage(INITIAL_ADMIN_USERS);
      return INITIAL_ADMIN_USERS;
    }

    if (cleaned.length !== parsed.length || JSON.stringify(migrated) !== JSON.stringify(cleaned)) {
      saveUsersToStorage(migrated);
    }

    return migrated;
  } catch (error) {
    console.error('Lỗi khi tải users từ storage:', error);
    return INITIAL_ADMIN_USERS;
  }
}

/**
 * Lưu danh sách người dùng vào localStorage
 */
export function saveUsersToStorage(users: User[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Lỗi khi lưu users vào storage:', error);
  }
}

/**
 * Phê duyệt một tài khoản học sinh
 */
export function approveUserInStorage(uid: string): User[] {
  const users = loadUsersFromStorage();
  const updated = users.map((u) => (u.uid === uid ? { ...u, status: 'active' as const } : u));
  saveUsersToStorage(updated);
  return updated;
}

/**
 * Đổi vai trò tài khoản (Admin <-> Member)
 */
export function toggleUserRoleInStorage(uid: string): User[] {
  const users = loadUsersFromStorage();
  const updated = users.map((u) => {
    if (u.uid !== uid) return u;
    const newRole: Role = u.role === 'admin' ? 'member' : 'admin';
    return { ...u, role: newRole };
  });
  saveUsersToStorage(updated);
  return updated;
}

/**
 * Khóa hoặc Mở khóa tài khoản
 */
export function toggleUserBlockInStorage(uid: string): User[] {
  const users = loadUsersFromStorage();
  const updated = users.map((u) => {
    if (u.uid !== uid) return u;
    const newStatus: UserStatus = u.status === 'blocked' ? 'active' : 'blocked';
    return { ...u, status: newStatus };
  });
  saveUsersToStorage(updated);
  return updated;
}

/**
 * Xóa tài khoản
 */
export function deleteUserFromStorage(uid: string): User[] {
  const users = loadUsersFromStorage();
  const updated = users.filter((u) => u.uid !== uid);
  saveUsersToStorage(updated);
  return updated;
}
