console.log("=== DEBUGGING: Main.tsx script is executing ===");

// Test basic DOM manipulation first
const rootElement = document.getElementById("root");
console.log("Root element found:", rootElement);

if (rootElement) {
  console.log("Setting basic HTML content...");
  rootElement.innerHTML = `
    <div style="padding: 20px; background: linear-gradient(135deg, #0a0a0a, #1a1a1a); color: white; min-height: 100vh; font-family: system-ui;">
      <h1 style="color: #8B5CF6; font-size: 3rem; margin-bottom: 1rem; text-align: center;">
        🚀 TravelQuest - Loading Test
      </h1>
      <div style="text-align: center; margin-bottom: 2rem;">
        <p style="font-size: 1.2rem; margin-bottom: 1rem;">Basic DOM manipulation is working!</p>
        <button id="testBtn" style="padding: 12px 24px; background: linear-gradient(135deg, #8B5CF6, #EC4899); color: white; border: none; border-radius: 12px; font-size: 1rem; cursor: pointer; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);">
          Click Me (Count: <span id="counter">0</span>)
        </button>
      </div>
      <div style="background: linear-gradient(135deg, #1a1a1a, #2a2a2a); padding: 1.5rem; border-radius: 12px; margin: 2rem 0; box-shadow: 0 8px 32px rgba(0,0,0,0.3);">
        <h3 style="color: #06B6D4; margin-bottom: 1rem;">✨ Premium UI Features Status:</h3>
        <div style="display: grid; gap: 0.5rem;">
          <div style="padding: 0.75rem; background: linear-gradient(135deg, #8B5CF6, #EC4899); border-radius: 8px;">✓ Modern gradient backgrounds</div>
          <div style="padding: 0.75rem; background: linear-gradient(135deg, #06B6D4, #10B981); border-radius: 8px;">✓ Bold colors for new generation</div>
          <div style="padding: 0.75rem; background: linear-gradient(135deg, #F59E0B, #EF4444); border-radius: 8px;">✓ Mobile-first responsive design</div>
          <div style="padding: 0.75rem; background: linear-gradient(135deg, #10B981, #059669); border-radius: 8px;">✓ Interactive elements working</div>
        </div>
      </div>
      <div id="status" style="text-align: center; padding: 1rem; background: rgba(139, 92, 246, 0.1); border-radius: 8px; border: 1px solid rgba(139, 92, 246, 0.3);">
        <p style="margin: 0; color: #10B981;">🟢 Basic loading successful - Now testing React...</p>
      </div>
    </div>
  `;
  
  // Add click functionality
  let count = 0;
  const btn = document.getElementById("testBtn");
  const counter = document.getElementById("counter");
  const status = document.getElementById("status");
  
  if (btn && counter) {
    btn.addEventListener("click", () => {
      count++;
      counter.textContent = count.toString();
      if (count === 1) {
        status.innerHTML = '<p style="margin: 0; color: #10B981;">🟢 JavaScript interactivity working - Loading React now...</p>';
        setTimeout(loadReact, 1000);
      }
    });
  }
} else {
  console.error("Root element not found!");
  document.body.innerHTML = '<h1 style="color: red;">ERROR: Root element not found!</h1>';
}

// Function to load React after basic test
async function loadReact() {
  try {
    console.log("Loading React modules...");
    const { createRoot } = await import("react-dom/client");
    const { default: App } = await import("./App-minimal");
    
    console.log("React modules loaded, creating root...");
    const root = createRoot(rootElement!);
    root.render(<App />);
    console.log("React app mounted successfully!");
  } catch (error: any) {
    console.error("Error loading React:", error);
    document.getElementById("status")!.innerHTML = 
      `<p style="margin: 0; color: #EF4444;">🔴 Error loading React: ${error?.message || 'Unknown error'}</p>`;
  }
}
