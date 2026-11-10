export default function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f1f0ed',
    }}>
      <div style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px' }}>
        Story Desk
      </div>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid #d3d1cb',
        borderTop: '3px solid oklch(0.52 0.23 277)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
