import React, { useState, useEffect, useRef, useCallback } from "react";
import { cyberAudio } from "@/utils/cyberAudio";
import confetti from "canvas-confetti";
import { Zap, Sparkles, Target, RotateCcw, Radio, AlertTriangle } from "lucide-react";

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
  const [targetIndex, setTargetIndex] = useState<number>(0);
  const [currentScannedIdx, setCurrentScannedIdx] = useState<number>(0);
  const [abductProgress, setAbductProgress] = useState<number>(0); // 0 to 100%
  const [screenShake, setScreenShake] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const studentCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const animTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Dọn dẹp timer khi unmount
  useEffect(() => {
    return () => {
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
    };
  }, []);

  // Tính tọa độ phần trăm của học sinh đang được soi hoặc bị hút so với khung chứa
  const getStudentCoords = useCallback((idx: number) => {
    const el = studentCardRefs.current[idx];
    const container = containerRef.current;
    if (!el || !container) return { x: 50, y: 75 };

    const elRect = el.getBoundingClientRect();
    const cRect = container.getBoundingClientRect();

    const x = ((elRect.left + elRect.width / 2 - cRect.left) / cRect.width) * 100;
    const y = ((elRect.top + elRect.height / 2 - cRect.top) / cRect.height) * 100;
    return {
      x: Math.max(8, Math.min(92, x)),
      y: Math.max(30, Math.min(90, y)),
    };
  }, []);

  // Kích hoạt tiến trình quét và bắt cóc học sinh lên đĩa bay UFO ở giữa
  const handleStartAbduction = useCallback(() => {
    if (phase !== "idle" && phase !== "captured") return;
    if (candidates.length === 0) return;

    // 1. Chọn ngẫu nhiên bạn học sinh trúng thưởng
    const chosenIndex = Math.floor(Math.random() * candidates.length);
    const chosenStudent = candidates[chosenIndex];

    setPhase("scanning");
    setTargetStudent(null);
    setAbductProgress(0);
    setScreenShake(false);

    // Phát âm thanh báo động khẩn cấp
    cyberAudio.playSirenAlert();

    // Chuỗi thời gian quét giảm tốc (Deceleration Sequence) tạo độ hồi hộp nín thở
    // Bắt đầu quét cực nhanh -> rồi chậm dần từng người một -> dừng khựng lại ở bạn trúng
    const totalTicks = 26;
    let tickCount = 0;

    const runScanTick = () => {
      tickCount++;

      // Chọn học sinh đang bị spotlight soi tới
      let nextIdx = Math.floor(Math.random() * candidates.length);
      // Ở 4 nhịp cuối cùng, di chuyển gần dần tới bạn được chọn để tạo độ thót tim
      if (tickCount >= totalTicks - 3) {
        if (tickCount === totalTicks) {
          nextIdx = chosenIndex;
        } else {
          // Lượn qua các bạn bên cạnh trước khi dừng
          nextIdx = (chosenIndex + (totalTicks - tickCount) * 2) % candidates.length;
        }
      }

      setCurrentScannedIdx(nextIdx);

      // Tự động cuộn mượt để bạn đang bị soi luôn hiển thị rõ trong tầm mắt
      const targetCard = studentCardRefs.current[nextIdx];
      if (targetCard) {
        targetCard.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }

      // Âm thanh: Nhịp tim đập thình thịch và tiếng radar tick
      if (tickCount % 2 === 0) {
        cyberAudio.playHeartbeat();
      } else {
        cyberAudio.playTick();
      }

      if (tickCount < totalTicks) {
        // Tốc độ chậm dần theo hàm lũy tiến (tạo cảm giác nín thở)
        let delay = 70;
        if (tickCount > 14) delay = 120;
        if (tickCount > 18) delay = 200;
        if (tickCount > 21) delay = 320;
        if (tickCount > 23) delay = 500;
        if (tickCount > 24) delay = 750;

        animTimerRef.current = setTimeout(runScanTick, delay);
      } else {
        // ================= GIAI ĐOẠN 2: KHÓA MỤC TIÊU (TARGET LOCKED) =================
        setPhase("locked");
        setTargetStudent(chosenStudent);
        setTargetIndex(chosenIndex);
        setCurrentScannedIdx(chosenIndex);
        cyberAudio.playTargetLock();

        // Cuộn tập trung ngay vào bạn may mắn
        const winnerCard = studentCardRefs.current[chosenIndex];
        if (winnerCard) {
          winnerCard.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
        }

        // Tạm dừng 1.1 giây kịch tính (bạn trúng giật mình thảng thốt)
        animTimerRef.current = setTimeout(() => {
          // ================= GIAI ĐOẠN 3: HÚT LÊN UFO Ở CHÍNH GIỮA (ABDUCTION) =================
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

              // ================= GIAI ĐOẠN 4: THU NẠP VÀO TRONG UFO (CAPTURED) =================
              setPhase("captured");
              cyberAudio.playFanfare();

              // Bắn pháo hoa giấy confetti ăn mừng rực rỡ
              try {
                confetti({
                  particleCount: 80,
                  spread: 70,
                  origin: { y: 0.3 },
                  colors: ["#38bdf8", "#facc15", "#f43f5e", "#a855f7", "#ffffff"],
                });
              } catch {}

              // Đợi 1.4 giây nín thở trước khi bật popup vinh danh
              animTimerRef.current = setTimeout(() => {
                onSelectWinner(chosenStudent);
              }, 1400);
            }
          }, 40);
        }, 1100);
      }
    };

    runScanTick();
  }, [candidates, phase, onSelectWinner]);

  const handleReset = () => {
    if (animTimerRef.current) clearTimeout(animTimerRef.current);
    setPhase("idle");
    setTargetStudent(null);
    setAbductProgress(0);
    setScreenShake(false);
  };

  const activeStudentIdx = targetStudent ? targetIndex : currentScannedIdx;
  const activeStudent = candidates[activeStudentIdx] || candidates[0];
  const targetPos = getStudentCoords(activeStudentIdx);

  // Tính tọa độ người bị hút bay lượn từ vị trí xuất phát lên tâm UFO ở giữa (50%, 14%)
  const ufoCenterX = 50;
  const ufoCenterY = 14;
  const flyingX = targetPos.x + (ufoCenterX - targetPos.x) * (abductProgress / 100);
  const flyingY = targetPos.y + (ufoCenterY - targetPos.y) * (abductProgress / 100);

  return (
    <div className={`w-full max-w-4xl mx-auto flex flex-col items-center space-y-4 select-none ${className}`}>
      {/* 1. Màn hình HUD Radar quân sự báo động */}
      <div className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950/85 border border-indigo-500/30 flex flex-wrap items-center justify-between gap-2 text-xs backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-2">
          <Radio className={`w-4 h-4 ${phase === "scanning" ? "text-cyan-400 animate-spin" : "text-purple-400"}`} />
          <span className="font-bold text-slate-200">
            HỆ THỐNG RADAR UFO: <strong className="text-cyan-400">{candidates.length} bạn 11A10 có mặt</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="text-slate-400">TRẠNG THÁI:</span>
          <span
            className={`font-bold uppercase tracking-wider ${
              phase === "scanning"
                ? "text-cyan-400 animate-pulse"
                : phase === "locked"
                ? "text-rose-400 animate-bounce"
                : phase === "abducting"
                ? "text-amber-400 animate-pulse"
                : phase === "captured"
                ? "text-emerald-400 font-black"
                : "text-slate-400"
            }`}
          >
            {phase === "scanning"
              ? "⚡ ĐANG QUÉT TẬP THỂ..."
              : phase === "locked"
              ? "🎯 ĐÃ KHÓA MỤC TIÊU!"
              : phase === "abducting"
              ? "🛸 ĐANG HÚT LÊN ĐĨA BAY..."
              : phase === "captured"
              ? "🛸 ĐÃ BẮT VÀO ĐĨA BAY!"
              : "SẴN SÀNG PHÓNG UFO"}
          </span>
        </div>
      </div>

      {/* 2. Sân khấu Bầu trời đêm không gian & Sân trường tập hợp */}
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

        {/* ================= ĐĨA BAY UFO Ở CHÍNH GIỮA (CENTER TOP) ================= */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none">
          {/* Đĩa bay UFO hoạt họa kim loại */}
          <svg width="160" height="76" viewBox="0 0 160 76" fill="none" className="filter drop-shadow-[0_12px_28px_rgba(56,189,248,0.7)]">
            {/* Buồng lái vòm kính trong suốt */}
            <ellipse cx="80" cy="30" rx="30" ry="22" fill="url(#ufoCockpit)" stroke="#38bdf8" strokeWidth="1.5" />
            {/* Alien tí hon lái đĩa bay */}
            <circle cx="80" cy="27" r="9" fill="#4ade80" />
            <ellipse cx="76" cy="26" rx="2.2" ry="3.5" fill="#0f172a" />
            <ellipse cx="84" cy="26" rx="2.2" ry="3.5" fill="#0f172a" />
            <path d="M78 32Q80 34 82 32" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round" />

            {/* Thân đĩa bay kim loại màu Titanium sang trọng */}
            <ellipse cx="80" cy="48" rx="74" ry="18" fill="url(#ufoBody)" stroke="#cbd5e1" strokeWidth="1" />
            {/* Vành phát quang dưới thân */}
            <ellipse cx="80" cy="52" rx="54" ry="10" fill="#090d16" stroke="rgba(245,158,11,0.8)" strokeWidth="1.5" />

            {/* Dàn đèn LED neon xoay quanh thân đĩa bay */}
            <circle cx="20" cy="48" r="3.5" fill="#38bdf8" className="animate-pulse" />
            <circle cx="48" cy="54" r="3.5" fill="#facc15" className="animate-ping" />
            <circle cx="80" cy="56" r="4.5" fill="#f43f5e" className="animate-pulse" />
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

          {/* Cửa xả năng lượng Tractor Beam dưới bụng UFO */}
          <div
            className={`w-12 h-3 rounded-full transition-all ${
              phase === "abducting" || phase === "locked"
                ? "bg-cyan-300 shadow-[0_0_30px_#38bdf8] scale-125 animate-pulse"
                : "bg-slate-700"
            }`}
          />
        </div>

        {/* ================= TIA SÁNG TRACTOR BEAM KẾT NỐI TỪ UFO Ở GIỮA ĐẾN HỌC SINH ================= */}
        {phase !== "idle" && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            <defs>
              {/* Gradient ánh sáng quét tìm kiếm */}
              <linearGradient id="scanBeamGrad" x1="50%" y1="12%" x2={`${targetPos.x}%`} y2={`${targetPos.y}%`}>
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
                <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.05" />
              </linearGradient>
              {/* Gradient khóa mục tiêu đỏ rực */}
              <linearGradient id="lockBeamGrad" x1="50%" y1="12%" x2={`${targetPos.x}%`} y2={`${targetPos.y}%`}>
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.95" />
                <stop offset="60%" stopColor="#e11d48" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.1" />
              </linearGradient>
              {/* Gradient hút chống trọng lực cực mạnh */}
              <linearGradient id="abductBeamGrad" x1="50%" y1="12%" x2={`${targetPos.x}%`} y2={`${targetPos.y}%`}>
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="30%" stopColor="#67e8f9" stopOpacity="0.8" />
                <stop offset="70%" stopColor="#facc15" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.15" />
              </linearGradient>
            </defs>

            {/* Chùm nón ánh sáng chiếu từ UFO ở giữa */}
            <polygon
              points={`
                calc(50% - 18px), 52 
                calc(50% + 18px), 52 
                ${targetPos.x + 4.5}%, ${targetPos.y}% 
                ${targetPos.x - 4.5}%, ${targetPos.y}%
              `}
              fill={
                phase === "locked"
                  ? "url(#lockBeamGrad)"
                  : phase === "abducting" || phase === "captured"
                  ? "url(#abductBeamGrad)"
                  : "url(#scanBeamGrad)"
              }
              className="transition-all duration-100"
              style={{
                filter:
                  phase === "abducting"
                    ? "drop-shadow(0 0 25px rgba(56,189,248,0.9))"
                    : "drop-shadow(0 0 15px rgba(6,182,212,0.6))",
              }}
            />
          </svg>
        )}

        {/* Khối đệm trên cao cho đĩa bay UFO */}
        <div className="w-full h-24 sm:h-28 shrink-0" />

        {/* ================= SÂN TRƯỜNG HIỆN ĐẦY ĐỦ TẤT CẢ HỌC SINH 11A10 ================= */}
        <div className="relative w-full flex-1 z-20 flex flex-col justify-end px-3 sm:px-6 pb-3 overflow-hidden">
          {/* Lớp nền sân gạch trường học neon */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/90 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 inset-x-0 h-24 border-t border-cyan-500/30 bg-[linear-gradient(to_right,rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:32px_20px] pointer-events-none" />

          {/* Tiêu đề khu vực tập trung sân trường */}
          <div className="relative z-10 flex items-center justify-between pb-2 text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              SÂN TRƯỜNG TẬP THỂ 11A10 ({candidates.length} BẠN)
            </span>
            <span>
              {phase === "locked" || phase === "abducting" ? (
                <strong className="text-rose-400">ĐÃ KHÓA: {activeStudent?.fullName}</strong>
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
                const isCurrentScanned = idx === activeStudentIdx;
                const isWinnerLocked = targetStudent?.id === st.id;
                const isFlying = isWinnerLocked && (phase === "abducting" || phase === "captured");
                const shortName = st.fullName.split(" ").slice(-2).join(" ");

                return (
                  <div
                    key={st.id}
                    ref={(el) => (studentCardRefs.current[idx] = el)}
                    className={`relative flex flex-col items-center justify-between p-1.5 rounded-xl border transition-all duration-150 ${
                      isFlying
                        ? "opacity-20 scale-90 border-dashed border-cyan-500/40"
                        : isWinnerLocked
                        ? "bg-rose-950/95 border-rose-400 shadow-[0_0_20px_#f43f5e] scale-110 z-20"
                        : isCurrentScanned && phase === "scanning"
                        ? "bg-cyan-950/90 border-cyan-400 shadow-[0_0_15px_#06b6d4] scale-105 z-10"
                        : "bg-slate-900/70 border-white/10 hover:border-white/20 opacity-80 hover:opacity-100"
                    }`}
                  >
                    {/* Bong bóng biểu cảm giật mình khi bị khóa mục tiêu */}
                    {isWinnerLocked && phase === "locked" && (
                      <div className="absolute -top-7 z-30 px-2 py-0.5 rounded-full bg-rose-600 text-white font-black text-[10px] shadow-lg animate-bounce whitespace-nowrap border border-white/40">
                        Ơ kìa mình hả?! 😨
                      </div>
                    )}

                    {/* STT học sinh */}
                    <span
                      className={`text-[9px] font-mono font-bold leading-none ${
                        isWinnerLocked
                          ? "text-rose-300"
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
                        <rect x="9" y="15" width="16" height="15" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
                        {/* Cà vạt xanh navy */}
                        <path d="M17 17L15.5 24L17 26L18.5 24Z" fill="#2563eb" />
                        {/* Tay áo */}
                        <rect x="6" y="16" width="4" height="9" rx="1" fill="#ffffff" />
                        <rect x="24" y="16" width="4" height="9" rx="1" fill="#ffffff" />
                        {/* Đầu & Mặt học sinh */}
                        <circle cx="17" cy="9" r="7" fill="#ffedd5" stroke="#fed7aa" strokeWidth="0.8" />
                        {/* Mái tóc */}
                        <path d="M10 8C10 4 13 2 17 2C21 2 24 4 24 8C22 6 19 6 17 6C15 6 12 6 10 8Z" fill="#1e1b4b" />
                        {/* Mắt biểu cảm */}
                        {isWinnerLocked || (isCurrentScanned && phase === "scanning") ? (
                          <g>
                            <circle cx="15" cy="8.5" r="1.3" fill="#0f172a" />
                            <circle cx="19" cy="8.5" r="1.3" fill="#0f172a" />
                            {/* Giọt mồ hôi lo lắng */}
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
                          : isCurrentScanned && phase === "scanning"
                          ? "text-cyan-200"
                          : "text-slate-200"
                      }`}
                      title={st.fullName}
                    >
                      {shortName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================= NHÂN VẬT HỌC SINH THỰC SỰ ĐANG BAY LƠ LỬNG LÊN UFO Ở GIỮA ================= */}
        {targetStudent && (phase === "abducting" || phase === "captured") && (
          <div
            className="absolute z-40 pointer-events-none transition-all duration-75 flex flex-col items-center"
            style={{
              left: `${flyingX}%`,
              top: `${flyingY}%`,
              transform: `translate(-50%, -50%) scale(${
                phase === "captured" ? 0.2 : 1 + Math.sin((abductProgress / 100) * Math.PI) * 0.45
              })`,
              opacity: phase === "captured" ? 0 : 1,
            }}
          >
            {/* Bong bóng kêu cứu hốt hoảng */}
            <div className="px-2.5 py-1 rounded-full bg-rose-600 text-white font-black text-xs shadow-xl animate-bounce flex items-center gap-1 border border-white/40 mb-1">
              <span>Aaaaa cứu tớ với! 😱</span>
            </div>

            {/* Vòng hào quang chống trọng lực xoáy quanh người */}
            <div className="absolute inset-0 rounded-full border-2 border-cyan-300 shadow-[0_0_25px_#38bdf8] animate-ping pointer-events-none" />

            {/* Hình thể học sinh phóng to chân thực vẫy vùng trên không */}
            <svg width="68" height="88" viewBox="0 0 68 88" fill="none" className="filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
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

      {/* 3. Nút kích hoạt phóng UFO */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
        <button
          type="button"
          disabled={phase === "scanning" || phase === "locked" || phase === "abducting" || candidates.length === 0}
          onClick={handleStartAbduction}
          className={`px-5 sm:px-7 py-3 sm:py-3.5 rounded-2xl font-display font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-xl flex items-center gap-2 active:scale-95 ${
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
              ? "UFO ĐANG TIẾN HÀNH BẮT CÓC..."
              : `KÍCH HOẠT UFO BẮT CÓC (${candidates.length} BẠN)`}
          </span>
        </button>

        {phase === "captured" && (
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-3 sm:py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Lượt bắt cóc mới</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default UfoAbductionGame;
