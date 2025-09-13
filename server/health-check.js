#!/usr/bin/env node

// Health check script for Docker container
const http = require('http');

const healthCheck = () => {
  const options = {
    host: 'localhost',
    port: 3003,
    path: '/health',
    timeout: 5000
  };

  const request = http.request(options, (res) => {
    if (res.statusCode === 200) {
      console.log('✅ Health check passed');
      process.exit(0);
    } else {
      console.log('❌ Health check failed - status:', res.statusCode);
      process.exit(1);
    }
  });

  request.on('error', (err) => {
    console.log('❌ Health check failed - error:', err.message);
    process.exit(1);
  });

  request.on('timeout', () => {
    console.log('❌ Health check failed - timeout');
    request.destroy();
    process.exit(1);
  });

  request.end();
};

healthCheck();