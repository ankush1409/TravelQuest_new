import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

console.log('TravelQuest: Starting full application...');



const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('TravelQuest: Root element not found');
  throw new Error('Root element not found');
}

console.log('TravelQuest: Creating React root...');
const root = createRoot(rootElement);

try {
  root.render(<App />);
  console.log('TravelQuest: Full application loaded successfully');
} catch (error) {
  console.error('TravelQuest: Failed to load app:', error);
  rootElement.innerHTML = `
    <div style="padding: 20px; background: linear-gradient(135deg, #0a0a0a, #1a1a1a); color: #fff; min-height: 100vh; text-align: center; font-family: system-ui;">
      <h1 style="color: #8B5CF6; font-size: 2.5rem; background: linear-gradient(135deg, #8B5CF6, #EC4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
        TravelQuest Loading Error
      </h1>
      <p style="font-size: 1.1rem; margin: 1rem 0;">The full app encountered an error. Reverting to fallback...</p>
      <button onclick="location.reload()" style="padding: 12px 24px; background: linear-gradient(135deg, #8B5CF6, #EC4899); color: white; border: none; border-radius: 12px; cursor: pointer; font-size: 1rem;">
        Retry Loading
      </button>
    </div>
  `;
}