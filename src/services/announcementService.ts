import { Announcement } from '@/types';

const STORAGE_KEY = '11a10_announcements_list';

export const OFFICIAL_WELCOME_ANNOUNCEMENT: Announcement = {
  id: 'anc-official-welcome',
  title: 'Chào mừng năm học mới 2026 - 2027 • Tập thể Lớp 11A10',
  content: `Kính gửi toàn thể các bạn học sinh lớp 11A10 trường THPT Cát Tiên,

Chào mừng năm học 2026 - 2027! Chi đoàn 11A10 cùng chung mục tiêu đoàn kết, nỗ lực thi đua học tập tốt và xây dựng tập thể lớp vững mạnh.

- Theo dõi Thời khóa biểu hàng tuần trên website để nắm rõ lịch học 4 tiết Sáng và 4 tiết Chiều (bắt đầu lúc 14:00).
- Cập nhật thông tin học sinh và tham gia chia sẻ khoảnh khắc kỷ niệm thanh xuân của lớp.

Chúc cả lớp 11A10 một năm học ngập tràn niềm vui và gặt hái nhiều thành tích rực rỡ!`,
  priority: 'normal',
  createdAt: '2026-09-05T07:00:00.000Z',
  updatedAt: '2026-09-05T07:00:00.000Z',
  authorId: 'admin',
  authorName: 'Ban Cán Sự & GVCN',
  views: 37,
};

export function loadAnnouncementsFromStorage(): Announcement[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial = [OFFICIAL_WELCOME_ANNOUNCEMENT];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  try {
    const list = JSON.parse(raw);
    // Xóa các thông báo demo cũ (anc-1, anc-2, anc-3) nếu còn sót lại
    if (
      Array.isArray(list) &&
      list.length > 0 &&
      list.some((a) => a.id === 'anc-1' || a.id === 'anc-2' || a.id === 'anc-3')
    ) {
      const cleaned = list.filter((a) => a.id !== 'anc-1' && a.id !== 'anc-2' && a.id !== 'anc-3');
      const finalList = cleaned.length > 0 ? cleaned : [OFFICIAL_WELCOME_ANNOUNCEMENT];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(finalList));
      return finalList;
    }
    return list;
  } catch {
    return [OFFICIAL_WELCOME_ANNOUNCEMENT];
  }
}

export function saveAnnouncementsToStorage(list: Announcement[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
