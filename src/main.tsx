import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';

import App from './App.tsx';
import './index.css';

function BackButtonHandler() {
  useEffect(() => {
    CapacitorApp.addListener('backButton', () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        CapacitorApp.exitApp();
      }
    });
  }, []);

  return null;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <BackButtonHandler />
      <App />
    </HashRouter>
  </StrictMode>,
);