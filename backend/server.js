const express        = require('express');
const dotenv         = require('dotenv');
const cors           = require('cors');
const helmet         = require('helmet');
const mongoSanitize  = require('express-mongo-sanitize');
const xss            = require('xss-clean');
const hpp            = require('hpp');
const rateLimit      = require('express-rate-limit');

const connectDB      = require('./config/db');
const authRoutes     = require('./routes/authRoutes');
const auctionRoutes  = require('./routes/auctionRoutes');
const bidRoutes      = require('./routes/bidRoutes');
const reportRoutes   = require('./routes/reportRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();
connectDB();

const app = express();

// ─────────────────────────────────────────
// 1. CORS — only allow your frontend origin
// ─────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
}));

// ─────────────────────────────────────────
// 2. HELMET — secure HTTP headers
// ─────────────────────────────────────────
app.use(helmet());

// ─────────────────────────────────────────
// 3. BODY PARSER — limit payload size
// ─────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─────────────────────────────────────────
// 4. MONGO SANITIZE — prevent NoSQL injection
//    Strips $ and . from req.body, req.params, req.query
// ─────────────────────────────────────────
app.use(mongoSanitize());

// ─────────────────────────────────────────
// 5. XSS CLEAN — sanitize HTML in input
//    Converts <script> tags to harmless text
// ─────────────────────────────────────────
app.use(xss());

// ─────────────────────────────────────────
// 6. HPP — prevent HTTP parameter pollution
//    e.g. ?status=live&status=ended
// ─────────────────────────────────────────
app.use(hpp({
  whitelist: ['status', 'category'], // allow these to have multiple values
}));

// ─────────────────────────────────────────
// 7. GLOBAL RATE LIMIT — all routes
//    Max 100 requests per 15 minutes per IP
// ─────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

// ─────────────────────────────────────────
// 8. AUTH RATE LIMIT — login/register only
//    Max 10 attempts per 15 minutes per IP
// ─────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    message: 'Too many login attempts, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login',    authLimiter);
app.use('/api/auth/register', authLimiter);

// ─────────────────────────────────────────
// 9. BID RATE LIMIT — prevent bid spamming
//    Max 20 bids per 5 minutes per IP
// ─────────────────────────────────────────
const bidLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  message: {
    message: 'Too many bids placed, please slow down',
  },
});
app.use('/api/bids', bidLimiter);

// ─────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/bids',     bidRoutes);
app.use('/api/reports',  reportRoutes);

// Health check
app.get('/', (req, res) => res.json({
  message: 'OAMS API is running',
  version: '1.0.0',
  status:  'healthy',
}));

// ─────────────────────────────────────────
// ERROR HANDLERS
// ─────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));