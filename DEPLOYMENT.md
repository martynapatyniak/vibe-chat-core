# ChatFlow Deployment Guide

This guide covers deploying ChatFlow to various platforms and production configurations.

## 🚀 Platform Deployments

### Vercel (Recommended)

Vercel provides excellent React deployment with automatic builds and global CDN.

**Steps:**
1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - **Framework Preset**: Vite
   - **Build Command**: \`npm run build\`
   - **Output Directory**: \`dist\`
3. Set environment variables:
   - \`VITE_SUPABASE_URL\`
   - \`VITE_SUPABASE_PUBLISHABLE_KEY\`
   - \`VITE_SUPABASE_PROJECT_ID\`
4. Deploy automatically on git push

**Custom Domain:**
- Add your domain in Vercel dashboard
- Update Supabase auth redirect URLs

### Netlify

**Steps:**
1. Connect repository to Netlify
2. Build settings:
   - **Build command**: \`npm run build\`
   - **Publish directory**: \`dist\`
3. Set environment variables in Netlify dashboard
4. Configure redirects in \`public/_redirects\`:
   \`\`\`
   /*    /index.html   200
   \`\`\`

### Railway

**Steps:**
1. Connect GitHub repository
2. Railway auto-detects Vite configuration
3. Set environment variables
4. Deploy with custom domain support

### DigitalOcean App Platform

**Steps:**
1. Create new app from GitHub
2. Configure build settings:
   - **Build Command**: \`npm run build\`
   - **Run Command**: \`npm run preview\`
3. Set environment variables
4. Enable automatic deployments

## 🔧 Production Configuration

### Environment Variables

Create production \`.env\` file:

\`\`\`env
# Production Supabase
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-production-anon-key"
VITE_SUPABASE_PROJECT_ID="your-project-id"

# Production app URL
VITE_APP_URL="https://yourdomain.com"
\`\`\`

### Supabase Production Setup

**1. Configure Authentication:**
- Enable email confirmation
- Set up custom SMTP (SendGrid, AWS SES)
- Configure redirect URLs for your domain
- Enable rate limiting

**2. Database Optimization:**
- Review and optimize RLS policies
- Set up database backups
- Configure connection pooling
- Monitor query performance

**3. Storage Configuration:**
- Create storage buckets for files
- Set up CDN for file delivery
- Configure file size limits
- Implement virus scanning (optional)

**4. Security Settings:**
- Enable 2FA for admin accounts
- Review API keys and permissions
- Set up IP restrictions (if needed)
- Configure CORS policies

### Performance Optimizations

**1. Build Optimization:**
\`\`\`json
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
\`\`\`

**2. Image Optimization:**
- Use WebP format when possible
- Implement lazy loading
- Set up image compression
- Use appropriate image sizes

**3. Caching Strategy:**
- Configure CDN caching headers
- Implement service worker (optional)
- Cache Supabase queries appropriately

## 🔒 Security Hardening

### Content Security Policy

Add to your hosting platform:

\`\`\`
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://your-project.supabase.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://your-project.supabase.co wss://your-project.supabase.co;
\`\`\`

### Security Headers

Configure these headers in your hosting platform:

\`\`\`
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
\`\`\`

### Rate Limiting

Implement additional rate limiting at CDN/proxy level:
- 100 requests per minute per IP for API calls
- 10 requests per minute for authentication
- 1000 requests per hour for static assets

## 📊 Monitoring & Analytics

### Error Tracking

**Sentry Integration:**
\`\`\`bash
npm install @sentry/react @sentry/tracing
\`\`\`

**Configuration:**
\`\`\`javascript
// src/lib/sentry.ts
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
\`\`\`

### Performance Monitoring

**Web Vitals:**
\`\`\`javascript
// src/lib/analytics.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to your analytics service
  console.log(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
\`\`\`

### Uptime Monitoring

Set up monitoring with:
- Pingdom
- UptimeRobot
- StatusPage.io

Monitor:
- Application availability
- Database connectivity
- API response times
- Real-time functionality

## 📱 Mobile Considerations

### Progressive Web App

Add PWA support:

\`\`\`bash
npm install vite-plugin-pwa
\`\`\`

**Configuration:**
\`\`\`javascript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        name: 'ChatFlow',
        short_name: 'ChatFlow',
        description: 'Real-time chat application',
        theme_color: '#3b82f6',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});
\`\`\`

### Touch Optimizations

- Ensure 44px minimum touch targets
- Optimize scroll performance
- Test gesture navigation
- Validate on various device sizes

## 🚀 CI/CD Pipeline

### GitHub Actions

\`\`\`yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build application
        run: npm run build
        env:
          VITE_SUPABASE_URL: \${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_PUBLISHABLE_KEY: \${{ secrets.VITE_SUPABASE_PUBLISHABLE_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: \${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: \${{ secrets.ORG_ID }}
          vercel-project-id: \${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
\`\`\`

## 🔄 Database Migrations

### Migration Strategy

1. **Test migrations in staging first**
2. **Backup production database**
3. **Run migrations during low-traffic periods**
4. **Monitor for issues post-deployment**

### Migration Example

\`\`\`sql
-- migrations/add_user_preferences.sql
ALTER TABLE public.users 
ADD COLUMN preferences JSONB DEFAULT '{}';

-- Update RLS policies if needed
-- Test thoroughly before production
\`\`\`

## 📋 Post-Deployment Checklist

### Immediate Checks
- [ ] Application loads correctly
- [ ] Authentication works
- [ ] Real-time messaging functions
- [ ] File uploads work (if enabled)
- [ ] Database queries perform well
- [ ] Error tracking is active

### 24-Hour Monitoring
- [ ] Check error rates
- [ ] Monitor performance metrics
- [ ] Validate user signups
- [ ] Test mobile experience
- [ ] Monitor server costs

### Weekly Review
- [ ] Analyze user engagement
- [ ] Review error logs
- [ ] Check security alerts
- [ ] Validate backup systems
- [ ] Performance optimization opportunities

## 🆘 Troubleshooting

### Common Issues

**Build Failures:**
- Check environment variables
- Verify Node.js version compatibility
- Clear cache and reinstall dependencies

**Authentication Issues:**
- Verify Supabase redirect URLs
- Check RLS policies
- Validate environment variables

**Real-time Not Working:**
- Check Supabase realtime settings
- Verify table publications
- Test WebSocket connectivity

**Performance Issues:**
- Analyze bundle size
- Check database query performance
- Review network requests
- Monitor memory usage

### Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Vite Docs**: https://vitejs.dev
- **React Docs**: https://react.dev
- **Deployment Platform Docs**: Check specific platform documentation

Remember to test all functionality after deployment and monitor the application closely during the first few days of production use.