import { useState, useEffect } from 'react';
import { getAuctions, createAuction, updateAuctionStatus, deleteAuction } from '../../services/api';
import { toast } from 'react-toastify';

const EMPTY_FORM = { title: '', description: '', category: 'Watches', startingBid: '', startDate: '', endDate: '' };
const CATEGORIES = ['Watches', 'Art', 'Electronics', 'Jewelry', 'Vehicles', 'Other'];

const ManageAuctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [loading,  setLoading]  = useState(false);

  const fetchAuctions = () =>
    getAuctions().then(({ data }) => setAuctions(data)).catch(() => toast.error('Failed to load'));

  useEffect(() => { fetchAuctions(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createAuction({ ...form, startingBid: Number(form.startingBid) });
      toast.success('Auction created!');
      setForm(EMPTY_FORM);
      setShowForm(false);
      fetchAuctions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create auction');
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await updateAuctionStatus(id, status);
      toast.success(`Status updated to ${status}`);
      fetchAuctions();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this auction and all its bids?')) return;
    try {
      await deleteAuction(id);
      toast.success('Auction deleted');
      fetchAuctions();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.pageTitle}>Manage Auctions</h1>
          <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
            {showForm ? '✕ Cancel' : '+ New Auction'}
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>Create New Auction</h2>
            <form onSubmit={handleCreate}>
              <div style={styles.formGrid}>
                <div>
                  <label style={styles.label}>Title</label>
                  <input style={styles.input} value={form.title} required
                    onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>
                <div>
                  <label style={styles.label}>Category</label>
                  <select style={styles.input} value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={styles.label}>Starting Bid ($)</label>
                  <input style={styles.input} type="number" value={form.startingBid} required
                    onChange={e => setForm({ ...form, startingBid: e.target.value })} />
                </div>
                <div>
                  <label style={styles.label}>Start Date</label>
                  <input style={styles.input} type="datetime-local" value={form.startDate} required
                    onChange={e => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div>
                  <label style={styles.label}>End Date</label>
                  <input style={styles.input} type="datetime-local" value={form.endDate} required
                    onChange={e => setForm({ ...form, endDate: e.target.value })} />
                </div>
              </div>
              <div>
                <label style={styles.label}>Description</label>
                <textarea style={{ ...styles.input, height: '80px', resize: 'vertical' }}
                  value={form.description} required
                  onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <button type="submit" style={styles.submitBtn} disabled={loading}>
                {loading ? 'Creating...' : 'Create Auction'}
              </button>
            </form>
          </div>
        )}

        {/* Table */}
        <div style={styles.card}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['Title', 'Category', 'Current Bid', 'Bids', 'Status', 'End Date', 'Actions'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {auctions.map(a => (
                <tr key={a._id} style={styles.tr}>
                  <td style={styles.td}><strong>{a.title}</strong></td>
                  <td style={styles.td}>{a.category}</td>
                  <td style={styles.td}>${a.currentBid.toLocaleString()}</td>
                  <td style={styles.td}>{a.totalBids}</td>
                  <td style={styles.td}>
                    <select value={a.status} style={styles.statusSelect}
                      onChange={e => handleStatus(a._id, e.target.value)}>
                      {['upcoming', 'live', 'ended', 'cancelled'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td style={styles.td}>{new Date(a.endDate).toLocaleDateString()}</td>
                  <td style={styles.td}>
                    <button onClick={() => handleDelete(a._id)} style={styles.deleteBtn}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page:        { minHeight: '100vh', background: '#f5f5f5', padding: '32px 24px' },
  container:   { maxWidth: '1200px', margin: '0 auto' },
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  pageTitle:   { fontSize: '28px', fontWeight: '800', color: '#1a1a2e' },
  addBtn:      { padding: '10px 20px', background: '#c9973a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  formCard:    { background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e8e8e8', marginBottom: '20px' },
  formTitle:   { fontSize: '18px', fontWeight: '700', color: '#1a1a2e', marginBottom: '18px' },
  formGrid:    { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '14px' },
  label:       { display: 'block', fontSize: '11px', fontWeight: '700', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px' },
  input:       { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '13px', outline: 'none' },
  submitBtn:   { marginTop: '14px', padding: '11px 28px', background: '#1a1a2e', color: '#e2b96f', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' },
  card:        { background: '#fff', borderRadius: '12px', border: '1px solid #e8e8e8', overflow: 'hidden' },
  table:       { width: '100%', borderCollapse: 'collapse' },
  th:          { padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#999', textTransform: 'uppercase', borderBottom: '2px solid #f0f0f0', background: '#fafafa' },
  tr:          { borderBottom: '1px solid #f5f5f5' },
  td:          { padding: '12px 16px', fontSize: '13px', color: '#444' },
  statusSelect:{ padding: '4px 8px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' },
  deleteBtn:   { padding: '5px 12px', background: '#fdecea', color: '#c62828', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
};

export default ManageAuctions;