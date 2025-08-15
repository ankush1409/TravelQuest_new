import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

console.log('TravelQuest: Loading application...');

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);

try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('TravelQuest: Application loaded successfully');
} catch (error) {
  console.error('TravelQuest: Failed to load application:', error);
  rootElement.innerHTML = `
    <div style="padding: 20px; background: #0a0a0a; color: #fff; min-height: 100vh; text-align: center;">
      <h1 style="color: #ef4444;">App Loading Error</h1>
      <p>Failed to load TravelQuest. Please refresh the page.</p>
      <pre style="color: #fbbf24; text-align: left; background: #1a1a1a; padding: 1rem; border-radius: 8px;">${error}</pre>
    </div>
  `;
}