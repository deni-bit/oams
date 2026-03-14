import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm]       = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
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
      const user = await register(form.name, form.email, form.password, 'buyer');
      toast.success(`Welcome aboard, ${user.name}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>

      {/* Side */}
      <div style={styles.side}>
        <span style={styles.sideIcon}>⚖</span>
        <h2 style={styles.sideTitle}>Start Bidding Today</h2>
        <p style={styles.sideSub}>Create your free buyer account and access exclusive auctions across watches, art, jewelry, vehicles and more.</p>
        <div style={styles.features}>
          {[
            { icon: '🔒', text: 'Secure JWT authentication'       },
            { icon: '⚡', text: 'Real-time bid updates'           },
            { icon: '📊', text: 'Full bid history & tracking'     },
            { icon: '🏆', text: 'Win rare & unique items'         },
          ].map(f => (
            <div key={f.text} style={styles.featureItem}>
              <span style={styles.featureIcon}>{f.icon}</span>
              <span style={styles.featureText}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.sub}>Join OAMS as a buyer — free forever</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Full Name</label>
            <input
              style={styles.input}
              type="text"
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

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
                placeholder="Min. 6 characters"
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
            {/* Password strength indicator */}
            {form.password.length > 0 && (
              <div style={styles.strengthRow}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{
                    ...styles.strengthBar,
                    background: form.password.length >= i * 3
                      ? i <= 1 ? 'var(--danger)'
                      : i <= 2 ? 'var(--warning)'
                      : i <= 3 ? 'var(--info)'
                      : 'var(--success)'
                      : 'var(--offwhite-3)',
                  }} />
                ))}
                <span style={styles.strengthText}>
                  {form.password.length < 4  ? 'Too short'
                   : form.password.length < 7  ? 'Weak'
                   : form.password.length < 10 ? 'Good'
                   : 'Strong'}
                </span>
              </div>
            )}
          </div>

          <div style={styles.terms}>
            <span style={styles.termsText}>
              By registering you agree to our{' '}
              <span style={styles.termsLink}>Terms of Service</span>
              {' '}and{' '}
              <span style={styles.termsLink}>Privacy Policy</span>
            </span>
          </div>

          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>Already have an account?</span>
          <span style={styles.dividerLine} />
        </div>

        <Link to="/login" style={styles.loginLink}>
          Sign in instead
        </Link>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh', display: 'flex',
    background: 'var(--offwhite)',
  },
  side: {
    flex: 1, background: 'var(--navy)',
    padding: '60px', display: 'flex',
    flexDirection: 'column', justifyContent: 'center',
  },
  sideIcon:  { fontSize: '36px', marginBottom: '20px', display: 'block' },
  sideTitle: { fontFamily: 'var(--font-serif)', fontSize: '34px', fontWeight: '700', color: '#fff', marginBottom: '14px', lineHeight: '1.3' },
  sideSub:   { fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.7', marginBottom: '40px', maxWidth: '320px' },
  features:  { display: 'flex', flexDirection: 'column', gap: '16px' },
  featureItem: { display: 'flex', alignItems: 'center', gap: '12px' },
  featureIcon: { fontSize: '18px', width: '36px', height: '36px', background: 'rgba(255,255,255,0.08)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  featureText: { fontSize: '14px', color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
  card: {
    width: '480px', flexShrink: 0,
    background: 'var(--white)', padding: '48px 44px',
    display: 'flex', flexDirection: 'column',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-lg)',
  },
  header:     { marginBottom: '28px' },
  title:      { fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: '700', color: 'var(--navy)', marginBottom: '6px' },
  sub:        { fontSize: '14px', color: 'var(--slate)' },
  form:       { display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' },
  field:      { display: 'flex', flexDirection: 'column', gap: '6px' },
  label:      { fontSize: '12px', fontWeight: '600', color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: {
    width: '100%', padding: '12px 14px',
    border: '1.5px solid var(--offwhite-3)',
    borderRadius: 'var(--radius-md)', fontSize: '14px',
    color: 'var(--navy)', background: 'var(--offwhite)',
    outline: 'none', transition: 'var(--transition)',
  },
  passWrap:      { position: 'relative' },
  eyeBtn:        { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' },
  strengthRow:   { display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' },
  strengthBar:   { flex: 1, height: '3px', borderRadius: '4px', transition: 'background 0.3s' },
  strengthText:  { fontSize: '11px', color: 'var(--slate-light)', marginLeft: '6px', whiteSpace: 'nowrap' },
  terms:         { background: 'var(--offwhite)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' },
  termsText:     { fontSize: '12px', color: 'var(--slate)' },
  termsLink:     { color: 'var(--navy)', fontWeight: '600', cursor: 'pointer' },
  btn: {
    padding: '13px', background: 'var(--coral)',
    color: '#fff', border: 'none',
    borderRadius: 'var(--radius-md)', fontSize: '15px',
    fontWeight: '700', cursor: 'pointer',
    transition: 'var(--transition)', letterSpacing: '0.3px',
    boxShadow: '0 4px 14px rgba(255,107,107,0.35)',
  },
  divider:      { display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' },
  dividerLine:  { flex: 1, height: '1px', background: 'var(--offwhite-3)' },
  dividerText:  { fontSize: '12px', color: 'var(--slate-light)', whiteSpace: 'nowrap' },
  loginLink: {
    display: 'block', textAlign: 'center',
    padding: '12px', border: '1.5px solid var(--offwhite-3)',
    borderRadius: 'var(--radius-md)', fontSize: '14px',
    fontWeight: '600', color: 'var(--navy)',
    transition: 'var(--transition)',
  },
};

export default Register;