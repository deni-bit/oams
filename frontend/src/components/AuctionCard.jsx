import { useState } from 'react';
import { Link } from 'react-router-dom';

const STATUS_COLORS = {
  live:      { bg: '#fff3e0', color: '#e65100' },
  upcoming:  { bg: '#e3f2fd', color: '#1565c0' },
  ended:     { bg: '#f5f5f5', color: '#666'    },
  cancelled: { bg: '#fdecea', color: '#c62828' },
};

const CATEGORY_EMOJI = {
  Watches:     '⌚',
  Art:         '🎨',
  Electronics: '💻',
  Jewelry:     '💎',
  Vehicles:    '🚗',
  Other:       '📦',
};

const CATEGORY_BG = {
  Watches:     '#f5f0e8',
  Art:         '#f5eef8',
  Electronics: '#eaf2ff',
  Jewelry:     '#fdf2f8',
  Vehicles:    '#eafaf1',
  Other:       '#fdfefe',
};

const AuctionCard = ({ auction }) => {
  const [imgError, setImgError] = useState(false);

  const statusStyle   = STATUS_COLORS[auction.status] || STATUS_COLORS.ended;
  const timeLeft      = new Date(auction.endDate) - new Date();
  const daysLeft      = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60 * 24)));
  const image         = auction.images?.[0];
  const showImage     = image && !imgError;
  const fallbackEmoji = CATEGORY_EMOJI[auction.category] || '🏷️';
  const fallbackBg    = CATEGORY_BG[auction.category]    || '#f5f5f5';

  return (
    <div style={styles.card}>

      {/* ── Image ── */}
      <div style={{
        ...styles.imgBox,
        background: showImage ? '#f0ece4' : fallbackBg,
      }}>
        {showImage ? (
          <img
            src={image}
            alt={auction.title}
            style={styles.img}
            onError={() => setImgError(true)}
          />
        ) : (
          <div style={styles.fallbackBox}>
            <span style={styles.fallbackEmoji}>{fallbackEmoji}</span>
            <p style={styles.fallbackLabel}>{auction.category}</p>
          </div>
        )}

        {/* Status badge — top left */}
        <span style={{ ...styles.statusBadge, ...statusStyle }}>
          {auction.status.toUpperCase()}
        </span>

        {/* Bid count pill — top right */}
        <span style={styles.bidPill}>
          🔨 {auction.totalBids} bid{auction.totalBids !== 1 ? 's' : ''}
        </span>

        {/* Live pulse bottom bar */}
        {auction.status === 'live' && (
          <div style={styles.liveBar}>
            <span style={styles.liveDot} />
            <span style={styles.liveText}>
              {daysLeft > 0 ? `${daysLeft}d left` : 'Ends today'}
            </span>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div style={styles.body}>

        {/* Category */}
        <p style={styles.category}>{auction.category}</p>

        {/* Title */}
        <h3 style={styles.title}>{auction.title}</h3>

        {/* Description */}
        <p style={styles.desc}>
          {auction.description.length > 90
            ? auction.description.slice(0, 90) + '...'
            : auction.description}
        </p>

        {/* Divider */}
        <div style={styles.divider} />

        {/* Bid row */}
        <div style={styles.bidRow}>
          <div>
            <p style={styles.bidLabel}>Current Bid</p>
            <p style={styles.bidAmount}>${auction.currentBid.toLocaleString()}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={styles.bidLabel}>Starting</p>
            <p style={styles.startingBid}>${auction.startingBid.toLocaleString()}</p>
          </div>
        </div>

        {/* Status line */}
        {auction.status === 'live' && (
          <div style={styles.timerRow}>
            <span style={styles.timerDot} />
            <p style={styles.timer}>
              {daysLeft > 0
                ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`
                : 'Ends today'}
            </p>
          </div>
        )}
        {auction.status === 'upcoming' && (
          <p style={styles.upcomingTag}>
            🕐 Starts {new Date(auction.startDate).toLocaleDateString('en-US', {
              day: 'numeric', month: 'short', year: 'numeric',
            })}
          </p>
        )}
        {auction.status === 'ended' && (
          <p style={styles.endedTag}>✔ Auction closed</p>
        )}
        {auction.status === 'cancelled' && (
          <p style={styles.cancelledTag}>✕ Cancelled</p>
        )}

        {/* CTA */}
        <Link to={`/auctions/${auction._id}`} style={styles.viewBtn}>
          View Auction →
        </Link>
      </div>
    </div>
  );
};

const styles = {
  // ── Card ──
  card: {
    background: '#fff',
    borderRadius: '14px',
    overflow: 'hidden',
    border: '1px solid #e8e8e8',
    transition: 'transform 0.2s, box-shadow 0.2s',
    display: 'flex',
    flexDirection: 'column',
  },

  // ── Image ──
  imgBox: {
    height: '200px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    flexShrink: 0,
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.4s ease',
  },

  // ── Fallback ──
  fallbackBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  fallbackEmoji: {
    fontSize: '52px',
    lineHeight: 1,
  },
  fallbackLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#bbb',
    textTransform: 'uppercase',
    letterSpacing: '2px',
  },

  // ── Overlays ──
  statusBadge: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    fontSize: '10px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '20px',
    letterSpacing: '0.8px',
    backdropFilter: 'blur(4px)',
  },
  bidPill: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    fontSize: '11px',
    fontWeight: '600',
    padding: '4px 10px',
    borderRadius: '20px',
    background: 'rgba(26,26,46,0.75)',
    color: '#e2b96f',
  },
  liveBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'rgba(231,76,60,0.88)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '5px',
  },
  liveDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#fff',
    flexShrink: 0,
  },
  liveText: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '0.5px',
  },

  // ── Body ──
  body: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  category: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#c9973a',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '5px',
  },
  title: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#1a1a2e',
    lineHeight: '1.35',
    marginBottom: '7px',
  },
  desc: {
    fontSize: '12px',
    color: '#888',
    lineHeight: '1.6',
    marginBottom: '12px',
    flex: 1,
  },
  divider: {
    height: '1px',
    background: '#f0f0f0',
    marginBottom: '12px',
  },

  // ── Bid row ──
  bidRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '10px',
  },
  bidLabel: {
    fontSize: '10px',
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '2px',
  },
  bidAmount: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#c9973a',
    lineHeight: 1,
  },
  startingBid: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#ccc',
  },

  // ── Status lines ──
  timerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '12px',
  },
  timerDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: '#e74c3c',
    flexShrink: 0,
  },
  timer: {
    fontSize: '12px',
    color: '#e74c3c',
    fontWeight: '600',
    margin: 0,
  },
  upcomingTag: {
    fontSize: '12px',
    color: '#1565c0',
    fontWeight: '500',
    marginBottom: '12px',
  },
  endedTag: {
    fontSize: '12px',
    color: '#888',
    marginBottom: '12px',
  },
  cancelledTag: {
    fontSize: '12px',
    color: '#c62828',
    marginBottom: '12px',
  },

  // ── CTA ──
  viewBtn: {
    display: 'block',
    textAlign: 'center',
    background: '#1a1a2e',
    color: '#e2b96f',
    padding: '10px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: '600',
    marginTop: 'auto',
  },
};

export default AuctionCard;