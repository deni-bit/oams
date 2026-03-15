import { useState, useEffect } from 'react';
import { getSummary, getRecentActivity, getPendingListings } from '../../services/api';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [summary,  setSummary]  = useState(null);
  const [activity, setActivity] = useState({ recentBids: [], recentAuctions: [] });
  const [pending,  setPending]  = useState({ count: 0, listings: [] });
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([getSummary(), getRecentActivity(), getPendingListings()])
      .then(([{ data: s }, { data: a }, { data: p }]) => {
        setSummary(s);
        setActivity(a);
        setPending(p);
      })
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
    { label: 'Buyers',         value: summary.totalBuyers,   color: '#00838f'  },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Header */}
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

        {/* ── Pending listings alert ── */}
        {pending.count > 0 && (
          <div style={styles.pendingAlert}>
            <div style={styles.pendingAlertLeft}>
              <span style={styles.pendingIcon}>⏳</span>
              <div>
                <p style={styles.pendingAlertTitle}>
                  {pending.count} listing{pending.count !== 1 ? 's' : ''} awaiting approval
                </p>
                <p style={styles.pendingAlertSub}>
                  Seller submissions need your review before going live
                </p>
              </div>
            </div>
            <Link to="/admin/auctions?tab=pending" style={styles.reviewBtn}>
              Review Now →
            </Link>
          </div>
        )}

        {/* ── Pending listings table ── */}
        {pending.count > 0 && (
          <div style={{ ...styles.card, marginBottom: '20px' }}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>
                Pending Seller Listings
                <span style={styles.pendingCount}>{pending.count}</span>
              </h2>
              <Link to="/admin/auctions" style={styles.viewAllLink}>
                Manage all →
              </Link>
            </div>
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Item', 'Seller', 'Category', 'Starting Bid', 'Start Date', 'Actions'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pending.listings.map(listing => (
                  <tr key={listing._id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.itemCell}>
                        {listing.images?.[0] && (
                          <img src={listing.images[0]} alt="" style={styles.thumb} />
                        )}
                        <div>
                          <p style={styles.itemTitle}>{listing.title}</p>
                          <p style={styles.itemDesc}>
                            {listing.description?.slice(0, 60)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <p style={styles.sellerName}>{listing.createdBy?.name}</p>
                      <p style={styles.sellerEmail}>{listing.createdBy?.email}</p>
                    </td>
                    <td style={styles.td}>{listing.category}</td>
                    <td style={styles.td}>
                      <strong>${listing.startingBid?.toLocaleString()}</strong>
                    </td>
                    <td style={styles.td}>
                      {new Date(listing.startDate).toLocaleDateString('en-US', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td style={styles.td}>
                      <ApproveRejectButtons
                        listing={listing}
                        onAction={() => {
                          getPendingListings().then(({ data }) => setPending(data));
                          getSummary().then(({ data }) => setSummary(data));
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Stats grid */}
        <div style={styles.statsGrid}>
          {stats.map(s => (
            <div key={s.label} style={styles.statCard}>
              <p style={styles.statLabel}>{s.label}</p>
              <p style={{ ...styles.statValue, color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Recent activity */}
        <div style={styles.twoCol}>

          {/* Recent auctions */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Recent Auctions</h2>
            {activity.recentAuctions.map(a => (
              <div key={a._id} style={styles.activityItem}>
                <div>
                  <p style={styles.activityTitle}>{a.title}</p>
                  <p style={styles.activityMeta}>
                    {a.category} · by {a.createdBy?.name}
                  </p>
                </div>
                <span style={{
                  ...styles.badge,
                  ...(a.status === 'live' ? styles.live : styles.other),
                }}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>

          {/* Recent bids */}
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

// ─── Inline approve/reject buttons component ──────────
const ApproveRejectButtons = ({ listing, onAction }) => {
  const [loading, setLoading] = useState(false);
  const [reason,  setReason]  = useState('');
  const [showReject, setShowReject] = useState(false);

  const handleApprove = async () => {
    try {
      setLoading(true);
      await approveListing(listing._id);
      toast.success(`"${listing.title}" approved!`);
      onAction();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    try {
      setLoading(true);
      await rejectListing(listing._id, reason);
      toast.success('Listing rejected');
      setShowReject(false);
      onAction();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    } finally {
      setLoading(false);
    }
  };

  if (showReject) {
    return (
      <div style={btnStyles.rejectForm}>
        <input
          style={btnStyles.reasonInput}
          placeholder="Reason for rejection..."
          value={reason}
          onChange={e => setReason(e.target.value)}
        />
        <div style={btnStyles.rejectBtnRow}>
          <button
            onClick={() => setShowReject(false)}
            style={btnStyles.cancelBtn}
          >
            Cancel
          </button>
          <button
            onClick={handleReject}
            style={btnStyles.confirmRejectBtn}
            disabled={loading}
          >
            {loading ? '...' : 'Reject'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={btnStyles.row}>
      <button
        onClick={handleApprove}
        style={btnStyles.approveBtn}
        disabled={loading}
      >
        {loading ? '...' : '✓ Approve'}
      </button>
      <button
        onClick={() => setShowReject(true)}
        style={btnStyles.rejectBtn}
        disabled={loading}
      >
        ✕ Reject
      </button>
    </div>
  );
};

// Need to import these at the top
import { approveListing, rejectListing } from '../../services/api';

const btnStyles = {
  row:              { display: 'flex', gap: '6px' },
  approveBtn:       { padding: '5px 12px', background: '#e8f5e9', color: '#2e7d32', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
  rejectBtn:        { padding: '5px 12px', background: '#fdecea', color: '#c62828', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
  rejectForm:       { display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '180px' },
  reasonInput:      { padding: '6px 8px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '12px', outline: 'none' },
  rejectBtnRow:     { display: 'flex', gap: '4px' },
  cancelBtn:        { flex: 1, padding: '5px', background: '#f5f5f5', color: '#666', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' },
  confirmRejectBtn: { flex: 1, padding: '5px', background: '#c62828', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' },
};

const styles = {
  page:          { minHeight: '100vh', background: '#f5f5f5', padding: '32px 24px' },
  container:     { maxWidth: '1200px', margin: '0 auto' },
  header:        { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
  pageTitle:     { fontSize: '28px', fontWeight: '800', color: '#1a1a2e' },
  sub:           { fontSize: '14px', color: '#888', marginTop: '4px' },
  quickLinks:    { display: 'flex', gap: '10px' },
  qBtn:          { padding: '10px 18px', background: '#c9973a', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '13px' },
  qBtnOutline:   { padding: '10px 18px', border: '1px solid #ddd', background: '#fff', color: '#333', borderRadius: '8px', textDecoration: 'none', fontSize: '13px' },

  // Pending alert banner
  pendingAlert:     { background: '#fff8e1', border: '1px solid #ffe082', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  pendingAlertLeft: { display: 'flex', alignItems: 'center', gap: '14px' },
  pendingIcon:      { fontSize: '28px' },
  pendingAlertTitle:{ fontSize: '15px', fontWeight: '700', color: '#996600', margin: 0 },
  pendingAlertSub:  { fontSize: '12px', color: '#b8860b', marginTop: '2px' },
  reviewBtn:        { padding: '9px 18px', background: '#c9973a', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '13px', whiteSpace: 'nowrap' },

  // Pending table
  pendingCount:  { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', background: '#c9973a', color: '#fff', borderRadius: '50%', fontSize: '11px', fontWeight: '700', marginLeft: '8px' },
  itemCell:      { display: 'flex', alignItems: 'center', gap: '10px' },
  thumb:         { width: '42px', height: '42px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 },
  itemTitle:     { fontSize: '13px', fontWeight: '600', color: '#1a1a2e' },
  itemDesc:      { fontSize: '11px', color: '#aaa', marginTop: '2px' },
  sellerName:    { fontSize: '13px', fontWeight: '600', color: '#333' },
  sellerEmail:   { fontSize: '11px', color: '#aaa', marginTop: '2px' },

  statsGrid:     { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' },
  statCard:      { background: '#fff', borderRadius: '12px', padding: '18px 20px', border: '1px solid #e8e8e8' },
  statLabel:     { fontSize: '11px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' },
  statValue:     { fontSize: '28px', fontWeight: '800' },
  twoCol:        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  card:          { background: '#fff', borderRadius: '12px', padding: '22px', border: '1px solid #e8e8e8' },
  cardHeader:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  cardTitle:     { fontSize: '16px', fontWeight: '700', color: '#1a1a2e', display: 'flex', alignItems: 'center' },
  viewAllLink:   { fontSize: '13px', color: '#c9973a', textDecoration: 'none', fontWeight: '600' },
  table:         { width: '100%', borderCollapse: 'collapse' },
  th:            { padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#999', textTransform: 'uppercase', borderBottom: '2px solid #f0f0f0', background: '#fafafa' },
  tr:            { borderBottom: '1px solid #f5f5f5' },
  td:            { padding: '12px 14px', fontSize: '13px', color: '#444', verticalAlign: 'middle' },
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