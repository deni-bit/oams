import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  getSummary,
  getRecentActivity,
  getPendingListings,
  getTopSellers,
  approveListing,
  rejectListing,
} from '../../services/api';

// ─── Approve / Reject Buttons ─────────────────────────
const ApproveRejectButtons = ({ listing, onAction }) => {
  const [loading,    setLoading]    = useState(false);
  const [reason,     setReason]     = useState('');
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
          <button onClick={() => setShowReject(false)} style={btnStyles.cancelBtn}>
            Cancel
          </button>
          <button onClick={handleReject} style={btnStyles.confirmRejectBtn} disabled={loading}>
            {loading ? '...' : 'Reject'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={btnStyles.row}>
      <button onClick={handleApprove} style={btnStyles.approveBtn} disabled={loading}>
        {loading ? '...' : '✓ Approve'}
      </button>
      <button onClick={() => setShowReject(true)} style={btnStyles.rejectBtn} disabled={loading}>
        ✕ Reject
      </button>
    </div>
  );
};

// ─── Top Sellers Table ────────────────────────────────
const TopSellersTable = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTopSellers()
      .then(({ data }) => setSellers(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <p style={{ color: '#aaa', padding: '20px', textAlign: 'center', fontSize: '13px' }}>
      Loading sellers...
    </p>
  );

  if (sellers.length === 0) return (
    <div style={{ textAlign: 'center', padding: '32px', color: '#aaa' }}>
      <p style={{ fontSize: '32px', marginBottom: '8px' }}>🏷️</p>
      <p style={{ fontSize: '13px' }}>No seller sales yet</p>
    </div>
  );

  return (
    <table style={sellerStyles.table}>
      <thead>
        <tr>
          {['#', 'Seller', 'Business', 'Total Sales', 'Avg Sale', 'Total Revenue'].map(h => (
            <th key={h} style={sellerStyles.th}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sellers.map((seller, i) => (
          <tr key={seller._id} style={sellerStyles.tr}>
            <td style={sellerStyles.td}>
              <span style={{
                ...sellerStyles.rank,
                background: i === 0 ? '#c9973a' : i === 1 ? '#aaa' : i === 2 ? '#cd7f32' : '#f0f0f0',
                color:      i < 3 ? '#fff' : '#bbb',
              }}>
                {i + 1}
              </span>
            </td>
            <td style={sellerStyles.td}>
              <p style={sellerStyles.sellerName}>{seller.name}</p>
              <p style={sellerStyles.sellerEmail}>{seller.email}</p>
            </td>
            <td style={sellerStyles.td}>
              {seller.businessName
                ? <span style={sellerStyles.businessBadge}>{seller.businessName}</span>
                : <span style={{ color: '#ccc', fontSize: '12px' }}>—</span>
              }
            </td>
            <td style={sellerStyles.td}>
              <strong>{seller.totalSales}</strong>
              <span style={{ color: '#aaa', fontSize: '11px' }}>
                {' '}sale{seller.totalSales !== 1 ? 's' : ''}
              </span>
            </td>
            <td style={sellerStyles.td}>
              ${seller.avgSalePrice?.toLocaleString()}
            </td>
            <td style={sellerStyles.td}>
              <strong style={{ color: '#c9973a', fontSize: '15px' }}>
                ${seller.totalRevenue?.toLocaleString()}
              </strong>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// ─── Main Dashboard ───────────────────────────────────
const AdminDashboard = () => {
  const [summary,  setSummary]  = useState(null);
  const [activity, setActivity] = useState({ recentBids: [], recentAuctions: [] });
  const [pending,  setPending]  = useState({ count: 0, listings: [] });
  const [loading,  setLoading]  = useState(true);

  const refreshPending = () => {
    getPendingListings().then(({ data }) => setPending(data));
    getSummary().then(({ data }) => setSummary(data));
  };

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
    { label: 'Total Auctions',  value: summary.totalAuctions,                           color: '#1a1a2e' },
    { label: 'Live Now',        value: summary.liveAuctions,                            color: '#e65100' },
    { label: 'Upcoming',        value: summary.upcomingAuctions ?? 0,                   color: '#1565c0' },
    { label: 'Ended',           value: summary.endedAuctions,                           color: '#666'    },
    { label: 'Total Bids',      value: summary.totalBids,                               color: '#7b1fa2' },
    { label: 'Total Revenue',   value: `$${summary.totalRevenue.toLocaleString()}`,      color: '#c9973a' },
    { label: 'Highest Bid',     value: `$${summary.highestBid.toLocaleString()}`,        color: '#c62828' },
    { label: 'Avg Bid',         value: `$${summary.averageBid.toLocaleString()}`,        color: '#2e7d32' },
    { label: 'Total Users',     value: summary.totalUsers,                              color: '#00838f' },
    { label: 'Buyers',          value: summary.totalBuyers,                             color: '#1565c0' },
    { label: 'Sellers',         value: summary.totalSellers ?? 0,                       color: '#c9973a' },
    { label: 'Pending Reviews', value: pending.count,                                   color: pending.count > 0 ? '#996600' : '#aaa' },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* ── Header ── */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>Admin Dashboard</h1>
            <p style={styles.sub}>Complete overview of auction platform activity</p>
          </div>
          <div style={styles.quickLinks}>
            <Link to="/admin/auctions" style={styles.qBtn}>+ New Auction</Link>
            <Link to="/admin/reports"  style={styles.qBtnOutline}>View Reports</Link>
          </div>
        </div>

        {/* ── Pending alert banner ── */}
        {pending.count > 0 && (
          <div style={styles.pendingAlert}>
            <div style={styles.pendingAlertLeft}>
              <span style={styles.pendingIcon}>⏳</span>
              <div>
                <p style={styles.pendingAlertTitle}>
                  {pending.count} listing{pending.count !== 1 ? 's' : ''} awaiting your approval
                </p>
                <p style={styles.pendingAlertSub}>
                  Seller submissions need your review before going live to buyers
                </p>
              </div>
            </div>
            <Link to="/admin/auctions" style={styles.reviewBtn}>
              Review Now →
            </Link>
          </div>
        )}

        {/* ── Pending listings table ── */}
        {pending.count > 0 && (
          <div style={{ ...styles.card, marginBottom: '24px' }}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>
                Pending Seller Listings
                <span style={styles.pendingBadge}>{pending.count}</span>
              </h2>
              <Link to="/admin/auctions" style={styles.viewAllLink}>Manage all →</Link>
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
                        {listing.images?.[0]
                          ? <img src={listing.images[0]} alt="" style={styles.thumb} />
                          : <div style={styles.thumbPlaceholder}>🏷️</div>
                        }
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
                    <td style={styles.td}>
                      <span style={styles.categoryBadge}>{listing.category}</span>
                    </td>
                    <td style={styles.td}>
                      <strong style={{ color: '#c9973a' }}>
                        ${listing.startingBid?.toLocaleString()}
                      </strong>
                    </td>
                    <td style={styles.td}>
                      {new Date(listing.startDate).toLocaleDateString('en-US', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td style={styles.td}>
                      <ApproveRejectButtons
                        listing={listing}
                        onAction={refreshPending}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Stats grid — 12 cards ── */}
        <div style={styles.statsGrid}>
          {stats.map(s => (
            <div key={s.label} style={styles.statCard}>
              <p style={styles.statLabel}>{s.label}</p>
              <p style={{ ...styles.statValue, color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Seller stats row ── */}
        <div style={styles.sellerRow}>
          <div style={styles.sellerStat}>
            <p style={styles.sellerStatLabel}>Seller Listings</p>
            <p style={styles.sellerStatValue}>{summary.sellerListings ?? 0}</p>
          </div>
          <div style={styles.sellerStatDivider} />
          <div style={styles.sellerStat}>
            <p style={styles.sellerStatLabel}>Admin Listings</p>
            <p style={styles.sellerStatValue}>{summary.adminListings ?? 0}</p>
          </div>
          <div style={styles.sellerStatDivider} />
          <div style={styles.sellerStat}>
            <p style={styles.sellerStatLabel}>Active Bids</p>
            <p style={styles.sellerStatValue}>{summary.activeBids ?? 0}</p>
          </div>
          <div style={styles.sellerStatDivider} />
          <div style={styles.sellerStat}>
            <p style={styles.sellerStatLabel}>Pending Approvals</p>
            <p style={{ ...styles.sellerStatValue, color: pending.count > 0 ? '#996600' : '#aaa' }}>
              {pending.count}
            </p>
          </div>
        </div>

        {/* ── Recent activity ── */}
        <div style={styles.twoCol}>

          {/* Recent auctions */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Recent Auctions</h2>
              <Link to="/admin/auctions" style={styles.viewAllLink}>View all →</Link>
            </div>
            {activity.recentAuctions.length === 0 ? (
              <p style={styles.empty}>No auctions yet</p>
            ) : activity.recentAuctions.map(a => (
              <div key={a._id} style={styles.activityItem}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={styles.activityTitle}>{a.title}</p>
                  <p style={styles.activityMeta}>
                    {a.category} · by {a.createdBy?.name}
                    {a.listedBy === 'seller' && (
                      <span style={styles.sellerTag}> · Seller</span>
                    )}
                  </p>
                </div>
                <span style={{
                  ...styles.badge,
                  background: a.status === 'live'     ? '#fff3e0'
                            : a.status === 'upcoming' ? '#e3f2fd'
                            : a.status === 'ended'    ? '#f5f5f5'
                            : '#fdecea',
                  color:      a.status === 'live'     ? '#e65100'
                            : a.status === 'upcoming' ? '#1565c0'
                            : a.status === 'ended'    ? '#666'
                            : '#c62828',
                }}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>

          {/* Recent bids */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Recent Bids</h2>
              <Link to="/admin/bids" style={styles.viewAllLink}>View all →</Link>
            </div>
            {activity.recentBids.length === 0 ? (
              <p style={styles.empty}>No bids yet</p>
            ) : activity.recentBids.map(b => (
              <div key={b._id} style={styles.activityItem}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={styles.activityTitle}>{b.bidder?.name}</p>
                  <p style={styles.activityMeta}>{b.auction?.title}</p>
                </div>
                <p style={styles.bidAmt}>${b.amount.toLocaleString()}</p>
              </div>
            ))}
          </div>

        </div>

        {/* ── Top Sellers ── */}
        <div style={{ ...styles.card, marginTop: '20px' }}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>
              🏆 Top Sellers by Revenue
            </h2>
            <Link to="/admin/reports" style={styles.viewAllLink}>Full report →</Link>
          </div>
          <TopSellersTable />
        </div>

      </div>
    </div>
  );
};

// ─── Styles ───────────────────────────────────────────
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

const sellerStyles = {
  table:         { width: '100%', borderCollapse: 'collapse' },
  th:            { padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#999', textTransform: 'uppercase', borderBottom: '2px solid #f0f0f0', background: '#fafafa' },
  tr:            { borderBottom: '1px solid #f5f5f5' },
  td:            { padding: '12px 14px', fontSize: '13px', color: '#444', verticalAlign: 'middle' },
  rank:          { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '50%', fontSize: '11px', fontWeight: '800' },
  sellerName:    { fontSize: '13px', fontWeight: '600', color: '#1a1a2e', margin: 0 },
  sellerEmail:   { fontSize: '11px', color: '#aaa', marginTop: '2px' },
  businessBadge: { background: '#f8f4ec', color: '#c9973a', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' },
};

const styles = {
  page:          { minHeight: '100vh', background: '#f5f5f5', padding: '32px 24px' },
  container:     { maxWidth: '1200px', margin: '0 auto' },

  // Header
  header:        { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
  pageTitle:     { fontSize: '28px', fontWeight: '800', color: '#1a1a2e' },
  sub:           { fontSize: '14px', color: '#888', marginTop: '4px' },
  quickLinks:    { display: 'flex', gap: '10px' },
  qBtn:          { padding: '10px 18px', background: '#c9973a', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '13px' },
  qBtnOutline:   { padding: '10px 18px', border: '1px solid #ddd', background: '#fff', color: '#333', borderRadius: '8px', textDecoration: 'none', fontSize: '13px' },

  // Pending alert
  pendingAlert:     { background: '#fff8e1', border: '1px solid #ffe082', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  pendingAlertLeft: { display: 'flex', alignItems: 'center', gap: '14px' },
  pendingIcon:      { fontSize: '28px' },
  pendingAlertTitle:{ fontSize: '15px', fontWeight: '700', color: '#996600', margin: 0 },
  pendingAlertSub:  { fontSize: '12px', color: '#b8860b', marginTop: '2px' },
  reviewBtn:        { padding: '9px 18px', background: '#c9973a', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '13px', whiteSpace: 'nowrap' },

  // Pending table
  pendingBadge:     { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', background: '#c9973a', color: '#fff', borderRadius: '50%', fontSize: '11px', fontWeight: '700', marginLeft: '8px' },
  itemCell:         { display: 'flex', alignItems: 'center', gap: '10px' },
  thumb:            { width: '42px', height: '42px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0, border: '1px solid #e8e8e8' },
  thumbPlaceholder: { width: '42px', height: '42px', borderRadius: '6px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 },
  itemTitle:        { fontSize: '13px', fontWeight: '600', color: '#1a1a2e', margin: 0 },
  itemDesc:         { fontSize: '11px', color: '#aaa', marginTop: '2px' },
  sellerName:       { fontSize: '13px', fontWeight: '600', color: '#333', margin: 0 },
  sellerEmail:      { fontSize: '11px', color: '#aaa', marginTop: '2px' },
  categoryBadge:    { background: '#f0f0f0', color: '#555', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '600' },

  // Stats grid — 12 cards, 4 per row
  statsGrid:     { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' },
  statCard:      { background: '#fff', borderRadius: '12px', padding: '16px 18px', border: '1px solid #e8e8e8' },
  statLabel:     { fontSize: '10px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' },
  statValue:     { fontSize: '26px', fontWeight: '800' },

  // Seller stats row
  sellerRow:          { background: '#fff', border: '1px solid #e8e8e8', borderRadius: '12px', padding: '16px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-around' },
  sellerStat:         { textAlign: 'center' },
  sellerStatLabel:    { fontSize: '11px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' },
  sellerStatValue:    { fontSize: '22px', fontWeight: '800', color: '#1a1a2e' },
  sellerStatDivider:  { width: '1px', height: '40px', background: '#f0f0f0' },

  // Cards & layout
  twoCol:        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  card:          { background: '#fff', borderRadius: '12px', padding: '22px', border: '1px solid #e8e8e8' },
  cardHeader:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  cardTitle:     { fontSize: '16px', fontWeight: '700', color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '6px' },
  viewAllLink:   { fontSize: '13px', color: '#c9973a', textDecoration: 'none', fontWeight: '600' },

  // Table
  table:         { width: '100%', borderCollapse: 'collapse' },
  th:            { padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#999', textTransform: 'uppercase', borderBottom: '2px solid #f0f0f0', background: '#fafafa' },
  tr:            { borderBottom: '1px solid #f5f5f5' },
  td:            { padding: '12px 14px', fontSize: '13px', color: '#444', verticalAlign: 'middle' },

  // Activity
  activityItem:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f5f5f5' },
  activityTitle: { fontSize: '13px', fontWeight: '600', color: '#333', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '220px' },
  activityMeta:  { fontSize: '11px', color: '#aaa', marginTop: '2px' },
  sellerTag:     { color: '#c9973a', fontWeight: '600' },
  badge:         { padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', flexShrink: 0, marginLeft: '8px' },
  bidAmt:        { fontSize: '15px', fontWeight: '700', color: '#c9973a', flexShrink: 0 },
  empty:         { textAlign: 'center', color: '#aaa', padding: '20px', fontSize: '13px' },
  center:        { textAlign: 'center', padding: '80px', fontSize: '16px', color: '#aaa' },
};

export default AdminDashboard;