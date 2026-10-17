import React, { useRef, useEffect, useCallback } from 'react';
import { cyberAudio } from '@/utils/cyberAudio';

interface LuckyWheelCanvasProps {
  candidates: { id: string; fullName: string; role?: string; group?: string }[];
  isSpinning: boolean;
  onSpinStart: () => void;
  onSpinEnd: (winner: { id: string; fullName: string; role?: string; group?: string }) => void;
  selectedPurpose?: string;
  className?: string;
}

const PALETTE = [
  '#4f46e5', // Indigo
  '#0891b2', // Cyan
  '#059669', // Emerald
  '#d97706', // Amber
  '#db2777', // Pink
  '#7c3aed', // Purple
  '#2563eb', // Blue
  '#0d9488', // Teal
  '#ea580c', // Orange
  '#9333ea', // Violet
];

export const LuckyWheelCanvas: React.FC<LuckyWheelCanvasProps> = ({
  candidates,
  isSpinning,
  onSpinStart,
  onSpinEnd,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const needleRef = useRef<HTMLDivElement | null>(null);
  const currentAngleRef = useRef<number>(0);
  const animFrameRef = useRef<number>(0);

  const numItems = Math.max(candidates.length, 1);
  const sliceAngle = (2 * Math.PI) / numItems;

  // Vẽ toàn bộ vòng quay lên Canvas với độ phân giải cao
  const drawWheel = useCallback(
    (angle: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = canvas.width;
      const center = size / 2;
      const radius = center - 24;

      ctx.clearRect(0, 0, size, size);

      // 1. Vòng viền ngoài phản quang phát sáng (Outer Rim)
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, radius + 12, 0, 2 * Math.PI);
      ctx.fillStyle = '#0f172a';
      ctx.shadowColor = '#6366f1';
      ctx.shadowBlur = 20;
      ctx.fill();

      const rimGradient = ctx.createLinearGradient(0, 0, size, size);
      rimGradient.addColorStop(0, '#f59e0b');
      rimGradient.addColorStop(0.3, '#ec4899');
      rimGradient.addColorStop(0.7, '#6366f1');
      rimGradient.addColorStop(1, '#06b6d4');
      ctx.strokeStyle = rimGradient;
      ctx.lineWidth = 8;
      ctx.stroke();
      ctx.restore();

      // 2. Vẽ từng nan quạt (Slices)
      candidates.forEach((student, i) => {
        const start = angle + i * sliceAngle;
        const end = start + sliceAngle;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, radius, start, end);
        ctx.closePath();

        // Màu nan quạt
        const baseColor = PALETTE[i % PALETTE.length];
        ctx.fillStyle = baseColor;
        ctx.fill();

        // Viền nan quạt
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Đèn bóng tròn nhỏ ở vành (Peg bulbs)
        const pegAngle = start;
        const pegX = center + Math.cos(pegAngle) * (radius + 5);
        const pegY = center + Math.sin(pegAngle) * (radius + 5);
        ctx.beginPath();
        ctx.arc(pegX, pegY, 3, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#fef08a';
        ctx.shadowBlur = 6;
        ctx.fill();

        // 3. Tên học sinh xoay hướng tâm
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(start + sliceAngle / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#ffffff';
        ctx.font = numItems > 30 ? 'bold 11px Inter, sans-serif' : 'bold 13px Inter, sans-serif';
        ctx.shadowColor = 'rgba(0,0,0,0.85)';
        ctx.shadowBlur = 4;

        // Cắt gọn tên nếu quá dài để hiển thị sắc nét
        const rawName = student.fullName;
        const shortName = rawName.length > 15 ? rawName.slice(0, 14) + '…' : rawName;

        ctx.fillText(shortName, radius - 16, 4);
        ctx.restore();

        ctx.restore();
      });

      // 4. Trục xoay trung tâm (Center Hub)
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, 42, 0, 2 * Math.PI);
      const hubGradient = ctx.createRadialGradient(center, center, 5, center, center, 42);
      hubGradient.addColorStop(0, '#1e1b4b');
      hubGradient.addColorStop(1, '#090d16');
      ctx.fillStyle = hubGradient;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 15;
      ctx.fill();

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Logo chữ 11A10 ở trục giữa
      ctx.fillStyle = '#fef08a';
      ctx.font = 'black 15px Montserrat, Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 8;
      ctx.fillText('11A10', center, center);
      ctx.restore();
    },
    [candidates, numItems, sliceAngle]
  );

  // Vẽ lần đầu và khi candidates thay đổi
  useEffect(() => {
    drawWheel(currentAngleRef.current);
  }, [drawWheel]);

  // Vòng lặp vật lý khi quay (Physics Spin Animation với thuật toán định tâm chuẩn)
  useEffect(() => {
    if (!isSpinning || candidates.length === 0) return;

    // 1. CHỌN TRƯỚC NGƯỜI TRÚNG GIẢI NGẪU NHIÊN 100%
    const winnerIndex = Math.floor(Math.random() * candidates.length);
    const chosenWinner = candidates[winnerIndex];

    // 2. TÍNH TOÁN GÓC DỪNG CHÍNH XÁC VÀO TÂM CỦA NAN QUẠT NGƯỜI TRÚNG
    // Mũi kim đặt ở đỉnh 12h: góc = 3 * PI / 2 = 1.5 * PI
    const pointerAngle = 1.5 * Math.PI;

    // Vị trí tâm của nan quạt winner: (winnerIndex + 0.5) * sliceAngle
    // Ta thêm 1 độ lệch vi sai an toàn (jitter) trong khoảng ±20% để trông tự nhiên nhưng TUYỆT ĐỐI không bao giờ chạm ranh giới
    const safeJitter = (Math.random() - 0.5) * 0.4 * sliceAngle;
    const targetSliceCenter = (winnerIndex + 0.5) * sliceAngle + safeJitter;

    // Góc quay mục tiêu trong khoảng [0, 2*PI)
    let finalAngleMod = (pointerAngle - targetSliceCenter) % (2 * Math.PI);
    if (finalAngleMod < 0) {
      finalAngleMod += 2 * Math.PI;
    }

    // Góc hiện tại theo modulo
    const startAngle = currentAngleRef.current;
    const currentMod = ((startAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

    // Tính delta quay thêm để dừng chính xác
    let delta = finalAngleMod - currentMod;
    if (delta <= 0) {
      delta += 2 * Math.PI;
    }

    // Quay từ 7 đến 10 vòng hoàn chỉnh trước khi dừng lại
    const extraSpins = 7 + Math.floor(Math.random() * 3);
    const totalRotation = delta + extraSpins * 2 * Math.PI;
    const targetFinalAngle = startAngle + totalRotation;

    // Thời gian quay từ 5.4s đến 6.5s
    const startTime = performance.now();
    const duration = 5400 + Math.random() * 900;

    let lastTickSlice = -1;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Hàm hãm tốc mượt mà Quintic Ease-Out (dừng cực êm dịu, không giật nhảy)
      const easeOut = 1 - Math.pow(1 - progress, 4.2);
      const currentRotation = startAngle + totalRotation * easeOut;
      currentAngleRef.current = currentRotation;

      drawWheel(currentRotation);

      // Tính nan quạt hiện tại đang đi qua kim để phát âm thanh click
      const currentRelative = ((pointerAngle - currentRotation) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      const currentSlice = Math.floor(currentRelative / sliceAngle);

      if (currentSlice !== lastTickSlice) {
        lastTickSlice = currentSlice;
        cyberAudio.playTick();

        // Tác động trực tiếp lên DOM kim để đạt 60fps mượt mà không re-render component
        if (needleRef.current) {
          needleRef.current.style.transform = 'rotate(16deg)';
          setTimeout(() => {
            if (needleRef.current) needleRef.current.style.transform = 'rotate(-5deg)';
          }, 30);
          setTimeout(() => {
            if (needleRef.current) needleRef.current.style.transform = 'rotate(0deg)';
          }, 60);
        }
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Hoàn tất lượt quay: ép đúng góc mục tiêu để kim chỉ chính xác 100% vào người trúng
        currentAngleRef.current = targetFinalAngle;
        drawWheel(targetFinalAngle);
        if (needleRef.current) {
          needleRef.current.style.transform = 'rotate(0deg)';
        }
        onSpinEnd(chosenWinner);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [isSpinning, candidates, numItems, sliceAngle, drawWheel, onSpinEnd]);

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      {/* Kim chỉ thị ở đỉnh 12h (Indicator Needle với CSS mượt mà) */}
      <div
        ref={needleRef}
        className="absolute -top-3 z-20 pointer-events-none transition-transform duration-75 origin-top"
        style={{ transform: 'rotate(0deg)' }}
      >
        <div className="relative flex flex-col items-center">
          {/* Mũi tên nhọn chỉ xuống */}
          <div className="w-0 h-0 border-x-[14px] border-x-transparent border-t-[32px] border-t-amber-400 drop-shadow-[0_4px_12px_rgba(245,158,11,0.9)]" />
          <div className="w-3.5 h-3.5 rounded-full bg-white border-2 border-amber-500 -mt-8 shadow-md" />
        </div>
      </div>

      {/* Canvas vòng quay sắc nét */}
      <canvas
        ref={canvasRef}
        width={480}
        height={480}
        className="w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] md:w-[460px] md:h-[460px] max-w-full aspect-square drop-shadow-2xl"
      />

      {/* Nút bấm tròn ở giữa vòng quay */}
      <button
        type="button"
        disabled={isSpinning || candidates.length === 0}
        onClick={onSpinStart}
        className={`absolute z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center font-display font-black text-xs sm:text-sm tracking-wider uppercase transition-all shadow-2xl active:scale-95 ${
          isSpinning
            ? 'bg-gradient-to-tr from-purple-800 to-indigo-800 text-purple-200 cursor-not-allowed opacity-90 animate-pulse'
            : candidates.length === 0
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
            : 'bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white hover:scale-105 ring-4 ring-white/20 shadow-amber-500/40'
        }`}
      >
        <span>{isSpinning ? 'ĐANG QUAY' : 'BẤM QUAY'}</span>
        <span className="text-[9px] font-sans font-normal opacity-80 mt-0.5">
          {candidates.length} bạn
        </span>
      </button>
    </div>
  );
};
