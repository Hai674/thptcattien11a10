import React, { useRef, useState } from 'react';

interface HoloTiltCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export const HoloTiltCard: React.FC<HoloTiltCardProps> = ({
  children,
  className = '',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('');
  const [glareStyle, setGlareStyle] = useState<React.CSSProperties>({ opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return;
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    setTransform(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`);

    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;

    setGlareStyle({
      opacity: 0.6,
      background: `radial-gradient(circle at ${percentX}% ${percentY}%, rgba(255, 255, 255, 0.25) 0%, transparent 65%)`,
    });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlareStyle({ opacity: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchEnd={handleMouseLeave}
      style={{
        transform,
        transformStyle: 'preserve-3d',
        transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className={`glass-card-element group relative rounded-3xl overflow-hidden text-white transition-all duration-300 ${className}`}
    >
      {/* Specular Sheen Sweep Flare */}
      <div className="glass-card-sheen" />

      {/* Specular Interactive Glare */}
      <div
        className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300 rounded-3xl"
        style={glareStyle}
      />

      {/* Card Content */}
      <div className="relative z-30">{children}</div>
    </div>
  );
};

export default HoloTiltCard;
