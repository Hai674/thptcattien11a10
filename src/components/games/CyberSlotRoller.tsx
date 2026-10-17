import React, { useState, useEffect, useRef } from 'react';
import { cyberAudio } from '@/utils/cyberAudio';
import { Sparkles, Dices, Zap } from 'lucide-react';

interface CyberSlotRollerProps {
  candidates: { id: string; fullName: string; role?: string; group?: string }[];
  isSpinning: boolean;
  onSpinStart: () => void;
  onSpinEnd: (winner: { id: string; fullName: string; role?: string; group?: string }) => void;
}

export const CyberSlotRoller: React.FC<CyberSlotRollerProps> = ({
  candidates,
  isSpinning,
  onSpinStart,
  onSpinEnd,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [slotNumber, setSlotNumber] = useState('??');
  const [slotName, setSlotName] = useState('Sẵn sàng quay số...');
  const [slotRole, setSlotRole] = useState('Lớp 11A10 THPT Cát Tiên');

  useEffect(() => {
    if (!isSpinning || candidates.length === 0) return;

    let count = 0;
    const maxTicks = 42;
    let speed = 40;
    let timer: NodeJS.Timeout;

    const tick = () => {
      count++;
      const randomIdx = Math.floor(Math.random() * candidates.length);
      const student = candidates[randomIdx];
      setCurrentIdx(randomIdx);
      setSlotNumber(String(randomIdx + 1).padStart(2, '0'));
      setSlotName(student.fullName);
      setSlotRole(student.role || student.group || 'Học sinh 11A10');
      cyberAudio.playTick();

      if (count < maxTicks) {
        if (count > maxTicks - 8) {
          speed += 45;
        } else if (count > maxTicks - 16) {
          speed += 18;
        }
        timer = setTimeout(tick, speed);
      } else {
        const winner = candidates[Math.floor(Math.random() * candidates.length)];
        const winnerIndex = candidates.findIndex((c) => c.id === winner.id);
        setSlotNumber(String(winnerIndex >= 0 ? winnerIndex + 1 : 1).padStart(2, '0'));
        setSlotName(winner.fullName);
        setSlotRole(winner.role || winner.group || 'Học sinh 11A10');
        onSpinEnd(winner);
      }
    };

    timer = setTimeout(tick, speed);

    return () => clearTimeout(timer);
  }, [isSpinning, candidates, onSpinEnd]);

  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-3xl bg-slate-950/80 border border-indigo-500/30 shadow-2xl backdrop-blur-xl text-center space-y-6 relative overflow-hidden">
      {/* Vệt sáng trang trí Cyber */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

      {/* Tiêu đề máy xèng */}
      <div className="flex items-center justify-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase tracking-widest">
        <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
        <span>11A10 CYBER LOTTO ROLLER</span>
      </div>

      {/* Cửa sổ hiển thị cuộn máy xèng */}
      <div className="p-6 rounded-2xl bg-black/80 border-2 border-indigo-500/40 shadow-inner space-y-3 relative overflow-hidden">
        {/* Số thứ tự lớn */}
        <div className="flex items-center justify-center">
          <div
            className={`font-mono font-black text-6xl tracking-wider transition-all duration-75 ${
              isSpinning ? 'text-cyan-400 scale-105 blur-[0.5px]' : 'text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]'
            }`}
          >
            {slotNumber}
          </div>
        </div>

        {/* Tên học sinh */}
        <div
          className={`font-display font-bold text-2xl sm:text-3xl transition-colors duration-75 min-h-[40px] flex items-center justify-center ${
            isSpinning ? 'text-indigo-300' : 'text-white'
          }`}
        >
          {slotName}
        </div>

        {/* Thông tin vai trò / tổ */}
        <div className="text-xs font-mono text-slate-400">
          {slotRole}
        </div>

        {/* Khung quét Laser scanline */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent pointer-events-none animate-pulse" />
      </div>

      {/* Nút bấm Gạt Cần Quay */}
      <button
        type="button"
        disabled={isSpinning || candidates.length === 0}
        onClick={onSpinStart}
        className={`w-full py-4 px-6 rounded-2xl font-display font-black text-sm uppercase tracking-wider transition-all shadow-xl flex items-center justify-center gap-2 active:scale-98 ${
          isSpinning
            ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
            : candidates.length === 0
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-indigo-600/40 hover:shadow-indigo-600/60'
        }`}
      >
        <Dices className="w-5 h-5 text-amber-300" />
        <span>{isSpinning ? 'Đang quay số xèng...' : `Gạt cần quay số (${candidates.length} bạn)`}</span>
      </button>
    </div>
  );
};
