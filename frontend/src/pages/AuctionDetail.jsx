import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getAuctionById, getBidsByAuction } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BidModal from '../components/BidModal';
import { toast } from 'react-toastify';

const AuctionDetail = () => {
  const { id }                    = useParams();
  const { user }                  = useAuth();
  const [auction,  setAuction]    = useState(null);
  const [bids,     setBids]       = useState([]);
  const [loading,  setLoading]    = useState(true);
  const [showModal,setShowModal]  = useState(false);

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

  useEffect(() => { fetchData(); }, [id]);

  if (loading) return <div style={styles.center}>Loading...</div>;
  if (!auction) return <div style={styles.center}>Auction not found</div>;

  const canBid = user && user.role === 'buyer' && auction.status === 'live';

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Left */}
        <div style={styles.left}>
          <div style={styles.imgBox}>🏷️</div>
          <div style={styles.card}>
            <h1 style={styles.title}>{auction.title}</h1>
            <p style={styles.category}>{auction.category}</p>
            <p style={styles.desc}>{auction.description}</p>

            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Status</span>
                <span style={styles.infoValue}>{auction.status.toUpperCase()}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Starting Bid</span>
                <span style={styles.infoValue}>${auction.startingBid.toLocaleString()}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Start Date</span>
                <span style={styles.infoValue}>{new Date(auction.startDate).toLocaleDateString()}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>End Date</span>
                <span style={styles.infoValue}>{new Date(auction.endDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div style={styles.right}>
          <div style={styles.bidBox}>
            <p style={styles.currentBidLabel}>Current Bid</p>
            <p style={styles.currentBidAmount}>${auction.currentBid.toLocaleString()}</p>
            <p style={styles.totalBids}>{auction.totalBids} bid{auction.totalBids !== 1 ? 's' : ''} placed</p>

            {auction.highestBidder && (
              <p style={styles.highestBidder}>
                🏆 Leading: <strong>{auction.highestBidder.name}</strong>
              </p>
            )}

            {canBid && (
              <button onClick={() => setShowModal(true)} style={styles.bidBtn}>
                Place a Bid
              </button>
            )}
            {!user && (
              <p style={styles.loginPrompt}>
                <a href="/login" style={{ color: '#c9973a' }}>Login</a> to place a bid
              </p>
            )}
            {user?.role === 'admin' && (
              <p style={styles.loginPrompt}>Admins cannot place bids</p>
            )}
            {auction.status !== 'live' && (
              <p style={styles.loginPrompt}>Bidding is closed for this auction</p>
            )}
          </div>

          {/* Bid History */}
          <div style={styles.card}>
            <h3 style={styles.bidsTitle}>Bid History ({bids.length})</h3>
            {bids.length === 0 ? (
              <p style={styles.noBids}>No bids yet. Be the first!</p>
            ) : (
              bids.map((bid, i) => (
                <div key={bid._id} style={{ ...styles.bidItem, ...(i === 0 ? styles.topBid : {}) }}>
                  <div>
                    <p style={styles.bidderName}>{bid.bidder?.name || 'Anonymous'}</p>
                    <p style={styles.bidTime}>{new Date(bid.createdAt).toLocaleString()}</p>
                  </div>
                  <p style={styles.bidAmt}>${bid.amount.toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <BidModal auction={auction} onClose={() => setShowModal(false)} onBidPlaced={fetchData} />
      )}
    </div>
  );
};

const styles = {
  page:             { minHeight: '100vh', background: '#f5f5f5', padding: '32px 24px' },
  container:        { maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' },
  left:             {},
  right:            {},
  imgBox:           { height: '260px', background: '#fff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '80px', marginBottom: '16px', border: '1px solid #e8e8e8' },
  card:             { background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e8e8e8', marginBottom: '16px' },
  title:            { fontSize: '24px', fontWeight: '700', color: '#1a1a2e', marginBottom: '6px' },
  category:         { fontSize: '13px', color: '#c9973a', fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase' },
  desc:             { fontSize: '14px', color: '#666', lineHeight: '1.7', marginBottom: '20px' },
  infoGrid:         { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  infoItem:         { background: '#f8f8f8', borderRadius: '8px', padding: '12px' },
  infoLabel:        { display: 'block', fontSize: '10px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' },
  infoValue:        { fontSize: '14px', fontWeight: '600', color: '#333' },
  bidBox:           { background: '#1a1a2e', borderRadius: '12px', padding: '24px', marginBottom: '16px', textAlign: 'center' },
  currentBidLabel:  { fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' },
  currentBidAmount: { fontSize: '40px', fontWeight: '800', color: '#e2b96f', marginBottom: '4px' },
  totalBids:        { fontSize: '13px', color: '#666', marginBottom: '12px' },
  highestBidder:    { fontSize: '13px', color: '#aaa', marginBottom: '16px' },
  bidBtn:           { width: '100%', padding: '14px', background: '#c9973a', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' },
  loginPrompt:      { fontSize: '13px', color: '#666', marginTop: '12px' },
  bidsTitle:        { fontSize: '16px', fontWeight: '700', color: '#1a1a2e', marginBottom: '14px' },
  noBids:           { fontSize: '13px', color: '#aaa', textAlign: 'center', padding: '20px' },
  bidItem:          { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f0f0' },
  topBid:           { background: '#fffbf0', margin: '0 -24px', padding: '10px 24px' },
  bidderName:       { fontSize: '13px', fontWeight: '600', color: '#333' },
  bidTime:          { fontSize: '11px', color: '#aaa' },
  bidAmt:           { fontSize: '16px', fontWeight: '700', color: '#c9973a' },
  center:           { textAlign: 'center', padding: '80px', fontSize: '16px', color: '#aaa' },
};

export default AuctionDetail;