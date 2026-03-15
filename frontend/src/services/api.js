import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// ─── Attach token to every request ───────────────────
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('oamsUser'));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// ─── Handle 401 globally ─────────────────────────────
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

// ─── Auth ─────────────────────────────────────────────
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser    = (data) => api.post('/auth/login', data);
export const getProfile   = ()     => api.get('/auth/profile');

// ─── Auctions — Public ────────────────────────────────
export const getAuctions         = (params)     => api.get('/auctions', { params });
export const getAuctionById      = (id)         => api.get(`/auctions/${id}`);

// ─── Auctions — Admin ─────────────────────────────────
export const createAuction       = (data)       => api.post('/auctions', data);
export const updateAuction       = (id, data)   => api.put(`/auctions/${id}`, data);
export const deleteAuction       = (id)         => api.delete(`/auctions/${id}`);
export const updateAuctionStatus = (id, status) => api.patch(`/auctions/${id}/status`, { status });
export const getAllAuctionsAdmin  = (params)     => api.get('/auctions/admin/all', { params });
export const getPendingListings  = ()            => api.get('/auctions/admin/pending');
export const approveListing      = (id)          => api.patch(`/auctions/${id}/approve`);
export const rejectListing       = (id, reason)  => api.patch(`/auctions/${id}/reject-listing`, { reason });

// ─── Bids ─────────────────────────────────────────────
export const placeBid         = (data)      => api.post('/bids', data);
export const getMyBids        = ()          => api.get('/bids/my');
export const getBidsByAuction = (auctionId) => api.get(`/bids/auction/${auctionId}`);
export const getAllBids        = ()          => api.get('/bids');
export const rejectBid        = (id)        => api.patch(`/bids/${id}/reject`);

// ─── Seller ───────────────────────────────────────────
export const getSellerDashboard  = ()           => api.get('/seller/dashboard');
export const getMyListings       = ()           => api.get('/seller/listings');
export const createListing       = (data)       => api.post('/seller/listings', data);
export const updateListing       = (id, data)   => api.put(`/seller/listings/${id}`, data);
export const deleteListing       = (id)         => api.delete(`/seller/listings/${id}`);
export const getListingBids      = (id)         => api.get(`/seller/listings/${id}/bids`);
export const updateSellerProfile = (data)       => api.put('/seller/profile', data);

// ─── Reports ──────────────────────────────────────────
export const getSummary        = () => api.get('/reports/summary');
export const getByCategory     = () => api.get('/reports/by-category');
export const getTopBidders     = () => api.get('/reports/top-bidders');
export const getTopSellers     = () => api.get('/reports/top-sellers');
export const getRecentActivity = () => api.get('/reports/recent-activity');
export const getMonthlyStats   = () => api.get('/reports/monthly');
export const getApprovalStats  = () => api.get('/reports/approval-stats');

export default api;