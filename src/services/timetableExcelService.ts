import * as XLSX from 'xlsx';
import { Timetable, ScheduleSlot } from '@/types';

export const PERIOD_TIMES_MORNING: Record<string, string> = {
  '1': '07:00 - 07:45',
  '2': '07:50 - 08:35',
  '3': '08:50 - 09:35',
  '4': '09:40 - 10:25',
};

export const PERIOD_TIMES_AFTERNOON: Record<string, string> = {
  'c1': '14:00 - 14:45',
  'c2': '14:50 - 15:35',
  'c3': '15:50 - 16:35',
  'c4': '16:40 - 17:25',
};

export const EMPTY_TIMETABLE: Timetable = {
  classId: '11A10',
  updatedAt: new Date().toISOString(),
  updatedBy: 'Lớp 11A10',
  fileName: 'TKB_11A10.xlsx',
  schedule: {
    '2': {},
    '3': {},
    '4': {},
    '5': {},
    '6': {},
    '7': {},
  },
};

/**
 * Tạo và tải xuống file Excel mẫu chuẩn 4 tiết sáng + 4 tiết chiều
 */
export function downloadSampleTimetableExcel() {
  const wsData = [
    ['THỜI KHÓA BIỂU LỚP 11A10 - TRƯỜNG THPT CÁT TIÊN (NĂM HỌC 2026 - 2027)'],
    ['(Quy chuẩn: Sáng 4 tiết từ 07:00, Chiều 4 tiết từ 14:00 - Nhập tên môn học vào từng ô)'],
    [],
    ['Buổi', 'Tiết', 'Khung giờ', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'],
    ['Sáng', 1, '07:00 - 07:45', 'Chào cờ', 'Toán', 'Ngữ Văn', 'Hóa Học', 'Tiếng Anh', 'Toán'],
    ['Sáng', 2, '07:50 - 08:35', 'Toán', 'Vật Lý', 'Ngữ Văn', 'Lịch Sử', 'Tiếng Anh', 'Toán'],
    ['Sáng', 3, '08:50 - 09:35', 'Hóa Học', 'Vật Lý', 'Tin Học', 'Địa Lý', 'Sinh Học', 'Ngữ Văn'],
    ['Sáng', 4, '09:40 - 10:25', 'Sinh Học', 'Tiếng Anh', 'Tin Học', 'GDCD', 'Công Nghệ', 'Sinh hoạt lớp'],
    [],
    ['Chiều', 1, '14:00 - 14:45', 'Thể Dục', '', 'Bồi dưỡng Toán', 'Bồi dưỡng Văn', 'GDQP-AN', ''],
    ['Chiều', 2, '14:50 - 15:35', 'Thể Dục', '', 'Bồi dưỡng Toán', 'Bồi dưỡng Anh', 'GDQP-AN', ''],
    ['Chiều', 3, '15:50 - 16:35', '', '', 'Tự học', 'Tự học', '', ''],
    ['Chiều', 4, '16:40 - 17:25', '', '', '', '', '', ''],
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Đặt độ rộng các cột cho đẹp mắt
  ws['!cols'] = [
    { wch: 10 }, // Buổi
    { wch: 6 },  // Tiết
    { wch: 16 }, // Khung giờ
    { wch: 18 }, // Thứ 2
    { wch: 18 }, // Thứ 3
    { wch: 18 }, // Thứ 4
    { wch: 18 }, // Thứ 5
    { wch: 18 }, // Thứ 6
    { wch: 18 }, // Thứ 7
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'TKB_11A10');
  XLSX.writeFile(wb, 'Mau_Thoi_Khoa_Bieu_11A10.xlsx');
}

/**
 * Đọc file Excel người dùng tải lên và chuyển thành đối tượng Timetable
 */
export async function parseTimetableFromExcel(file: File): Promise<Timetable> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });

  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Chuyển worksheet thành mảng 2 chiều
  const rows: (string | number)[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: '',
  });

  const schedule: Timetable['schedule'] = {
    '2': {},
    '3': {},
    '4': {},
    '5': {},
    '6': {},
    '7': {},
  };

  // Tìm dòng tiêu đề chứa các thứ
  let headerRowIndex = -1;
  const dayColMap: Record<string, number> = {}; // "2": colIndex

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    for (let c = 0; c < row.length; c++) {
      const val = String(row[c]).toLowerCase().trim();
      if (val.includes('thứ hai') || val.includes('thứ 2') || val === 't2' || val === 'mon') {
        dayColMap['2'] = c;
        headerRowIndex = r;
      } else if (val.includes('thứ ba') || val.includes('thứ 3') || val === 't3' || val === 'tue') {
        dayColMap['3'] = c;
      } else if (val.includes('thứ tư') || val.includes('thứ 4') || val === 't4' || val === 'wed') {
        dayColMap['4'] = c;
      } else if (val.includes('thứ năm') || val.includes('thứ 5') || val === 't5' || val === 'thu') {
        dayColMap['5'] = c;
      } else if (val.includes('thứ sáu') || val.includes('thứ 6') || val === 't6' || val === 'fri') {
        dayColMap['6'] = c;
      } else if (val.includes('thứ bảy') || val.includes('thứ 7') || val === 't7' || val === 'sat') {
        dayColMap['7'] = c;
      }
    }
    if (headerRowIndex !== -1) break;
  }

  if (headerRowIndex === -1) {
    throw new Error('Không tìm thấy dòng tiêu đề các ngày trong tuần (Thứ Hai, Thứ Ba...)');
  }

  // Duyệt các dòng sau header để đọc tiết và môn học
  let currentSession = 'Sáng';

  for (let r = headerRowIndex + 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0) continue;

    // Kiểm tra cột buổi hoặc từ khóa
    const rowStr = row.map((v) => String(v).toLowerCase()).join(' ');
    if (rowStr.includes('chiều') || rowStr.includes('buổi chiều') || rowStr.includes('afternoon')) {
      currentSession = 'Chiều';
    } else if (rowStr.includes('sáng') || rowStr.includes('buổi sáng') || rowStr.includes('morning')) {
      currentSession = 'Sáng';
    }

    // Tìm số tiết
    let periodNumber = 0;
    for (let c = 0; c < Math.min(row.length, 4); c++) {
      const cellVal = String(row[c]).trim();
      const numMatch = cellVal.match(/\b([1-4])\b/);
      if (numMatch) {
        periodNumber = parseInt(numMatch[1], 10);
        break;
      }
    }

    if (periodNumber === 0) continue;

    const periodKey = currentSession === 'Chiều' ? `c${periodNumber}` : `${periodNumber}`;

    // Đọc môn học cho từng ngày
    Object.entries(dayColMap).forEach(([dayKey, colIdx]) => {
      const subjectRaw = String(row[colIdx] || '').trim();
      if (subjectRaw) {
        // Tách giáo viên nếu có dạng: Môn (Tên GV)
        let subject = subjectRaw;
        let teacher = 'Giáo viên bộ môn';
        const match = subjectRaw.match(/^([^(]+)\s*\(([^)]+)\)$/);
        if (match) {
          subject = match[1].trim();
          teacher = match[2].trim();
        }

        if (!schedule[dayKey]) schedule[dayKey] = {};
        schedule[dayKey][periodKey] = {
          subject,
          teacher,
          room: currentSession === 'Chiều' ? 'Phòng 204 (Chiều)' : 'Phòng 204 (Sáng)',
        };
      }
    });
  }

  return {
    classId: '11A10',
    updatedAt: new Date().toISOString(),
    updatedBy: 'Imported from Excel',
    fileName: file.name,
    schedule,
  };
}

/**
 * Lưu thời khóa biểu vào LocalStorage
 */
export function saveTimetableToStorage(timetable: Timetable) {
  localStorage.setItem('11a10_timetable_data', JSON.stringify(timetable));
}

/**
 * Xóa dữ liệu thời khóa biểu khỏi LocalStorage
 */
export function clearTimetableFromStorage() {
  localStorage.removeItem('11a10_timetable_data');
}

/**
 * Tải thời khóa biểu từ LocalStorage (hoặc null nếu chưa có hoặc rỗng)
 */
export function loadTimetableFromStorage(): Timetable | null {
  const raw = localStorage.getItem('11a10_timetable_data');
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    // Tự động dọn sạch dữ liệu demo cũ nếu còn lưu trong LocalStorage của trình duyệt
    if (
      data &&
      (data.fileName === 'TKB_11A10_HocKy2.xlsx' ||
        data.updatedBy === 'Thầy Chủ Nhiệm & Ban Cán Sự' ||
        (data.schedule?.['2']?.['1']?.subject === 'Chào cờ' && data.schedule?.['2']?.['1']?.teacher === 'BGH'))
    ) {
      localStorage.removeItem('11a10_timetable_data');
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

