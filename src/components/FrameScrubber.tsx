import React, { useEffect, useRef, useState } from 'react';

export interface FrameScrubberProps {
  /** Path to folder containing numbered frame sequence, e.g. '/assets/image_1' */
  folderPath: string;
  /** Total frame count in the sequence (e.g. 36 for 10-deg increments) */
  totalFrames?: number;
  /** Fallback image path if frame sequence fails or is still loading */
  fallbackImage: string;
  /** Custom filename generator. Defaults to (i) => `frame_${String(i).padStart(3, '0')}.jpg` */
  fileNamePattern?: (index: number) => string;
  /** Scrubbing interaction mode: 'cursor' (Hero cursor mapping) or 'scroll' (viewport scroll progress) */
  mode: 'cursor' | 'scroll';
  /** Image sizing: 'cover' (fills container, preserves aspect ratio) or 'contain' */
  fit?: 'cover' | 'contain';
  /** Display monospace telemetry HUD over canvas */
  overlayTelemetry?: boolean;
  /** Section label for telemetry HUD (e.g. 'HERO // 360 ROTATION') */
  telemetryLabel?: string;
  /** Additional styling */
  style?: React.CSSProperties;
  className?: string;
  /** Callback fired whenever frame changes */
  onFrameChange?: (frameIndex: number, progress: number) => void;
}

export const FrameScrubber: React.FC<FrameScrubberProps> = ({
  folderPath,
  totalFrames = 36,
  fallbackImage,
  fileNamePattern = (i) => `frame_${String(i).padStart(3, '0')}.jpg`,
  mode,
  fit = 'cover',
  overlayTelemetry = false,
  telemetryLabel = 'CANVAS // FRAME_SCRUBBER',
  style,
  className,
  onFrameChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const imagesRef = useRef<HTMLImageElement[]>([]);
  const fallbackImgRef = useRef<HTMLImageElement | null>(null);

  const [loadedCount, setLoadedCount] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(1);
  const [scrubProgress, setScrubProgress] = useState(0.5);
  const [fps, setFps] = useState(60);
  const [mouseCoords, setMouseCoords] = useState({ x: 0.5, y: 0.5 });
  const [isInteracting, setIsInteracting] = useState(false);

  // Smooth lerp tracking
  const targetProgressRef = useRef(0.5);
  const currentProgressRef = useRef(0.5);
  const animFrameIdRef = useRef<number | null>(null);
  const idleAngleRef = useRef(0);
  const lastInteractionTimeRef = useRef(Date.now());

  // 1. Preload frame sequence and fallback image
  useEffect(() => {
    let isMounted = true;
    const loadedImages: HTMLImageElement[] = [];
    let count = 0;

    // Load Fallback First
    const fb = new Image();
    fb.src = fallbackImage;
    fb.onload = () => {
      fallbackImgRef.current = fb;
    };
    fb.onerror = () => {
      console.warn(`[FrameScrubber] Fallback image failed to load: ${fallbackImage}`);
    };

    // Preload Numbered Frames
    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      const fileName = fileNamePattern(i);
      img.src = `${folderPath.replace(/\/$/, '')}/${fileName}`;

      img.onload = () => {
        if (!isMounted) return;
        count++;
        setLoadedCount(count);
      };

      img.onerror = () => {
        // Fallback to the base image for this frame if numbered frame is missing
        if (!img.src.includes(fallbackImage)) {
          img.src = fallbackImage;
        }
      };

      loadedImages.push(img);
    }

    imagesRef.current = loadedImages;

    return () => {
      isMounted = false;
    };
  }, [folderPath, totalFrames, fallbackImage, fileNamePattern]);

  // 2. Cursor Scrubbing (Hero Mode)
  useEffect(() => {
    if (mode !== 'cursor') return;

    const handleMouseMove = (e: MouseEvent) => {
      lastInteractionTimeRef.current = Date.now();
      setIsInteracting(true);

      const normX = Math.max(0, Math.min(1, e.clientX / window.innerWidth));
      const normY = Math.max(0, Math.min(1, e.clientY / window.innerHeight));
      targetProgressRef.current = normX;
      setMouseCoords({ x: normX, y: normY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        lastInteractionTimeRef.current = Date.now();
        setIsInteracting(true);
        const touch = e.touches[0];
        const normX = Math.max(0, Math.min(1, touch.clientX / window.innerWidth));
        targetProgressRef.current = normX;
        setMouseCoords({ x: normX, y: 0.5 });
      }
    };

    const handleMouseLeave = () => {
      setIsInteracting(false);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mode]);

  // 3. Scroll Scrubbing (About & Works Mode)
  useEffect(() => {
    if (mode !== 'scroll') return;

    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate relative progress through the viewport (0.0 when entering bottom, 1.0 when leaving top)
      const progress = (windowHeight - rect.top) / (windowHeight + rect.height);
      const clamped = Math.max(0, Math.min(1, progress));

      targetProgressRef.current = clamped;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [mode]);

  // 4. Smooth 60 FPS Render Loop & Canvas Draw
  useEffect(() => {
    let lastFpsTime = performance.now();
    let frameCounter = 0;

    const render = (now: number) => {
      frameCounter++;
      if (now - lastFpsTime >= 1000) {
        setFps(Math.min(60, Math.round((frameCounter * 1000) / (now - lastFpsTime))));
        frameCounter = 0;
        lastFpsTime = now;
      }

      // Idle Oscillation for Hero when cursor is inactive
      if (mode === 'cursor' && Date.now() - lastInteractionTimeRef.current > 2000) {
        idleAngleRef.current += 0.008;
        // Smooth sine wave rocking through frames
        const idleX = 0.5 + Math.sin(idleAngleRef.current) * 0.42;
        targetProgressRef.current = idleX;
      }

      // Smooth Lerp
      const lerpSpeed = mode === 'cursor' ? 0.09 : 0.12;
      currentProgressRef.current += (targetProgressRef.current - currentProgressRef.current) * lerpSpeed;
      const progress = currentProgressRef.current;

      // Calculate integer frame index (1 to totalFrames)
      const frameIdx = Math.max(
        1,
        Math.min(totalFrames, Math.round(1 + progress * (totalFrames - 1)))
      );

      setCurrentFrame(frameIdx);
      setScrubProgress(progress);
      if (onFrameChange) {
        onFrameChange(frameIdx, progress);
      }

      // Render to 2D Canvas
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const rect = container.getBoundingClientRect();
          const dpr = Math.min(window.devicePixelRatio || 1, 2);

          const displayWidth = Math.round(rect.width);
          const displayHeight = Math.round(rect.height);

          if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
            canvas.width = displayWidth * dpr;
            canvas.height = displayHeight * dpr;
          }

          ctx.save();
          ctx.scale(dpr, dpr);
          ctx.clearRect(0, 0, displayWidth, displayHeight);

          // Get image corresponding to frameIdx
          const activeImg = imagesRef.current[frameIdx - 1] || fallbackImgRef.current;

          if (activeImg && activeImg.complete && activeImg.naturalWidth > 0) {
            // Aspect-ratio cover/contain calculation without distortion
            const imgRatio = activeImg.naturalWidth / activeImg.naturalHeight;
            const canvasRatio = displayWidth / displayHeight;

            let drawW = displayWidth;
            let drawH = displayHeight;

            if (fit === 'cover') {
              if (canvasRatio > imgRatio) {
                drawW = displayWidth;
                drawH = displayWidth / imgRatio;
              } else {
                drawH = displayHeight;
                drawW = displayHeight * imgRatio;
              }
            } else {
              // contain
              if (canvasRatio > imgRatio) {
                drawH = displayHeight;
                drawW = displayHeight * imgRatio;
              } else {
                drawW = displayWidth;
                drawH = displayWidth / imgRatio;
              }
            }

            const drawX = (displayWidth - drawW) / 2;
            const drawY = (displayHeight - drawH) / 2;

            // Smooth subtle chromatic aberration / scanline tint on high scrub speed
            ctx.drawImage(activeImg, drawX, drawY, drawW, drawH);

            // Subtle vignette & dark border blend
            const grad = ctx.createRadialGradient(
              displayWidth / 2,
              displayHeight / 2,
              displayWidth * 0.25,
              displayWidth / 2,
              displayHeight / 2,
              displayWidth * 0.55
            );
            grad.addColorStop(0, 'rgba(5, 5, 5, 0)');
            grad.addColorStop(1, 'rgba(5, 5, 5, 0.45)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, displayWidth, displayHeight);
          } else {
            // Procedural High-Tech Canvas Fallback while loading
            ctx.fillStyle = '#05070c';
            ctx.fillRect(0, 0, displayWidth, displayHeight);

            // Radar Circle & Scan Crosshair
            ctx.strokeStyle = 'rgba(0, 242, 254, 0.25)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(displayWidth / 2, displayHeight / 2, 70, 0, Math.PI * 2);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(displayWidth / 2 - 80, displayHeight / 2);
            ctx.lineTo(displayWidth / 2 + 80, displayHeight / 2);
            ctx.moveTo(displayWidth / 2, displayHeight / 2 - 80);
            ctx.lineTo(displayWidth / 2, displayHeight / 2 + 80);
            ctx.stroke();

            // Telemetry Status Text
            ctx.fillStyle = '#00f2fe';
            ctx.font = '10px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('INITIALIZING 2D FRAME SEQUENCE...', displayWidth / 2, displayHeight / 2 + 105);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fillText(`${loadedCount} / ${totalFrames} FRAMES CACHED`, displayWidth / 2, displayHeight / 2 + 120);
          }

          ctx.restore();
        }
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [totalFrames, fit, mode, loadedCount, onFrameChange]);

  const rotationDeg = Math.round(scrubProgress * 360);

  return (
    <div
      ref={containerRef}
      className={`frame-scrubber-container ${className || ''}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: '#020305',
        ...style,
      }}
    >
      {/* 2D Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />

      {/* Monospace Telemetry HUD Overlay */}
      {overlayTelemetry && (
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            right: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            pointerEvents: 'none',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.68rem',
            color: 'rgba(255, 255, 255, 0.65)',
            letterSpacing: '0.08em',
            zIndex: 10,
          }}
        >
          {/* Left Block: Frame & Angle Metrics */}
          <div
            style={{
              background: 'rgba(3, 5, 8, 0.75)',
              backdropFilter: 'blur(8px)',
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid rgba(0, 242, 254, 0.2)',
            }}
          >
            <div style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
              {telemetryLabel}
            </div>
            <div>
              FRAME: <span style={{ color: '#fff' }}>{String(currentFrame).padStart(3, '0')}</span> / {String(totalFrames).padStart(3, '0')} // ROT: <span style={{ color: 'var(--accent-cyan)' }}>{rotationDeg}°</span>
            </div>
          </div>

          {/* Right Block: Scrub Rate & Mode */}
          <div
            style={{
              background: 'rgba(3, 5, 8, 0.75)',
              backdropFilter: 'blur(8px)',
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'right',
            }}
          >
            <div>
              MODE: <span style={{ color: '#fff' }}>{mode.toUpperCase()} SCRUB</span> // {fps} FPS
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.45)' }}>
              COORD: [{(mouseCoords.x).toFixed(2)}, {(mouseCoords.y).toFixed(2)}] // {isInteracting ? 'ACTIVE' : 'IDLE'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
