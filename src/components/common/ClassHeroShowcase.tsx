import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Coffee,
  Sparkles,
  ArrowRight,
  Calendar,
} from 'lucide-react';
import { loadTimetableFromStorage } from '@/services/timetableExcelService';
import { INITIAL_TIMETABLE } from '@/data/mockData';
import { ScheduleSlot, Timetable } from '@/types';
import { GlassButton } from '@/components/ui/glass-button';

interface ClassHeroShowcaseProps {
  onOpenLottery?: () => void;
}

// Bảng màu cho từng bộ môn học
const SUBJECT_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  'Toán': { bg: 'bg-blue-500/10', text: 'text-blue-300', border: 'border-blue-500/25', dot: 'bg-blue-400' },
  'Ngữ Văn': { bg: 'bg-rose-500/10', text: 'text-rose-300', border: 'border-rose-500/25', dot: 'bg-rose-400' },
  'Tiếng Anh': { bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-500/25', dot: 'bg-emerald-400' },
  'Vật Lý': { bg: 'bg-violet-500/10', text: 'text-violet-300', border: 'border-violet-500/25', dot: 'bg-violet-400' },
  'Hóa Học': { bg: 'bg-amber-500/10', text: 'text-amber-300', border: 'border-amber-500/25', dot: 'bg-amber-400' },
  'Sinh Học': { bg: 'bg-teal-500/10', text: 'text-teal-300', border: 'border-teal-500/25', dot: 'bg-teal-400' },
  'Lịch Sử': { bg: 'bg-orange-500/10', text: 'text-orange-300', border: 'border-orange-500/25', dot: 'bg-orange-400' },
  'Địa Lý': { bg: 'bg-cyan-500/10', text: 'text-cyan-300', border: 'border-cyan-500/25', dot: 'bg-cyan-400' },
  'Tin Học': { bg: 'bg-sky-500/10', text: 'text-sky-300', border: 'border-sky-500/25', dot: 'bg-sky-400' },
  'GDCD': { bg: 'bg-lime-500/10', text: 'text-lime-300', border: 'border-lime-500/25', dot: 'bg-lime-400' },
  'Thể Dục': { bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-500/25', dot: 'bg-emerald-400' },
  'GDQP-AN': { bg: 'bg-yellow-500/10', text: 'text-yellow-300', border: 'border-yellow-500/25', dot: 'bg-yellow-400' },
  'Chào cờ': { bg: 'bg-red-500/10', text: 'text-red-300', border: 'border-red-500/25', dot: 'bg-red-400' },
  'Sinh hoạt lớp': { bg: 'bg-purple-500/10', text: 'text-purple-300', border: 'border-purple-500/25', dot: 'bg-purple-400' },
  'Tự học': { bg: 'bg-slate-500/10', text: 'text-slate-300', border: 'border-slate-500/25', dot: 'bg-slate-400' },
  'Bồi dưỡng': { bg: 'bg-indigo-500/10', text: 'text-indigo-300', border: 'border-indigo-500/25', dot: 'bg-indigo-400' },
};

function getSubjectStyle(subject: string) {
  if (!subject) return { bg: 'bg-white/[0.03]', text: 'text-slate-300', border: 'border-white/5', dot: 'bg-slate-400' };
  for (const [key, val] of Object.entries(SUBJECT_STYLES)) {
    if (subject.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return { bg: 'bg-indigo-500/10', text: 'text-indigo-300', border: 'border-indigo-500/20', dot: 'bg-indigo-400' };
}

const DAYS_LIST = [
  { key: '2', shortLabel: 'T2', fullLabel: 'Thứ Hai' },
  { key: '3', shortLabel: 'T3', fullLabel: 'Thứ Ba' },
  { key: '4', shortLabel: 'T4', fullLabel: 'Thứ Tư' },
  { key: '5', shortLabel: 'T5', fullLabel: 'Thứ Năm' },
  { key: '6', shortLabel: 'T6', fullLabel: 'Thứ Sáu' },
  { key: '7', shortLabel: 'T7', fullLabel: 'Thứ Bảy' },
  { key: 'CN', shortLabel: 'CN', fullLabel: 'Chủ Nhật' },
];

const MORNING_PERIODS = [
  { key: '1', num: '01', session: 'morning', label: 'Tiết 1', time: '07:00 - 07:45', startMin: 420, endMin: 465 },
  { key: '2', num: '02', session: 'morning', label: 'Tiết 2', time: '07:50 - 08:35', startMin: 470, endMin: 515 },
  { key: '3', num: '03', session: 'morning', label: 'Tiết 3', time: '08:50 - 09:35', startMin: 530, endMin: 575 },
  { key: '4', num: '04', session: 'morning', label: 'Tiết 4', time: '09:40 - 10:25', startMin: 580, endMin: 625 },
];

const AFTERNOON_PERIODS = [
  { key: 'c1', num: 'C1', session: 'afternoon', label: 'Tiết 1 Chiều', time: '14:00 - 14:45', startMin: 840, endMin: 885 },
  { key: 'c2', num: 'C2', session: 'afternoon', label: 'Tiết 2 Chiều', time: '14:50 - 15:35', startMin: 890, endMin: 935 },
  { key: 'c3', num: 'C3', session: 'afternoon', label: 'Tiết 3 Chiều', time: '15:50 - 16:35', startMin: 950, endMin: 995 },
  { key: 'c4', num: 'C4', session: 'afternoon', label: 'Tiết 4 Chiều', time: '16:40 - 17:25', startMin: 1000, endMin: 1045 },
];

export const ClassHeroShowcase: React.FC<ClassHeroShowcaseProps> = () => {
  const cardRef = useRef<HTMLDivElement>(null);

  // Góc nghiêng 3D phong cách macOS window
  const BASE_ROTATE_X = 4;
  const BASE_ROTATE_Y = -8;
  const BASE_ROTATE_Z = 1;

  const [mouseOffsetX, setMouseOffsetX] = useState(0);
  const [mouseOffsetY, setMouseOffsetY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [timetable, setTimetable] = useState<Timetable>(() => loadTimetableFromStorage() || INITIAL_TIMETABLE);

  // Tab lọc buổi nếu ngày có cả sáng và chiều ('all' | 'morning' | 'afternoon')
  const [sessionFilter, setSessionFilter] = useState<'all' | 'morning' | 'afternoon'>('all');

  // Xác định ngày thực tế hôm nay theo Date()
  const now = new Date();
  const dayIndex = now.getDay(); // 0 = CN, 1 = T2, ..., 6 = T7
  const todayKey = dayIndex === 0 ? 'CN' : String(dayIndex + 1);
  const currentDayInfo = DAYS_LIST.find((d) => d.key === todayKey) || DAYS_LIST[0];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  useEffect(() => {
    const data = loadTimetableFromStorage();
    if (data) setTimetable(data);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = ((y - centerY) / centerY) * -4;
    const rY = ((x - centerX) / centerX) * 4;

    setMouseOffsetY(rX);
    setMouseOffsetX(rY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMouseOffsetY(0);
    setMouseOffsetX(0);
  };

  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const checkSize = () => setIsDesktop(window.innerWidth >= 1024);
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  const currentRotateX = isDesktop ? (isHovered ? BASE_ROTATE_X + mouseOffsetY : BASE_ROTATE_X) : 0;
  const currentRotateY = isDesktop ? (isHovered ? BASE_ROTATE_Y + mouseOffsetX : BASE_ROTATE_Y) : 0;
  const currentRotateZ = isDesktop ? (isHovered ? BASE_ROTATE_Z * 0.7 : BASE_ROTATE_Z) : 0;

  // Lịch học hôm nay lấy theo ngày thực tế (todayKey)
  const todaySchedule: Record<string, ScheduleSlot> = timetable.schedule[todayKey] || {};

  // Lấy các tiết sáng có môn
  const morningSlots = MORNING_PERIODS.filter((p) => {
    const slot = todaySchedule[p.key];
    return slot && slot.subject && slot.subject.trim() !== '';
  });

  // Lấy các tiết chiều có môn
  const afternoonSlots = AFTERNOON_PERIODS.filter((p) => {
    const slot = todaySchedule[p.key];
    return slot && slot.subject && slot.subject.trim() !== '';
  });

  const hasMorning = morningSlots.length > 0;
  const hasAfternoon = afternoonSlots.length > 0;
  const totalClassesCount = morningSlots.length + afternoonSlots.length;
  const isOffDay = todayKey === 'CN' || totalClassesCount === 0;

  // Xác định trạng thái tiết học trực tiếp theo giờ
  let liveStatusText = 'Ngoài giờ học';
  let livePeriodKey: string | null = null;
  let isRecess = false;

  if (todayKey === 'CN') {
    liveStatusText = 'Nghỉ cuối tuần (Nạp năng lượng)';
  } else if (totalClassesCount === 0) {
    liveStatusText = 'Chưa có lịch học hôm nay';
  } else {
    if (currentMinutes < 420) {
      liveStatusText = 'Sắp vào học (Tiết 1 lúc 07:00)';
    } else if (currentMinutes >= 420 && currentMinutes <= 465) {
      livePeriodKey = '1';
      liveStatusText = `Đang học: Tiết 1 (${todaySchedule['1']?.subject || 'Tiết 1'})`;
    } else if (currentMinutes > 465 && currentMinutes < 470) {
      liveStatusText = 'Nghỉ giải lao 5 phút';
      isRecess = true;
    } else if (currentMinutes >= 470 && currentMinutes <= 515) {
      livePeriodKey = '2';
      liveStatusText = `Đang học: Tiết 2 (${todaySchedule['2']?.subject || 'Tiết 2'})`;
    } else if (currentMinutes > 515 && currentMinutes < 530) {
      liveStatusText = 'Ra chơi sáng (15 phút)';
      isRecess = true;
    } else if (currentMinutes >= 530 && currentMinutes <= 575) {
      livePeriodKey = '3';
      liveStatusText = `Đang học: Tiết 3 (${todaySchedule['3']?.subject || 'Tiết 3'})`;
    } else if (currentMinutes > 575 && currentMinutes < 580) {
      liveStatusText = 'Nghỉ giải lao 5 phút';
      isRecess = true;
    } else if (currentMinutes >= 580 && currentMinutes <= 625) {
      livePeriodKey = '4';
      liveStatusText = `Đang học: Tiết 4 (${todaySchedule['4']?.subject || 'Tiết 4'})`;
    } else if (currentMinutes > 625 && currentMinutes < 840) {
      liveStatusText = hasAfternoon ? 'Nghỉ trưa (Chiều vào học 14:00)' : 'Đã kết thúc buổi học hôm nay';
      isRecess = true;
    } else if (currentMinutes >= 840 && currentMinutes <= 885) {
      livePeriodKey = 'c1';
      liveStatusText = `Đang học: Tiết 1 Chiều (${todaySchedule['c1']?.subject || 'Tiết 1'})`;
    } else if (currentMinutes > 885 && currentMinutes < 890) {
      liveStatusText = 'Nghỉ giải lao 5 phút';
      isRecess = true;
    } else if (currentMinutes >= 890 && currentMinutes <= 935) {
      livePeriodKey = 'c2';
      liveStatusText = `Đang học: Tiết 2 Chiều (${todaySchedule['c2']?.subject || 'Tiết 2'})`;
    } else if (currentMinutes > 935 && currentMinutes < 950) {
      liveStatusText = 'Ra chơi chiều (15 phút)';
      isRecess = true;
    } else if (currentMinutes >= 950 && currentMinutes <= 995) {
      livePeriodKey = 'c3';
      liveStatusText = `Đang học: Tiết 3 Chiều (${todaySchedule['c3']?.subject || 'Tiết 3'})`;
    } else if (currentMinutes > 995 && currentMinutes < 1000) {
      liveStatusText = 'Nghỉ giải lao 5 phút';
      isRecess = true;
    } else if (currentMinutes >= 1000 && currentMinutes <= 1045) {
      livePeriodKey = 'c4';
      liveStatusText = `Đang học: Tiết 4 Chiều (${todaySchedule['c4']?.subject || 'Tiết 4'})`;
    } else {
      liveStatusText = 'Đã kết thúc buổi học hôm nay';
    }
  }

  // Danh sách tiết cần hiển thị hôm nay
  const allTodayPeriods = [
    ...MORNING_PERIODS,
    ...afternoonSlots,
  ];

  const displayedPeriods = sessionFilter === 'morning'
    ? MORNING_PERIODS
    : sessionFilter === 'afternoon'
    ? afternoonSlots
    : allTodayPeriods;

  const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

  return (
    <div className="animate-float-subtle relative w-full max-w-[480px] mx-auto select-none py-2">
      {/* 3D Floor Floating Shadow under tilted card */}
      <div
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[88%] h-9 bg-black/80 rounded-full blur-2xl pointer-events-none transition-all duration-500"
        style={{
          transform: isHovered ? 'scale(1.04)' : 'scale(0.96)',
          opacity: isHovered ? 0.9 : 0.65,
        }}
      />

      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        className="relative w-full"
        style={{ perspective: 1100 }}
      >
        {/* Soft Ambient Light behind card */}
        <div
          className="absolute -inset-6 rounded-3xl bg-gradient-to-tr from-purple-600/35 via-cyan-500/30 to-indigo-500/35 blur-2xl transition-opacity duration-700 pointer-events-none"
          style={{ opacity: isHovered ? 1 : 0.75 }}
        />

        {/* 3D Tilted macOS Window Card Shell */}
        <div
          className="glass-card-element relative rounded-3xl overflow-hidden transition-transform duration-200 ease-out text-white"
          style={{
            transform: `rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg) rotateZ(${currentRotateZ}deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Specular Sheen Sweep Flare */}
          <div className="glass-card-sheen" />

          {/* Card Inner Content */}
          <div className="relative z-10">
            {/* macOS Title Bar */}
            <div className="px-5 py-3 bg-white/[0.06] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${!isOffDay ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                <span className={`font-mono text-[10px] font-bold uppercase tracking-wider ${!isOffDay ? 'text-emerald-400' : 'text-slate-400'}`}>
                  LIVE HÔM NAY
                </span>
              </div>
            </div>

            {/* Window Body Content */}
            <div className="p-5 sm:p-6 space-y-4">
              {/* Header: Title + Realtime Status */}
              <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[11px] text-purple-400 uppercase tracking-widest font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  LỊCH HỌC HÔM NAY
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {totalClassesCount > 0 ? `${totalClassesCount} tiết trong ngày` : todayKey === 'CN' ? 'Cuối tuần' : 'Chưa xếp lịch'}
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight flex items-center gap-2">
                  <span>{currentDayInfo.fullLabel}</span>
                  <span className="text-xs font-mono font-medium text-purple-300">
                    Hôm nay
                  </span>
                </h3>
                <span className="font-mono text-xs text-slate-400 shrink-0">
                  {formattedDate}
                </span>
              </div>

              {/* Status Badge */}
              <div className="mt-2.5 flex items-center gap-2">
                <div className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                  isOffDay
                    ? 'text-amber-300'
                    : livePeriodKey
                    ? 'text-emerald-300'
                    : isRecess
                    ? 'text-sky-300'
                    : 'text-slate-300'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    isOffDay
                      ? 'bg-amber-400'
                      : livePeriodKey
                      ? 'bg-emerald-400 animate-ping'
                      : isRecess
                      ? 'bg-sky-400'
                      : 'bg-slate-400'
                  }`} />
                  <span className="truncate max-w-[320px]">
                    {liveStatusText}
                  </span>
                </div>
              </div>
            </div>

            {/* Session Filter Bar (chỉ hiện khi ngày hôm nay có cả ca chiều) */}
            {!isOffDay && hasAfternoon && (
              <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSessionFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      sessionFilter === 'all'
                        ? 'bg-purple-600 text-white font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    Tất cả ({totalClassesCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSessionFilter('morning')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      sessionFilter === 'morning'
                        ? 'bg-purple-600 text-white font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    Sáng ({morningSlots.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSessionFilter('afternoon')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      sessionFilter === 'afternoon'
                        ? 'bg-purple-600 text-white font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    Chiều ({afternoonSlots.length})
                  </button>
                </div>
                <span className="font-mono text-[10px] text-slate-500">
                  {sessionFilter === 'morning' ? '07:00 - 10:25' : sessionFilter === 'afternoon' ? '14:00 - 17:25' : 'Hôm nay'}
                </span>
              </div>
            )}

            {/* Main Timetable Content: Today's Classes List or Off-day */}
            {isOffDay ? (
              <div
                className="glass-card-element relative overflow-hidden rounded-2xl p-6 sm:p-8 text-center space-y-3 my-2 transition-all duration-300"
              >
                {/* Specular Glass Highlight */}
                <div className="glass-card-sheen" />

                <div className="relative z-10 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/25 text-purple-300 mx-auto flex items-center justify-center shadow-lg backdrop-blur-md">
                    <Calendar className="w-6 h-6 text-purple-300" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {todayKey === 'CN' ? 'Hôm nay được nghỉ học (Cuối tuần)' : 'Chưa có lịch học hôm nay'}
                    </h4>
                    <p className="text-xs text-slate-200 mt-1.5 max-w-xs mx-auto leading-relaxed">
                      {todayKey === 'CN'
                        ? 'Chủ Nhật là thời gian nghỉ ngơi thư giãn, chúc các bạn 11A10 nạp đầy năng lượng để bắt đầu tuần mới'
                        : 'Thời khóa biểu lớp chưa có tiết học nào được xếp, ban cán sự có thể nạp tệp Excel mới trong trang Thời khóa biểu'}
                    </p>
                  </div>
                  <div className="pt-1">
                    <Link to="/thoi-khoa-bieu" className="inline-block">
                      <GlassButton
                        size="sm"
                        contentClassName="flex items-center gap-1.5 text-xs text-purple-200 font-semibold"
                      >
                        <span>Xem & Cập nhật thời khóa biểu</span>
                        <ArrowRight className="w-3.5 h-3.5 text-purple-300" />
                      </GlassButton>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {displayedPeriods.map((p) => {
                  const slot = todaySchedule[p.key];
                  const hasSubject = Boolean(slot && slot.subject && slot.subject.trim());
                  const subjectName = hasSubject ? slot.subject : 'Tự học / Tiết trống';
                  const style = getSubjectStyle(subjectName);

                  const isLiveNow = livePeriodKey === p.key;
                  const isPast = currentMinutes > p.endMin;

                  return (
                    <div
                      key={p.key}
                      className={`group flex items-center justify-between p-2.5 rounded-xl transition-all duration-200 border ${
                        isLiveNow
                          ? 'bg-purple-600/[0.2] border-purple-400/60 shadow-[0_0_20px_rgba(168,85,247,0.3)] ring-1 ring-purple-400/50'
                          : hasSubject
                          ? 'bg-white/[0.05] border-white/10 hover:bg-white/[0.08] hover:border-white/20'
                          : 'bg-white/[0.02] border-white/5 opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        {/* Number Badge */}
                        <div
                          className={`w-8 h-8 rounded-lg flex flex-col items-center justify-center shrink-0 font-mono text-[11px] font-bold border transition-colors ${
                            isLiveNow
                              ? 'bg-purple-500 text-white border-purple-400 shadow-sm shadow-purple-500/50'
                              : 'bg-white/10 text-slate-300 border-white/10'
                          }`}
                        >
                          <span>{p.num}</span>
                        </div>

                        {/* Subject & Teacher/Room Info */}
                        <div className="min-w-0 truncate">
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold text-xs truncate ${hasSubject ? style.text : 'text-slate-400'}`}>
                              {subjectName}
                            </span>
                            {p.session === 'afternoon' && sessionFilter === 'all' && (
                              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                Chiều
                              </span>
                            )}
                            {isLiveNow && (
                              <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                Đang học
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 truncate">
                            <span className="font-mono text-slate-500 text-[10px]">{p.time}</span>
                            {hasSubject && slot.teacher && (
                              <span className="truncate">• {slot.teacher}</span>
                            )}
                            {hasSubject && slot.room && (
                              <span className="truncate hidden sm:inline">• {slot.room}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Status */}
                      <div className="shrink-0 flex items-center gap-2">
                        {isPast ? (
                          <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span className="hidden sm:inline">Đã học</span>
                          </span>
                        ) : isLiveNow ? (
                          <span className="text-[10px] font-mono text-purple-300 font-medium">
                            Tiết này
                          </span>
                        ) : hasSubject ? (
                          <span className="text-[10px] font-mono text-slate-500 px-1.5 py-0.5">
                            {slot.room ? slot.room.replace('Phòng ', 'P.') : 'P.204'}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default ClassHeroShowcase;
