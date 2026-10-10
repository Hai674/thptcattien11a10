export interface DutyTask {
  id: string;
  name: string;
  done: boolean;
}

export interface DayDutyInfo {
  dayKey: string; // '2', '3', '4', '5', '6', '7', 'CN'
  dayName: string; // 'Thứ Hai', 'Thứ Ba'...
  groupName: string; // 'Tổ 1', 'Tổ 2'...
  leader: string; // Người phụ trách
  membersPreview?: string[];
  tasks: DutyTask[];
  note: string;
}

const DEFAULT_DUTY_SCHEDULE: Record<string, DayDutyInfo> = {
  '2': {
    dayKey: '2',
    dayName: 'Thứ Hai',
    groupName: 'Tổ 1',
    leader: 'Tổ trưởng Tổ 1',
    tasks: [
      { id: 't1', name: 'Kê ngay ngắn bàn ghế, bàn giáo viên đầu tuần', done: true },
      { id: 't2', name: 'Giặt khăn lau bảng, lau sạch bảng đen trước tiết 1', done: true },
      { id: 't3', name: 'Quét dọn sàn lớp học & hành lang sạch sẽ', done: true },
      { id: 't4', name: 'Đổ thùng rác lớp và tắt quạt/đèn sau khi tan học', done: false },
    ],
    note: 'Đầu tuần có tiết Chào cờ, cần vệ sinh lớp học xong trước 06:45!',
  },
  '3': {
    dayKey: '3',
    dayName: 'Thứ Ba',
    groupName: 'Tổ 2',
    leader: 'Tổ trưởng Tổ 2',
    tasks: [
      { id: 't1', name: 'Chuẩn bị phấn viết, nước lau bảng sạch sẽ', done: true },
      { id: 't2', name: 'Quét dọn lớp học đầu giờ và giờ ra chơi', done: true },
      { id: 't3', name: 'Lau bụi bàn ghế và bệ cửa sổ', done: false },
      { id: 't4', name: 'Đổ rác cuối buổi, tắt toàn bộ quạt và khóa cửa', done: false },
    ],
    note: 'Kiểm tra kỹ rác dưới ngăn bàn và sau cánh cửa lớp.',
  },
  '4': {
    dayKey: '4',
    dayName: 'Thứ Tư',
    groupName: 'Tổ 3',
    leader: 'Tổ trưởng Tổ 3',
    tasks: [
      { id: 't1', name: 'Vệ sinh bảng đen, giặt khăn lau bảng sạch sẽ', done: true },
      { id: 't2', name: 'Quét sạch rác lớp học và tưới cây xanh ban công', done: true },
      { id: 't3', name: 'Sắp xếp lại góc học tập và đồ dùng lớp', done: false },
      { id: 't4', name: 'Đổ rác, kiểm tra công tắc điện trước khi về', done: false },
    ],
    note: 'Giữ không gian lớp học luôn sạch sẽ, thoáng mát.',
  },
  '5': {
    dayKey: '5',
    dayName: 'Thứ Năm',
    groupName: 'Tổ 4',
    leader: 'Tổ trưởng Tổ 4',
    tasks: [
      { id: 't1', name: 'Vệ sinh bảng đen, bục giảng và bàn giáo viên', done: true },
      { id: 't2', name: 'Quét dọn lớp học buổi sáng và buổi chiều', done: true },
      { id: 't3', name: 'Thu gom vỏ chai, giấy vụn vào thùng tái chế', done: false },
      { id: 't4', name: 'Đổ rác cuối ngày, đóng tất cả cửa sổ và khóa cửa lớp', done: false },
    ],
    note: 'Buổi chiều vào tiết lúc 14:00, trực nhật kiểm tra bảng trước 13:45!',
  },
  '6': {
    dayKey: '6',
    dayName: 'Thứ Sáu',
    groupName: 'Tổ 1 & Tổ 2',
    leader: 'Ban Cán Sự & Tổ Trưởng',
    tasks: [
      { id: 't1', name: 'Quét dọn lớp học, lau sạch bảng đen các tiết học', done: true },
      { id: 't2', name: 'Lau bệ cửa sổ, kiểm tra vệ sinh quanh lớp', done: true },
      { id: 't3', name: 'Đổ rác cuối tuần, thay túi rác mới sạch sẽ', done: false },
      { id: 't4', name: 'Tắt toàn bộ hệ thống quạt, đèn và khóa cửa chắc chắn', done: false },
    ],
    note: 'Chuẩn bị lớp học sạch sẽ cho buổi sinh hoạt cuối tuần.',
  },
  '7': {
    dayKey: '7',
    dayName: 'Thứ Bảy',
    groupName: 'Tổ 3 & Tổ 4',
    leader: 'Lớp Phó Lao Động',
    tasks: [
      { id: 't1', name: 'Vệ sinh bảng đen và lớp học trước giờ sinh hoạt lớp', done: true },
      { id: 't2', name: 'Tổng vệ sinh cuối tuần: quét mạng nhện, lau kính', done: false },
      { id: 't3', name: 'Xếp bàn ghế ngay ngắn, đổ toàn bộ rác ra bãi trường', done: false },
      { id: 't4', name: 'Kiểm tra ngắt aptomat điện, đóng chốt cửa sổ và khóa cửa', done: false },
    ],
    note: 'Tổng vệ sinh cuối tuần bàn giao lớp học sạch sẽ cho tuần mới!',
  },
  'CN': {
    dayKey: 'CN',
    dayName: 'Chủ Nhật',
    groupName: 'Toàn thể lớp',
    leader: 'Không phân công',
    tasks: [],
    note: 'Chủ Nhật lớp được nghỉ, không có lịch trực nhật!',
  },
};

const STORAGE_KEY = '11a10_duty_schedule_v3';

export function loadDutySchedule(): Record<string, DayDutyInfo> {
  // Dọn dẹp cache cũ nếu có
  try {
    localStorage.removeItem('11a10_duty_schedule');
    localStorage.removeItem('11a10_duty_schedule_v2');
  } catch {
    // ignore
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_DUTY_SCHEDULE;
  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_DUTY_SCHEDULE;
  }
}

export function saveDutySchedule(schedule: Record<string, DayDutyInfo>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
}

export function getTodayDutyInfo(): DayDutyInfo {
  const now = new Date();
  const dayIndex = now.getDay(); // 0 = CN, 1 = T2, ..., 6 = T7
  const dayKey = dayIndex === 0 ? 'CN' : String(dayIndex + 1);
  const schedule = loadDutySchedule();
  return schedule[dayKey] || DEFAULT_DUTY_SCHEDULE[dayKey] || DEFAULT_DUTY_SCHEDULE['2'];
}
