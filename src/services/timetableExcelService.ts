import * as XLSX from 'xlsx';
import { Timetable, ScheduleSlot } from '@/types';

export const PERIOD_TIMES_MORNING: Record<string, string> = {
  '1': '07:00 - 07:45',
  '2': '07:50 - 08:35',
  '3': '08:50 - 09:35',
  '4': '09:40 - 10:25',
  '5': '10:30 - 11:15',
};

export const PERIOD_TIMES_AFTERNOON: Record<string, string> = {
  'c1': '14:00 - 14:45',
  'c2': '14:50 - 15:35',
  'c3': '15:50 - 16:35',
  'c4': '16:40 - 17:25',
  'c5': '17:30 - 18:15',
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
  },
};

export interface ParseOptions {
  targetClass?: string; // Mặc định '11A10'
  forceSession?: 'Sáng' | 'Chiều' | 'Cả ngày' | 'auto';
  existingTimetable?: Timetable | null;
}

export interface ParseResult {
  timetable: Timetable;
  detectedClass: string;
  detectedSession: 'Sáng' | 'Chiều' | 'Cả ngày';
  sheetUsed: string;
  foundClasses: string[];
  morningSlotsCount: number;
  afternoonSlotsCount: number;
  totalSlotsCount: number;
  fileName: string;
  isMerged: boolean;
}

/**
 * Loại bỏ dấu tiếng Việt để so khớp chuỗi siêu bền vững
 */
export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

/**
 * Nhận diện chính xác tên lớp mục tiêu (ví dụ: '11A10') trong ô Excel bất kỳ
 * Tránh nhầm lẫn với các lớp 11A1, 11A11, 11A12, 10A10...
 * Hỗ trợ các biến thể: "11A10", "11a10", "Lớp 11A10", "LỚP 11A10", "11 A 10", "11.10", "11/10", "11-A10", "K11A10", "11A10 (Sáng)"...
 */
export function matchTargetClass(cellVal: any, targetClass = '11A10'): boolean {
  if (!cellVal) return false;
  const raw = String(cellVal).trim();
  const clean = removeVietnameseTones(raw).toLowerCase().trim();

  // Tách targetClass thành: grade (11), letter (A), num (10)
  const tm = targetClass.match(/^(\d+)\s*([a-zA-Z]*)\s*(\d*)$/);
  if (!tm) {
    const norm = clean.replace(/[^a-z0-9]/g, '');
    const normTarget = removeVietnameseTones(targetClass).toLowerCase().replace(/[^a-z0-9]/g, '');
    return norm === normTarget || norm === 'lop' + normTarget;
  }

  const [, grade, letter, num] = tm;
  let patternStr = '';
  if (letter && num) {
    // Khớp: 11A10, 11 A 10, lop 11a10, khoi 11 - 11a10, 11.10, 11/10, 11-a10
    patternStr = `(?:^|[^a-z0-9])(?:lop\\s*|khoi\\s*)?${grade}\\s*[-_./]?\\s*(?:${letter.toLowerCase()}|[./-])?\\s*${num}(?:[^a-z0-9]|$)`;
  } else if (num) {
    patternStr = `(?:^|[^a-z0-9])(?:lop\\s*|khoi\\s*)?${grade}\\s*[-_./]?\\s*${num}(?:[^a-z0-9]|$)`;
  } else {
    patternStr = `(?:^|[^a-z0-9])(?:lop\\s*|khoi\\s*)?${grade}\\s*[-_./]?\\s*${letter.toLowerCase()}(?:[^a-z0-9]|$)`;
  }

  const regex = new RegExp(patternStr, 'i');
  if (regex.test(clean)) return true;

  // Fallback: So khớp tuyệt đối khi loại bỏ tất cả ký tự phi số/chữ
  const norm = clean.replace(/[^a-z0-9]/g, '');
  const normTarget = removeVietnameseTones(targetClass).toLowerCase().replace(/[^a-z0-9]/g, '');
  if (norm === normTarget || norm === 'lop' + normTarget || norm === 'k' + normTarget) {
    return true;
  }

  return false;
}

/**
 * Nhận diện Thứ trong tuần từ ô bảng tính bất kỳ (Thứ 2 đến Thứ 7)
 */
export function detectDay(val: any): string | null {
  if (!val) return null;
  const s = String(val).trim();
  const clean = removeVietnameseTones(s).toLowerCase();

  // 1. Kiểm tra khớp theo số: "Thứ 2", "Thu 2", "T2", "T.2", "T 2"
  const mNum = clean.match(/(?:thu|t\.?|t\s*)\s*([2-7])/);
  if (mNum) return mNum[1];

  // 2. Kiểm tra khớp theo chữ tiếng Việt (chú ý 'bay' trước 'ba' để tránh nhầm)
  if (clean.includes('bay')) return '7';
  if (clean.includes('hai')) return '2';
  if (/\bba\b/.test(clean) || clean.includes('thu ba') || clean.includes('thuba')) return '3';
  if (clean.includes('tu') || clean.includes('bon')) return '4';
  if (clean.includes('nam')) return '5';
  if (clean.includes('sau')) return '6';

  // 3. Tiếng Anh: Monday, Tue, Wed, Thu, Fri, Sat
  if (clean.includes('mon')) return '2';
  if (clean.includes('tue')) return '3';
  if (clean.includes('wed')) return '4';
  if (clean.includes('thu')) return '5';
  if (clean.includes('fri')) return '6';
  if (clean.includes('sat')) return '7';

  // Đơn giản là số 2..7 đứng độc lập
  if (/^[2-7]$/.test(clean)) return clean;

  return null;
}

/**
 * Nhận diện Tiết học từ ô bảng tính bất kỳ (Tiết 1 đến Tiết 5)
 */
export function detectPeriod(val: any): number | null {
  if (val === undefined || val === null || val === '') return null;
  const s = String(val).trim();

  // 1. Số nguyên đứng một mình: 1, 2, 3, 4, 5
  if (/^[1-5]$/.test(s)) return parseInt(s, 10);

  // 2. Chữ "Tiết 1", "T.1", "T1", "Tiết: 1", "tiet 1"
  const m = s.match(/(?:tiết|tiet|t\.?|t\s*)\s*([1-5])/i);
  if (m) return parseInt(m[1], 10);

  return null;
}

/**
 * Tự động phát hiện buổi học (Sáng / Chiều) từ tên file, tên sheet và nội dung
 */
export function detectSessionFromContext(
  fileName: string,
  sheetName: string,
  rowsSample: (string | number)[][],
  forcedSession?: 'Sáng' | 'Chiều' | 'Cả ngày' | 'auto'
): 'Sáng' | 'Chiều' | 'Cả ngày' {
  if (forcedSession && forcedSession !== 'auto') {
    return forcedSession;
  }

  const nameContext = removeVietnameseTones(`${fileName} ${sheetName}`).toLowerCase();

  // Ưu tiên 1: Tên file hoặc tên sheet chỉ định rõ ràng
  if (nameContext.includes('chieu') || nameContext.includes('afternoon') || nameContext.includes('buoi chieu') || nameContext.includes('tkb chieu')) {
    return 'Chiều';
  }
  if (nameContext.includes('sang') || nameContext.includes('morning') || nameContext.includes('buoi sang') || nameContext.includes('tkb sang')) {
    return 'Sáng';
  }

  // Ưu tiên 2: Quét nội dung tiêu đề các dòng đầu
  for (let r = 0; r < Math.min(rowsSample.length, 10); r++) {
    const text = removeVietnameseTones(rowsSample[r].join(' ').toLowerCase());
    if (text.includes('buoi chieu') || text.includes('tkb chieu') || text.includes('thoi khoa bieu buoi chieu')) {
      return 'Chiều';
    }
    if (text.includes('buoi sang') || text.includes('tkb sang') || text.includes('thoi khoa bieu buoi sang')) {
      return 'Sáng';
    }
  }

  // Ưu tiên 3: Quét các môn học đặc thù của buổi chiều THPT Cát Tiên (GDTC, GDQP, HDTNHN, Chuyên đề)
  let afternoonSubjectHits = 0;
  let morningSubjectHits = 0;
  for (let r = 0; r < Math.min(rowsSample.length, 40); r++) {
    const rowText = removeVietnameseTones(rowsSample[r].join(' ').toLowerCase());
    if (rowText.includes('gdtc') || rowText.includes('gdqp') || rowText.includes('hdtnhn') || rowText.includes('chuyen de')) {
      afternoonSubjectHits++;
    }
    if (rowText.includes('chao co') || rowText.includes('sinh hoat lop')) {
      morningSubjectHits++;
    }
  }

  if (afternoonSubjectHits >= 3 && morningSubjectHits === 0) {
    return 'Chiều';
  }

  return 'Sáng';
}

/**
 * Đếm số tiết học sáng và chiều trong thời khóa biểu
 */
export function countTimetableSlots(schedule: Timetable['schedule']): {
  morning: number;
  afternoon: number;
  total: number;
} {
  let morning = 0;
  let afternoon = 0;
  for (const day of ['2', '3', '4', '5', '6']) {
    for (const [pKey, slot] of Object.entries(schedule[day] || {})) {
      if (slot && slot.subject && slot.subject.trim()) {
        if (pKey.startsWith('c')) afternoon++;
        else morning++;
      }
    }
  }
  return { morning, afternoon, total: morning + afternoon };
}

/**
 * Hợp nhất thông minh lịch học: Giữ nguyên buổi không bị ghi đè
 */
export function mergeTimetableSchedules(
  base: Timetable,
  incomingSchedule: Timetable['schedule'],
  session: 'Sáng' | 'Chiều' | 'Cả ngày',
  incomingFileName?: string
): Timetable {
  const mergedSchedule: Timetable['schedule'] = {
    '2': { ...(base.schedule['2'] || {}) },
    '3': { ...(base.schedule['3'] || {}) },
    '4': { ...(base.schedule['4'] || {}) },
    '5': { ...(base.schedule['5'] || {}) },
    '6': { ...(base.schedule['6'] || {}) },
  };

  const days = ['2', '3', '4', '5', '6'];

  if (session === 'Sáng') {
    // Chỉ cập nhật các tiết sáng (1, 2, 3, 4, 5), giữ nguyên tiết chiều (c1, c2, c3, c4, c5)
    days.forEach((day) => {
      ['1', '2', '3', '4', '5'].forEach((p) => {
        delete mergedSchedule[day][p];
      });
      if (incomingSchedule[day]) {
        Object.entries(incomingSchedule[day]).forEach(([p, slot]) => {
          if (!p.startsWith('c') && slot && slot.subject) {
            mergedSchedule[day][p] = slot;
          }
        });
      }
    });
  } else if (session === 'Chiều') {
    // Chỉ cập nhật các tiết chiều (c1, c2, c3, c4, c5), giữ nguyên tiết sáng (1, 2, 3, 4, 5)
    days.forEach((day) => {
      ['c1', 'c2', 'c3', 'c4', 'c5'].forEach((p) => {
        delete mergedSchedule[day][p];
      });
      if (incomingSchedule[day]) {
        Object.entries(incomingSchedule[day]).forEach(([p, slot]) => {
          if (p.startsWith('c') && slot && slot.subject) {
            mergedSchedule[day][p] = slot;
          }
        });
      }
    });
  } else {
    // Cả ngày: ghi đè toàn bộ
    days.forEach((day) => {
      mergedSchedule[day] = { ...(incomingSchedule[day] || {}) };
    });
  }

  // Cập nhật tên file kết hợp nếu có
  let fileName = incomingFileName || base.fileName;
  if (base.fileName && incomingFileName && base.fileName !== incomingFileName) {
    if (session === 'Sáng') {
      fileName = `Sáng: ${incomingFileName} | Chiều: ${base.fileName}`;
    } else if (session === 'Chiều') {
      fileName = `Sáng: ${base.fileName} | Chiều: ${incomingFileName}`;
    }
  }

  return {
    ...base,
    updatedAt: new Date().toISOString(),
    updatedBy: 'Ban Cán Sự 11A10 (Import Excel)',
    fileName,
    schedule: mergedSchedule,
  };
}

/**
 * Xóa riêng một buổi trong thời khóa biểu (sáng hoặc chiều)
 */
export function clearSessionFromTimetable(timetable: Timetable, session: 'morning' | 'afternoon'): Timetable {
  const newSchedule: Timetable['schedule'] = {
    '2': { ...(timetable.schedule['2'] || {}) },
    '3': { ...(timetable.schedule['3'] || {}) },
    '4': { ...(timetable.schedule['4'] || {}) },
    '5': { ...(timetable.schedule['5'] || {}) },
    '6': { ...(timetable.schedule['6'] || {}) },
  };

  const days = ['2', '3', '4', '5', '6'];
  days.forEach((day) => {
    if (session === 'morning') {
      ['1', '2', '3', '4', '5'].forEach((p) => delete newSchedule[day][p]);
    } else {
      ['c1', 'c2', 'c3', 'c4', 'c5'].forEach((p) => delete newSchedule[day][p]);
    }
  });

  return {
    ...timetable,
    updatedAt: new Date().toISOString(),
    schedule: newSchedule,
  };
}

/**
 * Tạo và tải xuống file Excel mẫu chuẩn 4-5 tiết sáng + 4-5 tiết chiều (Thứ 2 đến Thứ 6)
 */
export function downloadSampleTimetableExcel() {
  const wsData = [
    ['THỜI KHÓA BIỂU LỚP 11A10 - TRƯỜNG THPT CÁT TIÊN (NĂM HỌC 2026 - 2027)'],
    ['(Quy chuẩn: Sáng & Chiều từ Thứ Hai đến Thứ Sáu - Nhập tên môn học vào từng ô)'],
    [],
    ['Buổi', 'Tiết', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu'],
    ['Sáng', 1, 'Chào cờ - BGH', 'Ngữ văn - Đ.V.Hường', 'KTPL - N.T.H.Yến', 'Toán - P.X.Cương', 'Toán - P.X.Cương'],
    ['Sáng', 2, 'Công nghệ Nông nghiệp - T.T.Hà', 'Ngữ văn - Đ.V.Hường', 'Tin học - H.S.Trúc', 'Toán - P.X.Cương', 'CĐ KTPL - N.T.H.Yến'],
    ['Sáng', 3, 'CĐ Lý - N.V.Phúc', 'Tin học - H.S.Trúc', 'Ngữ văn - Đ.V.Hường', 'Tiếng Anh - Đ.A.Tuấn', 'Tiếng Anh - Đ.A.Tuấn'],
    ['Sáng', 4, 'Lý - N.V.Phúc', 'Tiếng Anh - Đ.A.Tuấn', 'Lý - N.V.Phúc', 'Lịch sử - T.S.Khánh', 'KTPL - N.T.H.Yến'],
    ['Sáng', 5, '', '', '', '', 'Sinh hoạt lớp'],
    [],
    ['Chiều', 1, '', '', '', '', 'HDTNHN - Đ.A.Tuấn'],
    ['Chiều', 2, 'GDĐP SỬ - T.S.Khánh', 'CĐ Công nghệ - T.T.Hà', '', '', 'HDTNHN - Đ.A.Tuấn'],
    ['Chiều', 3, 'GDTC - Đ.V.Chiến', 'GDQPAN - V.V.Vượng', '', '', 'HDTNHN - Đ.A.Tuấn'],
    ['Chiều', 4, 'GDTC - Đ.V.Chiến', '', '', '', ''],
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws['!cols'] = [
    { wch: 10 },
    { wch: 8 },
    { wch: 32 },
    { wch: 32 },
    { wch: 32 },
    { wch: 32 },
    { wch: 32 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'TKB_11A10');
  XLSX.writeFile(wb, 'Mau_Thoi_Khoa_Bieu_11A10.xlsx');
}

/**
 * Trình phân tích chuyên sâu cho một Sheet cụ thể
 */
function parseSheetContent(
  rows: (string | number)[][],
  sheetName: string,
  fileName: string,
  targetClass: string,
  forcedSession?: 'Sáng' | 'Chiều' | 'Cả ngày' | 'auto'
): {
  schedule: Timetable['schedule'];
  slotCount: number;
  session: 'Sáng' | 'Chiều' | 'Cả ngày';
  foundClasses: string[];
} | null {
  if (!rows || rows.length === 0) return null;

  const foundClassesSet = new Set<string>();

  // 1. Quét tìm tất cả các tên lớp trong toàn bộ bảng
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    for (let c = 0; c < row.length; c++) {
      const cellVal = String(row[c] || '').trim();
      if (!cellVal) continue;
      const cleanVal = removeVietnameseTones(cellVal).toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (/^(10|11|12)[A-Z0-9]+$/.test(cleanVal)) {
        foundClassesSet.add(cellVal);
      }
    }
  }
  const foundClasses = Array.from(foundClassesSet);

  // 2. Xác định Buổi học của Sheet
  const session = detectSessionFromContext(fileName, sheetName, rows, forcedSession);

  // =========================================================================
  // ĐỊNH DẠNG 1: LỚP XẾP THEO CỘT (vnEdu, SMAS, School@net, Cát Tiên...)
  // =========================================================================
  let classCol = -1;
  let headerRow = -1;

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    for (let c = 0; c < row.length; c++) {
      if (matchTargetClass(row[c], targetClass)) {
        classCol = c;
        headerRow = r;
        break;
      }
    }
    if (classCol !== -1) break;
  }

  if (classCol !== -1) {
    // Tìm cột Thứ và cột Tiết ở bên trái của classCol
    let dayCol = -1;
    let periodCol = -1;

    for (let r = Math.max(0, headerRow - 3); r <= Math.min(rows.length - 1, headerRow + 1); r++) {
      const row = rows[r];
      for (let c = 0; c < classCol; c++) {
        const val = removeVietnameseTones(String(row[c] || '').toLowerCase().trim());
        if (val.includes('thu') || val.includes('ngay')) dayCol = c;
        else if (val.includes('tiet') || val.includes('buoi/tiet')) periodCol = c;
      }
    }

    const schedule: Timetable['schedule'] = {
      '2': {},
      '3': {},
      '4': {},
      '5': {},
      '6': {},
    };
    let currentDay = '';
    let slotCount = 0;

    for (let r = headerRow + 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.length === 0) continue;

      // Nhận diện Thứ
      let rowDay: string | null = null;
      if (dayCol !== -1 && row[dayCol] !== undefined && row[dayCol] !== '') {
        rowDay = detectDay(row[dayCol]);
      }
      if (!rowDay) {
        for (let c = 0; c < classCol; c++) {
          const d = detectDay(row[c]);
          if (d) {
            rowDay = d;
            if (dayCol === -1) dayCol = c;
            break;
          }
        }
      }
      if (rowDay) currentDay = rowDay;

      // Nhận diện Tiết
      let periodNum: number | null = null;
      if (periodCol !== -1 && row[periodCol] !== undefined && row[periodCol] !== '') {
        periodNum = detectPeriod(row[periodCol]);
      }
      if (!periodNum) {
        for (let c = 0; c < classCol; c++) {
          if (c === dayCol) continue;
          const p = detectPeriod(row[c]);
          if (p) {
            periodNum = p;
            if (periodCol === -1) periodCol = c;
            break;
          }
        }
      }

      // Đọc dữ liệu môn học
      if (currentDay && periodNum && currentDay in schedule) {
        const cellVal = String(row[classCol] || '').trim();
        const periodKey = session === 'Chiều' ? `c${periodNum}` : `${periodNum}`;

        if (cellVal) {
          let subject = cellVal;
          let teacher = 'Giáo viên bộ môn';

          if (cellVal.includes(' - ')) {
            const parts = cellVal.split(' - ');
            subject = parts[0].trim();
            teacher = parts.slice(1).join(' - ').trim();
          } else if (cellVal.match(/^([^(]+)\s*\(([^)]+)\)$/)) {
            const m = cellVal.match(/^([^(]+)\s*\(([^)]+)\)$/);
            if (m) {
              subject = m[1].trim();
              teacher = m[2].trim();
            }
          } else if (cellVal.includes('\n')) {
            const parts = cellVal.split('\n');
            subject = parts[0].trim();
            teacher = parts.slice(1).join(' ').trim();
          } else if (cellVal.includes(' / ')) {
            const parts = cellVal.split(' / ');
            subject = parts[0].trim();
            teacher = parts.slice(1).join(' / ').trim();
          }

          schedule[currentDay][periodKey] = {
            subject,
            teacher,
            room: session === 'Chiều' ? 'Phòng 204 (Chiều)' : 'Phòng 204 (Sáng)',
          };
          slotCount++;
        }
      }
    }

    if (slotCount > 0) {
      return { schedule, slotCount, session, foundClasses };
    }
  }

  // =========================================================================
  // ĐỊNH DẠNG 2: LỚP XẾP THEO DÒNG (Các lớp ở cột A hoặc B, Cột là Thứ & Tiết)
  // =========================================================================
  let classRow = -1;
  let classColIdx = -1;

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    for (let c = 0; c < Math.min(row.length, 6); c++) {
      if (matchTargetClass(row[c], targetClass)) {
        classRow = r;
        classColIdx = c;
        break;
      }
    }
    if (classRow !== -1) break;
  }

  if (classRow !== -1) {
    const colMap: Record<number, { day: string; period: number }> = {};
    let currentDay = '';

    for (let c = classColIdx + 1; c < (rows[0] ? rows[0].length : 60); c++) {
      for (let r = 0; r < classRow; r++) {
        const val = rows[r] ? rows[r][c] : '';
        const d = detectDay(val);
        if (d) currentDay = d;

        const p = detectPeriod(val);
        if (p && currentDay) {
          colMap[c] = { day: currentDay, period: p };
          break;
        }
      }
    }

    if (Object.keys(colMap).length >= 3) {
      const schedule: Timetable['schedule'] = {
        '2': {},
        '3': {},
        '4': {},
        '5': {},
        '6': {},
      };
      let slotCount = 0;

      const targetRow = rows[classRow];
      for (const [colIdxStr, { day, period }] of Object.entries(colMap)) {
        const c = parseInt(colIdxStr, 10);
        const cellVal = String(targetRow[c] || '').trim();
        if (cellVal && day in schedule) {
          const periodKey = session === 'Chiều' ? `c${period}` : `${period}`;
          schedule[day][periodKey] = {
            subject: cellVal,
            teacher: 'Giáo viên bộ môn',
            room: session === 'Chiều' ? 'Phòng 204 (Chiều)' : 'Phòng 204 (Sáng)',
          };
          slotCount++;
        }
      }

      if (slotCount > 0) {
        return { schedule, slotCount, session, foundClasses };
      }
    }
  }

  // =========================================================================
  // ĐỊNH DẠNG 3: BẢNG LỚP ĐƠN LẺ / FILE MẪU (Cột là Thứ Hai..Thứ Sáu, Dòng là Tiết)
  // =========================================================================
  const singleDayColMap: Record<string, number> = {};
  let singleHeaderRow = -1;

  for (let r = 0; r < Math.min(rows.length, 20); r++) {
    const row = rows[r];
    for (let c = 0; c < row.length; c++) {
      const d = detectDay(row[c]);
      if (d) {
        singleDayColMap[d] = c;
        singleHeaderRow = r;
      }
    }
    if (Object.keys(singleDayColMap).length >= 3) break;
  }

  if (Object.keys(singleDayColMap).length >= 3) {
    const schedule: Timetable['schedule'] = {
      '2': {},
      '3': {},
      '4': {},
      '5': {},
      '6': {},
    };
    let slotCount = 0;
    let rowSession = session;
    let hasMorning = false;
    let hasAfternoon = false;

    for (let r = singleHeaderRow + 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.length === 0) continue;

      const rowStr = removeVietnameseTones(row.map((v) => String(v)).join(' ').toLowerCase());
      if (rowStr.includes('buoi chieu') || rowStr.includes('chieu') || rowStr.includes('afternoon')) {
        rowSession = 'Chiều';
      } else if (rowStr.includes('buoi sang') || rowStr.includes('sang') || rowStr.includes('morning')) {
        rowSession = 'Sáng';
      }

      let periodNumber: number | null = null;
      for (let c = 0; c < Math.min(row.length, 5); c++) {
        const p = detectPeriod(row[c]);
        if (p) {
          periodNumber = p;
          break;
        }
      }

      if (!periodNumber) continue;

      const periodKey = rowSession === 'Chiều' ? `c${periodNumber}` : `${periodNumber}`;
      if (rowSession === 'Chiều') hasAfternoon = true;
      else hasMorning = true;

      Object.entries(singleDayColMap).forEach(([dKey, colIdx]) => {
        if (!(dKey in schedule)) return;
        const cellVal = String(row[colIdx] || '').trim();
        if (cellVal) {
          let subject = cellVal;
          let teacher = 'Giáo viên bộ môn';

          if (cellVal.includes(' - ')) {
            const parts = cellVal.split(' - ');
            subject = parts[0].trim();
            teacher = parts.slice(1).join(' - ').trim();
          } else if (cellVal.match(/^([^(]+)\s*\(([^)]+)\)$/)) {
            const m = cellVal.match(/^([^(]+)\s*\(([^)]+)\)$/);
            if (m) {
              subject = m[1].trim();
              teacher = m[2].trim();
            }
          }

          schedule[dKey][periodKey] = {
            subject,
            teacher,
            room: rowSession === 'Chiều' ? 'Phòng 204 (Chiều)' : 'Phòng 204 (Sáng)',
          };
          slotCount++;
        }
      });
    }

    if (slotCount > 0) {
      let finalSession: 'Sáng' | 'Chiều' | 'Cả ngày' = session;
      if (hasMorning && hasAfternoon) finalSession = 'Cả ngày';
      else if (hasAfternoon) finalSession = 'Chiều';
      else finalSession = 'Sáng';

      return { schedule, slotCount, session: finalSession, foundClasses };
    }
  }

  return { schedule: { '2': {}, '3': {}, '4': {}, '5': {}, '6': {} }, slotCount: 0, session, foundClasses };
}

/**
 * Đọc file Excel người dùng tải lên, tự động tìm đúng lớp 11A10 trong TKB toàn trường,
 * phát hiện buổi sáng/chiều và hỗ trợ gộp buổi thông minh.
 */
export async function parseTimetableFromExcel(
  file: File,
  options: ParseOptions = {}
): Promise<ParseResult> {
  const targetClass = options.targetClass || '11A10';
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });

  if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error('Tệp Excel rỗng hoặc không có trang tính (sheet) nào.');
  }

  // Sắp xếp các sheet ưu tiên: Sheet có tên lớp 11A10, TKB, Toàn trường, Khối 11...
  const sortedSheetNames = [...workbook.SheetNames].sort((a, b) => {
    const aNorm = removeVietnameseTones(a).toLowerCase();
    const bNorm = removeVietnameseTones(b).toLowerCase();
    const targetNorm = removeVietnameseTones(targetClass).toLowerCase();

    if (aNorm.includes(targetNorm)) return -1;
    if (bNorm.includes(targetNorm)) return 1;
    if (aNorm.includes('khoi 11') || aNorm.includes('k11')) return -1;
    if (bNorm.includes('khoi 11') || bNorm.includes('k11')) return 1;
    if (aNorm.includes('toan truong') || aNorm.includes('tkb')) return -1;
    if (bNorm.includes('toan truong') || bNorm.includes('tkb')) return 1;
    return 0;
  });

  let bestResult: {
    schedule: Timetable['schedule'];
    slotCount: number;
    session: 'Sáng' | 'Chiều' | 'Cả ngày';
    sheetName: string;
  } | null = null;

  let allFoundClassesAcrossSheets: string[] = [];

  for (const sheetName of sortedSheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) continue;

    const rows: (string | number)[][] = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
    });
    if (!rows || rows.length === 0) continue;

    const parsed = parseSheetContent(rows, sheetName, file.name, targetClass, options.forceSession);
    if (parsed) {
      if (parsed.foundClasses.length > 0) {
        allFoundClassesAcrossSheets = Array.from(
          new Set([...allFoundClassesAcrossSheets, ...parsed.foundClasses])
        );
      }

      if (parsed.slotCount > 0) {
        bestResult = {
          schedule: parsed.schedule,
          slotCount: parsed.slotCount,
          session: parsed.session,
          sheetName,
        };
        // Tìm thấy kết quả tốt, ưu tiên dừng lại
        break;
      }
    }
  }

  if (!bestResult || bestResult.slotCount === 0) {
    const classesListStr =
      allFoundClassesAcrossSheets.length > 0
        ? `\n\nCác lớp học nhận diện được trong tệp: ${allFoundClassesAcrossSheets.slice(0, 15).join(', ')}${
            allFoundClassesAcrossSheets.length > 15 ? '...' : ''
          }`
        : '';
    throw new Error(
      `Không tìm thấy dữ liệu thời khóa biểu cho lớp ${targetClass} trong tệp "${file.name}".${classesListStr}\n\nVui lòng kiểm tra lại xem tệp có chứa cột hoặc dòng của lớp ${targetClass} hay không!`
    );
  }

  let finalTimetable: Timetable = {
    classId: targetClass,
    updatedAt: new Date().toISOString(),
    updatedBy: `Lớp ${targetClass} (Import Excel)`,
    fileName: file.name,
    schedule: bestResult.schedule,
  };

  let isMerged = false;

  // Nếu người dùng cung cấp existingTimetable và file chỉ là một buổi -> Hợp nhất thông minh!
  if (options.existingTimetable && bestResult.session !== 'Cả ngày') {
    finalTimetable = mergeTimetableSchedules(
      options.existingTimetable,
      bestResult.schedule,
      bestResult.session,
      file.name
    );
    isMerged = true;
  }

  const finalStats = countTimetableSlots(finalTimetable.schedule);

  return {
    timetable: finalTimetable,
    detectedClass: targetClass,
    detectedSession: bestResult.session,
    sheetUsed: bestResult.sheetName,
    foundClasses: allFoundClassesAcrossSheets,
    morningSlotsCount: finalStats.morning,
    afternoonSlotsCount: finalStats.afternoon,
    totalSlotsCount: finalStats.total,
    fileName: file.name,
    isMerged,
  };
}

/**
 * Xử lý tải lên nhiều file cùng lúc (Ví dụ: File Sáng + File Chiều của trường)
 * Tự động phân loại file nào là Sáng, file nào là Chiều và gộp thành TKB hoàn chỉnh
 */
export async function processMultipleTimetableFiles(
  files: File[] | FileList,
  options: ParseOptions = {}
): Promise<ParseResult> {
  const fileArray = Array.from(files);
  if (fileArray.length === 0) {
    throw new Error('Chưa chọn tệp Excel nào.');
  }

  let currentTimetable: Timetable =
    options.existingTimetable || loadTimetableFromStorage() || EMPTY_TIMETABLE;

  // Nếu người dùng chọn đúng 2 file (thường là 1 file Sáng và 1 file Chiều)
  // Sắp xếp file Sáng trước, Chiều sau để nạp tuần tự và gộp chính xác
  const sortedFiles = [...fileArray].sort((a, b) => {
    const aName = removeVietnameseTones(a.name).toLowerCase();
    const bName = removeVietnameseTones(b.name).toLowerCase();
    if (aName.includes('sang') && bName.includes('chieu')) return -1;
    if (aName.includes('chieu') && bName.includes('sang')) return 1;
    return 0;
  });

  let lastResult: ParseResult | null = null;
  const processedFiles: string[] = [];

  for (let i = 0; i < sortedFiles.length; i++) {
    const file = sortedFiles[i];
    let fileForceSession = options.forceSession || 'auto';

    // Nếu người dùng chọn 2 file và tên file có gợi ý sáng/chiều:
    if (sortedFiles.length === 2 && fileForceSession === 'auto') {
      const fn = removeVietnameseTones(file.name).toLowerCase();
      if (fn.includes('sang') || fn.includes('morning')) fileForceSession = 'Sáng';
      else if (fn.includes('chieu') || fn.includes('afternoon')) fileForceSession = 'Chiều';
    }

    const result = await parseTimetableFromExcel(file, {
      ...options,
      forceSession: fileForceSession,
      existingTimetable: currentTimetable,
    });

    currentTimetable = result.timetable;
    lastResult = result;
    processedFiles.push(`${file.name} (${result.detectedSession})`);
  }

  if (!lastResult) {
    throw new Error('Không thể phân tích dữ liệu từ các tệp đã chọn.');
  }

  const finalStats = countTimetableSlots(currentTimetable.schedule);

  return {
    ...lastResult,
    timetable: currentTimetable,
    fileName: processedFiles.join(' + '),
    morningSlotsCount: finalStats.morning,
    afternoonSlotsCount: finalStats.afternoon,
    totalSlotsCount: finalStats.total,
    isMerged: sortedFiles.length > 1 || lastResult.isMerged,
  };
}

/**
 * Lưu thời khóa biểu vào LocalStorage
 */
export function saveTimetableToStorage(timetable: Timetable) {
  try {
    localStorage.setItem('11a10_timetable_data', JSON.stringify(timetable));
  } catch (e) {
    console.error('Không thể lưu TKB vào LocalStorage:', e);
  }
}

/**
 * Xóa dữ liệu thời khóa biểu khỏi LocalStorage
 */
export function clearTimetableFromStorage() {
  localStorage.removeItem('11a10_timetable_data');
}

/**
 * Tải thời khóa biểu từ LocalStorage (hoặc null nếu chưa có)
 */
export function loadTimetableFromStorage(): Timetable | null {
  const raw = localStorage.getItem('11a10_timetable_data');
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    if (
      data &&
      (data.fileName === 'TKB_11A10_HocKy2.xlsx' ||
        data.updatedBy === 'Thầy Chủ Nhiệm & Ban Cán Sự' ||
        (data.schedule?.['2']?.['1']?.subject === 'Chào cờ' && data.schedule?.['2']?.['1']?.teacher === 'BGH' && !data.schedule?.['2']?.['2']?.subject))
    ) {
      localStorage.removeItem('11a10_timetable_data');
      return null;
    }
    if (data && data.schedule && data.schedule['7']) {
      delete data.schedule['7'];
      localStorage.setItem('11a10_timetable_data', JSON.stringify(data));
    }
    return data;
  } catch {
    return null;
  }
}
