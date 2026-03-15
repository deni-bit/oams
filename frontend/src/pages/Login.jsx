import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login }             = useAuth();
  const navigate              = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>🔨 Welcome Back</h1>
        <p style={styles.sub}>Sign in to your OAMS account</p>

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Email</label>
          <input
            style={styles.input} type="email" placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <label style={styles.label}>Password</label>
          <input
            style={styles.input} type="password" placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.footerLink}>Register</Link>
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

export default Login;