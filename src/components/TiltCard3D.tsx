import React, { useState, useRef, useCallback, useEffect } from 'react';

export interface TiltCard3DProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  maxTilt?: number;
  perspective?: number;
  glowColor?: string;
  borderRadius?: string;
}

/**
 * TiltCard3D
 * Provides smooth mouse-following 3D tilt, dynamic lighting sheen,
 * and elevated depth for portfolio preview and project cards.
 */
export const TiltCard3D: React.FC<TiltCard3DProps> = ({
  children,
  className = '',
  style = {},
  maxTilt = 8,
  perspective = 1000,
  glowColor = 'var(--glow-color)',
  borderRadius = '16px',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(motionQuery.matches);
    }
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (prefersReducedMotion || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const normX = x / rect.width - 0.5;
      const normY = y / rect.height - 0.5;

      setTilt({
        x: normX * maxTilt,
        y: -normY * maxTilt,
      });

      setGlare({
        x: (x / rect.width) * 100,
        y: (y / rect.height) * 100,
        opacity: 0.18,
      });
      setIsHovered(true);
    },
    [maxTilt, prefersReducedMotion]
  );

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  }, []);

  return (
    <div
      style={{
        perspective: `${perspective}px`,
        width: '100%',
        height: '100%',
      }}
    >
      <div
        ref={cardRef}
        className={className}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius,
          transformStyle: 'preserve-3d',
          transform: prefersReducedMotion
            ? 'none'
            : `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg) ${isHovered ? 'translateZ(12px)' : 'translateZ(0px)'}`,
          boxShadow: isHovered
            ? `0 20px 45px -10px rgba(0, 0, 0, 0.85), 0 0 30px -10px ${glowColor}`
            : '0 8px 24px -6px rgba(0, 0, 0, 0.6)',
          transition: isHovered
            ? 'transform 0.1s ease-out, box-shadow 0.2s ease-out'
            : 'transform 0.5s ease-out, box-shadow 0.5s ease-out',
          ...style,
        }}
      >
        {children}

        {/* Dynamic Specular Sheen */}
        {!prefersReducedMotion && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              borderRadius,
              opacity: glare.opacity,
              background: `radial-gradient(circle 320px at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.28) 0%, transparent 70%)`,
              mixBlendMode: 'overlay',
              transition: 'opacity 0.25s ease',
              zIndex: 30,
            }}
          />
        )}
      </div>
    </div>
  );
};
