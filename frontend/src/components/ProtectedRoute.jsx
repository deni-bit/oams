import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false, sellerOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;
  if (!user)   return <Navigate to="/login" replace />;

  if (adminOnly  && user.role !== 'admin')  return <Navigate to="/" replace />;
  if (sellerOnly && user.role !== 'seller') return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;