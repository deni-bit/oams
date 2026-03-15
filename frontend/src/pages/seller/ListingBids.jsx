import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';

const ListingBids = () => {
  const { id }              = useParams();
  const [bids, setBids]     = useState([]);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/seller/listings/${id}/bids`),
      api.get(`/auctions/${id}`),
    ])
      .then(([{ data: b }, { data: l }]) => { setBids(b); setListing(l); })
      .catch(() => toast.error('Failed to load bids'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={styles.center}>Loading...</div>;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <Link to="/seller/listings" style={styles.backLink}>← Back to Listings</Link>

        {listing && (
          <div style={styles.listingInfo}>
            <h1 style={styles.title}>{listing.title}</h1>
            <p style={styles.sub}>
              {bids.length} bid{bids.length !== 1 ? 's' : ''} ·
              Current bid: <strong>${listing.currentBid.toLocaleString()}</strong>
            </p>
          </div>
        )}

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Bid History</h2>

          {bids.length === 0 ? (
            <div style={styles.empty}>
              <p style={{ fontSize: '32px' }}>🔨</p>
              <p>No bids placed yet</p>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  {['#', 'Bidder', 'Email', 'Bid Amount', 'Status', 'Time'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bids.map((bid, i) => (
                  <tr key={bid._id} style={{ ...styles.tr, ...(i === 0 ? styles.topRow : {}) }}>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.rank,
                        background: i === 0 ? '#c9973a' : i === 1 ? '#aaa' : i === 2 ? '#cd7f32' : '#f0f0f0',
                        color:      i < 3 ? '#fff' : '#bbb',
                      }}>
                        {i + 1}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <strong>{bid.bidder?.name}</strong>
                      {i === 0 && <span style={styles.leadTag}> 🏆 Leading</span>}
                    </td>
                    <td style={styles.td}>{bid.bidder?.email}</td>
                    <td style={styles.td}>
                      <strong style={{ color: i === 0 ? '#c9973a' : '#333' }}>
                        ${bid.amount.toLocaleString()}
                      </strong>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: bid.status === 'active'   ? '#e8f5e9'
                                  : bid.status === 'outbid'   ? '#fff3e0'
                                  : bid.status === 'won'      ? '#e3f2fd'
                                  : '#fdecea',
                        color:      bid.status === 'active'   ? '#2e7d32'
                                  : bid.status === 'outbid'   ? '#e65100'
                                  : bid.status === 'won'      ? '#1565c0'
                                  : '#c62828',
                      }}>
                        {bid.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {new Date(bid.createdAt).toLocaleString()}
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
  page:        { minHeight: '100vh', background: '#f5f5f5', padding: '32px 24px' },
  container:   { maxWidth: '900px', margin: '0 auto' },
  backLink:    { display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#888', textDecoration: 'none', marginBottom: '16px', fontWeight: '500' },
  listingInfo: { marginBottom: '20px' },
  title:       { fontSize: '24px', fontWeight: '800', color: '#1a1a2e', marginBottom: '4px' },
  sub:         { fontSize: '14px', color: '#888' },
  card:        { background: '#fff', borderRadius: '12px', padding: '22px', border: '1px solid #e8e8e8' },
  cardTitle:   { fontSize: '16px', fontWeight: '700', color: '#1a1a2e', marginBottom: '16px' },
  table:       { width: '100%', borderCollapse: 'collapse' },
  th:          { padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#999', textTransform: 'uppercase', borderBottom: '2px solid #f0f0f0', background: '#fafafa' },
  tr:          { borderBottom: '1px solid #f5f5f5' },
  topRow:      { background: '#fffbf0' },
  td:          { padding: '12px 14px', fontSize: '13px', color: '#444' },
  rank:        { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', fontSize: '11px', fontWeight: '800' },
  leadTag:     { fontSize: '11px', color: '#c9973a' },
  badge:       { padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' },
  empty:       { textAlign: 'center', padding: '40px', color: '#aaa' },
  center:      { textAlign: 'center', padding: '80px', fontSize: '16px', color: '#aaa' },
};

export default ListingBids;