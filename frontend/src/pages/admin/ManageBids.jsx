import { useState, useEffect } from 'react';
import { getAllBids, rejectBid } from '../../services/api';
import { toast } from 'react-toastify';

const STATUS_COLORS = {
  active:   { bg: '#e8f5e9', color: '#2e7d32' },
  outbid:   { bg: '#fff3e0', color: '#e65100' },
  won:      { bg: '#e3f2fd', color: '#1565c0' },
  rejected: { bg: '#fdecea', color: '#c62828' },
};

const ManageBids = () => {
  const [bids,    setBids]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');

  const fetchBids = () =>
    getAllBids()
      .then(({ data }) => setBids(data))
      .catch(() => toast.error('Failed to load bids'))
      .finally(() => setLoading(false));

  useEffect(() => { fetchBids(); }, []);

  const handleReject = async (id) => {
    if (!window.confirm('Reject this bid?')) return;
    try {
      await rejectBid(id);
      toast.success('Bid rejected');
      fetchBids();
    } catch {
      toast.error('Failed to reject bid');
    }
  };

  const filtered = filter === 'all' ? bids : bids.filter(b => b.status === filter);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.pageTitle}>Manage Bids</h1>

        {/* Filter Tabs */}
        <div style={styles.tabs}>
          {['all', 'active', 'outbid', 'won', 'rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ ...styles.tab, ...(filter === f ? styles.tabActive : {}) }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span style={styles.tabCount}>
                {f === 'all' ? bids.length : bids.filter(b => b.status === f).length}
              </span>
            </button>
          ))}
        </div>

        <div style={styles.card}>
          {loading ? (
            <p style={styles.center}>Loading bids...</p>
          ) : filtered.length === 0 ? (
            <p style={styles.center}>No bids found</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Bidder', 'Auction', 'Amount', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(bid => (
                  <tr key={bid._id} style={styles.tr}>
                    <td style={styles.td}>
                      <p style={styles.name}>{bid.bidder?.name}</p>
                      <p style={styles.email}>{bid.bidder?.email}</p>
                    </td>
                    <td style={styles.td}>{bid.auction?.title || 'N/A'}</td>
                    <td style={styles.td}><strong style={{ color: '#c9973a' }}>${bid.amount.toLocaleString()}</strong></td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, ...STATUS_COLORS[bid.status] }}>
                        {bid.status}
                      </span>
                    </td>
                    <td style={styles.td}>{new Date(bid.createdAt).toLocaleDateString()}</td>
                    <td style={styles.td}>
                      {bid.status === 'active' && (
                        <button onClick={() => handleReject(bid._id)} style={styles.rejectBtn}>
                          Reject
                        </button>
                      )}
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
  page:      { minHeight: '100vh', background: '#f5f5f5', padding: '32px 24px' },
  container: { maxWidth: '1200px', margin: '0 auto' },
  pageTitle: { fontSize: '28px', fontWeight: '800', color: '#1a1a2e', marginBottom: '20px' },
  tabs:      { display: 'flex', gap: '6px', marginBottom: '20px' },
  tab:       { padding: '8px 16px', border: '1px solid #ddd', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '13px', color: '#666', display: 'flex', alignItems: 'center', gap: '6px' },
  tabActive: { background: '#1a1a2e', color: '#e2b96f', border: '1px solid #1a1a2e' },
  tabCount:  { background: 'rgba(255,255,255,0.2)', padding: '1px 7px', borderRadius: '10px', fontSize: '11px' },
  card:      { background: '#fff', borderRadius: '12px', border: '1px solid #e8e8e8', overflow: 'hidden' },
  table:     { width: '100%', borderCollapse: 'collapse' },
  th:        { padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#999', textTransform: 'uppercase', borderBottom: '2px solid #f0f0f0', background: '#fafafa' },
  tr:        { borderBottom: '1px solid #f5f5f5' },
  td:        { padding: '12px 16px', fontSize: '13px', color: '#444' },
  name:      { fontWeight: '600', color: '#333' },
  email:     { fontSize: '11px', color: '#aaa', marginTop: '2px' },
  badge:     { padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' },
  rejectBtn: { padding: '5px 12px', background: '#fdecea', color: '#c62828', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
  center:    { textAlign: 'center', padding: '40px', color: '#aaa' },
};

export default ManageBids;