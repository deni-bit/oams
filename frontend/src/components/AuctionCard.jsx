import { Link } from 'react-router-dom';

const STATUS_COLORS = {
  live:      { bg: '#fff3e0', color: '#e65100' },
  upcoming:  { bg: '#e3f2fd', color: '#1565c0' },
  ended:     { bg: '#f5f5f5', color: '#666' },
  cancelled: { bg: '#fdecea', color: '#c62828' },
};

const AuctionCard = ({ auction }) => {
  const statusStyle = STATUS_COLORS[auction.status] || STATUS_COLORS.ended;
  const timeLeft = new Date(auction.endDate) - new Date();
  const daysLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60 * 24)));

  return (
    <div style={styles.card}>
      <div style={styles.imgBox}>🏷️</div>

      <div style={styles.body}>
        <div style={styles.topRow}>
          <span style={{ ...styles.badge, ...statusStyle }}>
            {auction.status.toUpperCase()}
          </span>
          <span style={styles.category}>{auction.category}</span>
        </div>

        <h3 style={styles.title}>{auction.title}</h3>
        <p style={styles.desc}>
          {auction.description.length > 80
            ? auction.description.slice(0, 80) + '...'
            : auction.description}
        </p>

        <div style={styles.bidRow}>
          <div>
            <p style={styles.bidLabel}>Current Bid</p>
            <p style={styles.bidAmount}>${auction.currentBid.toLocaleString()}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={styles.bidLabel}>Total Bids</p>
            <p style={styles.bidCount}>{auction.totalBids}</p>
          </div>
        </div>

        {auction.status === 'live' && (
          <p style={styles.timer}>⏱ {daysLeft} day{daysLeft !== 1 ? 's' : ''} left</p>
        )}

        <Link to={`/auctions/${auction._id}`} style={styles.viewBtn}>
          View Auction →
        </Link>
      </div>
    </div>
  );
};

const styles = {
  card: {
    background: '#fff', borderRadius: '12px', overflow: 'hidden',
    border: '1px solid #e8e8e8', transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
  },
  imgBox: {
    height: '120px', background: '#f8f4ec', display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontSize: '48px',
  },
  body: { padding: '16px' },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  badge: { fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '12px', letterSpacing: '0.5px' },
  category: { fontSize: '11px', color: '#999' },
  title: { fontSize: '15px', fontWeight: '600', marginBottom: '6px', color: '#1a1a2e' },
  desc: { fontSize: '12px', color: '#888', marginBottom: '12px', lineHeight: '1.5' },
  bidRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' },
  bidLabel: { fontSize: '10px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px' },
  bidAmount: { fontSize: '20px', fontWeight: '700', color: '#c9973a' },
  bidCount: { fontSize: '18px', fontWeight: '600', color: '#333' },
  timer: { fontSize: '12px', color: '#e74c3c', marginBottom: '12px', fontWeight: '500' },
  viewBtn: {
    display: 'block', textAlign: 'center', background: '#1a1a2e',
    color: '#e2b96f', padding: '9px', borderRadius: '8px',
    textDecoration: 'none', fontSize: '13px', fontWeight: '600',
  },
};

export default AuctionCard;