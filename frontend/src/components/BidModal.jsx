import { useState } from 'react';
import { toast } from 'react-toastify';
import { placeBid } from '../services/api';

const BidModal = ({ auction, onClose, onBidPlaced }) => {
  const [amount, setAmount]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const bid = parseFloat(amount);
    if (!bid || bid <= auction.currentBid) {
      toast.error(`Bid must be greater than $${auction.currentBid}`);
      return;
    }
    try {
      setLoading(true);
      await placeBid({ auctionId: auction._id, amount: bid });
      toast.success('Bid placed successfully!');
      onBidPlaced();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place bid');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>Place a Bid</h2>
        <p style={styles.auctionName}>{auction.title}</p>

        <div style={styles.currentBidBox}>
          <span style={styles.currentBidLabel}>Current Bid</span>
          <span style={styles.currentBidAmount}>${auction.currentBid.toLocaleString()}</span>
        </div>

        <label style={styles.label}>Your Bid Amount ($)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={`Minimum: $${auction.currentBid + 1}`}
          style={styles.input}
          min={auction.currentBid + 1}
        />

        <div style={styles.btnRow}>
          <button onClick={onClose}      style={styles.cancelBtn}>Cancel</button>
          <button onClick={handleSubmit} style={styles.submitBtn} disabled={loading}>
            {loading ? 'Placing...' : 'Place Bid'}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
  },
  modal: {
    background: '#fff', borderRadius: '16px', padding: '32px',
    width: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  title:           { fontSize: '22px', fontWeight: '700', marginBottom: '6px', color: '#1a1a2e' },
  auctionName:     { fontSize: '14px', color: '#888', marginBottom: '20px' },
  currentBidBox:   { background: '#f8f4ec', borderRadius: '10px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  currentBidLabel: { fontSize: '12px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px' },
  currentBidAmount:{ fontSize: '24px', fontWeight: '700', color: '#c9973a' },
  label:           { display: 'block', fontSize: '12px', fontWeight: '600', color: '#555', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input:           { width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', marginBottom: '20px', outline: 'none' },
  btnRow:          { display: 'flex', gap: '10px' },
  cancelBtn:       { flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '14px' },
  submitBtn:       { flex: 1, padding: '12px', border: 'none', borderRadius: '8px', background: '#c9973a', color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
};

export default BidModal;