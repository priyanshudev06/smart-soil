import React, { useRef, useState } from 'react';

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'emerald' | 'blue' | 'purple' | 'amber' | 'slate';
  onClick?: () => void;
}

export const Card3D: React.FC<Card3DProps> = ({
  children,
  className = '',
  glowColor = 'emerald',
  onClick
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotX, setRotX] = useState<number>(0);
  const [rotY, setRotY] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const glowShadowMap = {
    emerald: 'hover:shadow-[0_20px_40px_-10px_rgba(16,185,129,0.35)] hover:border-emerald-500/60',
    blue: 'hover:shadow-[0_20px_40px_-10px_rgba(6,182,212,0.35)] hover:border-cyan-500/60',
    purple: 'hover:shadow-[0_20px_40px_-10px_rgba(168,85,247,0.35)] hover:border-purple-500/60',
    amber: 'hover:shadow-[0_20px_40px_-10px_rgba(245,158,11,0.35)] hover:border-amber-500/60',
    slate: 'hover:shadow-[0_20px_40px_-10px_rgba(15,23,42,0.25)] hover:border-slate-800',
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10; // Max tilt 10deg
    const rotateY = ((x - centerX) / centerX) * 10;

    setRotX(rotateX);
    setRotY(rotateY);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotX(0);
    setRotY(0);
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: isHovered
          ? `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-8px) scale3d(1.02, 1.02, 1.02)`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale3d(1, 1, 1)',
        transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
      className={`relative rounded-3xl bg-white border border-slate-200/90 shadow-[0_10px_25px_-5px_rgba(15,23,42,0.08),0_8px_10px_-6px_rgba(15,23,42,0.04)] ${glowShadowMap[glowColor]} transition-shadow duration-300 transform-gpu cursor-pointer overflow-hidden ${className}`}
    >
      {/* 3D Glass Bevel Highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />
      
      {/* Inner sheen on hover */}
      {isHovered && (
        <div
          className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 pointer-events-none transition-opacity duration-300"
          style={{
            transform: `translate(${rotY * 4}px, ${rotX * 4}px)`,
          }}
        />
      )}

      {children}
    </div>
  );
};
