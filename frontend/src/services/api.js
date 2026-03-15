import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('oamsUser'));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('oamsUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ───────────────────────────────────────────
export const registerUser = (data)  => api.post('/auth/register', data);
export const loginUser    = (data)  => api.post('/auth/login', data);
export const getProfile   = ()      => api.get('/auth/profile');

// ─── Admin auction management ─────────────────────────
export const getAllAuctionsAdmin  = (params) => api.get('/auctions/admin/all', { params });
export const getPendingListings   = ()       => api.get('/auctions/admin/pending');
export const approveListing       = (id)     => api.patch(`/auctions/${id}/approve`);
export const rejectListing        = (id, reason) => api.patch(`/auctions/${id}/reject-listing`, { reason });

// ─── Auctions ────────────────────────────────────────
export const getAuctions       = (params) => api.get('/auctions', { params });
export const getAuctionById    = (id)     => api.get(`/auctions/${id}`);
export const createAuction     = (data)   => api.post('/auctions', data);
export const updateAuction     = (id, data) => api.put(`/auctions/${id}`, data);
export const deleteAuction     = (id)     => api.delete(`/auctions/${id}`);
export const updateAuctionStatus = (id, status) =>
  api.patch(`/auctions/${id}/status`, { status });

// ─── Bids ─────────────────────────────────────────────
export const placeBid         = (data)      => api.post('/bids', data);
export const getMyBids        = ()          => api.get('/bids/my');
export const getBidsByAuction = (auctionId) => api.get(`/bids/auction/${auctionId}`);
export const getAllBids        = ()          => api.get('/bids');
export const rejectBid        = (id)        => api.patch(`/bids/${id}/reject`);

// ─── Reports ──────────────────────────────────────────
export const getSummary        = () => api.get('/reports/summary');
export const getByCategory     = () => api.get('/reports/by-category');
export const getTopBidders     = () => api.get('/reports/top-bidders');
export const getRecentActivity = () => api.get('/reports/recent-activity');
export const getMonthlyStats   = () => api.get('/reports/monthly');

export default api;