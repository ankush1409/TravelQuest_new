export function SimpleLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500 mx-auto mb-4"></div>
        <h2 style={{ 
          background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '1.5rem',
          fontWeight: 'bold'
        }}>
          Loading TravelQuest...
        </h2>
        <p className="text-slate-400 mt-2">Preparing your premium travel experience</p>
      </div>
    </div>
  );
}

export function SimpleError({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 p-6">
      <div className="text-center max-w-md">
        <h1 style={{ 
          background: 'linear-gradient(135deg, #EF4444, #DC2626)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '1rem'
        }}>
          App Error
        </h1>
        <p className="text-slate-300 mb-4">
          TravelQuest encountered an error while loading. Please try refreshing the page.
        </p>
        <div className="bg-slate-800/50 p-4 rounded-lg mb-6 text-left">
          <p className="text-red-400 text-sm font-mono">
            {error.message}
          </p>
        </div>
        <button
          onClick={onRetry || (() => window.location.reload())}
          style={{
            background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            color: 'white',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
          }}
        >
          Retry Loading
        </button>
      </div>
    </div>
  );
}