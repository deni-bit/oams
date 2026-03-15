import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>🔨 OAMS</Link>

      <div style={styles.links}>
        <Link to="/" style={styles.link}>Auctions</Link>

        {user && !isAdmin && (
          <Link to="/dashboard" style={styles.link}>My Bids</Link>
        )}

        {isAdmin && (
          <>
            <Link to="/admin"           style={styles.link}>Dashboard</Link>
            <Link to="/admin/auctions"  style={styles.link}>Manage Auctions</Link>
            <Link to="/admin/bids"      style={styles.link}>Manage Bids</Link>
            <Link to="/admin/reports"   style={styles.link}>Reports</Link>
          </>
        )}

        {user ? (
          <div style={styles.userArea}>
            <span style={styles.userName}>👤 {user.name}</span>
            <span style={styles.role}>{user.role}</span>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </div>
        ) : (
          <div style={styles.userArea}>
            <Link to="/login"    style={styles.authBtn}>Login</Link>
            <Link to="/register" style={{ ...styles.authBtn, ...styles.registerBtn }}>Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 32px', height: '60px', background: '#1a1a2e',
    color: '#fff', position: 'sticky', top: 0, zIndex: 100,
    boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
  },
  logo: {
    fontSize: '20px', fontWeight: 'bold', color: '#e2b96f',
    textDecoration: 'none', letterSpacing: '1px',
  },
  links:      { display: 'flex', alignItems: 'center', gap: '8px' },
  link: {
    color: '#ccc', textDecoration: 'none', padding: '6px 12px',
    borderRadius: '6px', fontSize: '14px', transition: 'all 0.2s',
  },
  userArea:   { display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '16px' },
  userName:   { fontSize: '13px', color: '#e2b96f' },
  role: {
    fontSize: '11px', background: '#333', color: '#aaa',
    padding: '2px 8px', borderRadius: '10px', textTransform: 'uppercase',
  },
  logoutBtn: {
    background: 'transparent', border: '1px solid #e74c3c', color: '#e74c3c',
    padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px',
  },
  authBtn: {
    color: '#ccc', textDecoration: 'none', padding: '6px 14px',
    borderRadius: '6px', fontSize: '13px', border: '1px solid #555',
  },
  registerBtn: {
    background: '#e2b96f', color: '#1a1a2e', border: 'none', fontWeight: '600',
  },
};

export default Navbar;