import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute   from './components/ProtectedRoute';

import Navbar          from './components/Navbar';
import Home            from './pages/Home';
import Login           from './pages/Login';
import Register        from './pages/Register';
import AuctionDetail   from './pages/AuctionDetail';
import Dashboard       from './pages/Dashboard';

import AdminDashboard  from './pages/admin/AdminDashboard';
import ManageAuctions  from './pages/admin/ManageAuctions';
import ManageBids      from './pages/admin/ManageBids';
import Reports         from './pages/admin/Reports';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/"            element={<Home />} />
          <Route path="/login"       element={<Login />} />
          <Route path="/register"    element={<Register />} />
          <Route path="/auctions/:id" element={<AuctionDetail />} />

          {/* Buyer */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          {/* Admin */}
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