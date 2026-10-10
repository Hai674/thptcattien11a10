/**
 * Định nghĩa vai trò của người dùng trong hệ thống
 */
export type Role = 'guest' | 'member' | 'admin';

/**
 * Trạng thái kích hoạt tài khoản
 * - 'pending': Đăng ký mới, chờ quản trị viên phê duyệt
 * - 'active': Đã được duyệt và đang hoạt động bình thường
 * - 'blocked': Bị khóa tài khoản
 */
export type UserStatus = 'pending' | 'active' | 'blocked';

/**
 * Kiểu dữ liệu người dùng (lưu trong Firestore: users/{uid})
 */
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: Role;
  classId: string; // Mặc định "11A10"
  status: UserStatus;
  phoneNumber?: string;
  bio?: string;
  createdAt?: string | number | Date;
  updatedAt?: string | number | Date;
  discordTag?: string;
  discordStatus?: 'online' | 'idle' | 'dnd' | 'offline';
  customStatus?: string;
  customStatusEmoji?: string;
  avatarDecoration?: string;
  bannerTheme?: string;
  bannerCustomUrl?: string;
  pronouns?: string;
}

/**
 * Kiểu dữ liệu thông báo lớp học (Firestore: announcements/{id})
 */
export interface Announcement {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  priority: 'normal' | 'urgent';
  createdAt: string | number | Date;
  updatedAt: string | number | Date;
  authorId: string;
  authorName: string;
  views: number;
}

/**
 * Kiểu dữ liệu thành viên lớp (Firestore: members/{id})
 */
export interface Member {
  id: string;
  fullName: string;
  avatar?: string;
  birthDate?: string;
  role: 'Lớp trưởng' | 'Lớp phó' | 'Bí thư' | 'Tổ trưởng' | 'Thành viên' | string;
  position?: string;
  phone?: string;
  email?: string;
  facebook?: string;
  hobbies?: string[];
  quote?: string;
}

/**
 * Kiểu dữ liệu tài liệu thư viện lớp (Firestore: library/{id})
 */
export interface LibraryItem {
  id: string;
  name: string;
  description?: string;
  category: 'Tài liệu' | 'Đề thi' | 'Hình ảnh' | 'Video' | string;
  subject?: string;
  fileUrl: string;
  storagePath: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string | number | Date;
  downloads: number;
}

/**
 * Một tiết học trong thời khóa biểu
 */
export interface ScheduleSlot {
  subject: string;
  teacher: string;
  room?: string;
  note?: string;
}

/**
 * Thời khóa biểu theo lớp (Firestore: timetables/{classId})
 */
export interface Timetable {
  classId: string; // "11A10"
  updatedAt: string | number | Date;
  updatedBy: string;
  fileName: string;
  schedule: {
    // day: "2" | "3" | "4" | "5" | "6" | "7" (Thứ 2 đến Thứ 7)
    [day: string]: {
      // period: "1" | "2" | "3" | "4" | "5" (Tiết 1 đến Tiết 5)
      [period: string]: ScheduleSlot;
    };
  };
}
