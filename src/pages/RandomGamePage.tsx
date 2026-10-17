import React, { useState, useEffect, useMemo } from 'react';
import { loadMembersFromStorage } from '@/services/memberService';
import { Member } from '@/types';
import { DEFAULT_11A10_STUDENTS, StudentCandidate } from '@/data/classDefaultStudents';
import { LuckyWheelCanvas } from '@/components/games/LuckyWheelCanvas';
import { CyberSlotRoller } from '@/components/games/CyberSlotRoller';
import { MysteryCardDeck } from '@/components/games/MysteryCardDeck';
import { GlassButton } from '@/components/ui/glass-button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dices,
  Trophy,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Users,
  CheckCircle2,
  History,
  Sparkles,
  Zap,
  Layers,
  GraduationCap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { cyberAudio } from '@/utils/cyberAudio';
import { toast } from 'sonner';

type GameMode = 'wheel' | 'slot' | 'card';

export const RandomGamePage: React.FC = () => {
  // Danh sách học sinh tổng
  const [allStudents, setAllStudents] = useState<StudentCandidate[]>([]);
  // Chế độ trò chơi
  const [gameMode, setGameMode] = useState<GameMode>('card');
  // Trạng thái đang quay
  const [isSpinning, setIsSpinning] = useState(false);
  // Người trúng giải hiện tại
  const [winner, setWinner] = useState<StudentCandidate | null>(null);
  // Danh sách các bạn đã gọi (đã kiểm tra)
  const [calledIds, setCalledIds] = useState<string[]>(() => {
    try {
      const saved = sessionStorage.getItem('11a10_called_students');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  // Lịch sử lượt gọi
  const [history, setHistory] = useState<{ student: StudentCandidate; purpose: string; time: string }[]>([]);
  // Bật/tắt loại trừ
  const [excludeCalled, setExcludeCalled] = useState(true);
  // Âm thanh
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Nạp danh sách từ storage hoặc 46 bạn chính thức 11A10
  useEffect(() => {
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
  }, []);

  // Lưu danh sách đã gọi vào sessionStorage trong tiết học
  useEffect(() => {
    sessionStorage.setItem('11a10_called_students', JSON.stringify(calledIds));
  }, [calledIds]);

  // Danh sách ứng viên hợp lệ sau khi loại trừ người đã gọi
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
    if (next) {
      cyberAudio.playClick();
      toast.success('Đã bật âm thanh trò chơi');
    } else {
      toast.info('Đã tắt âm thanh');
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleResetCalled = () => {
    setCalledIds([]);
    toast.success('Đã làm mới danh sách gọi, sẵn sàng cho lượt tiếp theo!');
    cyberAudio.playClick();
  };

  const handleSpinStart = () => {
    if (activeCandidates.length === 0) {
      toast.error('Không còn học sinh nào khả dụng!');
      return;
    }
    setWinner(null);
    setIsSpinning(true);
  };

  const handleSpinEnd = (chosenWinner: StudentCandidate) => {
    setIsSpinning(false);
    setWinner(chosenWinner);

    // Kích hoạt âm thanh vỗ tay và nhạc ăn mừng
    cyberAudio.playFanfare();

    // Hiệu ứng pháo hoa mừng rực rỡ
    confetti({
      particleCount: 120,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#38bdf8', '#818cf8', '#c084fc', '#f59e0b', '#10b981'],
    });

    // Thêm vào lịch sử lượt gọi
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    setHistory((prev) => [
      { student: chosenWinner, purpose: 'Bốc thăm ngẫu nhiên', time: timeStr },
      ...prev.slice(0, 9),
    ]);
  };

  const handleMarkCalled = (studentId: string) => {
    if (!calledIds.includes(studentId)) {
      setCalledIds((prev) => [...prev, studentId]);
      toast.success('Đã đánh dấu hoàn thành lượt!');
    }
    setWinner(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* ================= HEADER TIÊU ĐỀ ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>LỚP 11A10 • THPT CÁT TIÊN</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-display flex items-center gap-2">
            Bốc Thăm & Gọi Tên Ngẫu Nhiên
            <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Bốc thăm ngẫu nhiên cả lớp 46 học sinh: Vòng quay may mắn, máy xèng tốc độ hoặc lật 46 thẻ bài ma thuật
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <GlassButton
            size="sm"
            onClick={handleToggleSound}
            contentClassName="flex items-center gap-1.5 text-xs text-slate-300"
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Âm thanh: Bật' : 'Âm thanh: Tắt'}</span>
          </GlassButton>

          <GlassButton
            size="sm"
            onClick={handleToggleFullscreen}
            contentClassName="flex items-center gap-1.5 text-xs text-amber-300"
            title="Mở toàn màn hình trình chiếu máy chiếu/Tivi"
          >
            <Maximize2 className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Chiếu Tivi / F11</span>
          </GlassButton>
        </div>
      </div>

      {/* ================= THANH TÙY CHỌN CHẾ ĐỘ TRÒ CHƠI ================= */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
          Chọn chế độ bốc thăm:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => {
              setGameMode('card');
              cyberAudio.playClick();
            }}
            className={`p-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 border ${
              gameMode === 'card'
                ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4 text-pink-300" />
            <span>🃏 Bốc thăm 46 lá bài bí mật</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setGameMode('wheel');
              cyberAudio.playClick();
            }}
            className={`p-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 border ${
              gameMode === 'wheel'
                ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Dices className="w-4 h-4 text-amber-300" />
            <span>🎡 Vòng quay kỳ diệu</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setGameMode('slot');
              cyberAudio.playClick();
            }}
            className={`p-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 border ${
              gameMode === 'slot'
                ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Zap className="w-4 h-4 text-cyan-300" />
            <span>🎰 Quay xèng số tốc độ</span>
          </button>
        </div>
      </div>

      {/* ================= THANH TRẠNG THÁI & LOẠI TRỪ TRÙNG ================= */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-medium">
          <Users className="w-4 h-4 text-indigo-400" />
          <span>Sĩ số lớp 11A10: <strong className="text-white">{allStudents.length} học sinh</strong></span>
          <span className="text-slate-500">•</span>
          <span>Sẵn sàng: <strong className="text-amber-400">{activeCandidates.length}</strong></span>
        </div>

        {/* Tùy chọn không gọi lại */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
            <input
              type="checkbox"
              checked={excludeCalled}
              onChange={(e) => setExcludeCalled(e.target.checked)}
              className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
            />
            <span>Không gọi lại bạn đã kiểm tra ({calledIds.length} đã gọi)</span>
          </label>

          {calledIds.length > 0 && (
            <button
              type="button"
              onClick={handleResetCalled}
              className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono"
            >
              <RotateCcw className="w-3 h-3" /> Đặt lại
            </button>
          )}
        </div>
      </div>

      {/* ================= KHU VỰC TRÒ CHƠI CHÍNH ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cột chính: Trò chơi (Col 8) */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl bg-slate-950/60 border border-white/10 backdrop-blur-xl relative min-h-[480px]">
          {/* Thông báo số lượng khả dụng */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 text-xs font-mono text-slate-400">
            <Users className="w-4 h-4 text-blue-400" />
            <span>
              Ứng viên: <strong className="text-white">{activeCandidates.length}</strong> / {allStudents.length}
            </span>
          </div>

          {/* Banner chế độ */}
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Bốc thăm may mắn 11A10</span>
          </div>

          {/* HIỂN THỊ TRÒ CHƠI PHÙ HỢP VỚI CHẾ ĐỘ ĐANG CHỌN */}
          {activeCandidates.length === 0 ? (
            <div className="text-center p-8 space-y-3">
              <Trophy className="w-12 h-12 text-amber-400 mx-auto opacity-50" />
              <p className="text-sm text-slate-300">Tất cả các bạn đã được gọi trong tiết học này!</p>
              <GlassButton size="sm" onClick={handleResetCalled}>
                Bắt đầu vòng bốc thăm mới
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

          {/* ================= MODAL / POPUP CHIẾN THẮNG HIỆN LÊN KHI TRÚNG ================= */}
          {winner && (
            <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in zoom-in-95 duration-200">
              <div className="w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-amber-400 p-6 text-center space-y-5 shadow-2xl relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-amber-500/40">
                  <Trophy className="w-8 h-8 text-amber-200" />
                </div>

                <div className="space-y-1">
                  <span className="inline-block px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-mono font-bold">
                    🎲 BỐC THĂM 11A10
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white font-display pt-1">
                    {winner.fullName}
                  </h2>
                  <p className="text-xs font-mono text-slate-400">
                    {winner.role || 'Học sinh'} • Tập thể 11A10
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <GlassButton
                    size="default"
                    variant="primary"
                    onClick={() => handleMarkCalled(winner.id)}
                    className="w-full"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Đánh dấu đã hoàn thành lượt</span>
                  </GlassButton>

                  <GlassButton
                    size="default"
                    variant="secondary"
                    onClick={() => setWinner(null)}
                    className="w-full"
                  >
                    <RotateCcw className="w-4 h-4 text-blue-400" />
                    <span>Bốc bạn tiếp theo</span>
                  </GlassButton>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cột phụ: Lịch sử & Danh sách đã gọi (Col 4) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card Lịch sử vừa gọi */}
          <Card className="text-white shadow-xl rounded-3xl">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-400" />
                  <h3 className="font-bold text-sm text-white">Lịch sử lượt bốc thăm</h3>
                </div>
                <span className="text-xs font-mono text-slate-400">{history.length} lượt</span>
              </div>

              {history.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center italic">
                  Chưa có lượt bốc thăm nào trong phiên làm việc này
                </p>
              ) : (
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {history.map((h, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-200">{h.student.fullName}</div>
                        <div className="text-[10px] text-slate-400">11A10</div>
                      </div>
                      <span className="text-[10px] font-mono text-amber-300/80">{h.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card Danh sách học sinh đã kiểm tra */}
          <Card className="text-white shadow-xl rounded-3xl">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-sm text-white">Đã gọi trong tiết</h3>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-bold">{calledIds.length} bạn</span>
              </div>

              {calledIds.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center italic">
                  Chưa có học sinh nào được đánh dấu đã gọi
                </p>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {calledIds.map((id) => {
                    const student = allStudents.find((s) => s.id === id);
                    if (!student) return null;
                    return (
                      <div
                        key={id}
                        className="py-1 px-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-between"
                      >
                        <span className="font-medium truncate">{student.fullName}</span>
                        <span className="text-[10px] text-slate-400">11A10</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {calledIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleResetCalled}
                  className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 transition-colors"
                >
                  Đặt lại danh sách cho tiết sau
                </button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RandomGamePage;
