import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Dev-only: expose stores for automated end-to-end checks.
if (import.meta.env.DEV) {
  void Promise.all([import('./stores/game'), import('./stores/player')]).then(
    ([g, p]) => {
      (window as unknown as Record<string, unknown>).__dojo = {
        game: g.useGame,
        player: p.usePlayer,
      };
    },
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
