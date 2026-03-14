import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
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

        {/* Header */}
        <div style={styles.header}>
          <span style={styles.headerIcon}>⚖</span>
          <h1 style={styles.title}>Welcome Back</h1>
          <p style={styles.sub}>Sign in to your OAMS account</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email Address</label>
            <input
              style={styles.input}
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <div style={styles.passWrap}>
              <input
                style={{ ...styles.input, paddingRight: '44px' }}
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={styles.eyeBtn}
              >
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? (
              <span style={styles.btnLoading}>Signing in...</span>
            ) : (
              'Sign In →'
            )}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>New to OAMS?</span>
          <span style={styles.dividerLine} />
        </div>

        <Link to="/register" style={styles.registerLink}>
          Create a free account
        </Link>

      </div>

      {/* Side decoration */}
      <div style={styles.side}>
        <h2 style={styles.sideTitle}>Bid on Rare & Unique Items</h2>
        <p style={styles.sideSub}>Join thousands of buyers on the most trusted online auction platform.</p>
        <div style={styles.sideStats}>
          {[
            { value: '22+', label: 'Live Auctions' },
            { value: '6',   label: 'Categories'    },
            { value: '100%',label: 'Secure'        },
          ].map(s => (
            <div key={s.label} style={styles.sideStat}>
              <p style={styles.sideStatValue}>{s.value}</p>
              <p style={styles.sideStatLabel}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh', display: 'flex',
    background: 'var(--offwhite)',
  },
  card: {
    width: '480px', flexShrink: 0,
    background: 'var(--white)',
    padding: '48px 44px',
    display: 'flex', flexDirection: 'column',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-lg)',
  },
  header:     { marginBottom: '32px' },
  headerIcon: { fontSize: '32px', display: 'block', marginBottom: '12px' },
  title:      { fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: '700', color: 'var(--navy)', marginBottom: '6px' },
  sub:        { fontSize: '14px', color: 'var(--slate)' },
  form:       { display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '24px' },
  field:      { display: 'flex', flexDirection: 'column', gap: '6px' },
  label:      { fontSize: '12px', fontWeight: '600', color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: {
    width: '100%', padding: '12px 14px',
    border: '1.5px solid var(--offwhite-3)',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px', color: 'var(--navy)',
    background: 'var(--offwhite)',
    outline: 'none', transition: 'var(--transition)',
  },
  passWrap:   { position: 'relative' },
  eyeBtn:     { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' },
  btn: {
    padding: '13px', background: 'var(--navy)',
    color: '#fff', border: 'none',
    borderRadius: 'var(--radius-md)', fontSize: '15px',
    fontWeight: '700', cursor: 'pointer',
    transition: 'var(--transition)', letterSpacing: '0.3px',
    marginTop: '4px',
  },
  btnLoading:   { opacity: 0.7 },
  divider:      { display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' },
  dividerLine:  { flex: 1, height: '1px', background: 'var(--offwhite-3)' },
  dividerText:  { fontSize: '12px', color: 'var(--slate-light)', whiteSpace: 'nowrap' },
  registerLink: {
    display: 'block', textAlign: 'center',
    padding: '12px', border: '1.5px solid var(--offwhite-3)',
    borderRadius: 'var(--radius-md)', fontSize: '14px',
    fontWeight: '600', color: 'var(--navy)',
    transition: 'var(--transition)',
  },
  side: {
    flex: 1, background: 'var(--navy)',
    display: 'flex', flexDirection: 'column',
    justifyContent: 'center', padding: '60px',
  },
  sideTitle:     { fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: '700', color: '#fff', lineHeight: '1.3', marginBottom: '16px' },
  sideSub:       { fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.7', marginBottom: '48px', maxWidth: '320px' },
  sideStats:     { display: 'flex', gap: '32px' },
  sideStat:      { borderLeft: '3px solid var(--coral)', paddingLeft: '16px' },
  sideStatValue: { fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: '700', color: 'var(--coral)', lineHeight: 1 },
  sideStatLabel: { fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.8px' },
};

export default Login;