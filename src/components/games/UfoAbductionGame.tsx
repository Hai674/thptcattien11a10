import React, { useState, useEffect, useRef, useCallback } from "react";
import { cyberAudio } from "@/utils/cyberAudio";
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

// Component vẽ nhân vật Học sinh 11A10 dạng hoạt họa Chibi 3D chân thực
const StudentCharacterFigure: React.FC<{
  name: string;
  phase: "idle" | "scanning" | "locked" | "abducting" | "captured";
  stt: number;
}> = ({ name, phase, stt }) => {
  const isShocked = phase === "locked" || phase === "abducting";
  const isLevitating = phase === "abducting";

  return (
    <div className="relative flex flex-col items-center">
      {/* Vòng hào quang chống trọng lực khi bị hút */}
      {isLevitating && (
        <div className="absolute -inset-4 rounded-full border-2 border-cyan-400/80 animate-ping pointer-events-none" />
      )}

      {/* Bong bóng biểu cảm giật mình / hốt hoảng khi UFO khóa mục tiêu */}
      {isShocked && (
        <div className="absolute -top-9 z-20 px-2 py-0.5 rounded-full bg-rose-600 text-white font-black text-[11px] shadow-lg animate-bounce flex items-center gap-1 border border-white/40">
          <span>{isLevitating ? "Aaaaa cứu với! 😱" : "Ơ kìa mình hả?! 😨"}</span>
        </div>
      )}

      {/* Hình thể nhân vật học sinh */}
      <div className={`relative transition-transform duration-200 ${isLevitating ? "animate-pulse" : ""}`}>
        <svg width="72" height="96" viewBox="0 0 72 96" fill="none" className="filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]">
          {/* Ba lô đi học sau lưng */}
          <rect x="14" y="38" width="12" height="28" rx="5" fill="#f97316" stroke="#ea580c" strokeWidth="1.5" />
          <rect x="46" y="38" width="12" height="28" rx="5" fill="#f97316" stroke="#ea580c" strokeWidth="1.5" />

          {/* Chân & Quần tây học sinh (lơ lửng đung đưa trong không trung khi bị hút) */}
          {isLevitating ? (
            <g className="animate-[wiggle_1s_ease-in-out_infinite]">
              <rect x="22" y="68" width="10" height="20" rx="4" fill="#1e293b" transform="rotate(8 22 68)" />
              <rect x="40" y="68" width="10" height="20" rx="4" fill="#1e293b" transform="rotate(-8 40 68)" />
              {/* Giày thể thao */}
              <ellipse cx="26" cy="90" rx="7" ry="4" fill="#ffffff" />
              <ellipse cx="46" cy="90" rx="7" ry="4" fill="#ffffff" />
            </g>
          ) : (
            <g>
              <rect x="23" y="68" width="10" height="22" rx="4" fill="#1e293b" />
              <rect x="39" y="68" width="10" height="22" rx="4" fill="#1e293b" />
              <ellipse cx="27" cy="91" rx="7" ry="4" fill="#ffffff" />
              <ellipse cx="45" cy="91" rx="7" ry="4" fill="#ffffff" />
            </g>
          )}

          {/* Áo sơ mi trắng đồng phục 11A10 */}
          <rect x="20" y="36" width="32" height="34" rx="7" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
          {/* Cà vạt / khăn quàng đồng phục xanh navy */}
          <path d="M36 40L33 58L36 62L39 58Z" fill="#2563eb" />
          {/* Phù hiệu trường THPT Cát Tiên trên ngực áo */}
          <rect x="23" y="42" width="6" height="5" rx="1" fill="#dc2626" />

          {/* Cánh tay (Vẫy vùng hoảng sợ khi bay lên, hoặc để xuôi khi đứng) */}
          {isLevitating ? (
            <g>
              {/* Tay trái giơ lên vẫy */}
              <rect x="10" y="24" width="8" height="24" rx="4" fill="#fed7aa" transform="rotate(-35 10 24)" />
              {/* Tay phải giơ lên vẫy */}
              <rect x="54" y="20" width="8" height="24" rx="4" fill="#fed7aa" transform="rotate(35 54 20)" />
            </g>
          ) : (
            <g>
              <rect x="12" y="38" width="8" height="22" rx="4" fill="#ffffff" />
              <circle cx="16" cy="62" r="4.5" fill="#fed7aa" />
              <rect x="52" y="38" width="8" height="22" rx="4" fill="#ffffff" />
              <circle cx="56" cy="62" r="4.5" fill="#fed7aa" />
            </g>
          )}

          {/* Đầu & Khuôn mặt học sinh */}
          <circle cx="36" cy="22" r="15" fill="#ffedd5" stroke="#fed7aa" strokeWidth="1" />

          {/* Tóc học sinh gọn gàng */}
          <path d="M21 20C21 11 27 7 36 7C45 7 51 11 51 20C47 16 41 16 36 16C31 16 25 16 21 20Z" fill="#1e1b4b" />

          {/* Biểu cảm khuôn mặt: Mắt & Miệng há hốc ngạc nhiên khi bị chọn */}
          {isShocked ? (
            <g>
              {/* Mắt mở to tròn kinh ngạc */}
              <circle cx="31" cy="20" r="3" fill="#0f172a" />
              <circle cx="41" cy="20" r="3" fill="#0f172a" />
              <circle cx="32" cy="19" r="1" fill="#ffffff" />
              <circle cx="42" cy="19" r="1" fill="#ffffff" />
              {/* Miệng chữ O ngạc nhiên */}
              <ellipse cx="36" cy="28" rx="3.5" ry="5" fill="#dc2626" />
              {/* Giọt mồ hôi lo lắng */}
              <path d="M47 13C47 13 49 16 49 17C49 18 48 19 47 19C46 19 45 18 45 17C45 16 47 13 47 13Z" fill="#38bdf8" />
            </g>
          ) : (
            <g>
              {/* Mắt cười tươi */}
              <circle cx="31" cy="21" r="2.2" fill="#0f172a" />
              <circle cx="41" cy="21" r="2.2" fill="#0f172a" />
              {/* Nụ cười vui vẻ */}
              <path d="M32 27Q36 30 40 27" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          )}
        </svg>
      </div>

      {/* Bảng tên học sinh gắn liền dưới chân nhân vật */}
      <div className={`mt-1 px-3 py-1 rounded-xl backdrop-blur-md border text-center transition-all ${
        isShocked
          ? "bg-rose-950/95 border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.8)]"
          : "bg-slate-900/90 border-cyan-500/40 shadow-lg"
      }`}>
        <div className="font-mono text-[9px] font-bold text-amber-300">
          #{String(stt).padStart(2, "0")} • 11A10
        </div>
        <div className="font-display font-black text-xs sm:text-sm text-white truncate max-w-[140px]">
          {name}
        </div>
      </div>
    </div>
  );
};

export const UfoAbductionGame: React.FC<UfoAbductionGameProps> = ({
  candidates,
  onSelectWinner,
  className = "",
}) => {
  const [phase, setPhase] = useState<"idle" | "scanning" | "locked" | "abducting" | "captured">("idle");
  const [targetStudent, setTargetStudent] = useState<UfoStudent | null>(null);
  const [targetIndex, setTargetIndex] = useState<number>(0);
  const [scanningIdx, setScanningIdx] = useState<number>(0);
  const [ufoXPercent, setUfoXPercent] = useState<number>(50);
  const [abductHeight, setAbductHeight] = useState<number>(0); // 0 đến 100%

  const animTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
    };
  }, []);

  // Bắt đầu quá trình bay UFO, rà soát học sinh và hút lên
  const handleStartAbduction = useCallback(() => {
    if (phase !== "idle" && phase !== "captured") return;
    if (candidates.length === 0) return;

    // 1. Chọn trước bạn trúng ngẫu nhiên
    const chosenIndex = Math.floor(Math.random() * candidates.length);
    const chosenStudent = candidates[chosenIndex];

    setPhase("scanning");
    setTargetStudent(null);
    setAbductHeight(0);
    cyberAudio.playUfoBeam();

    let scanTicks = 0;
    const maxTicks = 22;

    const scanStep = () => {
      scanTicks++;
      const randIdx = Math.floor(Math.random() * candidates.length);
      setScanningIdx(randIdx);

      // UFO lượn qua lượn lại các tọa độ học sinh trên mặt đất
      const ufoPos = 20 + Math.random() * 60;
      setUfoXPercent(ufoPos);
      cyberAudio.playTick();

      if (scanTicks < maxTicks) {
        animTimerRef.current = setTimeout(scanStep, 70 + scanTicks * 12);
      } else {
        // 2. KHÓA MỤC TIÊU (TARGET LOCKED)
        setPhase("locked");
        setTargetStudent(chosenStudent);
        setTargetIndex(chosenIndex);
        setUfoXPercent(50); // Căn UFO ngay trên đỉnh đầu học sinh
        cyberAudio.playClick();

        animTimerRef.current = setTimeout(() => {
          // 3. CHIẾU TRACTOR BEAM VÀ HÚT HỌC SINH LƠ LỬNG LÊN KHOANG TÀU
          setPhase("abducting");
          cyberAudio.playUfoBeam();

          let liftProgress = 0;
          const liftInterval = setInterval(() => {
            liftProgress += 3.5;
            setAbductHeight(liftProgress);

            if (liftProgress >= 88) {
              clearInterval(liftInterval);
              // 4. HÚT HOÀN TẤT VÀO TRONG UFO (CAPTURED)
              setPhase("captured");
              cyberAudio.playAccessGranted();

              // Nín thở 1.8 giây hồi hộp trước khi mở bảng vinh danh
              animTimerRef.current = setTimeout(() => {
                onSelectWinner(chosenStudent);
              }, 1800);
            }
          }, 40);
        }, 900);
      }
    };

    scanStep();
  }, [candidates, phase, onSelectWinner]);

  const handleReset = () => {
    if (animTimerRef.current) clearTimeout(animTimerRef.current);
    setPhase("idle");
    setTargetStudent(null);
    setAbductHeight(0);
    setUfoXPercent(50);
  };

  const currentStudent = targetStudent || candidates[scanningIdx] || candidates[0] || null;
  const currentStt = targetStudent
    ? targetIndex + 1
    : candidates.findIndex((c) => c.id === currentStudent?.id) + 1;

  // Lấy 4 bạn học sinh đại diện đứng cạnh nhau ở sân trường tạo không khí đông vui
  const crowdStudents = candidates.slice(0, 5);

  return (
    <div className={`w-full max-w-4xl mx-auto flex flex-col items-center space-y-4 select-none ${className}`}>
      {/* 1. Màn hình HUD Radar quân sự */}
      <div className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950/85 border border-indigo-500/30 flex flex-wrap items-center justify-between gap-2 text-xs backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-2">
          <Radio className={`w-4 h-4 ${phase === "scanning" ? "text-cyan-400 animate-spin" : "text-purple-400"}`} />
          <span className="font-bold text-slate-200">
            HỆ THỐNG QUÉT UFO: <strong className="text-cyan-400">{candidates.length} bạn 11A10</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="text-slate-400">TRẠNG THÁI:</span>
          <span
            className={`font-black px-2.5 py-0.5 rounded-lg uppercase tracking-wider ${
              phase === "scanning"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 animate-pulse"
                : phase === "locked"
                ? "bg-rose-500/25 text-rose-300 border border-rose-400/50 animate-ping"
                : phase === "abducting"
                ? "bg-amber-500/25 text-amber-300 border border-amber-400/50 animate-pulse"
                : phase === "captured"
                ? "bg-emerald-500/25 text-emerald-300 border border-emerald-400/50"
                : "bg-white/5 text-slate-400"
            }`}
          >
            {phase === "scanning"
              ? "ĐANG QUÉT MẶT ĐẤT..."
              : phase === "locked"
              ? "🎯 ĐÃ KHÓA MỤC TIÊU!"
              : phase === "abducting"
              ? "⚡ ĐANG HÚT NGƯỜI LÊN UFO..."
              : phase === "captured"
              ? "🛸 ĐÃ BẮT VÀO ĐĨA BAY!"
              : "SẴN SÀNG PHÓNG UFO"}
          </span>
        </div>
      </div>

      {/* 2. Sân khấu Bầu trời đêm không gian & Sân trường */}
      <div className="relative w-full h-[400px] sm:h-[480px] rounded-3xl overflow-hidden border border-indigo-500/40 shadow-[0_25px_60px_rgba(0,0,0,0.95)] bg-gradient-to-b from-[#030617] via-[#080d26] to-[#040614]">
        {/* Bầu trời ngàn sao lung linh */}
        <div className="absolute inset-0 pointer-events-none opacity-70">
          <div className="absolute top-8 left-12 w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          <div className="absolute top-20 right-28 w-1 h-1 rounded-full bg-cyan-300 animate-pulse" />
          <div className="absolute top-36 left-1/4 w-1.5 h-1.5 rounded-full bg-amber-200 animate-ping" />
          <div className="absolute top-16 right-1/3 w-1 h-1 rounded-full bg-purple-300 animate-pulse" />
          <div className="absolute top-32 right-12 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        </div>

        {/* ================= ĐĨA BAY UFO VỚI ALIEN & ĐÈN QUAY ================= */}
        <div
          className="absolute top-5 transition-all duration-300 -translate-x-1/2 z-30"
          style={{ left: `${ufoXPercent}%` }}
        >
          <div className="relative flex flex-col items-center">
            {/* Đĩa bay UFO */}
            <svg width="150" height="74" viewBox="0 0 150 74" fill="none" className="filter drop-shadow-[0_10px_25px_rgba(56,189,248,0.6)]">
              {/* Buồng lái vòm kính trong suốt */}
              <ellipse cx="75" cy="30" rx="28" ry="20" fill="url(#cockpitGrad2)" stroke="#38bdf8" strokeWidth="1.5" />
              {/* Alien tí hon lái đĩa bay */}
              <circle cx="75" cy="27" r="8" fill="#4ade80" />
              <ellipse cx="72" cy="26" rx="2" ry="3" fill="#0f172a" />
              <ellipse cx="78" cy="26" rx="2" ry="3" fill="#0f172a" />
              <path d="M73 31Q75 33 77 31" stroke="#0f172a" strokeWidth="1" strokeLinecap="round" />

              {/* Thân đĩa bay kim loại siêu bền */}
              <ellipse cx="75" cy="46" rx="68" ry="17" fill="url(#saucerGrad2)" stroke="#cbd5e1" strokeWidth="1" />
              {/* Vành gân kim loại phát quang */}
              <ellipse cx="75" cy="50" rx="50" ry="9" fill="#090d16" stroke="rgba(245,158,11,0.7)" strokeWidth="1.5" />

              {/* Dàn đèn LED neon xoay tít */}
              <circle cx="22" cy="47" r="3.5" fill="#38bdf8" className="animate-pulse" />
              <circle cx="46" cy="52" r="3.5" fill="#facc15" className="animate-ping" />
              <circle cx="75" cy="54" r="4" fill="#f43f5e" className="animate-pulse" />
              <circle cx="104" cy="52" r="3.5" fill="#facc15" className="animate-ping" />
              <circle cx="128" cy="47" r="3.5" fill="#38bdf8" className="animate-pulse" />

              <defs>
                <linearGradient id="cockpitGrad2" x1="75" y1="10" x2="75" y2="50" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#bae6fd" stopOpacity="0.85" />
                  <stop offset="1" stopColor="#0284c7" stopOpacity="0.95" />
                </linearGradient>
                <linearGradient id="saucerGrad2" x1="7" y1="46" x2="143" y2="46" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#475569" />
                  <stop offset="0.5" stopColor="#94a3b8" />
                  <stop offset="1" stopColor="#1e293b" />
                </linearGradient>
              </defs>
            </svg>

            {/* Cửa xả năng lượng dưới bụng UFO */}
            <div className={`w-10 h-2.5 rounded-full ${
              phase === "abducting" || phase === "locked"
                ? "bg-cyan-300 shadow-[0_0_20px_#38bdf8] animate-pulse"
                : "bg-slate-700"
            }`} />
          </div>
        </div>

        {/* ================= TIA SÁNG TRACTOR BEAM HÚT NGƯỜI ================= */}
        {(phase === "abducting" || phase === "locked" || phase === "captured") && (
          <div
            className="absolute top-[72px] -translate-x-1/2 pointer-events-none transition-all duration-300 z-10"
            style={{
              left: `${ufoXPercent}%`,
              height: "360px",
            }}
          >
            <div
              className={`w-[140px] sm:w-[220px] h-full bg-gradient-to-b ${
                phase === "locked"
                  ? "from-rose-500/40 via-rose-500/15 to-transparent"
                  : "from-cyan-300/60 via-indigo-500/30 to-cyan-400/15"
              }`}
              style={{
                clipPath: "polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)",
                filter: "drop-shadow(0 0 25px rgba(56,189,248,0.7))",
              }}
            />
          </div>
        )}

        {/* ================= SÂN TRƯỜNG & HỌC SINH MẶT ĐẤT ================= */}
        <div className="absolute bottom-0 inset-x-0 h-36 bg-gradient-to-t from-slate-950 via-slate-900/90 to-transparent z-20 flex flex-col justify-end pb-3">
          {/* Lưới sân trường neon */}
          <div className="absolute bottom-0 inset-x-0 h-14 border-t border-cyan-500/30 bg-[linear-gradient(to_right,rgba(6,182,212,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.12)_1px,transparent_1px)] bg-[size:28px_18px]" />

          {/* Vòng hồng ngoại khóa mục tiêu dưới chân học sinh */}
          {phase !== "idle" && (
            <div
              className="absolute bottom-6 -translate-x-1/2 transition-all duration-300 pointer-events-none"
              style={{ left: `${ufoXPercent}%` }}
            >
              <div className="w-28 sm:w-36 h-9 rounded-full border-2 border-cyan-400 shadow-[0_0_20px_#06b6d4] animate-ping" />
              <Target className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-rose-400 animate-pulse" />
            </div>
          )}

          {/* HÀNG HỌC SINH BẠN BÈ ĐỨNG BÊN DƯỚI (TẠO CẢM GIÁC ĐÔNG ĐÚC HỒI HỘP) */}
          <div className="relative w-full max-w-lg mx-auto flex items-end justify-around px-4 pointer-events-none">
            {crowdStudents.map((st, idx) => {
              const isChosenOne = currentStudent?.id === st.id;
              // Nếu đang bị hút thì bạn này được nâng lên ở khối riêng bên dưới
              if (isChosenOne && (phase === "locked" || phase === "abducting" || phase === "captured")) {
                return <div key={st.id} className="w-16 h-24 opacity-0" />;
              }

              return (
                <div
                  key={st.id}
                  className={`flex flex-col items-center transition-all duration-300 ${
                    phase === "scanning" && scanningIdx % crowdStudents.length === idx
                      ? "scale-110 drop-shadow-[0_0_12px_#38bdf8]"
                      : "opacity-60 scale-90"
                  }`}
                >
                  {/* Hình nhân vật thu nhỏ ở hậu cảnh */}
                  <div className="w-9 h-12 rounded-full bg-slate-800/80 border border-white/20 flex items-center justify-center text-white text-xs font-bold shadow-md">
                    <span>#{idx + 1}</span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 mt-1 truncate max-w-[65px]">
                    {st.fullName.split(" ").slice(-1)[0]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* ================= NHÂN VẬT HỌC SINH THỰC SỰ BỊ HÚT LÊN BẰNG TRACTOR BEAM ================= */}
          {currentStudent && (
            <div
              className="absolute bottom-6 -translate-x-1/2 transition-all duration-75 z-40 pointer-events-none"
              style={{
                left: `${ufoXPercent}%`,
                // Học sinh thực sự bay bổng lên trời hướng về phía đĩa bay
                transform: `translate(-50%, -${abductHeight * 2.8}px) scale(${1 + (abductHeight / 100) * 0.15})`,
                opacity: phase === "captured" ? 0.2 : 1,
              }}
            >
              <StudentCharacterFigure
                name={currentStudent.fullName}
                phase={phase}
                stt={currentStt}
              />
            </div>
          )}
        </div>
      </div>

      {/* 3. Nút kích hoạt phóng UFO */}
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
