#!/usr/bin/env node

/**
 * Mystery Publishers Vercel Deployment Script
 * Automates the deployment process to Vercel with comprehensive checks
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
    'VITE_PAYSTACK_PUBLIC_KEY',
    'VITE_PAYSTACK_SECRET_KEY'
  ];
  
  const optionalVars = [
    'VITE_APP_URL',
    'VITE_SUPABASE_SERVICE_ROLE_KEY',
    'VITE_MPESA_CONSUMER_KEY',
    'VITE_FROM_EMAIL'
  ];
  
  // Check for local env file (development)
  const envFiles = ['.env.local', '.env', '.env.production'];
  let envFileFound = false;
  let envContent = '';
  
  for (const envFile of envFiles) {
    if (fs.existsSync(envFile)) {
      envContent = fs.readFileSync(envFile, 'utf8');
      envFileFound = true;
      log(`✅ Found environment file: ${envFile}`, colors.green);
      break;
    }
  }
  
  if (!envFileFound) {
    log('⚠️  No local .env file found - assuming Vercel environment variables', colors.yellow);
    log('💡 Make sure to set environment variables in Vercel Dashboard', colors.cyan);
    return true; // Continue for Vercel deployment
  }
  
  const missingRequired = requiredVars.filter(varName => 
    !envContent.includes(varName) && !process.env[varName]
  );
  
  const missingOptional = optionalVars.filter(varName =>
    !envContent.includes(varName) && !process.env[varName]
  );
  
  if (missingRequired.length > 0) {
    log(`❌ Missing required environment variables: ${missingRequired.join(', ')}`, colors.red);
    return false;
  }
  
  if (missingOptional.length > 0) {
    log(`⚠️  Missing optional environment variables: ${missingOptional.join(', ')}`, colors.yellow);
  }
  
  log('✅ All required environment variables present', colors.green);
  return true;
};

const checkNodeVersion = () => {
  log('\n🔧 Checking Node.js version...', colors.blue);
  
  try {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 18) {
      log(`❌ Node.js ${nodeVersion} detected. Vercel requires Node.js 18+`, colors.red);
      log('💡 Update Node.js: https://nodejs.org/', colors.cyan);
      return false;
    }
    
    log(`✅ Node.js ${nodeVersion} (compatible with Vercel)`, colors.green);
    return true;
  } catch (error) {
    log('⚠️  Could not check Node.js version', colors.yellow);
    return true;
  }
};

const checkPackageJson = () => {
  log('\n📦 Validating package.json...', colors.blue);
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Check for required scripts
    const requiredScripts = ['build', 'build:prod'];
    const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);
    
    if (missingScripts.length > 0) {
      log(`❌ Missing required scripts: ${missingScripts.join(', ')}`, colors.red);
      return false;
    }
    
    // Check Node.js engine requirement
    if (packageJson.engines?.node) {
      log(`✅ Node.js engine requirement: ${packageJson.engines.node}`, colors.green);
    }
    
    log('✅ Package.json validation passed', colors.green);
    return true;
  } catch (error) {
    log('❌ Invalid package.json', colors.red);
    return false;
  }
};

const runTypeCheck = () => {
  log('\n🔍 Running TypeScript type check...', colors.blue);
  
  try {
    execSync('npm run check-types', { stdio: 'pipe' });
    log('✅ TypeScript type check passed', colors.green);
    return true;
  } catch (error) {
    log('❌ TypeScript type check failed', colors.red);
    console.log(error.stdout?.toString());
    return false;
  }
};

const runLinting = () => {
  log('\n🧹 Running ESLint...', colors.blue);
  
  try {
    execSync('npm run lint', { stdio: 'pipe' });
    log('✅ Linting passed', colors.green);
    return true;
  } catch (error) {
    log('⚠️  Linting issues found', colors.yellow);
    
    if (!process.argv.includes('--force')) {
      log('💡 Fix linting issues or use --force to deploy anyway', colors.cyan);
      return false;
    }
    
    log('🚀 Continuing with --force flag', colors.yellow);
    return true;
  }
};

const runBuildTest = () => {
  log('\n🏗️  Running production build test...', colors.blue);
  
  try {
    // Clean previous build
    if (fs.existsSync('dist')) {
      execSync('npm run clean', { stdio: 'pipe' });
    }
    
    execSync('npm run build:prod', { stdio: 'inherit' });
    log('✅ Production build successful', colors.green);
    
    // Check build output
    if (!fs.existsSync('dist/index.html')) {
      log('❌ Build output missing index.html', colors.red);
      return false;
    }
    
    const stats = fs.statSync('dist');
    log(`📊 Build output size: ${(stats.size / 1024).toFixed(2)} KB`, colors.cyan);
    
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
    
    // Check current branch
    const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    log(`✅ Current branch: ${branch}`, colors.green);
    
    return true;
  } catch (error) {
    log('⚠️  Could not check git status (not a git repository?)', colors.yellow);
    return true; // Continue anyway for Vercel
  }
};

const deployToVercel = () => {
  log('\n🚀 Deploying to Vercel...', colors.magenta);
  
  try {
    // Check if vercel CLI is installed
    execSync('vercel --version', { stdio: 'pipe' });
    log('✅ Vercel CLI found', colors.green);
  } catch (error) {
    log('❌ Vercel CLI not found. Installing...', colors.red);
    try {
      execSync('npm install -g vercel', { stdio: 'inherit' });
      log('✅ Vercel CLI installed', colors.green);
    } catch (installError) {
      log('❌ Failed to install Vercel CLI', colors.red);
      log('💡 Install manually: npm install -g vercel', colors.cyan);
      return false;
    }
  }
  
  try {
    const isProduction = process.argv.includes('--prod');
    const deployCommand = isProduction ? 'vercel --prod' : 'vercel';
    
    log(`🔄 Running: ${deployCommand}`, colors.cyan);
    execSync(deployCommand, { stdio: 'inherit' });
    
    const deploymentType = isProduction ? 'PRODUCTION' : 'PREVIEW';
    log(`\n🎉 ${deploymentType} deployment successful!`, colors.green);
    return true;
  } catch (error) {
    log('❌ Deployment failed', colors.red);
    return false;
  }
};

const showDeploymentInfo = () => {
  log('\n📋 Vercel Deployment Information:', colors.cyan);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  log(`📦 Project: ${packageJson.name}`, colors.bright);
  log(`🏷️  Version: ${packageJson.version}`, colors.bright);
  log(`🔧 Framework: Vite + React + TypeScript`, colors.bright);
  log(`💳 Payments: Paystack + M-Pesa`, colors.bright);
  log(`🗄️  Database: Supabase PostgreSQL`, colors.bright);
  log(`🌐 Platform: Vercel`, colors.bright);
  log(`🎯 Node.js: ${packageJson.engines?.node || '18.x'}`, colors.bright);
  
  log('\n🔗 Important Links:', colors.cyan);
  log('• Vercel Dashboard: https://vercel.com/dashboard', colors.blue);
  log('• Supabase Dashboard: https://supabase.com/dashboard', colors.blue);
  log('• Paystack Dashboard: https://dashboard.paystack.co', colors.blue);
  log('• Deployment Guide: ./VERCEL_DEPLOYMENT.md', colors.blue);
  
  log('\n⚙️  Vercel Environment Variables Required:', colors.cyan);
  const envVars = [
    'VITE_APP_URL',
    'VITE_SUPABASE_URL', 
    'VITE_SUPABASE_ANON_KEY',
    'VITE_PAYSTACK_PUBLIC_KEY',
    'VITE_PAYSTACK_SECRET_KEY'
  ];
  
  envVars.forEach(envVar => {
    log(`• ${envVar}`, colors.yellow);
  });
  
  log('\n🔧 Vercel Build Configuration:', colors.cyan);
  log('• Framework Preset: Vite', colors.bright);
  log('• Build Command: npm run build:prod', colors.bright);
  log('• Output Directory: dist', colors.bright);
  log('• Install Command: npm install', colors.bright);
  log('• Node.js Version: 18.x', colors.bright);
  
  log('\n📚 Next Steps After Deployment:', colors.cyan);
  log('1. ✅ Verify site loads correctly', colors.bright);
  log('2. ✅ Test authentication flow', colors.bright);
  log('3. ✅ Test payment integration', colors.bright);
  log('4. ✅ Configure custom domain (optional)', colors.bright);
  log('5. ✅ Enable Vercel Analytics', colors.bright);
  log('6. ✅ Set up monitoring and alerts', colors.bright);
};

const main = async () => {
  log('🎯 Mystery Publishers → Vercel Deployment', colors.magenta);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.magenta);
  
  // Pre-deployment checks
  const checks = [
    { name: 'Node.js Version', fn: checkNodeVersion },
    { name: 'Package.json', fn: checkPackageJson },
    { name: 'Environment Variables', fn: checkEnvironmentVariables },
    { name: 'TypeScript', fn: runTypeCheck },
    { name: 'ESLint', fn: runLinting },
    { name: 'Production Build', fn: runBuildTest },
    { name: 'Git Status', fn: checkGitStatus },
  ];
  
  let failedChecks = 0;
  
  for (const check of checks) {
    if (!check.fn()) {
      failedChecks++;
      if (!process.argv.includes('--force')) {
        log(`\n❌ ${check.name} check failed. Use --force to skip checks.`, colors.red);
      }
    }
  }
  
  if (failedChecks > 0 && !process.argv.includes('--force')) {
    log('\n💥 Pre-deployment checks failed. Aborting deployment.', colors.red);
    log('💡 Use --force to deploy anyway (not recommended)', colors.cyan);
    process.exit(1);
  }
  
  if (failedChecks > 0) {
    log(`\n⚠️  ${failedChecks} checks failed but continuing with --force`, colors.yellow);
  } else {
    log('\n✅ All pre-deployment checks passed!', colors.green);
  }
  
  // Show deployment info
  showDeploymentInfo();
  
  // Ask for confirmation unless --yes flag is provided
  if (!process.argv.includes('--yes')) {
    log('\n❓ Proceed with Vercel deployment? (Use --yes to skip)', colors.yellow);
    log('💡 Available flags: --prod --force --yes', colors.cyan);
    
    if (!process.argv.includes('--force')) {
      return;
    }
  }
  
  // Deploy to Vercel
  if (deployToVercel()) {
    log('\n🎉 Vercel deployment completed successfully!', colors.green);
    log('🌐 Mystery Publishers is now live on Vercel!', colors.bright);
    log('\n📖 Check VERCEL_DEPLOYMENT.md for post-deployment steps', colors.cyan);
  } else {
    log('\n💥 Deployment failed. Check the errors above.', colors.red);
    process.exit(1);
  }
};

// Handle command line arguments and run
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Deployment script error:', error);
    process.exit(1);
  });
} 