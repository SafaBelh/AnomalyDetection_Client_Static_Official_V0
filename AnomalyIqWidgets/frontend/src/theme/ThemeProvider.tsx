import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { Theme } from '../types';

// ─── Preset themes ────────────────────────────────────────────────────────────

export const lightTheme: Theme = {
  primaryColor: '#D94F3D', primaryDark: '#C84332', accentColor: '#f59e0b',
  background: '#F0EDE8', surface: 'rgba(255,255,255,0.72)', surfaceHover: 'rgba(217,79,61,0.04)',
  textPrimary: '#18191C', textSecondary: '#525761', textMuted: '#9CA3AF',
  borderColor: 'rgba(255,255,255,0.88)', borderRadius: '16px',
  danger: '#D94F3D', success: '#22C55E', warning: '#F59E0B', info: '#3B82F6',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontFamilyMono: "'JetBrains Mono', 'Fira Code', monospace",
};

// ─── Scoped theme context ─────────────────────────────────────────────────────
// Each app gets its own ThemeProvider instance with a unique CSS scope class.
// Widgets read vars via `.erp-scope-<id>` instead of :root, so apps never leak.

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  scopeClass: string;   // CSS class to put on the app root div
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  setTheme: () => {},
  scopeClass: 'theme-scope-default',
});

let scopeCounter = 0;

interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: Theme;
  scopeId?: string; // stable ID so SSR / hot-reload safe
}

export function ThemeProvider({ children, initialTheme = lightTheme, scopeId }: ThemeProviderProps) {
  const stableId = useRef(scopeId ?? `scope-${++scopeCounter}`);
  const scopeClass = `erp-theme-${stableId.current}`;
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const styleRef = useRef<HTMLStyleElement | null>(null);

  function buildCSS(t: Theme) {
    return `.${scopeClass} {
  --anomaly-primary-color: ${t.primaryColor};
  --anomaly-primary-dark: ${t.primaryDark};
  --anomaly-accent-color: ${t.accentColor};
  --anomaly-background: ${t.background};
  --anomaly-surface: ${t.surface};
  --anomaly-surface-hover: ${t.surfaceHover};
  --anomaly-text-primary: ${t.textPrimary};
  --anomaly-text-secondary: ${t.textSecondary};
  --anomaly-text-muted: ${t.textMuted};
  --anomaly-border-color: ${t.borderColor};
  --anomaly-border-radius: ${t.borderRadius};
  --anomaly-danger: ${t.danger};
  --anomaly-success: ${t.success};
  --anomaly-warning: ${t.warning};
  --anomaly-info: ${t.info};
  --anomaly-font-family: ${t.fontFamily};
  --anomaly-font-mono: ${t.fontFamilyMono};
}`;
  }

  useEffect(() => {
    if (!styleRef.current) {
      const el = document.createElement('style');
      el.setAttribute('data-erp-scope', stableId.current);
      document.head.appendChild(el);
      styleRef.current = el;
    }
    styleRef.current.textContent = buildCSS(theme);
    return () => {};
  }, [theme]);

  // Cleanup style tag on unmount
  useEffect(() => {
    return () => {
      styleRef.current?.remove();
      styleRef.current = null;
    };
  }, []);

  function setTheme(t: Theme) {
    setThemeState(t);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, scopeClass }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

// Convenience: wrap content with the scope class div
export function ThemeScope({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const { scopeClass, theme } = useTheme();
  return (
    <div
      className={scopeClass}
      style={{
        minHeight: '100%',
        background: 'var(--anomaly-background)',
        color: 'var(--anomaly-text-primary)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
