/**
 * Tiện ích xử lý tên gọi và Avatar học sinh lớp 11A10
 */

/**
 * Trích xuất tên gọi chính (Given Name / Tên) từ họ và tên đầy đủ
 * Ví dụ:
 * - "Nguyễn Đại Anh" -> "Anh"
 * - "Phan Văn Gia Bảo" -> "Bảo"
 * - "Nông Văn Hải (tôi)" -> "Hải"
 * - "Đinh Thị Khánh Linh" -> "Linh"
 * - "Hoàng Thị Tuyết Nhung" -> "Nhung"
 * - "K' Văn" -> "Văn"
 */
export function getGivenName(fullName?: string | null): string {
  if (!fullName) return '';
  // Xóa các ghi chú trong ngoặc đơn nếu có, ví dụ "(tôi)", "(Lớp trưởng)"
  const clean = fullName.replace(/\s*\([^)]*\)\s*$/, '').trim();
  if (!clean) return '';
  const parts = clean.split(/\s+/);
  return parts[parts.length - 1] || clean;
}

/**
 * Bảng màu gradient rực rỡ, hiện đại cho từng học sinh dựa trên tên
 */
const AVATAR_GRADIENTS = [
  'from-blue-600 to-indigo-600 shadow-blue-500/25',
  'from-purple-600 to-pink-600 shadow-purple-500/25',
  'from-emerald-600 to-teal-600 shadow-emerald-500/25',
  'from-amber-600 to-rose-600 shadow-amber-500/25',
  'from-cyan-600 to-blue-600 shadow-cyan-500/25',
  'from-violet-600 to-indigo-600 shadow-violet-500/25',
  'from-rose-600 to-orange-600 shadow-rose-500/25',
  'from-teal-600 to-cyan-600 shadow-teal-500/25',
  'from-fuchsia-600 to-purple-600 shadow-fuchsia-500/25',
  'from-sky-600 to-indigo-600 shadow-sky-500/25',
];

/**
 * Tạo màu gradient ổn định và phong phú cho mỗi bạn học sinh theo tên
 */
export function getAvatarGradient(name?: string | null): string {
  if (!name) return AVATAR_GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx];
}
