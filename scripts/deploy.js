#!/usr/bin/env node

/**
 * Mystery Publishers Deployment Script
 * Automates the deployment process to Vercel
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = (message, color = colors.reset) => {
  console.log(`${color}${message}${colors.reset}`);
};

const checkEnvironmentVariables = () => {
  log('\n🔍 Checking environment variables...', colors.blue);
  
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_FLUTTERWAVE_PUBLIC_KEY',
    'VITE_FLUTTERWAVE_SECRET_KEY'
  ];
  
  const envFile = '.env.local';
  if (!fs.existsSync(envFile)) {
    log('❌ .env.local file not found!', colors.red);
    return false;
  }
  
  const envContent = fs.readFileSync(envFile, 'utf8');
  const missingVars = requiredVars.filter(varName => 
    !envContent.includes(varName)
  );
  
  if (missingVars.length > 0) {
    log(`❌ Missing environment variables: ${missingVars.join(', ')}`, colors.red);
    return false;
  }
  
  log('✅ All environment variables present', colors.green);
  return true;
};

const runTests = () => {
  log('\n🧪 Running build test...', colors.blue);
  
  try {
    execSync('npm run build', { stdio: 'inherit' });
    log('✅ Build test passed', colors.green);
    return true;
  } catch (error) {
    log('❌ Build test failed', colors.red);
    return false;
  }
};

const checkGitStatus = () => {
  log('\n📝 Checking git status...', colors.blue);
  
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim()) {
      log('⚠️  You have uncommitted changes:', colors.yellow);
      log(status, colors.yellow);
      
      const shouldContinue = process.argv.includes('--force');
      if (!shouldContinue) {
        log('💡 Commit your changes or use --force to deploy anyway', colors.cyan);
        return false;
      }
    }
    
    log('✅ Git status clean', colors.green);
    return true;
  } catch (error) {
    log('⚠️  Could not check git status', colors.yellow);
    return true; // Continue anyway
  }
};

const deployToVercel = () => {
  log('\n🚀 Deploying to Vercel...', colors.magenta);
  
  try {
    // Check if vercel CLI is installed
    execSync('vercel --version', { stdio: 'pipe' });
  } catch (error) {
    log('❌ Vercel CLI not found. Installing...', colors.red);
    try {
      execSync('npm install -g vercel', { stdio: 'inherit' });
    } catch (installError) {
      log('❌ Failed to install Vercel CLI', colors.red);
      return false;
    }
  }
  
  try {
    const deployCommand = process.argv.includes('--prod') ? 'vercel --prod' : 'vercel';
    execSync(deployCommand, { stdio: 'inherit' });
    log('✅ Deployment successful!', colors.green);
    return true;
  } catch (error) {
    log('❌ Deployment failed', colors.red);
    return false;
  }
};

const showDeploymentInfo = () => {
  log('\n📋 Deployment Information:', colors.cyan);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  log(`📦 Project: ${packageJson.name}`, colors.bright);
  log(`🏷️  Version: ${packageJson.version}`, colors.bright);
  log(`🔧 Framework: Vite + React`, colors.bright);
  log(`💳 Payments: M-Pesa via Flutterwave`, colors.bright);
  log(`🗄️  Database: Supabase`, colors.bright);
  log(`🌐 Platform: Vercel`, colors.bright);
  
  log('\n🔗 Important URLs:', colors.cyan);
  log('• Vercel Dashboard: https://vercel.com/dashboard', colors.blue);
  log('• Supabase Dashboard: https://supabase.com/dashboard', colors.blue);
  log('• Flutterwave Dashboard: https://dashboard.flutterwave.com', colors.blue);
  
  log('\n⚙️  Environment Variables to Set in Vercel:', colors.cyan);
  log('• VITE_SUPABASE_URL', colors.yellow);
  log('• VITE_SUPABASE_ANON_KEY', colors.yellow);
  log('• VITE_FLUTTERWAVE_PUBLIC_KEY', colors.yellow);
  log('• VITE_FLUTTERWAVE_SECRET_KEY', colors.yellow);
  
  log('\n📚 Next Steps:', colors.cyan);
  log('1. Configure environment variables in Vercel dashboard', colors.bright);
  log('2. Test the deployed application', colors.bright);
  log('3. Set up custom domain (optional)', colors.bright);
  log('4. Enable Vercel Analytics', colors.bright);
  log('5. Monitor application performance', colors.bright);
};

const main = async () => {
  log('🎯 Mystery Publishers Deployment Script', colors.magenta);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.magenta);
  
  // Pre-deployment checks
  const checks = [
    checkEnvironmentVariables,
    runTests,
    checkGitStatus,
  ];
  
  for (const check of checks) {
    if (!check()) {
      log('\n❌ Pre-deployment checks failed. Aborting deployment.', colors.red);
      process.exit(1);
    }
  }
  
  log('\n✅ All pre-deployment checks passed!', colors.green);
  
  // Show deployment info
  showDeploymentInfo();
  
  // Ask for confirmation unless --yes flag is provided
  if (!process.argv.includes('--yes')) {
    log('\n❓ Do you want to proceed with deployment? (y/N)', colors.yellow);
    
    // In a real scenario, you'd want to use readline for user input
    // For now, we'll proceed if --yes is provided
    if (!process.argv.includes('--force')) {
      log('💡 Use --yes flag to skip confirmation', colors.cyan);
      log('💡 Use --prod flag for production deployment', colors.cyan);
      log('💡 Use --force flag to deploy with uncommitted changes', colors.cyan);
      return;
    }
  }
  
  // Deploy
  if (deployToVercel()) {
    log('\n🎉 Deployment completed successfully!', colors.green);
    log('🌐 Your Mystery Publishers platform is now live!', colors.bright);
  } else {
    log('\n💥 Deployment failed. Please check the errors above.', colors.red);
    process.exit(1);
  }
};

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  log('🎯 Mystery Publishers Deployment Script', colors.magenta);
  log('\nUsage: node scripts/deploy.js [options]', colors.bright);
  log('\nOptions:', colors.cyan);
  log('  --help, -h     Show this help message', colors.bright);
  log('  --yes          Skip confirmation prompt', colors.bright);
  log('  --prod         Deploy to production', colors.bright);
  log('  --force        Deploy even with uncommitted changes', colors.bright);
  log('\nExamples:', colors.cyan);
  log('  node scripts/deploy.js --yes --prod', colors.bright);
  log('  node scripts/deploy.js --force', colors.bright);
  process.exit(0);
}

main().catch(error => {
  log(`\n💥 Deployment script failed: ${error.message}`, colors.red);
  process.exit(1);
}); 