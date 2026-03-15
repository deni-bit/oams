import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  {
    value: 'buyer',
    label: 'Buyer',
    icon:  '🛒',
    desc:  'Browse auctions and place bids on items',
  },
  {
    value: 'seller',
    label: 'Seller',
    icon:  '🏷️',
    desc:  'List your items for auction and track bids',
  },
];

const Register = () => {
  const [form,     setForm]     = useState({ name: '', email: '', password: '', role: 'buyer' });
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { register }            = useAuth();
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      setLoading(true);
      const user = await register(form.name, form.email, form.password, form.role);
      toast.success(`Account created! Welcome, ${user.name}`);
      navigate(user.role === 'seller' ? '/seller' : '/');
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
        <p style={styles.sub}>Join OAMS — choose how you want to participate</p>

        <form onSubmit={handleSubmit}>

          {/* Role selector */}
          <div style={styles.roleRow}>
            {ROLES.map(r => (
              <div
                key={r.value}
                onClick={() => setForm({ ...form, role: r.value })}
                style={{
                  ...styles.roleCard,
                  ...(form.role === r.value ? styles.roleCardActive : {}),
                }}
              >
                <span style={styles.roleIcon}>{r.icon}</span>
                <p style={styles.roleLabel}>{r.label}</p>
                <p style={styles.roleDesc}>{r.desc}</p>
                {form.role === r.value && (
                  <span style={styles.roleCheck}>✓</span>
                )}
              </div>
            ))}
          </div>

          {/* Seller notice */}
          {form.role === 'seller' && (
            <div style={styles.sellerNotice}>
              ℹ️ As a seller, your listings require admin approval before going live.
            </div>
          )}

          <label style={styles.label}>Full Name</label>
          <input
            style={styles.input}
            type="text"
            placeholder="John Doe"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <label style={styles.label}>Email Address</label>
          <input
            style={styles.input}
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <label style={styles.label}>Password</label>
          <div style={styles.passWrap}>
            <input
              style={styles.passInput}
              type={showPass ? 'text' : 'password'}
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <button
              type="button"
              style={styles.eyeBtn}
              onClick={() => setShowPass(!showPass)}
              tabIndex={-1}
            >
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>

          {/* Password strength bar */}
          {form.password.length > 0 && (
            <div style={styles.strengthWrap}>
              <div style={styles.strengthBars}>
                {[1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    style={{
                      ...styles.strengthBar,
                      background:
                        form.password.length >= i * 3
                          ? i <= 1 ? '#e74c3c'
                          : i <= 2 ? '#f39c12'
                          : i <= 3 ? '#3498db'
                          : '#2ecc71'
                          : '#e8e8e8',
                    }}
                  />
                ))}
              </div>
              <span style={styles.strengthText}>
                {form.password.length < 4  ? 'Too short'
                 : form.password.length < 7  ? 'Weak'
                 : form.password.length < 10 ? 'Good'
                 : 'Strong'}
              </span>
            </div>
          )}

          <button
            type="submit"
            style={{
              ...styles.btn,
              background: form.role === 'seller' ? '#c9973a' : '#1a1a2e',
              color:      form.role === 'seller' ? '#fff'    : '#e2b96f',
            }}
            disabled={loading}
          >
            {loading
              ? 'Creating account...'
              : `Create ${form.role === 'seller' ? 'Seller' : 'Buyer'} Account`}
          </button>

        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.footerLink}>Sign in</Link>
        </p>

      </div>
    </div>
  );
};

const styles = {
  page:      { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', padding: '24px' },
  card:      { background: '#fff', borderRadius: '16px', padding: '40px', width: '440px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
  title:     { fontSize: '26px', fontWeight: '700', color: '#1a1a2e', marginBottom: '6px' },
  sub:       { fontSize: '14px', color: '#888', marginBottom: '24px' },

  // Role selector
  roleRow:        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' },
  roleCard:       { border: '2px solid #e8e8e8', borderRadius: '10px', padding: '14px 12px', cursor: 'pointer', position: 'relative', transition: 'all 0.2s', textAlign: 'center' },
  roleCardActive: { border: '2px solid #1a1a2e', background: '#f8f7f4' },
  roleIcon:       { fontSize: '24px', display: 'block', marginBottom: '6px' },
  roleLabel:      { fontSize: '14px', fontWeight: '700', color: '#1a1a2e', marginBottom: '4px' },
  roleDesc:       { fontSize: '11px', color: '#888', lineHeight: '1.4' },
  roleCheck:      { position: 'absolute', top: '8px', right: '10px', fontSize: '12px', fontWeight: '800', color: '#1a1a2e' },

  // Seller notice
  sellerNotice: { background: '#fff8e1', border: '1px solid #ffe082', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#996600', marginBottom: '16px' },

  // Form fields
  label:     { display: 'block', fontSize: '12px', fontWeight: '600', color: '#555', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input:     { width: '100%', padding: '11px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', marginBottom: '14px', outline: 'none', boxSizing: 'border-box' },

  // Password field
  passWrap:  { position: 'relative', marginBottom: '6px' },
  passInput: { width: '100%', padding: '11px 44px 11px 14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  eyeBtn:    { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '0', lineHeight: 1, color: '#888' },

  // Strength bar
  strengthWrap:  { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' },
  strengthBars:  { display: 'flex', gap: '4px', flex: 1 },
  strengthBar:   { flex: 1, height: '4px', borderRadius: '4px', transition: 'background 0.3s' },
  strengthText:  { fontSize: '11px', color: '#888', whiteSpace: 'nowrap', minWidth: '55px' },

  // Submit
  btn:       { width: '100%', padding: '13px', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginTop: '4px', transition: 'all 0.2s' },
  footer:    { textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#888' },
  footerLink:{ color: '#c9973a', fontWeight: '600', textDecoration: 'none' },
};

export default Register;