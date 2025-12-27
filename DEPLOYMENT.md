# 🚀 Deployment Guide - Colour Me Brazil

This guide covers deployment options and procedures for Colour Me Brazil.

## 📋 Pre-Deployment Checklist

### ✅ Required Steps

- [ ] All tests passing (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] TypeScript checks pass (`npm run typecheck`)
- [ ] Environment variables configured
- [ ] Base44 credentials setup
- [ ] Stripe keys configured (if using payments)
- [ ] Legal documents reviewed and updated
- [ ] Privacy policy contact information correct
- [ ] COPPA compliance verified
- [ ] Content moderation system tested
- [ ] Parental consent flow tested
- [ ] Backup strategy in place

### 📊 Performance Checks

- [ ] Lighthouse score > 90
- [ ] Bundle size optimized
- [ ] Images optimized (WebP format)
- [ ] Lazy loading implemented where needed
- [ ] Service worker caching configured
- [ ] CDN configured for assets

### 🔒 Security Checks

- [ ] All API keys in environment variables
- [ ] No sensitive data in git history
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation on all forms
- [ ] SQL injection prevention (prepared statements)
- [ ] XSS protection enabled

---

## 🌐 Deployment Options

### Option 1: Cloudflare Pages (Recommended)

**Advantages:**
- Free tier available
- Global CDN
- Automatic HTTPS
- Preview deployments
- Zero config for React apps

**Steps:**
```bash
# 1. Build the project
npm run build

# 2. Deploy to Cloudflare Pages
npx wrangler pages deploy dist
```

**Configuration:**
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/`
- Environment variables: Add in Cloudflare dashboard

### Option 2: Vercel

**Advantages:**
- Excellent DX
- Automatic deployments from Git
- Preview deployments
- Analytics built-in

**Steps:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

**Configuration (vercel.json):**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_BASE44_APP_ID": "@base44-app-id",
    "VITE_BASE44_SERVER_URL": "@base44-server-url",
    "VITE_BASE44_TOKEN": "@base44-token"
  }
}
```

### Option 3: Netlify

**Advantages:**
- Easy setup
- Form handling
- Function support
- Free tier

**Steps:**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy

# Production
netlify deploy --prod
```

**Configuration (netlify.toml):**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "20"
```

### Option 4: Docker (Self-Hosted)

**Advantages:**
- Full control
- Consistent environment
- Can deploy anywhere

**Steps:**
```bash
# Build Docker image
docker build -t colour-me-brazil:latest .

# Run container
docker run -d \
  -p 80:80 \
  --name colour-me-brazil \
  --env-file .env.production \
  colour-me-brazil:latest

# Or use docker-compose
docker-compose up -d
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "80:80"
    env_file:
      - .env.production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 3s
      retries: 3
```

### Option 5: AWS S3 + CloudFront

**Advantages:**
- Scalable
- Cost-effective for static sites
- Integrated with AWS ecosystem

**Steps:**
```bash
# Build
npm run build

# Sync to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

---

## 🔧 Environment Configuration

### Production Environment Variables

Create `.env.production`:

```env
# Base44 Production
VITE_BASE44_APP_ID=your_prod_app_id
VITE_BASE44_SERVER_URL=https://api.base44.com
VITE_BASE44_TOKEN=your_prod_token
VITE_BASE44_FUNCTIONS_VERSION=v1

# Application
VITE_APP_ENV=production
VITE_APP_URL=https://colourmebrazil.com

# Stripe Production
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx

# Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_ENABLE_ANALYTICS=true

# Features
VITE_ENABLE_PUSH_NOTIFICATIONS=true
VITE_ENABLE_OFFLINE_MODE=true
VITE_ENABLE_ERROR_REPORTING=true

# Error Tracking
VITE_SENTRY_DSN=https://your-sentry-dsn
VITE_SENTRY_ENVIRONMENT=production
```

---

## 📊 Post-Deployment Verification

### Automated Checks

Run after deployment:

```bash
# Check site is up
curl -I https://colourmebrazil.com

# Check SSL certificate
curl -vI https://colourmebrazil.com 2>&1 | grep -i "SSL"

# Check Lighthouse scores
npx lighthouse https://colourmebrazil.com --view
```

### Manual Checks

- [ ] Homepage loads correctly
- [ ] Can create account / login
- [ ] Age gate appears
- [ ] Parental consent flow works
- [ ] Cookie banner appears
- [ ] Books can be viewed
- [ ] Coloring works
- [ ] Offline mode functions
- [ ] PWA installs correctly
- [ ] All legal pages accessible
- [ ] Contact form works
- [ ] FAQ page loads
- [ ] Mobile responsive
- [ ] Cross-browser tested (Chrome, Firefox, Safari, Edge)

### Performance Metrics

Target scores:
- Lighthouse Performance: > 90
- Lighthouse Accessibility: > 95
- Lighthouse Best Practices: > 95
- Lighthouse SEO: > 95
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Cumulative Layout Shift: < 0.1

---

## 🔄 CI/CD with GitHub Actions

Already configured in `.github/workflows/ci.yml`

**Triggers:**
- Push to `main` → Deploy to production
- Push to `develop` → Deploy to staging
- Pull request → Run tests and preview

**Workflow:**
1. Run linting and tests
2. Build application
3. Run security audit
4. Deploy to environment
5. Post-deployment verification

---

## 🎯 Staging Environment

### Setup Staging

1. Create staging branch:
```bash
git checkout -b staging
git push -u origin staging
```

2. Configure staging environment:
- Use separate Base44 app
- Use Stripe test keys
- Use test email addresses

3. Deploy to staging subdomain:
- staging.colourmebrazil.com

### Testing on Staging

- Test all new features
- Test payment flows (use Stripe test cards)
- Test email notifications
- Verify parental consent flow
- Check COPPA compliance
- Load testing
- Security testing

---

## 🔐 SSL/TLS Configuration

### Cloudflare Pages
Automatic HTTPS with free SSL certificate.

### Custom Domain with Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name colourmebrazil.com;

    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Your app configuration
    root /var/www/colour-me-brazil/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name colourmebrazil.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 📈 Monitoring and Analytics

### Google Analytics 4 Setup

```javascript
// Add to index.html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Sentry Error Tracking

```javascript
// Add to main.jsx
import * as Sentry from "@sentry/react";

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_APP_ENV,
    tracesSampleRate: 1.0,
  });
}
```

### Uptime Monitoring

Recommended services:
- UptimeRobot (free)
- Pingdom
- StatusCake

---

## 🚨 Rollback Procedure

### Quick Rollback

```bash
# With Vercel
vercel rollback [deployment-url]

# With Cloudflare
wrangler pages deployment list
wrangler pages deployment rollback [deployment-id]

# With Docker
docker pull colour-me-brazil:previous-tag
docker-compose up -d
```

### Manual Rollback

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or reset to specific commit
git reset --hard <commit-hash>
git push --force origin main
```

---

## 📞 Support and Troubleshooting

### Common Issues

**Issue: Build fails**
- Check Node version (requires 18+)
- Clear node_modules and reinstall
- Check environment variables

**Issue: Service worker not updating**
- Hard refresh (Ctrl+Shift+R)
- Clear browser cache
- Check SW cache version

**Issue: PWA not installing**
- Verify manifest.json is accessible
- Check HTTPS is enabled
- Verify service worker is registered

### Getting Help

- **Documentation:** Check README.md and CONTRIBUTING.md
- **Issues:** GitHub Issues
- **Email:** deploy@colourmebrazil.com

---

## ✅ Post-Deployment Tasks

- [ ] Update DNS records (if needed)
- [ ] Configure email delivery (SendGrid/Mailgun)
- [ ] Set up monitoring and alerts
- [ ] Enable error tracking
- [ ] Configure backups
- [ ] Set up status page
- [ ] Announce launch
- [ ] Monitor initial traffic
- [ ] Review analytics
- [ ] Collect user feedback

---

**Ready to deploy?** 🚀

Make sure all checks pass, then proceed with your chosen deployment method!

🦜 Happy Deploying! 🎨
