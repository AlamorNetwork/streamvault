const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

const REAL_SERVER_URL = process.env.REAL_SERVER_URL;
const REAL_SERVER_TOKEN = process.env.REAL_SERVER_TOKEN;
const CLIENT_TOKEN = process.env.CLIENT_TOKEN;

// Middleware: Verify client token
const verifyClient = (req, res, next) => {
  const token = req.headers['x-client-token'] || req.headers['authorization']?.replace('Bearer ', '');
  
  if (!token || token !== CLIENT_TOKEN) {
    // Return 200 to hide authentication
    return res.status(200).json({ 
      success: true, 
      data: null,
      message: 'No updates available'
    });
  }
  
  next();
};

// POST /stream/data - Send data to real server
router.post('/data', verifyClient, async (req, res) => {
  try {
    const response = await fetch(`${REAL_SERVER_URL}/api/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${REAL_SERVER_TOKEN}`,
        'User-Agent': 'StreamFlix/1.0',
        'X-Forwarded-For': req.ip,
        'X-Real-IP': req.ip
      },
      body: JSON.stringify(req.body),
      timeout: 25000
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const data = await response.json();
    
    res.json({
      success: true,
      data: data,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Proxy error (data):', error.message);
    
    // Always return 200 to hide errors
    res.status(200).json({
      success: true,
      data: null,
      message: 'Request processed'
    });
  }
});

// GET /stream/updates - Long polling for updates
router.get('/updates', verifyClient, async (req, res) => {
  const lastEventId = req.query.lastEventId || req.headers['last-event-id'] || '0';
  const timeout = parseInt(req.query.timeout) || 20000;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(
      `${REAL_SERVER_URL}/api/updates?lastEventId=${lastEventId}&timeout=${timeout}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${REAL_SERVER_TOKEN}`,
          'User-Agent': 'StreamFlix/1.0',
          'Accept': 'application/json',
          'X-Forwarded-For': req.ip,
          'X-Real-IP': req.ip
        },
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const data = await response.json();
    
    res.json({
      success: true,
      updates: data.updates || [],
      lastEventId: data.lastEventId || lastEventId,
      timestamp: Date.now()
    });

  } catch (error) {
    if (error.name === 'AbortError') {
      // Timeout - return empty updates
      return res.json({
        success: true,
        updates: [],
        lastEventId: lastEventId,
        timestamp: Date.now()
      });
    }

    console.error('Proxy error (updates):', error.message);
    
    // Always return 200 to hide errors
    res.status(200).json({
      success: true,
      updates: [],
      lastEventId: lastEventId,
      message: 'No updates available'
    });
  }
});

// GET /stream/health - Health check (hidden)
router.get('/health', verifyClient, (req, res) => {
  res.json({
    success: true,
    status: 'operational',
    timestamp: Date.now(),
    server: 'proxy'
  });
});

module.exports = router;
