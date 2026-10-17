import React, { useState, useEffect, useMemo } from 'react';
import { loadMembersFromStorage } from '@/services/memberService';
import { Member } from '@/types';
import { DEFAULT_11A10_STUDENTS, PURPOSE_PRESETS, StudentCandidate } from '@/data/classDefaultStudents';
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
  // Tổ lọc
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  // Mục đích chọn
  const [purposeId, setPurposeId] = useState<string>('blackboard');
  // Chế độ trò chơi
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
  // Bật/tắt loại trừ
  const [excludeCalled, setExcludeCalled] = useState(true);
  // Âm thanh
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Nạp danh sách từ storage hoặc dùng 42 bạn mẫu 11A10
  useEffect(() => {
    const fromStorage = loadMembersFromStorage();
    if (fromStorage.length > 0) {
      const mapped: StudentCandidate[] = fromStorage.map((m: Member, idx: number) => ({
        id: m.id || String(idx + 1),
        fullName: m.fullName,
        role: m.role || 'Học sinh',
        group: (m as any).group || `Tổ ${((idx % 4) + 1)}`,
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

  // Danh sách ứng viên hợp lệ sau khi lọc
  const activeCandidates = useMemo(() => {
    return allStudents.filter((student) => {
      // Lọc theo tổ
      if (selectedGroup !== 'all' && student.group !== selectedGroup) {
        return false;
      }
      // Loại trừ người đã gọi
      if (excludeCalled && calledIds.includes(student.id)) {
        return false;
      }
      return true;
    });
  }, [allStudents, selectedGroup, excludeCalled, calledIds]);

  const currentPurpose = PURPOSE_PRESETS.find((p) => p.id === purposeId) || PURPOSE_PRESETS[0];

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

  const handleSpinStart = () => {
    if (activeCandidates.length === 0) {
      toast.error('Không còn học sinh nào khả dụng trong danh sách chọn!');
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
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {}

    // Ghi nhận vào lịch sử
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setHistory((prev) => [
      { student: chosenWinner, purpose: currentPurpose.label, time: timeStr },
      ...prev.slice(0, 9),
    ]);
  };

  // Đánh dấu đã lên bảng
  const handleMarkCalled = (studentId: string) => {
    if (!calledIds.includes(studentId)) {
      setCalledIds((prev) => [...prev, studentId]);
      toast.success('Đã ghi nhận học sinh lên bảng hoàn thành!');
    }
    setWinner(null);
  };

  // Đặt lại danh sách lượt gọi
  const handleResetCalled = () => {
    setCalledIds([]);
    setWinner(null);
    toast.success('Đã đặt lại lượt gọi cho tiết học mới!');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-20 max-w-6xl mx-auto">
      {/* ================= HEADER TIỆN ÍCH LỚP HỌC ================= */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Tiện ích trợ giảng • Lớp 11A10 THPT Cát Tiên</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Vòng Quay Gọi Tên & Bốc Thăm</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-bold">
              LIVE
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Chọn ngẫu nhiên học sinh lên bảng giải bài, kiểm tra miệng, phát biểu ý kiến hoặc nhận nhiệm vụ
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

      {/* ================= THANH TÙY CHỌN MỤC ĐÍCH & CHẾ ĐỘ ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mục đích quay */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            1. Mục đích bốc thăm:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PURPOSE_PRESETS.map((p) => {
              const active = purposeId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setPurposeId(p.id);
                    cyberAudio.playClick();
                  }}
                  className={`p-2.5 rounded-xl text-xs font-semibold text-center transition-all flex flex-col items-center gap-1 border ${
                    active
                      ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="text-base">{p.icon}</span>
                  <span className="truncate w-full">{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chế độ trò chơi */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            2. Chế độ trò chơi:
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setGameMode('wheel');
                cyberAudio.playClick();
              }}
              className={`p-2.5 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-1 border ${
                gameMode === 'wheel'
                  ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Dices className="w-4 h-4 text-amber-300" />
              <span>Vòng quay kỳ diệu</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setGameMode('slot');
                cyberAudio.playClick();
              }}
              className={`p-2.5 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-1 border ${
                gameMode === 'slot'
                  ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Zap className="w-4 h-4 text-cyan-300" />
              <span>Quay số tốc độ</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setGameMode('card');
                cyberAudio.playClick();
              }}
              className={`p-2.5 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-1 border ${
                gameMode === 'card'
                  ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4 text-pink-300" />
              <span>Lật thẻ bài ma thuật</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= THANH LỌC TỔ & LOẠI TRỪ ================= */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs">
        {/* Lọc theo tổ */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300">Phạm vi gọi:</span>
          {['all', 'Tổ 1', 'Tổ 2', 'Tổ 3', 'Tổ 4'].map((grp) => (
            <button
              key={grp}
              type="button"
              onClick={() => {
                setSelectedGroup(grp);
                cyberAudio.playClick();
              }}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                selectedGroup === grp
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {grp === 'all' ? `Cả lớp (${allStudents.length})` : grp}
            </button>
          ))}
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
        <div className="lg:col-span-8 flex flex-col items-center justify-center p-6 sm:p-10 rounded-3xl bg-slate-950/60 border border-white/10 backdrop-blur-xl relative min-h-[460px]">
          {/* Thông báo số lượng khả dụng */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 text-xs font-mono text-slate-400">
            <Users className="w-4 h-4 text-blue-400" />
            <span>
              Sẵn sàng: <strong className="text-white">{activeCandidates.length}</strong> / {allStudents.length} học sinh
            </span>
          </div>

          {/* Banner mục đích đang chọn */}
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
            <span>{currentPurpose.icon}</span>
            <span>{currentPurpose.label}: {currentPurpose.desc}</span>
          </div>

          {/* Nội dung game tương ứng */}
          {activeCandidates.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <Trophy className="w-12 h-12 text-amber-400 mx-auto animate-bounce" />
              <h3 className="text-xl font-bold text-white">Tất cả học sinh trong tổ đã được gọi!</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Bạn có thể bấm "Đặt lại lượt gọi" để tiếp tục quay lượt mới cho các bạn trong tiết tiếp theo.
              </p>
              <GlassButton size="default" variant="primary" onClick={handleResetCalled}>
                <RotateCcw className="w-4 h-4" />
                <span>Đặt lại danh sách gọi tên</span>
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
                  selectedPurpose={currentPurpose.label}
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
            <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in zoom-in-95 duration-200">
              <div className="w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-amber-400 p-6 text-center space-y-5 shadow-2xl relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-amber-500/40">
                  <Trophy className="w-8 h-8 text-amber-200" />
                </div>

                <div className="space-y-1">
                  <span className="inline-block px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-mono font-bold">
                    {currentPurpose.icon} {currentPurpose.label.toUpperCase()}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white font-display pt-1">
                    {winner.fullName}
                  </h2>
                  <p className="text-xs font-mono text-slate-400">
                    {winner.group || '11A10'} • {winner.role || 'Học sinh'}
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
                    <span>Đánh dấu đã hoàn thành ({currentPurpose.label})</span>
                  </GlassButton>

                  <GlassButton
                    size="default"
                    variant="secondary"
                    onClick={() => setWinner(null)}
                    className="w-full"
                  >
                    <RotateCcw className="w-4 h-4 text-blue-400" />
                    <span>Quay bạn tiếp theo</span>
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
                  <h3 className="font-bold text-sm text-white">Lịch sử lượt gọi gần nhất</h3>
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
                        <div className="text-[10px] text-slate-400">{h.purpose}</div>
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
                        <span className="text-[10px] text-slate-400">{student.group}</span>
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
