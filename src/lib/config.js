// Environment configuration for Mystery Publishers
const config = {
  app: {
    name: "Mystery Publishers",
    url: import.meta.env.VITE_APP_URL || "http://localhost:3000",
    environment: import.meta.env.MODE || "development"
  },

  // Database Configuration  
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    serviceRoleKey: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
  },

  // Flutterwave Configuration (Restored)
  flutterwave: {
    publicKey: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY,
    secretKey: import.meta.env.VITE_FLUTTERWAVE_SECRET_KEY,
    isTestMode: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY?.includes('test'),
    baseUrl: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY?.includes('test')
      ? 'https://api.flutterwave.com/v3'
      : 'https://api.flutterwave.com/v3'
  },

  // M-Pesa Configuration
  mpesa: {
    consumerKey: import.meta.env.VITE_MPESA_CONSUMER_KEY,
    consumerSecret: import.meta.env.VITE_MPESA_CONSUMER_SECRET,
    businessShortCode: import.meta.env.VITE_MPESA_SHORTCODE || "174379",
    passkey: import.meta.env.VITE_MPESA_PASSKEY,
    callbackUrl: import.meta.env.VITE_MPESA_CALLBACK_URL || `${import.meta.env.VITE_APP_URL}/api/mpesa/callback`,
    environment: import.meta.env.VITE_MPESA_ENVIRONMENT || "sandbox", // sandbox or live
    baseUrl: import.meta.env.VITE_MPESA_ENVIRONMENT === "live" 
      ? "https://api.safaricom.co.ke"
      : "https://sandbox.safaricom.co.ke"
  },

  // Email Configuration
  email: {
    provider: "supabase", // Using Supabase Auth email
    fromEmail: import.meta.env.VITE_FROM_EMAIL || "noreply@mysterypublishers.com",
    fromName: import.meta.env.VITE_FROM_NAME || "Mystery Publishers"
  },

  // File Storage Configuration
  storage: {
    provider: "supabase", // Using Supabase Storage
    bucket: "manuscripts",
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      "application/pdf",
      "application/msword", 
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain"
    ]
  },

  // Feature Flags
  features: {
    enablePayments: true,
    enableFileUploads: true,
    enableRealTimeChat: true,
    enableNotifications: true,
    enableAnalytics: false
  },

  // API Configuration
  api: {
    timeout: 30000, // 30 seconds
    retries: 3
  },

  // Security Configuration
  security: {
    enableCSRF: true,
    enableRateLimit: true,
    sessionTimeout: 24 * 60 * 60 * 1000 // 24 hours
  },

  // Debug Configuration
  debug: {
    enableConsoleLog: import.meta.env.MODE === "development",
    enableNetworkLog: import.meta.env.MODE === "development"
  }
};

// Validate required environment variables
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_FLUTTERWAVE_PUBLIC_KEY',
  'VITE_FLUTTERWAVE_SECRET_KEY'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !import.meta.env[envVar]);

if (missingEnvVars.length > 0 && import.meta.env.MODE !== 'test') {
  console.warn('Missing required environment variables:', missingEnvVars);
}

export default config; 