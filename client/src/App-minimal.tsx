import { useState, useEffect } from "react";

function SimpleApp() {
  useEffect(() => {
    console.log("React app is mounting successfully!");
  }, []);
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: '20px', background: '#0a0a0a', color: '#fff', minHeight: '100vh' }}>
      <h1 style={{ color: '#8B5CF6', fontSize: '3rem', marginBottom: '1rem' }}>
        TravelQuest Loading Test
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
        If you can see this, React is working! Count: {count}
      </p>
      <button 
        onClick={() => setCount(c => c + 1)}
        style={{ 
          padding: '12px 24px', 
          background: '#8B5CF6', 
          color: 'white', 
          border: 'none', 
          borderRadius: '8px',
          fontSize: '1rem',
          cursor: 'pointer'
        }}
      >
        Click me: {count}
      </button>
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#1a1a1a', borderRadius: '8px' }}>
        <h3>Premium UI Features:</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ padding: '0.5rem', background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', margin: '0.5rem 0', borderRadius: '6px' }}>
            ✓ Modern gradient backgrounds
          </li>
          <li style={{ padding: '0.5rem', background: 'linear-gradient(135deg, #06B6D4, #10B981)', margin: '0.5rem 0', borderRadius: '6px' }}>
            ✓ Bold colors for new generation
          </li>
          <li style={{ padding: '0.5rem', background: 'linear-gradient(135deg, #F59E0B, #EF4444)', margin: '0.5rem 0', borderRadius: '6px' }}>
            ✓ Mobile-first responsive design
          </li>
        </ul>
      </div>
    </div>
  );
}

export default SimpleApp;