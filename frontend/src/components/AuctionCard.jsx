import { useState } from 'react';
import { Link } from 'react-router-dom';

const STATUS_CONFIG = {
  live:      { bg: 'var(--coral-muted)',              color: 'var(--coral-dark)',  label: 'LIVE'      },
  upcoming:  { bg: 'rgba(52,152,219,0.12)',            color: 'var(--info)',        label: 'UPCOMING'  },
  ended:     { bg: 'rgba(90,107,122,0.1)',             color: 'var(--slate)',       label: 'ENDED'     },
  cancelled: { bg: 'rgba(231,76,60,0.1)',              color: 'var(--danger)',      label: 'CANCELLED' },
};

const CATEGORY_EMOJI = {
  Watches: '⌚', Art: '🎨', Electronics: '💻',
  Jewelry: '💎', Vehicles: '🚗', Other: '📦',
};

const CATEGORY_BG = {
  Watches: '#F5F0E8', Art: '#F5EEF8', Electronics: '#EAF2FF',
  Jewelry: '#FDF2F8', Vehicles: '#EAFAF1', Other: '#F8F7F4',
};

const AuctionCard = ({ auction }) => {
  const [imgError, setImgError] = useState(false);

  const statusConfig  = STATUS_CONFIG[auction.status] || STATUS_CONFIG.ended;
  const timeLeft      = new Date(auction.endDate) - new Date();
  const daysLeft      = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60 * 24)));
  const image         = auction.images?.[0];
  const showImage     = image && !imgError;
  const fallbackEmoji = CATEGORY_EMOJI[auction.category] || '🏷️';
  const fallbackBg    = CATEGORY_BG[auction.category]    || '#F8F7F4';

  return (
    <div style={styles.card}>

      {/* ── Image ── */}
      <div style={{
        ...styles.imgBox,
        background: showImage ? '#E8E4DC' : fallbackBg,
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

        {/* Status badge */}
        <span style={{ ...styles.statusBadge, background: statusConfig.bg, color: statusConfig.color }}>
          {statusConfig.label}
        </span>

        {/* Bid count */}
        <span style={styles.bidPill}>
          🔨 {auction.totalBids} bid{auction.totalBids !== 1 ? 's' : ''}
        </span>

        {/* Live bar */}
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
        <p style={styles.category}>{auction.category}</p>
        <h3 style={styles.title}>{auction.title}</h3>
        <p style={styles.desc}>
          {auction.description.length > 90
            ? auction.description.slice(0, 90) + '...'
            : auction.description}
        </p>

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

        {/* Status lines */}
        {auction.status === 'live' && (
          <div style={styles.timerRow}>
            <span style={styles.timerDot} />
            <p style={styles.timer}>
              {daysLeft > 0 ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left` : 'Ends today'}
            </p>
          </div>
        )}
        {auction.status === 'upcoming' && (
          <p style={styles.upcomingTag}>
            🕐 Starts {new Date(auction.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        )}
        {auction.status === 'ended'    && <p style={styles.endedTag}>✔ Auction closed</p>}
        {auction.status === 'cancelled'&& <p style={styles.cancelledTag}>✕ Cancelled</p>}

        <Link to={`/auctions/${auction._id}`} style={styles.viewBtn}>
          View Auction →
        </Link>
      </div>
    </div>
  );
};

const styles = {
  card: {
    background: 'var(--white)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    border: '1px solid var(--offwhite-3)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'var(--shadow-sm)',
  },
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
    width: '100%', height: '100%', objectFit: 'cover',
    transition: 'transform 0.4s ease',
  },
  fallbackBox: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '8px',
  },
  fallbackEmoji: { fontSize: '52px', lineHeight: 1 },
  fallbackLabel: {
    fontSize: '10px', fontWeight: '700',
    color: 'var(--slate-muted)', textTransform: 'uppercase', letterSpacing: '2px',
  },
  statusBadge: {
    position: 'absolute', top: '10px', left: '10px',
    fontSize: '10px', fontWeight: '700', padding: '4px 10px',
    borderRadius: '20px', letterSpacing: '0.8px',
  },
  bidPill: {
    position: 'absolute', top: '10px', right: '10px',
    fontSize: '11px', fontWeight: '600', padding: '4px 10px',
    borderRadius: '20px',
    background: 'rgba(26,43,76,0.75)', color: '#fff',
  },
  liveBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    background: 'var(--coral)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '6px', padding: '5px',
  },
  liveDot: {
    width: '6px', height: '6px', borderRadius: '50%',
    background: '#fff', flexShrink: 0,
  },
  liveText: { fontSize: '11px', fontWeight: '700', color: '#fff', letterSpacing: '0.5px' },
  body: {
    padding: '18px', display: 'flex',
    flexDirection: 'column', flex: 1,
  },
  category: {
    fontSize: '10px', fontWeight: '700', color: 'var(--coral)',
    textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '5px',
  },
  title: {
    fontSize: '15px', fontWeight: '700', color: 'var(--navy)',
    lineHeight: '1.35', marginBottom: '7px',
    fontFamily: 'var(--font-serif)',
  },
  desc: {
    fontSize: '12px', color: 'var(--slate)', lineHeight: '1.6',
    marginBottom: '14px', flex: 1,
  },
  divider: { height: '1px', background: 'var(--offwhite-3)', marginBottom: '14px' },
  bidRow: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-end', marginBottom: '10px',
  },
  bidLabel: {
    fontSize: '10px', color: 'var(--slate-light)',
    textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px',
  },
  bidAmount: { fontSize: '22px', fontWeight: '800', color: 'var(--navy)', lineHeight: 1 },
  startingBid: { fontSize: '13px', fontWeight: '500', color: 'var(--slate-muted)' },
  timerRow: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' },
  timerDot: {
    width: '7px', height: '7px', borderRadius: '50%',
    background: 'var(--coral)', flexShrink: 0,
  },
  timer:        { fontSize: '12px', color: 'var(--coral)', fontWeight: '600', margin: 0 },
  upcomingTag:  { fontSize: '12px', color: 'var(--info)', fontWeight: '500', marginBottom: '12px' },
  endedTag:     { fontSize: '12px', color: 'var(--slate)', marginBottom: '12px' },
  cancelledTag: { fontSize: '12px', color: 'var(--danger)', marginBottom: '12px' },
  viewBtn: {
    display: 'block', textAlign: 'center',
    background: 'var(--navy)', color: '#fff',
    padding: '11px', borderRadius: 'var(--radius-md)',
    fontSize: '13px', fontWeight: '600', marginTop: 'auto',
    transition: 'var(--transition)',
    letterSpacing: '0.3px',
  },
};

export default AuctionCard;