import { Palette, Type, Check } from 'lucide-react';
import {
  CURATED_THEME_PRESETS,
  AVAILABLE_HEADING_FONTS,
  AVAILABLE_BODY_FONTS,
} from '../types/themeTokens';
import { usePortfolioStore } from '../store/portfolioStore';

export const ThemeCustomizer: React.FC = () => {
  const { themeTokens, setThemeTokens, applyThemePreset } = usePortfolioStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Curated Presets Grid */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Palette size={16} color="var(--accent-cyan)" />
          <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#fff', fontFamily: 'var(--font-heading)' }}>
            Curated Theme Presets
          </h4>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
          }}
        >
          {CURATED_THEME_PRESETS.map((preset) => {
            const isSelected = themeTokens.id === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyThemePreset(preset.id)}
                style={{
                  background: isSelected ? 'rgba(0, 242, 254, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                  border: isSelected ? '2px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  padding: '14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                    {preset.name}
                  </span>
                  {isSelected && <Check size={14} color="var(--accent-cyan)" />}
                </div>

                {/* Swatches Preview */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: preset.accentPrimary,
                      boxShadow: `0 0 8px ${preset.accentPrimary}44`,
                    }}
                  />
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: preset.accentSecondary,
                    }}
                  />
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: preset.bgPrimary,
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Color Controls */}
      <div
        style={{
          padding: '18px',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Palette size={16} color="var(--accent-cyan)" />
          <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#fff', fontFamily: 'var(--font-heading)' }}>
            Custom Color Palette
          </h4>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          {/* Primary Accent */}
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
              PRIMARY ACCENT
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="color"
                value={themeTokens.accentPrimary}
                onChange={(e) => setThemeTokens({ accentPrimary: e.target.value })}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  background: 'transparent',
                }}
              />
              <input
                type="text"
                value={themeTokens.accentPrimary}
                onChange={(e) => setThemeTokens({ accentPrimary: e.target.value })}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  background: 'rgba(5, 7, 12, 0.8)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                }}
              />
            </div>
          </div>

          {/* Secondary Accent */}
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
              SECONDARY ACCENT
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="color"
                value={themeTokens.accentSecondary}
                onChange={(e) => setThemeTokens({ accentSecondary: e.target.value })}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  background: 'transparent',
                }}
              />
              <input
                type="text"
                value={themeTokens.accentSecondary}
                onChange={(e) => setThemeTokens({ accentSecondary: e.target.value })}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  background: 'rgba(5, 7, 12, 0.8)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                }}
              />
            </div>
          </div>

          {/* Canvas Background */}
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
              CANVAS BACKGROUND
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="color"
                value={themeTokens.bgPrimary}
                onChange={(e) => setThemeTokens({ bgPrimary: e.target.value })}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  background: 'transparent',
                }}
              />
              <input
                type="text"
                value={themeTokens.bgPrimary}
                onChange={(e) => setThemeTokens({ bgPrimary: e.target.value })}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  background: 'rgba(5, 7, 12, 0.8)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Typography & Border Radius */}
      <div
        style={{
          padding: '18px',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Type size={16} color="var(--accent-cyan)" />
          <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#fff', fontFamily: 'var(--font-heading)' }}>
            Typography & Shape Tokens
          </h4>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          {/* Heading Font */}
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
              HEADING FONT
            </label>
            <select
              value={themeTokens.headingFont}
              onChange={(e) => setThemeTokens({ headingFont: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(5, 7, 12, 0.8)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '6px',
                color: '#fff',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem',
              }}
            >
              {AVAILABLE_HEADING_FONTS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          {/* Body Font */}
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
              BODY FONT
            </label>
            <select
              value={themeTokens.bodyFont}
              onChange={(e) => setThemeTokens({ bodyFont: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(5, 7, 12, 0.8)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '6px',
                color: '#fff',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem',
              }}
            >
              {AVAILABLE_BODY_FONTS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          {/* Border Radius */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-mono)' }}>
                BORDER RADIUS
              </label>
              <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                {themeTokens.borderRadius}px
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="24"
              value={themeTokens.borderRadius}
              onChange={(e) => setThemeTokens({ borderRadius: Number(e.target.value) })}
              style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
            />
          </div>

          {/* Spacing Density */}
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
              SPACING DENSITY
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['compact', 'normal', 'spacious'] as const).map((density) => (
                <button
                  key={density}
                  type="button"
                  onClick={() => setThemeTokens({ spacingDensity: density })}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '6px',
                    border: themeTokens.spacingDensity === density ? '1px solid var(--accent-cyan)' : '1px solid rgba(255,255,255,0.1)',
                    background: themeTokens.spacingDensity === density ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255,255,255,0.03)',
                    color: themeTokens.spacingDensity === density ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.7)',
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-mono)',
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                  }}
                >
                  {density}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
