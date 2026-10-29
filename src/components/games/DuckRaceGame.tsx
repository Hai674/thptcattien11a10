import React, { useRef, useEffect, useState, useCallback } from "react";
import { cyberAudio } from "@/utils/cyberAudio";
import { Trophy, RotateCcw, Play, Waves, Sparkles, Volume2 } from "lucide-react";

export interface DuckStudent {
  id: string;
  fullName: string;
  role?: string;
  group?: string;
}

interface DuckRaceGameProps {
  candidates: DuckStudent[];
  onSelectWinner: (winner: DuckStudent) => void;
  className?: string;
}

// Bảng màu sặc sỡ cho các chú vịt bơi đua
const DUCK_COLORS = [
  { body: "#facc15", beak: "#ea580c" }, // Vàng tươi mỏ cam
  { body: "#38bdf8", beak: "#ea580c" }, // Xanh cyan
  { body: "#f472b6", beak: "#be185d" }, // Hồng phấn
  { body: "#4ade80", beak: "#ea580c" }, // Xanh lá
  { body: "#fb923c", beak: "#c2410c" }, // Cam đào
  { body: "#c084fc", beak: "#7e22ce" }, // Tím pastel
  { body: "#2dd4bf", beak: "#0f766e" }, // Teal ngọc
  { body: "#f87171", beak: "#991b1b" }, // Đỏ san hô
];

interface DuckState {
  student: DuckStudent;
  x: number;
  y: number;
  speed: number;
  baseSpeed: number;
  colorIdx: number;
  rank: number;
  isWinner: boolean;
  bobOffset: number;
}

export const DuckRaceGame: React.FC<DuckRaceGameProps> = ({
  candidates,
  onSelectWinner,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number>(0);
  const ducksRef = useRef<DuckState[]>([]);
  const isRacingRef = useRef<boolean>(false);
  const winnerRef = useRef<DuckStudent | null>(null);

  const [raceState, setRaceState] = useState<"idle" | "countdown" | "racing" | "finished">("idle");
  const [countdown, setCountdown] = useState<number>(3);
  const [leaders, setLeaders] = useState<DuckStudent[]>([]);
  const [finishedWinner, setFinishedWinner] = useState<DuckStudent | null>(null);

  const count = candidates.length;

  // Khởi tạo vị trí đàn vịt ở vạch xuất phát
  const initDucks = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const height = canvas.height;
    const paddingY = 45;
    const usableHeight = height - paddingY * 2;
    const spacing = count > 1 ? usableHeight / (count - 1) : usableHeight / 2;

    const initialDucks: DuckState[] = candidates.map((student, i) => {
      const startX = 40 + (Math.random() - 0.5) * 20;
      const startY = count <= 1 ? height / 2 : paddingY + i * spacing;
      return {
        student,
        x: startX,
        y: startY,
        speed: 0,
        baseSpeed: 1.4 + Math.random() * 0.4,
        colorIdx: i % DUCK_COLORS.length,
        rank: i + 1,
        isWinner: false,
        bobOffset: Math.random() * Math.PI * 2,
      };
    });

    ducksRef.current = initialDucks;
    setLeaders(candidates.slice(0, 3));
    setFinishedWinner(null);
  }, [candidates, count]);

  // Vẽ hình ảnh chú vịt cao su
  const drawDuck = (
    ctx: CanvasRenderingContext2D,
    duck: DuckState,
    time: number,
    isFirst: boolean
  ) => {
    const { x, y, student, colorIdx, isWinner, bobOffset } = duck;
    const color = DUCK_COLORS[colorIdx];
    const bob = Math.sin(time * 6 + bobOffset) * 2.5;
    const duckY = y + bob;

    ctx.save();
    ctx.translate(x, duckY);

    // 1. Gợn sóng nước lăn tăn sau đuôi vịt
    if (raceState === "racing") {
      ctx.beginPath();
      ctx.ellipse(-12, 6, 8, 3, 0, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.fill();
    }

    // 2. Thân vịt cao su
    ctx.beginPath();
    ctx.ellipse(0, 0, 13, 10, 0, 0, 2 * Math.PI);
    ctx.fillStyle = color.body;
    ctx.fill();
    ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Đuôi vịt vểnh lên
    ctx.beginPath();
    ctx.moveTo(-11, -2);
    ctx.lineTo(-17, -7);
    ctx.lineTo(-9, 4);
    ctx.fillStyle = color.body;
    ctx.fill();

    // 3. Đầu vịt
    ctx.beginPath();
    ctx.arc(8, -7, 7, 0, 2 * Math.PI);
    ctx.fillStyle = color.body;
    ctx.fill();
    ctx.stroke();

    // Mắt vịt to tròn
    ctx.beginPath();
    ctx.arc(10, -9, 2, 0, 2 * Math.PI);
    ctx.fillStyle = "#0f172a";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(10.5, -9.5, 0.7, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    // Mỏ vịt cam
    ctx.beginPath();
    ctx.moveTo(14, -7);
    ctx.lineTo(21, -5);
    ctx.lineTo(14, -3);
    ctx.closePath();
    ctx.fillStyle = color.beak;
    ctx.fill();

    // Cánh vịt
    ctx.beginPath();
    ctx.ellipse(-2, 0, 6, 4, 0.2, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
    ctx.fill();

    // Vương miện vàng nếu là vịt dẫn đầu hoặc thắng cuộc
    if (isWinner || (isFirst && raceState === "racing" && x > 200)) {
      ctx.save();
      ctx.translate(8, -16);
      ctx.beginPath();
      ctx.moveTo(-5, 0);
      ctx.lineTo(-6, -6);
      ctx.lineTo(-2, -3);
      ctx.lineTo(0, -8);
      ctx.lineTo(2, -3);
      ctx.lineTo(6, -6);
      ctx.lineTo(5, 0);
      ctx.closePath();
      ctx.fillStyle = "#facc15";
      ctx.shadowColor = "#f59e0b";
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();
    }

    // 4. Bảng tên học sinh nổi trên đầu vịt
    ctx.save();
    ctx.translate(0, -14);
    const shortName = student.fullName.split(" ").slice(-2).join(" ");
    const textWidth = ctx.measureText(shortName).width;

    ctx.fillStyle = isWinner ? "rgba(245, 158, 11, 0.95)" : "rgba(15, 23, 42, 0.85)";
    ctx.beginPath();
    ctx.roundRect(-textWidth / 2 - 4, -8, textWidth + 8, 11, 3);
    ctx.fill();
    ctx.strokeStyle = isWinner ? "#ffffff" : "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.font = '700 8.5px "Be Vietnam Pro", sans-serif';
    ctx.fillStyle = isWinner ? "#0f172a" : "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(shortName, 0, -2.5);
    ctx.restore();

    ctx.restore();
  };

  // Vòng lặp vẽ khung cảnh dòng sông đua vịt
  const render = useCallback(
    (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const finishX = width - 75;

      ctx.clearRect(0, 0, width, height);

      // 1. Làn nước sông xanh Cyber Gradient
      const waterGrad = ctx.createLinearGradient(0, 0, 0, height);
      waterGrad.addColorStop(0, "#082f49");
      waterGrad.addColorStop(0.5, "#0369a1");
      waterGrad.addColorStop(1, "#075985");
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Các đợt sóng nước cuộn nhẹ
      ctx.strokeStyle = "rgba(56, 189, 248, 0.2)";
      ctx.lineWidth = 2;
      for (let wave = 0; wave < 6; wave++) {
        const wy = 40 + wave * 75;
        ctx.beginPath();
        for (let wx = 0; wx < width; wx += 20) {
          const dy = Math.sin((wx + time * 60 + wave * 50) * 0.02) * 4;
          if (wx === 0) ctx.moveTo(wx, wy + dy);
          else ctx.lineTo(wx, wy + dy);
        }
        ctx.stroke();
      }

      // 3. Bờ cỏ xanh 2 bên bờ sông
      const bankHeight = 18;
      ctx.fillStyle = "#14532d";
      ctx.fillRect(0, 0, width, bankHeight);
      ctx.fillRect(0, height - bankHeight, width, bankHeight);
      ctx.fillStyle = "#22c55e";
      ctx.fillRect(0, bankHeight - 3, width, 3);
      ctx.fillRect(0, height - bankHeight, width, 3);

      // 4. Vạch xuất phát (Start Line)
      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(60, bankHeight);
      ctx.lineTo(60, height - bankHeight);
      ctx.stroke();
      ctx.restore();

      ctx.font = '800 10px "JetBrains Mono", monospace';
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.fillText("START", 45, bankHeight + 14);

      // 5. Vạch đích (Finish Line ca-rô thể thao)
      const checkerSize = 8;
      const numCheckers = Math.floor((height - bankHeight * 2) / checkerSize);
      for (let c = 0; c < numCheckers; c++) {
        for (let col = 0; col < 2; col++) {
          ctx.fillStyle = (c + col) % 2 === 0 ? "#ffffff" : "#0f172a";
          ctx.fillRect(finishX + col * checkerSize, bankHeight + c * checkerSize, checkerSize, checkerSize);
        }
      }

      // Cờ đích trên cao
      ctx.font = '800 11px "JetBrains Mono", monospace';
      ctx.fillStyle = "#facc15";
      ctx.fillText("FINISH 🏁", finishX - 18, bankHeight + 14);

      // 6. Cập nhật vị trí đàn vịt và vẽ từng chú vịt
      const sortedDucks = [...ducksRef.current].sort((a, b) => b.x - a.x);
      const leadDuck = sortedDucks[0];

      ducksRef.current.forEach((duck) => {
        if (isRacingRef.current && raceState === "racing") {
          // Gia tốc sóng nước ngẫu nhiên tạo kịch tính
          const surge = Math.random() < 0.04 ? 1.5 + Math.random() * 2 : 0;
          duck.speed = duck.baseSpeed + surge;

          // Vịt dẫn đầu nếu là người thắng cuộc sẽ được ưu tiên bứt phá đoạn cuối
          if (winnerRef.current && duck.student.id === winnerRef.current.id && duck.x > width * 0.65) {
            duck.speed += 0.8;
          }

          duck.x += duck.speed;

          // Kiểm tra cán đích
          if (duck.x >= finishX && !winnerRef.current) {
            winnerRef.current = duck.student;
            duck.isWinner = true;
            isRacingRef.current = false;
            setRaceState("finished");
            setFinishedWinner(duck.student);
            cyberAudio.playQuack();

            // Độ trễ 1.8 giây hồi hộp trước khi kích hoạt bảng chúc mừng
            setTimeout(() => {
              onSelectWinner(duck.student);
            }, 1800);
          }
        }

        drawDuck(ctx, duck, time, leadDuck?.student.id === duck.student.id);
      });

      // Cập nhật Top 3 dẫn đầu cho thanh hiển thị HUD
      if (raceState === "racing") {
        setLeaders(sortedDucks.slice(0, 3).map((d) => d.student));
      }
    },
    [raceState, onSelectWinner]
  );

  // Vòng lặp Animation Frame
  useEffect(() => {
    let startTime = performance.now();
    const loop = (now: number) => {
      const time = (now - startTime) / 1000;
      render(time);
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animRef.current);
  }, [render]);

  useEffect(() => {
    initDucks();
  }, [initDucks]);

  // Bắt đầu cuộc đua với đếm ngược 3, 2, 1, XUẤT PHÁT!
  const handleStartRace = () => {
    if (raceState === "racing" || candidates.length === 0) return;
    initDucks();
    winnerRef.current = null;
    setRaceState("countdown");
    setCountdown(3);
    cyberAudio.playTick();

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setRaceState("racing");
          isRacingRef.current = true;
          cyberAudio.playQuack();
          return 0;
        }
        cyberAudio.playTick();
        return prev - 1;
      });
    }, 800);
  };

  const handleReset = () => {
    isRacingRef.current = false;
    winnerRef.current = null;
    setRaceState("idle");
    initDucks();
  };

  return (
    <div className={`w-full max-w-4xl mx-auto flex flex-col items-center space-y-3 ${className}`}>
      {/* 1. Thanh HUD dẫn đầu đường đua */}
      <div className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Waves className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-200">
            Cuộc đua vịt 11A10: <strong className="text-amber-400">{candidates.length} chú vịt</strong>
          </span>
        </div>

        {raceState === "racing" && leaders.length > 0 && (
          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-300">
            <span className="text-amber-400 font-bold">TOP 1:</span>
            <span className="text-white font-bold bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-400/40 animate-pulse">
              {leaders[0]?.fullName}
            </span>
          </div>
        )}

        {raceState === "finished" && finishedWinner && (
          <div className="flex items-center gap-1.5 font-bold text-amber-300 animate-bounce">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>VỊT VỀ ĐÍCH: {finishedWinner.fullName} 🎉</span>
          </div>
        )}
      </div>

      {/* 2. Khung vẽ Canvas dòng sông */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[2.1/1] rounded-2xl overflow-hidden border-2 border-cyan-500/30 shadow-[0_15px_40px_rgba(0,0,0,0.8)] bg-slate-950">
        <canvas
          ref={canvasRef}
          width={960}
          height={480}
          className="w-full h-full object-cover block"
        />

        {/* Màn hình đếm ngược 3, 2, 1 */}
        {raceState === "countdown" && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="text-center space-y-2">
              <span className="text-6xl sm:text-8xl font-black font-mono text-amber-400 drop-shadow-[0_0_30px_rgba(245,158,11,0.9)] animate-ping">
                {countdown > 0 ? countdown : "GO!"}
              </span>
              <p className="text-sm font-bold text-white tracking-widest uppercase">
                {countdown > 0 ? "Chuẩn bị xuất phát..." : "XUẤT PHÁT!"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3. Nút điều khiển cuộc đua */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
        <button
          type="button"
          disabled={raceState === "racing" || raceState === "countdown" || candidates.length === 0}
          onClick={handleStartRace}
          className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-display font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-xl flex items-center gap-2 active:scale-95 ${
            raceState === "racing" || raceState === "countdown"
              ? "bg-slate-800 text-slate-400 cursor-not-allowed"
              : candidates.length === 0
              ? "bg-slate-800 text-slate-500 cursor-not-allowed"
              : "bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black shadow-amber-500/30 hover:shadow-amber-500/50 cursor-pointer hover:scale-105"
          }`}
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{raceState === "racing" ? "Đang đua vịt..." : `Bắt đầu đua vịt (${candidates.length} bạn)`}</span>
        </button>

        {raceState === "finished" && (
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 sm:py-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Đua lại lượt mới</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default DuckRaceGame;
