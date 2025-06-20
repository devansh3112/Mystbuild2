# 🚀 Quick Vercel Deployment Checklist

## ✅ Your Environment Variables (Ready to Use)

You have all the essential environment variables! Here's what you need to set in Vercel:

### 📋 Copy these exact values to Vercel Dashboard

**Step 1: Go to Vercel Dashboard → Your Project → Settings → Environment Variables**

**Step 2: Add these variables one by one:**

```
Name: VITE_APP_URL
Value: https://your-app-domain.vercel.app
Environment: Production, Preview, Development
```

```
Name: VITE_SUPABASE_URL
Value: https://bpllapvarjdtdgwwsaja.supabase.co
Environment: Production, Preview, Development
```

```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwbGxhcHZhcmpkdGRnd3dzYWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2Nzg1OTMsImV4cCI6MjA2NDI1NDU5M30.NxDqwKxf8qlEmCQUek1KKcLChNc6iDHJwL_Eyd1l_00
Environment: Production, Preview, Development
```

```
Name: VITE_PAYSTACK_PUBLIC_KEY
Value: pk_test_2448cc156decb57761a7af852d830c3e41fdbee7
Environment: Production, Preview, Development
```

```
Name: VITE_PAYSTACK_SECRET_KEY
Value: sk_test_90bb70dcc9cd02d120d4a19f658a2a0d32cd5c6b
Environment: Production, Preview, Development
```

## 🚀 Deploy Commands

### Option 1: Using Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Option 2: GitHub Integration
1. Push your code to GitHub
2. Connect repository to Vercel
3. Set environment variables in dashboard
4. Deploy automatically on push

## 🔧 Local Development Setup

**Create `.env.local` file in your project root:**

```env
VITE_APP_URL=http://localhost:8081
VITE_SUPABASE_URL=https://bpllapvarjdtdgwwsaja.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwbGxhcHZhcmpkdGRnd3dzYWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2Nzg1OTMsImV4cCI6MjA2NDI1NDU5M30.NxDqwKxf8qlEmCQUek1KKcLChNc6iDHJwL_Eyd1l_00
VITE_PAYSTACK_PUBLIC_KEY=pk_test_2448cc156decb57761a7af852d830c3e41fdbee7
VITE_PAYSTACK_SECRET_KEY=sk_test_90bb70dcc9cd02d120d4a19f658a2a0d32cd5c6b
```

## ✅ Pre-Deployment Test

```bash
# Test build locally
npm run build:prod

# Preview the build
npm run preview
```

## 🎯 You're Ready to Deploy!

Your project is now Vercel-ready with:
- ✅ Optimized Vite configuration
- ✅ Proper environment variables
- ✅ Security headers configured
- ✅ Asset optimization enabled
- ✅ SPA routing configured

**Just run:** `npm run deploy:prod` or use the Vercel dashboard! 