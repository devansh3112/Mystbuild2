// Paystack Payment Integration for Mystery Publishers
import config from './config.js';

const PAYSTACK_PUBLIC_KEY = config.paystack?.publicKey || import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
const PAYSTACK_SECRET_KEY = config.paystack?.secretKey || import.meta.env.VITE_PAYSTACK_SECRET_KEY;

// Validate environment variables
if (!PAYSTACK_PUBLIC_KEY) {
  console.error('Paystack public key is not configured');
}

if (!PAYSTACK_SECRET_KEY) {
  console.error('Paystack secret key is not configured');
}

// Helper function to generate a unique transaction reference
export const generateTransactionRef = () => {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000000);
  return `MP-${timestamp}-${random}`;
};

// Currency conversion helper
export const convertCurrency = (amount, fromCurrency, toCurrency) => {
  // In production, this should use a real exchange rate API
  const exchangeRates = {
    USD: 1,
    NGN: 1650, // Nigerian Naira
    KES: 150,  // Kenyan Shilling
    GHS: 16,   // Ghanaian Cedi
  };
  
  const usdAmount = amount / exchangeRates[fromCurrency];
  return usdAmount * exchangeRates[toCurrency];
};

// Convert amount to kobo (Paystack uses kobo as the smallest unit for NGN)
export const convertToKobo = (amount, currency = 'NGN') => {
  if (currency === 'NGN') {
    return Math.round(amount * 100); // Convert naira to kobo
  }
  // For other currencies, Paystack uses the smallest unit
  return Math.round(amount * 100);
};

// Create Paystack payment configuration
export const createPaystackConfig = ({
  amount,
  currency = 'NGN',
  email,
  phone,
  name,
  reference = null,
  callback_url = null,
  metadata = {}
}) => {
  const transactionRef = reference || generateTransactionRef();
  
  return {
    reference: transactionRef,
    email: email,
    amount: convertToKobo(amount, currency), // Convert to smallest unit
    currency: currency,
    publicKey: PAYSTACK_PUBLIC_KEY,
    text: 'Pay Now',
    onSuccess: (reference) => {
      console.log('Payment successful:', reference);
    },
    onClose: () => {
      console.log('Payment dialog closed');
    },
    metadata: {
      custom_fields: [
        {
          display_name: "Customer Name",
          variable_name: "customer_name",
          value: name
        },
        {
          display_name: "Phone Number",
          variable_name: "phone_number",
          value: phone || ''
        }
      ],
      platform: 'web',
      source: 'mystery-publishers',
      ...metadata
    },
    channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
    callback_url: callback_url || `${window.location.origin}/payment/callback`
  };
};

// Initialize payment with Paystack
export const initializePayment = async ({
  amount,
  email,
  phone,
  name,
  currency = 'NGN',
  description = 'Payment for manuscript services'
}) => {
  try {
    const config = createPaystackConfig({
      amount,
      currency,
      email,
      phone,
      name,
      metadata: { description }
    });

    return {
      success: true,
      config: config,
      reference: config.reference
    };
  } catch (error) {
    console.error('Payment initialization error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Initialize payment on Paystack server
export const initializePaystackTransaction = async ({
  amount,
  email,
  currency = 'NGN',
  reference = null,
  callback_url = null,
  metadata = {}
}) => {
  try {
    const transactionRef = reference || generateTransactionRef();
    
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reference: transactionRef,
        amount: convertToKobo(amount, currency),
        email: email,
        currency: currency,
        callback_url: callback_url || `${window.location.origin}/payment/callback`,
        metadata: {
          platform: 'web',
          source: 'mystery-publishers',
          ...metadata
        },
        channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer']
      }),
    });

    const data = await response.json();
    
    if (data.status) {
      return {
        success: true,
        data: data.data,
        authorization_url: data.data.authorization_url,
        access_code: data.data.access_code,
        reference: data.data.reference
      };
    } else {
      return {
        success: false,
        error: data.message || 'Payment initialization failed'
      };
    }
  } catch (error) {
    console.error('Payment initialization error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Verify payment with Paystack
export const verifyPayment = async (reference) => {
  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (data.status) {
      return {
        success: true,
        data: data.data,
        transaction: data.data
      };
    } else {
      return {
        success: false,
        error: data.message || 'Payment verification failed'
      };
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get supported banks for bank transfer
export const getBanks = async (currency = 'NGN') => {
  try {
    const response = await fetch(`https://api.paystack.co/bank?currency=${currency}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (data.status) {
      return {
        success: true,
        banks: data.data
      };
    } else {
      return {
        success: false,
        error: data.message || 'Failed to fetch banks'
      };
    }
  } catch (error) {
    console.error('Get banks error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Format amount for display
export const formatAmount = (amount, currency = 'NGN') => {
  const currencyMap = {
    NGN: 'NGN',
    USD: 'USD',
    KES: 'KES',
    GHS: 'GHS'
  };

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyMap[currency] || currency,
    minimumFractionDigits: 2
  }).format(amount);
};

// Validate payment amount
export const validatePaymentAmount = (amount, currency = 'NGN') => {
  const limits = {
    NGN: { min: 100, max: 10000000 }, // 1 NGN to 100,000 NGN
    USD: { min: 1, max: 10000 },
    KES: { min: 10, max: 1000000 },
    GHS: { min: 1, max: 100000 }
  };
  
  const { min, max } = limits[currency] || limits.NGN;
  
  if (amount < min) {
    return {
      valid: false,
      error: `Minimum amount is ${formatAmount(min, currency)}`
    };
  }
  
  if (amount > max) {
    return {
      valid: false,
      error: `Maximum amount is ${formatAmount(max, currency)}`
    };
  }
  
  return { valid: true };
};

export default {
  generateTransactionRef,
  convertCurrency,
  convertToKobo,
  createPaystackConfig,
  initializePayment,
  initializePaystackTransaction,
  verifyPayment,
  getBanks,
  formatAmount,
  validatePaymentAmount
}; 