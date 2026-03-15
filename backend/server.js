const express   = require('express');
const dotenv    = require('dotenv');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');
const http      = require('http');
const { Server } = require('socket.io');

const connectDB     = require('./config/db');
const authRoutes    = require('./routes/authRoutes');
const auctionRoutes = require('./routes/auctionRoutes');
const bidRoutes     = require('./routes/bidRoutes');
const reportRoutes  = require('./routes/reportRoutes');
const sellerRoutes  = require('./routes/sellerRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

// ─────────────────────────────────────────
// ENVIRONMENT CHECK
// ─────────────────────────────────────────
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'NODE_ENV'];
const missingVars     = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.error(`Missing env vars: ${missingVars.join(', ')}`);
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET must be at least 32 characters');
  process.exit(1);
}

console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  OAMS Server Starting
  ENV  : ${process.env.NODE_ENV}
  PORT : ${process.env.PORT || 5000}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

connectDB();

const app    = express();
const server = http.createServer(app);

// ─────────────────────────────────────────
// SOCKET.IO — real-time bid updates
// ─────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    methods: ['GET', 'POST'],
  },
});

// Attach io to app so controllers can access it
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`[WS] Client connected: ${socket.id}`);

  // Buyer joins a specific auction room
  socket.on('join_auction', (auctionId) => {
    socket.join(auctionId);
    console.log(`[WS] ${socket.id} joined auction room: ${auctionId}`);
  });

  // Buyer leaves auction room
  socket.on('leave_auction', (auctionId) => {
    socket.leave(auctionId);
    console.log(`[WS] ${socket.id} left auction room: ${auctionId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[WS] Client disconnected: ${socket.id}`);
  });
});

// ─────────────────────────────────────────
// 1. CORS
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
// 2. HELMET
// ─────────────────────────────────────────
app.use(helmet());

// ─────────────────────────────────────────
// 3. BODY PARSER
// ─────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─────────────────────────────────────────
// 4. MANUAL NOSQL SANITIZER
// ─────────────────────────────────────────
const sanitizeNoSQL = (obj) => {
  if (!obj || typeof obj !== 'object') return;
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeNoSQL(obj[key]);
    }
  }
};

app.use((req, res, next) => {
  if (req.body)   sanitizeNoSQL(req.body);
  if (req.params) sanitizeNoSQL(req.params);
  next();
});

// ─────────────────────────────────────────
// 5. MANUAL XSS SANITIZER
// ─────────────────────────────────────────
const sanitizeXSS = (value) => {
  if (typeof value === 'string') {
    return value
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;')
      .replace(/'/g,  '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const cleaned = {};
    for (const key of Object.keys(value)) {
      cleaned[key] = sanitizeXSS(value[key]);
    }
    return cleaned;
  }
  return value;
};

app.use((req, res, next) => {
  if (req.body) req.body = sanitizeXSS(req.body);
  next();
});

// ─────────────────────────────────────────
// 6. MANUAL HPP
// ─────────────────────────────────────────
const HPP_WHITELIST = ['status', 'category'];

app.use((req, res, next) => {
  const cleaned = {};
  for (const [key, value] of Object.entries(req.query)) {
    if (Array.isArray(value) && !HPP_WHITELIST.includes(key)) {
      cleaned[key] = value[value.length - 1];
    } else {
      cleaned[key] = value;
    }
  }
  req.cleanQuery = cleaned;
  next();
});

// ─────────────────────────────────────────
// 7. GLOBAL RATE LIMIT
// ─────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders:   false,
});
app.use('/api', globalLimiter);

// ─────────────────────────────────────────
// 8. AUTH RATE LIMIT
// ─────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders:   false,
});
app.use('/api/auth/login',    authLimiter);
app.use('/api/auth/register', authLimiter);

// ─────────────────────────────────────────
// 9. BID RATE LIMIT
// ─────────────────────────────────────────
const bidLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  message: { message: 'Too many bids placed, please slow down' },
});
app.use('/api/bids', bidLimiter);

// ─────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/bids',     bidRoutes);
app.use('/api/reports',  reportRoutes);
app.use('/api/seller', sellerRoutes);

app.get('/', (req, res) => res.json({
  message: 'OAMS API is running',
  version: '1.0.0',
  status:  'healthy',
  env:      process.env.NODE_ENV,
}));

// ─────────────────────────────────────────
// ERROR HANDLERS
// ─────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─────────────────────────────────────────
// START SERVER — use server not app
// ─────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running on port ${PORT} with WebSocket support`)
);