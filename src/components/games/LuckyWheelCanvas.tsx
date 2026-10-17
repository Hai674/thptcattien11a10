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

// Bảng màu vòng quay Midnight Cosmic cao cấp: Dịu mắt, sang trọng, độ tương phản tuyệt đối giúp chữ trắng nổi bật 100%
const PALETTE = [
  // 1. Deep Royal Sapphire (Xanh Sapphire thẫm)
  { base: '#1e3a8a', dark: '#0c1a3b' },
  // 2. Cosmic Dark Slate (Đá phiến than chì huyền bí)
  { base: '#1e293b', dark: '#050a14' },
  // 3. Midnight Galaxy Indigo (Tím than vũ trụ sâu lắng)
  { base: '#312e81', dark: '#0e0c26' },
  // 4. Deep Oceanic Teal (Xanh ngọc biển đêm dịu mát)
  { base: '#0f4c5c', dark: '#06232b' },
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
      ctx.shadowColor = 'rgba(59, 130, 246, 0.45)';
      ctx.shadowBlur = 24;
      ctx.fill();

      // Viền gradient Sapphire - Cyan thanh lịch đồng bộ với website
      const rimGradient = ctx.createLinearGradient(0, 0, size, size);
      rimGradient.addColorStop(0, '#38bdf8');
      rimGradient.addColorStop(0.5, '#6366f1');
      rimGradient.addColorStop(1, '#06b6d4');
      ctx.strokeStyle = rimGradient;
      ctx.lineWidth = 8;
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

        // Màu nan quạt dạng Gradient xuyên tâm dịu mắt, độ tương phản chữ trắng cực cao
        const color = PALETTE[i % PALETTE.length];
        const sliceGrad = ctx.createRadialGradient(center, center, hubRadius, center, center, radius);
        sliceGrad.addColorStop(0, color.dark);
        sliceGrad.addColorStop(1, color.base);
        ctx.fillStyle = sliceGrad;
        ctx.fill();

        // Viền nan quạt thủy tinh thanh mảnh
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Đèn ngọc tròn nhỏ ở vành nan quạt (Cyan diamond bulbs)
        const pegAngle = start;
        const pegX = center + Math.cos(pegAngle) * (radius + 6);
        const pegY = center + Math.sin(pegAngle) * (radius + 6);
        ctx.beginPath();
        ctx.arc(pegX, pegY, 3, 0, 2 * Math.PI);
        ctx.fillStyle = '#bae6fd';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 6;
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
      {/* Kim chỉ thị phong cách Cyber Ruby ở đỉnh 12h */}
      <div
        ref={needleRef}
        className="absolute -top-3.5 z-20 pointer-events-none transition-transform duration-75 origin-top filter drop-shadow-[0_4px_12px_rgba(244,63,94,0.6)]"
        style={{ transform: 'rotate(0deg)' }}
      >
        <div className="relative flex flex-col items-center">
          {/* Mũi tên tam giác định vị sắc nét */}
          <svg width="26" height="38" viewBox="0 0 26 38" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M13 38L1 6C-0.5 3 1.5 0 5 0H21C24.5 0 26.5 3 25 6L13 38Z"
              fill="url(#needleGrad)"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
            <defs>
              <linearGradient id="needleGrad" x1="13" y1="0" x2="13" y2="38" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fb7185" />
                <stop offset="0.6" stopColor="#e11d48" />
                <stop offset="1" stopColor="#9f1239" />
              </linearGradient>
            </defs>
          </svg>
          {/* Điểm ngọc định vị phát sáng trắng */}
          <div className="absolute top-2 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
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
            : 'bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 hover:from-indigo-950 hover:to-blue-950 text-white border-2 border-cyan-400/70 hover:border-cyan-300 hover:scale-105 shadow-[0_0_25px_rgba(6,182,212,0.4)] ring-4 ring-white/10'
        }`}
      >
        <span className="text-xs sm:text-sm font-black text-white group-hover:text-cyan-200 transition-colors">
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
