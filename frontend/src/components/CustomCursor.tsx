import React, { useEffect, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [trailing, setTrailing] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    const updateTrailing = () => {
      setTrailing(prev => ({
        x: prev.x + (position.x - prev.x) * 0.18,
        y: prev.y + (position.y - prev.y) * 0.18,
      }));
      animationFrameId = requestAnimationFrame(updateTrailing);
    };
    animationFrameId = requestAnimationFrame(updateTrailing);
    return () => cancelAnimationFrame(animationFrameId);
  }, [position]);

  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'INPUT' ||
        target.closest('button') ||
        target.closest('a') ||
        target.classList.contains('cursor-pointer')
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    return () => document.removeEventListener('mouseover', handleMouseOver);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden hidden md:block">
      {/* Precision Core Dot */}
      <div
        className="fixed -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#B02310] transition-transform duration-75 ease-out shadow-sm"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: isClicked ? '6px' : isHovered ? '12px' : '8px',
          height: isClicked ? '6px' : isHovered ? '12px' : '8px',
        }}
      />

      {/* Trailing Architectural Ring */}
      <div
        className={`fixed -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#111827]/40 transition-all duration-300 ease-out ${
          isHovered
            ? 'scale-150 border-[#B02310] bg-[#B02310]/10 shadow-[0_0_20px_rgba(176,35,16,0.3)]'
            : isClicked
            ? 'scale-90 border-[#B02310]'
            : 'scale-100'
        }`}
        style={{
          left: `${trailing.x}px`,
          top: `${trailing.y}px`,
          width: '32px',
          height: '32px',
        }}
      />
    </div>
  );
};
