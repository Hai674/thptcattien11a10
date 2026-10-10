import React, { useEffect, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [trailerPos, setTrailerPos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    // Only run on non-touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;
    let animId: number;

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      setPos({ x: e.clientX, y: e.clientY });

      // Detect hover over interactive elements
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.closest('button') ||
          target.closest('a') ||
          target.closest('input') ||
          target.closest('[role="button"]') ||
          target.closest('.interactive'))
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    // Smooth trailer follow loop
    const followLoop = () => {
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;
      setTrailerPos({ x: currentX, y: currentY });
      animId = requestAnimationFrame(followLoop);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    animId = requestAnimationFrame(followLoop);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      cancelAnimationFrame(animId);
    };
  }, []);

  // If outside viewport or touch screen
  if (pos.x < 0 || pos.y < 0) return null;

  return (
    <>
      {/* Con trỏ tâm chính */}
      <div
        className="fixed pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform duration-75"
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          width: isClicking ? '6px' : isHovering ? '12px' : '8px',
          height: isClicking ? '6px' : isHovering ? '12px' : '8px',
          backgroundColor: isHovering ? '#38bdf8' : '#22d3ee',
          boxShadow: '0 0 12px #22d3ee, 0 0 20px #06b6d4',
        }}
      />

      {/* Vòng hào quang đuổi theo (Trailer ring) */}
      <div
        className="fixed pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/60 transition-all duration-150 ease-out"
        style={{
          left: `${trailerPos.x}px`,
          top: `${trailerPos.y}px`,
          width: isHovering ? '52px' : isClicking ? '26px' : '36px',
          height: isHovering ? '52px' : isClicking ? '26px' : '36px',
          backgroundColor: isHovering ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
          boxShadow: isHovering
            ? '0 0 25px rgba(6, 182, 212, 0.4), inset 0 0 10px rgba(6, 182, 212, 0.2)'
            : '0 0 10px rgba(6, 182, 212, 0.25)',
          transform: `translate(-50%, -50%) scale(${isClicking ? 0.8 : 1})`,
        }}
      />
    </>
  );
};
