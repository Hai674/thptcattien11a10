import * as XLSX from 'xlsx';
import { Member } from '@/types';
import { INITIAL_MEMBERS } from '@/data/mockData';

const STORAGE_KEY = '11a10_members_list';

export function loadMembersFromStorage(): Member[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    saveMembersToStorage(INITIAL_MEMBERS);
    return INITIAL_MEMBERS;
  }
  try {
    const list = JSON.parse(raw);
    if (!Array.isArray(list) || list.length === 0) {
      saveMembersToStorage(INITIAL_MEMBERS);
      return INITIAL_MEMBERS;
    }

    // Tự động thay thế nếu dữ liệu cũ còn chứa các thành viên demo cũ
    const DEMO_NAMES = [
      'Trần Nguyễn Hoàng Anh',
      'Lê Thị Mai Phương',
      'Nguyễn Văn Minh Khang',
      'Phạm Bảo Ngọc',
      'Võ Đức Trọng',
      'Đặng Thảo Vy',
      'Bùi Gia Huy',
      'Nguyễn Kiều Oanh',
    ];

    if (
      list.some((m: Member) => /^m[1-8]$/.test(m.id) || DEMO_NAMES.includes(m.fullName))
    ) {
      saveMembersToStorage(INITIAL_MEMBERS);
      return INITIAL_MEMBERS;
    }

    // Tự động nâng cấp năm sinh từ 2009 sang 2010 cho học sinh
    let updatedYear = false;
    const migrated = list.map((m: Member) => {
      if (m.birthDate === '2009' || m.birthDate?.includes('2009')) {
        updatedYear = true;
        return { ...m, birthDate: m.birthDate.replace('2009', '2010') };
      }
      return m;
    });

    if (updatedYear) {
      saveMembersToStorage(migrated);
      return migrated;
    }

    return list;
  } catch {
    saveMembersToStorage(INITIAL_MEMBERS);
    return INITIAL_MEMBERS;
  }
}

export function saveMembersToStorage(members: Member[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
}

export function clearDemoMembers(): Member[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  return [];
}

/**
 * Tải file Excel danh sách 46 học sinh lớp 11A10 chuẩn
 */
export function downloadSampleMembersExcel() {
  const wsData = [
    ['DANH SÁCH HỌC SINH LỚP 11A10 - THPT CÁT TIÊN (NĂM HỌC 2026 - 2027)'],
    ['(Cập nhật thông tin chi tiết từng học sinh vào bảng bên dưới)'],
    [],
    ['STT', 'Họ và tên', 'Chức vụ', 'Ngày sinh', 'Số điện thoại', 'Châm ngôn / Lời nhắn', 'Sở thích'],
    ...INITIAL_MEMBERS.map((m, idx) => [
      idx + 1,
      m.fullName,
      m.role || 'Thành viên',
      m.birthDate || '2010',
      m.phone || '',
      m.quote || 'Tập thể 11A10',
      (m.hobbies || []).join(', '),
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 28 },
    { wch: 18 },
    { wch: 14 },
    { wch: 16 },
    { wch: 40 },
    { wch: 24 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Danh_Sach_11A10');
  XLSX.writeFile(wb, 'Danh_Sach_Hoc_Sinh_11A10.xlsx');
}

/**
 * Nhập danh sách học sinh từ file Excel
 */
export async function parseMembersFromExcel(file: File): Promise<Member[]> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];

  const rows: (string | number)[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: '',
  });

  // Tìm header row
  let headerRow = -1;
  let nameCol = -1;
  let roleCol = -1;
  let birthCol = -1;
  let phoneCol = -1;
  let quoteCol = -1;
  let hobbyCol = -1;

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    for (let c = 0; c < row.length; c++) {
      const val = String(row[c]).toLowerCase().trim();
      if (val.includes('họ và tên') || val.includes('họ tên') || val === 'tên') {
        nameCol = c;
        headerRow = r;
      } else if (val.includes('chức vụ') || val.includes('vai trò')) {
        roleCol = c;
      } else if (val.includes('ngày sinh')) {
        birthCol = c;
      } else if (val.includes('điện thoại') || val.includes('sđt')) {
        phoneCol = c;
      } else if (val.includes('châm ngôn') || val.includes('quote') || val.includes('lời nhắn')) {
        quoteCol = c;
      } else if (val.includes('sở thích')) {
        hobbyCol = c;
      }
    }
    if (headerRow !== -1 && nameCol !== -1) break;
  }

  if (headerRow === -1 || nameCol === -1) {
    throw new Error('Không tìm thấy cột "Họ và tên" trong tệp Excel.');
  }

  const result: Member[] = [];
  for (let r = headerRow + 1; r < rows.length; r++) {
    const row = rows[r];
    const fullName = String(row[nameCol] || '').trim();
    if (!fullName || fullName.length < 2) continue;

    const role = roleCol !== -1 && row[roleCol] ? String(row[roleCol]).trim() : 'Thành viên';
    const birthDate = birthCol !== -1 && row[birthCol] ? String(row[birthCol]).trim() : '2010';
    const phone = phoneCol !== -1 && row[phoneCol] ? String(row[phoneCol]).trim() : undefined;
    const quote = quoteCol !== -1 && row[quoteCol] ? String(row[quoteCol]).trim() : undefined;
    const hobbiesStr = hobbyCol !== -1 && row[hobbyCol] ? String(row[hobbyCol]).trim() : '';
    const hobbies = hobbiesStr ? hobbiesStr.split(/[,;]+/).map((s) => s.trim()) : [];

    result.push({
      id: `m-${Date.now()}-${r}`,
      fullName,
      role,
      birthDate,
      phone,
      quote,
      hobbies,
    });
  }

  return result;
}
