import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>

        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <span style={styles.logoIcon}>⚖</span>
          <div>
            <span style={styles.logoText}>OAMS</span>
            <span style={styles.logoSub}>Auction Platform</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div style={styles.links}>
          <Link to="/" style={{ ...styles.link, ...(isActive('/') ? styles.linkActive : {}) }}>
            Auctions
          </Link>

          {user && !isAdmin && (
            <Link to="/dashboard" style={{ ...styles.link, ...(isActive('/dashboard') ? styles.linkActive : {}) }}>
              My Bids
            </Link>
          )}

          {isAdmin && (
            <>
              <Link to="/admin"          style={{ ...styles.link, ...(isActive('/admin') ? styles.linkActive : {}) }}>Dashboard</Link>
              <Link to="/admin/auctions" style={{ ...styles.link, ...(isActive('/admin/auctions') ? styles.linkActive : {}) }}>Auctions</Link>
              <Link to="/admin/bids"     style={{ ...styles.link, ...(isActive('/admin/bids') ? styles.linkActive : {}) }}>Bids</Link>
              <Link to="/admin/reports"  style={{ ...styles.link, ...(isActive('/admin/reports') ? styles.linkActive : {}) }}>Reports</Link>
            </>
          )}
        </div>

        {/* Right side */}
        <div style={styles.right}>
          {user ? (
            <div style={styles.userMenu}>
              <div style={styles.userInfo}>
                <div style={styles.avatar}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div style={styles.userDetails}>
                  <span style={styles.userName}>{user.name}</span>
                  <span style={styles.userRole}>{user.role}</span>
                </div>
              </div>
              <button onClick={handleLogout} style={styles.logoutBtn}>
                Logout
              </button>
            </div>
          ) : (
            <div style={styles.authBtns}>
              <Link to="/login"    style={styles.loginBtn}>Login</Link>
              <Link to="/register" style={styles.registerBtn}>Get Started</Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};

const styles = {
  nav: {
    background: 'var(--navy)',
    borderBottom: '1px solid var(--navy-light)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 20px rgba(26,43,76,0.3)',
  },
  inner: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '24px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    flexShrink: 0,
  },
  logoIcon: {
    fontSize: '24px',
    color: 'var(--coral)',
  },
  logoText: {
    display: 'block',
    fontSize: '18px',
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: '1px',
    lineHeight: 1,
    fontFamily: 'var(--font-serif)',
  },
  logoSub: {
    display: 'block',
    fontSize: '9px',
    color: 'var(--slate-light)',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    marginTop: '2px',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flex: 1,
    justifyContent: 'center',
  },
  link: {
    color: 'rgba(255,255,255,0.65)',
    textDecoration: 'none',
    padding: '6px 14px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'var(--transition)',
    letterSpacing: '0.2px',
  },
  linkActive: {
    color: '#FFFFFF',
    background: 'rgba(255,255,255,0.1)',
  },
  right: {
    flexShrink: 0,
  },
  userMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatar: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: 'var(--coral)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '14px',
    flexShrink: 0,
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 1.2,
  },
  userRole: {
    fontSize: '10px',
    color: 'var(--slate-light)',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
  },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.2)',
    color: 'rgba(255,255,255,0.7)',
    padding: '6px 14px',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    transition: 'var(--transition)',
  },
  authBtns: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  loginBtn: {
    color: 'rgba(255,255,255,0.75)',
    padding: '7px 16px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13px',
    fontWeight: '500',
    border: '1px solid rgba(255,255,255,0.2)',
    transition: 'var(--transition)',
  },
  registerBtn: {
    background: 'var(--coral)',
    color: '#fff',
    padding: '7px 18px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'var(--transition)',
    boxShadow: '0 2px 8px rgba(255,107,107,0.35)',
  },
};

export default Navbar;