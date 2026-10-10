import { LibraryItem } from '@/types';

const STORAGE_KEY = '11a10_library_items';

/**
 * Tải danh sách tài liệu từ localStorage, tự dọn sạch các tệp demo chết
 */
export function loadLibraryFromStorage(): LibraryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Lọc bỏ các tệp demo giả lập cũ
    const cleaned = parsed.filter((it: LibraryItem) => {
      const isDemo =
        it.id === 'lib-1' ||
        it.id === 'lib-2' ||
        it.id === 'lib-3' ||
        it.name.toLowerCase().includes('demo') ||
        it.name.toLowerCase().includes('sample');
      return !isDemo;
    });

    if (cleaned.length !== parsed.length) {
      saveLibraryToStorage(cleaned);
    }

    return cleaned;
  } catch (error) {
    console.error('Lỗi khi tải tài liệu thư viện:', error);
    return [];
  }
}

/**
 * Lưu danh sách tài liệu vào localStorage
 */
export function saveLibraryToStorage(items: LibraryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Lỗi khi lưu tài liệu thư viện:', error);
  }
}

/**
 * Thêm tài liệu mới vào thư viện
 */
export function addLibraryItemToStorage(item: LibraryItem): LibraryItem[] {
  const current = loadLibraryFromStorage();
  const next = [item, ...current];
  saveLibraryToStorage(next);
  return next;
}

/**
 * Xóa tài liệu khỏi thư viện
 */
export function deleteLibraryItemFromStorage(id: string): LibraryItem[] {
  const current = loadLibraryFromStorage();
  const next = current.filter((it) => it.id !== id);
  saveLibraryToStorage(next);
  return next;
}

/**
 * Tạo và tải xuống file tài liệu mẫu (hoặc nội dung file thực)
 */
export function triggerDocumentDownload(item: LibraryItem): void {
  // Nếu là fileUrl thực sự
  if (item.fileUrl && item.fileUrl.startsWith('data:')) {
    const a = document.createElement('a');
    a.href = item.fileUrl;
    a.download = item.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }

  // Tạo blob tài liệu text/pdf tượng trưng để người dùng luôn tải về được file thực
  const content = `TÀI LIỆU HỌC TẬP LỚP 11A10 - THPT CÁT TIÊN\n\nTên tệp: ${item.name}\nPhân loại: ${item.category}\nMôn học: ${item.subject}\nNgười đăng: ${item.uploadedBy}\nNgày đăng: ${item.uploadedAt}\n\nGhi chú: ${item.description || 'Không có mô tả chi tiết'}\n\n--- Ban Cán Sự 11A10 chúc các bạn học tập tốt! ---`;
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = item.name.endsWith('.txt') || item.name.endsWith('.pdf') ? item.name : `${item.name}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
