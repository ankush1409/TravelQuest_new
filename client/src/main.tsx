import { createRoot } from 'react-dom/client';
import { useState, useEffect } from 'react';

console.log('TravelQuest: Starting application...');

function TravelQuestApp() {
  const [count, setCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    console.log('TravelQuest: React component mounted');
    setLoaded(true);
  }, []);

  return (
    <div style={{ 
      padding: '20px', 
      background: 'linear-gradient(135deg, #0a0a0a, #1a1a1a)', 
      color: 'white', 
      minHeight: '100vh', 
      fontFamily: 'system-ui' 
    }}>
      <h1 style={{ 
        color: '#8B5CF6', 
        fontSize: '3rem', 
        marginBottom: '1rem', 
        textAlign: 'center',
        background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        🚀 TravelQuest - Premium UI
      </h1>
      
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
          {loaded ? '✅ React working perfectly!' : '⏳ Loading...'}
        </p>
        
        <button 
          onClick={() => setCount(c => c + 1)}
          style={{ 
            padding: '12px 24px', 
            background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '12px', 
            fontSize: '1rem', 
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
            transition: 'all 0.2s ease'
          }}
        >
          Premium Button ({count} clicks)
        </button>
      </div>
      
      <div style={{ 
        background: 'linear-gradient(135deg, #1a1a1a, #2a2a2a)', 
        padding: '1.5rem', 
        borderRadius: '12px', 
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        border: '1px solid rgba(139, 92, 246, 0.2)'
      }}>
        <h3 style={{ color: '#06B6D4', marginBottom: '1rem' }}>
          ✨ Premium UI Features:
        </h3>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <div style={{ 
            padding: '0.75rem', 
            background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', 
            borderRadius: '8px' 
          }}>
            ✓ Modern gradient backgrounds
          </div>
          <div style={{ 
            padding: '0.75rem', 
            background: 'linear-gradient(135deg, #06B6D4, #10B981)', 
            borderRadius: '8px' 
          }}>
            ✓ Bold colors for new generation
          </div>
          <div style={{ 
            padding: '0.75rem', 
            background: 'linear-gradient(135deg, #F59E0B, #EF4444)', 
            borderRadius: '8px' 
          }}>
            ✓ Mobile-first responsive design
          </div>
        </div>
      </div>
      
      <div style={{ 
        textAlign: 'center', 
        padding: '1rem', 
        background: 'rgba(16, 185, 129, 0.1)', 
        borderRadius: '8px',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        marginTop: '2rem'
      }}>
        <p style={{ margin: 0, color: '#10B981', fontSize: '1.1rem' }}>
          🟢 TravelQuest Premium UI is now operational!
        </p>
      </div>
    </div>
  );
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('TravelQuest: Root element not found');
  throw new Error('Root element not found');
}

console.log('TravelQuest: Creating React root...');
const root = createRoot(rootElement);

try {
  root.render(<TravelQuestApp />);
  console.log('TravelQuest: Application rendered successfully');
} catch (error) {
  console.error('TravelQuest: Failed to render:', error);
  rootElement.innerHTML = `
    <div style="padding: 20px; background: #0a0a0a; color: #fff; min-height: 100vh; text-align: center;">
      <h1 style="color: #ef4444; font-size: 2rem;">TravelQuest Loading Error</h1>
      <p style="font-size: 1.1rem;">Failed to load the application. Please refresh.</p>
      <div style="color: #fbbf24; text-align: left; background: #1a1a1a; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
        <pre>${error.toString()}</pre>
      </div>
    </div>
  `;
}