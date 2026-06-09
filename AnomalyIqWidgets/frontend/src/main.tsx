import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { api } from './api';
import { AskGoApp, askGoTheme } from './apps/askgo/AskGoApp';
import './index.css';
import { ThemeProvider, ThemeScope } from './theme/ThemeProvider';
import WidgetsApp from './WidgetsApp';
import { registerAnomalyWidgets } from './widgets/registerWebComponents';

registerAnomalyWidgets();

function StandaloneAskGo() {
  const [token, setToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    api.ssoExchange(ctrl.signal)
      .then(response => setToken(response.token))
      .catch(error => {
        if (error.name !== 'AbortError') setTokenError('Backend non disponible — démarrez le backend sur le port 3001.');
      });
    return () => ctrl.abort();
  }, []);

  if (tokenError) {
    return <div style={{ padding: 24, fontFamily: 'Arial, sans-serif', color: '#cc0000' }}>{tokenError}</div>;
  }

  if (!token) {
    return <div style={{ padding: 24, fontFamily: 'Arial, sans-serif' }}>Connexion Ask&amp;Go…</div>;
  }

  return (
    <ThemeProvider scopeId="askgo-standalone" initialTheme={askGoTheme}>
      <ThemeScope>
        <AskGoApp token={token} />
      </ThemeScope>
    </ThemeProvider>
  );
}

function Root() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';

  if (path === '/askgo') return <StandaloneAskGo />;

  return <WidgetsApp />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
