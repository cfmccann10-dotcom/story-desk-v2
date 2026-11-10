import { Link, useLocation } from 'react-router-dom';

export default function NavBar() {
  const location = useLocation();

  const links = [
    { path: '/submit', label: 'Submit Story' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/board', label: 'Kanban Board' },
    { path: '/bank', label: 'Story Bank' },
    { path: '/reports', label: 'Reports' },
    { path: '/settings', label: 'Settings' },
  ];

  return (
    <div className="navbar" style={{
      background: '#fff',
      borderBottom: '1px solid #e0dfd9',
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      overflowX: 'auto',
      justifyContent: 'flex-start'
    }}>
      <div style={{
        fontSize: '18px',
        fontWeight: 800,
        letterSpacing: '-.02em',
        color: '#17181a',
        whiteSpace: 'nowrap',
        flexShrink: 0
      }}>
        Story Desk
      </div>

      <div className="navbar-links" style={{ display: 'flex', gap: '16px', flex: 1, overflowX: 'auto', alignItems: 'center' }}>
        {links.map(link => (
          <Link
            key={link.path}
            to={link.path}
            style={{
              color: location.pathname === link.path ? 'oklch(0.52 0.23 277)' : '#8b8b88',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: location.pathname === link.path ? 600 : 500,
              transition: 'color 0.2s',
              borderBottom: location.pathname === link.path ? '2px solid oklch(0.52 0.23 277)' : 'none',
              paddingBottom: location.pathname === link.path ? '2px' : '0',
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
