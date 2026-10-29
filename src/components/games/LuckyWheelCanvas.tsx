import React, { useEffect, useRef, useCallback, useState } from "react";
import { cyberAudio } from "@/utils/cyberAudio";

export interface Student {
  id: string;
  fullName: string;
  role?: string;
  group?: string;
}

export interface LuckyWheelProps {
  candidates: Student[];
  isSpinning: boolean;
  onSpinStart: () => void;
  onSpinEnd: (winner: Student) => void;
  selectedPurpose?: string;
  className?: string;
  soundEnabled?: boolean;
}

export type LuckyWheelCanvasProps = LuckyWheelProps;

export const LuckyWheel: React.FC<LuckyWheelProps> = ({
  candidates,
  isSpinning,
  onSpinStart,
  onSpinEnd,
  className = "",
  soundEnabled = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const needleRef = useRef<HTMLDivElement | null>(null);
  const hudNumberRef = useRef<HTMLSpanElement | null>(null);
  const hudNameRef = useRef<HTMLSpanElement | null>(null);
  const lastTickTimeRef = useRef<number>(0);

  const currentAngleRef = useRef<number>(0);
  const animFrameRef = useRef<number>(0);
  const delayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [highlightWinnerIndex, setHighlightWinnerIndex] = useState<number | null>(null);
  const [isWaitingSuspense, setIsWaitingSuspense] = useState(false);
  const [activeCandidate, setActiveCandidate] = useState<Student | null>(candidates[0] || null);

  const count = Math.max(candidates.length, 1);
  const arc = (2 * Math.PI) / count;

  // Cập nhật candidate đầu tiên
  useEffect(() => {
    if (candidates.length > 0 && !activeCandidate) {
      setActiveCandidate(candidates[0]);
    }
  }, [candidates, activeCandidate]);

  // Âm thanh tick được throttle để tránh nghẽn thread Web Audio khi quay tốc độ cao
  const playTickSound = useCallback(() => {
    if (!soundEnabled) return;
    const now = performance.now();
    if (now - lastTickTimeRef.current < 40) return; // Tối đa 25 tiếng/giây
    lastTickTimeRef.current = now;
    cyberAudio.playTick();
  }, [soundEnabled]);

  // 1. VẼ TRƯỚC (PRE-RENDER) ĐĨA QUAY VÀO OFFSCREEN CANVAS ĐỂ TỐI ƯU 60-120 FPS
  const renderOffscreenDisc = useCallback(() => {
    const size = 900;
    const center = size / 2;
    const radius = center - 38;
    const innerRadius = 72;

    const offscreen = document.createElement("canvas");
    offscreen.width = size;
    offscreen.height = size;
    const ctx = offscreen.getContext("2d");
    if (!ctx) return null;

    // Vành ngoài Metallic Titanium
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, radius + 18, 0, 2 * Math.PI);
    ctx.fillStyle = "#070b14";
    ctx.fill();

    ctx.strokeStyle = "rgba(245, 158, 11, 0.5)";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center, center, radius + 4, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(56, 189, 248, 0.3)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // Vẽ toàn bộ các nan quạt và tên học sinh một lần duy nhất
    candidates.forEach((student, i) => {
      const startAngle = i * arc;
      const endAngle = startAngle + arc;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();

      // Nan xen kẽ 2 tone màu sang trọng: Obsidian Navy & Deep Cyber Indigo
      const radGrad = ctx.createRadialGradient(center, center, innerRadius, center, center, radius);
      if (i % 2 === 0) {
        radGrad.addColorStop(0, "#080d1a");
        radGrad.addColorStop(0.4, "#0f172a");
        radGrad.addColorStop(1, "#17233f");
      } else {
        radGrad.addColorStop(0, "#0c081a");
        radGrad.addColorStop(0.4, "#130f28");
        radGrad.addColorStop(1, "#1e1642");
      }
      ctx.fillStyle = radGrad;
      ctx.fill();

      // Đường viền nan quạt
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Vẽ STT và Tên
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + arc / 2);
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";

      const isMany = count > 20;

      if (isMany) {
        // STT to rõ ở rìa ngoài
        ctx.font = '800 13px "JetBrains Mono", monospace';
        ctx.fillStyle = i % 2 === 0 ? "#38bdf8" : "#fbbf24";
        ctx.fillText(String(i + 1).padStart(2, "0"), radius - 10, 0);

        // Tên rút gọn (Đệm + Tên)
        ctx.font = '700 11px "Be Vietnam Pro", sans-serif';
        const shortName = student.fullName.split(" ").slice(-2).join(" ");
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.fillText(shortName, radius - 36, 0);
      } else {
        // Ít bạn: hiển thị cả họ tên đầy đủ
        ctx.font = '700 13.5px "Be Vietnam Pro", sans-serif';
        ctx.fillStyle = "#ffffff";
        ctx.fillText(student.fullName, radius - 18, 0);
      }

      ctx.restore();
      ctx.restore();
    });

    return offscreen;
  }, [candidates, count, arc]);

  // Cập nhật lại offscreen khi danh sách học sinh thay đổi
  useEffect(() => {
    offscreenCanvasRef.current = renderOffscreenDisc();
  }, [renderOffscreenDisc]);

  // 2. HÀM VẼ KHUNG HÌNH (CỰC NHANH NHỜ DRAWIMAGE TỪ OFFSCREEN)
  const drawWheel = useCallback(
    (rotation: number, winningIdx: number | null = null) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const size = canvas.width;
      const center = size / 2;
      const radius = center - 38;
      const innerRadius = 72;

      ctx.clearRect(0, 0, size, size);

      // A. Vẽ đĩa quay đã được pre-render sẵn (chỉ xoay góc rotation)
      if (offscreenCanvasRef.current) {
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(rotation);
        ctx.drawImage(offscreenCanvasRef.current, -center, -center);

        // Nếu có học sinh trúng giải: vẽ nan quạt phát sáng vàng Honey Gold đè lên
        if (winningIdx !== null) {
          const winStart = winningIdx * arc;
          const winEnd = winStart + arc;

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, radius, winStart, winEnd);
          ctx.closePath();

          const winGrad = ctx.createRadialGradient(0, 0, innerRadius, 0, 0, radius);
          winGrad.addColorStop(0, "#fef08a");
          winGrad.addColorStop(0.35, "#f59e0b");
          winGrad.addColorStop(1, "#b45309");
          ctx.fillStyle = winGrad;
          ctx.fill();

          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Chữ trên ô chiến thắng
          ctx.save();
          ctx.rotate(winStart + arc / 2);
          ctx.textAlign = "right";
          ctx.textBaseline = "middle";

          const winStudent = candidates[winningIdx];
          if (winStudent) {
            ctx.font = '800 13px "JetBrains Mono", monospace';
            ctx.fillStyle = "#0f172a";
            ctx.fillText(String(winningIdx + 1).padStart(2, "0"), radius - 10, 0);

            ctx.font = '700 12px "Be Vietnam Pro", sans-serif';
            const shortName = winStudent.fullName.split(" ").slice(-2).join(" ");
            ctx.fillText(shortName, radius - 36, 0);
          }
          ctx.restore();
        }

        ctx.restore();
      }

      // B. Vẽ dàn đèn LED đuổi quanh vành (nhanh, không shadow nặng khi quay)
      const numBulbs = Math.min(Math.max(count, 32), 48);
      const bulbStep = (2 * Math.PI) / numBulbs;
      const activeBulbShift = Math.floor((rotation / (2 * Math.PI)) * numBulbs * 2);

      for (let b = 0; b < numBulbs; b++) {
        const bAngle = b * bulbStep;
        const bx = center + Math.cos(bAngle) * (radius + 12);
        const by = center + Math.sin(bAngle) * (radius + 12);
        const isBulbLit = winningIdx !== null ? true : (b + activeBulbShift) % 3 === 0;

        ctx.beginPath();
        ctx.arc(bx, by, isBulbLit ? 3.5 : 2.5, 0, 2 * Math.PI);
        ctx.fillStyle = winningIdx !== null ? "#fef08a" : isBulbLit ? (b % 2 === 0 ? "#38bdf8" : "#fbbf24") : "#1e293b";
        ctx.fill();
      }

      // C. Trục tâm tròn (Center Hub)
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, innerRadius, 0, 2 * Math.PI);
      const hubGrad = ctx.createRadialGradient(center, center, 10, center, center, innerRadius);
      hubGrad.addColorStop(0, "#0b0f19");
      hubGrad.addColorStop(1, "#030712");
      ctx.fillStyle = hubGrad;
      ctx.fill();

      ctx.strokeStyle = "rgba(245, 158, 11, 0.85)";
      ctx.lineWidth = 3.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(center, center, innerRadius - 6, 0, 2 * Math.PI);
      ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    },
    [candidates, count, arc]
  );

  useEffect(() => {
    drawWheel(currentAngleRef.current, highlightWinnerIndex);
  }, [drawWheel, highlightWinnerIndex]);

  // 3. VÒNG LẶP ANIMATION ĐẠT CHUẨN 60-120 FPS
  useEffect(() => {
    if (!isSpinning || candidates.length === 0) return;

    setHighlightWinnerIndex(null);
    setIsWaitingSuspense(false);

    const winnerIdx = Math.floor(Math.random() * candidates.length);
    const winnerStudent = candidates[winnerIdx];

    const pointerAngle = 1.5 * Math.PI;
    const targetSliceCenter = (winnerIdx + 0.5) * arc;

    let targetRotation = (pointerAngle - targetSliceCenter) % (2 * Math.PI);
    if (targetRotation < 0) targetRotation += 2 * Math.PI;

    const startAngle = currentAngleRef.current;
    const normalizedStart = ((startAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

    let delta = targetRotation - normalizedStart;
    if (delta <= 0) delta += 2 * Math.PI;

    const fullSpins = 6 + Math.floor(Math.random() * 3);
    const totalAngleToRotate = delta + fullSpins * 2 * Math.PI;
    const finalAngle = startAngle + totalAngleToRotate;

    const duration = 5200;
    const startTime = performance.now();
    let lastSlicePassed = -1;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing kịch tính tự nhiên (quay nhanh lúc đầu, giảm tốc thót tim về cuối)
      const easeOut = 1 - Math.pow(1 - progress, 2.9);
      const currentRotation = startAngle + totalAngleToRotate * easeOut;

      currentAngleRef.current = currentRotation;
      drawWheel(currentRotation);

      const currentSliceUnderPointer =
        Math.floor((((pointerAngle - currentRotation) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) / arc);

      if (currentSliceUnderPointer !== lastSlicePassed) {
        lastSlicePassed = currentSliceUnderPointer;
        const candidateNow = candidates[currentSliceUnderPointer];
        if (candidateNow) {
          // Cập nhật trực tiếp DOM để tránh kích hoạt React re-render gây giật lag
          if (hudNumberRef.current) {
            hudNumberRef.current.textContent = `#${String(currentSliceUnderPointer + 1).padStart(2, "0")}`;
          }
          if (hudNameRef.current) {
            hudNameRef.current.textContent = candidateNow.fullName;
          }
        }
        playTickSound();

        if (needleRef.current) {
          needleRef.current.style.transform = "rotate(12deg)";
          setTimeout(() => {
            if (needleRef.current) needleRef.current.style.transform = "rotate(0deg)";
          }, 35);
        }
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        currentAngleRef.current = finalAngle;
        setHighlightWinnerIndex(winnerIdx);
        setActiveCandidate(winnerStudent);
        setIsWaitingSuspense(true);
        drawWheel(finalAngle, winnerIdx);

        if (needleRef.current) {
          needleRef.current.style.transform = "scale(1.15) rotate(0deg)";
        }

        delayTimerRef.current = setTimeout(() => {
          setIsWaitingSuspense(false);
          if (needleRef.current) needleRef.current.style.transform = "scale(1) rotate(0deg)";
          onSpinEnd(winnerStudent);
        }, 1800);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
    };
  }, [isSpinning, candidates, arc, drawWheel, onSpinEnd, playTickSound]);

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* 1. Màn hình HUD LED quét tên trực tiếp theo thời gian thực */}
      <div
        className={`w-full max-w-[280px] sm:max-w-xs mb-3 px-3 py-2 rounded-xl border backdrop-blur-md transition-all duration-200 flex items-center justify-between gap-2 shadow-lg ${
          isWaitingSuspense
            ? "bg-amber-950/80 border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
            : isSpinning
            ? "bg-slate-950/90 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
            : "bg-slate-950/70 border-white/10"
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              isWaitingSuspense
                ? "bg-amber-400 animate-bounce"
                : isSpinning
                ? "bg-cyan-400 animate-ping"
                : "bg-emerald-400"
            }`}
          />
          <span ref={hudNumberRef} className="font-mono text-xs text-amber-400 font-bold shrink-0">
            #{String(activeCandidate ? candidates.findIndex((c) => c.id === activeCandidate.id) + 1 : 1).padStart(2, "0")}
          </span>
          <span
            ref={hudNameRef}
            className={`font-display font-bold text-xs sm:text-sm truncate ${
              isWaitingSuspense
                ? "text-amber-200 drop-shadow-[0_0_8px_rgba(245,158,11,0.9)]"
                : "text-white"
            }`}
          >
            {activeCandidate ? activeCandidate.fullName : "Sẵn sàng quay..."}
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-400 shrink-0 font-medium">
          {isSpinning ? "QUÉT..." : isWaitingSuspense ? "CHỐT! 🎉" : "11A10"}
        </span>
      </div>

      {/* 2. Vòng quay Canvas & Kim chỉ 3D */}
      <div className="relative inline-flex items-center justify-center">
        {/* Kim chỉ thị cơ học Cyber Gold */}
        <div
          ref={needleRef}
          className="absolute -top-3 sm:-top-4 z-20 pointer-events-none transition-transform duration-75 origin-top filter drop-shadow-[0_6px_16px_rgba(245,158,11,0.9)]"
        >
          <div className="relative flex flex-col items-center">
            <svg width="32" height="44" viewBox="0 0 32 44" fill="none" className="sm:w-[38px] sm:h-[50px]">
              <path
                d="M16 44L3 12C1 7 4 0 10 0H22C28 0 31 7 29 12L16 44Z"
                fill="url(#needleMetallicGrad)"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              <path d="M16 44L16 0" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1" />
              <path d="M16 44L29 12C31 7 28 0 22 0H16V44Z" fill="rgba(0, 0, 0, 0.18)" />
              <defs>
                <linearGradient id="needleMetallicGrad" x1="16" y1="0" x2="16" y2="44" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#fef08a" />
                  <stop offset="0.3" stopColor="#f59e0b" />
                  <stop offset="0.7" stopColor="#d97706" />
                  <stop offset="1" stopColor="#92400e" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute top-2.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-gradient-to-tr from-rose-500 to-amber-300 border-2 border-white shadow-[0_0_8px_#f59e0b]" />
          </div>
        </div>

        {/* Canvas vòng quay */}
        <canvas
          ref={canvasRef}
          width={900}
          height={900}
          className="w-[260px] h-[260px] xs:w-[300px] xs:h-[300px] sm:w-[420px] sm:h-[420px] md:w-[480px] md:h-[480px] max-w-[82vw] max-h-[82vw] aspect-square drop-shadow-[0_15px_35px_rgba(0,0,0,0.9)]"
        />

        {/* Nút bấm tròn trung tâm phong cách Dark Glassmorphism */}
        <button
          type="button"
          disabled={isSpinning || isWaitingSuspense || candidates.length === 0}
          onClick={onSpinStart}
          className={`absolute z-10 w-16 h-16 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center font-display font-black text-[10px] sm:text-xs tracking-wider uppercase transition-all shadow-2xl active:scale-95 border-2 ${
            isSpinning || isWaitingSuspense
              ? "bg-slate-900 border-indigo-500/60 text-cyan-300 cursor-not-allowed opacity-95 animate-pulse shadow-indigo-500/30"
              : candidates.length === 0
              ? "bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed"
              : "bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 border-amber-400 text-amber-300 hover:scale-105 hover:border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.35)] cursor-pointer"
          }`}
        >
          <span>{isSpinning ? "ĐANG QUAY" : isWaitingSuspense ? "HỒI HỘP..." : "BẤM QUAY"}</span>
          <span className="text-[8px] sm:text-[9px] font-mono font-normal opacity-75 mt-0.5">
            {candidates.length} bạn
          </span>
        </button>
      </div>
    </div>
  );
};

export const LuckyWheelCanvas = LuckyWheel;
export default LuckyWheelCanvas;
