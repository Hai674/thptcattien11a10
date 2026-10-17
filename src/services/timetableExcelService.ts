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
  fileName: '',
  morningFileName: '',
  afternoonFileName: '',
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
 * Bảng giáo viên bộ môn chính thức của lớp 11A10 - THPT Cát Tiên
 * Dùng để tự động làm giàu thông tin khi file trường chỉ có tên môn học
 */
export const DEFAULT_11A10_TEACHERS = [
  { match: ['toan', 'toan hoc', 'dai so', 'hinh hoc'], subject: 'Toán', teacher: 'P.X.Cương' },
  { match: ['ngu van', 'van', 'van hoc'], subject: 'Ngữ văn', teacher: 'Đ.V.Hường' },
  { match: ['tieng anh', 'anh', 'tienganh', 'ngoai ngu', 'nn'], subject: 'Tiếng Anh', teacher: 'Đ.A.Tuấn' },
  { match: ['vat ly', 'vat li', 'ly', 'li'], subject: 'Vật lý', teacher: 'N.V.Phúc' },
  { match: ['hoa hoc', 'hoa'], subject: 'Hóa học', teacher: 'Giáo viên bộ môn' },
  { match: ['sinh hoc', 'sinh'], subject: 'Sinh học', teacher: 'Giáo viên bộ môn' },
  { match: ['lich su', 'su'], subject: 'Lịch sử', teacher: 'T.S.Khánh' },
  { match: ['dia ly', 'dia li', 'dia'], subject: 'Địa lý', teacher: 'Giáo viên bộ môn' },
  { match: ['ktpl', 'gdkt&pl', 'kinh te phap luat', 'gdcd'], subject: 'KTPL', teacher: 'N.T.H.Yến' },
  { match: ['tin hoc', 'tin'], subject: 'Tin học', teacher: 'H.S.Trúc' },
  { match: ['cong nghe', 'cn', 'cong nghe nong nghiep', 'cn nong nghiep'], subject: 'Công nghệ Nông nghiệp', teacher: 'T.T.Hà' },
  { match: ['gdtc', 'the duc', 'td'], subject: 'GDTC', teacher: 'Đ.V.Chiến' },
  { match: ['gdqp', 'gdqpan', 'gdqp-an', 'quoc phong', 'qp'], subject: 'GDQPAN', teacher: 'V.V.Vượng' },
  { match: ['hdtnhn', 'trai nghiem', 'hdtn'], subject: 'HDTNHN', teacher: 'Đ.A.Tuấn' },
  { match: ['gddp', 'dia phuong', 'gddp su'], subject: 'GDĐP SỬ', teacher: 'T.S.Khánh' },
  { match: ['chao co', 'cc'], subject: 'Chào cờ', teacher: 'BGH' },
  { match: ['sinh hoat lop', 'sinh hoat', 'shl'], subject: 'Sinh hoạt lớp', teacher: 'P.X.Cương (GVCN)' },
  { match: ['cd toan'], subject: 'CĐ Toán', teacher: 'P.X.Cương' },
  { match: ['cd ly', 'cd vat ly'], subject: 'CĐ Lý', teacher: 'N.V.Phúc' },
  { match: ['cd ktpl'], subject: 'CĐ KTPL', teacher: 'N.T.H.Yến' },
  { match: ['cd cong nghe', 'cd cn', 'cd cong nghe nong nghiep'], subject: 'CĐ Công nghệ Nông nghiệp', teacher: 'T.T.Hà' },
];

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
 */
export function matchTargetClass(cellVal: any, targetClass = '11A10'): boolean {
  if (!cellVal) return false;
  const raw = String(cellVal).trim();
  const clean = removeVietnameseTones(raw).toLowerCase().trim();

  const tm = targetClass.match(/^(\d+)\s*([a-zA-Z]*)\s*(\d*)$/);
  if (!tm) {
    const norm = clean.replace(/[^a-z0-9]/g, '');
    const normTarget = removeVietnameseTones(targetClass).toLowerCase().replace(/[^a-z0-9]/g, '');
    return norm === normTarget || norm === 'lop' + normTarget;
  }

  const [, grade, letter, num] = tm;
  let patternStr = '';
  if (letter && num) {
    patternStr = `(?:^|[^a-z0-9])(?:lop\\s*|khoi\\s*)?${grade}\\s*[-_./]?\\s*(?:${letter.toLowerCase()}|[./-])?\\s*${num}(?:[^a-z0-9]|$)`;
  } else if (num) {
    patternStr = `(?:^|[^a-z0-9])(?:lop\\s*|khoi\\s*)?${grade}\\s*[-_./]?\\s*${num}(?:[^a-z0-9]|$)`;
  } else {
    patternStr = `(?:^|[^a-z0-9])(?:lop\\s*|khoi\\s*)?${grade}\\s*[-_./]?\\s*${letter.toLowerCase()}(?:[^a-z0-9]|$)`;
  }

  const regex = new RegExp(patternStr, 'i');
  if (regex.test(clean)) return true;

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

  // Khớp chính xác "Thứ 2", "T2", "T.2", "Thứ: 2", "Ngày 2"
  const mNum = clean.match(/^(?:thu\s*|t\.?\s*|ngay\s*)([2-7])$/);
  if (mNum) return mNum[1];

  // Khớp chính xác chữ ngày tiếng Việt trọn vẹn (không match nửa vời)
  if (/^thu\s*(?:hai|ba|tu|bon|nam|sau|bay)$/.test(clean)) {
    if (clean.includes('hai')) return '2';
    if (clean.includes('ba')) return '3';
    if (clean.includes('tu') || clean.includes('bon')) return '4';
    if (clean.includes('nam')) return '5';
    if (clean.includes('sau')) return '6';
    if (clean.includes('bay')) return '7';
  }

  // Khớp tiếng Anh trọn vẹn
  if (/^(?:monday|mon\.?)$/.test(clean)) return '2';
  if (/^(?:tuesday|tue\.?)$/.test(clean)) return '3';
  if (/^(?:wednesday|wed\.?)$/.test(clean)) return '4';
  if (/^(?:thursday|thu\.?)$/.test(clean)) return '5';
  if (/^(?:friday|fri\.?)$/.test(clean)) return '6';
  if (/^(?:saturday|sat\.?)$/.test(clean)) return '7';

  // Chữ số nguyên đơn lẻ từ 2 đến 7
  if (/^[2-7]$/.test(clean)) return clean;
  return null;
}

/**
 * Nhận diện Tiết học từ ô bảng tính (Tiết 1 đến Tiết 10)
 * Hỗ trợ cả tiết 6, 7, 8, 9, 10 của buổi chiều
 */
export function detectPeriod(val: any): number | null {
  if (val === undefined || val === null || val === '') return null;
  const s = String(val).trim();

  // Số nguyên 1 đến 10
  if (/^([1-9]|10)$/.test(s)) return parseInt(s, 10);

  // Chữ "Tiết 1", "T.1", "T1", "Tiết: 1", "tiet 1", "Tiết 6"...
  const m = s.match(/^(?:tiết|tiet|t\.?|t\s*)?\s*([1-9]|10)$/i);
  if (m) return parseInt(m[1], 10);

  return null;
}

/**
 * Trích xuất chuẩn xác Môn học và Giáo viên từ ô bảng tính
 * Xử lý: ô nhiều dòng, dấu gạch nối, dấu ngoặc, dòng kế tiếp và tự động làm giàu từ danh sách giáo viên
 */
export function parseSubjectAndTeacher(
  cellVal: any,
  nextRowVal: any = ''
): { subject: string; teacher: string } {
  let raw = String(cellVal || '').trim();
  let next = String(nextRowVal || '').trim();

  raw = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  next = next.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  let subject = '';
  let teacher = '';

  // 1. Ô có nhiều dòng (Alt + Enter)
  if (raw.includes('\n')) {
    const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length >= 2) {
      subject = lines[0];
      teacher = lines.slice(1).join(' - ');
    } else if (lines.length === 1) {
      subject = lines[0];
    }
  }

  // 2. Ngăn cách bằng gạch nối: "Toán - P.X.Cương", "Toán-P.X.Cương", "Toán – P.X.Cương"
  if (!subject) {
    const dashMatch = raw.match(/^([^-–—]+)\s*[-–—]\s*(.+)$/);
    if (dashMatch) {
      subject = dashMatch[1].trim();
      teacher = dashMatch[2].trim();
    }
  }

  // 3. Ngăn cách bằng ngoặc: "Toán (P.X.Cương)" hoặc "Toán (Cương)"
  if (!subject) {
    const parenMatch = raw.match(/^([^(]+)\s*\(([^)]+)\)$/);
    if (parenMatch) {
      subject = parenMatch[1].trim();
      teacher = parenMatch[2].trim();
    }
  }

  // 4. Ngăn cách bằng dấu xuyệt hoặc hai chấm: "Toán / P.X.Cương" hoặc "Toán: P.X.Cương"
  if (!subject) {
    const slashMatch = raw.match(/^([^/:]+)\s*[/:]\s*(.+)$/);
    if (slashMatch) {
      subject = slashMatch[1].trim();
      teacher = slashMatch[2].trim();
    }
  }

  // 5. Nếu chưa tách được, subject là toàn bộ chuỗi
  if (!subject) {
    subject = raw;
  }

  // 6. Nếu chưa có teacher, kiểm tra dòng tiếp theo (nextRowVal)
  if ((!teacher || teacher === 'Giáo viên bộ môn') && next) {
    const nextNorm = removeVietnameseTones(next).toLowerCase();
    const isNextSubject = DEFAULT_11A10_TEACHERS.some((item) =>
      item.match.some((m) => nextNorm === m)
    );
    if (!isNextSubject && !/^(tiết|tiet|thứ|thu|\d+$)/i.test(nextNorm)) {
      teacher = next;
    }
  }

  // 7. Làm sạch tiền tố dư thừa
  if (teacher) {
    teacher = teacher.replace(/^gv\s*[:.-]?\s*/i, '').trim();
  }

  // 8. Tự động làm giàu thông tin giáo viên nếu file chỉ ghi tên môn
  if (!teacher || teacher === 'Giáo viên bộ môn') {
    const subNorm = removeVietnameseTones(subject).toLowerCase();
    for (const item of DEFAULT_11A10_TEACHERS) {
      if (item.match.some((m) => subNorm === m || subNorm.startsWith(m + ' ') || subNorm.endsWith(' ' + m))) {
        teacher = item.teacher;
        break;
      }
    }
  }

  return {
    subject: subject || raw,
    teacher: teacher || 'Giáo viên bộ môn',
  };
}

/**
 * Tự động phát hiện buổi học (Sáng / Chiều) siêu chuẩn xác
 * Hỗ trợ các từ khóa: Buổi 2, Buổi Chiều, Trái Buổi, B2, TKB2, Chiều...
 * Tự động phân tích các môn đặc thù của buổi chiều (GDTC, GDQP, HDTNHN...)
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

  // 1. Tên file hoặc tên sheet chỉ định rõ ràng
  if (
    nameContext.includes('chieu') ||
    nameContext.includes('afternoon') ||
    nameContext.includes('buoi 2') ||
    nameContext.includes('buoi2') ||
    nameContext.includes('buoi hai') ||
    nameContext.includes('trai buoi') ||
    nameContext.includes('b2') ||
    nameContext.includes('tkb2') ||
    nameContext.includes('ca chieu')
  ) {
    return 'Chiều';
  }
  if (
    nameContext.includes('sang') ||
    nameContext.includes('morning') ||
    nameContext.includes('buoi 1') ||
    nameContext.includes('buoi1') ||
    nameContext.includes('buoi mot') ||
    nameContext.includes('chinh khoa') ||
    nameContext.includes('b1') ||
    nameContext.includes('tkb1') ||
    nameContext.includes('ca sang')
  ) {
    return 'Sáng';
  }

  // 2. Quét tiêu đề và các dòng đầu bảng
  let afternoonHits = 0;
  let morningHits = 0;

  for (let r = 0; r < Math.min(rowsSample.length, 30); r++) {
    const text = removeVietnameseTones(rowsSample[r].join(' ').toLowerCase());
    if (
      text.includes('buoi chieu') ||
      text.includes('tkb chieu') ||
      text.includes('thoi khoa bieu buoi chieu') ||
      text.includes('buoi 2') ||
      text.includes('buoi hai') ||
      text.includes('trai buoi')
    ) {
      return 'Chiều';
    }
    if (
      text.includes('buoi sang') ||
      text.includes('tkb sang') ||
      text.includes('thoi khoa bieu buoi sang') ||
      text.includes('buoi 1') ||
      text.includes('chinh khoa')
    ) {
      return 'Sáng';
    }
    if (text.includes('gdtc') || text.includes('gdqp') || text.includes('hdtnhn') || text.includes('chuyen de')) {
      afternoonHits++;
    }
    if (text.includes('chao co') || text.includes('sinh hoat lop')) {
      morningHits++;
    }
  }

  if (afternoonHits >= 2 && morningHits === 0) {
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
 * Làm sạch tên file, loại bỏ tiền tố đệ quy như "Sáng:", "Chiều:", "(Sáng)", "(Chiều)"
 */
export function cleanRawFileName(fileName?: string): string {
  if (!fileName) return '';
  let clean = String(fileName).trim();
  while (/^(?:Sáng|Chiều|Cả ngày):\s*/i.test(clean)) {
    clean = clean.replace(/^(?:Sáng|Chiều|Cả ngày):\s*/i, '').trim();
  }
  clean = clean.replace(/\s*\((?:Sáng|Chiều|Cả ngày)\)$/i, '').trim();
  if (clean.includes('|')) {
    const parts = clean.split('|').map((p) => cleanRawFileName(p)).filter(Boolean);
    if (parts.length > 0) return parts[0];
  }
  return clean;
}

/**
 * Trích xuất tên file Sáng và Chiều từ một chuỗi fileName bất kỳ (kể cả chuỗi cũ lặp)
 */
export function extractSessionFileNames(combinedName?: string): { morning?: string; afternoon?: string } {
  if (!combinedName) return {};
  let morning: string | undefined;
  let afternoon: string | undefined;

  const parts = combinedName.split('|').map((s) => s.trim());
  for (const part of parts) {
    if (/^Sáng:/i.test(part)) {
      const fn = cleanRawFileName(part);
      if (fn && !morning) morning = fn;
    } else if (/^Chiều:/i.test(part)) {
      const fn = cleanRawFileName(part);
      if (fn && !afternoon) afternoon = fn;
    } else if (!morning && !afternoon) {
      const fn = cleanRawFileName(part);
      if (fn.toLowerCase().includes('sang')) morning = fn;
      else if (fn.toLowerCase().includes('chieu')) afternoon = fn;
    }
  }

  return { morning, afternoon };
}

/**
 * Tạo chuỗi hiển thị tên file nguồn chuẩn xác, không bao giờ lặp lại
 */
export function formatCombinedFileName(
  morningFn?: string,
  afternoonFn?: string,
  fallbackFn?: string
): string {
  const cleanM = cleanRawFileName(morningFn);
  const cleanA = cleanRawFileName(afternoonFn);

  if (cleanM && cleanA) {
    if (cleanM === cleanA) return cleanM;
    return `Sáng: ${cleanM} | Chiều: ${cleanA}`;
  }
  if (cleanM) return `Sáng: ${cleanM}`;
  if (cleanA) return `Chiều: ${cleanA}`;
  return cleanRawFileName(fallbackFn);
}

/**
 * Xóa trắng nguồn tệp đã nạp khỏi Thời khóa biểu
 */
export function clearTimetableSourceFiles(timetable: Timetable): Timetable {
  return {
    ...timetable,
    fileName: '',
    morningFileName: '',
    afternoonFileName: '',
    updatedAt: new Date().toISOString(),
  };
}

/**
 * HỢP NHẤT BẢO TOÀN LỊCH HỌC TUYỆT ĐỐI
 * - Khi nạp buổi Chiều: Cập nhật c1..c5, GIỮ NGUYÊN 100% các tiết sáng (1..5)
 * - Khi nạp buổi Sáng: Cập nhật 1..5, GIỮ NGUYÊN 100% các tiết chiều (c1..c5)
 * - Không bao giờ xảy ra tình trạng "up buổi lên thì sáng mất"!
 */
export function mergeTimetableSchedules(
  base: Timetable,
  incomingSchedule: Timetable['schedule'],
  session: 'Sáng' | 'Chiều' | 'Cả ngày',
  incomingFileName?: string
): Timetable {
  const mergedSchedule: Timetable['schedule'] = {
    '2': { ...(base?.schedule?.['2'] || {}) },
    '3': { ...(base?.schedule?.['3'] || {}) },
    '4': { ...(base?.schedule?.['4'] || {}) },
    '5': { ...(base?.schedule?.['5'] || {}) },
    '6': { ...(base?.schedule?.['6'] || {}) },
  };

  const days = ['2', '3', '4', '5', '6'];

  let incomingHasMorning = false;
  let incomingHasAfternoon = false;
  for (const d of days) {
    for (const [pKey, slot] of Object.entries(incomingSchedule[d] || {})) {
      if (slot && slot.subject) {
        if (pKey.startsWith('c')) incomingHasAfternoon = true;
        else incomingHasMorning = true;
      }
    }
  }

  if (session === 'Chiều' || (!incomingHasMorning && incomingHasAfternoon)) {
    // 1. Chỉ cập nhật tiết chiều (c1..c5)
    // 2. TUYỆT ĐỐI KHÔNG XÓA HOẶC THAY ĐỔI CÁC TIẾT SÁNG (1..5)!
    for (const d of days) {
      ['c1', 'c2', 'c3', 'c4', 'c5'].forEach((p) => delete mergedSchedule[d][p]);
      if (incomingSchedule[d]) {
        for (const [pKey, slot] of Object.entries(incomingSchedule[d])) {
          if (slot && slot.subject) {
            const pNum = pKey.replace(/\D/g, '');
            const normalizedKey = `c${pNum}`;
            mergedSchedule[d][normalizedKey] = {
              ...slot,
              room: slot.room || 'Phòng 204 (Chiều)',
            };
          }
        }
      }
    }
  } else if (session === 'Sáng' || (incomingHasMorning && !incomingHasAfternoon)) {
    // 1. Chỉ cập nhật tiết sáng (1..5)
    // 2. TUYỆT ĐỐI KHÔNG XÓA HOẶC THAY ĐỔI CÁC TIẾT CHIỀU (c1..c5)!
    for (const d of days) {
      ['1', '2', '3', '4', '5'].forEach((p) => delete mergedSchedule[d][p]);
      if (incomingSchedule[d]) {
        for (const [pKey, slot] of Object.entries(incomingSchedule[d])) {
          if (slot && slot.subject) {
            const pNum = pKey.replace(/\D/g, '');
            if (pNum) {
              mergedSchedule[d][pNum] = {
                ...slot,
                room: slot.room || 'Phòng 204 (Sáng)',
              };
            }
          }
        }
      }
    }
  } else {
    // Cả ngày: file chứa cả sáng và chiều
    for (const d of days) {
      if (incomingSchedule[d]) {
        for (const [pKey, slot] of Object.entries(incomingSchedule[d])) {
          if (slot && slot.subject) {
            mergedSchedule[d][pKey] = slot;
          }
        }
      }
    }
  }

  const cleanIncoming = cleanRawFileName(incomingFileName);
  let currentMorningFn = base?.morningFileName || extractSessionFileNames(base?.fileName).morning || '';
  let currentAfternoonFn = base?.afternoonFileName || extractSessionFileNames(base?.fileName).afternoon || '';

  if (session === 'Sáng' || (incomingHasMorning && !incomingHasAfternoon)) {
    currentMorningFn = cleanIncoming;
  } else if (session === 'Chiều' || (!incomingHasMorning && incomingHasAfternoon)) {
    currentAfternoonFn = cleanIncoming;
  } else {
    currentMorningFn = cleanIncoming;
    currentAfternoonFn = cleanIncoming;
  }

  const finalFileName = formatCombinedFileName(currentMorningFn, currentAfternoonFn, cleanIncoming);

  return {
    ...base,
    updatedAt: new Date().toISOString(),
    updatedBy: 'Ban Cán Sự 11A10 (Import Excel)',
    fileName: finalFileName,
    morningFileName: currentMorningFn,
    afternoonFileName: currentAfternoonFn,
    schedule: mergedSchedule,
  };
}

/**
 * Chuyển đổi linh hoạt giữa lịch Sáng và Chiều khi cần
 */
export function toggleTimetableSession(timetable: Timetable, targetSession: 'Sáng' | 'Chiều'): Timetable {
  const newSchedule: Timetable['schedule'] = {
    '2': {},
    '3': {},
    '4': {},
    '5': {},
    '6': {},
  };

  const days = ['2', '3', '4', '5', '6'];

  days.forEach((d) => {
    const slots = timetable.schedule[d] || {};
    Object.entries(slots).forEach(([p, slot]) => {
      if (!slot) return;
      if (targetSession === 'Chiều') {
        // Chuyển 1..5 thành c1..c5
        const pNum = p.replace(/\D/g, '');
        const newKey = `c${pNum}`;
        newSchedule[d][newKey] = slot;
      } else {
        // Chuyển c1..c5 thành 1..5
        const pNum = p.replace(/\D/g, '');
        newSchedule[d][pNum] = slot;
      }
    });
  });

  return {
    ...timetable,
    updatedAt: new Date().toISOString(),
    schedule: newSchedule,
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

  const stats = countTimetableSlots(newSchedule);
  let morningFn = session === 'morning' ? '' : (timetable.morningFileName || extractSessionFileNames(timetable.fileName).morning || '');
  let afternoonFn = session === 'afternoon' ? '' : (timetable.afternoonFileName || extractSessionFileNames(timetable.fileName).afternoon || '');

  if (stats.morning === 0) morningFn = '';
  if (stats.afternoon === 0) afternoonFn = '';

  const newFileName = stats.total === 0 ? '' : formatCombinedFileName(morningFn, afternoonFn);

  return {
    ...timetable,
    updatedAt: new Date().toISOString(),
    fileName: newFileName,
    morningFileName: morningFn,
    afternoonFileName: afternoonFn,
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

  // Xác định Buổi học của Sheet
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
    let dayCol = 0;
    let periodCol = 1;

    // Tìm cột Thứ và cột Tiết ở hàng tiêu đề (headerRow) hoặc các hàng trước đó
    for (let c = 0; c < Math.min(6, classCol); c++) {
      const valHeader = removeVietnameseTones(String(rows[headerRow]?.[c] || '')).toLowerCase().trim();
      if (valHeader === 'thu' || valHeader === 'ngay' || valHeader === 'thu/ngay' || valHeader === 'thu ngay') {
        dayCol = c;
      } else if (valHeader === 'tiet' || valHeader === 'buoi/tiet' || valHeader === 'tiet/buoi' || valHeader === 'tiet hoc') {
        periodCol = c;
      }
    }

    if (headerRow > 0 && dayCol === 0 && periodCol === 1) {
      for (let c = 0; c < Math.min(6, classCol); c++) {
        const valAbove = removeVietnameseTones(String(rows[headerRow - 1]?.[c] || '')).toLowerCase().trim();
        if (valAbove === 'thu' || valAbove === 'ngay') dayCol = c;
        if (valAbove === 'tiet') periodCol = c;
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
    let afternoonIndicatorsCount = 0;

    for (let r = headerRow + 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.length === 0) continue;

      // 1. Nhận diện Thứ trong tuần từ dayCol DUY NHẤT (không quét lung tung sang các cột lớp khác)
      const dayVal = row[dayCol];
      const parsedDay = detectDay(dayVal);
      if (parsedDay) {
        currentDay = parsedDay;
      }

      // 2. Nhận diện Tiết học từ periodCol DUY NHẤT (hoặc các cột đầu 0..2)
      let periodNum = detectPeriod(row[periodCol]);
      if (!periodNum) {
        for (let c = 0; c < Math.min(3, classCol); c++) {
          if (c === dayCol) continue;
          const p = detectPeriod(row[c]);
          if (p) {
            periodNum = p;
            break;
          }
        }
      }

      if (currentDay && periodNum && currentDay in schedule) {
        const cellVal = String(row[classCol] || '').trim();

        // Đọc giá trị dòng kế tiếp để tìm giáo viên nếu dòng kế không có số tiết mới (2 dòng / tiết)
        const nextRow = rows[r + 1];
        let nextRowVal = '';
        if (nextRow) {
          const nextPeriod = periodCol !== -1 ? detectPeriod(nextRow[periodCol]) : null;
          if (!nextPeriod) {
            nextRowVal = String(nextRow[classCol] || '').trim();
          }
        }

        if (cellVal) {
          const { subject, teacher } = parseSubjectAndTeacher(cellVal, nextRowVal);

          // Kiểm tra xem môn học có phải là môn đặc thù buổi chiều không
          const subClean = removeVietnameseTones(subject).toLowerCase();
          if (
            subClean.includes('gdtc') ||
            subClean.includes('gdqp') ||
            subClean.includes('hdtnhn') ||
            subClean.includes('gddp') ||
            subClean.includes('chuyen de')
          ) {
            afternoonIndicatorsCount++;
          }

          let periodKey = '';
          if (periodNum > 5) {
            periodKey = `c${periodNum - 5}`;
          } else if (session === 'Chiều') {
            periodKey = `c${periodNum}`;
          } else {
            periodKey = `${periodNum}`;
          }

          schedule[currentDay][periodKey] = {
            subject,
            teacher,
            room: session === 'Chiều' || periodNum > 5 ? 'Phòng 204 (Chiều)' : 'Phòng 204 (Sáng)',
          };
          slotCount++;
        }
      }
    }

    // Nếu lúc đầu đoán là Sáng nhưng các môn đọc được toàn là môn Chiều -> Tự động chuyển thành Chiều!
    let finalSession = session;
    if (session === 'Sáng' && afternoonIndicatorsCount >= 2 && forcedSession !== 'Sáng') {
      finalSession = 'Chiều';
      // Đổi các key 1..5 thành c1..c5
      for (const d of ['2', '3', '4', '5', '6']) {
        const daySlots = { ...(schedule[d] || {}) };
        schedule[d] = {};
        for (const [p, slot] of Object.entries(daySlots)) {
          const pNum = p.replace(/\D/g, '');
          schedule[d][`c${pNum}`] = {
            ...slot,
            room: 'Phòng 204 (Chiều)',
          };
        }
      }
    }

    if (slotCount > 0) {
      return { schedule, slotCount, session: finalSession, foundClasses };
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
          const { subject, teacher } = parseSubjectAndTeacher(cellVal, '');
          const periodKey =
            period > 5 ? `c${period - 5}` : session === 'Chiều' ? `c${period}` : `${period}`;

          schedule[day][periodKey] = {
            subject,
            teacher,
            room: session === 'Chiều' || period > 5 ? 'Phòng 204 (Chiều)' : 'Phòng 204 (Sáng)',
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
      if (rowStr.includes('buoi chieu') || rowStr.includes('chieu') || rowStr.includes('afternoon') || rowStr.includes('buoi 2')) {
        rowSession = 'Chiều';
      } else if (rowStr.includes('buoi sang') || rowStr.includes('sang') || rowStr.includes('morning') || rowStr.includes('buoi 1')) {
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

      const isAfternoonSlot = rowSession === 'Chiều' || periodNumber > 5;
      const actualP = periodNumber > 5 ? periodNumber - 5 : periodNumber;
      const periodKey = isAfternoonSlot ? `c${actualP}` : `${actualP}`;

      if (isAfternoonSlot) hasAfternoon = true;
      else hasMorning = true;

      Object.entries(singleDayColMap).forEach(([dKey, colIdx]) => {
        if (!(dKey in schedule)) return;
        const cellVal = String(row[colIdx] || '').trim();
        if (cellVal) {
          const { subject, teacher } = parseSubjectAndTeacher(cellVal, '');
          schedule[dKey][periodKey] = {
            subject,
            teacher,
            room: isAfternoonSlot ? 'Phòng 204 (Chiều)' : 'Phòng 204 (Sáng)',
          };
          slotCount++;
        }
      });
    }

    if (slotCount > 0) {
      let finalSession: 'Sáng' | 'Chiều' | 'Cả ngày' = session;
      if (forcedSession && forcedSession !== 'auto') {
        finalSession = forcedSession;
      } else if (hasMorning && hasAfternoon) {
        finalSession = 'Cả ngày';
      } else if (hasAfternoon) {
        finalSession = 'Chiều';
      } else {
        finalSession = 'Sáng';
      }

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

  // Nếu người dùng cung cấp existingTimetable: LUÔN HỢP NHẤT BẢO TOÀN BUỔI KIA!
  if (options.existingTimetable) {
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
    options.existingTimetable ||
    (typeof window !== 'undefined' ? loadTimetableFromStorage() : null) ||
    EMPTY_TIMETABLE;

  // Phân loại và sắp xếp: Sáng trước, Chiều sau
  const sortedFiles = [...fileArray].sort((a, b) => {
    const aName = removeVietnameseTones(a.name).toLowerCase();
    const bName = removeVietnameseTones(b.name).toLowerCase();
    const isASang = aName.includes('sang') || aName.includes('buoi 1') || aName.includes('b1');
    const isBChieu = bName.includes('chieu') || bName.includes('buoi 2') || bName.includes('b2');
    if (isASang && isBChieu) return -1;
    const isAChieu = aName.includes('chieu') || aName.includes('buoi 2') || aName.includes('b2');
    const isBSang = bName.includes('sang') || bName.includes('buoi 1') || bName.includes('b1');
    if (isAChieu && isBSang) return 1;
    return 0;
  });

  let lastResult: ParseResult | null = null;
  const processedFiles: string[] = [];

  for (let i = 0; i < sortedFiles.length; i++) {
    const file = sortedFiles[i];
    let fileForceSession = options.forceSession || 'auto';

    if (fileForceSession === 'auto') {
      const fn = removeVietnameseTones(file.name).toLowerCase();
      if (
        fn.includes('chieu') ||
        fn.includes('buoi 2') ||
        fn.includes('b2') ||
        fn.includes('trai buoi') ||
        fn.includes('afternoon')
      ) {
        fileForceSession = 'Chiều';
      } else if (
        fn.includes('sang') ||
        fn.includes('buoi 1') ||
        fn.includes('b1') ||
        fn.includes('morning') ||
        fn.includes('chinh khoa')
      ) {
        fileForceSession = 'Sáng';
      } else if (sortedFiles.length === 2) {
        fileForceSession = i === 0 ? 'Sáng' : 'Chiều';
      }
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
    fileName: currentTimetable.fileName || processedFiles.join(' + '),
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
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
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
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  localStorage.removeItem('11a10_timetable_data');
}

/**
 * Tải thời khóa biểu từ LocalStorage (hoặc null nếu chưa có)
 */
export function loadTimetableFromStorage(): Timetable | null {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null;
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
    }

    // Tự động chuẩn hóa và làm sạch fileName nếu chứa chuỗi lặp từ các lần nạp trước
    if (data && data.schedule) {
      const stats = countTimetableSlots(data.schedule);
      if (stats.total === 0) {
        data.fileName = '';
        data.morningFileName = '';
        data.afternoonFileName = '';
      } else if (data.fileName) {
        const extracted = extractSessionFileNames(data.fileName);
        const morningFn = data.morningFileName || extracted.morning || '';
        const afternoonFn = data.afternoonFileName || extracted.afternoon || '';
        data.morningFileName = stats.morning > 0 ? cleanRawFileName(morningFn) : '';
        data.afternoonFileName = stats.afternoon > 0 ? cleanRawFileName(afternoonFn) : '';
        data.fileName = formatCombinedFileName(data.morningFileName, data.afternoonFileName, cleanRawFileName(data.fileName));
      }
      localStorage.setItem('11a10_timetable_data', JSON.stringify(data));
    }

    return data;
  } catch {
    return null;
  }
}
