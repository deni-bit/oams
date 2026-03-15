import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';

const SellerDashboard = () => {
  const { user }            = useAuth();
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/seller/dashboard')
      .then(({ data }) => setStats(data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={styles.center}>Loading...</div>;

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>Seller Dashboard</h1>
            <p style={styles.welcome}>
              Welcome, <strong>{user?.name}</strong>
              {user?.sellerProfile?.businessName &&
                ` · ${user.sellerProfile.businessName}`}
            </p>
          </div>
          <Link to="/seller/listings/create" style={styles.createBtn}>
            + New Listing
          </Link>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          {[
            { label: 'Total Listings',   value: stats.totalListings,   color: '#1a1a2e' },
            { label: 'Live Now',         value: stats.liveListings,    color: '#e65100' },
            { label: 'Pending Approval', value: stats.pendingListings, color: '#1565c0' },
            { label: 'Ended',            value: stats.endedListings,   color: '#666'    },
            { label: 'Total Bids',       value: stats.totalBids,       color: '#7b1fa2' },
            { label: 'Total Revenue',    value: `$${stats.totalRevenue.toLocaleString()}`, color: '#c9973a' },
          ].map(s => (
            <div key={s.label} style={styles.statCard}>
              <p style={styles.statLabel}>{s.label}</p>
              <p style={{ ...styles.statValue, color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Recent listings */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Recent Listings</h2>
            <Link to="/seller/listings" style={styles.viewAllLink}>
              View all →
            </Link>
          </div>

          {stats.recentListings.length === 0 ? (
            <div style={styles.empty}>
              <p style={{ fontSize: '40px' }}>📦</p>
              <p>No listings yet.</p>
              <Link to="/seller/listings/create" style={styles.createBtn}>
                Create your first listing
              </Link>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Title', 'Category', 'Starting Bid', 'Current Bid', 'Status', 'Approval', 'Action'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recentListings.map(listing => (
                  <tr key={listing._id} style={styles.tr}>
                    <td style={styles.td}><strong>{listing.title}</strong></td>
                    <td style={styles.td}>{listing.category}</td>
                    <td style={styles.td}>${listing.startingBid.toLocaleString()}</td>
                    <td style={styles.td}>${listing.currentBid.toLocaleString()}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: listing.status === 'live' ? '#fff3e0' : listing.status === 'ended' ? '#f5f5f5' : '#e3f2fd',
                        color:      listing.status === 'live' ? '#e65100' : listing.status === 'ended' ? '#666'    : '#1565c0',
                      }}>
                        {listing.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: listing.approvalStatus === 'approved' ? '#e8f5e9' : listing.approvalStatus === 'rejected' ? '#fdecea' : '#fff8e1',
                        color:      listing.approvalStatus === 'approved' ? '#2e7d32' : listing.approvalStatus === 'rejected' ? '#c62828' : '#996600',
                      }}>
                        {listing.approvalStatus}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <Link to={`/auctions/${listing._id}`} style={styles.viewLink}>
                        View
                      </Link>
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
  page:       { minHeight: '100vh', background: '#f5f5f5', padding: '32px 24px' },
  container:  { maxWidth: '1200px', margin: '0 auto' },
  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  pageTitle:  { fontSize: '28px', fontWeight: '800', color: '#1a1a2e' },
  welcome:    { fontSize: '14px', color: '#888', marginTop: '4px' },
  createBtn:  { padding: '10px 20px', background: '#c9973a', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '14px' },
  statsGrid:  { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '24px' },
  statCard:   { background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #e8e8e8', textAlign: 'center' },
  statLabel:  { fontSize: '10px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' },
  statValue:  { fontSize: '24px', fontWeight: '800' },
  card:       { background: '#fff', borderRadius: '12px', padding: '22px', border: '1px solid #e8e8e8' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  cardTitle:  { fontSize: '16px', fontWeight: '700', color: '#1a1a2e' },
  viewAllLink:{ fontSize: '13px', color: '#c9973a', textDecoration: 'none', fontWeight: '600' },
  table:      { width: '100%', borderCollapse: 'collapse' },
  th:         { padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#999', textTransform: 'uppercase', borderBottom: '2px solid #f0f0f0', background: '#fafafa' },
  tr:         { borderBottom: '1px solid #f5f5f5' },
  td:         { padding: '12px 14px', fontSize: '13px', color: '#444' },
  badge:      { padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' },
  viewLink:   { color: '#c9973a', fontWeight: '600', textDecoration: 'none', fontSize: '13px' },
  empty:      { textAlign: 'center', padding: '48px', color: '#aaa' },
  center:     { textAlign: 'center', padding: '80px', fontSize: '16px', color: '#aaa' },
};

export default SellerDashboard;