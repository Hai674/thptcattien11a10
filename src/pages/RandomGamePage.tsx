import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { loadMembersFromStorage } from '@/services/memberService';
import { Member } from '@/types';
import { DEFAULT_11A10_STUDENTS, StudentCandidate } from '@/data/classDefaultStudents';
import { LuckyWheelCanvas } from '@/components/games/LuckyWheelCanvas';
import { CyberSlotRoller } from '@/components/games/CyberSlotRoller';
import { MysteryCardDeck } from '@/components/games/MysteryCardDeck';
import { DuckRaceGame } from '@/components/games/DuckRaceGame';
import { UfoAbductionGame } from '@/components/games/UfoAbductionGame';
import { GlassButton } from '@/components/ui/glass-button';
import { Card, CardContent } from '@/components/ui/card';
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
  History,
  Sparkles,
  Zap,
  Layers,
  GraduationCap,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { cyberAudio } from '@/utils/cyberAudio';
import { toast } from 'sonner';

type GameMode = 'wheel' | 'card' | 'slot' | 'duck' | 'ufo';

export const RandomGamePage: React.FC = () => {
  // Danh sách học sinh tổng
  const [allStudents, setAllStudents] = useState<StudentCandidate[]>([]);
  // Chế độ trò chơi: mặc định vòng quay kỳ diệu
  const [gameMode, setGameMode] = useState<GameMode>('wheel');
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
  // Bật/tắt loại trừ người đã gọi
  const [excludeCalled, setExcludeCalled] = useState(true);
  // Âm thanh
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Hàm đồng bộ danh sách học sinh từ kho lưu trữ chung của website lớp
  const syncStudentsFromStorage = useCallback(() => {
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

  // Tự động nạp dữ liệu khi mở trang và khi tab được focus lại
  useEffect(() => {
    syncStudentsFromStorage();

    const handleFocus = () => syncStudentsFromStorage();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [syncStudentsFromStorage]);

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

  const handleManualSync = () => {
    syncStudentsFromStorage();
    toast.success('Đã đồng bộ danh sách học sinh mới nhất!');
    cyberAudio.playClick();
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
      { student: chosenWinner, purpose: 'Gọi ngẫu nhiên', time: timeStr },
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
    <div className="space-y-8 animate-in fade-in duration-300 pb-20">
      {/* ================= HEADER BANNER CHUẨN DESIGN SYSTEM ================= */}
      <Card className="rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 text-blue-300 text-xs font-mono">
            <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
            <span>Năm học 2026 - 2027 • THPT Cát Tiên</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Vòng Quay & Bốc Thăm 11A10
            <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Sĩ số lớp: <strong className="text-blue-400 font-semibold">{allStudents.length} học sinh</strong> • Quay ngẫu nhiên gọi lên bảng, phát biểu, kiểm tra miệng và bốc thăm không trùng lặp
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <GlassButton
            size="sm"
            variant="secondary"
            onClick={handleManualSync}
            title="Đồng bộ danh sách học sinh mới nhất từ trang Danh sách lớp"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Đồng bộ</span>
          </GlassButton>

          <GlassButton
            size="sm"
            variant="secondary"
            onClick={handleToggleSound}
            contentClassName="flex items-center gap-1.5 text-xs text-slate-300"
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Bật âm' : 'Tắt âm'}</span>
          </GlassButton>

          <GlassButton
            size="sm"
            variant="secondary"
            onClick={handleToggleFullscreen}
            contentClassName="flex items-center gap-1.5 text-xs text-slate-200"
            title="Mở toàn màn hình trình chiếu máy chiếu/Tivi"
          >
            <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
            <span>Chiếu Tivi / F11</span>
          </GlassButton>
        </div>
      </Card>

      {/* ================= THANH TÙY CHỌN & BỘ ĐIỀU HƯỚNG CHẾ ĐỘ ================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Bộ chọn chế độ dạng Tabs chuẩn */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 w-full sm:w-fit overflow-x-auto scrollbar-thin">
          {[
            { id: 'wheel', label: '🎡 Vòng quay kỳ diệu' },
            { id: 'card', label: '🃏 Bốc thăm 46 lá bài' },
            { id: 'slot', label: '🎰 Máy xèng tốc độ' },
            { id: 'duck', label: '🦆 Đua vịt vượt thác' },
            { id: 'ufo', label: '🛸 UFO bắt cóc' },
          ].map((mode) =>
            gameMode === mode.id ? (
              <GlassButton
                key={mode.id}
                size="sm"
                variant="primary"
                onClick={() => {
                  setGameMode(mode.id as GameMode);
                  cyberAudio.playClick();
                }}
                contentClassName="px-3 sm:px-4 py-1.5 text-xs text-white font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <span>{mode.label}</span>
              </GlassButton>
            ) : (
              <button
                key={mode.id}
                type="button"
                onClick={() => {
                  setGameMode(mode.id as GameMode);
                  cyberAudio.playClick();
                }}
                className="h-8 sm:h-9 px-3 sm:px-4 rounded-full inline-flex items-center justify-center text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all whitespace-nowrap shrink-0"
              >
                {mode.label}
              </button>
            )
          )}
        </div>

        {/* Thanh trạng thái loại trừ trùng */}
        <div className="flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-slate-300">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={excludeCalled}
              onChange={(e) => setExcludeCalled(e.target.checked)}
              className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
            />
            <span>Không gọi lại bạn đã kiểm tra ({calledIds.length})</span>
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
        <div className="lg:col-span-8 flex flex-col items-center justify-center p-3 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-slate-900/90 via-indigo-950/40 to-slate-900/90 border border-white/10 backdrop-blur-2xl relative min-h-[420px] sm:min-h-[500px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.1)]">
          {/* Radiant Cosmic Ambient Glow behind game */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-gradient-to-tr from-indigo-600/25 via-purple-600/20 to-cyan-500/20 rounded-full blur-3xl opacity-85" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0%,transparent_70%)]" />
          </div>

          {/* Thông báo số lượng khả dụng */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-mono text-slate-300">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
            <span>
              Sẵn sàng: <strong className="text-white">{activeCandidates.length}</strong> / {allStudents.length} học sinh
            </span>
          </div>

          {/* Banner chế độ */}
          <div className="mt-6 sm:mt-0 mb-3 sm:mb-4 inline-flex items-center gap-1.5 sm:gap-2 text-slate-300 text-[11px] sm:text-xs font-medium relative z-10">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Tập thể lớp 11A10 • THPT Cát Tiên</span>
          </div>

          {/* HIỂN THỊ TRÒ CHƠI PHÙ HỢP VỚI CHẾ ĐỘ ĐANG CHỌN */}
          {activeCandidates.length === 0 ? (
            <div className="text-center p-8 space-y-3 relative z-10">
              <Trophy className="w-12 h-12 text-amber-400 mx-auto opacity-50" />
              <p className="text-sm text-slate-300">Tất cả các bạn đã được gọi trong tiết học này!</p>
              <GlassButton size="sm" variant="primary" onClick={handleResetCalled}>
                Bắt đầu vòng bốc thăm mới
              </GlassButton>
            </div>
          ) : (
            <div className="relative z-10 w-full flex items-center justify-center">
              {gameMode === 'wheel' && (
                <LuckyWheelCanvas
                  candidates={activeCandidates}
                  isSpinning={isSpinning}
                  onSpinStart={handleSpinStart}
                  onSpinEnd={handleSpinEnd}
                  selectedPurpose="Bốc thăm ngẫu nhiên"
                />
              )}

              {gameMode === 'card' && (
                <MysteryCardDeck
                  candidates={activeCandidates}
                  onSelectWinner={handleSpinEnd}
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

              {gameMode === 'duck' && (
                <DuckRaceGame
                  candidates={activeCandidates}
                  onSelectWinner={handleSpinEnd}
                />
              )}

              {gameMode === 'ufo' && (
                <UfoAbductionGame
                  candidates={activeCandidates}
                  onSelectWinner={handleSpinEnd}
                />
              )}
            </div>
          )}

          {/* ================= MODAL / POPUP CHIẾN THẮNG HIỆN LÊN KHI TRÚNG ================= */}
          {winner && (
            <div className="absolute inset-0 z-30 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
              {/* Outer Golden Glow Halo */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] bg-gradient-to-tr from-amber-500/25 via-purple-600/20 to-indigo-500/25 rounded-full blur-3xl pointer-events-none animate-pulse" />

              <div className="w-full max-w-[90vw] sm:max-w-sm rounded-2xl sm:rounded-3xl bg-gradient-to-b from-slate-900/95 via-indigo-950/90 to-slate-900/95 border border-white/15 p-4 sm:p-7 text-center space-y-4 sm:space-y-5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(245,158,11,0.2)] relative overflow-hidden">
                {/* Top Radiant Bar */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-400" />

                {/* Close Button X */}
                <button
                  type="button"
                  onClick={() => setWinner(null)}
                  className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white flex items-center justify-center transition-colors text-xs"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                {/* Celebration Trophy Icon */}
                <div className="relative mx-auto w-14 h-14 sm:w-20 sm:h-20 pt-1">
                  <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 blur-lg opacity-50 animate-pulse" />
                  <div className="relative w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-amber-400 via-amber-500 to-rose-500 flex items-center justify-center text-white shadow-xl ring-4 ring-white/20">
                    <Trophy className="w-7 h-7 sm:w-10 sm:h-10 text-amber-100 drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]" />
                  </div>
                </div>

                {/* Text Content */}
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-bold font-mono tracking-wider uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>CHÚC MỪNG BẠN</span>
                  </div>

                  <h2 className="text-xl sm:text-3xl font-black tracking-tight font-display bg-gradient-to-r from-amber-100 via-white to-amber-200 bg-clip-text text-transparent drop-shadow-[0_4px_16px_rgba(251,191,36,0.35)] pt-0.5 sm:pt-1">
                    {winner.fullName}
                  </h2>

                  <div className="flex items-center justify-center gap-2 pt-0.5 text-xs font-mono">
                    <span className="text-blue-400 font-semibold">
                      {winner.role || 'Thành viên'}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">
                      Tập thể 11A10 • THPT Cát Tiên
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2.5 pt-2">
                  <GlassButton
                    size="default"
                    variant="primary"
                    onClick={() => handleMarkCalled(winner.id)}
                    className="w-full"
                    contentClassName="flex items-center justify-center gap-2 text-sm font-semibold text-white py-1"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Đánh dấu đã hoàn thành lượt</span>
                  </GlassButton>

                  <GlassButton
                    size="default"
                    variant="secondary"
                    onClick={() => setWinner(null)}
                    className="w-full"
                    contentClassName="flex items-center justify-center gap-2 text-sm font-semibold text-slate-200 py-1"
                  >
                    <RotateCcw className="w-4 h-4 text-cyan-400" />
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
          <Card className="text-white shadow-2xl rounded-3xl bg-slate-950/70 border border-white/10 backdrop-blur-2xl">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-bold text-sm text-white">Lịch sử lượt gọi</h3>
                </div>
                <span className="text-xs font-mono text-cyan-400">{history.length} lượt</span>
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
                      className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs hover:border-white/15 transition-colors"
                    >
                      <div>
                        <div className="font-bold text-slate-200">{h.student.fullName}</div>
                        <div className="text-[10px] text-slate-400">11A10</div>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-300/80">{h.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card Danh sách học sinh đã kiểm tra */}
          <Card className="text-white shadow-2xl rounded-3xl bg-slate-950/70 border border-white/10 backdrop-blur-2xl">
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
