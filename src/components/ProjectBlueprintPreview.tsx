import React from 'react';
import type { ProjectItem, EducationBranch } from '../types/portfolio';

export interface ProjectBlueprintPreviewProps {
  project: ProjectItem;
  branch?: EducationBranch;
  height?: number;
}

/**
 * ProjectBlueprintPreview
 * Renders an authentic, discipline-connected visual preview for each project card:
 * - Mechanical: Isometric CAD blueprint, dimension leader lines, and FEA stress metrics
 * - Mechatronics: Robotics kinematics coordinate frames, LiDAR radar reticle, and ROS bus telemetry
 * - Electrical/ECE: PCB copper trace layout, animated oscilloscope waveform, and voltage telemetry
 * - Civil: Structural BIM truss framework, axial load force vectors, and elevation markers
 * - CS & AI/ML: Neural network topology with glowing synapses, live API terminal, and code syntax
 * - Custom / Other: Precision technical schematic with discipline-tailored vector telemetry
 */
export const ProjectBlueprintPreview: React.FC<ProjectBlueprintPreviewProps> = ({
  project,
  branch = 'cs_it',
  height = 160,
}) => {
  const [imgError, setImgError] = React.useState(false);

  // If custom project image is explicitly provided by user, render with aspect-ratio cover and onError fallback
  if (project.imageUrl && !imgError) {
    return (
      <div
        style={{
          width: '100%',
          height: `${height}px`,
          aspectRatio: '16 / 9',
          borderRadius: '12px',
          overflow: 'hidden',
          position: 'relative',
          marginBottom: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <img
          src={project.imageUrl}
          alt={`${project.title} project illustration preview`}
          loading="lazy"
          onError={() => setImgError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(3, 5, 8, 0.8) 0%, transparent 60%)',
          }}
        />
      </div>
    );
  }

  // Branch-specific blueprint graphics
  return (
    <div
      style={{
        width: '100%',
        height: `${height}px`,
        borderRadius: '12px',
        overflow: 'hidden',
        position: 'relative',
        marginBottom: '20px',
        background: '#04070e',
        border: '1px solid rgba(0, 242, 254, 0.18)',
        boxShadow: 'inset 0 0 25px rgba(0, 0, 0, 0.8)',
      }}
    >
      {/* 1. MECHANICAL: CAD & FEA SIMULATION BLUEPRINT */}
      {branch === 'mechanical' && (
        <svg width="100%" height="100%" viewBox="0 0 400 160" preserveAspectRatio="xMidYMid meet">
          <defs>
            <pattern id="mechGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0, 242, 254, 0.08)" strokeWidth="0.8" />
            </pattern>
            <linearGradient id="feaGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#ffaa00" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ff0055" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#mechGrid)" />

          {/* Isometric Gear / Rotor Assembly Wireframe */}
          <g transform="translate(140, 80)">
            <ellipse cx="0" cy="0" rx="60" ry="32" fill="none" stroke="rgba(0, 242, 254, 0.4)" strokeWidth="1.5" strokeDasharray="4 2" />
            <ellipse cx="0" cy="0" rx="42" ry="22" fill="rgba(0, 242, 254, 0.05)" stroke="url(#feaGradient)" strokeWidth="2" />
            <ellipse cx="0" cy="0" rx="18" ry="10" fill="#04070e" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="1.2" />
            
            {/* Gear teeth rays */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              const x1 = Math.cos(rad) * 42;
              const y1 = Math.sin(rad) * 22;
              const x2 = Math.cos(rad) * 58;
              const y2 = Math.sin(rad) * 30;
              return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(0, 242, 254, 0.6)" strokeWidth="1.5" />;
            })}

            {/* Dimension leader lines */}
            <line x1="0" y1="0" x2="90" y2="-40" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="0.8" />
            <text x="94" y="-38" fill="var(--accent-cyan)" fontSize="9" fontFamily="JetBrains Mono, monospace">Ø84.00 ±0.02</text>
          </g>

          {/* FEA Stress Bar */}
          <rect x="320" y="24" width="8" height="110" rx="4" fill="url(#feaGradient)" />
          <text x="334" y="32" fill="#ff0055" fontSize="7.5" fontFamily="JetBrains Mono">MAX 340 MPa</text>
          <text x="334" y="132" fill="#00f2fe" fontSize="7.5" fontFamily="JetBrains Mono">MIN 0 MPa</text>
          
          {/* CAD Label */}
          <text x="16" y="24" fill="rgba(255,255,255,0.7)" fontSize="8.5" fontFamily="JetBrains Mono" letterSpacing="1">
            CAD // SOLIDWORKS GEOMETRY // FEA SIMULATION
          </text>
        </svg>
      )}

      {/* 2. MECHATRONICS: ROBOTICS & LIDAR SENSORS */}
      {branch === 'mechatronics' && (
        <svg width="100%" height="100%" viewBox="0 0 400 160" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="lidarRadar" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(0, 242, 254, 0.2)" />
              <stop offset="80%" stopColor="rgba(0, 242, 254, 0.02)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          {/* Radar Circles */}
          <g transform="translate(110, 80)">
            <circle cx="0" cy="0" r="65" fill="none" stroke="rgba(0, 242, 254, 0.15)" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="0" cy="0" r="45" fill="none" stroke="rgba(0, 242, 254, 0.25)" strokeWidth="1" />
            <circle cx="0" cy="0" r="25" fill="url(#lidarRadar)" stroke="rgba(0, 242, 254, 0.5)" strokeWidth="1.2" />
            <circle cx="0" cy="0" r="4" fill="var(--accent-cyan)" />
            
            {/* Crosshairs */}
            <line x1="-70" y1="0" x2="70" y2="0" stroke="rgba(0, 242, 254, 0.2)" strokeWidth="1" />
            <line x1="0" y1="-70" x2="0" y2="70" stroke="rgba(0, 242, 254, 0.2)" strokeWidth="1" />

            {/* Sweep arm */}
            <line x1="0" y1="0" x2="45" y2="-45" stroke="var(--accent-cyan)" strokeWidth="1.8" />
            {/* Detected clusters */}
            <circle cx="32" cy="-28" r="3" fill="#ff0055" />
            <circle cx="-35" cy="18" r="2.5" fill="#00f2fe" />
          </g>

          {/* 6-DOF Kinematics Arm Outline */}
          <g transform="translate(260, 40)" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="1.5" fill="none">
            <polyline points="0,90 35,60 75,70 100,30" />
            <circle cx="0" cy="90" r="4" fill="var(--accent-cyan)" />
            <circle cx="35" cy="60" r="3" fill="#fff" />
            <circle cx="75" cy="70" r="3" fill="#fff" />
            <circle cx="100" cy="30" r="4" fill="#ff0055" />
          </g>

          {/* Telemetry readouts */}
          <text x="230" y="130" fill="var(--accent-cyan)" fontSize="8.5" fontFamily="JetBrains Mono">
            ROS2 // JOINT_01: +42.5° | PWM: 1520µs
          </text>
          <text x="16" y="24" fill="rgba(255,255,255,0.7)" fontSize="8.5" fontFamily="JetBrains Mono" letterSpacing="1">
            ROBOTICS // KINEMATICS & SENSOR SUITE
          </text>
        </svg>
      )}

      {/* 3. ELECTRICAL: CIRCUITS & OSCILLOSCOPE WAVEFORM */}
      {branch === 'electrical_ece' && (
        <svg width="100%" height="100%" viewBox="0 0 400 160" preserveAspectRatio="xMidYMid meet">
          {/* PCB Grid Bus */}
          <g stroke="rgba(0, 242, 254, 0.15)" strokeWidth="1" fill="none">
            <line x1="20" y1="40" x2="160" y2="40" />
            <line x1="160" y1="40" x2="190" y2="70" />
            <line x1="190" y1="70" x2="280" y2="70" />
            <line x1="20" y1="120" x2="140" y2="120" />
            <line x1="140" y1="120" x2="170" y2="90" />
            <line x1="170" y1="90" x2="280" y2="90" />
          </g>
          {/* PCB Vias */}
          <circle cx="160" cy="40" r="3" fill="#04070e" stroke="var(--accent-cyan)" strokeWidth="1.5" />
          <circle cx="190" cy="70" r="3" fill="#04070e" stroke="var(--accent-cyan)" strokeWidth="1.5" />
          <circle cx="140" cy="120" r="3" fill="#04070e" stroke="var(--accent-magenta)" strokeWidth="1.5" />

          {/* IC Package Graphic */}
          <rect x="50" y="60" width="60" height="40" rx="4" fill="rgba(0, 242, 254, 0.08)" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1.2" />
          <text x="62" y="84" fill="#fff" fontSize="8" fontFamily="JetBrains Mono">MCU 32-BIT</text>

          {/* Oscilloscope Waveform */}
          <g transform="translate(230, 40)">
            <rect width="150" height="70" rx="6" fill="rgba(0,0,0,0.5)" stroke="rgba(0, 242, 254, 0.3)" />
            <path
              d="M 10 35 Q 25 10 40 35 T 70 35 T 100 35 T 130 35"
              fill="none"
              stroke="var(--accent-cyan)"
              strokeWidth="1.8"
            />
            <path
              d="M 10 50 L 30 50 L 30 20 L 60 20 L 60 50 L 90 50 L 90 20 L 120 20 L 120 50 L 140 50"
              fill="none"
              stroke="#ff0055"
              strokeWidth="1.2"
              strokeOpacity="0.8"
            />
          </g>

          <text x="16" y="24" fill="rgba(255,255,255,0.7)" fontSize="8.5" fontFamily="JetBrains Mono" letterSpacing="1">
            CIRCUITS // PCB BUS // 48.0 MHz SPI SIGNAL
          </text>
        </svg>
      )}

      {/* 4. CIVIL: STRUCTURAL BIM & TRUSS BLUEPRINT */}
      {branch === 'civil' && (
        <svg width="100%" height="100%" viewBox="0 0 400 160" preserveAspectRatio="xMidYMid meet">
          <defs>
            <pattern id="civilGrid" width="25" height="25" patternUnits="userSpaceOnUse">
              <path d="M 25 0 L 0 0 0 25" fill="none" stroke="rgba(0, 242, 254, 0.06)" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#civilGrid)" />

          {/* Structural Warren Truss Framework */}
          <g transform="translate(40, 50)" stroke="var(--accent-cyan)" strokeWidth="1.8" fill="none">
            {/* Bottom Chord */}
            <line x1="0" y1="60" x2="300" y2="60" stroke="#fff" strokeWidth="2" />
            {/* Top Chord */}
            <line x1="50" y1="15" x2="250" y2="15" stroke="#fff" strokeWidth="2" />
            {/* Web Members */}
            <polyline points="0,60 50,15 100,60 150,15 200,60 250,15 300,60" stroke="rgba(0, 242, 254, 0.7)" />
            {/* Vertical Posts */}
            <line x1="100" y1="60" x2="100" y2="15" stroke="rgba(255, 0, 85, 0.7)" strokeDasharray="3 2" />
            <line x1="200" y1="60" x2="200" y2="15" stroke="rgba(255, 0, 85, 0.7)" strokeDasharray="3 2" />

            {/* Nodes */}
            {[0, 50, 100, 150, 200, 250, 300].map((x, i) => (
              <circle key={i} cx={x} cy={x % 100 === 0 ? 60 : 15} r="3" fill="#04070e" stroke="#fff" strokeWidth="1.5" />
            ))}
          </g>

          {/* Load Vector Arrows */}
          <g fill="var(--accent-magenta)">
            <polygon points="190,45 194,55 186,55" />
            <polygon points="240,45 244,55 236,55" />
          </g>
          <text x="250" y="48" fill="#ff0055" fontSize="8" fontFamily="JetBrains Mono">P = 450 kN</text>

          <text x="16" y="24" fill="rgba(255,255,255,0.7)" fontSize="8.5" fontFamily="JetBrains Mono" letterSpacing="1">
            BIM // STRUCTURAL TRUSS ANALYSIS // EL +18.50 m
          </text>
        </svg>
      )}

      {/* 5. CS, AI/ML & DEFAULT: NEURAL TOPOLOGY & CODE TERMINAL */}
      {(branch === 'cs_it' ||
        (branch !== 'mechanical' && branch !== 'mechatronics' && branch !== 'electrical_ece' && branch !== 'civil')) && (
        <svg width="100%" height="100%" viewBox="0 0 400 160" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="neuralGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ff0055" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Neural Network Nodes & Synapses */}
          <g transform="translate(30, 35)">
            {/* Synaptic links */}
            {[
              [0, 20, 50, 10], [0, 20, 50, 40], [0, 20, 50, 70],
              [0, 55, 50, 10], [0, 55, 50, 40], [0, 55, 50, 70],
              [50, 10, 100, 25], [50, 40, 100, 25], [50, 70, 100, 25],
              [50, 10, 100, 60], [50, 40, 100, 60], [50, 70, 100, 60],
              [100, 25, 140, 40], [100, 60, 140, 40],
            ].map(([x1, y1, x2, y2], i) => (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(0, 242, 254, 0.25)" strokeWidth="1" />
            ))}

            {/* Input Layer */}
            <circle cx="0" cy="20" r="4.5" fill="#04070e" stroke="var(--accent-cyan)" strokeWidth="1.8" />
            <circle cx="0" cy="55" r="4.5" fill="#04070e" stroke="var(--accent-cyan)" strokeWidth="1.8" />

            {/* Hidden Layer 1 */}
            <circle cx="50" cy="10" r="4" fill="var(--accent-cyan)" />
            <circle cx="50" cy="40" r="4" fill="var(--accent-cyan)" />
            <circle cx="50" cy="70" r="4" fill="var(--accent-cyan)" />

            {/* Hidden Layer 2 */}
            <circle cx="100" cy="25" r="4" fill="#ff0055" />
            <circle cx="100" cy="60" r="4" fill="#ff0055" />

            {/* Output Node */}
            <circle cx="140" cy="40" r="5" fill="#04070e" stroke="#ff0055" strokeWidth="2" />
          </g>

          {/* Embedded Code Console Snippet */}
          <g transform="translate(195, 30)">
            <rect width="185" height="100" rx="6" fill="rgba(2, 4, 8, 0.85)" stroke="rgba(255, 255, 255, 0.12)" />
            <circle cx="12" cy="12" r="3" fill="#ff5f56" />
            <circle cx="22" cy="12" r="3" fill="#ffbd2e" />
            <circle cx="32" cy="12" r="3" fill="#27c93f" />

            <text x="12" y="34" fill="rgba(255,255,255,0.4)" fontSize="7.5" fontFamily="JetBrains Mono">
              1 | async function infer(x) {'{'}
            </text>
            <text x="12" y="50" fill="var(--accent-cyan)" fontSize="7.5" fontFamily="JetBrains Mono">
              2 |   const out = await model(x);
            </text>
            <text x="12" y="66" fill="#ff0055" fontSize="7.5" fontFamily="JetBrains Mono">
              3 |   return {'{'} p99: "18ms", f1: 0.94 {'}'};
            </text>
            <text x="12" y="82" fill="rgba(255,255,255,0.4)" fontSize="7.5" fontFamily="JetBrains Mono">
              4 | {'}'}
            </text>
          </g>

          <text x="16" y="24" fill="rgba(255,255,255,0.7)" fontSize="8.5" fontFamily="JetBrains Mono" letterSpacing="1">
            SYSTEM // NEURAL ARCHITECTURE & CODE PIPELINE
          </text>
        </svg>
      )}

      {/* Interactive Scanline & Specular Gradient Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(4, 7, 14, 0.8) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          right: '12px',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.65rem',
          color: 'var(--accent-cyan)',
          letterSpacing: '0.08em',
          pointerEvents: 'none',
        }}
      >
        {branch.toUpperCase()} // BLUEPRINT
      </div>
    </div>
  );
};
