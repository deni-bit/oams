import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isSeller = user?.role === 'seller';
  const isBuyer  = user?.role === 'buyer';

  return (
    <nav style={styles.nav}>

      {/* Logo */}
      <Link to="/" style={styles.logo}>🔨 OAMS</Link>

      {/* Nav links */}
      <div style={styles.links}>
        <Link to="/" style={styles.link}>Auctions</Link>

        {/* Buyer links */}
        {isBuyer && (
          <Link to="/dashboard" style={styles.link}>My Bids</Link>
        )}

        {/* Seller links */}
        {isSeller && (
          <>
            <Link to="/seller"                 style={styles.link}>Dashboard</Link>
            <Link to="/seller/listings"        style={styles.link}>My Listings</Link>
            <Link to="/seller/listings/create" style={styles.sellerBtn}>+ List Item</Link>
          </>
        )}

        {/* Admin links */}
        {isAdmin && (
          <>
            <Link to="/admin"          style={styles.link}>Dashboard</Link>
            <Link to="/admin/auctions" style={styles.link}>Auctions</Link>
            <Link to="/admin/bids"     style={styles.link}>Bids</Link>
            <Link to="/admin/reports"  style={styles.link}>Reports</Link>
          </>
        )}
      </div>

      {/* User area */}
      <div style={styles.userArea}>
        {user ? (
          <>
            <div style={styles.userInfo}>
              <div style={{
                ...styles.avatar,
                background: isAdmin   ? '#e74c3c'
                          : isSeller  ? '#c9973a'
                          : '#1565c0',
              }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={styles.userName}>{user.name}</p>
                <span style={{
                  ...styles.roleBadge,
                  background: isAdmin   ? 'rgba(231,76,60,0.15)'
                            : isSeller  ? 'rgba(201,151,58,0.15)'
                            : 'rgba(21,101,192,0.15)',
                  color: isAdmin   ? '#e74c3c'
                       : isSeller  ? '#c9973a'
                       : '#5b9bd5',
                }}>
                  {user.role}
                </span>
              </div>
            </div>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login"    style={styles.authBtn}>Login</Link>
            <Link to="/register" style={{ ...styles.authBtn, ...styles.registerBtn }}>
              Register
            </Link>
          </>
        )}
      </div>

    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 28px', height: '62px', background: '#1a1a2e',
    color: '#fff', position: 'sticky', top: 0, zIndex: 100,
    boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
  },
  logo: {
    fontSize: '20px', fontWeight: 'bold', color: '#e2b96f',
    textDecoration: 'none', letterSpacing: '1px', flexShrink: 0,
  },
  links: {
    display: 'flex', alignItems: 'center', gap: '4px',
    flex: 1, justifyContent: 'center',
  },
  link: {
    color: '#ccc', textDecoration: 'none', padding: '6px 12px',
    borderRadius: '6px', fontSize: '13px', transition: 'all 0.2s',
  },
  sellerBtn: {
    color: '#e2b96f', textDecoration: 'none', padding: '6px 12px',
    borderRadius: '6px', fontSize: '13px', fontWeight: '600',
    border: '1px solid rgba(226,185,111,0.4)',
    background: 'rgba(226,185,111,0.08)',
  },
  userArea: {
    display: 'flex', alignItems: 'center',
    gap: '10px', flexShrink: 0,
  },
  userInfo: {
    display: 'flex', alignItems: 'center', gap: '8px',
  },
  avatar: {
    width: '32px', height: '32px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: '700', fontSize: '13px', color: '#fff', flexShrink: 0,
  },
  userName: {
    fontSize: '13px', fontWeight: '600', color: '#fff',
    lineHeight: 1.2, margin: 0,
  },
  roleBadge: {
    fontSize: '10px', padding: '2px 7px', borderRadius: '10px',
    textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600',
    display: 'inline-block', marginTop: '2px',
  },
  logoutBtn: {
    background: 'transparent', border: '1px solid rgba(231,76,60,0.5)',
    color: '#e74c3c', padding: '5px 12px', borderRadius: '6px',
    cursor: 'pointer', fontSize: '12px', fontWeight: '500',
  },
  authBtn: {
    color: '#ccc', textDecoration: 'none', padding: '6px 14px',
    borderRadius: '6px', fontSize: '13px', border: '1px solid #444',
  },
  registerBtn: {
    background: '#e2b96f', color: '#1a1a2e',
    border: 'none', fontWeight: '600',
  },
};

export default Navbar;