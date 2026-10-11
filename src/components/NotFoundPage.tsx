import React from 'react';
import { Home, ArrowLeft, Terminal } from 'lucide-react';

interface NotFoundPageProps {
  onGoHome: () => void;
  title?: string;
  message?: string;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  onGoHome,
  title = 'Coordinate Vector Unreachable',
  message = 'The requested portfolio route or deep-link does not exist in the active 3D portfolio workspace.',
}) => {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#030712',
        color: '#ffffff',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Radial Glow & Technical Grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 50% 50%, rgba(0, 242, 254, 0.08) 0%, rgba(3, 7, 18, 0.95) 75%), linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 48px 48px, 48px 48px',
          pointerEvents: 'none',
        }}
      />

      <div
        className="glass-panel"
        style={{
          maxWidth: '560px',
          width: '100%',
          padding: '48px 36px',
          borderRadius: '24px',
          background: 'rgba(9, 13, 22, 0.85)',
          border: '1px solid rgba(0, 242, 254, 0.25)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 242, 254, 0.15)',
          textAlign: 'center',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Status Tag */}
        <div
          className="badge-magenta"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px',
            padding: '6px 14px',
          }}
        >
          <Terminal size={14} />
          <span>ERROR 404 // ROUTE NOT FOUND</span>
        </div>

        {/* Big Glitch 404 Display */}
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(3.5rem, 10vw, 5.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            margin: '0 0 16px 0',
            lineHeight: 1,
            background: 'linear-gradient(135deg, #ffffff 30%, var(--accent-cyan) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          404
        </h1>

        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.25rem',
            fontWeight: 600,
            color: '#ffffff',
            marginBottom: '12px',
          }}
        >
          {title}
        </h2>

        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.92rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: '32px',
          }}
        >
          {message}
        </p>

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => window.history.back()}
            style={{
              padding: '12px 20px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <ArrowLeft size={16} />
            <span>GO BACK</span>
          </button>

          <button
            onClick={onGoHome}
            className="btn-primary"
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
            }}
          >
            <Home size={16} />
            <span>RETURN TO PORTFOLIO</span>
          </button>
        </div>
      </div>
    </div>
  );
};
