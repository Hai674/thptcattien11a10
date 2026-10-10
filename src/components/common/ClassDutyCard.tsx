import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Coffee,
  ShieldCheck,
  X,
} from 'lucide-react';
import { HoloTiltCard } from './HoloTiltCard';
import { GlassButton } from '@/components/ui/glass-button';
import { loadDutySchedule, DayDutyInfo, saveDutySchedule } from '@/services/dutyService';

interface ClassDutyCardProps {
  onClose?: () => void;
}

export const ClassDutyCard: React.FC<ClassDutyCardProps> = ({ onClose }) => {
  const [schedule, setSchedule] = useState<Record<string, DayDutyInfo>>(() => loadDutySchedule());

  // Xác định ngày hôm nay
  const now = new Date();
  const dayIndex = now.getDay(); // 0 = CN, 1 = T2, ..., 6 = T7
  const defaultDayKey = dayIndex === 0 ? 'CN' : String(dayIndex + 1);

  // Cho phép chuyển tab xem lịch các thứ trong tuần (T2 - T7 - CN)
  const [selectedDay, setSelectedDay] = useState<string>(defaultDayKey);

  const currentDuty = schedule[selectedDay] || schedule['2'];
  const isTodaySelected = selectedDay === defaultDayKey;
  const isOffDay = selectedDay === 'CN';

  // Chức năng tick/untick hoàn thành nhiệm vụ trực nhật
  const toggleTask = (taskId: string) => {
    setSchedule((prev) => {
      const updated = { ...prev };
      const dayInfo = updated[selectedDay];
      if (!dayInfo) return prev;

      const newTasks = dayInfo.tasks.map((t) =>
        t.id === taskId ? { ...t, done: !t.done } : t
      );

      updated[selectedDay] = { ...dayInfo, tasks: newTasks };
      saveDutySchedule(updated);
      return updated;
    });
  };

  const completedCount = currentDuty.tasks.filter((t) => t.done).length;
  const totalTasks = currentDuty.tasks.length;
  const progressPercent = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 100;

  const DAYS_LIST = [
    { key: '2', label: 'T2' },
    { key: '3', label: 'T3' },
    { key: '4', label: 'T4' },
    { key: '5', label: 'T5' },
    { key: '6', label: 'T6' },
    { key: '7', label: 'T7' },
    { key: 'CN', label: 'CN' },
  ];

  return (
    <HoloTiltCard className="p-6 sm:p-7 h-full flex flex-col justify-start space-y-4">
      {/* Top Row: Header & Live Badge */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>PHÂN CÔNG TRỰC NHẬT 11A10</span>
          </span>
        </div>

        {/* Day selection tabs & close button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-white/5">
            {DAYS_LIST.map((d) => {
              const isSelected = selectedDay === d.key;
              const isToday = defaultDayKey === d.key;
              return isSelected ? (
                <div key={d.key} className="relative">
                  <GlassButton
                    size="sm"
                    onClick={() => setSelectedDay(d.key)}
                    className="!h-7 !px-2.5 !py-0"
                    contentClassName="text-[11px] font-mono text-white font-bold whitespace-nowrap"
                  >
                    <span>{d.label}</span>
                  </GlassButton>
                  {isToday && (
                    <span className="absolute -top-1 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_#34d399] z-20 pointer-events-none" />
                  )}
                </div>
              ) : (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => setSelectedDay(d.key)}
                  className="h-7 px-2.5 inline-flex items-center justify-center rounded-lg text-[11px] font-mono text-slate-400 hover:text-white hover:bg-white/5 transition-all relative"
                >
                  <span>{d.label}</span>
                  {isToday && (
                    <span className="absolute -top-1 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_#34d399]" />
                  )}
                </button>
              );
            })}
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/5"
              title="Đóng bảng trực nhật"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {isOffDay ? (
        /* TRƯỜNG HỢP: CHỦ NHẬT ĐƯỢC NGHỈ TRỰC NHẬT */
        <div className="py-7 px-4 rounded-2xl bg-amber-500/[0.04] border border-amber-400/20 text-center flex flex-col items-center justify-center space-y-3 my-auto">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.2)]">
            <Coffee className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
              CHỦ NHẬT • ĐƯỢC NGHỈ TRỰC NHẬT
            </h3>
            <p className="text-xs text-amber-200/90 mt-1 max-w-md">
              Cuối tuần không có lịch học. Toàn thể các bạn học sinh 11A10 được nghỉ ngơi, nạp năng lượng!
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-400 px-3 py-1 rounded-full bg-slate-900 border border-white/5">
            Lịch trực nhật sẽ tiếp tục vào Thứ Hai (Tổ 1)
          </span>
        </div>
      ) : (
        /* TRƯỜNG HỢP: CÓ PHÂN CÔNG TRỰC NHẬT (THỨ 2 - THỨ 7) */
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-500/15 border border-blue-400/30 text-blue-300 font-mono text-xs font-semibold">
                  {currentDuty.dayName}
                </span>
                {isTodaySelected && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-mono animate-pulse">
                    Hôm nay
                  </span>
                )}
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Phụ trách:</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-200 to-indigo-300">
                  {currentDuty.groupName}
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                <span>Kiểm tra:</span>
                <strong className="text-blue-300 font-medium">{currentDuty.leader}</strong>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400 italic">"{currentDuty.note}"</span>
              </p>
            </div>

            {/* Tiến độ hoàn thành */}
            <div className="text-right shrink-0">
              <div className="text-xs font-mono text-slate-300">
                <span className="text-lg font-bold text-emerald-400">{completedCount}</span>
                <span className="text-slate-500">/{totalTasks} việc</span>
              </div>
              <div className="w-24 h-1.5 rounded-full bg-slate-900 overflow-hidden border border-white/5 mt-1">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Checklist các công việc trực nhật */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {currentDuty.tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                  task.done
                    ? 'bg-emerald-500/[0.07] border-emerald-400/30 text-slate-200'
                    : 'bg-white/[0.02] border-white/5 hover:border-white/10 text-slate-400'
                }`}
              >
                <button className="mt-0.5 shrink-0 text-emerald-400">
                  {task.done ? (
                    <CheckCircle2 className="w-4 h-4 fill-emerald-400/20" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-600" />
                  )}
                </button>
                <span className={`text-xs leading-snug ${task.done ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                  {task.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </HoloTiltCard>
  );
};

export default ClassDutyCard;
