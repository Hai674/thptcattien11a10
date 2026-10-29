import React, { useState } from 'react';
import { Timetable, ScheduleSlot } from '@/types';
import { Sun, Sunset, Edit2, Check, X } from 'lucide-react';
import { GlassButton } from '@/components/ui/glass-button';
import { Card } from '@/components/ui/card';

interface TimetableGridProps {
  timetable: Timetable;
  onUpdateSlot?: (day: string, period: string, slot: ScheduleSlot | null) => void;
  isEditable?: boolean;
}

// Phân nhóm màu sắc theo chuyên môn học tập:
// 1. Tự nhiên & Công nghệ (Sky / Cyan)
// 2. Xã hội & Ngôn ngữ (Indigo / Violet / Purple)
// 3. Thể chất & Kỹ năng (Amber / Vàng cam)
// 4. Hoạt động tập thể (Rose / Đỏ hồng)
const SUBJECT_ACCENTS: Record<string, { dot: string; borderLeft: string; tag?: string }> = {
  // Khoa học Tự nhiên & Công nghệ
  'Toán': { dot: 'bg-sky-400', borderLeft: 'border-l-2 border-l-sky-400/80' },
  'CĐ Toán': { dot: 'bg-sky-400', borderLeft: 'border-l-2 border-l-sky-400/80', tag: 'CĐ' },
  'Vật Lý': { dot: 'bg-sky-400', borderLeft: 'border-l-2 border-l-sky-400/80' },
  'Lý': { dot: 'bg-sky-400', borderLeft: 'border-l-2 border-l-sky-400/80' },
  'CĐ Lý': { dot: 'bg-sky-400', borderLeft: 'border-l-2 border-l-sky-400/80', tag: 'CĐ' },
  'Hóa Học': { dot: 'bg-sky-400', borderLeft: 'border-l-2 border-l-sky-400/80' },
  'Hóa': { dot: 'bg-sky-400', borderLeft: 'border-l-2 border-l-sky-400/80' },
  'Sinh Học': { dot: 'bg-teal-400', borderLeft: 'border-l-2 border-l-teal-400/80' },
  'Sinh': { dot: 'bg-teal-400', borderLeft: 'border-l-2 border-l-teal-400/80' },
  'Tin Học': { dot: 'bg-cyan-400', borderLeft: 'border-l-2 border-l-cyan-400/80' },
  'Tin': { dot: 'bg-cyan-400', borderLeft: 'border-l-2 border-l-cyan-400/80' },
  'Công Nghệ': { dot: 'bg-cyan-400', borderLeft: 'border-l-2 border-l-cyan-400/80' },
  'CĐ Công nghệ': { dot: 'bg-cyan-400', borderLeft: 'border-l-2 border-l-cyan-400/80', tag: 'CĐ' },
  'Công nghệ Nông nghiệp': { dot: 'bg-cyan-400', borderLeft: 'border-l-2 border-l-cyan-400/80' },

  // Xã hội & Ngôn ngữ
  'Ngữ Văn': { dot: 'bg-indigo-400', borderLeft: 'border-l-2 border-l-indigo-400/80' },
  'Tiếng Anh': { dot: 'bg-violet-400', borderLeft: 'border-l-2 border-l-violet-400/80' },
  'Lịch Sử': { dot: 'bg-indigo-400', borderLeft: 'border-l-2 border-l-indigo-400/80' },
  'Sử': { dot: 'bg-indigo-400', borderLeft: 'border-l-2 border-l-indigo-400/80' },
  'Địa Lý': { dot: 'bg-indigo-400', borderLeft: 'border-l-2 border-l-indigo-400/80' },
  'Địa': { dot: 'bg-indigo-400', borderLeft: 'border-l-2 border-l-indigo-400/80' },
  'KTPL': { dot: 'bg-purple-400', borderLeft: 'border-l-2 border-l-purple-400/80' },
  'CĐ KTPL': { dot: 'bg-purple-400', borderLeft: 'border-l-2 border-l-purple-400/80', tag: 'CĐ' },
  'GDCD': { dot: 'bg-purple-400', borderLeft: 'border-l-2 border-l-purple-400/80' },
  'GDĐP': { dot: 'bg-indigo-400', borderLeft: 'border-l-2 border-l-indigo-400/80' },

  // Thể chất & Kỹ năng
  'Thể Dục': { dot: 'bg-amber-400', borderLeft: 'border-l-2 border-l-amber-400/80' },
  'GDTC': { dot: 'bg-amber-400', borderLeft: 'border-l-2 border-l-amber-400/80' },
  'GDQP-AN': { dot: 'bg-amber-400', borderLeft: 'border-l-2 border-l-amber-400/80' },
  'GDQPAN': { dot: 'bg-amber-400', borderLeft: 'border-l-2 border-l-amber-400/80' },
  'GDQP': { dot: 'bg-amber-400', borderLeft: 'border-l-2 border-l-amber-400/80' },

  // Hoạt động & Sinh hoạt
  'Chào cờ': { dot: 'bg-rose-400', borderLeft: 'border-l-2 border-l-rose-400/80' },
  'Sinh hoạt lớp': { dot: 'bg-rose-400', borderLeft: 'border-l-2 border-l-rose-400/80', tag: 'GVCN' },
  'HDTNHN': { dot: 'bg-rose-400', borderLeft: 'border-l-2 border-l-rose-400/80' },
};

function getSubjectAccent(subject: string) {
  if (!subject) return null;
  const s = subject.toLowerCase();
  for (const [key, val] of Object.entries(SUBJECT_ACCENTS)) {
    if (s.includes(key.toLowerCase())) return val;
  }
  return {
    dot: 'bg-slate-400',
    borderLeft: 'border-l-2 border-l-slate-400/50',
  };
}

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  timetable,
  onUpdateSlot,
  isEditable = false,
}) => {
  const [activeSession, setActiveSession] = useState<'all' | 'morning' | 'afternoon'>('all');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editTeacher, setEditTeacher] = useState('');

  const days = [
    { key: '2', label: 'Thứ Hai' },
    { key: '3', label: 'Thứ Ba' },
    { key: '4', label: 'Thứ Tư' },
    { key: '5', label: 'Thứ Năm' },
    { key: '6', label: 'Thứ Sáu' },
  ];

  // Kiểm tra xem có tiết 5 sáng hoặc chiều hay không
  const hasMorningPeriod5 = Object.values(timetable.schedule || {}).some(
    (daySlots) => daySlots && daySlots['5'] && daySlots['5'].subject
  );
  const hasAfternoonPeriod5 = Object.values(timetable.schedule || {}).some(
    (daySlots) => daySlots && daySlots['c5'] && daySlots['c5'].subject
  );

  const morningPeriods = [
    { key: '1', name: 'Tiết 1' },
    { key: '2', name: 'Tiết 2' },
    { key: '3', name: 'Tiết 3' },
    { key: '4', name: 'Tiết 4' },
    ...(hasMorningPeriod5 || isEditable ? [{ key: '5', name: 'Tiết 5' }] : []),
  ];

  const afternoonPeriods = [
    { key: 'c1', name: 'Tiết 1' },
    { key: 'c2', name: 'Tiết 2' },
    { key: 'c3', name: 'Tiết 3' },
    { key: 'c4', name: 'Tiết 4' },
    ...(hasAfternoonPeriod5 || isEditable ? [{ key: 'c5', name: 'Tiết 5' }] : []),
  ];

  const now = new Date();
  const currentDayOfWeek = now.getDay() === 0 ? 'CN' : String(now.getDay() + 1);

  const startEdit = (dayKey: string, periodKey: string, currentSlot?: ScheduleSlot) => {
    if (!isEditable) return;
    setEditingKey(`${dayKey}_${periodKey}`);
    setEditSubject(currentSlot?.subject || '');
    setEditTeacher(currentSlot?.teacher || '');
  };

  const saveEdit = (dayKey: string, periodKey: string) => {
    if (onUpdateSlot) {
      if (editSubject.trim()) {
        onUpdateSlot(dayKey, periodKey, {
          subject: editSubject.trim(),
          teacher: editTeacher.trim() || 'Giáo viên bộ môn',
          room: 'Phòng 204',
        });
      } else {
        onUpdateSlot(dayKey, periodKey, null);
      }
    }
    setEditingKey(null);
  };

  const renderPeriodRows = (periodsList: typeof morningPeriods, sessionTitle: string, sessionIcon: React.ReactNode) => {
    return (
      <>
        {/* Tiêu đề phân đoạn buổi học */}
        <tr className="bg-white/[0.03] border-y border-white/10">
          <td colSpan={6} className="px-4 py-2 text-xs font-semibold text-slate-300">
            <div className="flex items-center gap-2">
              {sessionIcon}
              <span>{sessionTitle}</span>
              <span className="text-[10px] text-slate-500 font-mono font-normal">
                ({periodsList.length} tiết học)
              </span>
            </div>
          </td>
        </tr>

        {periodsList.map((p) => (
          <tr
            key={p.key}
            className="border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors"
          >
            {/* Cột số tiết */}
            <td className="p-3 text-center bg-white/[0.04] border-r border-white/10 w-24 sm:w-28 backdrop-blur-md">
              <span className="font-bold text-xs text-slate-200">
                {p.name}
              </span>
            </td>

            {/* Các ngày từ Thứ 2 đến Thứ 6 */}
            {days.map((d) => {
              const slot = timetable.schedule[d.key]?.[p.key];
              const accent = slot ? getSubjectAccent(slot.subject) : null;
              const isCurrentDay = currentDayOfWeek === d.key;
              const isEditing = editingKey === `${d.key}_${p.key}`;

              return (
                <td
                  key={d.key}
                  onClick={() => !isEditing && isEditable && startEdit(d.key, p.key, slot)}
                  className={`p-2.5 border-l border-white/5 align-top transition-all ${
                    isCurrentDay ? 'bg-cyan-500/[0.04]' : ''
                  } ${isEditable ? 'cursor-pointer hover:bg-white/[0.04]' : ''}`}
                >
                  {isEditing ? (
                    <div
                      className="p-2.5 rounded-2xl bg-white/[0.12] border border-blue-400/50 space-y-1.5 shadow-2xl backdrop-blur-xl"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        value={editSubject}
                        onChange={(e) => setEditSubject(e.target.value)}
                        placeholder="Tên môn..."
                        className="w-full text-xs bg-black/50 border border-white/10 rounded px-2 py-1 text-white"
                        autoFocus
                      />
                      <input
                        type="text"
                        value={editTeacher}
                        onChange={(e) => setEditTeacher(e.target.value)}
                        placeholder="Giáo viên..."
                        className="w-full text-[11px] bg-black/50 border border-white/10 rounded px-2 py-1 text-slate-300"
                      />
                      <div className="flex items-center justify-end gap-1 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingKey(null)}
                          className="p-1 rounded hover:bg-white/10 text-slate-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <GlassButton
                          type="button"
                          size="sm"
                          onClick={() => saveEdit(d.key, p.key)}
                          contentClassName="p-1 text-white flex items-center justify-center"
                        >
                          <Check className="w-3 h-3 text-emerald-300" />
                        </GlassButton>
                      </div>
                    </div>
                  ) : slot && slot.subject ? (
                    <div
                      className={`h-full min-h-[58px] p-2.5 rounded-xl border flex flex-col justify-between transition-all bg-slate-900/60 hover:bg-slate-900/95 hover:border-white/25 hover:shadow-lg hover:shadow-black/20 group/cell ${
                        accent ? accent.borderLeft : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {accent?.dot && (
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${accent.dot}`} />
                          )}
                          <p className="font-semibold text-xs text-white leading-tight truncate">
                            {slot.subject}
                          </p>
                          {accent?.tag && (
                            <span className="text-[9px] font-mono font-bold text-slate-400 shrink-0">
                              {accent.tag}
                            </span>
                          )}
                        </div>
                        {isEditable && (
                          <Edit2 className="w-2.5 h-2.5 text-slate-500 opacity-0 group-hover/cell:opacity-100 shrink-0" />
                        )}
                      </div>

                      {slot.teacher && (
                        <p className="text-[10px] text-slate-400 truncate mt-1 pl-3">
                          {slot.teacher}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="h-full min-h-[58px] rounded-xl border border-white/[0.04] bg-white/[0.01] flex items-center justify-center transition-colors">
                      {isEditable ? (
                        <span className="text-slate-500 text-[11px] hover:text-cyan-300">+ Thêm</span>
                      ) : p.key.startsWith('c') ? (
                        <span className="text-[10px] text-slate-500/80 font-mono tracking-wider">
                          Nghỉ chiều
                        </span>
                      ) : (
                        <span className="text-slate-600 text-xs font-mono">—</span>
                      )}
                    </div>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </>
    );
  };

  return (
    <div className="space-y-4">
      {/* Tab chuyển đổi Buổi Sáng / Chiều / Toàn Tuần */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/[0.04] border border-white/10">
          {activeSession === 'all' ? (
            <GlassButton
              size="sm"
              variant="primary"
              onClick={() => setActiveSession('all')}
              contentClassName="px-3.5 py-1.5 text-xs text-white font-semibold"
            >
              <span>Tất cả (Sáng &amp; Chiều)</span>
            </GlassButton>
          ) : (
            <button
              type="button"
              onClick={() => setActiveSession('all')}
              className="h-9 px-3.5 rounded-full inline-flex items-center justify-center text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              Tất cả (Sáng &amp; Chiều)
            </button>
          )}

          {activeSession === 'morning' ? (
            <GlassButton
              size="sm"
              variant="primary"
              onClick={() => setActiveSession('morning')}
              contentClassName="flex items-center gap-1.5 px-3.5 py-1.5 text-xs text-white font-semibold"
            >
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Sáng (4 tiết)</span>
            </GlassButton>
          ) : (
            <button
              type="button"
              onClick={() => setActiveSession('morning')}
              className="h-9 px-3.5 rounded-full inline-flex items-center justify-center text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all gap-1.5"
            >
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Sáng (4 tiết)</span>
            </button>
          )}

          {activeSession === 'afternoon' ? (
            <GlassButton
              size="sm"
              variant="primary"
              onClick={() => setActiveSession('afternoon')}
              contentClassName="flex items-center gap-1.5 px-3.5 py-1.5 text-xs text-white font-semibold"
            >
              <Sunset className="w-3.5 h-3.5 text-orange-400" />
              <span>Chiều (4 tiết)</span>
            </GlassButton>
          ) : (
            <button
              type="button"
              onClick={() => setActiveSession('afternoon')}
              className="h-9 px-3.5 rounded-full inline-flex items-center justify-center text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all gap-1.5"
            >
              <Sunset className="w-3.5 h-3.5 text-orange-400" />
              <span>Chiều (4 tiết)</span>
            </button>
          )}
        </div>

        {isEditable && (
          <p className="text-[11px] text-blue-400 font-mono">
            * Nhấp vào ô bất kỳ để chỉnh sửa nhanh môn học
          </p>
        )}
      </div>

      {/* Gợi ý vuốt ngang trên thiết bị di động */}
      <div className="md:hidden flex items-center justify-between px-2 text-[10px] text-cyan-300 font-mono">
        <span>Thời khóa biểu chi tiết</span>
        <span>← Vuốt ngang để xem đủ tuần →</span>
      </div>

      {/* Bảng Thời khóa biểu Liquid Glass */}
      <Card className="rounded-3xl p-0 overflow-hidden">
        <div className="overflow-x-auto w-full scrollbar-thin">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.06] backdrop-blur-md">
                <th className="p-3.5 text-xs font-bold uppercase text-slate-300 w-24 sm:w-28 text-center font-mono">
                  Tiết
                </th>
                {days.map((d) => {
                  const isCurrentDay = currentDayOfWeek === d.key;
                  return (
                    <th
                      key={d.key}
                      className={`p-3 text-xs font-bold text-center border-l border-white/10 transition-all ${
                        isCurrentDay
                          ? 'bg-cyan-500/[0.12] text-cyan-200 font-extrabold shadow-[inset_0_2px_0_#22d3ee]'
                          : 'text-slate-300'
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center gap-1">
                        {isCurrentDay && (
                          <span className="text-[10px] font-mono font-bold text-cyan-400 tracking-wider uppercase">
                            Hôm nay
                          </span>
                        )}
                        <span className={isCurrentDay ? 'text-white font-extrabold' : ''}>{d.label}</span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {(activeSession === 'all' || activeSession === 'morning') &&
                renderPeriodRows(morningPeriods, 'Buổi Sáng', <Sun className="w-3.5 h-3.5 text-amber-400" />)}

              {(activeSession === 'all' || activeSession === 'afternoon') &&
                renderPeriodRows(afternoonPeriods, 'Buổi Chiều', <Sunset className="w-3.5 h-3.5 text-orange-400" />)}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
