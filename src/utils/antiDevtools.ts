import { toast } from 'sonner';

/**
 * Hệ thống bảo vệ chống F12, Inspect Element và mở Developer Tools
 */
export function initAntiF12() {
  if (typeof window === 'undefined') return;

  // 1. Chặn phím tắt mở DevTools & View Source
  const handleKeyDown = (e: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const isCtrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

    // Chặn F12
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      showWarningToast('Phím F12 đã bị vô hiệu hóa');
      return false;
    }

    // Chặn Ctrl+Shift+I / Cmd+Opt+I (Inspect)
    // Chặn Ctrl+Shift+J / Cmd+Opt+J (Console)
    // Chặn Ctrl+Shift+C / Cmd+Opt+C (Inspect Element)
    // Chặn Ctrl+Shift+K (Firefox Console)
    if (
      isCtrlOrCmd &&
      e.shiftKey &&
      (e.key === 'I' ||
        e.key === 'i' ||
        e.key === 'J' ||
        e.key === 'j' ||
        e.key === 'C' ||
        e.key === 'c' ||
        e.key === 'K' ||
        e.key === 'k')
    ) {
      e.preventDefault();
      e.stopPropagation();
      showWarningToast('Tổ hợp phím kiểm tra mã nguồn (Inspect) đã bị khóa');
      return false;
    }

    // Chặn Ctrl+U / Cmd+U (View Page Source)
    if (isCtrlOrCmd && (e.key === 'u' || e.key === 'U')) {
      e.preventDefault();
      e.stopPropagation();
      showWarningToast('Xem mã nguồn trang (View Source) đã bị vô hiệu hóa');
      return false;
    }

    // Chặn Ctrl+S / Cmd+S (Save Page)
    if (isCtrlOrCmd && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      e.stopPropagation();
      showWarningToast('Lưu trang web đã bị vô hiệu hóa');
      return false;
    }
  };

  // 2. Chặn chuột phải (Context Menu)
  const handleContextMenu = (e: MouseEvent) => {
    // Cho phép nếu click vào thẻ input hoặc textarea để tiện dán/sao chép văn bản
    const target = e.target as HTMLElement | null;
    if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    showWarningToast('Chuột phải đã bị khóa để bảo vệ website');
    return false;
  };

  // 3. Hiển thị thông báo toast ngắn gọn, tránh spam nhiều toast cùng lúc
  let lastToastTime = 0;
  function showWarningToast(message: string) {
    const now = Date.now();
    if (now - lastToastTime > 1500) {
      lastToastTime = now;
      try {
        toast.warning(message, {
          id: 'anti-devtools-warning',
          duration: 2500,
        });
      } catch {
        // Fallback if toast not ready
      }
    }
  }

  // 4. In thông điệp cảnh báo đỏ rực rỡ trong Console khi có ai mở được DevTools
  const printConsoleWarning = () => {
    try {
      console.clear();
      console.log(
        '%cDỪNG LẠI (STOP)',
        'color: #ef4444; font-size: 38px; font-weight: 900; -webkit-text-stroke: 1px black;'
      );
      console.log(
        '%cĐây là hệ thống quản lý nội bộ THPT Cát Tiên - Lớp 11A10, mọi hành vi can thiệp mã nguồn hoặc cố tình trích xuất dữ liệu đều bị ghi nhận',
        'color: #f59e0b; font-size: 15px; font-weight: bold; line-height: 1.5;'
      );
    } catch {
      // Ignore
    }
  };

  // 5. Phát hiện DevTools mở bằng cách theo dõi kích thước cửa sổ
  let devtoolsDetected = false;
  const threshold = 160;
  const checkDevTools = () => {
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;

    if (widthThreshold || heightThreshold) {
      if (!devtoolsDetected) {
        devtoolsDetected = true;
        printConsoleWarning();
        showWarningToast('Cảnh báo: Phát hiện Developer Tools đang mở');
      }
    } else {
      devtoolsDetected = false;
    }
  };

  // Gắn sự kiện lắng nghe
  window.addEventListener('keydown', handleKeyDown, { capture: true });
  window.addEventListener('contextmenu', handleContextMenu, { capture: true });
  window.addEventListener('resize', checkDevTools);

  printConsoleWarning();
  const intervalId = window.setInterval(checkDevTools, 2000);

  // Trả về hàm dọn dẹp (cleanup) nếu cần hủy
  return () => {
    window.removeEventListener('keydown', handleKeyDown, { capture: true });
    window.removeEventListener('contextmenu', handleContextMenu, { capture: true });
    window.removeEventListener('resize', checkDevTools);
    window.clearInterval(intervalId);
  };
}
