import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import confetti from "canvas-confetti";
import { DEFAULT_11A10_STUDENTS } from "@/data/classDefaultStudents";

// Kiểu dữ liệu học sinh
export interface Student {
  id: string;
  fullName: string;
  role?: string;
  group?: string;
}

export interface RandomStudentPickerProps {
  isOpen: boolean;
  onClose: () => void;
  studentsList?: Student[];
}

// Bảng màu rực rỡ cho vòng quay
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

// Hệ thống âm thanh Web Audio API (không cần tải file mp3 ngoài)
class SoundEffects {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext() {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioClass) this.ctx = new AudioClass();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playClick() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {}
  }

  playTick() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(550, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.03);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.03);
    } catch {}
  }

  playFanfare() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.06, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.25);
      });
    } catch {}
  }
}

const sfx = new SoundEffects();

// ==========================================
// 1. CHẾ ĐỘ 🎡 VÒNG QUAY (ĐÃ TỐI ƯU HỒI HỘP)
// ==========================================
interface WheelProps {
  candidates: Student[];
  isSpinning: boolean;
  onSpinStart: () => void;
  onSpinEnd: (winner: Student) => void;
}

const LuckyWheelMode: React.FC<WheelProps> = ({ candidates, isSpinning, onSpinStart, onSpinEnd }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const needleRef = useRef<HTMLDivElement | null>(null);
  const currentAngleRef = useRef<number>(0);
  const animFrameRef = useRef<number>(0);
  const delayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [highlightIdx, setHighlightIdx] = useState<number | null>(null);
  const [isWaiting, setIsWaiting] = useState(false);

  const count = Math.max(candidates.length, 1);
  const arc = (2 * Math.PI) / count;

  const drawWheel = useCallback(
    (rotation: number, winIdx: number | null = null) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const size = canvas.width;
      const center = size / 2;
      const radius = center - 36;
      const innerRadius = 75;

      ctx.clearRect(0, 0, size, size);

      // Viền ngoài
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

      // Nan quạt
      candidates.forEach((st, i) => {
        const start = rotation + i * arc;
        const end = start + arc;
        const isWinner = winIdx === i;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, radius, start, end);
        ctx.closePath();

        const color = SLICE_COLORS[i % SLICE_COLORS.length];
        const radGrad = ctx.createRadialGradient(center, center, innerRadius, center, center, radius);

        if (isWinner) {
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

        // Chữ học sinh
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(start + arc / 2);
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";

        if (count > 28) {
          ctx.fillStyle = isWinner ? "#1e1b4b" : "#ffffff";
          ctx.font = '800 13px "JetBrains Mono", monospace';
          ctx.fillText(String(i + 1), radius - 12, 0);

          ctx.font = '600 11px "Be Vietnam Pro", sans-serif';
          const shortName = st.fullName.split(" ").slice(-2).join(" ");
          ctx.fillStyle = isWinner ? "#0f172a" : "rgba(255, 255, 255, 0.9)";
          ctx.fillText(shortName, radius - 38, 0);
        } else {
          ctx.fillStyle = isWinner ? "#0f172a" : "#ffffff";
          ctx.font = '700 13.5px "Be Vietnam Pro", sans-serif';
          ctx.fillText(st.fullName, radius - 20, 0);
        }

        ctx.restore();
        ctx.restore();
      });

      // Trục tâm
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

  useEffect(() => {
    drawWheel(currentAngleRef.current, highlightIdx);
  }, [drawWheel, highlightIdx]);

  useEffect(() => {
    if (!isSpinning || candidates.length === 0) return;

    setHighlightIdx(null);
    setIsWaiting(false);

    const winIdx = Math.floor(Math.random() * candidates.length);
    const winStudent = candidates[winIdx];
    const pointer = 1.5 * Math.PI;
    const targetSlice = (winIdx + 0.5) * arc;

    let targetRot = (pointer - targetSlice) % (2 * Math.PI);
    if (targetRot < 0) targetRot += 2 * Math.PI;

    const startRot = currentAngleRef.current;
    const normStart = ((startRot % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

    let delta = targetRot - normStart;
    if (delta <= 0) delta += 2 * Math.PI;

    const fullSpins = 6 + Math.floor(Math.random() * 3);
    const totalRotation = delta + fullSpins * 2 * Math.PI;
    const finalRot = startRot + totalRotation;

    const duration = 5200;
    const startTime = performance.now();
    let lastSlice = -1;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 2.9); // Easing mềm kịch tính
      const currentRot = startRot + totalRotation * ease;

      currentAngleRef.current = currentRot;
      drawWheel(currentRot);

      const sliceUnderPointer = Math.floor(
        ((((pointer - currentRot) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) / arc
      );

      if (sliceUnderPointer !== lastSlice) {
        lastSlice = sliceUnderPointer;
        sfx.playTick();
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
        currentAngleRef.current = finalRot;
        setHighlightIdx(winIdx);
        setIsWaiting(true);
        drawWheel(finalRot, winIdx);

        // DELAY HỒI HỘP 1.8S TRƯỚC KHI BẬT POPUP
        delayTimerRef.current = setTimeout(() => {
          setIsWaiting(false);
          onSpinEnd(winStudent);
        }, 1800);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
    };
  }, [isSpinning, candidates, arc, drawWheel, onSpinEnd]);

  return (
    <div className="relative inline-flex items-center justify-center select-none">
      {/* Kim chỉ */}
      <div
        ref={needleRef}
        className="absolute -top-4 z-20 pointer-events-none transition-transform duration-100 origin-top filter drop-shadow-[0_6px_14px_rgba(245,158,11,0.8)]"
      >
        <svg width="34" height="46" viewBox="0 0 34 46" fill="none">
          <path d="M17 46L2 12C0 8 3 0 8 0H26C31 0 34 8 32 12L17 46Z" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
        </svg>
      </div>

      <canvas
        ref={canvasRef}
        width={900}
        height={900}
        className="w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] md:w-[480px] md:h-[480px] max-w-full aspect-square drop-shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
      />

      {/* Nút quay trung tâm */}
      <button
        type="button"
        disabled={isSpinning || isWaiting || candidates.length === 0}
        onClick={onSpinStart}
        className={`absolute z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center font-black text-xs sm:text-sm tracking-wider uppercase transition-all shadow-2xl active:scale-95 border-2 border-amber-400/50 ${
          isSpinning || isWaiting
            ? "bg-purple-800 text-purple-200 cursor-not-allowed animate-pulse"
            : "bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 text-white hover:scale-105 cursor-pointer shadow-amber-500/40"
        }`}
      >
        <span>{isSpinning ? "ĐANG QUAY" : isWaiting ? "HỒI HỘP..." : "BẤM QUAY"}</span>
        <span className="text-[10px] font-normal opacity-85 mt-0.5">{candidates.length} bạn</span>
      </button>
    </div>
  );
};

// ==========================================
// 2. CHẾ ĐỘ 🎰 XÈNG SỐ (CÓ DELAY HỒI HỘP)
// ==========================================
const SlotMachineMode: React.FC<WheelProps> = ({ candidates, isSpinning, onSpinStart, onSpinEnd }) => {
  const [displayNumber, setDisplayNumber] = useState<string>("??");
  const [displayName, setDisplayName] = useState<string>("Sẵn sàng quay số...");
  const [displayRole, setDisplayRole] = useState<string>("Lớp 11A10 THPT Cát Tiên");

  useEffect(() => {
    if (!isSpinning || candidates.length === 0) return;

    let step = 0;
    const maxSteps = 42;
    let speed = 40;
    let timer: NodeJS.Timeout;

    const roll = () => {
      step++;
      const randIdx = Math.floor(Math.random() * candidates.length);
      const randStudent = candidates[randIdx];

      setDisplayNumber(String(randIdx + 1).padStart(2, "0"));
      setDisplayName(randStudent.fullName);
      setDisplayRole(randStudent.role || "Học sinh 11A10");
      sfx.playTick();

      if (step < maxSteps) {
        if (step > maxSteps - 8) speed += 45;
        else if (step > maxSteps - 16) speed += 18;
        timer = setTimeout(roll, speed);
      } else {
        // Chốt học sinh trúng giải
        const finalWinner = candidates[Math.floor(Math.random() * candidates.length)];
        const finalIndex = candidates.findIndex((k) => k.id === finalWinner.id);

        setDisplayNumber(String(finalIndex >= 0 ? finalIndex + 1 : 1).padStart(2, "0"));
        setDisplayName(finalWinner.fullName);
        setDisplayRole(finalWinner.role || "Học sinh 11A10");

        // DỪNG LẠI CHO CẢ LỚP NHÌN RÕ CON SỐ VÀ TÊN TRONG 1.6S RỒI MỚI BẬT POPUP
        setTimeout(() => {
          onSpinEnd(finalWinner);
        }, 1600);
      }
    };

    timer = setTimeout(roll, speed);
    return () => clearTimeout(timer);
  }, [isSpinning, candidates, onSpinEnd]);

  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-3xl bg-slate-950/80 border border-indigo-500/30 shadow-2xl backdrop-blur-xl text-center space-y-6">
      <div className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-widest">
        11A10 CYBER LOTTO ROLLER
      </div>

      <div className="p-6 rounded-2xl bg-black/80 border-2 border-indigo-500/40 space-y-3 relative overflow-hidden">
        <div className={`font-mono font-black text-6xl tracking-wider transition-all ${
          isSpinning ? "text-cyan-400 scale-105" : "text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]"
        }`}>
          {displayNumber}
        </div>
        <div className={`font-bold text-2xl sm:text-3xl min-h-[40px] flex items-center justify-center ${
          isSpinning ? "text-indigo-300" : "text-white"
        }`}>
          {displayName}
        </div>
        <div className="text-xs font-mono text-slate-400">{displayRole}</div>
      </div>

      <button
        type="button"
        disabled={isSpinning || candidates.length === 0}
        onClick={onSpinStart}
        className={`w-full py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-xl ${
          isSpinning || candidates.length === 0
            ? "bg-slate-800 text-slate-400 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white hover:scale-102 cursor-pointer"
        }`}
      >
        {isSpinning ? "Đang quay số xèng..." : `Gạt cần quay số (${candidates.length} bạn)`}
      </button>
    </div>
  );
};

// ==========================================
// 3. CHẾ ĐỘ 🃏 46 THẺ BÀI MA THUẬT
// ==========================================
interface CardPickerProps {
  candidates: Student[];
  onSelectWinner: (winner: Student) => void;
}

const CardPickerMode: React.FC<CardPickerProps> = ({ candidates, onSelectWinner }) => {
  const [selectedCardIdx, setSelectedCardIdx] = useState<number | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [deck, setDeck] = useState<(Student & { cardNo: number })[]>([]);

  const shuffle = useCallback((list: Student[]) => {
    const arr = [...list];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.map((item, idx) => ({ ...item, cardNo: idx + 1 }));
  }, []);

  useEffect(() => {
    setSelectedCardIdx(null);
    setDeck(shuffle(candidates));
  }, [candidates, shuffle]);

  const handleCardClick = (idx: number) => {
    if (selectedCardIdx !== null || isShuffling) return;
    setSelectedCardIdx(idx);
    sfx.playClick();

    // Chờ lật lá bài ra nhìn rõ tên trong 1.5 giây rồi mới mở popup vinh danh
    setTimeout(() => {
      onSelectWinner(deck[idx]);
    }, 1500);
  };

  const handleReshuffle = () => {
    setSelectedCardIdx(null);
    setIsShuffling(true);
    sfx.playTick();
    setTimeout(() => {
      setDeck(shuffle(candidates));
      setIsShuffling(false);
      sfx.playClick();
    }, 400);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 text-center">
      <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 rounded-xl bg-slate-900/60 border border-white/10">
        <p className="text-xs sm:text-sm text-slate-200 font-semibold">
          Bộ bài ngẫu nhiên: <span className="text-amber-400 font-bold">{deck.length} lá</span>
        </p>
        <button
          type="button"
          onClick={handleReshuffle}
          disabled={isShuffling || deck.length === 0}
          className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
        >
          {isShuffling ? "Đang xáo bài..." : "Xáo trộn lại 46 lá"}
        </button>
      </div>

      <div className="max-h-[500px] overflow-y-auto pr-1">
        <div className={`grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 ${
          isShuffling ? "opacity-30 pointer-events-none" : "opacity-100"
        }`}>
          {deck.map((card, idx) => {
            const isFlipped = selectedCardIdx === idx;
            const isOther = selectedCardIdx !== null && selectedCardIdx !== idx;

            return (
              <div
                key={card.id + idx}
                onClick={() => handleCardClick(idx)}
                className={`h-24 sm:h-28 rounded-xl cursor-pointer transition-all duration-500 perspective-1000 ${
                  isOther ? "opacity-35 scale-95 pointer-events-none" : "hover:-translate-y-1.5"
                }`}
              >
                <div
                  className={`relative w-full h-full rounded-xl transition-transform duration-500 preserve-3d shadow-md ${
                    isFlipped ? "rotate-y-180" : ""
                  }`}
                  style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {/* Mặt úp */}
                  <div
                    className="absolute inset-0 w-full h-full rounded-xl bg-gradient-to-b from-indigo-900 via-slate-900 to-purple-950 border border-indigo-400/30 flex flex-col items-center justify-between p-2"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <div className="w-5 h-5 rounded-full bg-indigo-500/30 text-amber-300 font-mono font-bold text-[10px] flex items-center justify-center">
                      {card.cardNo}
                    </div>
                    <span className="text-[10px] text-indigo-300 font-bold">11A10</span>
                  </div>

                  {/* Mặt mở */}
                  <div
                    className="absolute inset-0 w-full h-full rounded-xl bg-gradient-to-br from-amber-500/30 via-slate-900 to-emerald-950 border-2 border-amber-400 flex flex-col items-center justify-center p-2 text-center"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <p className="text-xs font-bold text-white line-clamp-2">{card.fullName}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. POPUP 🎉 VINH DANH HỌC SINH CHIẾN THẮNG
// ==========================================
interface WinnerModalProps {
  winner: Student | null;
  onClose: () => void;
  onConfirmCalled: (id: string) => void;
}

const WinnerModal: React.FC<WinnerModalProps> = ({ winner, onClose, onConfirmCalled }) => {
  if (!winner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-amber-400/40 p-6 text-center space-y-4 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center cursor-pointer"
        >
          ✕
        </button>

        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-3xl shadow-lg ring-4 ring-white/20">
          👑
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-bold text-amber-300 uppercase tracking-widest bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/30">
            CHÚC MỪNG BẠN
          </span>
          <h3 className="text-2xl font-black text-white pt-2">{winner.fullName}</h3>
          <p className="text-xs text-slate-400 font-mono">{winner.role || "Học sinh 11A10"}</p>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold text-xs cursor-pointer"
          >
            Đóng lại
          </button>
          <button
            type="button"
            onClick={() => onConfirmCalled(winner.id)}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs cursor-pointer shadow-md"
          >
            Đánh dấu đã gọi
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. TOÀN BỘ MODAL BỐC THĂM 11A10 TỔNG HỢP
// ==========================================
export const RandomStudentPicker: React.FC<RandomStudentPickerProps> = ({
  isOpen,
  onClose,
  studentsList = DEFAULT_11A10_STUDENTS,
}) => {
  const [activeTab, setActiveTab] = useState<"wheel" | "slot" | "card">("wheel");
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Student | null>(null);

  const [calledIds, setCalledIds] = useState<string[]>(() => {
    try {
      const saved = sessionStorage.getItem("11a10_called_students");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [avoidRepeat, setAvoidRepeat] = useState(true);

  // Lưu danh sách đã gọi vào session
  useEffect(() => {
    sessionStorage.setItem("11a10_called_students", JSON.stringify(calledIds));
  }, [calledIds]);

  const actualList = useMemo(() => {
    return studentsList && studentsList.length > 0 ? studentsList : DEFAULT_11A10_STUDENTS;
  }, [studentsList]);

  // Lọc học sinh khả dụng
  const availableCandidates = useMemo(() => {
    return actualList.filter((st) => !(avoidRepeat && calledIds.includes(st.id)));
  }, [actualList, avoidRepeat, calledIds]);

  const handleStartSpin = () => {
    if (availableCandidates.length === 0) {
      alert("Không còn học sinh khả dụng! Hãy đặt lại danh sách.");
      return;
    }
    setWinner(null);
    setIsSpinning(true);
  };

  const handleEndSpin = (win: Student) => {
    setIsSpinning(false);
    setWinner(win);
    sfx.playFanfare();
    confetti({ particleCount: 120, spread: 75, origin: { y: 0.6 } });
  };

  const handleConfirmCalled = (id: string) => {
    if (!calledIds.includes(id)) {
      setCalledIds((prev) => [...prev, id]);
    }
    setWinner(null);
  };

  const handleResetCalled = () => {
    setCalledIds([]);
    setWinner(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl bg-slate-900 border border-white/10 p-5 sm:p-6 text-center space-y-4 shadow-2xl my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 flex items-center justify-center cursor-pointer"
        >
          ✕
        </button>

        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Chọn Ngẫu Nhiên Học Sinh Lên Bảng</h2>
          <p className="text-xs text-slate-400 mt-1">
            Bốc thăm cả lớp {actualList.length} học sinh • THPT Cát Tiên
          </p>
        </div>

        {/* Chuyển đổi 3 Tab */}
        <div className="flex items-center justify-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-white/5 w-fit mx-auto">
          <button
            type="button"
            onClick={() => { setActiveTab("wheel"); sfx.playClick(); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "wheel" ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            🎡 Vòng quay
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("slot"); sfx.playClick(); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "slot" ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            🎰 Xèng số
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("card"); sfx.playClick(); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "card" ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            🃏 46 Thẻ bài
          </button>
        </div>

        {/* Thanh cấu hình trạng thái */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-950/60 border border-white/5 text-xs">
          <div className="text-slate-300 text-[11px]">
            Sĩ số: <strong className="text-white">{actualList.length}</strong> • Sẵn sàng:{" "}
            <strong className="text-amber-400">{availableCandidates.length}</strong>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 text-[11px] select-none">
              <input
                type="checkbox"
                checked={avoidRepeat}
                onChange={(e) => setAvoidRepeat(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900"
              />
              <span>Tránh gọi trùng ({calledIds.length})</span>
            </label>
            {calledIds.length > 0 && (
              <button
                type="button"
                onClick={handleResetCalled}
                className="text-[10px] text-amber-400 hover:underline cursor-pointer"
              >
                Đặt lại lượt
              </button>
            )}
          </div>
        </div>

        {/* Khung nội dung theo Tab */}
        <div className="py-4">
          {activeTab === "wheel" && (
            <LuckyWheelMode
              candidates={availableCandidates}
              isSpinning={isSpinning}
              onSpinStart={handleStartSpin}
              onSpinEnd={handleEndSpin}
            />
          )}

          {activeTab === "slot" && (
            <SlotMachineMode
              candidates={availableCandidates}
              isSpinning={isSpinning}
              onSpinStart={handleStartSpin}
              onSpinEnd={handleEndSpin}
            />
          )}

          {activeTab === "card" && (
            <CardPickerMode
              candidates={availableCandidates}
              onSelectWinner={handleEndSpin}
            />
          )}
        </div>

        {/* Modal Vinh danh người trúng */}
        <WinnerModal
          winner={winner}
          onClose={() => setWinner(null)}
          onConfirmCalled={handleConfirmCalled}
        />
      </div>
    </div>
  );
};

export default RandomStudentPicker;
