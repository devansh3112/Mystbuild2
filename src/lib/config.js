// Environment configuration for Mystery Publishers
export const config = {
  // Environment detection
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // API URLs
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  
  // Payment configuration
  flutterwave: {
    publicKey: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY,
    secretKey: import.meta.env.VITE_FLUTTERWAVE_SECRET_KEY,
    isTestMode: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY?.includes('test'),
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
};

// Environment validation
export const validateEnvironment = () => {
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_FLUTTERWAVE_PUBLIC_KEY',
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