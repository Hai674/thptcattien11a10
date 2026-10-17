import React, { useEffect, useRef, useState } from 'react';

interface Star {
  x: number;
  y: number;
  radius: number;
  color: string;
  glowColor: string;
  vx: number;
  vy: number;
  alpha: number;
  baseAlpha: number;
  pulseSpeed: number;
  phase: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  alpha: number;
  decay: number;
  width: number;
  color: string;
  active: boolean;
}

export const BackgroundParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 600,
    y: typeof window !== 'undefined' ? window.innerHeight / 3 : 300,
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Bảng màu tinh tú cao cấp: Kim cương trắng, Lam ngọc, Vàng Champagne, Hồng ngọc
    const STAR_COLORS = [
      { fill: '#ffffff', glow: 'rgba(255, 255, 255, 0.85)' },
      { fill: '#a5f3fc', glow: 'rgba(103, 232, 249, 0.9)' },
      { fill: '#c7d2fe', glow: 'rgba(165, 180, 252, 0.85)' },
      { fill: '#fef08a', glow: 'rgba(253, 224, 71, 0.9)' },
      { fill: '#fbcfe8', glow: 'rgba(244, 114, 182, 0.8)' },
    ];

    // Số lượng hạt sao tinh vân vừa phải, sắc sảo
    const starCount = Math.min(Math.floor(width / 16), 85);
    const stars: Star[] = [];

    for (let i = 0; i < starCount; i++) {
      const colorScheme = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.3 + 0.4, // Kích thước tinh thể 0.4px - 1.7px
        color: colorScheme.fill,
        glowColor: colorScheme.glow,
        vx: (Math.random() - 0.5) * 0.1, // Chuyển động bồng bềnh rất chậm
        vy: (Math.random() - 0.5) * 0.1,
        alpha: Math.random() * 0.6 + 0.3,
        baseAlpha: Math.random() * 0.5 + 0.3,
        pulseSpeed: Math.random() * 0.02 + 0.008,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // ================= HỆ THỐNG MƯA SAO BĂNG ĐA TẦNG (METEOR SHOWER) =================
    // Cho phép nhiều sao băng bay đồng thời, chu kỳ sinh sao liên tục và dày dặn
    const MAX_ACTIVE_METEORS = 5;
    const meteors: ShootingStar[] = [];

    const METEOR_PALETTES = [
      'rgba(255, 255, 255, 1)', // Trắng tinh khôi
      'rgba(125, 211, 252, 1)', // Lam ngọc
      'rgba(196, 181, 253, 1)', // Tím pastel
      'rgba(253, 224, 71, 1)',  // Vàng champagne
    ];

    const spawnMeteor = (): ShootingStar => {
      // Xuất phát từ góc trên hoặc phía bên trái màn hình
      const startFromTop = Math.random() > 0.35;
      const x = startFromTop
        ? Math.random() * (width * 0.9)
        : -20;
      const y = startFromTop
        ? -20
        : Math.random() * (height * 0.45);

      const color = METEOR_PALETTES[Math.floor(Math.random() * METEOR_PALETTES.length)];
      const speed = Math.random() * 8 + 11; // 11px - 19px / frame lướt nhanh
      const length = Math.random() * 90 + 70; // 70px - 160px vệt đuôi

      return {
        x,
        y,
        length,
        speed,
        angle: (Math.PI / 5) + Math.random() * (Math.PI / 7), // Góc chéo 36° - 60°
        alpha: 1,
        decay: Math.random() * 0.012 + 0.014, // Tốc độ tan biến
        width: Math.random() * 1.2 + 1.2,
        color,
        active: true,
      };
    };

    // Khởi tạo một số sao băng sẵn sàng bay
    for (let i = 0; i < 3; i++) {
      meteors.push(spawnMeteor());
    }

    let lastSpawnTime = Date.now();

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Vẽ các hạt sao tinh vân lấp lánh tĩnh lặng
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];

        s.x += s.vx;
        s.y += s.vy;
        s.phase += s.pulseSpeed;

        if (s.x < 0) s.x = width;
        if (s.x > width) s.x = 0;
        if (s.y < 0) s.y = height;
        if (s.y > height) s.y = 0;

        // Hiệu ứng nhấp nháy tự nhiên
        s.alpha = s.baseAlpha + Math.sin(s.phase) * 0.28;
        const currentAlpha = Math.max(0.15, Math.min(0.95, s.alpha));

        ctx.save();
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = currentAlpha;

        if (s.radius > 1.0) {
          ctx.shadowColor = s.glowColor;
          ctx.shadowBlur = 8;
        }

        ctx.fill();
        ctx.restore();
      }

      // 2. Sinh sao băng mới thường xuyên (Cứ mỗi 0.8s - 1.6s lại có thêm 1 sao băng)
      const now = Date.now();
      const currentActiveCount = meteors.filter((m) => m.active).length;

      if (currentActiveCount < MAX_ACTIVE_METEORS && now - lastSpawnTime > (Math.random() * 800 + 700)) {
        meteors.push(spawnMeteor());
        lastSpawnTime = now;
      }

      // 3. Vẽ và cập nhật tất cả sao băng đang bay
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        if (!m.active) {
          meteors.splice(i, 1);
          continue;
        }

        const tailX = m.x - Math.cos(m.angle) * m.length;
        const tailY = m.y - Math.sin(m.angle) * m.length;

        // Dải gradient vuốt nhọn từ đuôi đến đầu sao
        const grad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        grad.addColorStop(0.65, m.color.replace('1)', '0.35)'));
        grad.addColorStop(1, m.color.replace('1)', `${m.alpha})`));

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(m.x, m.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = m.width;
        ctx.lineCap = 'round';
        ctx.shadowColor = m.color;
        ctx.shadowBlur = 10;
        ctx.stroke();

        // Đầu sao băng phát sáng lấp lánh (Spark head)
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.width * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.restore();

        // Di chuyển sao băng
        m.x += Math.cos(m.angle) * m.speed;
        m.y += Math.sin(m.angle) * m.speed;
        m.alpha -= m.decay;

        // Khi sao băng bay ra ngoài màn hình hoặc tan biến
        if (m.alpha <= 0 || m.x > width + 100 || m.y > height + 100) {
          m.active = false;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#060913]">
      {/* 1. Nền Cực Quang Xanh Ngọc (Emerald - Cyan Aurora Flare - Top Left) */}
      <div
        className="absolute -top-[10%] -left-[10%] w-[65vw] h-[65vw] max-w-[900px] max-h-[900px] rounded-full opacity-65 blur-[85px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.55) 0%, rgba(14, 116, 144, 0.35) 45%, transparent 75%)',
        }}
      />

      {/* 2. Cực Quang Tím Hoàng Gia (Royal Indigo & Violet Aurora - Top Right & Center) */}
      <div
        className="absolute -top-[5%] -right-[10%] w-[65vw] h-[65vw] max-w-[850px] max-h-[850px] rounded-full opacity-60 blur-[90px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.5) 0%, rgba(99, 102, 241, 0.35) 50%, transparent 75%)',
        }}
      />

      {/* 3. Vùng Phản Chiếu Kính Trung Tâm (Center Aurora Sheen for Liquid Glass) */}
      <div
        className="absolute top-[25%] left-[10%] w-[75vw] h-[55vw] max-w-[1100px] max-h-[800px] rounded-full opacity-55 blur-[95px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(79, 70, 229, 0.45) 0%, rgba(147, 51, 234, 0.28) 50%, transparent 75%)',
        }}
      />

      {/* 4. Ánh Sáng Ấm Áp Tuổi Học Trò (Warm Champagne & Rose Sheen - Bottom) */}
      <div
        className="absolute -bottom-[15%] left-1/2 -translate-x-1/2 w-[85vw] h-[55vw] max-w-[1200px] max-h-[750px] rounded-full opacity-50 blur-[95px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(244, 114, 182, 0.42) 0%, rgba(59, 130, 246, 0.3) 45%, transparent 75%)',
        }}
      />

      {/* 5. Quầng sáng tương tác theo con trỏ chuột mượt mà (Mouse Responsive Spotlight) */}
      <div
        className="absolute inset-0 transition-opacity duration-1000 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(56, 189, 248, 0.12) 0%, rgba(99, 102, 241, 0.06) 40%, transparent 70%)`,
        }}
      />

      {/* 5. Canvas bầu trời tinh tú và mưa sao băng lấp lánh */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

export default BackgroundParticles;
