// Environment configuration for Mystery Publishers
export const config = {
  // Environment detection
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // API URLs
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    serviceKey: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
  },
  
  // Paystack Configuration (Updated from Flutterwave)
  paystack: {
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    secretKey: import.meta.env.VITE_PAYSTACK_SECRET_KEY,
    isTestMode: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY?.includes('test'),
    baseUrl: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY?.includes('test') 
      ? 'https://api.paystack.co'
      : 'https://api.paystack.co'
  },
  
  // M-Pesa Configuration (keeping for mobile payments)
  mpesa: {
    consumerKey: import.meta.env.VITE_MPESA_CONSUMER_KEY,
    consumerSecret: import.meta.env.VITE_MPESA_CONSUMER_SECRET,
    passkey: import.meta.env.VITE_MPESA_PASSKEY,
    shortcode: import.meta.env.VITE_MPESA_SHORTCODE,
    environment: import.meta.env.VITE_MPESA_ENVIRONMENT || 'sandbox',
    accountRef: 'Mystery Publishers',
    baseUrl: import.meta.env.VITE_MPESA_ENVIRONMENT === 'production' 
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke'
  },
  
  // App configuration
  app: {
    name: 'Mystery Publishers',
    version: '1.0.0',
    description: 'Professional manuscript editing and publishing platform',
    url: import.meta.env.VITE_APP_URL || 'https://mystpublishers.vercel.app',
  },
  
  // Feature flags
  features: {
    enableAnalytics: import.meta.env.PROD,
    enableErrorReporting: import.meta.env.PROD,
    enablePayments: true,
    enableMpesa: true,
    enableDebugMode: import.meta.env.DEV,
  },
  
  // Currency settings
  currency: {
    default: 'USD',
    supported: ['USD', 'KES'],
    rates: {
      USD_TO_KES: 150, // Should be fetched from API in production
      KES_TO_USD: 0.0067,
    },
  },
  
  // Validation rules
  validation: {
    phoneNumber: {
      kenya: /^(\+254|254|0)[17]\d{8}$/,
      minLength: 10,
      maxLength: 13,
    },
    payment: {
      minAmount: 1,
      maxAmount: 10000,
    },
  },
  
  // Error messages
  messages: {
    errors: {
      network: 'Network error. Please check your connection and try again.',
      payment: 'Payment processing failed. Please try again.',
      auth: 'Authentication failed. Please log in again.',
      generic: 'Something went wrong. Please try again.',
    },
    success: {
      payment: 'Payment processed successfully!',
      auth: 'Successfully logged in!',
      save: 'Changes saved successfully!',
    },
  },
  
  // Exchange rates
  exchange: {
    rates: {
      usdToKes: 150, // Default rate, should be fetched from an API
      kesToUsd: 0.0067
    }
  }
};

// Environment validation
export const validateEnvironment = () => {
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_PAYSTACK_PUBLIC_KEY',
    'VITE_MPESA_CONSUMER_KEY'
  ];
  
  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    if (import.meta.env.PROD) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
  
  return missing.length === 0;
};

// Initialize environment validation
if (import.meta.env.PROD) {
  validateEnvironment();
}

export default config; 