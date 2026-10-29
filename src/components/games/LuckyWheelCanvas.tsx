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

// Bảng màu rực rỡ luân phiên cho các nan quạt
const SLICE_COLORS = [
  { base: "#3b82f6", dark: "#1d4ed8" },
  { base: "#06b6d4", dark: "#0891b2" },
  { base: "#10b981", dark: "#047857" },
  { base: "#8b5cf6", dark: "#6d28d9" },
  { base: "#f59e0b", dark: "#d97706" },
  { base: "#ec4899", dark: "#be185d" },
  { base: "#6366f1", dark: "#4338ca" },
  { base: "#14b8a6", dark: "#0f766e" },
  { base: "#f97316", dark: "#c2410c" },
  { base: "#a855f7", dark: "#7e22ce" },
  { base: "#0284c7", dark: "#0369a1" },
  { base: "#f43f5e", dark: "#be123c" },
];

export const LuckyWheel: React.FC<LuckyWheelProps> = ({
  candidates,
  isSpinning,
  onSpinStart,
  onSpinEnd,
  className = "",
  soundEnabled = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const needleRef = useRef<HTMLDivElement | null>(null);
  const currentAngleRef = useRef<number>(0);
  const animFrameRef = useRef<number>(0);
  const delayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [highlightWinnerIndex, setHighlightWinnerIndex] = useState<number | null>(null);
  const [isWaitingSuspense, setIsWaitingSuspense] = useState(false);

  const count = Math.max(candidates.length, 1);
  const arc = (2 * Math.PI) / count;

  // Hàm phát âm thanh click nhẹ khi kim lướt qua nan quạt
  const playTickSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      cyberAudio.playTick();
    } catch {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.03);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.03);
      } catch {}
    }
  }, [soundEnabled]);

  // Hàm vẽ toàn bộ vòng quay
  const drawWheel = useCallback(
    (rotation: number, winningIdx: number | null = null) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const size = canvas.width;
      const center = size / 2;
      const radius = center - 36;
      const innerRadius = 75; // Bán kính trục giữa khít với nút bấm

      ctx.clearRect(0, 0, size, size);

      // 1. Vòng viền ngoài phát sáng (Glow border)
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, radius + 12, 0, 2 * Math.PI);
      ctx.fillStyle = "#070b14";
      ctx.shadowColor = "rgba(99, 102, 241, 0.5)";
      ctx.shadowBlur = 24;
      ctx.fill();

      const borderGrad = ctx.createLinearGradient(0, 0, size, size);
      borderGrad.addColorStop(0, "#38bdf8");
      borderGrad.addColorStop(0.3, "#818cf8");
      borderGrad.addColorStop(0.7, "#ec4899");
      borderGrad.addColorStop(1, "#f59e0b");
      ctx.strokeStyle = borderGrad;
      ctx.lineWidth = 8;
      ctx.stroke();
      ctx.restore();

      // 2. Vẽ từng nan quạt
      candidates.forEach((student, i) => {
        const startAngle = rotation + i * arc;
        const endAngle = startAngle + arc;
        const isWinner = winningIdx === i;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, radius, startAngle, endAngle);
        ctx.closePath();

        const color = SLICE_COLORS[i % SLICE_COLORS.length];
        const radGrad = ctx.createRadialGradient(center, center, innerRadius, center, center, radius);

        if (isWinner) {
          // Ô trúng giải nhấp nháy màu vàng kim
          radGrad.addColorStop(0, "#fef08a");
          radGrad.addColorStop(1, "#f59e0b");
        } else {
          radGrad.addColorStop(0, color.dark);
          radGrad.addColorStop(1, color.base);
        }

        ctx.fillStyle = radGrad;
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Đinh tán trang trí ngoài rìa
        const dotX = center + Math.cos(startAngle) * (radius + 6);
        const dotY = center + Math.sin(startAngle) * (radius + 6);
        ctx.beginPath();
        ctx.arc(dotX, dotY, 3, 0, 2 * Math.PI);
        ctx.fillStyle = "#bae6fd";
        ctx.fill();

        // 3. Vẽ chữ/tên học sinh
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(startAngle + arc / 2);
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";

        const isMany = count > 28;
        // Nếu đông người (>28), hiển thị STT ở rìa ngoài, kèm tên rút gọn
        if (isMany) {
          ctx.fillStyle = isWinner ? "#1e1b4b" : "#ffffff";
          ctx.font = '800 13px "JetBrains Mono", monospace';
          ctx.fillText(String(i + 1), radius - 12, 0);

          // Tên hiển thị bên trong
          ctx.font = '600 11px "Be Vietnam Pro", sans-serif';
          const shortName = student.fullName.split(" ").slice(-2).join(" "); // Lấy Tên Đệm + Tên
          ctx.fillStyle = isWinner ? "#0f172a" : "rgba(255, 255, 255, 0.9)";
          ctx.fillText(shortName, radius - 38, 0);
        } else {
          ctx.fillStyle = isWinner ? "#0f172a" : "#ffffff";
          ctx.font = '700 13.5px "Be Vietnam Pro", sans-serif';
          ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
          ctx.shadowBlur = 4;
          ctx.fillText(student.fullName, radius - 20, 0);
        }

        ctx.restore();
        ctx.restore();
      });

      // 4. Trục tâm vòng tròn
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, innerRadius, 0, 2 * Math.PI);
      ctx.fillStyle = "#0b0f19";
      ctx.fill();
      ctx.strokeStyle = "rgba(245, 158, 11, 0.6)";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    },
    [candidates, count, arc]
  );

  // Vẽ lại mỗi khi danh sách ứng viên thay đổi
  useEffect(() => {
    drawWheel(currentAngleRef.current, highlightWinnerIndex);
  }, [drawWheel, highlightWinnerIndex]);

  // Xử lý hiệu ứng quay
  useEffect(() => {
    if (!isSpinning || candidates.length === 0) return;

    setHighlightWinnerIndex(null);
    setIsWaitingSuspense(false);

    // 1. Chọn trước người chiến thắng ngẫu nhiên
    const winnerIdx = Math.floor(Math.random() * candidates.length);
    const winnerStudent = candidates[winnerIdx];

    // Kim chỉ ở góc 12h (1.5 * PI)
    const pointerAngle = 1.5 * Math.PI;
    // Điểm giữa của nan quạt trúng
    const targetSliceCenter = (winnerIdx + 0.5) * arc;

    let targetRotation = (pointerAngle - targetSliceCenter) % (2 * Math.PI);
    if (targetRotation < 0) targetRotation += 2 * Math.PI;

    const startAngle = currentAngleRef.current;
    const normalizedStart = ((startAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

    let delta = targetRotation - normalizedStart;
    if (delta <= 0) delta += 2 * Math.PI;

    // Quay từ 6 đến 8 vòng đầy đủ
    const fullSpins = 6 + Math.floor(Math.random() * 3);
    const totalAngleToRotate = delta + fullSpins * 2 * Math.PI;
    const finalAngle = startAngle + totalAngleToRotate;

    const duration = 5200; // 5.2 giây quay
    const startTime = performance.now();
    let lastSlicePassed = -1;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Đường cong easing tự nhiên (cubic easing out - không dốc đứng 4.2)
      const easeOut = 1 - Math.pow(1 - progress, 2.9);
      const currentRotation = startAngle + totalAngleToRotate * easeOut;

      currentAngleRef.current = currentRotation;
      drawWheel(currentRotation);

      // Hiệu ứng kim gõ khi đi qua từng nan
      const currentSliceUnderPointer =
        Math.floor((((pointerAngle - currentRotation) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) / arc);

      if (currentSliceUnderPointer !== lastSlicePassed) {
        lastSlicePassed = currentSliceUnderPointer;
        playTickSound();
        if (needleRef.current) {
          needleRef.current.style.transform = "rotate(14deg)";
          setTimeout(() => {
            if (needleRef.current) needleRef.current.style.transform = "rotate(0deg)";
          }, 40);
        }
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        // --- ĐOẠN QUAN TRỌNG: VÒNG QUAY ĐÃ DỪNG HẲN ---
        currentAngleRef.current = finalAngle;
        setHighlightWinnerIndex(winnerIdx);
        setIsWaitingSuspense(true);
        drawWheel(finalAngle, winnerIdx);

        // Kim chốt hạ vào tâm ô
        if (needleRef.current) {
          needleRef.current.style.transform = "scale(1.15) rotate(0deg)";
        }

        // TẠO ĐỘ TRỄ 1.8 GIÂY HỒI HỘP TRƯỚC KHI BẬT POPUP KẾT QUẢ
        delayTimerRef.current = setTimeout(() => {
          setIsWaitingSuspense(false);
          if (needleRef.current) needleRef.current.style.transform = "scale(1) rotate(0deg)";
          onSpinEnd(winnerStudent); // Gọi mở modal sau khi cả lớp đã nhìn rõ
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
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      {/* Kim chỉ phía trên 12h */}
      <div
        ref={needleRef}
        className="absolute -top-4 z-20 pointer-events-none transition-transform duration-100 origin-top filter drop-shadow-[0_6px_14px_rgba(245,158,11,0.8)]"
      >
        <div className="relative flex flex-col items-center">
          <svg width="34" height="46" viewBox="0 0 34 46" fill="none">
            <path
              d="M17 46L2 12C0 8 3 0 8 0H26C31 0 34 8 32 12L17 46Z"
              fill="url(#needleGradFix)"
              stroke="#ffffff"
              strokeWidth="2"
            />
            <defs>
              <linearGradient id="needleGradFix" x1="17" y1="0" x2="17" y2="46" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fde047" />
                <stop offset="0.6" stopColor="#f59e0b" />
                <stop offset="1" stopColor="#dc2626" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute top-2.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-amber-500 shadow-sm" />
        </div>
      </div>

      {/* Thẻ Canvas vòng quay */}
      <canvas
        ref={canvasRef}
        width={900}
        height={900}
        className="w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] md:w-[480px] md:h-[480px] max-w-full aspect-square drop-shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
      />

      {/* Nút bấm tròn trung tâm */}
      <button
        type="button"
        disabled={isSpinning || isWaitingSuspense || candidates.length === 0}
        onClick={onSpinStart}
        className={`absolute z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center font-display font-black text-xs sm:text-sm tracking-wider uppercase transition-all shadow-2xl active:scale-95 border-2 border-amber-400/50 ${
          isSpinning || isWaitingSuspense
            ? "bg-gradient-to-tr from-purple-800 to-indigo-900 text-purple-200 cursor-not-allowed opacity-95 animate-pulse"
            : candidates.length === 0
            ? "bg-slate-800 text-slate-500 cursor-not-allowed"
            : "bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white hover:scale-105 shadow-amber-500/40 cursor-pointer"
        }`}
      >
        <span>{isSpinning ? "ĐANG QUAY" : isWaitingSuspense ? "HỒI HỘP..." : "BẤM QUAY"}</span>
        <span className="text-[10px] font-sans font-normal opacity-85 mt-0.5">
          {candidates.length} bạn
        </span>
      </button>
    </div>
  );
};

export const LuckyWheelCanvas = LuckyWheel;
export default LuckyWheelCanvas;
