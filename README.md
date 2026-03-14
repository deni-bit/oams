# 🔨 OAMS — Online Auction Management System

A full-stack **MERN** application for managing online auctions. Sellers (admins) can list items, buyers can place bids, and administrators can manage the entire auction lifecycle with reporting.

---

## 🚀 Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18 + Vite                   |
| Backend   | Node.js + Express 5               |
| Database  | MongoDB Atlas + Mongoose 9        |
| Auth      | JWT (JSON Web Tokens) + bcryptjs  |
| Styling   | Inline React styles               |
| HTTP      | Axios with auto token injection   |

---

## 📁 Project Structure
```
oams/
├── backend/
│   ├── config/          # MongoDB connection
│   ├── controllers/     # auth, auction, bid, report logic
│   ├── middleware/       # JWT auth, error handler
│   ├── models/          # User, Auction, Bid schemas
│   ├── routes/          # API route definitions
│   ├── utils/           # Token generator, seed scripts
│   ├── .env             # Environment variables (not committed)
│   └── server.js        # Express entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Navbar, AuctionCard, BidModal, ProtectedRoute
│   │   ├── context/     # AuthContext (JWT state)
│   │   ├── pages/       # Home, Login, Register, AuctionDetail, Dashboard
│   │   │   └── admin/   # AdminDashboard, ManageAuctions, ManageBids, Reports
│   │   ├── services/    # Axios API calls
│   │   └── App.jsx      # Routes setup
│   └── .env             # Vite environment variables
│
└── README.md
```

---

## ⚙️ Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/oams.git
cd oams
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
```

Create a `.env` file inside `frontend/`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Seed the Database
```bash
cd ../backend
node utils/seedData.js
```

### 5. Run the App

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Open **http://localhost:5173**

---

## 🔐 Test Credentials

After running the seed script, these accounts are ready to use:

### 👑 Admin Account

| Field    | Value             |
|----------|-------------------|
| Email    | admin@oams.com    |
| Password | Admin@1234        |
| Role     | Admin             |
| Access   | Full system access — manage auctions, bids, reports |

### 👤 Buyer Accounts

| Name          | Email             | Password |
|---------------|-------------------|----------|
| James Okonkwo | james@test.com    | 123456   |
| Amina Hassan  | amina@test.com    | 123456   |
| Denis Mwangi  | denis@test.com    | 123456   |
| Sofia Reyes   | sofia@test.com    | 123456   |
| Luca Bianchi  | luca@test.com     | 123456   |
| Yuki Tanaka   | yuki@test.com     | 123456   |

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint              | Access  | Description        |
|--------|-----------------------|---------|--------------------|
| POST   | /api/auth/register    | Public  | Register as buyer  |
| POST   | /api/auth/login       | Public  | Login              |
| GET    | /api/auth/profile     | Private | Get own profile    |

### Auctions
| Method | Endpoint                    | Access | Description          |
|--------|-----------------------------|--------|----------------------|
| GET    | /api/auctions               | Public | Get all auctions     |
| GET    | /api/auctions/:id           | Public | Get single auction   |
| POST   | /api/auctions               | Admin  | Create auction       |
| PUT    | /api/auctions/:id           | Admin  | Update auction       |
| DELETE | /api/auctions/:id           | Admin  | Delete auction       |
| PATCH  | /api/auctions/:id/status    | Admin  | Update status        |

### Bids
| Method | Endpoint                      | Access | Description          |
|--------|-------------------------------|--------|----------------------|
| POST   | /api/bids                     | Buyer  | Place a bid          |
| GET    | /api/bids                     | Admin  | Get all bids         |
| GET    | /api/bids/my                  | Buyer  | Get my bids          |
| GET    | /api/bids/auction/:auctionId  | Public | Get bids by auction  |
| PATCH  | /api/bids/:id/reject          | Admin  | Reject a bid         |

### Reports
| Method | Endpoint                      | Access | Description          |
|--------|-------------------------------|--------|----------------------|
| GET    | /api/reports/summary          | Admin  | Overall stats        |
| GET    | /api/reports/by-category      | Admin  | Revenue by category  |
| GET    | /api/reports/top-bidders      | Admin  | Top 10 bidders       |
| GET    | /api/reports/recent-activity  | Admin  | Latest bids          |
| GET    | /api/reports/monthly          | Admin  | Monthly breakdown    |

---

## 🧭 User Flow

### Buyer Flow
1. Register at `/register` → automatically assigned `buyer` role
2. Browse auctions on Home page — filter by category and status
3. Click any auction → view details, bid history, current leader
4. Place a bid (must be higher than current bid)
5. Track all bids at `/dashboard`

### Admin Flow
1. Login with admin credentials
2. `/admin` → overview dashboard with live stats
3. `/admin/auctions` → create, update status, delete auctions
4. `/admin/bids` → view all bids, reject suspicious bids
5. `/admin/reports` → revenue charts, top bidders, monthly stats

---

## 🔒 Security Notes

- Passwords are hashed using **bcryptjs** (salt rounds: 10)
- JWT tokens expire after **7 days**
- Admin accounts can **only** be created via `node utils/seedAdmin.js` — never through the public register form
- All admin routes are protected by `adminOnly` middleware
- Token is automatically attached to every request via Axios interceptor
- Invalid or expired tokens redirect to `/login` automatically

---

## 📦 Seed Data Summary

Running `node utils/seedData.js` creates:

| Type     | Count | Details                                      |
|----------|-------|----------------------------------------------|
| Users    | 7     | 1 admin + 6 buyers                           |
| Auctions | 22    | Watches, Art, Electronics, Jewelry, Vehicles, Other |
| Bids     | ~80   | Realistic bid history across live/ended auctions |
| Statuses | Mixed | Live, Upcoming, Ended across all categories  |

---

## 🛠️ Scripts
```bash
# Backend
npm run dev       # Start with nodemon (development)
npm start         # Start without nodemon (production)

node utils/seedData.js   # Seed full demo data (clears existing)
node utils/seedAdmin.js  # Create admin account only
```

---

## 📄 License

MIT — free to use for educational purposes.
