# Deploying Mystery Publishers Manuscript Flow to Vercel

This guide provides step-by-step instructions for deploying the Mystery Publishers Manuscript Flow application to Vercel.

## Prerequisites

- A GitHub account with your project code pushed to a repository
- A Vercel account (free tier is available at [vercel.com](https://vercel.com))

## Deployment Steps

### 1. Push Your Code to GitHub

Ensure your code is pushed to a GitHub repository.

### 2. Connect to Vercel

1. Log in to [Vercel](https://vercel.com)
2. Click "New Project" from the dashboard
3. Import your GitHub repository:
   - Select your GitHub account
   - Find and select the "manuscript-flow-canvas" repository
4. Configure the Project:
   - **Framework Preset**: Select "Vite" from the dropdown
   - **Root Directory**: Leave as `.` (the repository root)
   - **Build Command**: Leave default (`npm run build`)
   - **Output Directory**: Leave default (`dist`)
   - **Install Command**: Leave default (`npm install`)
5. Click "Deploy"

### 3. Environment Variables (if needed)

If your application requires environment variables:

1. Go to the project settings in Vercel
2. Navigate to the "Environment Variables" tab
3. Add your environment variables:
   - Common environment variables include:
     - `VITE_API_URL`: URL for your backend API
     - `VITE_PUBLIC_URL`: The URL where your app is deployed

### 4. Custom Domain Setup

To use a custom domain:

1. Go to the project settings in Vercel
2. Navigate to the "Domains" tab
3. Add your custom domain
4. Follow the instructions to verify domain ownership and update DNS settings

### 5. Deploying Updates

Any new changes pushed to your main branch will automatically trigger a new deployment.

To deploy changes from other branches:

1. Push your changes to a different branch
2. Create a preview deployment by clicking "Preview" in your Vercel dashboard

## Troubleshooting

### Build Fails

If your build fails:

1. Check the build logs in Vercel
2. Common issues include:
   - Missing dependencies
   - TypeScript errors
   - Environment variable issues

### Page Not Found Errors

If you get "Page Not Found" errors when navigating:

1. Ensure your Vercel project is configured to handle client-side routing
2. Check that your `vercel.json` file includes the correct routes configuration

## Vercel Specific Features

Take advantage of Vercel-specific features:

- **Analytics**: Enable Vercel Analytics to monitor performance and usage
- **Serverless Functions**: Utilize Vercel Functions if you need backend capabilities
- **Edge Config**: Store and access configuration at the edge
- **Preview Deployments**: Automatically preview changes from pull requests

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [React Router with Vercel](https://vercel.com/guides/deploying-react-with-vercel) 