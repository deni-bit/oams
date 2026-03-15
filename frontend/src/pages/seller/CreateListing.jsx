import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';

const CATEGORIES = ['Watches', 'Art', 'Electronics', 'Jewelry', 'Vehicles', 'Other'];

const CreateListing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', category: 'Watches',
    startingBid: '', startDate: '', endDate: '', images: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/seller/listings', {
        ...form,
        startingBid: Number(form.startingBid),
        images: form.images ? [form.images] : [],
      });
      toast.success('Listing submitted for admin approval!');
      navigate('/seller/listings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <Link to="/seller/listings" style={styles.backLink}>← Back to Listings</Link>

        <div style={styles.card}>
          <h1 style={styles.title}>Create New Listing</h1>
          <p style={styles.sub}>Your listing will be reviewed by an admin before going live.</p>

          <div style={styles.noticeBanner}>
            ℹ️ Listings require admin approval before they become visible to buyers.
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGrid}>
              <div style={styles.field}>
                <label style={styles.label}>Title</label>
                <input
                  style={styles.input} required
                  placeholder="e.g. Vintage Rolex Submariner 1968"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Category</label>
                <select
                  style={styles.input}
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Starting Bid ($)</label>
                <input
                  style={styles.input} type="number" required min="1"
                  placeholder="e.g. 500"
                  value={form.startingBid}
                  onChange={e => setForm({ ...form, startingBid: e.target.value })}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Image URL</label>
                <input
                  style={styles.input}
                  placeholder="https://images.unsplash.com/..."
                  value={form.images}
                  onChange={e => setForm({ ...form, images: e.target.value })}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Start Date</label>
                <input
                  style={styles.input} type="datetime-local" required
                  value={form.startDate}
                  onChange={e => setForm({ ...form, startDate: e.target.value })}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>End Date</label>
                <input
                  style={styles.input} type="datetime-local" required
                  value={form.endDate}
                  onChange={e => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Description</label>
              <textarea
                style={{ ...styles.input, height: '120px', resize: 'vertical' }}
                required
                placeholder="Describe your item in detail — condition, history, specifications..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {/* Image preview */}
            {form.images && (
              <div style={styles.preview}>
                <p style={styles.previewLabel}>Image Preview</p>
                <img
                  src={form.images}
                  alt="preview"
                  style={styles.previewImg}
                  onError={e => e.target.style.display = 'none'}
                />
              </div>
            )}

            <div style={styles.btnRow}>
              <Link to="/seller/listings" style={styles.cancelBtn}>Cancel</Link>
              <button type="submit" style={styles.submitBtn} disabled={loading}>
                {loading ? 'Submitting...' : 'Submit for Approval'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page:          { minHeight: '100vh', background: '#f5f5f5', padding: '32px 24px' },
  container:     { maxWidth: '800px', margin: '0 auto' },
  backLink:      { display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#888', textDecoration: 'none', marginBottom: '16px', fontWeight: '500' },
  card:          { background: '#fff', borderRadius: '14px', padding: '32px', border: '1px solid #e8e8e8' },
  title:         { fontSize: '24px', fontWeight: '800', color: '#1a1a2e', marginBottom: '6px' },
  sub:           { fontSize: '14px', color: '#888', marginBottom: '20px' },
  noticeBanner:  { background: '#e3f2fd', border: '1px solid #bbdefb', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: '#1565c0', marginBottom: '24px' },
  form:          { display: 'flex', flexDirection: 'column', gap: '16px' },
  formGrid:      { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  field:         { display: 'flex', flexDirection: 'column', gap: '6px' },
  label:         { fontSize: '11px', fontWeight: '700', color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input:         { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '13px', outline: 'none' },
  preview:       { marginTop: '8px' },
  previewLabel:  { fontSize: '11px', color: '#aaa', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  previewImg:    { width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e8e8e8' },
  btnRow:        { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' },
  cancelBtn:     { padding: '11px 24px', border: '1px solid #ddd', borderRadius: '8px', background: '#fff', color: '#555', textDecoration: 'none', fontSize: '14px', fontWeight: '500' },
  submitBtn:     { padding: '11px 28px', background: '#1a1a2e', color: '#e2b96f', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' },
};

export default CreateListing;