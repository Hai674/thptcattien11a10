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

// Bảng 12 màu Cyber Modern hài hòa, có chiều sâu 3D gradient cao cấp
const PALETTE = [
  { base: '#3b82f6', dark: '#1d4ed8' }, // Sapphire Blue
  { base: '#06b6d4', dark: '#0891b2' }, // Neon Cyan
  { base: '#10b981', dark: '#047857' }, // Emerald Glow
  { base: '#8b5cf6', dark: '#6d28d9' }, // Cyber Violet
  { base: '#f59e0b', dark: '#d97706' }, // Amber Gold
  { base: '#ec4899', dark: '#be185d' }, // Neon Pink
  { base: '#6366f1', dark: '#4338ca' }, // Electric Indigo
  { base: '#14b8a6', dark: '#0f766e' }, // Teal Wave
  { base: '#f97316', dark: '#c2410c' }, // Bright Orange
  { base: '#a855f7', dark: '#7e22ce' }, // Bright Purple
  { base: '#0284c7', dark: '#0369a1' }, // Deep Sky
  { base: '#f43f5e', dark: '#be123c' }, // Crimson Rose
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

  // Vẽ toàn bộ vòng quay lên Canvas với độ phân giải cao 900x900 (siêu sắc nét Retina)
  const drawWheel = useCallback(
    (angle: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = canvas.width;
      const center = size / 2;
      const radius = center - 36;
      const hubRadius = 68;

      ctx.clearRect(0, 0, size, size);

      // 1. Vòng viền ngoài phản quang phát sáng (Outer Rim)
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, radius + 14, 0, 2 * Math.PI);
      ctx.fillStyle = '#090d16';
      ctx.shadowColor = 'rgba(99, 102, 241, 0.6)';
      ctx.shadowBlur = 24;
      ctx.fill();

      // Viền gradient đa sắc hiện đại
      const rimGradient = ctx.createLinearGradient(0, 0, size, size);
      rimGradient.addColorStop(0, '#38bdf8');
      rimGradient.addColorStop(0.3, '#818cf8');
      rimGradient.addColorStop(0.6, '#ec4899');
      rimGradient.addColorStop(1, '#f59e0b');
      ctx.strokeStyle = rimGradient;
      ctx.lineWidth = 10;
      ctx.stroke();
      ctx.restore();

      // 2. Vẽ từng nan quạt (Slices) với gradient chiều sâu
      candidates.forEach((student, i) => {
        const start = angle + i * sliceAngle;
        const end = start + sliceAngle;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, radius, start, end);
        ctx.closePath();

        // Màu nan quạt dạng Gradient xuyên tâm (tối ở trong, sáng rực ở rìa ngoài)
        const color = PALETTE[i % PALETTE.length];
        const sliceGrad = ctx.createRadialGradient(center, center, hubRadius, center, center, radius);
        sliceGrad.addColorStop(0, color.dark);
        sliceGrad.addColorStop(1, color.base);
        ctx.fillStyle = sliceGrad;
        ctx.fill();

        // Viền nan quạt thủy tinh thanh mảnh
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Đèn bóng tròn nhỏ ở vành nan quạt (Peg bulbs phát sáng)
        const pegAngle = start;
        const pegX = center + Math.cos(pegAngle) * (radius + 6);
        const pegY = center + Math.sin(pegAngle) * (radius + 6);
        ctx.beginPath();
        ctx.arc(pegX, pegY, 3.5, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#fef08a';
        ctx.shadowBlur = 8;
        ctx.fill();

        // 3. TÊN HỌC SINH XOAY HƯỚNG TÂM - ĐẦY ĐỦ 100%, KHÔNG CẮT NGẮN THÀNH '...'
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(start + sliceAngle / 2);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';

        const rawName = student.fullName.trim();

        // Tính toán cỡ chữ linh hoạt để VỪA KHÍT 100% không bao giờ bị cắt '...'
        let fontSize = numItems > 38 ? 12.5 : numItems > 25 ? 14 : 16;
        ctx.font = `700 ${fontSize}px "Inter", "Segoe UI", -apple-system, sans-serif`;

        // Khoảng cách tối đa từ viền vào gần trục
        const maxTextWidth = radius - hubRadius - 20;
        let textWidth = ctx.measureText(rawName).width;

        while (textWidth > maxTextWidth && fontSize > 9) {
          fontSize -= 0.5;
          ctx.font = `700 ${fontSize}px "Inter", "Segoe UI", -apple-system, sans-serif`;
          textWidth = ctx.measureText(rawName).width;
        }

        // Bóng chữ sắc nét bảo đảm đọc rõ ràng trên mọi nền màu
        ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        // Vẽ trọn vẹn tên học sinh từ mép ngoài hướng vào tâm
        ctx.fillText(rawName, radius - 22, 0);
        ctx.restore();

        ctx.restore();
      });

      // 4. Trục xoay trung tâm (Center Hub)
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, hubRadius, 0, 2 * Math.PI);
      const hubGradient = ctx.createRadialGradient(center, center, 8, center, center, hubRadius);
      hubGradient.addColorStop(0, '#0f172a');
      hubGradient.addColorStop(1, '#020617');
      ctx.fillStyle = hubGradient;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 20;
      ctx.fill();

      // Viền trục trung tâm phát sáng
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Vòng tròn phụ bên trong
      ctx.beginPath();
      ctx.arc(center, center, hubRadius - 8, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Logo chữ 11A10 ở trục giữa
      ctx.fillStyle = '#38bdf8';
      ctx.font = '900 19px "Montserrat", "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(56, 189, 248, 0.9)';
      ctx.shadowBlur = 12;
      ctx.fillText('11A10', center, center);
      ctx.restore();
    },
    [candidates, numItems, sliceAngle]
  );

  // Vẽ lần đầu và khi candidates thay đổi
  useEffect(() => {
    drawWheel(currentAngleRef.current);
  }, [drawWheel]);

  // Vòng lặp vật lý khi quay (Physics Spin Animation với thuật toán định tâm chuẩn xác 100%)
  useEffect(() => {
    if (!isSpinning || candidates.length === 0) return;

    // 1. CHỌN TRƯỚC NGƯỜI TRÚNG GIẢI NGẪU NHIÊN 100%
    const winnerIndex = Math.floor(Math.random() * candidates.length);
    const chosenWinner = candidates[winnerIndex];

    // 2. TÍNH TOÁN GÓC DỪNG CHÍNH XÁC VÀO TÂM CỦA NAN QUẠT NGƯỜI TRÚNG
    // Mũi kim đặt ở đỉnh 12h: góc = 3 * PI / 2 = 1.5 * PI
    const pointerAngle = 1.5 * Math.PI;

    // Vị trí tâm của nan quạt winner: (winnerIndex + 0.5) * sliceAngle
    // Ta thêm 1 độ lệch vi sai an toàn (jitter) trong khoảng ±20% để trông tự nhiên
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

        // Tác động trực tiếp lên DOM kim để đạt 60fps mượt mà
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
      {/* Kim chỉ thị phong cách Cyber Neon ở đỉnh 12h */}
      <div
        ref={needleRef}
        className="absolute -top-4 z-20 pointer-events-none transition-transform duration-75 origin-top filter drop-shadow-[0_6px_14px_rgba(245,158,11,0.7)]"
        style={{ transform: 'rotate(0deg)' }}
      >
        <div className="relative flex flex-col items-center">
          {/* Mũi tên đa giác neon sắc sảo */}
          <svg width="34" height="46" viewBox="0 0 34 46" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M17 46L2 12C0 8 3 0 8 0H26C31 0 34 8 32 12L17 46Z"
              fill="url(#needleGrad)"
              stroke="#ffffff"
              strokeWidth="2"
            />
            <defs>
              <linearGradient id="needleGrad" x1="17" y1="0" x2="17" y2="46" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fbbf24" />
                <stop offset="0.6" stopColor="#f59e0b" />
                <stop offset="1" stopColor="#ea580c" />
              </linearGradient>
            </defs>
          </svg>
          {/* Tâm kim phát sáng ngọc amber */}
          <div className="absolute top-2.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-amber-600 shadow-[0_0_8px_#ffffff]" />
        </div>
      </div>

      {/* Canvas vòng quay sắc nét 900x900 */}
      <canvas
        ref={canvasRef}
        width={900}
        height={900}
        className="w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] md:w-[480px] md:h-[480px] max-w-full aspect-square drop-shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
      />

      {/* Nút bấm tròn trung tâm Holographic Core */}
      <button
        type="button"
        disabled={isSpinning || candidates.length === 0}
        onClick={onSpinStart}
        className={`absolute z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center font-display font-black tracking-wider uppercase transition-all duration-300 shadow-2xl active:scale-95 group ${
          isSpinning
            ? 'bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/60 text-indigo-300 cursor-not-allowed opacity-90 animate-pulse shadow-[0_0_25px_rgba(99,102,241,0.5)]'
            : candidates.length === 0
            ? 'bg-slate-900 text-slate-500 border border-white/10 cursor-not-allowed'
            : 'bg-gradient-to-tr from-slate-950 via-indigo-950 to-cyan-950 hover:from-indigo-900 hover:to-cyan-900 text-white border-2 border-cyan-400/80 hover:border-cyan-300 hover:scale-105 shadow-[0_0_25px_rgba(6,182,212,0.45)] ring-4 ring-white/10'
        }`}
      >
        <span className="text-xs sm:text-sm font-black bg-gradient-to-r from-amber-300 via-white to-cyan-300 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
          {isSpinning ? 'ĐANG QUAY' : 'BẤM QUAY'}
        </span>
        <span className="text-[9px] font-sans font-medium text-cyan-300/80 mt-0.5">
          {candidates.length} bạn
        </span>
      </button>
    </div>
  );
};

export default LuckyWheelCanvas;
