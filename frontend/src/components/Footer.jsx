const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.inner}>

        <div style={styles.left}>
          <span style={styles.logo}>🔨 OAMS</span>
          <span style={styles.divider}>·</span>
          <span style={styles.tagline}>Online Auction Management System</span>
        </div>

        <div style={styles.credit}>
          <span style={styles.builtBy}>Designed & Built by</span>
          <span style={styles.name}>Denis Steven Daudi</span>
        </div>

      </div>
    </footer>
  );
};

const styles = {
  footer: {
    background: '#1a1a2e',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    padding: '18px 32px',
    marginTop: 'auto',
  },
  inner: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '10px',
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logo: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#e2b96f',
    letterSpacing: '1px',
  },
  divider: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: '16px',
  },
  tagline: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: '0.3px',
  },
  credit: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  builtBy: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  name: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#e2b96f',
    fontFamily: "'Georgia', 'Times New Roman', serif",
    letterSpacing: '1.5px',
    fontStyle: 'italic',
  },
};

export default Footer;