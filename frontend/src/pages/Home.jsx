import { useState, useEffect } from 'react';
import { getAuctions } from '../services/api';
import AuctionCard from '../components/AuctionCard';
import { toast } from 'react-toastify';

const CATEGORIES = ['All', 'Watches', 'Art', 'Electronics', 'Jewelry', 'Vehicles', 'Other'];
const STATUSES   = ['All', 'live', 'upcoming', 'ended'];

const Home = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [category, setCategory] = useState('All');
  const [status,   setStatus]   = useState('All');
  const [search,   setSearch]   = useState('');

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (category !== 'All') params.category = category;
      if (status   !== 'All') params.status   = status;
      if (search)              params.search   = search;
      const { data } = await getAuctions(params);
      setAuctions(data);
    } catch {
      toast.error('Failed to load auctions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAuctions(); }, [category, status]);

  const liveCount     = auctions.filter(a => a.status === 'live').length;
  const upcomingCount = auctions.filter(a => a.status === 'upcoming').length;

  return (
    <div style={styles.page}>

      {/* ── Hero ── */}
      <div style={styles.hero}>
        <div style={styles.heroInner}>
          <div style={styles.heroBadge}>🔴 {liveCount} Live Auctions Now</div>
          <h1 style={styles.heroTitle}>
            Discover & Bid on<br />
            <span style={styles.heroAccent}>Rare Unique Items</span>
          </h1>
          <p style={styles.heroSub}>
            The most trusted online auction platform for watches, art, jewelry, vehicles and more.
          </p>
          <form
            onSubmit={(e) => { e.preventDefault(); fetchAuctions(); }}
            style={styles.searchRow}
          >
            <div style={styles.searchWrap}>
              <span style={styles.searchIcon}>🔍</span>
              <input
                style={styles.searchInput}
                placeholder="Search auctions by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" style={styles.searchBtn}>Search</button>
          </form>

          {/* Quick stats */}
          <div style={styles.heroStats}>
            {[
              { value: '22+',         label: 'Total Auctions' },
              { value: liveCount,     label: 'Live Now'       },
              { value: upcomingCount, label: 'Upcoming'       },
              { value: '6',           label: 'Categories'     },
            ].map(s => (
              <div key={s.label} style={styles.heroStat}>
                <p style={styles.heroStatValue}>{s.value}</p>
                <p style={styles.heroStatLabel}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={styles.container}>

        {/* Filters */}
        <div style={styles.filterBar}>
          <div style={styles.filterGroup}>
            <span style={styles.filterGroupLabel}>Category</span>
            <div style={styles.filterBtns}>
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  style={{
                    ...styles.filterBtn,
                    ...(category === c ? styles.filterBtnActive : {}),
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.filterDivider} />

          <div style={styles.filterGroup}>
            <span style={styles.filterGroupLabel}>Status</span>
            <div style={styles.filterBtns}>
              {STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  style={{
                    ...styles.filterBtn,
                    ...(status === s ? styles.filterBtnActive : {}),
                  }}
                >
                  {s === 'All' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results header */}
        <div style={styles.resultsHeader}>
          <p style={styles.resultsCount}>
            {loading ? 'Loading...' : `${auctions.length} auction${auctions.length !== 1 ? 's' : ''} found`}
          </p>
          {(category !== 'All' || status !== 'All' || search) && (
            <button
              style={styles.clearBtn}
              onClick={() => { setCategory('All'); setStatus('All'); setSearch(''); }}
            >
              ✕ Clear filters
            </button>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={styles.loadingGrid}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={styles.skeleton} />
            ))}
          </div>
        ) : auctions.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ fontSize: '56px', marginBottom: '16px' }}>🔍</p>
            <h3 style={styles.emptyTitle}>No auctions found</h3>
            <p style={styles.emptySub}>Try adjusting your filters or search term</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {auctions.map(a => <AuctionCard key={a._id} auction={a} />)}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page:       { minHeight: '100vh', background: 'var(--offwhite)' },

  // ── Hero ──
  hero:       { background: 'var(--navy)', padding: '72px 24px 60px' },
  heroInner:  { maxWidth: '800px', margin: '0 auto', textAlign: 'center' },
  heroBadge:  {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    background: 'var(--coral-muted)', color: 'var(--coral)',
    padding: '6px 16px', borderRadius: '20px',
    fontSize: '12px', fontWeight: '700', marginBottom: '20px',
    border: '1px solid rgba(255,107,107,0.25)',
  },
  heroTitle:  {
    fontFamily: 'var(--font-serif)',
    fontSize: '52px', fontWeight: '800',
    color: '#fff', lineHeight: '1.15',
    marginBottom: '16px',
  },
  heroAccent: { color: 'var(--coral)' },
  heroSub:    { fontSize: '16px', color: 'rgba(255,255,255,0.6)', marginBottom: '32px', lineHeight: '1.7' },
  searchRow:  { display: 'flex', gap: '10px', maxWidth: '560px', margin: '0 auto 40px' },
  searchWrap: {
    flex: 1, display: 'flex', alignItems: 'center', gap: '10px',
    background: 'rgba(255,255,255,0.08)',
    border: '1.5px solid rgba(255,255,255,0.15)',
    borderRadius: 'var(--radius-md)', padding: '0 16px',
  },
  searchIcon:  { fontSize: '16px', opacity: 0.5 },
  searchInput: {
    flex: 1, background: 'transparent', border: 'none',
    color: '#fff', fontSize: '14px', padding: '13px 0',
    outline: 'none',
  },
  searchBtn: {
    padding: '13px 28px', background: 'var(--coral)',
    color: '#fff', border: 'none', borderRadius: 'var(--radius-md)',
    fontSize: '14px', fontWeight: '700', cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(255,107,107,0.4)',
    whiteSpace: 'nowrap',
  },
  heroStats:     { display: 'flex', justifyContent: 'center', gap: '40px' },
  heroStat:      { textAlign: 'center' },
  heroStatValue: { fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: '700', color: '#fff', lineHeight: 1 },
  heroStatLabel: { fontSize: '11px', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' },

  // ── Content ──
  container: { maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' },

  // ── Filter bar ──
  filterBar: {
    background: 'var(--white)', borderRadius: 'var(--radius-lg)',
    padding: '18px 22px', marginBottom: '24px',
    border: '1px solid var(--offwhite-3)',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap',
  },
  filterGroup:      { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  filterGroupLabel: { fontSize: '11px', fontWeight: '700', color: 'var(--slate-light)', textTransform: 'uppercase', letterSpacing: '1px', marginRight: '4px' },
  filterBtns:       { display: 'flex', gap: '5px', flexWrap: 'wrap' },
  filterBtn: {
    padding: '5px 14px', border: '1.5px solid var(--offwhite-3)',
    borderRadius: '20px', background: 'var(--white)',
    cursor: 'pointer', fontSize: '12px', fontWeight: '500',
    color: 'var(--slate)', transition: 'var(--transition)',
  },
  filterBtnActive: {
    background: 'var(--navy)', color: '#fff',
    border: '1.5px solid var(--navy)',
  },
  filterDivider: { width: '1px', height: '28px', background: 'var(--offwhite-3)', flexShrink: 0 },

  // ── Results ──
  resultsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  resultsCount:  { fontSize: '13px', color: 'var(--slate)' },
  clearBtn: {
    fontSize: '12px', color: 'var(--coral)', background: 'var(--coral-light)',
    border: '1px solid rgba(255,107,107,0.2)', padding: '5px 12px',
    borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: '600',
  },

  // ── Grid ──
  grid:        { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  loadingGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  skeleton: {
    height: '380px', borderRadius: 'var(--radius-lg)',
    background: 'linear-gradient(90deg, var(--offwhite-2) 25%, var(--offwhite-3) 50%, var(--offwhite-2) 75%)',
    backgroundSize: '200% 100%',
  },

  // ── Empty ──
  empty:      { textAlign: 'center', padding: '80px 20px' },
  emptyTitle: { fontFamily: 'var(--font-serif)', fontSize: '22px', color: 'var(--navy)', marginBottom: '8px' },
  emptySub:   { fontSize: '14px', color: 'var(--slate)' },
};

export default Home;