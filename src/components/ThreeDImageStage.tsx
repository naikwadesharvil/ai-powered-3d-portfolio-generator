import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface ThreeDImageStageProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Maximum tilt angle in degrees. Default 10 */
  maxTilt?: number;
  /** Perspective distance in pixels. Default 1200 */
  perspective?: number;
  /** Glow color for ambient occlusion and rim lighting. Default cyan */
  glowColor?: string;
  /** Whether to show dynamic specular glare sheen layer. Default true */
  showGlare?: boolean;
  /** Glare opacity max (0 to 1). Default 0.25 */
  glareMaxOpacity?: number;
  /** Whether to show grounded floor reflection beneath. Default true */
  showFloorShadow?: boolean;
  /** Floating idle animation when mouse is not hovering. Default true */
  floatingIdle?: boolean;
  /** Border radius in px or string. Default '24px' */
  borderRadius?: string;
  /** Elevated Z distance for depth perception. Default 0 */
  depthElevate?: number;
}

/**
 * ThreeDImageStage
 * Creates a realistic physical 3D illusion around existing website images and canvas elements
 * using CSS 3D perspective, interactive mouse tilt, layered depth shadows,
 * dynamic specular glare sheen, and ground reflection physics.
 */
export const ThreeDImageStage: React.FC<ThreeDImageStageProps> = ({
  children,
  className = '',
  style = {},
  maxTilt = 10,
  perspective = 1200,
  glowColor = 'rgba(0, 242, 254, 0.35)',
  showGlare = true,
  glareMaxOpacity = 0.25,
  showFloorShadow = true,
  floatingIdle = true,
  borderRadius = '24px',
  depthElevate = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check touch devices and reduced-motion preferences
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const touchCheck = window.matchMedia('(hover: none)').matches;
      setIsTouchDevice(touchCheck);

      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(motionQuery.matches);

      const handleMotionChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };
      motionQuery.addEventListener('change', handleMotionChange);
      return () => motionQuery.removeEventListener('change', handleMotionChange);
    }
  }, []);

  // Mouse move handler for physical 3D tilt and specular lighting
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (prefersReducedMotion || isTouchDevice || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Normalized coordinates from -0.5 to +0.5
      const normX = x / rect.width - 0.5;
      const normY = y / rect.height - 0.5;

      // Realistic 3D rotation angles
      const rotY = normX * maxTilt;
      const rotX = -normY * maxTilt;

      setTilt({ x: rotY, y: rotX });

      // Specular glare position (0% to 100%)
      const glarePercentX = (x / rect.width) * 100;
      const glarePercentY = (y / rect.height) * 100;
      setGlare({
        x: glarePercentX,
        y: glarePercentY,
        opacity: glareMaxOpacity,
      });
      setIsHovered(true);
    },
    [maxTilt, glareMaxOpacity, prefersReducedMotion, isTouchDevice]
  );

  const handleMouseEnter = useCallback(() => {
    if (!prefersReducedMotion && !isTouchDevice) {
      setIsHovered(true);
    }
  }, [prefersReducedMotion, isTouchDevice]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  }, []);

  // Dynamic shadow offset calculation tracking the tilt
  const shadowX = -tilt.x * 2.5;
  const shadowY = 25 - tilt.y * 2.5;
  const dynamicShadow = prefersReducedMotion
    ? `0 20px 50px -10px rgba(0, 0, 0, 0.8)`
    : `${shadowX}px ${shadowY}px 70px -15px rgba(0, 0, 0, 0.9), 
       0 12px 28px -8px rgba(0, 0, 0, 0.7), 
       0 0 50px -12px ${glowColor}`;

  return (
    <div
      ref={containerRef}
      className={`threed-stage-wrapper ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        width: '100%',
        perspective: `${perspective}px`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        ...style,
      }}
    >
      {/* 3D Physical Card Body */}
      <div
        className={`threed-card-body ${floatingIdle && !isHovered && !prefersReducedMotion ? 'threed-idle-float' : ''}`}
        style={{
          position: 'relative',
          width: '100%',
          borderRadius,
          transformStyle: 'preserve-3d',
          transform: prefersReducedMotion
            ? 'none'
            : `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg) ${
                depthElevate || isHovered ? `translateZ(${depthElevate + (isHovered ? 16 : 0)}px)` : ''
              }`,
          boxShadow: dynamicShadow,
          transition: isHovered
            ? 'transform 0.1s ease-out, box-shadow 0.2s ease-out'
            : 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.6s ease-out',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(5, 5, 5, 0.9)',
          overflow: 'hidden',
        }}
      >
        {/* Child Content / Canvas Image */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
          }}
        >
          {children}
        </div>

        {/* Dynamic Specular Glare / Reflection Layer */}
        {showGlare && !prefersReducedMotion && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              borderRadius,
              opacity: glare.opacity,
              background: `radial-gradient(circle 480px at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.08) 40%, transparent 80%)`,
              mixBlendMode: 'overlay',
              transition: 'opacity 0.3s ease',
              zIndex: 35,
            }}
          />
        )}

        {/* Perimeter Rim Highlight */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius,
            pointerEvents: 'none',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.2)',
            zIndex: 36,
          }}
        />
      </div>

      {/* Ground Pedestal / Ambient Reflection Shadow */}
      {showFloorShadow && !prefersReducedMotion && (
        <div
          style={{
            width: '85%',
            height: '32px',
            background: `radial-gradient(ellipse at 50% 50%, ${glowColor} 0%, rgba(0, 0, 0, 0.85) 45%, transparent 75%)`,
            filter: 'blur(18px)',
            opacity: isHovered ? 0.7 : 0.45,
            marginTop: '8px',
            pointerEvents: 'none',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            transform: `scale(${isHovered ? 1.05 : 1})`,
          }}
        />
      )}

      <style>{`
        @keyframes floatThreeD {
          0%, 100% {
            transform: translateY(0px) rotateY(0deg) rotateX(0deg);
          }
          50% {
            transform: translateY(-8px) rotateY(1.5deg) rotateX(-1deg);
          }
        }

        .threed-idle-float {
          animation: floatThreeD 5s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .threed-idle-float {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};
