import { useState, useEffect } from 'react';
import { getSummary, getByCategory, getTopBidders, getMonthlyStats } from '../../services/api';
import { toast } from 'react-toastify';

const Reports = () => {
  const [summary,    setSummary]    = useState(null);
  const [categories, setCategories] = useState([]);
  const [topBidders, setTopBidders] = useState([]);
  const [monthly,    setMonthly]    = useState([]);

  useEffect(() => {
    Promise.all([getSummary(), getByCategory(), getTopBidders(), getMonthlyStats()])
      .then(([{ data: s }, { data: c }, { data: t }, { data: m }]) => {
        setSummary(s); setCategories(c); setTopBidders(t); setMonthly(m);
      })
      .catch(() => toast.error('Failed to load reports'));
  }, []);

  if (!summary) return <div style={styles.center}>Loading reports...</div>;

  const maxCategoryRev = Math.max(...categories.map(c => c.totalRevenue), 1);
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.pageTitle}>Reports & Analytics</h1>

        {/* KPI Row */}
        <div style={styles.kpiGrid}>
          {[
            { label: 'Total Revenue',   value: `$${summary.totalRevenue.toLocaleString()}` },
            { label: 'Total Auctions',  value: summary.totalAuctions },
            { label: 'Total Bids',      value: summary.totalBids },
            { label: 'Average Bid',     value: `$${summary.averageBid.toLocaleString()}` },
            { label: 'Highest Bid',     value: `$${summary.highestBid.toLocaleString()}` },
            { label: 'Total Buyers',    value: summary.totalBuyers },
          ].map(k => (
            <div key={k.label} style={styles.kpiCard}>
              <p style={styles.kpiLabel}>{k.label}</p>
              <p style={styles.kpiValue}>{k.value}</p>
            </div>
          ))}
        </div>

        <div style={styles.twoCol}>
          {/* Revenue by Category */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Revenue by Category</h2>
            {categories.length === 0 ? <p style={styles.empty}>No data</p> :
              categories.map(c => (
                <div key={c._id} style={styles.barRow}>
                  <p style={styles.barLabel}>{c._id}</p>
                  <div style={styles.barTrack}>
                    <div style={{ ...styles.barFill, width: `${(c.totalRevenue / maxCategoryRev) * 100}%` }} />
                  </div>
                  <p style={styles.barVal}>${c.totalRevenue.toLocaleString()}</p>
                  <p style={styles.barCount}>{c.count} item{c.count !== 1 ? 's' : ''}</p>
                </div>
              ))
            }
          </div>

          {/* Monthly Stats */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Monthly Auctions</h2>
            {monthly.length === 0 ? <p style={styles.empty}>No data</p> :
              monthly.map(m => (
                <div key={`${m._id.year}-${m._id.month}`} style={styles.monthRow}>
                  <p style={styles.monthLabel}>{MONTHS[m._id.month - 1]} {m._id.year}</p>
                  <div style={styles.monthStats}>
                    <span style={styles.monthStat}>{m.totalAuctions} auctions</span>
                    <span style={styles.monthStat}>{m.totalBids} bids</span>
                    <span style={{ ...styles.monthStat, color: '#c9973a', fontWeight: '700' }}>
                      ${m.totalRevenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        {/* Top Bidders */}
        <div style={{ ...styles.card, marginTop: '20px' }}>
          <h2 style={styles.cardTitle}>Top 10 Bidders</h2>
          {topBidders.length === 0 ? <p style={styles.empty}>No bidders yet</p> : (
            <table style={styles.table}>
              <thead>
                <tr>
                  {['#', 'Name', 'Email', 'Total Bids', 'Highest Bid', 'Total Spent'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topBidders.map((b, i) => (
                  <tr key={b._id} style={styles.tr}>
                    <td style={styles.td}>
                      <span style={{ ...styles.rank, ...(i < 3 ? styles.topRank : {}) }}>
                        {i + 1}
                      </span>
                    </td>
                    <td style={styles.td}><strong>{b.name}</strong></td>
                    <td style={styles.td}>{b.email}</td>
                    <td style={styles.td}>{b.totalBids}</td>
                    <td style={styles.td}>${b.highestBid.toLocaleString()}</td>
                    <td style={styles.td}><strong style={{ color: '#c9973a' }}>${b.totalSpent.toLocaleString()}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  page:       { minHeight: '100vh', background: '#f5f5f5', padding: '32px 24px' },
  container:  { maxWidth: '1200px', margin: '0 auto' },
  pageTitle:  { fontSize: '28px', fontWeight: '800', color: '#1a1a2e', marginBottom: '24px' },
  kpiGrid:    { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '24px' },
  kpiCard:    { background: '#fff', borderRadius: '10px', padding: '16px', border: '1px solid #e8e8e8', textAlign: 'center' },
  kpiLabel:   { fontSize: '10px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' },
  kpiValue:   { fontSize: '22px', fontWeight: '800', color: '#1a1a2e' },
  twoCol:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  card:       { background: '#fff', borderRadius: '12px', padding: '22px', border: '1px solid #e8e8e8' },
  cardTitle:  { fontSize: '16px', fontWeight: '700', color: '#1a1a2e', marginBottom: '16px' },
  barRow:     { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' },
  barLabel:   { fontSize: '12px', color: '#555', width: '80px', flexShrink: 0 },
  barTrack:   { flex: 1, height: '20px', background: '#f5f5f5', borderRadius: '4px', overflow: 'hidden' },
  barFill:    { height: '100%', background: '#c9973a', borderRadius: '4px', transition: 'width 0.6s' },
  barVal:     { fontSize: '12px', fontWeight: '700', color: '#333', width: '70px', flexShrink: 0 },
  barCount:   { fontSize: '11px', color: '#aaa', width: '50px', flexShrink: 0 },
  monthRow:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f5f5f5' },
  monthLabel: { fontSize: '13px', fontWeight: '600', color: '#333' },
  monthStats: { display: 'flex', gap: '12px' },
  monthStat:  { fontSize: '12px', color: '#888' },
  table:      { width: '100%', borderCollapse: 'collapse' },
  th:         { padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#999', textTransform: 'uppercase', borderBottom: '2px solid #f0f0f0', background: '#fafafa' },
  tr:         { borderBottom: '1px solid #f5f5f5' },
  td:         { padding: '11px 14px', fontSize: '13px', color: '#444' },
  rank:       { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: '#f5f5f5', fontSize: '12px', fontWeight: '700' },
  topRank:    { background: '#c9973a', color: '#fff' },
  empty:      { textAlign: 'center', color: '#aaa', padding: '20px', fontSize: '13px' },
  center:     { textAlign: 'center', padding: '80px', fontSize: '16px', color: '#aaa' },
};

export default Reports;