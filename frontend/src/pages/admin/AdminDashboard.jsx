import { useState, useEffect } from 'react';
import { getSummary, getRecentActivity } from '../../services/api';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [summary,  setSummary]  = useState(null);
  const [activity, setActivity] = useState({ recentBids: [], recentAuctions: [] });
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([getSummary(), getRecentActivity()])
      .then(([{ data: s }, { data: a }]) => { setSummary(s); setActivity(a); })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={styles.center}>Loading dashboard...</div>;

  const stats = [
    { label: 'Total Auctions', value: summary.totalAuctions, color: '#1a1a2e' },
    { label: 'Live Auctions',  value: summary.liveAuctions,  color: '#e65100' },
    { label: 'Total Bids',     value: summary.totalBids,     color: '#1565c0' },
    { label: 'Total Users',    value: summary.totalUsers,    color: '#2e7d32' },
    { label: 'Total Revenue',  value: `$${summary.totalRevenue.toLocaleString()}`, color: '#c9973a' },
    { label: 'Avg Bid',        value: `$${summary.averageBid.toLocaleString()}`,   color: '#7b1fa2' },
    { label: 'Highest Bid',    value: `$${summary.highestBid.toLocaleString()}`,   color: '#c62828' },
    { label: 'Buyers',         value: summary.totalBuyers,   color: '#00838f' },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>Admin Dashboard</h1>
            <p style={styles.sub}>Overview of auction activity</p>
          </div>
          <div style={styles.quickLinks}>
            <Link to="/admin/auctions" style={styles.qBtn}>+ New Auction</Link>
            <Link to="/admin/reports"  style={styles.qBtnOutline}>View Reports</Link>
          </div>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          {stats.map(s => (
            <div key={s.label} style={styles.statCard}>
              <p style={styles.statLabel}>{s.label}</p>
              <p style={{ ...styles.statValue, color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div style={styles.twoCol}>
          {/* Recent Auctions */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Recent Auctions</h2>
            {activity.recentAuctions.map(a => (
              <div key={a._id} style={styles.activityItem}>
                <div>
                  <p style={styles.activityTitle}>{a.title}</p>
                  <p style={styles.activityMeta}>{a.category} · by {a.createdBy?.name}</p>
                </div>
                <span style={{ ...styles.badge, ...(a.status === 'live' ? styles.live : styles.other) }}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>

          {/* Recent Bids */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Recent Bids</h2>
            {activity.recentBids.length === 0 ? (
              <p style={styles.empty}>No bids yet</p>
            ) : activity.recentBids.map(b => (
              <div key={b._id} style={styles.activityItem}>
                <div>
                  <p style={styles.activityTitle}>{b.bidder?.name}</p>
                  <p style={styles.activityMeta}>{b.auction?.title}</p>
                </div>
                <p style={styles.bidAmt}>${b.amount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page:          { minHeight: '100vh', background: '#f5f5f5', padding: '32px 24px' },
  container:     { maxWidth: '1200px', margin: '0 auto' },
  header:        { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  pageTitle:     { fontSize: '28px', fontWeight: '800', color: '#1a1a2e' },
  sub:           { fontSize: '14px', color: '#888', marginTop: '4px' },
  quickLinks:    { display: 'flex', gap: '10px' },
  qBtn:          { padding: '10px 18px', background: '#c9973a', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '13px' },
  qBtnOutline:   { padding: '10px 18px', border: '1px solid #ddd', background: '#fff', color: '#333', borderRadius: '8px', textDecoration: 'none', fontSize: '13px' },
  statsGrid:     { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' },
  statCard:      { background: '#fff', borderRadius: '12px', padding: '18px 20px', border: '1px solid #e8e8e8' },
  statLabel:     { fontSize: '11px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' },
  statValue:     { fontSize: '28px', fontWeight: '800' },
  twoCol:        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  card:          { background: '#fff', borderRadius: '12px', padding: '22px', border: '1px solid #e8e8e8' },
  cardTitle:     { fontSize: '16px', fontWeight: '700', color: '#1a1a2e', marginBottom: '16px' },
  activityItem:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f5f5f5' },
  activityTitle: { fontSize: '13px', fontWeight: '600', color: '#333' },
  activityMeta:  { fontSize: '11px', color: '#aaa', marginTop: '2px' },
  badge:         { padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' },
  live:          { background: '#fff3e0', color: '#e65100' },
  other:         { background: '#f5f5f5', color: '#666' },
  bidAmt:        { fontSize: '15px', fontWeight: '700', color: '#c9973a' },
  empty:         { textAlign: 'center', color: '#aaa', padding: '20px', fontSize: '13px' },
  center:        { textAlign: 'center', padding: '80px', fontSize: '16px', color: '#aaa' },
};

export default AdminDashboard;