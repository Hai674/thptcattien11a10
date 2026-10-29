import React, { useState, useEffect } from 'react';
import { cyberAudio } from '@/utils/cyberAudio';
import { Sparkles, Trophy, HelpCircle, Shuffle } from 'lucide-react';

interface StudentCandidate {
  id: string;
  fullName: string;
  role?: string;
  group?: string;
}

interface MysteryCardDeckProps {
  candidates: StudentCandidate[];
  onSelectWinner: (winner: StudentCandidate) => void;
}

// Thuật toán xáo bài Fisher-Yates shuffle chuẩn xác suất đồng đều
function shuffleList<T>(list: T[]): T[] {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const MysteryCardDeck: React.FC<MysteryCardDeckProps> = ({
  candidates,
  onSelectWinner,
}) => {
  const [revealedIdx, setRevealedIdx] = useState<number | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [cardPool, setCardPool] = useState<
    (StudentCandidate & { cardNo: number })[]
  >([]);

  // Tự động sinh và xáo trộn đầy đủ 46 lá bài từ danh sách học sinh
  useEffect(() => {
    setRevealedIdx(null);
    const shuffled = shuffleList(candidates);
    setCardPool(shuffled.map((c, i) => ({ ...c, cardNo: i + 1 })));
  }, [candidates]);

  const handleCardClick = (idx: number) => {
    if (revealedIdx !== null || isShuffling) return;
    setRevealedIdx(idx);
    cyberAudio.playClick();
    // Chờ lật lá bài ra nhìn rõ tên trong 1.5 giây rồi mới mở popup vinh danh
    setTimeout(() => {
      onSelectWinner(cardPool[idx]);
    }, 1500);
  };

  const handleShuffleNewDeck = () => {
    setRevealedIdx(null);
    setIsShuffling(true);
    cyberAudio.playTick();

    setTimeout(() => {
      const shuffled = shuffleList(candidates);
      setCardPool(shuffled.map((c, i) => ({ ...c, cardNo: i + 1 })));
      setIsShuffling(false);
      cyberAudio.playClick();
    }, 350);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 text-center">
      {/* Thanh thông tin & Nút xáo bài */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 rounded-xl bg-slate-900/60 border border-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-left">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <p className="text-xs sm:text-sm text-slate-200 font-semibold">
            Bộ bài ngẫu nhiên: <span className="text-amber-400 font-bold">{cardPool.length} lá</span>
          </p>
          <span className="text-[11px] text-slate-400 hidden sm:inline">• Bấm chọn 1 lá bất kỳ để lật tên học sinh</span>
        </div>

        <button
          type="button"
          onClick={handleShuffleNewDeck}
          disabled={isShuffling || cardPool.length === 0}
          className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md hover:shadow-indigo-500/25 flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
        >
          <Shuffle className={`w-3.5 h-3.5 ${isShuffling ? 'animate-spin' : ''}`} />
          <span>{isShuffling ? 'Đang xáo bài...' : 'Xáo trộn lại 46 lá'}</span>
        </button>
      </div>

      {/* Lưới đầy đủ 46 lá bài bí ẩn (Responsive từ 4 đến 10 cột) */}
      <div className="max-h-[520px] overflow-y-auto pr-1 custom-scrollbar">
        <div
          className={`grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-2.5 transition-opacity duration-300 ${
            isShuffling ? 'opacity-30 scale-98 pointer-events-none' : 'opacity-100'
          }`}
        >
          {cardPool.map((card, idx) => {
            const isRevealed = revealedIdx === idx;
            const isOther = revealedIdx !== null && revealedIdx !== idx;

            return (
              <div
                key={`${card.id}-${card.cardNo}-${idx}`}
                onClick={() => handleCardClick(idx)}
                className={`h-24 sm:h-28 rounded-xl cursor-pointer transition-all duration-500 perspective-1000 select-none ${
                  isOther
                    ? 'opacity-35 scale-95 pointer-events-none'
                    : 'hover:-translate-y-1.5 hover:shadow-lg hover:shadow-indigo-500/30'
                }`}
                title={`Lá bài số #${card.cardNo}`}
              >
                <div
                  className={`relative w-full h-full rounded-xl transition-transform duration-500 preserve-3d shadow-md ${
                    isRevealed ? 'rotate-y-180' : ''
                  }`}
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isRevealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                >
                  {/* Mặt úp lá bài (Facedown) */}
                  <div
                    className="absolute inset-0 w-full h-full rounded-xl bg-gradient-to-b from-indigo-900/90 via-slate-900 to-purple-950/90 border border-indigo-400/30 hover:border-amber-400/60 flex flex-col items-center justify-between p-2 text-center backface-hidden shadow-indigo-500/20 group"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div className="w-5 h-5 rounded-full bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-amber-300 font-mono font-bold text-[10px]">
                      {card.cardNo}
                    </div>
                    <HelpCircle className="w-5 h-5 text-indigo-300/80 group-hover:text-amber-400 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] text-slate-400 font-mono tracking-tighter">11A10</span>
                  </div>

                  {/* Mặt ngửa khi lật (Faceup) */}
                  <div
                    className="absolute inset-0 w-full h-full rounded-xl bg-gradient-to-br from-amber-500/30 via-slate-900 to-emerald-950 border-2 border-amber-400 flex flex-col items-center justify-center p-2 text-center space-y-1 backface-hidden shadow-2xl"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    <Trophy className="w-4 h-4 text-amber-400 animate-bounce" />
                    <span className="text-[11px] font-bold text-white line-clamp-2 leading-tight">
                      {card.fullName}
                    </span>
                    <span className="text-[9px] text-amber-300 font-mono">
                      #{card.cardNo} • 11A10
                    </span>
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
