import React, { useState, useEffect, useRef, useCallback } from "react";
import { cyberAudio } from "@/utils/cyberAudio";
import confetti from "canvas-confetti";
import {
  Zap,
  Sparkles,
  Target,
  RotateCcw,
  Radio,
  Maximize2,
  Minimize2,
  UserX,
  UserCheck,
  CheckCircle2,
  Users,
  Flame,
  Gauge,
  HelpCircle,
} from "lucide-react";

export interface UfoStudent {
  id: string;
  fullName: string;
  role?: string;
  group?: string;
}

interface UfoAbductionGameProps {
  candidates: UfoStudent[];
  onSelectWinner: (winner: UfoStudent) => void;
  className?: string;
}

export const UfoAbductionGame: React.FC<UfoAbductionGameProps> = ({
  candidates,
  onSelectWinner,
  className = "",
}) => {
  // Cài đặt trò chơi
  const [speedMode, setSpeedMode] = useState<"drama" | "fast">("drama");
  const [pickCount, setPickCount] = useState<number>(1);
  const [absentIds, setAbsentIds] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Tiến trình đĩa bay
  const [phase, setPhase] = useState<
    "idle" | "scanning" | "fake_lock" | "locked" | "abducting" | "captured"
  >("idle");
  const [targetStudent, setTargetStudent] = useState<UfoStudent | null>(null);
  const [targetIndex, setTargetIndex] = useState<number>(0);
  const [fakeStudent, setFakeStudent] = useState<UfoStudent | null>(null);
  const [fakeIndex, setFakeIndex] = useState<number>(0);
  const [currentScannedIdx, setCurrentScannedIdx] = useState<number>(0);
  const [abductProgress, setAbductProgress] = useState<number>(0); // 0 to 100%
  const [screenShake, setScreenShake] = useState<boolean>(false);
  const [capturedBatch, setCapturedBatch] = useState<UfoStudent[]>([]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const studentCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const animTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Danh sách học sinh khả dụng (loại trừ các bạn được đánh dấu vắng mặt)
  const availableCandidates = candidates.filter((c) => !absentIds.includes(c.id));

  // Dọn dẹp timer khi unmount
  useEffect(() => {
    return () => {
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
    };
  }, []);

  // Theo dõi sự kiện thay đổi Fullscreen của trình duyệt
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Tính tọa độ phần trăm của học sinh đang được soi hoặc bị hút so với khung chứa
  const getStudentCoords = useCallback((idx: number) => {
    const el = studentCardRefs.current[idx];
    const container = containerRef.current;
    if (!el || !container) return { x: 50, y: 80 };

    const elRect = el.getBoundingClientRect();
    const cRect = container.getBoundingClientRect();

    const x = ((elRect.left + elRect.width / 2 - cRect.left) / cRect.width) * 100;
    const y = ((elRect.top + elRect.height / 2 - cRect.top) / cRect.height) * 100;
    return {
      x: Math.max(6, Math.min(94, x)),
      y: Math.max(30, Math.min(92, y)),
    };
  }, []);

  // Đánh dấu học sinh vắng mặt / có mặt khi nhấp chuột
  const handleToggleAbsent = (studentId: string) => {
    if (phase !== "idle") return;
    cyberAudio.playClick();
    setAbsentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Bật/tắt chế độ toàn màn hình cho khung game (chiếu máy chiếu / Tivi)
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  // Bắt đầu quy trình quét và bắt cóc học sinh chuẩn SonicTech
  const handleStartAbduction = useCallback(() => {
    if (phase !== "idle" && phase !== "captured") return;
    if (availableCandidates.length === 0) return;

    // Chọn ngẫu nhiên bạn trúng từ danh sách khả dụng
    const chosenStudent =
      availableCandidates[Math.floor(Math.random() * availableCandidates.length)];
    const chosenIndex = candidates.findIndex((c) => c.id === chosenStudent.id);

    setPhase("scanning");
    setTargetStudent(null);
    setFakeStudent(null);
    setAbductProgress(0);
    setScreenShake(false);
    setCapturedBatch([]);

    // Bắt đầu còi báo động không gian
    cyberAudio.playSirenAlert();

    // ================= CHẾ ĐỘ 1: NHANH (FAST) =================
    if (speedMode === "fast") {
      let ticks = 0;
      const maxTicks = 8;
      const scanInterval = setInterval(() => {
        ticks++;
        const randCandidate =
          availableCandidates[Math.floor(Math.random() * availableCandidates.length)];
        const randIdx = candidates.findIndex((c) => c.id === randCandidate.id);
        setCurrentScannedIdx(randIdx);
        cyberAudio.playTick();

        if (ticks >= maxTicks) {
          clearInterval(scanInterval);
          // Khóa mục tiêu ngay
          setPhase("locked");
          setTargetStudent(chosenStudent);
          setTargetIndex(chosenIndex);
          setCurrentScannedIdx(chosenIndex);
          cyberAudio.playTargetLock();

          animTimerRef.current = setTimeout(() => {
            setPhase("abducting");
            setScreenShake(true);
            cyberAudio.playUfoBeam();

            let progress = 0;
            const liftInterval = setInterval(() => {
              progress += 4.5;
              setAbductProgress(Math.min(100, progress));

              if (progress >= 95) {
                clearInterval(liftInterval);
                setScreenShake(false);
                setPhase("captured");
                cyberAudio.playFanfare();

                try {
                  confetti({
                    particleCount: 80,
                    spread: 70,
                    origin: { y: 0.25 },
                    colors: ["#38bdf8", "#facc15", "#f43f5e", "#a855f7", "#ffffff"],
                  });
                } catch {}

                animTimerRef.current = setTimeout(() => {
                  onSelectWinner(chosenStudent);
                }, 1000);
              }
            }, 30);
          }, 400);
        }
      }, 55);
      return;
    }

    // ================= CHẾ ĐỘ 2: KỊCH TÍNH (DRAMA CLONE CHUẨN SONICTECH) =================
    // 1. Quét chậm dần tạo cảm giác thót tim
    const totalTicks = 22;
    let tickCount = 0;

    // Chọn 1 bạn giả định để giả vờ nhắm nhầm (khác với bạn trúng thật)
    const otherCandidates = availableCandidates.filter((c) => c.id !== chosenStudent.id);
    const fakeChosen =
      otherCandidates.length > 0
        ? otherCandidates[Math.floor(Math.random() * otherCandidates.length)]
        : chosenStudent;
    const fakeChosenIdx = candidates.findIndex((c) => c.id === fakeChosen.id);

    const runScanTick = () => {
      tickCount++;

      let nextIdx: number;
      if (tickCount < totalTicks - 2) {
        const rand =
          availableCandidates[Math.floor(Math.random() * availableCandidates.length)];
        nextIdx = candidates.findIndex((c) => c.id === rand.id);
      } else {
        // Nhắm vào bạn giả vờ trước
        nextIdx = fakeChosenIdx;
      }

      setCurrentScannedIdx(nextIdx);

      const targetCard = studentCardRefs.current[nextIdx];
      if (targetCard) {
        targetCard.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }

      if (tickCount % 2 === 0) {
        cyberAudio.playHeartbeat();
      } else {
        cyberAudio.playTick();
      }

      if (tickCount < totalTicks) {
        let delay = 65;
        if (tickCount > 10) delay = 100;
        if (tickCount > 15) delay = 180;
        if (tickCount > 18) delay = 280;
        if (tickCount > 20) delay = 420;

        animTimerRef.current = setTimeout(runScanTick, delay);
      } else {
        // ================= BƯỚC 2: GIẢ VỜ NHẮM NHẦM (FAKE-OUT) =================
        if (otherCandidates.length > 0) {
          setPhase("fake_lock");
          setFakeStudent(fakeChosen);
          setFakeIndex(fakeChosenIdx);
          setCurrentScannedIdx(fakeChosenIdx);
          cyberAudio.playTick();

          // Dừng lại 800ms làm bạn giả hốt hoảng
          animTimerRef.current = setTimeout(() => {
            // Giật nảy sang bạn trúng thật!
            proceedToRealLock(chosenStudent, chosenIndex);
          }, 850);
        } else {
          proceedToRealLock(chosenStudent, chosenIndex);
        }
      }
    };

    const proceedToRealLock = (realStudent: UfoStudent, realIndex: number) => {
      // ================= BƯỚC 3: KHÓA MỤC TIÊU THẬT (TARGET LOCKED) =================
      setPhase("locked");
      setFakeStudent(null);
      setTargetStudent(realStudent);
      setTargetIndex(realIndex);
      setCurrentScannedIdx(realIndex);
      cyberAudio.playTargetLock();

      const winnerCard = studentCardRefs.current[realIndex];
      if (winnerCard) {
        winnerCard.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      }

      // Giữ 900ms kịch tính cao trào
      animTimerRef.current = setTimeout(() => {
        // ================= BƯỚC 4: HÚT LÊN ĐĨA BAY (ABDUCTION) =================
        setPhase("abducting");
        setScreenShake(true);
        cyberAudio.playUfoBeam();

        let progress = 0;
        const liftInterval = setInterval(() => {
          progress += 2.2;
          setAbductProgress(Math.min(100, progress));

          if (progress >= 95) {
            clearInterval(liftInterval);
            setScreenShake(false);
            setPhase("captured");
            cyberAudio.playFanfare();

            try {
              confetti({
                particleCount: 100,
                spread: 80,
                origin: { y: 0.28 },
                colors: ["#38bdf8", "#facc15", "#f43f5e", "#a855f7", "#ffffff"],
              });
            } catch {}

            // Mở modal vinh danh kết quả
            animTimerRef.current = setTimeout(() => {
              onSelectWinner(realStudent);
            }, 1200);
          }
        }, 36);
      }, 950);
    };

    runScanTick();
  }, [availableCandidates, candidates, phase, speedMode, onSelectWinner]);

  // Phím tắt bàn phím tiện lợi (Space để gọi trả bài, F để toàn màn hình)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.code === "Space") {
        e.preventDefault();
        handleStartAbduction();
      } else if (e.code === "KeyF") {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleStartAbduction, toggleFullscreen]);

  const handleReset = () => {
    if (animTimerRef.current) clearTimeout(animTimerRef.current);
    setPhase("idle");
    setTargetStudent(null);
    setFakeStudent(null);
    setAbductProgress(0);
    setScreenShake(false);
    setCapturedBatch([]);
  };

  const handleClearAbsents = () => {
    setAbsentIds([]);
    cyberAudio.playClick();
  };

  // Xác định tọa độ mục tiêu đang được chiếu sáng
  const activeStudentIdx =
    phase === "fake_lock"
      ? fakeIndex
      : targetStudent
      ? targetIndex
      : currentScannedIdx;
  const activeStudent = candidates[activeStudentIdx] || candidates[0];
  const targetPos = getStudentCoords(activeStudentIdx);

  // Đĩa bay UFO bay lượn trên cao bám theo tọa độ học sinh bị soi
  const ufoX = Math.max(20, Math.min(80, targetPos.x));
  const ufoY = 13;

  // Tọa độ người đang bay lơ lửng từ mặt đất lên tâm UFO
  const flyingX = targetPos.x + (ufoX - targetPos.x) * (abductProgress / 100);
  const flyingY = targetPos.y + (ufoY - targetPos.y) * (abductProgress / 100);

  return (
    <div
      className={`w-full max-w-4xl mx-auto flex flex-col items-center space-y-3 sm:space-y-4 select-none ${className}`}
    >
      {/* ================= 1. THANH ĐIỀU KHIỂN CHUẨN SONICTECH ================= */}
      <div className="w-full p-2.5 sm:p-3 rounded-2xl bg-slate-950/85 border border-indigo-500/30 flex flex-wrap items-center justify-between gap-3 text-xs backdrop-blur-md shadow-xl">
        {/* Nhóm trái: Số bạn gọi & Chế độ Kịch tính/Nhanh */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Bộ chọn số bạn gọi cùng lúc (− / +) */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/10">
            <span className="text-[11px] text-slate-400 font-medium">Số bạn:</span>
            <button
              type="button"
              disabled={phase !== "idle" && phase !== "captured" || pickCount <= 1}
              onClick={() => {
                cyberAudio.playClick();
                setPickCount((prev) => Math.max(1, prev - 1));
              }}
              className="w-5 h-5 rounded-md bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold active:scale-90 transition-all disabled:opacity-40"
            >
              −
            </button>
            <span className="font-mono font-bold text-amber-300 px-1 min-w-[16px] text-center">
              {pickCount}
            </span>
            <button
              type="button"
              disabled={
                phase !== "idle" && phase !== "captured" ||
                pickCount >= Math.min(5, availableCandidates.length)
              }
              onClick={() => {
                cyberAudio.playClick();
                setPickCount((prev) => Math.min(5, Math.min(availableCandidates.length, prev + 1)));
              }}
              className="w-5 h-5 rounded-md bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold active:scale-90 transition-all disabled:opacity-40"
            >
              +
            </button>
          </div>

          {/* Nút chuyển chế độ: Kịch tính / Nhanh */}
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-white/[0.04] border border-white/10">
            <button
              type="button"
              disabled={phase !== "idle" && phase !== "captured"}
              onClick={() => {
                cyberAudio.playClick();
                setSpeedMode("drama");
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                speedMode === "drama"
                  ? "bg-purple-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Flame className="w-3 h-3 text-amber-400" />
              <span>Kịch tính</span>
            </button>

            <button
              type="button"
              disabled={phase !== "idle" && phase !== "captured"}
              onClick={() => {
                cyberAudio.playClick();
                setSpeedMode("fast");
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                speedMode === "fast"
                  ? "bg-cyan-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Gauge className="w-3 h-3 text-cyan-300" />
              <span>Nhanh</span>
            </button>
          </div>
        </div>

        {/* Nhóm phải: Sĩ số, Báo vắng, Toàn màn hình & Phím tắt */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px]">
          {/* Thông tin sĩ số khả dụng */}
          <div className="flex items-center gap-1.5 font-mono text-slate-300">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span>
              Sẵn sàng: <strong className="text-white">{availableCandidates.length}</strong>/
              {candidates.length}
            </span>
          </div>

          {/* Nút reset vắng nếu có bạn bị đánh dấu vắng */}
          {absentIds.length > 0 && (
            <button
              type="button"
              onClick={handleClearAbsents}
              className="px-2 py-0.5 rounded-lg bg-rose-950/60 border border-rose-500/30 text-rose-300 hover:bg-rose-900/60 text-[10px] flex items-center gap-1 transition-all"
              title="Khôi phục tất cả bạn vắng mặt"
            >
              <UserCheck className="w-3 h-3 text-emerald-400" />
              <span>Bỏ {absentIds.length} bạn vắng</span>
            </button>
          )}

          {/* Nút Toàn màn hình (Fullscreen) */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 flex items-center gap-1 transition-all"
            title="Bật/Tắt Toàn màn hình chiếu Tivi (Phím F)"
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span className="hidden sm:inline font-mono text-[10px]">Toàn màn hình [F]</span>
          </button>
        </div>
      </div>

      {/* ================= 2. SÂN KHẤU BẦU TRỜI ĐÊM & ĐĨA BAY UFO ================= */}
      <div
        ref={containerRef}
        className={`relative w-full h-[520px] sm:h-[580px] rounded-3xl overflow-hidden border border-indigo-500/40 shadow-[0_25px_60px_rgba(0,0,0,0.95)] bg-gradient-to-b from-[#030617] via-[#080d26] to-[#040614] flex flex-col justify-between ${
          screenShake ? "animate-[wiggle_0.15s_ease-in-out_infinite]" : ""
        }`}
      >
        {/* Bầu trời ngàn sao lung linh */}
        <div className="absolute inset-0 pointer-events-none opacity-70">
          <div className="absolute top-8 left-12 w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          <div className="absolute top-20 right-28 w-1 h-1 rounded-full bg-cyan-300 animate-pulse" />
          <div className="absolute top-36 left-1/4 w-1.5 h-1.5 rounded-full bg-amber-200 animate-ping" />
          <div className="absolute top-16 right-1/3 w-1 h-1 rounded-full bg-purple-300 animate-pulse" />
          <div className="absolute top-32 right-12 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        </div>

        {/* Thanh trạng thái bay của đĩa bay (HUD Top Bar) */}
        <div className="relative z-20 px-4 pt-3 flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <Radio
              className={`w-4 h-4 ${
                phase === "scanning"
                  ? "text-cyan-400 animate-spin"
                  : phase === "locked"
                  ? "text-rose-400 animate-ping"
                  : "text-purple-400"
              }`}
            />
            <span className="text-slate-300 font-bold hidden sm:inline">
              ĐĨA BAY TRẢ BÀI 11A10
            </span>
          </div>

          <div
            className={`font-black px-3 py-1 rounded-full uppercase tracking-wider text-[10px] sm:text-xs transition-all shadow-lg ${
              phase === "scanning"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 animate-pulse"
                : phase === "fake_lock"
                ? "bg-amber-500/30 text-amber-300 border border-amber-400/60 animate-bounce"
                : phase === "locked"
                ? "bg-rose-500/30 text-rose-300 border border-rose-400/70 animate-bounce"
                : phase === "abducting"
                ? "bg-purple-500/30 text-purple-300 border border-purple-400/60 animate-pulse"
                : phase === "captured"
                ? "bg-emerald-500/25 text-emerald-300 border border-emerald-400/50"
                : "bg-white/10 text-slate-300 border border-white/10"
            }`}
          >
            {phase === "scanning"
              ? "⚡ Đang quét đám đông..."
              : phase === "fake_lock"
              ? "🤔 Ơ kìa nhắm bạn này à?!"
              : phase === "locked"
              ? "🎯 ĐÃ KHÓA MỤC TIÊU THẬT!"
              : phase === "abducting"
              ? "🛸 ĐANG HÚT LÊN ĐĨA BAY..."
              : phase === "captured"
              ? "🎉 ĐÃ BẮT CÓC THÀNH CÔNG!"
              : "SẴN SÀNG GỌI TRẢ BÀI"}
          </div>
        </div>

        {/* ================= ĐĨA BAY UFO KIM LOẠI HOẠT HỌA DI CHUYỂN TRÊN CAO ================= */}
        <div
          className="absolute z-30 pointer-events-none transition-all duration-300 ease-out flex flex-col items-center"
          style={{
            left: `${ufoX}%`,
            top: `${ufoY}%`,
            transform: `translate(-50%, -50%) ${
              phase === "scanning"
                ? "rotate(4deg) scale(1.05)"
                : phase === "locked"
                ? "scale(1.12)"
                : phase === "abducting"
                ? "scale(1.15)"
                : "scale(1)"
            }`,
          }}
        >
          {/* Đĩa bay UFO chi tiết */}
          <svg
            width="160"
            height="76"
            viewBox="0 0 160 76"
            fill="none"
            className="filter drop-shadow-[0_12px_28px_rgba(56,189,248,0.7)]"
          >
            {/* Buồng lái vòm kính trong suốt */}
            <ellipse
              cx="80"
              cy="30"
              rx="30"
              ry="22"
              fill="url(#ufoCockpit)"
              stroke="#38bdf8"
              strokeWidth="1.5"
            />
            {/* Alien tí hon lái đĩa bay ngộ nghĩnh */}
            <circle cx="80" cy="27" r="9" fill="#4ade80" />
            <ellipse cx="76" cy="26" rx="2.2" ry="3.5" fill="#0f172a" />
            <ellipse cx="84" cy="26" rx="2.2" ry="3.5" fill="#0f172a" />
            <path d="M78 32Q80 34 82 32" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round" />

            {/* Thân đĩa bay kim loại Titanium */}
            <ellipse cx="80" cy="48" rx="74" ry="18" fill="url(#ufoBody)" stroke="#cbd5e1" strokeWidth="1" />
            {/* Vành phát quang dưới thân */}
            <ellipse
              cx="80"
              cy="52"
              rx="54"
              ry="10"
              fill="#090d16"
              stroke={phase === "locked" ? "#f43f5e" : "rgba(245,158,11,0.8)"}
              strokeWidth="1.5"
            />

            {/* Dàn đèn LED neon đuổi quanh đĩa bay */}
            <circle cx="20" cy="48" r="3.5" fill="#38bdf8" className="animate-pulse" />
            <circle cx="48" cy="54" r="3.5" fill="#facc15" className="animate-ping" />
            <circle
              cx="80"
              cy="56"
              r="4.5"
              fill={phase === "locked" ? "#f43f5e" : "#38bdf8"}
              className="animate-pulse"
            />
            <circle cx="112" cy="54" r="3.5" fill="#facc15" className="animate-ping" />
            <circle cx="140" cy="48" r="3.5" fill="#38bdf8" className="animate-pulse" />

            <defs>
              <linearGradient id="ufoCockpit" x1="80" y1="8" x2="80" y2="52" gradientUnits="userSpaceOnUse">
                <stop stopColor="#bae6fd" stopOpacity="0.9" />
                <stop offset="1" stopColor="#0284c7" stopOpacity="0.95" />
              </linearGradient>
              <linearGradient id="ufoBody" x1="6" y1="48" x2="154" y2="48" gradientUnits="userSpaceOnUse">
                <stop stopColor="#475569" />
                <stop offset="0.5" stopColor="#94a3b8" />
                <stop offset="1" stopColor="#1e293b" />
              </linearGradient>
            </defs>
          </svg>

          {/* Cửa xả năng lượng dưới bụng đĩa bay */}
          <div
            className={`w-12 h-3 rounded-full transition-all duration-200 ${
              phase === "abducting" || phase === "locked"
                ? "bg-cyan-300 shadow-[0_0_35px_#38bdf8] scale-125 animate-pulse"
                : "bg-slate-700"
            }`}
          />
        </div>

        {/* ================= TIA SÁNG TRACTOR BEAM CHIẾU XUỐNG HỌC SINH ================= */}
        {phase !== "idle" && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            <defs>
              {/* Tia quét xanh dương */}
              <linearGradient
                id="scanBeamGrad"
                x1={`${ufoX}%`}
                y1={`${ufoY + 5}%`}
                x2={`${targetPos.x}%`}
                y2={`${targetPos.y}%`}
              >
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
                <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.05" />
              </linearGradient>
              {/* Tia giả vờ nhắm vàng cam */}
              <linearGradient
                id="fakeBeamGrad"
                x1={`${ufoX}%`}
                y1={`${ufoY + 5}%`}
                x2={`${targetPos.x}%`}
                y2={`${targetPos.y}%`}
              >
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
                <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#d97706" stopOpacity="0.05" />
              </linearGradient>
              {/* Tia khóa đỏ rực */}
              <linearGradient
                id="lockBeamGrad"
                x1={`${ufoX}%`}
                y1={`${ufoY + 5}%`}
                x2={`${targetPos.x}%`}
                y2={`${targetPos.y}%`}
              >
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.95" />
                <stop offset="60%" stopColor="#e11d48" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.1" />
              </linearGradient>
              {/* Tia hút siêu năng lượng */}
              <linearGradient
                id="abductBeamGrad"
                x1={`${ufoX}%`}
                y1={`${ufoY + 5}%`}
                x2={`${targetPos.x}%`}
                y2={`${targetPos.y}%`}
              >
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="30%" stopColor="#67e8f9" stopOpacity="0.85" />
                <stop offset="70%" stopColor="#facc15" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* Chùm nón ánh sáng Tractor Beam */}
            <polygon
              points={`
                calc(${ufoX}% - 18px), calc(${ufoY}% + 28px) 
                calc(${ufoX}% + 18px), calc(${ufoY}% + 28px) 
                ${targetPos.x + 5}%, ${targetPos.y}% 
                ${targetPos.x - 5}%, ${targetPos.y}%
              `}
              fill={
                phase === "fake_lock"
                  ? "url(#fakeBeamGrad)"
                  : phase === "locked"
                  ? "url(#lockBeamGrad)"
                  : phase === "abducting" || phase === "captured"
                  ? "url(#abductBeamGrad)"
                  : "url(#scanBeamGrad)"
              }
              className="transition-all duration-150"
              style={{
                filter:
                  phase === "abducting"
                    ? "drop-shadow(0 0 30px rgba(56,189,248,0.95))"
                    : phase === "locked"
                    ? "drop-shadow(0 0 20px rgba(244,63,94,0.8))"
                    : "drop-shadow(0 0 15px rgba(6,182,212,0.6))",
              }}
            />
          </svg>
        )}

        {/* Khối đệm trên cao cho UFO lượn */}
        <div className="w-full h-24 sm:h-28 shrink-0" />

        {/* ================= SÂN TRƯỜNG HIỂN THỊ ĐẦY ĐỦ HỌC SINH 11A10 ================= */}
        <div className="relative w-full flex-1 z-20 flex flex-col justify-end px-3 sm:px-6 pb-3 overflow-hidden">
          {/* Lớp nền sân gạch trường học neon */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/90 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 inset-x-0 h-24 border-t border-cyan-500/30 bg-[linear-gradient(to_right,rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:32px_20px] pointer-events-none" />

          {/* Tiêu đề khu vực tập trung & Hướng dẫn nhấp báo vắng */}
          <div className="relative z-10 flex items-center justify-between pb-2 text-[10px] sm:text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              SÂN TRƯỜNG 11A10 (Nhấp vào học sinh để báo vắng)
            </span>
            <span>
              {phase === "locked" || phase === "abducting" ? (
                <strong className="text-rose-400">ĐÃ KHÓA: {activeStudent?.fullName}</strong>
              ) : phase === "fake_lock" ? (
                <strong className="text-amber-400">NHẮM: {activeStudent?.fullName}?</strong>
              ) : phase === "scanning" ? (
                <span className="text-cyan-300">ĐANG QUÉT MẶT ĐẤT...</span>
              ) : (
                "SẴN SÀNG"
              )}
            </span>
          </div>

          {/* VÙNG CHỨA TẤT CẢ HỌC SINH (HỖ TRỢ CUỘN MƯỢT NẾU LỚP ĐÔNG) */}
          <div className="relative z-10 w-full max-h-[310px] sm:max-h-[350px] overflow-y-auto overflow-x-hidden pr-1 scrollbar-thin scrollbar-thumb-cyan-500/30">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-2.5 pb-2">
              {candidates.map((st, idx) => {
                const isAbsent = absentIds.includes(st.id);
                const isCurrentScanned = idx === activeStudentIdx;
                const isFakeLocked = fakeStudent?.id === st.id;
                const isWinnerLocked = targetStudent?.id === st.id;
                const isFlying =
                  isWinnerLocked && (phase === "abducting" || phase === "captured");
                const shortName = st.fullName.split(" ").slice(-2).join(" ");

                return (
                  <div
                    key={st.id}
                    ref={(el) => (studentCardRefs.current[idx] = el)}
                    onClick={() => handleToggleAbsent(st.id)}
                    className={`relative flex flex-col items-center justify-between p-1.5 rounded-xl border transition-all duration-150 cursor-pointer ${
                      isFlying
                        ? "opacity-20 scale-90 border-dashed border-cyan-500/40"
                        : isWinnerLocked
                        ? "bg-rose-950/95 border-rose-400 shadow-[0_0_25px_#f43f5e] scale-110 z-20 ring-2 ring-rose-400"
                        : isFakeLocked
                        ? "bg-amber-950/95 border-amber-400 shadow-[0_0_20px_#f59e0b] scale-105 z-15"
                        : isCurrentScanned && phase === "scanning"
                        ? "bg-cyan-950/90 border-cyan-400 shadow-[0_0_15px_#06b6d4] scale-105 z-10"
                        : isAbsent
                        ? "bg-slate-950/40 border-dashed border-rose-500/30 opacity-35 hover:opacity-60"
                        : "bg-slate-900/70 border-white/10 hover:border-cyan-400/50 opacity-85 hover:opacity-100 hover:scale-[1.02]"
                    }`}
                    title={
                      isAbsent
                        ? `${st.fullName} (Đang vắng - Nhấp để bỏ vắng)`
                        : `${st.fullName} (Nhấp để báo vắng)`
                    }
                  >
                    {/* Bong bóng biểu cảm khi bị fake lock */}
                    {isFakeLocked && phase === "fake_lock" && (
                      <div className="absolute -top-7 z-30 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] shadow-lg animate-bounce whitespace-nowrap border border-white/40">
                        Ơ kìa mình hả?! 😰
                      </div>
                    )}

                    {/* Bong bóng hoảng hốt khi bị khóa thật */}
                    {isWinnerLocked && phase === "locked" && (
                      <div className="absolute -top-7 z-30 px-2 py-0.5 rounded-full bg-rose-600 text-white font-black text-[10px] shadow-lg animate-bounce whitespace-nowrap border border-white/40">
                        Thôi xong tớ rồi! 😱
                      </div>
                    )}

                    {/* Huy hiệu VẮNG nếu giáo viên đánh dấu vắng */}
                    {isAbsent && (
                      <div className="absolute top-1 right-1 z-10 px-1 py-0.2 rounded bg-rose-600/80 text-[8px] font-mono font-bold text-white leading-tight">
                        VẮNG
                      </div>
                    )}

                    {/* STT học sinh */}
                    <span
                      className={`text-[9px] font-mono font-bold leading-none ${
                        isWinnerLocked
                          ? "text-rose-300"
                          : isFakeLocked
                          ? "text-amber-300"
                          : isCurrentScanned && phase === "scanning"
                          ? "text-cyan-300"
                          : "text-slate-400"
                      }`}
                    >
                      #{String(idx + 1).padStart(2, "0")}
                    </span>

                    {/* Hình nhân vật Chibi học sinh 11A10 mini */}
                    <div className="my-1 relative">
                      <svg width="34" height="42" viewBox="0 0 34 42" fill="none">
                        {/* Ba lô học sinh */}
                        <rect x="5" y="16" width="6" height="14" rx="2" fill="#f97316" />
                        <rect x="23" y="16" width="6" height="14" rx="2" fill="#f97316" />
                        {/* Quần tây xanh đen */}
                        <rect x="10" y="28" width="5" height="10" rx="1.5" fill="#1e293b" />
                        <rect x="19" y="28" width="5" height="10" rx="1.5" fill="#1e293b" />
                        <circle cx="12" cy="39" r="2.5" fill="#ffffff" />
                        <circle cx="22" cy="39" r="2.5" fill="#ffffff" />
                        {/* Áo sơ mi trắng đồng phục */}
                        <rect
                          x="9"
                          y="15"
                          width="16"
                          height="15"
                          rx="3"
                          fill="#ffffff"
                          stroke="#cbd5e1"
                          strokeWidth="0.8"
                        />
                        {/* Cà vạt xanh navy */}
                        <path d="M17 17L15.5 24L17 26L18.5 24Z" fill="#2563eb" />
                        {/* Tay áo */}
                        <rect x="6" y="16" width="4" height="9" rx="1" fill="#ffffff" />
                        <rect x="24" y="16" width="4" height="9" rx="1" fill="#ffffff" />
                        {/* Đầu & Mặt học sinh */}
                        <circle cx="17" cy="9" r="7" fill="#ffedd5" stroke="#fed7aa" strokeWidth="0.8" />
                        {/* Mái tóc */}
                        <path
                          d="M10 8C10 4 13 2 17 2C21 2 24 4 24 8C22 6 19 6 17 6C15 6 12 6 10 8Z"
                          fill="#1e1b4b"
                        />
                        {/* Mắt biểu cảm */}
                        {isWinnerLocked || isFakeLocked || (isCurrentScanned && phase === "scanning") ? (
                          <g>
                            <circle cx="15" cy="8.5" r="1.3" fill="#0f172a" />
                            <circle cx="19" cy="8.5" r="1.3" fill="#0f172a" />
                            <circle cx="22" cy="5" r="1" fill="#38bdf8" />
                          </g>
                        ) : (
                          <g>
                            <circle cx="15" cy="8.5" r="1" fill="#0f172a" />
                            <circle cx="19" cy="8.5" r="1" fill="#0f172a" />
                          </g>
                        )}
                      </svg>
                    </div>

                    {/* Tên học sinh */}
                    <span
                      className={`text-[10px] font-bold truncate max-w-full leading-tight text-center ${
                        isWinnerLocked
                          ? "text-amber-300 font-black"
                          : isFakeLocked
                          ? "text-amber-200"
                          : isCurrentScanned && phase === "scanning"
                          ? "text-cyan-200"
                          : isAbsent
                          ? "text-slate-500 line-through"
                          : "text-slate-200"
                      }`}
                    >
                      {shortName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================= NHÂN VẬT HỌC SINH THỰC SỰ ĐANG BAY LƠ LỬNG LÊN UFO ================= */}
        {targetStudent && (phase === "abducting" || phase === "captured") && (
          <div
            className="absolute z-40 pointer-events-none transition-all duration-75 flex flex-col items-center"
            style={{
              left: `${flyingX}%`,
              top: `${flyingY}%`,
              transform: `translate(-50%, -50%) scale(${
                phase === "captured"
                  ? 0.15
                  : 1 + Math.sin((abductProgress / 100) * Math.PI) * 0.5
              })`,
              opacity: phase === "captured" ? 0 : 1,
            }}
          >
            {/* Bong bóng kêu cứu hốt hoảng */}
            <div className="px-2.5 py-1 rounded-full bg-rose-600 text-white font-black text-xs shadow-xl animate-bounce flex items-center gap-1 border border-white/40 mb-1">
              <span>Aaaaa cứu tớ với! 😱</span>
            </div>

            {/* Vòng hào quang chống trọng lực xoáy quanh người */}
            <div className="absolute inset-0 rounded-full border-2 border-cyan-300 shadow-[0_0_30px_#38bdf8] animate-ping pointer-events-none" />

            {/* Hình thể học sinh phóng to chân thực vẫy vùng trên không */}
            <svg
              width="68"
              height="88"
              viewBox="0 0 68 88"
              fill="none"
              className="filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
            >
              {/* Ba lô cam */}
              <rect x="12" y="34" width="10" height="24" rx="4" fill="#f97316" stroke="#ea580c" strokeWidth="1.5" />
              <rect x="46" y="34" width="10" height="24" rx="4" fill="#f97316" stroke="#ea580c" strokeWidth="1.5" />

              {/* Chân vùng vẫy trong luồng tractor beam */}
              <g className="animate-[wiggle_0.8s_ease-in-out_infinite]">
                <rect x="20" y="60" width="10" height="18" rx="3" fill="#1e293b" transform="rotate(12 20 60)" />
                <rect x="38" y="60" width="10" height="18" rx="3" fill="#1e293b" transform="rotate(-12 38 60)" />
                <ellipse cx="25" cy="80" rx="6" ry="3.5" fill="#ffffff" />
                <ellipse cx="43" cy="80" rx="6" ry="3.5" fill="#ffffff" />
              </g>

              {/* Áo sơ mi trắng 11A10 */}
              <rect x="18" y="30" width="32" height="32" rx="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
              {/* Cà vạt xanh */}
              <path d="M34 34L31 50L34 54L37 50Z" fill="#2563eb" />
              {/* Phù hiệu Cát Tiên */}
              <rect x="21" y="36" width="5" height="4" rx="1" fill="#dc2626" />

              {/* Hai tay giơ lên vẫy hoảng loạn */}
              <rect x="8" y="18" width="8" height="22" rx="3" fill="#fed7aa" transform="rotate(-35 8 18)" />
              <rect x="52" y="14" width="8" height="22" rx="3" fill="#fed7aa" transform="rotate(35 52 14)" />

              {/* Khuôn mặt há hốc mồm ngạc nhiên */}
              <circle cx="34" cy="18" r="14" fill="#ffedd5" stroke="#fed7aa" strokeWidth="1" />
              <path d="M20 16C20 8 26 5 34 5C42 5 48 8 48 16C44 13 38 13 34 13C30 13 24 13 20 16Z" fill="#1e1b4b" />
              <circle cx="29" cy="17" r="2.8" fill="#0f172a" />
              <circle cx="39" cy="17" r="2.8" fill="#0f172a" />
              <ellipse cx="34" cy="24" rx="3.5" ry="5" fill="#dc2626" />
            </svg>

            {/* Bảng tên học sinh bay cùng */}
            <div className="mt-1 px-3 py-0.5 rounded-full bg-rose-950/95 border border-amber-300 shadow-[0_0_15px_#f59e0b] text-center">
              <span className="font-mono text-[9px] font-bold text-amber-300">
                #{String(targetIndex + 1).padStart(2, "0")} • {targetStudent.fullName}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ================= 3. NÚT KÍCH HOẠT PHÓNG ĐĨA BAY BẮT CÓC ================= */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
        <button
          type="button"
          disabled={
            phase !== "idle" && phase !== "captured" || availableCandidates.length === 0
          }
          onClick={handleStartAbduction}
          className={`px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-display font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-xl flex items-center gap-2.5 active:scale-95 ${
            phase !== "idle" && phase !== "captured"
              ? "bg-slate-800 text-slate-400 cursor-not-allowed"
              : availableCandidates.length === 0
              ? "bg-slate-800 text-slate-500 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-indigo-600/40 hover:shadow-cyan-500/50 cursor-pointer hover:scale-105 ring-1 ring-white/20"
          }`}
        >
          <Zap className="w-4 h-4 text-amber-300 animate-bounce" />
          <span>
            {phase !== "idle" && phase !== "captured"
              ? "UFO ĐANG TIẾN HÀNH BẮT CÓC..."
              : `GỌI TRẢ BÀI • PHÓNG UFO (${availableCandidates.length} BẠN)`}
          </span>
          <span className="hidden sm:inline text-[10px] font-mono px-2 py-0.5 rounded bg-white/20 font-normal">
            Phím Space
          </span>
        </button>

        {phase === "captured" && (
          <button
            type="button"
            onClick={handleReset}
            className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Gọi lượt mới</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default UfoAbductionGame;
