const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();

// =============================================================================
// CONFIGURATION
// =============================================================================

const JWT_SECRET = process.env.JWT_SECRET || 'orbit-dev-secret-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'orbit-refresh-secret-change-in-production';
const JWT_EXPIRES_IN = '15m'; // Access token expires in 15 minutes
const JWT_REFRESH_EXPIRES_IN = '7d'; // Refresh token expires in 7 days

// =============================================================================
// IN-MEMORY USER STORE (DEMO PURPOSES)
// In production, use a real database like PostgreSQL, MongoDB, etc.
// =============================================================================

const users = new Map();
const refreshTokens = new Set();

// Demo users
const demoUsers = [
  {
    id: 'user-1',
    email: 'demo@orbit.com',
    password: 'password', // Will be hashed
    firstName: 'Demo',
    lastName: 'User',
    role: 'admin',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    isEmailVerified: true,
    createdAt: new Date().toISOString(),
    preferences: {
      theme: 'system',
      notifications: true,
      language: 'en'
    }
  },
  {
    id: 'user-2',
    email: 'admin@orbit.com', 
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    isEmailVerified: true,
    createdAt: new Date().toISOString(),
    preferences: {
      theme: 'dark',
      notifications: true,
      language: 'en'
    }
  }
];

// Initialize demo users with hashed passwords
(async () => {
  for (const user of demoUsers) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    users.set(user.email, {
      ...user,
      password: hashedPassword
    });
  }
})();

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  );

  return {
    accessToken,
    refreshToken,
    expiresAt: Date.now() + (15 * 60 * 1000) // 15 minutes from now
  };
};

const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.type === 'access' ? decoded : null;
  } catch (error) {
    return null;
  }
};

const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    return decoded.type === 'refresh' ? decoded : null;
  } catch (error) {
    return null;
  }
};

const formatUserResponse = (user) => {
  const { password, ...userWithoutPassword } = user;
  return {
    ...userWithoutPassword,
    lastLoginAt: new Date().toISOString()
  };
};

// =============================================================================
// MIDDLEWARE
// =============================================================================

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return res.status(403).json({ message: 'Invalid or expired access token' });
  }

  // Find user
  const user = Array.from(users.values()).find(u => u.id === decoded.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  req.user = user;
  next();
};

// =============================================================================
// VALIDATION MIDDLEWARE
// =============================================================================

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  next();
};

const validateRegister = (req, res, next) => {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ 
      message: 'Email, password, first name, and last name are required' 
    });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({ 
      message: 'Password must be at least 6 characters long' 
    });
  }

  if (firstName.trim().length < 2 || lastName.trim().length < 2) {
    return res.status(400).json({ 
      message: 'First name and last name must be at least 2 characters long' 
    });
  }

  next();
};

// =============================================================================
// AUTHENTICATION ROUTES
// =============================================================================

// POST /api/auth/login
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    // Find user
    const user = users.get(email.toLowerCase());
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate tokens
    const tokens = generateTokens(user.id);
    refreshTokens.add(tokens.refreshToken);

    // Format response
    const userResponse = formatUserResponse(user);

    res.json({
      user: userResponse,
      tokens,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/auth/register
router.post('/register', validateRegister, async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    if (users.has(email.toLowerCase())) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role: 'user',
      avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 99)}.jpg`,
      isEmailVerified: false, // In production, send verification email
      createdAt: new Date().toISOString(),
      preferences: {
        theme: 'system',
        notifications: true,
        language: 'en'
      }
    };

    // Store user
    users.set(email.toLowerCase(), newUser);

    // Generate tokens
    const tokens = generateTokens(newUser.id);
    refreshTokens.add(tokens.refreshToken);

    // Format response
    const userResponse = formatUserResponse(newUser);

    res.status(201).json({
      user: userResponse,
      tokens,
      message: 'Registration successful'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    if (!refreshTokens.has(refreshToken)) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      refreshTokens.delete(refreshToken);
      return res.status(403).json({ message: 'Invalid or expired refresh token' });
    }

    // Find user
    const user = Array.from(users.values()).find(u => u.id === decoded.userId);
    if (!user) {
      refreshTokens.delete(refreshToken);
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate new tokens
    const tokens = generateTokens(user.id);
    
    // Replace old refresh token
    refreshTokens.delete(refreshToken);
    refreshTokens.add(tokens.refreshToken);

    res.json({ tokens });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticateToken, (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      refreshTokens.delete(refreshToken);
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// =============================================================================
// PROFILE MANAGEMENT ROUTES
// =============================================================================

// GET /api/auth/profile
router.get('/profile', authenticateToken, (req, res) => {
  const userResponse = formatUserResponse(req.user);
  res.json(userResponse);
});

// PATCH /api/auth/profile
router.patch('/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, avatar, preferences } = req.body;
    const user = req.user;

    // Update allowed fields
    if (firstName !== undefined) user.firstName = firstName.trim();
    if (lastName !== undefined) user.lastName = lastName.trim();
    if (avatar !== undefined) user.avatar = avatar;
    if (preferences !== undefined) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    // Update in store
    users.set(user.email, user);

    const userResponse = formatUserResponse(user);
    res.json(userResponse);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/auth/change-password
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Current password and new password are required' 
      });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({ 
        message: 'New password must be at least 6 characters long' 
      });
    }

    const user = req.user;

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Update in store
    users.set(user.email, user);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// =============================================================================
// PASSWORD RESET ROUTES (DEMO IMPLEMENTATION)
// =============================================================================

// POST /api/auth/forgot-password
router.post('/forgot-password', (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !validateEmail(email)) {
      return res.status(400).json({ message: 'Valid email is required' });
    }

    const user = users.get(email.toLowerCase());
    if (!user) {
      // Don't reveal if user exists for security
      return res.json({ 
        message: 'If an account exists with this email, a password reset link has been sent' 
      });
    }

    // In production: Generate reset token, save to database, send email
    console.log(`Password reset requested for: ${email}`);
    console.log(`Demo reset token: demo-reset-token-${Date.now()}`);

    res.json({ 
      message: 'If an account exists with this email, a password reset link has been sent' 
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Demo implementation - accept any token starting with 'demo-reset-token'
    if (!token.startsWith('demo-reset-token')) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // In production: Verify token, find user, update password
    res.json({ message: 'Password reset successful. Please log in with your new password.' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// =============================================================================
// ADMIN ROUTES (FOR DEVELOPMENT)
// =============================================================================

// GET /api/auth/users (Admin only - for development)
router.get('/users', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const userList = Array.from(users.values()).map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });

  res.json({ users: userList, total: userList.length });
});

module.exports = router;