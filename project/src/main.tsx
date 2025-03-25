import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { errorHandler } from './lib/errorHandler';
import App from './App.tsx';
import './index.css';

// Initialize error handling
window.onerror = (message, source, lineno, colno, error) => {
  errorHandler.handleError(error || new Error(message as string));
};

window.onunhandledrejection = (event) => {
  errorHandler.handleError(event.reason);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);