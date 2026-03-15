import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider }  from './context/AuthContext';
import ProtectedRoute    from './components/ProtectedRoute';

import Navbar            from './components/Navbar';

// ─── Public pages ─────────────────────────────────────
import Home              from './pages/Home';
import Login             from './pages/Login';
import Register          from './pages/Register';
import AuctionDetail     from './pages/AuctionDetail';

// ─── Buyer pages ──────────────────────────────────────
import Dashboard         from './pages/Dashboard';

// ─── Seller pages ─────────────────────────────────────
import SellerDashboard   from './pages/seller/SellerDashboard';
import MyListings        from './pages/seller/MyListings';
import CreateListing     from './pages/seller/CreateListing';
import ListingBids       from './pages/seller/ListingBids';

// ─── Admin pages ──────────────────────────────────────
import AdminDashboard    from './pages/admin/AdminDashboard';
import ManageAuctions    from './pages/admin/ManageAuctions';
import ManageBids        from './pages/admin/ManageBids';
import Reports           from './pages/admin/Reports';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>

          {/* ── Public ── */}
          <Route path="/"             element={<Home />} />
          <Route path="/login"        element={<Login />} />
          <Route path="/register"     element={<Register />} />
          <Route path="/auctions/:id" element={<AuctionDetail />} />

          {/* ── Buyer ── */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          {/* ── Seller ── */}
          <Route path="/seller" element={
            <ProtectedRoute sellerOnly>
              <SellerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/seller/listings" element={
            <ProtectedRoute sellerOnly>
              <MyListings />
            </ProtectedRoute>
          } />
          <Route path="/seller/listings/create" element={
            <ProtectedRoute sellerOnly>
              <CreateListing />
            </ProtectedRoute>
          } />
          <Route path="/seller/listings/:id/bids" element={
            <ProtectedRoute sellerOnly>
              <ListingBids />
            </ProtectedRoute>
          } />

          {/* ── Admin ── */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/auctions" element={
            <ProtectedRoute adminOnly>
              <ManageAuctions />
            </ProtectedRoute>
          } />
          <Route path="/admin/bids" element={
            <ProtectedRoute adminOnly>
              <ManageBids />
            </ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedRoute adminOnly>
              <Reports />
            </ProtectedRoute>
          } />

        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </Router>
    </AuthProvider>
  );
}

export default App;