import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { cyberAudio } from '@/utils/cyberAudio';
import { toast } from 'sonner';

type GameMode = 'wheel' | 'card' | 'slot';

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
            variant="default"
            onClick={handleManualSync}
            title="Đồng bộ danh sách học sinh mới nhất từ trang Danh sách lớp"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Đồng bộ</span>
          </GlassButton>

          <GlassButton
            size="sm"
            onClick={handleToggleSound}
            contentClassName="flex items-center gap-1.5 text-xs text-slate-300"
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Bật âm' : 'Tắt âm'}</span>
          </GlassButton>

          <GlassButton
            size="sm"
            variant="primary"
            onClick={handleToggleFullscreen}
            contentClassName="flex items-center gap-1.5 text-xs text-amber-300"
            title="Mở toàn màn hình trình chiếu máy chiếu/Tivi"
          >
            <Maximize2 className="w-4 h-4 text-amber-400" />
            <span>Chiếu Tivi / F11</span>
          </GlassButton>
        </div>
      </Card>

      {/* ================= THANH TÙY CHỌN & BỘ ĐIỀU HƯỚNG CHẾ ĐỘ ================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Bộ chọn chế độ dạng Tabs chuẩn */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 w-fit">
          {[
            { id: 'wheel', label: '🎡 Vòng quay kỳ diệu' },
            { id: 'card', label: '🃏 Bốc thăm 46 lá bài' },
            { id: 'slot', label: '🎰 Máy xèng tốc độ' },
          ].map((mode) =>
            gameMode === mode.id ? (
              <GlassButton
                key={mode.id}
                size="sm"
                onClick={() => {
                  setGameMode(mode.id as GameMode);
                  cyberAudio.playClick();
                }}
                contentClassName="px-4 py-1.5 text-xs text-white font-semibold flex items-center gap-1.5"
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
                className="h-9 px-4 rounded-full inline-flex items-center justify-center text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
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
        <div className="lg:col-span-8 flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl bg-slate-950/60 border border-white/10 backdrop-blur-xl relative min-h-[480px]">
          {/* Thông báo số lượng khả dụng */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 text-xs font-mono text-slate-400">
            <Users className="w-4 h-4 text-blue-400" />
            <span>
              Sẵn sàng: <strong className="text-white">{activeCandidates.length}</strong> / {allStudents.length} học sinh
            </span>
          </div>

          {/* Banner chế độ */}
          <div className="mb-4 inline-flex items-center gap-2 text-slate-400 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Tập thể lớp 11A10 • THPT Cát Tiên</span>
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
                  <span className="inline-block text-amber-400 text-xs font-mono font-bold tracking-wider uppercase">
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
                  <h3 className="font-bold text-sm text-white">Lịch sử lượt gọi</h3>
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
