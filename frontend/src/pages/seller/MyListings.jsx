import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';

const MyListings = () => {
  const [listings, setListings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all');

  const fetchListings = () => {
    api.get('/seller/listings')
      .then(({ data }) => setListings(data))
      .catch(() => toast.error('Failed to load listings'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchListings(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await api.delete(`/seller/listings/${id}`);
      toast.success('Listing deleted');
      fetchListings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const filtered = filter === 'all'
    ? listings
    : listings.filter(l => l.approvalStatus === filter || l.status === filter);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.pageTitle}>My Listings</h1>
          <Link to="/seller/listings/create" style={styles.createBtn}>
            + New Listing
          </Link>
        </div>

        {/* Filter tabs */}
        <div style={styles.tabs}>
          {['all', 'pending', 'approved', 'live', 'ended', 'rejected'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{ ...styles.tab, ...(filter === f ? styles.tabActive : {}) }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span style={styles.tabCount}>
                {f === 'all' ? listings.length
                  : listings.filter(l =>
                      l.approvalStatus === f || l.status === f
                    ).length}
              </span>
            </button>
          ))}
        </div>

        <div style={styles.card}>
          {loading ? (
            <p style={styles.center}>Loading...</p>
          ) : filtered.length === 0 ? (
            <div style={styles.empty}>
              <p style={{ fontSize: '40px' }}>📦</p>
              <p>No listings found</p>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Item', 'Category', 'Starting Bid', 'Current Bid', 'Bids', 'Status', 'Approval', 'Actions'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(listing => (
                  <tr key={listing._id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.itemCell}>
                        {listing.images?.[0] && (
                          <img src={listing.images[0]} alt="" style={styles.itemThumb} />
                        )}
                        <strong>{listing.title}</strong>
                      </div>
                    </td>
                    <td style={styles.td}>{listing.category}</td>
                    <td style={styles.td}>${listing.startingBid.toLocaleString()}</td>
                    <td style={styles.td}>${listing.currentBid.toLocaleString()}</td>
                    <td style={styles.td}>{listing.totalBids}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: listing.status === 'live'     ? '#fff3e0'
                                  : listing.status === 'ended'    ? '#f5f5f5'
                                  : listing.status === 'upcoming' ? '#e3f2fd'
                                  : '#fdecea',
                        color:      listing.status === 'live'     ? '#e65100'
                                  : listing.status === 'ended'    ? '#666'
                                  : listing.status === 'upcoming' ? '#1565c0'
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
                        {listing.approvalStatus === 'pending' && (
                          <button
                            onClick={() => handleDelete(listing._id)}
                            style={styles.deleteBtn}
                          >
                            Delete
                          </button>
                        )}
                        {listing.approvalStatus === 'rejected' && (
                          <p style={styles.rejectionNote}>
                            ✕ {listing.rejectionReason}
                          </p>
                        )}
                      </div>
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
  page:          { minHeight: '100vh', background: '#f5f5f5', padding: '32px 24px' },
  container:     { maxWidth: '1200px', margin: '0 auto' },
  header:        { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  pageTitle:     { fontSize: '28px', fontWeight: '800', color: '#1a1a2e' },
  createBtn:     { padding: '10px 20px', background: '#c9973a', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '14px' },
  tabs:          { display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' },
  tab:           { padding: '7px 14px', border: '1px solid #ddd', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center', gap: '6px' },
  tabActive:     { background: '#1a1a2e', color: '#e2b96f', border: '1px solid #1a1a2e' },
  tabCount:      { background: 'rgba(255,255,255,0.15)', padding: '1px 6px', borderRadius: '10px', fontSize: '11px' },
  card:          { background: '#fff', borderRadius: '12px', border: '1px solid #e8e8e8', overflow: 'hidden' },
  table:         { width: '100%', borderCollapse: 'collapse' },
  th:            { padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#999', textTransform: 'uppercase', borderBottom: '2px solid #f0f0f0', background: '#fafafa' },
  tr:            { borderBottom: '1px solid #f5f5f5' },
  td:            { padding: '12px 14px', fontSize: '13px', color: '#444', verticalAlign: 'middle' },
  itemCell:      { display: 'flex', alignItems: 'center', gap: '10px' },
  itemThumb:     { width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 },
  badge:         { padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' },
  actionBtns:    { display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' },
  viewBtn:       { padding: '4px 10px', background: '#e3f2fd', color: '#1565c0', borderRadius: '6px', textDecoration: 'none', fontSize: '12px', fontWeight: '600' },
  bidsBtn:       { padding: '4px 10px', background: '#fff8e1', color: '#996600', borderRadius: '6px', textDecoration: 'none', fontSize: '12px', fontWeight: '600' },
  deleteBtn:     { padding: '4px 10px', background: '#fdecea', color: '#c62828', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
  rejectionNote: { fontSize: '11px', color: '#c62828', maxWidth: '140px' },
  empty:         { textAlign: 'center', padding: '48px', color: '#aaa' },
  center:        { textAlign: 'center', padding: '40px', color: '#aaa' },
};

export default MyListings;