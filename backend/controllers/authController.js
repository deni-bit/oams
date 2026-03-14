const asyncHandler  = require('express-async-handler');
const User          = require('../models/User');
const generateToken = require('../utils/generateToken');

// ─── Helpers ──────────────────────────────────────────
const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isStrongPassword = (password) =>
  password.length >= 6;

// ─── Register ─────────────────────────────────────────
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // All fields required
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please fill in all fields');
  }

  // Name length
  if (name.trim().length < 2) {
    res.status(400);
    throw new Error('Name must be at least 2 characters');
  }

  // Email format
  if (!isValidEmail(email)) {
    res.status(400);
    throw new Error('Please provide a valid email address');
  }

  // Password strength
  if (!isStrongPassword(password)) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  // Duplicate check
  const userExists = await User.findOne({ email: email.toLowerCase() });
  if (userExists) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  // Create — role ALWAYS buyer, never from client
  const user = await User.create({
    name:     name.trim(),
    email:    email.toLowerCase().trim(),
    password,
    role:     'buyer',
  });

  if (user) {
    res.status(201).json({
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
      token: generateToken(user._id, user.role),
    });
  } else {
    res.status(400);
    throw new Error('Failed to create account');
  }
});

// ─── Login ────────────────────────────────────────────
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  if (!isValidEmail(email)) {
    res.status(400);
    throw new Error('Invalid email format');
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  // Generic message — never reveal if email exists
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('Your account has been deactivated. Contact support.');
  }

  res.json({
    _id:   user._id,
    name:  user.name,
    email: user.email,
    role:  user.role,
    token: generateToken(user._id, user.role),
  });
});

// ─── Get Profile ──────────────────────────────────────
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json(user);
});

module.exports = { registerUser, loginUser, getUserProfile };