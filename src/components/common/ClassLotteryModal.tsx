import React, { useState, useEffect } from 'react';
import { loadMembersFromStorage } from '@/services/memberService';
import { Member } from '@/types';
import { Button } from '@/components/ui/button';
import { GlassButton } from '@/components/ui/glass-button';
import { Dices, Trophy, X, RotateCcw, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { cyberAudio } from '@/utils/cyberAudio';

interface ClassLotteryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClassLotteryModal: React.FC<ClassLotteryModalProps> = ({ isOpen, onClose }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Member | null>(null);
  const [displayedName, setDisplayedName] = useState('Bấm nút để chọn ngẫu nhiên');
  const [displayedRole, setDisplayedRole] = useState('Tập thể 11A10 • THPT Cát Tiên');

  useEffect(() => {
    if (isOpen) {
      const currentList = loadMembersFromStorage();
      setMembers(currentList);
      setSelectedStudent(null);
      setIsSpinning(false);
      if (currentList.length === 0) {
        setDisplayedName('Chưa có danh sách học sinh');
        setDisplayedRole('Vào trang "Thành viên" để nạp file Excel hoặc thêm bạn mới');
      } else {
        setDisplayedName('Bấm nút để chọn ngẫu nhiên');
        setDisplayedRole(`Đang sẵn sàng ${currentList.length} học sinh 11A10`);
      }
    }
  }, [isOpen]);

  const handleStartSpin = () => {
    if (isSpinning || members.length === 0) return;
    setIsSpinning(true);
    setSelectedStudent(null);

    let counter = 0;
    const totalTicks = 36;
    let speed = 40;

    const runTick = () => {
      counter++;
      const randomIdx = Math.floor(Math.random() * members.length);
      const randomMember = members[randomIdx];

      setDisplayedName(randomMember.fullName);
      setDisplayedRole(randomMember.role || 'Học sinh 11A10');
      cyberAudio.playTick();

      if (counter < totalTicks) {
        if (counter > totalTicks - 10) {
          speed += 30;
        } else if (counter > totalTicks - 20) {
          speed += 14;
        }
        setTimeout(runTick, speed);
      } else {
        const winner = members[Math.floor(Math.random() * members.length)];
        setSelectedStudent(winner);
        setDisplayedName(winner.fullName);
        setDisplayedRole(winner.role || 'Học sinh 11A10');
        setIsSpinning(false);
        cyberAudio.playFanfare();

        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }
      }
    };

    setTimeout(runTick, speed);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-white/10 p-6 sm:p-8 text-center space-y-6 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-mono">
            <Dices className="w-3.5 h-3.5 text-blue-400" />
            <span>Tiện ích lớp học 11A10</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-white">
            Bốc thăm ngẫu nhiên
          </h2>
          <p className="text-xs text-slate-400">
            Chọn ngẫu nhiên học sinh phát biểu, kiểm tra bài cũ hoặc nhận nhiệm vụ lớp
          </p>
        </div>

        {/* Display Card */}
        <div className="py-8 px-4 rounded-2xl bg-slate-950/70 border border-white/5 flex flex-col items-center justify-center min-h-[160px]">
          {selectedStudent ? (
            <div className="space-y-2 animate-in zoom-in-95 duration-300">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
                <Trophy className="w-3.5 h-3.5 text-emerald-400" /> Học sinh được chọn
              </span>
              <div className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                {displayedName}
              </div>
              <div className="text-xs font-mono text-slate-400">
                {displayedRole}
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div
                className={`font-display text-xl sm:text-2xl font-bold transition-colors ${
                  isSpinning ? 'text-blue-400' : members.length === 0 ? 'text-amber-300 text-lg' : 'text-slate-200'
                }`}
              >
                {displayedName}
              </div>
              <div className="text-xs font-mono text-slate-400 max-w-xs mx-auto">{displayedRole}</div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div>
          <GlassButton
            size="lg"
            variant="primary"
            disabled={isSpinning || members.length === 0}
            onClick={handleStartSpin}
            className="w-full"
          >
            {isSpinning ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin text-purple-400" /> <span>Đang chọn ngẫu nhiên...</span>
              </>
            ) : members.length === 0 ? (
              <>
                <AlertCircle className="w-4 h-4 text-amber-400" /> <span>Hãy nạp danh sách học sinh trước</span>
              </>
            ) : selectedStudent ? (
              <>
                <Dices className="w-4 h-4 text-amber-400" /> <span>Bốc thăm bạn khác</span>
              </>
            ) : (
              <>
                <Dices className="w-4 h-4 text-amber-400" /> <span>Bắt đầu bốc thăm ({members.length} bạn)</span>
              </>
            )}
          </GlassButton>
        </div>
      </div>
    </div>
  );
};

export default ClassLotteryModal;
