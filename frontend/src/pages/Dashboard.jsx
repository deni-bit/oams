import { useState, useEffect } from 'react';
import { getMyBids } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const STATUS_COLORS = {
  active:   { bg: '#e8f5e9', color: '#2e7d32' },
  outbid:   { bg: '#fff3e0', color: '#e65100' },
  won:      { bg: '#e3f2fd', color: '#1565c0' },
  rejected: { bg: '#fdecea', color: '#c62828' },
};

const Dashboard = () => {
  const { user }          = useAuth();
  const [bids, setBids]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyBids()
      .then(({ data }) => setBids(data))
      .catch(() => toast.error('Failed to load bids'))
      .finally(() => setLoading(false));
  }, []);

  const activeBids  = bids.filter(b => b.status === 'active').length;
  const wonBids     = bids.filter(b => b.status === 'won').length;
  const outbidCount = bids.filter(b => b.status === 'outbid').length;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.pageTitle}>My Dashboard</h1>
        <p style={styles.welcome}>Welcome back, <strong>{user?.name}</strong></p>

        {/* Stats */}
        <div style={styles.statsGrid}>
          {[
            { label: 'Total Bids',    value: bids.length,   color: '#1a1a2e' },
            { label: 'Active Bids',   value: activeBids,    color: '#2e7d32' },
            { label: 'Outbid',        value: outbidCount,   color: '#e65100' },
            { label: 'Won',           value: wonBids,       color: '#1565c0' },
          ].map(s => (
            <div key={s.label} style={styles.statCard}>
              <p style={styles.statLabel}>{s.label}</p>
              <p style={{ ...styles.statValue, color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Bid History */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>My Bid History</h2>
          {loading ? (
            <p style={styles.center}>Loading...</p>
          ) : bids.length === 0 ? (
            <div style={styles.empty}>
              <p style={{ fontSize: '40px' }}>🔨</p>
              <p>You haven't placed any bids yet.</p>
              <Link to="/" style={styles.browseBtn}>Browse Auctions</Link>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Auction', 'My Bid', 'Current Bid', 'Status', 'Auction Status', 'Action'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bids.map(bid => (
                  <tr key={bid._id} style={styles.tr}>
                    <td style={styles.td}>{bid.auction?.title || 'N/A'}</td>
                    <td style={styles.td}><strong>${bid.amount.toLocaleString()}</strong></td>
                    <td style={styles.td}>${bid.auction?.currentBid?.toLocaleString() || '—'}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, ...STATUS_COLORS[bid.status] }}>
                        {bid.status}
                      </span>
                    </td>
                    <td style={styles.td}>{bid.auction?.status || '—'}</td>
                    <td style={styles.td}>
                      <Link to={`/auctions/${bid.auction?._id}`} style={styles.viewLink}>View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  page:         { minHeight: '100vh', background: '#f5f5f5', padding: '32px 24px' },
  container:    { maxWidth: '1100px', margin: '0 auto' },
  pageTitle:    { fontSize: '28px', fontWeight: '800', color: '#1a1a2e', marginBottom: '4px' },
  welcome:      { fontSize: '14px', color: '#888', marginBottom: '24px' },
  statsGrid:    { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard:     { background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e8e8e8', textAlign: 'center' },
  statLabel:    { fontSize: '12px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' },
  statValue:    { fontSize: '32px', fontWeight: '800' },
  card:         { background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e8e8e8' },
  sectionTitle: { fontSize: '18px', fontWeight: '700', color: '#1a1a2e', marginBottom: '16px' },
  table:        { width: '100%', borderCollapse: 'collapse' },
  th:           { textAlign: 'left', padding: '10px 14px', fontSize: '11px', fontWeight: '700', color: '#999', textTransform: 'uppercase', borderBottom: '2px solid #f0f0f0', letterSpacing: '0.5px' },
  tr:           { borderBottom: '1px solid #f5f5f5' },
  td:           { padding: '12px 14px', fontSize: '13px', color: '#444' },
  badge:        { padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' },
  center:       { textAlign: 'center', padding: '40px', color: '#aaa' },
  empty:        { textAlign: 'center', padding: '48px', color: '#aaa' },
  browseBtn:    { display: 'inline-block', marginTop: '14px', padding: '10px 24px', background: '#1a1a2e', color: '#e2b96f', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '13px' },
  viewLink:     { color: '#c9973a', fontWeight: '600', textDecoration: 'none', fontSize: '13px' },
};

export default Dashboard;