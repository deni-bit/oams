import { useState, useEffect } from 'react';
import { getAuctions } from '../services/api';
import AuctionCard from '../components/AuctionCard';
import { toast } from 'react-toastify';

const CATEGORIES = ['All', 'Watches', 'Art', 'Electronics', 'Jewelry', 'Vehicles', 'Other'];
const STATUSES   = ['All', 'live', 'upcoming', 'ended'];

const Home = () => {
  const [auctions,  setAuctions]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [category,  setCategory]  = useState('All');
  const [status,    setStatus]    = useState('All');
  const [search,    setSearch]    = useState('');

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

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAuctions();
  };

  return (
    <div style={styles.page}>
      {/* Hero */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Online Auction Management</h1>
        <p style={styles.heroSub}>Discover, bid, and win unique items from verified sellers</p>
        <form onSubmit={handleSearch} style={styles.searchRow}>
          <input style={styles.searchInput} placeholder="Search auctions..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
          <button type="submit" style={styles.searchBtn}>Search</button>
        </form>
      </div>

      <div style={styles.container}>
        {/* Filters */}
        <div style={styles.filterRow}>
          <div style={styles.filterGroup}>
            <span style={styles.filterLabel}>Category:</span>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                style={{ ...styles.filterBtn, ...(category === c ? styles.filterBtnActive : {}) }}>
                {c}
              </button>
            ))}
          </div>
          <div style={styles.filterGroup}>
            <span style={styles.filterLabel}>Status:</span>
            {STATUSES.map(s => (
              <button key={s} onClick={() => setStatus(s)}
                style={{ ...styles.filterBtn, ...(status === s ? styles.filterBtnActive : {}) }}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div style={styles.center}>Loading auctions...</div>
        ) : auctions.length === 0 ? (
          <div style={styles.center}>
            <p style={{ fontSize: '48px' }}>🏷️</p>
            <p>No auctions found</p>
          </div>
        ) : (
          <>
            <p style={styles.count}>{auctions.length} auction{auctions.length !== 1 ? 's' : ''} found</p>
            <div style={styles.grid}>
              {auctions.map(a => <AuctionCard key={a._id} auction={a} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  page:            { minHeight: '100vh', background: '#f5f5f5' },
  hero:            { background: '#1a1a2e', color: '#fff', padding: '60px 32px', textAlign: 'center' },
  heroTitle:       { fontSize: '38px', fontWeight: '800', color: '#e2b96f', marginBottom: '10px' },
  heroSub:         { fontSize: '16px', color: '#aaa', marginBottom: '28px' },
  searchRow:       { display: 'flex', gap: '10px', maxWidth: '500px', margin: '0 auto' },
  searchInput:     { flex: 1, padding: '12px 16px', borderRadius: '8px', border: 'none', fontSize: '14px', outline: 'none' },
  searchBtn:       { padding: '12px 24px', background: '#c9973a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  container:       { maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' },
  filterRow:       { display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', background: '#fff', padding: '16px', borderRadius: '10px', border: '1px solid #e8e8e8' },
  filterGroup:     { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' },
  filterLabel:     { fontSize: '12px', fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginRight: '4px' },
  filterBtn:       { padding: '5px 12px', border: '1px solid #e0e0e0', borderRadius: '20px', background: '#fff', cursor: 'pointer', fontSize: '12px', color: '#555' },
  filterBtnActive: { background: '#1a1a2e', color: '#e2b96f', border: '1px solid #1a1a2e' },
  count:           { fontSize: '13px', color: '#999', marginBottom: '16px' },
  grid:            { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  center:          { textAlign: 'center', padding: '60px', color: '#aaa', fontSize: '16px' },
};

export default Home;