import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAuctionById, getBidsByAuction } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BidModal from '../components/BidModal';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';

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

const AuctionDetail = () => {
  const { id }                      = useParams();
  const { user }                    = useAuth();
  const [auction,   setAuction]     = useState(null);
  const [bids,      setBids]        = useState([]);
  const [loading,   setLoading]     = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [imgError,  setImgError]    = useState(false);
  const [liveUsers, setLiveUsers]   = useState(0);
  const [newBidFlash, setNewBidFlash] = useState(false);
  const socketRef                   = useRef(null);

  const fetchData = async () => {
    try {
      const [{ data: a }, { data: b }] = await Promise.all([
        getAuctionById(id),
        getBidsByAuction(id),
      ]);
      setAuction(a);
      setBids(b);
    } catch {
      toast.error('Failed to load auction');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setImgError(false);

    // ── Connect WebSocket ──
    const socket = io('http://localhost:5000', {
      transports: ['websocket'],
    });
    socketRef.current = socket;

    // Join this auction room
    socket.emit('join_auction', id);

    // Real-time new bid
    socket.on('bid_placed', (data) => {
      if (data.auctionId !== id) return;

      // Update auction state live
      setAuction(prev => prev ? {
        ...prev,
        currentBid:    data.currentBid,
        totalBids:     data.totalBids,
        highestBidder: data.highestBidder,
      } : prev);

      // Prepend new bid to history
      setBids(prev => [data.newBid, ...prev]);

      // Flash animation on bid box
      setNewBidFlash(true);
      setTimeout(() => setNewBidFlash(false), 1000);

      // Notify other watchers
      if (user && data.newBid.bidder?.email !== user.email) {
        toast.info(
          `💰 New bid: $${data.currentBid.toLocaleString()} by ${data.highestBidder.name}`,
          { autoClose: 4000 }
        );
      }
    });

    // Auction status changed by admin
    socket.on('auction_status_changed', (data) => {
      if (data.auctionId !== id) return;
      setAuction(prev => prev ? { ...prev, status: data.status } : prev);
      toast.info(`Auction status changed to: ${data.status.toUpperCase()}`);
    });

    // Live viewer count
    socket.on('viewer_count', (count) => setLiveUsers(count));

    return () => {
      socket.emit('leave_auction', id);
      socket.disconnect();
    };
  }, [id]);

  if (loading) return (
    <div style={styles.loadingPage}>
      <div style={styles.loadingSpinner}>⏳</div>
      <p>Loading auction...</p>
    </div>
  );

  if (!auction) return (
    <div style={styles.loadingPage}>
      <p style={{ fontSize: '48px' }}>🔍</p>
      <p>Auction not found</p>
      <Link to="/" style={styles.backLink}>← Back to Auctions</Link>
    </div>
  );

  const canBid        = user && user.role === 'buyer' && auction.status === 'live';
  const statusStyle   = STATUS_COLORS[auction.status] || STATUS_COLORS.ended;
  const image         = auction.images?.[0];
  const showImage     = image && !imgError;
  const timeLeft      = new Date(auction.endDate) - new Date();
  const daysLeft      = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60 * 24)));
  const topBid        = bids[0];
  const fallbackBg    = CATEGORY_BG[auction.category] || '#f5f5f5';
  const fallbackEmoji = CATEGORY_EMOJI[auction.category] || '🏷️';

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* ── LEFT COLUMN ── */}
        <div style={styles.left}>

          {/* Back link */}
          <Link to="/" style={styles.backLink}>← Back to Auctions</Link>

          {/* Main image */}
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
                <p style={styles.fallbackText}>{auction.category}</p>
              </div>
            )}

            {/* Status overlay bottom-left */}
            <span style={{ ...styles.statusOverlay, ...statusStyle }}>
              {auction.status.toUpperCase()}
            </span>

            {/* Live pill top-right */}
            {auction.status === 'live' && (
              <div style={styles.livePill}>
                <span style={styles.liveDot} />
                LIVE {liveUsers > 1 && `· ${liveUsers} watching`}
              </div>
            )}

            {/* Days left top-left */}
            {auction.status === 'live' && (
              <div style={styles.daysLeftPill}>
                ⏱ {daysLeft}d left
              </div>
            )}
          </div>

          {/* Item details card */}
          <div style={styles.card}>
            <p style={styles.category}>{auction.category}</p>
            <h1 style={styles.title}>{auction.title}</h1>
            <p style={styles.desc}>{auction.description}</p>

            <div style={styles.divider} />

            {/* Info grid */}
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Status</span>
                <span style={{
                  ...styles.infoValue,
                  ...statusStyle,
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '700',
                }}>
                  {auction.status.toUpperCase()}
                </span>
              </div>

              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Starting Bid</span>
                <span style={styles.infoValue}>
                  ${auction.startingBid.toLocaleString()}
                </span>
              </div>

              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Start Date</span>
                <span style={styles.infoValue}>
                  {new Date(auction.startDate).toLocaleDateString('en-US', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </span>
              </div>

              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>End Date</span>
                <span style={styles.infoValue}>
                  {new Date(auction.endDate).toLocaleDateString('en-US', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </span>
              </div>

              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Listed By</span>
                <span style={styles.infoValue}>
                  {auction.createdBy?.name || 'Admin'}
                </span>
              </div>

              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Total Bids</span>
                <span style={styles.infoValue}>{auction.totalBids}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div style={styles.right}>

          {/* ── Bid box ── */}
          <div style={{
            ...styles.bidBox,
            outline: newBidFlash ? '2px solid #c9973a' : '2px solid transparent',
            transition: 'outline 0.3s ease',
          }}>
            <div style={styles.bidBoxHeader}>
              <p style={styles.currentBidLabel}>Current Bid</p>
              {auction.status === 'live' && (
                <div style={styles.countdownBadge}>
                  ⏱ {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                </div>
              )}
              {auction.status === 'ended' && (
                <div style={styles.endedBadge}>Closed</div>
              )}
              {auction.status === 'upcoming' && (
                <div style={styles.upcomingBadge}>Upcoming</div>
              )}
            </div>

            {/* Real-time indicator */}
            {auction.status === 'live' && (
              <div style={styles.realtimeBadge}>
                <span style={styles.realtimeDot} />
                Live updates on
              </div>
            )}

            <p style={{
              ...styles.currentBidAmount,
              color: newBidFlash ? '#fff' : '#e2b96f',
              transition: 'color 0.3s ease',
            }}>
              ${auction.currentBid.toLocaleString()}
            </p>

            <p style={styles.totalBids}>
              {auction.totalBids} bid{auction.totalBids !== 1 ? 's' : ''} placed
            </p>

            {/* Leading bidder */}
            {auction.highestBidder && (
              <div style={styles.leadingBidder}>
                <div style={styles.leadingAvatar}>
                  {auction.highestBidder.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={styles.leadingLabel}>Leading bidder</p>
                  <p style={styles.leadingName}>{auction.highestBidder.name}</p>
                </div>
                <span style={styles.trophyIcon}>🏆</span>
              </div>
            )}

            <div style={styles.bidBoxDivider} />

            {/* CTA */}
            {canBid && (
              <button onClick={() => setShowModal(true)} style={styles.bidBtn}>
                🔨 Place a Bid
              </button>
            )}

            {!user && (
              <div style={styles.promptBox}>
                <p style={styles.promptText}>
                  <Link to="/login"    style={styles.promptLink}>Login</Link>
                  {' '}or{' '}
                  <Link to="/register" style={styles.promptLink}>Register</Link>
                  {' '}to place a bid
                </p>
              </div>
            )}

            {user?.role === 'admin' && (
              <div style={styles.promptBox}>
                <p style={styles.promptText}>👤 Admins cannot place bids</p>
              </div>
            )}

            {user?.role === 'buyer' && auction.status !== 'live' && (
              <div style={styles.promptBox}>
                <p style={styles.promptText}>
                  {auction.status === 'upcoming'  && '🕐 Bidding has not started yet'}
                  {auction.status === 'ended'     && '✔ This auction has ended'}
                  {auction.status === 'cancelled' && '✕ This auction was cancelled'}
                </p>
              </div>
            )}
          </div>

          {/* ── Top bid highlight ── */}
          {topBid && (
            <div style={styles.topBidCard}>
              <p style={styles.topBidLabel}>🥇 Highest Bid</p>
              <div style={styles.topBidRow}>
                <div style={styles.topBidAvatar}>
                  {topBid.bidder?.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={styles.topBidName}>{topBid.bidder?.name}</p>
                  <p style={styles.topBidTime}>
                    {new Date(topBid.createdAt).toLocaleString()}
                  </p>
                </div>
                <p style={styles.topBidAmt}>
                  ${topBid.amount.toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* ── Bid history ── */}
          <div style={styles.card}>
            <div style={styles.bidHistoryHeader}>
              <h3 style={styles.bidsTitle}>Bid History</h3>
              <span style={styles.bidHistoryCount}>{bids.length}</span>
            </div>

            {bids.length === 0 ? (
              <div style={styles.noBidsBox}>
                <p style={{ fontSize: '32px', marginBottom: '8px' }}>🔨</p>
                <p style={styles.noBids}>No bids yet. Be the first!</p>
              </div>
            ) : (
              <div style={styles.bidList}>
                {bids.map((bid, i) => (
                  <div
                    key={bid._id || i}
                    style={{
                      ...styles.bidItem,
                      ...(i === 0 ? styles.topBidItem : {}),
                    }}
                  >
                    {/* Rank */}
                    <div style={{
                      ...styles.bidRank,
                      background: i === 0 ? '#c9973a' : i === 1 ? '#aaa' : i === 2 ? '#cd7f32' : '#f0f0f0',
                      color:      i < 3 ? '#fff' : '#bbb',
                    }}>
                      {i + 1}
                    </div>

                    {/* Avatar */}
                    <div style={{
                      ...styles.bidAvatar,
                      background: i === 0 ? '#fff3e0' : '#f5f5f5',
                      color:      i === 0 ? '#c9973a' : '#888',
                      border:     i === 0 ? '2px solid #c9973a' : '2px solid transparent',
                    }}>
                      {bid.bidder?.name?.charAt(0).toUpperCase() || '?'}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={styles.bidderName}>
                        {bid.bidder?.name || 'Anonymous'}
                        {i === 0 && <span style={styles.leadingTag}> 🏆</span>}
                      </p>
                      <p style={styles.bidTime}>
                        {new Date(bid.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {/* Amount + status */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{
                        ...styles.bidAmt,
                        color: i === 0 ? '#c9973a' : '#aaa',
                      }}>
                        ${bid.amount.toLocaleString()}
                      </p>
                      <p style={{
                        ...styles.bidStatus,
                        color: bid.status === 'active'  ? '#2e7d32'
                             : bid.status === 'outbid'  ? '#e65100'
                             : bid.status === 'won'     ? '#1565c0'
                             : '#c62828',
                      }}>
                        {bid.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {showModal && (
        <BidModal
          auction={auction}
          onClose={() => setShowModal(false)}
          onBidPlaced={fetchData}
        />
      )}
    </div>
  );
};

const styles = {
  // ── Page ──
  page:      { minHeight: '100vh', background: '#f5f5f5', paddingBottom: '48px' },
  container: {
    maxWidth: '1140px', margin: '0 auto', padding: '24px 24px 0',
    display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px',
    alignItems: 'start',
  },
  left:  {},
  right: { position: 'sticky', top: '80px' },

  // ── Loading ──
  loadingPage:    { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#aaa', gap: '12px' },
  loadingSpinner: { fontSize: '40px' },

  // ── Back link ──
  backLink: { display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#888', textDecoration: 'none', marginBottom: '14px', fontWeight: '500' },

  // ── Image ──
  imgBox: {
    height: '380px', borderRadius: '16px', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', position: 'relative', marginBottom: '16px',
    border: '1px solid #e8e8e8',
  },
  img:           { width: '100%', height: '100%', objectFit: 'cover' },
  fallbackBox:   { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' },
  fallbackEmoji: { fontSize: '88px', lineHeight: 1 },
  fallbackText:  { fontSize: '14px', color: '#bbb', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px' },
  statusOverlay: {
    position: 'absolute', bottom: '14px', left: '14px',
    fontSize: '11px', fontWeight: '700', padding: '5px 12px',
    borderRadius: '20px', letterSpacing: '0.8px',
  },
  livePill: {
    position: 'absolute', top: '14px', right: '14px',
    display: 'flex', alignItems: 'center', gap: '6px',
    background: 'rgba(26,26,46,0.82)', color: '#e2b96f',
    padding: '5px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
  },
  liveDot:      { width: '7px', height: '7px', borderRadius: '50%', background: '#e74c3c' },
  daysLeftPill: {
    position: 'absolute', top: '14px', left: '14px',
    background: 'rgba(231,76,60,0.85)', color: '#fff',
    padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
  },

  // ── Detail card ──
  card:      { background: '#fff', borderRadius: '14px', padding: '24px', border: '1px solid #e8e8e8', marginBottom: '16px' },
  category:  { fontSize: '11px', fontWeight: '700', color: '#c9973a', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px' },
  title:     { fontSize: '26px', fontWeight: '800', color: '#1a1a2e', lineHeight: '1.3', marginBottom: '14px' },
  desc:      { fontSize: '14px', color: '#666', lineHeight: '1.8' },
  divider:   { height: '1px', background: '#f0f0f0', margin: '20px 0' },
  infoGrid:  { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  infoItem:  { background: '#f8f8f8', borderRadius: '10px', padding: '12px 14px' },
  infoLabel: { display: 'block', fontSize: '10px', color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '5px' },
  infoValue: { fontSize: '13px', fontWeight: '700', color: '#333', display: 'inline-block' },

  // ── Bid box ──
  bidBox:           { background: '#1a1a2e', borderRadius: '16px', padding: '24px', marginBottom: '14px' },
  bidBoxHeader:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' },
  currentBidLabel:  { fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '1.5px' },
  countdownBadge:   { fontSize: '11px', background: 'rgba(231,76,60,0.2)', color: '#e74c3c', padding: '4px 10px', borderRadius: '12px', fontWeight: '600' },
  endedBadge:       { fontSize: '11px', background: 'rgba(255,255,255,0.08)', color: '#666', padding: '4px 10px', borderRadius: '12px', fontWeight: '600' },
  upcomingBadge:    { fontSize: '11px', background: 'rgba(21,101,192,0.2)', color: '#5b9bd5', padding: '4px 10px', borderRadius: '12px', fontWeight: '600' },
  realtimeBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    fontSize: '10px', color: '#2ecc71', fontWeight: '600',
    marginBottom: '8px', letterSpacing: '0.5px',
  },
  realtimeDot: {
    width: '6px', height: '6px', borderRadius: '50%',
    background: '#2ecc71', flexShrink: 0,
  },
  currentBidAmount: { fontSize: '44px', fontWeight: '900', color: '#e2b96f', lineHeight: 1, marginBottom: '4px' },
  totalBids:        { fontSize: '13px', color: '#444', marginBottom: '16px' },
  leadingBidder:    { display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px' },
  leadingAvatar:    { width: '34px', height: '34px', borderRadius: '50%', background: '#c9973a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', flexShrink: 0 },
  leadingLabel:     { fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px' },
  leadingName:      { fontSize: '14px', fontWeight: '700', color: '#e2b96f' },
  trophyIcon:       { fontSize: '18px', marginLeft: 'auto' },
  bidBoxDivider:    { height: '1px', background: 'rgba(255,255,255,0.07)', marginBottom: '16px' },
  bidBtn:           { width: '100%', padding: '15px', background: '#c9973a', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.3px' },
  promptBox:        { background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '12px', textAlign: 'center' },
  promptText:       { fontSize: '13px', color: '#555' },
  promptLink:       { color: '#c9973a', fontWeight: '600', textDecoration: 'none' },

  // ── Top bid card ──
  topBidCard:   { background: '#fffbf0', border: '1px solid #f5e6c0', borderRadius: '14px', padding: '16px', marginBottom: '14px' },
  topBidLabel:  { fontSize: '11px', fontWeight: '700', color: '#c9973a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' },
  topBidRow:    { display: 'flex', alignItems: 'center', gap: '12px' },
  topBidAvatar: { width: '38px', height: '38px', borderRadius: '50%', background: '#c9973a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px', flexShrink: 0 },
  topBidName:   { fontSize: '14px', fontWeight: '700', color: '#1a1a2e' },
  topBidTime:   { fontSize: '11px', color: '#aaa', marginTop: '2px' },
  topBidAmt:    { marginLeft: 'auto', fontSize: '20px', fontWeight: '800', color: '#c9973a' },

  // ── Bid history ──
  bidHistoryHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' },
  bidsTitle:        { fontSize: '16px', fontWeight: '700', color: '#1a1a2e' },
  bidHistoryCount:  { background: '#f0f0f0', color: '#888', fontSize: '12px', fontWeight: '600', padding: '2px 10px', borderRadius: '12px' },
  noBidsBox:        { textAlign: 'center', padding: '32px 20px' },
  noBids:           { fontSize: '13px', color: '#aaa' },
  bidList:          { display: 'flex', flexDirection: 'column', gap: '4px' },
  bidItem:          { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 10px', borderRadius: '10px' },
  topBidItem:       { background: '#fffbf0', border: '1px solid #f5e6c0' },
  bidRank:          { width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800', flexShrink: 0 },
  bidAvatar:        { width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px', flexShrink: 0 },
  bidderName:       { fontSize: '13px', fontWeight: '600', color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  leadingTag:       { fontSize: '12px', color: '#c9973a' },
  bidTime:          { fontSize: '11px', color: '#bbb', marginTop: '2px' },
  bidAmt:           { fontSize: '15px', fontWeight: '700' },
  bidStatus:        { fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px', fontWeight: '600' },

  center: { textAlign: 'center', padding: '80px', fontSize: '16px', color: '#aaa' },
};

export default AuctionDetail;