/**
 * Công cụ nén và tối ưu hóa ảnh tự động bằng HTML Canvas
 * Giảm kích thước ảnh từ nhiều MB xuống còn 20KB - 80KB (dạng Data URL base64)
 * Giúp lưu trữ an toàn trong LocalStorage không lo QuotaExceededError và tải trang tức thì
 */

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 đến 1.0 (mặc định 0.82)
  format?: 'image/jpeg' | 'image/webp' | 'image/png';
}

/**
 * Nén tệp hình ảnh được chọn từ input file
 */
export async function compressImage(
  file: File | Blob,
  options: CompressOptions = {}
): Promise<string> {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.82,
    format = 'image/jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Tệp không phải định dạng hình ảnh hợp lệ'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không thể đọc tệp hình ảnh'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Hình ảnh bị lỗi hoặc không hỗ trợ'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Tính tỉ lệ thu nhỏ giữ nguyên khung hình gốc
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Dự phòng nếu trình duyệt không hỗ trợ Canvas 2D
          resolve(e.target?.result as string);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        try {
          const dataUrl = canvas.toDataURL(format, quality);
          resolve(dataUrl);
        } catch {
          // Fallback nếu toDataURL thất bại với format yêu cầu
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
