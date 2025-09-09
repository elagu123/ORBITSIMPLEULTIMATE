# 🚀 Deployment Guide - Production Security

## 🛡️ Security Checklist

### ✅ Backend Security (Already Implemented)
- **Helmet.js** configured with comprehensive security headers
- **Rate limiting** (100 requests per 15 minutes per IP)
- **CORS** properly configured for production domains
- **JWT authentication** with secure token management
- **API key protection** (server-side only)
- **Input validation** with Zod schemas
- **Password hashing** with bcrypt

### ✅ Frontend Security (Already Implemented)
- **Content Security Policy** configured
- **XSS protection** enabled
- **Frame protection** (X-Frame-Options: DENY)
- **MIME type sniffing** disabled
- **Referrer policy** set to strict-origin-when-cross-origin

## 🔐 HTTPS Configuration

### Option 1: Using Reverse Proxy (Recommended)
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Frontend
    location / {
        root /var/www/orbit-marketing/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### Option 2: Direct HTTPS in Node.js
```javascript
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('/path/to/private-key.pem'),
  cert: fs.readFileSync('/path/to/certificate.pem')
};

https.createServer(options, app).listen(3001, () => {
  console.log('HTTPS Server running on port 3001');
});
```

## 🌍 Environment Configuration

### Production Environment Variables

**Backend (.env):**
```bash
# Server Configuration
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-domain.com

# Security
JWT_SECRET=your-super-secure-jwt-secret-256-bits-minimum
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-256-bits-minimum

# AI Service
GEMINI_API_KEY=your-production-gemini-api-key

# Database (if using)
DATABASE_URL=postgresql://user:password@localhost:5432/orbit_marketing
REDIS_URL=redis://localhost:6379

# External Services
SENDGRID_API_KEY=your-email-service-key
SENTRY_DSN=your-error-tracking-url
```

**Frontend (Build-time):**
```bash
VITE_BACKEND_URL=https://your-domain.com
VITE_APP_NAME=Orbit Marketing
VITE_SENTRY_DSN=your-frontend-error-tracking-url
```

## 🚀 Deployment Commands

### 1. Build for Production
```bash
# Frontend
npm run build

# Backend (if needed)
cd server
npm install --production
```

### 2. Deploy with PM2 (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'orbit-backend',
    script: 'server/server.js',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    instances: 'max',
    exec_mode: 'cluster',
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 3. Deploy with Docker
```dockerfile
# Dockerfile
FROM node:18-alpine

# Install security updates
RUN apk update && apk upgrade

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies
RUN npm ci --only=production
RUN cd server && npm ci --only=production

# Copy app source
COPY . .

# Build frontend
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S orbit -u 1001
USER orbit

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start application
CMD ["node", "server/server.js"]
```

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  orbit-app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - JWT_SECRET=${JWT_SECRET}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

## 🔍 Security Monitoring

### 1. Error Tracking
- Configure Sentry for both frontend and backend
- Set up alerts for critical errors
- Monitor rate limiting and failed authentication attempts

### 2. Log Analysis
```bash
# Monitor authentication attempts
tail -f logs/combined.log | grep "login\|register\|auth"

# Monitor rate limiting
tail -f logs/combined.log | grep "rate limit"

# Monitor errors
tail -f logs/err.log
```

### 3. Health Monitoring
```bash
# Check application health
curl -f https://your-domain.com/api/health

# Monitor SSL certificate
curl -I https://your-domain.com | grep -i "strict-transport-security"
```

## 🛠️ Post-Deployment Checklist

### Security Verification
- [ ] HTTPS is properly configured and redirects HTTP
- [ ] Security headers are present (check with securityheaders.com)
- [ ] Rate limiting is working
- [ ] Authentication endpoints are protected
- [ ] API keys are not exposed in frontend
- [ ] Error pages don't leak sensitive information
- [ ] File upload restrictions are in place
- [ ] CORS is properly configured for production domain

### Performance Verification
- [ ] Static assets are cached properly
- [ ] Gzip/Brotli compression is enabled
- [ ] Bundle sizes are optimized
- [ ] Images are optimized
- [ ] Database queries are optimized (if applicable)

### Monitoring Setup
- [ ] Error tracking is configured
- [ ] Performance monitoring is active
- [ ] Log rotation is configured
- [ ] Backup procedures are in place
- [ ] Health checks are monitoring critical paths

## 🚨 Important Security Notes

1. **Never commit sensitive data** to version control
2. **Use strong, unique passwords** for all services
3. **Regularly update dependencies** for security patches
4. **Monitor logs** for suspicious activity
5. **Implement proper backup procedures**
6. **Use environment-specific configurations**
7. **Enable 2FA** on all service accounts
8. **Regularly audit access permissions**

## 📞 Support

If you encounter issues during deployment:
1. Check the logs first: `pm2 logs` or `docker logs`
2. Verify environment variables are set correctly
3. Ensure all dependencies are installed
4. Check network connectivity and firewall rules
5. Verify SSL certificates are valid and not expired

---

🔒 **Security is a continuous process** - regularly review and update your security measures.