import React, { useState, useEffect, useMemo } from 'react';
import { loadMembersFromStorage } from '@/services/memberService';
import { Member } from '@/types';
import { DEFAULT_11A10_STUDENTS, StudentCandidate } from '@/data/classDefaultStudents';
import { LuckyWheelCanvas } from '@/components/games/LuckyWheelCanvas';
import { CyberSlotRoller } from '@/components/games/CyberSlotRoller';
import { MysteryCardDeck } from '@/components/games/MysteryCardDeck';
import { GlassButton } from '@/components/ui/glass-button';
import { Link } from 'react-router-dom';
import {
  Dices,
  Trophy,
  X,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Users,
  CheckCircle2,
  Sparkles,
  Zap,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { cyberAudio } from '@/utils/cyberAudio';
import { toast } from 'sonner';

interface ClassLotteryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type GameMode = 'wheel' | 'slot' | 'card';

export const ClassLotteryModal: React.FC<ClassLotteryModalProps> = ({ isOpen, onClose }) => {
  const [allStudents, setAllStudents] = useState<StudentCandidate[]>([]);
  const [gameMode, setGameMode] = useState<GameMode>('card');
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<StudentCandidate | null>(null);
  const [calledIds, setCalledIds] = useState<string[]>(() => {
    try {
      const saved = sessionStorage.getItem('11a10_called_students');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [excludeCalled, setExcludeCalled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const fromStorage = loadMembersFromStorage();
      if (fromStorage.length > 0) {
        const mapped: StudentCandidate[] = fromStorage.map((m: Member, idx: number) => ({
          id: m.id || String(idx + 1),
          fullName: m.fullName,
          role: m.role || 'Học sinh',
        }));
        setAllStudents(mapped);
      } else {
        setAllStudents(DEFAULT_11A10_STUDENTS);
      }
      setWinner(null);
      setIsSpinning(false);
    }
  }, [isOpen]);

  // Lưu session gọi tên
  useEffect(() => {
    sessionStorage.setItem('11a10_called_students', JSON.stringify(calledIds));
  }, [calledIds]);

  const activeCandidates = useMemo(() => {
    return allStudents.filter((student) => {
      if (excludeCalled && calledIds.includes(student.id)) {
        return false;
      }
      return true;
    });
  }, [allStudents, excludeCalled, calledIds]);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    cyberAudio.enabled = next;
  };

  const handleSpinStart = () => {
    if (activeCandidates.length === 0) {
      toast.error('Không còn học sinh khả dụng!');
      return;
    }
    setWinner(null);
    setIsSpinning(true);
  };

  const handleSpinEnd = (chosenWinner: StudentCandidate) => {
    setIsSpinning(false);
    setWinner(chosenWinner);
    cyberAudio.playFanfare();

    try {
      confetti({
        particleCount: 100,
        spread: 75,
        origin: { y: 0.6 },
      });
    } catch {}
  };

  const handleMarkCalled = (studentId: string) => {
    if (!calledIds.includes(studentId)) {
      setCalledIds((prev) => [...prev, studentId]);
      toast.success('Đã ghi nhận bạn được gọi!');
    }
    setWinner(null);
  };

  const handleResetCalled = () => {
    setCalledIds([]);
    setWinner(null);
    toast.success('Đã đặt lại lượt gọi cho tiết học!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-white/10 p-5 sm:p-6 text-center space-y-4 shadow-2xl my-auto">
        {/* Nút đóng modal */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 flex items-center justify-center transition-colors z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Tiêu đề Modal & Nút mở toàn màn hình */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-slate-400 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Bốc Thăm & Gọi Tên 11A10</span>
            </span>
            <Link
              to="/vong-quay"
              onClick={onClose}
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium transition-colors"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Chế độ chiếu Tivi</span>
            </Link>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-black text-white">
            Chọn Ngẫu Nhiên Học Sinh Lên Bảng
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Bốc thăm cả lớp 46 học sinh: 46 lá bài bí mật, Vòng quay may mắn hoặc Máy xèng tốc độ
          </p>
        </div>

        {/* Chọn Chế độ chơi */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-white/5">
            <button
              type="button"
              onClick={() => {
                setGameMode('card');
                cyberAudio.playClick();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                gameMode === 'card' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Lật 46 thẻ bài ma thuật"
            >
              🃏 46 Thẻ bài
            </button>
            <button
              type="button"
              onClick={() => {
                setGameMode('wheel');
                cyberAudio.playClick();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                gameMode === 'wheel' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Vòng quay kỳ diệu"
            >
              🎡 Vòng quay
            </button>
            <button
              type="button"
              onClick={() => {
                setGameMode('slot');
                cyberAudio.playClick();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                gameMode === 'slot' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Quay số xèng tốc độ"
            >
              🎰 Xèng số
            </button>
          </div>
        </div>

        {/* Thanh trạng thái sĩ số & Tránh gọi trùng */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-950/60 border border-white/5 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[11px]">
              Sĩ số: <strong className="text-white">{allStudents.length} học sinh</strong> • Sẵn sàng: <strong className="text-amber-400">{activeCandidates.length}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 text-[11px] select-none">
              <input
                type="checkbox"
                checked={excludeCalled}
                onChange={(e) => setExcludeCalled(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-blue-600"
              />
              <span>Tránh gọi trùng ({calledIds.length})</span>
            </label>

            {calledIds.length > 0 && (
              <button
                type="button"
                onClick={handleResetCalled}
                className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-0.5 font-mono"
              >
                <RotateCcw className="w-2.5 h-2.5" /> Đặt lại
              </button>
            )}

            <button
              type="button"
              onClick={handleToggleSound}
              className="text-slate-400 hover:text-white p-1"
              title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-red-400" />}
            </button>
          </div>
        </div>

        {/* Khung tương tác trò chơi */}
        <div className="relative py-4 px-2 rounded-2xl bg-slate-950/80 border border-white/5 flex flex-col items-center justify-center min-h-[320px]">
          {activeCandidates.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <Trophy className="w-10 h-10 text-amber-400 mx-auto" />
              <h4 className="text-base font-bold text-white">Đã gọi hết học sinh trong danh sách!</h4>
              <p className="text-xs text-slate-400">Bấm đặt lại để bắt đầu vòng gọi mới.</p>
              <GlassButton size="sm" variant="primary" onClick={handleResetCalled}>
                <span>Đặt lại lượt gọi</span>
              </GlassButton>
            </div>
          ) : (
            <>
              {gameMode === 'wheel' && (
                <LuckyWheelCanvas
                  candidates={activeCandidates}
                  isSpinning={isSpinning}
                  onSpinStart={handleSpinStart}
                  onSpinEnd={handleSpinEnd}
                  selectedPurpose="Bốc thăm ngẫu nhiên"
                />
              )}

              {gameMode === 'slot' && (
                <CyberSlotRoller
                  candidates={activeCandidates}
                  isSpinning={isSpinning}
                  onSpinStart={handleSpinStart}
                  onSpinEnd={handleSpinEnd}
                />
              )}

              {gameMode === 'card' && (
                <MysteryCardDeck
                  candidates={activeCandidates}
                  onSelectWinner={handleSpinEnd}
                />
              )}
            </>
          )}

          {/* Popup trúng giải */}
          {winner && (
            <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md rounded-2xl animate-in zoom-in-95 duration-200">
              <div className="w-full max-w-xs rounded-2xl bg-slate-900 border-2 border-amber-400 p-5 text-center space-y-4 shadow-2xl">
                <Trophy className="w-8 h-8 text-amber-400 mx-auto" />
                <div>
                  <span className="inline-block text-amber-400 text-[11px] font-mono font-bold tracking-wider uppercase">
                    🎲 BỐC THĂM 11A10
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white font-display pt-1">
                    {winner.fullName}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {winner.role || 'Học sinh'} • Tập thể 11A10
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <GlassButton
                    size="sm"
                    variant="primary"
                    onClick={() => handleMarkCalled(winner.id)}
                    className="w-full"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Đánh dấu đã hoàn thành</span>
                  </GlassButton>

                  <GlassButton
                    size="sm"
                    variant="secondary"
                    onClick={() => setWinner(null)}
                    className="w-full"
                  >
                    <span>Quay bạn tiếp theo</span>
                  </GlassButton>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassLotteryModal;
