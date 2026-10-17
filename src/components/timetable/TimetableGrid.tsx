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

const SUBJECT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Chào cờ': { bg: 'bg-red-500/15', text: 'text-red-300', border: 'border-red-500/30' },
  'Toán': { bg: 'bg-blue-500/15', text: 'text-blue-300', border: 'border-blue-500/30' },
  'Ngữ Văn': { bg: 'bg-pink-500/15', text: 'text-pink-300', border: 'border-pink-500/30' },
  'Tiếng Anh': { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30' },
  'Vật Lý': { bg: 'bg-violet-500/15', text: 'text-violet-300', border: 'border-violet-500/30' },
  'Lý': { bg: 'bg-violet-500/15', text: 'text-violet-300', border: 'border-violet-500/30' },
  'Hóa Học': { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30' },
  'Hóa': { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30' },
  'Sinh Học': { bg: 'bg-teal-500/15', text: 'text-teal-300', border: 'border-teal-500/30' },
  'Sinh': { bg: 'bg-teal-500/15', text: 'text-teal-300', border: 'border-teal-500/30' },
  'Lịch Sử': { bg: 'bg-orange-500/15', text: 'text-orange-300', border: 'border-orange-500/30' },
  'Sử': { bg: 'bg-orange-500/15', text: 'text-orange-300', border: 'border-orange-500/30' },
  'Địa Lý': { bg: 'bg-cyan-500/15', text: 'text-cyan-300', border: 'border-cyan-500/30' },
  'Địa': { bg: 'bg-cyan-500/15', text: 'text-cyan-300', border: 'border-cyan-500/30' },
  'KTPL': { bg: 'bg-indigo-500/15', text: 'text-indigo-300', border: 'border-indigo-500/30' },
  'GDCD': { bg: 'bg-lime-500/15', text: 'text-lime-300', border: 'border-lime-500/30' },
  'Tin Học': { bg: 'bg-sky-500/15', text: 'text-sky-300', border: 'border-sky-500/30' },
  'Tin': { bg: 'bg-sky-500/15', text: 'text-sky-300', border: 'border-sky-500/30' },
  'Thể Dục': { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30' },
  'GDTC': { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30' },
  'GDQP-AN': { bg: 'bg-yellow-500/15', text: 'text-yellow-300', border: 'border-yellow-500/30' },
  'GDQPAN': { bg: 'bg-yellow-500/15', text: 'text-yellow-300', border: 'border-yellow-500/30' },
  'GDQP': { bg: 'bg-yellow-500/15', text: 'text-yellow-300', border: 'border-yellow-500/30' },
  'HDTNHN': { bg: 'bg-rose-500/15', text: 'text-rose-300', border: 'border-rose-500/30' },
  'GDĐP': { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30' },
  'Sinh hoạt lớp': { bg: 'bg-purple-500/15', text: 'text-purple-300', border: 'border-purple-500/30' },
  'Công Nghệ': { bg: 'bg-cyan-500/15', text: 'text-cyan-300', border: 'border-cyan-500/30' },
};

function getSubjectColor(subject: string) {
  if (!subject) return null;
  const s = subject.toLowerCase();
  for (const [key, val] of Object.entries(SUBJECT_COLORS)) {
    if (s.includes(key.toLowerCase())) return val;
  }
  return {
    bg: 'bg-blue-500/10',
    text: 'text-blue-300',
    border: 'border-blue-500/20',
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
    { key: 'c1', name: 'Tiết 1 (Chiều)' },
    { key: 'c2', name: 'Tiết 2 (Chiều)' },
    { key: 'c3', name: 'Tiết 3 (Chiều)' },
    { key: 'c4', name: 'Tiết 4 (Chiều)' },
    ...(hasAfternoonPeriod5 || isEditable ? [{ key: 'c5', name: 'Tiết 5 (Chiều)' }] : []),
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
            {/* Cột số tiết (đã loại bỏ khung giờ) */}
            <td className="p-3 text-center bg-white/[0.04] border-r border-white/10 w-24 sm:w-28 backdrop-blur-md">
              <span className="inline-block px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-white font-bold text-xs">
                {p.name}
              </span>
            </td>

            {/* Các ngày từ Thứ 2 đến Thứ 7 */}
            {days.map((d) => {
              const slot = timetable.schedule[d.key]?.[p.key];
              const colors = slot ? getSubjectColor(slot.subject) : null;
              const isCurrentDay = currentDayOfWeek === d.key;
              const isEditing = editingKey === `${d.key}_${p.key}`;

              return (
                <td
                  key={d.key}
                  onClick={() => !isEditing && isEditable && startEdit(d.key, p.key, slot)}
                  className={`p-2.5 border-l border-white/5 align-top transition-all ${
                    isCurrentDay ? 'bg-blue-500/[0.05]' : ''
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
                      className={`h-full min-h-[58px] p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                        colors
                          ? `${colors.bg} ${colors.border}`
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <p className={`font-semibold text-xs leading-tight ${colors ? colors.text : 'text-white'}`}>
                          {slot.subject}
                        </p>
                        {isEditable && (
                          <Edit2 className="w-2.5 h-2.5 text-slate-500 opacity-0 group-hover:opacity-100" />
                        )}
                      </div>

                      {slot.teacher && (
                        <p className="text-[10px] text-slate-400 truncate mt-1">
                          {slot.teacher}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="h-full min-h-[58px] rounded-xl border border-dashed border-white/5 flex items-center justify-center text-slate-600 text-[11px] italic">
                      {isEditable ? '+ Thêm' : '—'}
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

      {/* Bảng Thời khóa biểu Liquid Glass */}
      <Card className="rounded-3xl p-0 overflow-hidden">
        <div className="overflow-x-auto w-full scrollbar-thin">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.06] backdrop-blur-md">
                <th className="p-3.5 text-xs font-bold uppercase text-slate-300 w-24 sm:w-28 text-center font-mono">
                  Tiết
                </th>
                {days.map((d) => (
                  <th
                    key={d.key}
                    className={`p-3.5 text-xs font-bold text-center border-l border-white/10 ${
                      currentDayOfWeek === d.key
                        ? 'text-blue-300 bg-blue-500/20 font-extrabold'
                        : 'text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>{d.label}</span>
                      {currentDayOfWeek === d.key && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]" />
                      )}
                    </div>
                  </th>
                ))}
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
