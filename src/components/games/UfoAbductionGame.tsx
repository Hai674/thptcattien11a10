import React, { useState, useEffect, useRef, useCallback } from "react";
import { cyberAudio } from "@/utils/cyberAudio";
import { Zap, Sparkles, Target, RotateCcw, Radio } from "lucide-react";

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
  const [phase, setPhase] = useState<"idle" | "scanning" | "locked" | "abducting" | "captured">("idle");
  const [targetStudent, setTargetStudent] = useState<UfoStudent | null>(null);
  const [scanningIdx, setScanningIdx] = useState<number>(0);
  const [ufoXPercent, setUfoXPercent] = useState<number>(50); // Vị trí UFO % từ 10% đến 90%
  const [beamHeight, setBeamHeight] = useState<number>(0); // 0 đến 100%
  const [abductHeight, setAbductHeight] = useState<number>(0); // Chiều cao học sinh bị hút lên

  const animTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Dọn dẹp timer khi unmount
  useEffect(() => {
    return () => {
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
    };
  }, []);

  // Kích hoạt tiến trình quét và bắt cóc học sinh lên bảng
  const handleStartAbduction = useCallback(() => {
    if (phase !== "idle" && phase !== "captured") return;
    if (candidates.length === 0) return;

    // 1. Chọn ngẫu nhiên học sinh sẽ bị bắt cóc
    const chosenIndex = Math.floor(Math.random() * candidates.length);
    const chosenStudent = candidates[chosenIndex];

    setPhase("scanning");
    setTargetStudent(null);
    setAbductHeight(0);
    setBeamHeight(0);
    cyberAudio.playUfoBeam();

    let scanTicks = 0;
    const maxTicks = 24;

    const scanStep = () => {
      scanTicks++;
      const randIdx = Math.floor(Math.random() * candidates.length);
      setScanningIdx(randIdx);

      // UFO lượn lờ qua lại trên bầu trời
      const ufoPos = 20 + Math.random() * 60;
      setUfoXPercent(ufoPos);
      cyberAudio.playTick();

      if (scanTicks < maxTicks) {
        animTimerRef.current = setTimeout(scanStep, 80 + scanTicks * 10);
      } else {
        // 2. KHÓA MỤC TIÊU (TARGET LOCKED)
        setPhase("locked");
        setTargetStudent(chosenStudent);
        setScanningIdx(chosenIndex);
        setUfoXPercent(50); // Căn UFO ngay trên đỉnh mục tiêu
        cyberAudio.playClick();

        animTimerRef.current = setTimeout(() => {
          // 3. CHIẾU TIA TRACTOR BEAM VÀ HÚT HỌC SINH
          setPhase("abducting");
          setBeamHeight(100);
          cyberAudio.playUfoBeam();

          // Học sinh từ từ bay lơ lửng lên đĩa bay
          let liftProgress = 0;
          const liftInterval = setInterval(() => {
            liftProgress += 4;
            setAbductHeight(liftProgress);

            if (liftProgress >= 90) {
              clearInterval(liftInterval);
              // 4. HÚT HOÀN TẤT VÀO TRONG UFO
              setPhase("captured");
              cyberAudio.playAccessGranted();

              // Sau 1.8 giây hồi hộp mới mở modal vinh danh
              animTimerRef.current = setTimeout(() => {
                onSelectWinner(chosenStudent);
              }, 1800);
            }
          }, 35);
        }, 800);
      }
    };

    scanStep();
  }, [candidates, phase, onSelectWinner]);

  const handleReset = () => {
    if (animTimerRef.current) clearTimeout(animTimerRef.current);
    setPhase("idle");
    setTargetStudent(null);
    setBeamHeight(0);
    setAbductHeight(0);
    setUfoXPercent(50);
  };

  const currentDisplayStudent =
    targetStudent || (candidates[scanningIdx] || candidates[0] || null);

  return (
    <div className={`w-full max-w-4xl mx-auto flex flex-col items-center space-y-4 select-none ${className}`}>
      {/* 1. Thanh Radar vũ trụ quét thông tin */}
      <div className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-indigo-500/30 flex flex-wrap items-center justify-between gap-2 text-xs backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-2">
          <Radio className={`w-4 h-4 ${phase === "scanning" ? "text-cyan-400 animate-spin" : "text-purple-400"}`} />
          <span className="font-bold text-slate-200">
            RADA UFO 11A10: <strong className="text-cyan-400">{candidates.length} mục tiêu mặt đất</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="text-slate-400">TRẠNG THÁI:</span>
          <span
            className={`font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
              phase === "scanning"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 animate-pulse"
                : phase === "locked"
                ? "bg-rose-500/25 text-rose-300 border border-rose-400/40 animate-ping"
                : phase === "abducting"
                ? "bg-amber-500/25 text-amber-300 border border-amber-400/40 animate-pulse"
                : phase === "captured"
                ? "bg-emerald-500/25 text-emerald-300 border border-emerald-400/40"
                : "bg-white/5 text-slate-400"
            }`}
          >
            {phase === "scanning"
              ? "ĐANG RÀ QUÉT RADAR..."
              : phase === "locked"
              ? "🎯 ĐÃ KHÓA MỤC TIÊU!"
              : phase === "abducting"
              ? "⚡ ĐANG HÚT LÊN UFO..."
              : phase === "captured"
              ? "🛸 ĐÃ BẮT ĐƯỢC HỌC SINH!"
              : "SẴN SÀNG PHÓNG UFO"}
          </span>
        </div>
      </div>

      {/* 2. Sân khấu bầu trời đêm không gian */}
      <div className="relative w-full h-[360px] sm:h-[440px] rounded-3xl overflow-hidden border border-indigo-500/40 shadow-[0_20px_50px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.1)] bg-gradient-to-b from-[#050714] via-[#090b22] to-[#040612]">
        {/* Bầu trời ngàn sao lấp lánh */}
        <div className="absolute inset-0 pointer-events-none opacity-60">
          <div className="absolute top-8 left-12 w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          <div className="absolute top-20 right-24 w-1 h-1 rounded-full bg-cyan-300 animate-pulse" />
          <div className="absolute top-36 left-1/3 w-1.5 h-1.5 rounded-full bg-amber-200 animate-ping" />
          <div className="absolute top-14 right-1/3 w-1 h-1 rounded-full bg-purple-300 animate-pulse" />
          <div className="absolute top-28 right-16 w-1 h-1 rounded-full bg-white animate-pulse" />
        </div>

        {/* Dải sáng tinh vân Nebula mờ ảo */}
        <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-indigo-600/15 via-purple-600/10 to-transparent pointer-events-none blur-2xl" />

        {/* ================= ĐĨA BAY UFO HOVERING ================= */}
        <div
          className="absolute top-6 transition-all duration-300 -translate-x-1/2 z-20"
          style={{ left: `${ufoXPercent}%` }}
        >
          <div className="relative flex flex-col items-center">
            {/* Thân đĩa bay UFO SVG chi tiết */}
            <svg width="140" height="70" viewBox="0 0 140 70" fill="none" className="filter drop-shadow-[0_8px_20px_rgba(56,189,248,0.5)]">
              {/* Buồng lái kính vòm trong suốt */}
              <ellipse cx="70" cy="28" rx="26" ry="18" fill="url(#cockpitGrad)" stroke="#38bdf8" strokeWidth="1.5" />
              {/* Sinh vật ngoài hành tinh Alien tí hon */}
              <circle cx="70" cy="25" r="7" fill="#4ade80" />
              <circle cx="67" cy="24" r="2" fill="#0f172a" />
              <circle cx="73" cy="24" r="2" fill="#0f172a" />
              <path d="M68 28Q70 30 72 28" stroke="#0f172a" strokeWidth="1" strokeLinecap="round" />

              {/* Vành đĩa bay kim loại siêu bền */}
              <ellipse cx="70" cy="42" rx="64" ry="16" fill="url(#saucerGrad)" stroke="#cbd5e1" strokeWidth="1" />
              {/* Rãnh gân phản quang */}
              <ellipse cx="70" cy="46" rx="46" ry="8" fill="#090d16" stroke="rgba(245,158,11,0.6)" strokeWidth="1.5" />

              {/* Dàn đèn LED neon xoay quanh đĩa bay */}
              <circle cx="24" cy="43" r="3" fill="#38bdf8" className="animate-pulse" />
              <circle cx="44" cy="48" r="3" fill="#facc15" className="animate-ping" />
              <circle cx="70" cy="50" r="3.5" fill="#f43f5e" className="animate-pulse" />
              <circle cx="96" cy="48" r="3" fill="#facc15" className="animate-ping" />
              <circle cx="116" cy="43" r="3" fill="#38bdf8" className="animate-pulse" />

              <defs>
                <linearGradient id="cockpitGrad" x1="70" y1="10" x2="70" y2="46" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#bae6fd" stopOpacity="0.8" />
                  <stop offset="1" stopColor="#0284c7" stopOpacity="0.9" />
                </linearGradient>
                <linearGradient id="saucerGrad" x1="6" y1="42" x2="134" y2="42" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#334155" />
                  <stop offset="0.5" stopColor="#64748b" />
                  <stop offset="1" stopColor="#1e293b" />
                </linearGradient>
              </defs>
            </svg>

            {/* Miệng phóng tia sáng dưới bụng UFO */}
            <div className={`w-8 h-2 rounded-full ${phase === "abducting" || phase === "locked" ? "bg-cyan-300 shadow-[0_0_15px_#38bdf8]" : "bg-slate-700"}`} />
          </div>
        </div>

        {/* ================= TIA SÁNG HÚT TỬ NGOẠI (TRACTOR BEAM) ================= */}
        {(phase === "abducting" || phase === "locked" || phase === "captured") && (
          <div
            className="absolute top-[68px] -translate-x-1/2 pointer-events-none transition-all duration-300 z-10"
            style={{
              left: `${ufoXPercent}%`,
              height: `${phase === "locked" ? 220 : 320}px`,
            }}
          >
            <div
              className={`w-[120px] sm:w-[180px] h-full bg-gradient-to-b ${
                phase === "locked"
                  ? "from-rose-500/30 via-rose-500/10 to-transparent"
                  : "from-cyan-400/50 via-indigo-500/25 to-cyan-400/10"
              }`}
              style={{
                clipPath: "polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%)",
                filter: "drop-shadow(0 0 15px rgba(56,189,248,0.4))",
              }}
            />
          </div>
        )}

        {/* ================= KHU VỰC MẶT ĐẤT & HỌC SINH BỊ HÚT ================= */}
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-slate-950 via-slate-900/90 to-transparent flex items-center justify-center z-15">
          {/* Lưới tọa độ trạm thu phát mặt đất */}
          <div className="absolute bottom-0 inset-x-0 h-10 border-t border-cyan-500/30 bg-[linear-gradient(to_right,rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:24px_16px]" />

          {/* Vòng hồng ngoại khóa mục tiêu dưới sàn */}
          {phase !== "idle" && (
            <div
              className="absolute bottom-5 -translate-x-1/2 transition-all duration-300 pointer-events-none"
              style={{ left: `${ufoXPercent}%` }}
            >
              <div className="w-24 sm:w-32 h-8 rounded-full border-2 border-cyan-400/60 shadow-[0_0_20px_#06b6d4] animate-ping" />
              <Target className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-rose-400 animate-pulse" />
            </div>
          )}

          {/* THẺ HỌC SINH ĐANG BỊ HÚT LƠ LỬNG */}
          {currentDisplayStudent && (
            <div
              className="absolute bottom-7 -translate-x-1/2 transition-all duration-100 z-30"
              style={{
                left: `${ufoXPercent}%`,
                transform: `translate(-50%, -${abductHeight * 2.6}px) scale(${1 + (abductHeight / 100) * 0.15})`,
                opacity: phase === "captured" ? 0.3 : 1,
              }}
            >
              <div className={`p-3.5 sm:p-4 rounded-2xl border-2 backdrop-blur-xl shadow-2xl text-center space-y-1 transition-all ${
                phase === "locked"
                  ? "bg-rose-950/90 border-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.6)]"
                  : phase === "abducting" || phase === "captured"
                  ? "bg-cyan-950/95 border-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.8)] animate-pulse"
                  : "bg-slate-900/90 border-indigo-400/40"
              }`}>
                {/* Số thứ tự */}
                <div className="inline-flex items-center gap-1 font-mono font-bold text-[10px] text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                  <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                  <span>#{String(candidates.findIndex((c) => c.id === currentDisplayStudent.id) + 1).padStart(2, "0")} • 11A10</span>
                </div>

                {/* Tên học sinh */}
                <h4 className="font-display font-black text-sm sm:text-base text-white tracking-wide truncate max-w-[200px]">
                  {currentDisplayStudent.fullName}
                </h4>

                <p className="text-[10px] font-mono text-slate-300">
                  {currentDisplayStudent.role || "Học sinh 11A10"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Nút điều khiển gọi UFO */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          disabled={phase === "scanning" || phase === "locked" || phase === "abducting" || candidates.length === 0}
          onClick={handleStartAbduction}
          className={`px-6 py-3.5 rounded-2xl font-display font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-xl flex items-center gap-2 active:scale-95 ${
            phase !== "idle" && phase !== "captured"
              ? "bg-slate-800 text-slate-400 cursor-not-allowed"
              : candidates.length === 0
              ? "bg-slate-800 text-slate-500 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-indigo-600/40 hover:shadow-cyan-500/50 cursor-pointer hover:scale-105"
          }`}
        >
          <Zap className="w-4 h-4 text-amber-300" />
          <span>
            {phase !== "idle" && phase !== "captured"
              ? "UFO đang tiến hành bắt cóc..."
              : `Phóng UFO bắt cóc (${candidates.length} bạn)`}
          </span>
        </button>

        {phase === "captured" && (
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer"
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
