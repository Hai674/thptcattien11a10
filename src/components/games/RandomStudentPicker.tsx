import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import confetti from "canvas-confetti";
import { DEFAULT_11A10_STUDENTS } from "@/data/classDefaultStudents";
import { LuckyWheelCanvas as LuckyWheelMode } from "./LuckyWheelCanvas";
import { DuckRaceGame } from "./DuckRaceGame";
import { UfoAbductionGame } from "./UfoAbductionGame";

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
// 1. CHẾ ĐỘ 🎡 VÒNG QUAY (ĐÃ TỐI ƯU HỒI HỘP & MOBILE)
// ==========================================
interface WheelProps {
  candidates: Student[];
  isSpinning: boolean;
  onSpinStart: () => void;
  onSpinEnd: (winner: Student) => void;
}

// ==========================================
// 2. CHẾ ĐỘ 🎰 XÈNG SỐ (CÓ DELAY HỒI HỘP & MOBILE)
// ==========================================
const SlotMachineMode: React.FC<WheelProps> = ({ candidates, isSpinning, onSpinStart, onSpinEnd }) => {
  const [displayNumber, setDisplayNumber] = useState<string>("??");
  const [displayName, setDisplayName] = useState<string>("Sẵn sàng quay số...");
  const [displayRole, setDisplayRole] = useState<string>("Lớp 11A10 THPT Cát Tiên");
  const [isWaiting, setIsWaiting] = useState(false);

  useEffect(() => {
    if (!isSpinning || candidates.length === 0) {
      setIsWaiting(false);
      return;
    }

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
        const finalWinner = candidates[Math.floor(Math.random() * candidates.length)];
        const finalIndex = candidates.findIndex((k) => k.id === finalWinner.id);

        setDisplayNumber(String(finalIndex >= 0 ? finalIndex + 1 : 1).padStart(2, "0"));
        setDisplayName(finalWinner.fullName);
        setDisplayRole(finalWinner.role || "Học sinh 11A10");
        setIsWaiting(true);

        // DỪNG LẠI CHO CẢ LỚP NHÌN RÕ CON SỐ VÀ TÊN TRONG 1.6S RỒI MỚI BẬT POPUP
        timer = setTimeout(() => {
          setIsWaiting(false);
          onSpinEnd(finalWinner);
        }, 1600);
      }
    };

    timer = setTimeout(roll, speed);
    return () => clearTimeout(timer);
  }, [isSpinning, candidates, onSpinEnd]);

  return (
    <div className="w-full max-w-xs sm:max-w-md mx-auto p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-950/80 border border-indigo-500/30 shadow-2xl backdrop-blur-xl text-center space-y-4 sm:space-y-6">
      <div className="text-[10px] sm:text-xs font-mono text-cyan-400 font-bold uppercase tracking-widest">
        11A10 CYBER LOTTO ROLLER
      </div>

      <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-black/80 border-2 border-indigo-500/40 space-y-2 sm:space-y-3 relative overflow-hidden">
        <div className={`font-mono font-black text-4xl sm:text-6xl tracking-wider transition-all ${
          isSpinning ? "text-cyan-400 scale-105" : "text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]"
        }`}>
          {displayNumber}
        </div>
        <div className={`font-bold text-lg sm:text-2xl min-h-[32px] sm:min-h-[40px] flex items-center justify-center px-1 leading-snug ${
          isSpinning ? "text-indigo-300" : "text-white"
        }`}>
          {displayName}
        </div>
        <div className="text-[10px] sm:text-xs font-mono text-slate-400">{displayRole}</div>
      </div>

      <button
        type="button"
        disabled={isSpinning || isWaiting || candidates.length === 0}
        onClick={onSpinStart}
        className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-xl active:scale-95 ${
          isSpinning || isWaiting || candidates.length === 0
            ? "bg-slate-800 text-slate-400 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white hover:scale-102 cursor-pointer shadow-indigo-500/30"
        }`}
      >
        {isSpinning ? "Đang quay số xèng..." : isWaiting ? "Đang chốt số..." : `Gạt cần quay số (${candidates.length} bạn)`}
      </button>
    </div>
  );
};

// ==========================================
// 3. CHẾ ĐỘ 🃏 46 THẺ BÀI MA THUẬT (MOBILE OPTIMIZED)
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
    <div className="w-full max-w-5xl mx-auto space-y-3 sm:space-y-4 text-center">
      <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-900/60 border border-white/10">
        <p className="text-[11px] sm:text-sm text-slate-200 font-semibold truncate">
          Bộ bài: <span className="text-amber-400 font-bold">{deck.length} lá</span>
        </p>
        <button
          type="button"
          onClick={handleReshuffle}
          disabled={isShuffling || deck.length === 0}
          className="px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] sm:text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shrink-0 active:scale-95"
        >
          {isShuffling ? "Đang xáo..." : "Xáo trộn lại 46 lá"}
        </button>
      </div>

      <div className="max-h-[300px] sm:max-h-[500px] overflow-y-auto pr-1">
        <div className={`grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1.5 sm:gap-2 ${
          isShuffling ? "opacity-30 pointer-events-none" : "opacity-100"
        }`}>
          {deck.map((card, idx) => {
            const isFlipped = selectedCardIdx === idx;
            const isOther = selectedCardIdx !== null && selectedCardIdx !== idx;

            return (
              <div
                key={card.id + idx}
                onClick={() => handleCardClick(idx)}
                className={`h-20 sm:h-28 rounded-lg sm:rounded-xl cursor-pointer transition-all duration-300 perspective-1000 ${
                  isOther ? "opacity-35 scale-95 pointer-events-none" : "active:scale-95 hover:-translate-y-1"
                }`}
              >
                <div
                  className={`relative w-full h-full rounded-lg sm:rounded-xl transition-transform duration-500 preserve-3d shadow-md ${
                    isFlipped ? "rotate-y-180" : ""
                  }`}
                  style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {/* Mặt úp */}
                  <div
                    className="absolute inset-0 w-full h-full rounded-lg sm:rounded-xl bg-gradient-to-b from-indigo-900 via-slate-900 to-purple-950 border border-indigo-400/30 flex flex-col items-center justify-between p-1.5 sm:p-2"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-indigo-500/30 text-amber-300 font-mono font-bold text-[9px] sm:text-[10px] flex items-center justify-center">
                      {card.cardNo}
                    </div>
                    <span className="text-[9px] sm:text-[10px] text-indigo-300 font-bold">11A10</span>
                  </div>

                  {/* Mặt mở */}
                  <div
                    className="absolute inset-0 w-full h-full rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-500/30 via-slate-900 to-emerald-950 border-2 border-amber-400 flex flex-col items-center justify-center p-1 sm:p-2 text-center"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <p className="text-[10px] sm:text-xs font-bold text-white line-clamp-2 leading-tight">{card.fullName}</p>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
      <div className="w-full max-w-[90vw] sm:max-w-sm rounded-2xl sm:rounded-3xl bg-slate-900 border border-amber-400/40 p-4 sm:p-6 text-center space-y-3 sm:space-y-4 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center cursor-pointer text-xs"
        >
          ✕
        </button>

        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-xl sm:rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-2xl sm:text-3xl shadow-lg ring-4 ring-white/20">
          👑
        </div>

        <div className="space-y-1">
          <span className="text-[10px] sm:text-[11px] font-bold text-amber-300 uppercase tracking-widest bg-amber-500/20 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-amber-400/30">
            CHÚC MỪNG BẠN
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white pt-1 sm:pt-2">{winner.fullName}</h3>
          <p className="text-[11px] sm:text-xs text-slate-400 font-mono">{winner.role || "Học sinh 11A10"}</p>
        </div>

        <div className="flex gap-2 pt-1 sm:pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 sm:py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold text-[11px] sm:text-xs cursor-pointer active:scale-95"
          >
            Đóng lại
          </button>
          <button
            type="button"
            onClick={() => onConfirmCalled(winner.id)}
            className="flex-1 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-[11px] sm:text-xs cursor-pointer shadow-md active:scale-95"
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
  const [activeTab, setActiveTab] = useState<"wheel" | "slot" | "card" | "duck" | "ufo">("wheel");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[96vh] sm:max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl bg-slate-900 border border-white/10 p-3.5 sm:p-6 text-center space-y-3 sm:space-y-4 shadow-2xl my-auto">
        <button
          onClick={onClose}
          className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 flex items-center justify-center cursor-pointer text-xs sm:text-base z-10"
        >
          ✕
        </button>

        <div className="pt-1">
          <h2 className="text-base sm:text-2xl font-black text-white">Chọn Ngẫu Nhiên Học Sinh Lên Bảng</h2>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1">
            Bốc thăm cả lớp {actualList.length} học sinh • THPT Cát Tiên
          </p>
        </div>

        {/* Chuyển đổi 5 Tab */}
        <div className="flex items-center justify-start sm:justify-center gap-1 sm:gap-1.5 bg-slate-950 p-1 sm:p-1.5 rounded-xl border border-white/5 w-fit max-w-full mx-auto overflow-x-auto scrollbar-thin">
          <button
            type="button"
            onClick={() => { setActiveTab("wheel"); sfx.playClick(); }}
            className={`px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
              activeTab === "wheel" ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            🎡 Vòng quay
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("slot"); sfx.playClick(); }}
            className={`px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
              activeTab === "slot" ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            🎰 Xèng số
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("card"); sfx.playClick(); }}
            className={`px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
              activeTab === "card" ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            🃏 46 Thẻ bài
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("duck"); sfx.playClick(); }}
            className={`px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
              activeTab === "duck" ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            🦆 Đua vịt
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("ufo"); sfx.playClick(); }}
            className={`px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
              activeTab === "ufo" ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            🛸 UFO bắt cóc
          </button>
        </div>

        {/* Thanh cấu hình trạng thái */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-950/60 border border-white/5 text-[10px] sm:text-xs">
          <div className="text-slate-300">
            Sĩ số: <strong className="text-white">{actualList.length}</strong> • Sẵn sàng:{" "}
            <strong className="text-amber-400">{availableCandidates.length}</strong>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 select-none">
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
                className="text-amber-400 hover:underline cursor-pointer font-bold"
              >
                Đặt lại lượt
              </button>
            )}
          </div>
        </div>

        {/* Khung nội dung theo Tab */}
        <div className="py-1 sm:py-4 flex items-center justify-center">
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

          {activeTab === "duck" && (
            <DuckRaceGame
              candidates={availableCandidates}
              onSelectWinner={handleEndSpin}
            />
          )}

          {activeTab === "ufo" && (
            <UfoAbductionGame
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
