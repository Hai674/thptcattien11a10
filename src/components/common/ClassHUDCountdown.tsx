import React, { useState, useEffect } from 'react';
import { Target, Sparkles, GraduationCap, Calendar } from 'lucide-react';
import { GlassButton } from '@/components/ui/glass-button';

interface CountdownTarget {
  id: string;
  name: string;
  badge: string;
  targetDate: string;
  description: string;
}

const COUNTDOWN_TARGETS: CountdownTarget[] = [
  {
    id: 'graduation2028',
    name: 'Đếm ngược Kỳ thi Tốt nghiệp THPT 2028',
    badge: 'Mục tiêu Niên khóa 2025 - 2028',
    targetDate: '2028-06-25T07:00:00',
    description: 'Chặng đường chinh phục kỳ thi đại học và ước mơ của tập thể học sinh 11A10 trường THPT Cát Tiên.',
  },
  {
    id: 'schoolyear2027',
    name: 'Đếm ngược Tổng kết Năm học 11A10',
    badge: 'Năm học 2026 - 2027',
    targetDate: '2027-05-25T07:00:00',
    description: 'Hoàn thành chương trình lớp 11, chuẩn bị hành trang bước vào năm học lớp 12 quyết định.',
  },
];

export const ClassHUDCountdown: React.FC = () => {
  const [selectedTargetId, setSelectedTargetId] = useState<string>('graduation2028');

  const currentTarget =
    COUNTDOWN_TARGETS.find((t) => t.id === selectedTargetId) || COUNTDOWN_TARGETS[0];

  const targetTimestamp = new Date(currentTarget.targetDate).getTime();

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetTimestamp - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetTimestamp]);

  return (
    <div className="rounded-2xl p-6 bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-lg">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left: Info */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-mono">
              <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
              <span>{currentTarget.badge}</span>
            </div>

            {/* Target Switcher Tabs */}
            <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-xl border border-white/5">
              {COUNTDOWN_TARGETS.map((t) => {
                const isSelected = t.id === selectedTargetId;
                const label = t.id === 'graduation2028' ? 'Thi THPT 2028' : 'Tổng kết 11';
                return isSelected ? (
                  <GlassButton
                    key={t.id}
                    size="sm"
                    variant="primary"
                    onClick={() => setSelectedTargetId(t.id)}
                    className="h-7 px-2.5 text-[11px] font-mono"
                  >
                    <span>{label}</span>
                  </GlassButton>
                ) : (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTargetId(t.id)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-mono text-slate-400 hover:text-white hover:bg-white/5 whitespace-nowrap transition-all"
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>{currentTarget.name}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" />
          </h3>
          <p className="text-xs text-slate-300/80 max-w-lg leading-relaxed">
            {currentTarget.description}
          </p>
        </div>

        {/* Right: Clean Counters */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Days */}
          <div className="flex flex-col items-center justify-center min-w-[64px] sm:min-w-[74px] h-[68px] rounded-xl bg-slate-950/80 border border-white/10 px-2 shadow-inner">
            <span className="font-mono text-2xl sm:text-3xl font-bold text-white">
              {timeLeft.days}
            </span>
            <span className="text-[10px] font-mono uppercase text-slate-400">Ngày</span>
          </div>

          <span className="text-slate-600 font-mono text-xl pb-3">:</span>

          {/* Hours */}
          <div className="flex flex-col items-center justify-center min-w-[56px] sm:min-w-[64px] h-[68px] rounded-xl bg-slate-950/80 border border-white/10 px-2 shadow-inner">
            <span className="font-mono text-2xl sm:text-3xl font-bold text-white">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span className="text-[10px] font-mono uppercase text-slate-400">Giờ</span>
          </div>

          <span className="text-slate-600 font-mono text-xl pb-3">:</span>

          {/* Minutes */}
          <div className="flex flex-col items-center justify-center min-w-[56px] sm:min-w-[64px] h-[68px] rounded-xl bg-slate-950/80 border border-white/10 px-2 shadow-inner">
            <span className="font-mono text-2xl sm:text-3xl font-bold text-white">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="text-[10px] font-mono uppercase text-slate-400">Phút</span>
          </div>

          <span className="text-slate-600 font-mono text-xl pb-3">:</span>

          {/* Seconds */}
          <div className="flex flex-col items-center justify-center min-w-[56px] sm:min-w-[64px] h-[68px] rounded-xl bg-slate-950/80 border border-blue-500/30 px-2 shadow-inner">
            <span className="font-mono text-2xl sm:text-3xl font-bold text-blue-400">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
            <span className="text-[10px] font-mono uppercase text-blue-300">Giây</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassHUDCountdown;
