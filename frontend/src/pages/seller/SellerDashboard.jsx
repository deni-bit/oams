import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getSellerDashboard } from '../../services/api';
import { toast } from 'react-toastify';

const SellerDashboard = () => {
  const { user }              = useAuth();
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    getSellerDashboard()
      .then(({ data }) => setStats(data))
      .catch((err) => {
        setError(true);
        const msg = err.response?.data?.message || 'Failed to load dashboard';
        toast.error(msg);
        console.error('Seller dashboard error:', err.response?.data || err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={styles.centerPage}>
      <p style={{ fontSize: '32px' }}>⏳</p>
      <p style={styles.loadingText}>Loading your dashboard...</p>
    </div>
  );

  if (error || !stats) return (
    <div style={styles.centerPage}>
      <p style={{ fontSize: '48px' }}>⚠️</p>
      <p style={styles.errorTitle}>Failed to load dashboard</p>
      <p style={styles.errorSub}>Please check your connection and try again</p>
      <button
        style={styles.retryBtn}
        onClick={() => window.location.reload()}
      >
        Retry
      </button>
    </div>
  );

  const statCards = [
    { label: 'Total Listings',   value: stats.totalListings,   color: '#1a1a2e', icon: '📦' },
    { label: 'Live Now',         value: stats.liveListings,    color: '#e65100', icon: '🔴' },
    { label: 'Pending Approval', value: stats.pendingListings, color: '#996600', icon: '⏳' },
    { label: 'Ended',            value: stats.endedListings,   color: '#666',    icon: '✅' },
    { label: 'Total Bids',       value: stats.totalBids,       color: '#7b1fa2', icon: '🔨' },
    {
      label: 'Total Revenue',
      value: `$${(stats.totalRevenue || 0).toLocaleString()}`,
      color: '#c9973a',
      icon: '💰',
    },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* ── Header ── */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>Seller Dashboard</h1>
            <p style={styles.welcome}>
              Welcome back, <strong>{user?.name}</strong>
              {user?.sellerProfile?.businessName && (
                <span style={styles.businessName}>
                  {' '}· {user.sellerProfile.businessName}
                </span>
              )}
            </p>
          </div>
          <div style={styles.headerBtns}>
            <Link to="/seller/listings" style={styles.secondaryBtn}>
              My Listings
            </Link>
            <Link to="/seller/listings/create" style={styles.createBtn}>
              + New Listing
            </Link>
          </div>
        </div>

        {/* ── Pending notice ── */}
        {stats.pendingListings > 0 && (
          <div style={styles.pendingNotice}>
            <span style={{ fontSize: '20px' }}>⏳</span>
            <div>
              <p style={styles.pendingNoticeTitle}>
                {stats.pendingListings} listing{stats.pendingListings !== 1 ? 's' : ''} awaiting admin approval
              </p>
              <p style={styles.pendingNoticeSub}>
                Your listings will go live once an admin reviews and approves them.
              </p>
            </div>
          </div>
        )}

        {/* ── Stats ── */}
        <div style={styles.statsGrid}>
          {statCards.map(s => (
            <div key={s.label} style={styles.statCard}>
              <div style={styles.statTop}>
                <span style={styles.statIcon}>{s.icon}</span>
                <p style={styles.statLabel}>{s.label}</p>
              </div>
              <p style={{ ...styles.statValue, color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Recent listings ── */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Recent Listings</h2>
            <Link to="/seller/listings" style={styles.viewAllLink}>
              View all →
            </Link>
          </div>

          {stats.recentListings.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.emptyIcon}>📦</p>
              <h3 style={styles.emptyTitle}>No listings yet</h3>
              <p style={styles.emptySub}>
                Create your first listing and submit it for admin approval
              </p>
              <Link to="/seller/listings/create" style={styles.createBtn}>
                + Create First Listing
              </Link>
            </div>
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {['Item', 'Category', 'Starting Bid', 'Current Bid', 'Bids', 'Status', 'Approval', 'Action'].map(h => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.recentListings.map(listing => (
                    <tr key={listing._id} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={styles.itemCell}>
                          {listing.images?.[0]
                            ? <img src={listing.images[0]} alt="" style={styles.itemThumb} />
                            : <div style={styles.itemThumbPlaceholder}>🏷️</div>
                          }
                          <p style={styles.itemTitle}>{listing.title}</p>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.categoryBadge}>{listing.category}</span>
                      </td>
                      <td style={styles.td}>
                        ${listing.startingBid.toLocaleString()}
                      </td>
                      <td style={styles.td}>
                        <strong style={{ color: '#c9973a' }}>
                          ${listing.currentBid.toLocaleString()}
                        </strong>
                      </td>
                      <td style={styles.td}>
                        {listing.totalBids}
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.badge,
                          background: listing.status === 'live'     ? '#fff3e0'
                                    : listing.status === 'ended'    ? '#f5f5f5'
                                    : listing.status === 'upcoming' ? '#e3f2fd'
                                    : listing.status === 'pending'  ? '#fff8e1'
                                    : '#fdecea',
                          color:      listing.status === 'live'     ? '#e65100'
                                    : listing.status === 'ended'    ? '#666'
                                    : listing.status === 'upcoming' ? '#1565c0'
                                    : listing.status === 'pending'  ? '#996600'
                                    : '#c62828',
                        }}>
                          {listing.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.badge,
                          background: listing.approvalStatus === 'approved' ? '#e8f5e9'
                                    : listing.approvalStatus === 'rejected' ? '#fdecea'
                                    : '#fff8e1',
                          color:      listing.approvalStatus === 'approved' ? '#2e7d32'
                                    : listing.approvalStatus === 'rejected' ? '#c62828'
                                    : '#996600',
                        }}>
                          {listing.approvalStatus}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actionBtns}>
                          <Link
                            to={`/auctions/${listing._id}`}
                            style={styles.viewBtn}
                          >
                            View
                          </Link>
                          <Link
                            to={`/seller/listings/${listing._id}/bids`}
                            style={styles.bidsBtn}
                          >
                            Bids
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Quick actions ── */}
        <div style={styles.quickActions}>
          <h2 style={styles.sectionTitle}>Quick Actions</h2>
          <div style={styles.actionGrid}>
            {[
              {
                icon:  '➕',
                title: 'Create Listing',
                desc:  'Submit a new item for auction',
                link:  '/seller/listings/create',
                color: '#c9973a',
              },
              {
                icon:  '📋',
                title: 'My Listings',
                desc:  'View and manage all your listings',
                link:  '/seller/listings',
                color: '#1a1a2e',
              },
              {
                icon:  '🔨',
                title: 'View Bids',
                desc:  'Track bids on your items',
                link:  '/seller/listings',
                color: '#7b1fa2',
              },
              {
                icon:  '🛒',
                title: 'Browse Auctions',
                desc:  'See all active auctions',
                link:  '/',
                color: '#1565c0',
              },
            ].map(action => (
              <Link key={action.title} to={action.link} style={styles.actionCard}>
                <span style={styles.actionIcon}>{action.icon}</span>
                <p style={{ ...styles.actionTitle, color: action.color }}>
                  {action.title}
                </p>
                <p style={styles.actionDesc}>{action.desc}</p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

const styles = {
  // ── Page ──
  page:        { minHeight: '100vh', background: '#f5f5f5', paddingBottom: '48px' },
  container:   { maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' },

  // ── Loading / Error ──
  centerPage:  { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', color: '#aaa' },
  loadingText: { fontSize: '16px', color: '#888' },
  errorTitle:  { fontSize: '20px', fontWeight: '700', color: '#1a1a2e' },
  errorSub:    { fontSize: '14px', color: '#888' },
  retryBtn:    { marginTop: '8px', padding: '10px 24px', background: '#1a1a2e', color: '#e2b96f', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },

  // ── Header ──
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
  pageTitle:    { fontSize: '28px', fontWeight: '800', color: '#1a1a2e' },
  welcome:      { fontSize: '14px', color: '#888', marginTop: '4px' },
  businessName: { color: '#c9973a', fontWeight: '600' },
  headerBtns:   { display: 'flex', gap: '10px' },
  secondaryBtn: { padding: '10px 18px', border: '1px solid #ddd', background: '#fff', color: '#333', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: '500' },
  createBtn:    { padding: '10px 20px', background: '#c9973a', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '13px' },

  // ── Pending notice ──
  pendingNotice:     { background: '#fff8e1', border: '1px solid #ffe082', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '12px' },
  pendingNoticeTitle:{ fontSize: '14px', fontWeight: '700', color: '#996600', margin: 0 },
  pendingNoticeSub:  { fontSize: '12px', color: '#b8860b', marginTop: '3px' },

  // ── Stats ──
  statsGrid:   { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '24px' },
  statCard:    { background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #e8e8e8' },
  statTop:     { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' },
  statIcon:    { fontSize: '16px' },
  statLabel:   { fontSize: '10px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px' },
  statValue:   { fontSize: '26px', fontWeight: '800' },

  // ── Card ──
  card:        { background: '#fff', borderRadius: '12px', padding: '22px', border: '1px solid #e8e8e8', marginBottom: '20px' },
  cardHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  cardTitle:   { fontSize: '16px', fontWeight: '700', color: '#1a1a2e' },
  viewAllLink: { fontSize: '13px', color: '#c9973a', textDecoration: 'none', fontWeight: '600' },

  // ── Table ──
  tableWrap:   { overflowX: 'auto' },
  table:       { width: '100%', borderCollapse: 'collapse' },
  th:          { padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#999', textTransform: 'uppercase', borderBottom: '2px solid #f0f0f0', background: '#fafafa', whiteSpace: 'nowrap' },
  tr:          { borderBottom: '1px solid #f5f5f5' },
  td:          { padding: '12px 14px', fontSize: '13px', color: '#444', verticalAlign: 'middle' },
  itemCell:    { display: 'flex', alignItems: 'center', gap: '10px' },
  itemThumb:   { width: '38px', height: '38px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0, border: '1px solid #e8e8e8' },
  itemThumbPlaceholder: { width: '38px', height: '38px', borderRadius: '6px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 },
  itemTitle:   { fontSize: '13px', fontWeight: '600', color: '#1a1a2e', maxWidth: '160px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  categoryBadge: { background: '#f0f0f0', color: '#555', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '600' },
  badge:       { padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' },
  actionBtns:  { display: 'flex', gap: '6px' },
  viewBtn:     { padding: '4px 10px', background: '#e3f2fd', color: '#1565c0', borderRadius: '6px', textDecoration: 'none', fontSize: '12px', fontWeight: '600' },
  bidsBtn:     { padding: '4px 10px', background: '#fff8e1', color: '#996600', borderRadius: '6px', textDecoration: 'none', fontSize: '12px', fontWeight: '600' },

  // ── Empty state ──
  emptyState:  { textAlign: 'center', padding: '48px 20px' },
  emptyIcon:   { fontSize: '48px', marginBottom: '12px' },
  emptyTitle:  { fontSize: '18px', fontWeight: '700', color: '#1a1a2e', marginBottom: '8px' },
  emptySub:    { fontSize: '14px', color: '#888', marginBottom: '20px' },

  // ── Quick actions ──
  quickActions:{ marginTop: '4px' },
  sectionTitle:{ fontSize: '18px', fontWeight: '700', color: '#1a1a2e', marginBottom: '14px' },
  actionGrid:  { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' },
  actionCard:  { background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e8e8e8', textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s', display: 'block' },
  actionIcon:  { fontSize: '28px', display: 'block', marginBottom: '10px' },
  actionTitle: { fontSize: '14px', fontWeight: '700', marginBottom: '4px' },
  actionDesc:  { fontSize: '12px', color: '#888', lineHeight: '1.5' },
};

export default SellerDashboard;