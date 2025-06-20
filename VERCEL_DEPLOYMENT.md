# 🚀 Vercel Deployment Guide for Mystery Publishers

This guide will help you deploy the Mystery Publishers manuscript flow platform to Vercel.

## 📋 Pre-Deployment Checklist

### 1. Required Accounts
- [x] **Vercel Account** - [Sign up at vercel.com](https://vercel.com)
- [x] **Supabase Project** - Active and configured
- [x] **Paystack Account** - For payment processing
- [x] **GitHub Repository** - Code should be pushed to GitHub

### 2. Environment Variables Required

The following environment variables must be configured in Vercel:

#### **Core Application**
```env
VITE_APP_URL=https://your-app-domain.vercel.app
NODE_ENV=production
```

#### **Supabase Configuration**
```env
VITE_SUPABASE_URL=https://bpllapvarjdtdgwwsaja.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

#### **Payment Integration**
```env
VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_paystack_public_key
VITE_PAYSTACK_SECRET_KEY=sk_live_your_paystack_secret_key
```

#### **M-Pesa Integration (Optional)**
```env
VITE_MPESA_CONSUMER_KEY=your_mpesa_consumer_key
VITE_MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
VITE_MPESA_SHORTCODE=174379
VITE_MPESA_PASSKEY=your_mpesa_passkey
VITE_MPESA_CALLBACK_URL=https://your-app-domain.vercel.app/api/mpesa/callback
VITE_MPESA_ENVIRONMENT=live
```

#### **Email Configuration**
```env
VITE_FROM_EMAIL=noreply@mysterypublishers.com
VITE_FROM_NAME=Mystery Publishers
```

## 🚀 Deployment Methods

### Method 1: Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from Project Root**
   ```bash
   # For preview deployment
   vercel
   
   # For production deployment
   vercel --prod
   ```

4. **Using Custom Deploy Script**
   ```bash
   # Run pre-deployment checks and deploy
   npm run deploy:prod
   ```

### Method 2: GitHub Integration

1. **Push Code to GitHub**
   ```bash
   git add .
   git commit -m "feat: prepare for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Select "Vite" as framework preset

3. **Configure Build Settings**
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build:prod`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

## ⚙️ Vercel Configuration

### Build Settings
The project is configured with optimized build settings:

- **Framework**: Vite
- **Node.js Version**: 18.x
- **Build Command**: `npm run build:prod`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Performance Optimizations
- Asset caching (1 year for static assets)
- Security headers (CSP, XSS protection)
- Gzip compression enabled
- Code splitting and lazy loading
- Image optimization ready

### Environment Variables Setup in Vercel

1. **Navigate to Project Settings**
   - Go to your project in Vercel Dashboard
   - Click "Settings" tab
   - Select "Environment Variables"

2. **Add Variables**
   For each environment variable:
   - Add **Name** (e.g., `VITE_SUPABASE_URL`)
   - Add **Value** (the actual value)
   - Select **Environment**: Production, Preview, Development
   - Click "Save"

3. **Required Variables** (Copy from `env.example`):
   ```bash
   VITE_APP_URL
   VITE_SUPABASE_URL
   VITE_SUPABASE_ANON_KEY
   VITE_SUPABASE_SERVICE_ROLE_KEY
   VITE_PAYSTACK_PUBLIC_KEY
   VITE_PAYSTACK_SECRET_KEY
   VITE_FROM_EMAIL
   VITE_FROM_NAME
   ```

## 🌐 Domain Configuration

### Custom Domain Setup
1. **Add Custom Domain**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Configure DNS records as instructed

2. **SSL Certificate**
   - Automatically provisioned by Vercel
   - No additional configuration needed

3. **Update Environment Variables**
   ```env
   VITE_APP_URL=https://your-custom-domain.com
   VITE_MPESA_CALLBACK_URL=https://your-custom-domain.com/api/mpesa/callback
   ```

## 📊 Post-Deployment Setup

### 1. Verify Deployment
- [ ] Site loads correctly
- [ ] Authentication works
- [ ] Database connection established
- [ ] Payment integration functional
- [ ] File uploads working

### 2. Configure Supabase
Update Supabase settings:
```sql
-- Add your Vercel domain to allowed origins
-- In Supabase Dashboard → Authentication → URL Configuration
Site URL: https://your-app-domain.vercel.app
Redirect URLs: https://your-app-domain.vercel.app/**
```

### 3. Test Payment Integration
- Verify Paystack webhooks point to your domain
- Test payment flow end-to-end
- Check transaction recording in database

### 4. Enable Analytics (Optional)
```bash
# Install Vercel Analytics
npm install @vercel/analytics

# Add to your app
import { Analytics } from '@vercel/analytics/react'
export default function App() {
  return (
    <div>
      <Component />
      <Analytics />
    </div>
  )
}
```

## 🔧 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear cache and rebuild
   npm run clean
   npm install
   npm run build:prod
   ```

2. **Environment Variables Not Loading**
   - Ensure variables are set in Vercel Dashboard
   - Redeploy after adding variables
   - Check variable names match exactly

3. **Database Connection Issues**
   - Verify Supabase URL and keys
   - Check RLS policies allow access
   - Ensure network policies allow Vercel IPs

4. **Payment Integration Issues**
   - Verify Paystack keys are correct
   - Check webhook URLs point to live domain
   - Test in both sandbox and live modes

### Performance Monitoring

1. **Vercel Analytics**
   - Enable in project settings
   - Monitor Core Web Vitals
   - Track user engagement

2. **Error Tracking**
   - Check Vercel Function logs
   - Monitor Supabase logs
   - Set up error boundaries

## 📱 Mobile Optimization

The app is optimized for mobile devices:
- Responsive design for all screen sizes
- Touch-friendly interface
- Optimized images and assets
- Fast loading on mobile networks

## 🔒 Security Features

- Security headers configured
- HTTPS enforced
- CSP (Content Security Policy) enabled
- XSS protection
- CSRF protection via Supabase Auth

## 📈 Scaling Considerations

- Vercel automatically scales
- Supabase handles database scaling
- Consider CDN for file storage
- Monitor usage and upgrade plans as needed

## 🎯 Quick Deploy Commands

```bash
# Development preview
npm run deploy

# Production deployment
npm run deploy:prod

# Force deploy (skip checks)
npm run deploy:force
```

## 📞 Support

For deployment issues:
1. Check [Vercel Documentation](https://vercel.com/docs)
2. Review [Supabase Documentation](https://supabase.com/docs)
3. Check project GitHub issues
4. Contact support teams if needed

---

**Ready to deploy?** Run `npm run deploy:prod` to get started! 🚀 