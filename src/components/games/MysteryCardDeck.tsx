import React, { useState } from 'react';
import { cyberAudio } from '@/utils/cyberAudio';
import { Sparkles, Trophy, HelpCircle } from 'lucide-react';

interface MysteryCardDeckProps {
  candidates: { id: string; fullName: string; role?: string; group?: string }[];
  onSelectWinner: (winner: { id: string; fullName: string; role?: string; group?: string }) => void;
}

export const MysteryCardDeck: React.FC<MysteryCardDeckProps> = ({
  candidates,
  onSelectWinner,
}) => {
  const [revealedIdx, setRevealedIdx] = useState<number | null>(null);
  const [cardPool, setCardPool] = useState<
    { id: string; fullName: string; role?: string; group?: string; cardNo: number }[]
  >(() => {
    // Lấy ngẫu nhiên 8 bạn học sinh cho 8 lá bài bí mật
    const shuffled = [...candidates].sort(() => 0.5 - Math.random()).slice(0, 8);
    return shuffled.map((c, i) => ({ ...c, cardNo: i + 1 }));
  });

  const handleCardClick = (idx: number) => {
    if (revealedIdx !== null) return;
    setRevealedIdx(idx);
    cyberAudio.playClick();
    setTimeout(() => {
      onSelectWinner(cardPool[idx]);
    }, 450);
  };

  const handleShuffleNewDeck = () => {
    setRevealedIdx(null);
    const shuffled = [...candidates].sort(() => 0.5 - Math.random()).slice(0, 8);
    setCardPool(shuffled.map((c, i) => ({ ...c, cardNo: i + 1 })));
    cyberAudio.playTick();
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-5 text-center">
      <div className="flex items-center justify-between px-2">
        <p className="text-xs text-slate-300 font-medium">
          Mời thầy cô hoặc một bạn trong lớp bấm chọn 1 lá bài may mắn bất kỳ:
        </p>
        <button
          type="button"
          onClick={handleShuffleNewDeck}
          className="text-xs text-blue-400 hover:text-blue-300 font-medium underline"
        >
          Xáo bài mới
        </button>
      </div>

      {/* Lưới 8 lá bài bí ẩn */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {cardPool.map((card, idx) => {
          const isRevealed = revealedIdx === idx;
          const isOther = revealedIdx !== null && revealedIdx !== idx;

          return (
            <div
              key={idx}
              onClick={() => handleCardClick(idx)}
              className={`h-36 rounded-2xl cursor-pointer transition-all duration-500 perspective-1000 ${
                isOther ? 'opacity-40 scale-95 pointer-events-none' : 'hover:-translate-y-1.5'
              }`}
            >
              <div
                className={`relative w-full h-full rounded-2xl transition-transform duration-500 preserve-3d shadow-xl ${
                  isRevealed ? 'rotate-y-180' : ''
                }`}
                style={{
                  transformStyle: 'preserve-3d',
                  transform: isRevealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* Mặt úp lá bài (Facedown) */}
                <div
                  className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 border-2 border-indigo-500/40 flex flex-col items-center justify-center p-3 text-center space-y-2 backface-hidden shadow-indigo-500/20 shadow-md"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 font-mono font-bold text-xs">
                    #{card.cardNo}
                  </div>
                  <HelpCircle className="w-6 h-6 text-amber-400/80 animate-pulse" />
                  <span className="text-[10px] text-slate-400 font-mono">BÍ MẬT 11A10</span>
                </div>

                {/* Mặt ngửa khi lật (Faceup) */}
                <div
                  className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-amber-500/20 via-slate-900 to-emerald-950 border-2 border-amber-400 flex flex-col items-center justify-center p-3 text-center space-y-1.5 backface-hidden shadow-2xl"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-bold text-white font-display line-clamp-2 leading-tight">
                    {card.fullName}
                  </span>
                  <span className="text-[10px] text-amber-300 font-mono">
                    {card.group || '11A10'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
