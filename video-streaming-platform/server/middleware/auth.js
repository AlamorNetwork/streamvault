const rateLimit = require('express-rate-limit');

// Rate limiter for authentication attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many authentication attempts',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

// Verify API key middleware
const verifyApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const validKey = process.env.API_KEY;

  if (!validKey) {
    return next(); // Skip if no API key configured
  }

  if (!apiKey || apiKey !== validKey) {
    return res.status(401).json({
      success: false,
      error: 'Invalid API key'
    });
  }

  next();
};

// IP whitelist middleware
const ipWhitelist = (req, res, next) => {
  const whitelist = process.env.IP_WHITELIST?.split(',') || [];
  
  if (whitelist.length === 0) {
    return next(); // Skip if no whitelist configured
  }

  const clientIp = req.ip || req.connection.remoteAddress;
  
  if (!whitelist.includes(clientIp)) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  next();
};

module.exports = {
  authLimiter,
  verifyApiKey,
  ipWhitelist
};
