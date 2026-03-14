import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm]       = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { register }          = useAuth();
  const navigate              = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      setLoading(true);
      // role is always 'buyer' — hardcoded, not from user input
      const user = await register(form.name, form.email, form.password, 'buyer');
      toast.success(`Account created! Welcome, ${user.name}`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>🔨 Create Account</h1>
        <p style={styles.sub}>Join OAMS as a buyer and start bidding</p>

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Full Name</label>
          <input style={styles.input} type="text" placeholder="John Doe"
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />

          <label style={styles.label}>Email</label>
          <input style={styles.input} type="email" placeholder="you@example.com"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />

          <label style={styles.label}>Password</label>
          <input style={styles.input} type="password" placeholder="Min. 6 characters"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />

          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account? <Link to="/login" style={styles.footerLink}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page:       { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' },
  card:       { background: '#fff', borderRadius: '16px', padding: '40px', width: '400px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
  title:      { fontSize: '26px', fontWeight: '700', color: '#1a1a2e', marginBottom: '6px' },
  sub:        { fontSize: '14px', color: '#888', marginBottom: '28px' },
  label:      { display: 'block', fontSize: '12px', fontWeight: '600', color: '#555', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input:      { width: '100%', padding: '11px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', marginBottom: '16px', outline: 'none' },
  btn:        { width: '100%', padding: '13px', background: '#1a1a2e', color: '#e2b96f', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginTop: '4px' },
  footer:     { textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#888' },
  footerLink: { color: '#c9973a', fontWeight: '600', textDecoration: 'none' },
};

export default Register;