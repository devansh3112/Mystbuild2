// Flutterwave/M-Pesa Payment Integration for Mystery Publishers
import config from './config.js';

const FLUTTERWAVE_PUBLIC_KEY = config.flutterwave.publicKey;
const FLUTTERWAVE_SECRET_KEY = config.flutterwave.secretKey;

// Validate environment variables
if (!FLUTTERWAVE_PUBLIC_KEY) {
  console.error('Flutterwave public key is not configured');
}

if (!FLUTTERWAVE_SECRET_KEY) {
  console.error('Flutterwave secret key is not configured');
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
    KES: 150,
  };
  
  const usdAmount = amount / exchangeRates[fromCurrency];
  return usdAmount * exchangeRates[toCurrency];
};

// Create Flutterwave payment configuration
export const createFlutterwaveConfig = ({
  amount,
  currency = 'USD',
  email,
  phone_number,
  name,
  tx_ref = null,
  callback_url = null,
  customization = {}
}) => {
  const transactionRef = tx_ref || generateTransactionRef();
  
  return {
    public_key: FLUTTERWAVE_PUBLIC_KEY,
    tx_ref: transactionRef,
    amount: amount,
    currency: currency,
    payment_options: 'mobilemoneykenya,mobilemoneyuganda,mobilemoneytanzania,card',
    customer: {
      email: email,
      phone_number: phone_number,
      name: name,
    },
    callback: callback_url || `${window.location.origin}/payment/callback`,
    customizations: {
      title: 'Mystery Publishers',
      description: 'Payment for manuscript services',
      logo: '/logo.png',
      ...customization
    },
    meta: {
      platform: 'web',
      source: 'mystery-publishers'
    }
  };
};

// Initialize payment with Flutterwave
export const initializePayment = async ({
  amount,
  email,
  phone_number,
  name,
  currency = 'USD',
  description = 'Payment for manuscript services'
}) => {
  try {
    const config = createFlutterwaveConfig({
      amount,
      currency,
      email,
      phone_number,
      name,
      customization: { description }
    });

    // Return the config for Flutterwave React component
    return {
      success: true,
      config: config,
      tx_ref: config.tx_ref
    };
  } catch (error) {
    console.error('Payment initialization error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Verify payment with Flutterwave
export const verifyPayment = async (transactionId) => {
  try {
    const response = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (data.status === 'success') {
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

// Format amount for display
export const formatAmount = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
};

// Validate payment amount
export const validatePaymentAmount = (amount, currency = 'USD') => {
  const minAmount = currency === 'KES' ? 10 : 1;
  const maxAmount = currency === 'KES' ? 1000000 : 10000;
  
  if (amount < minAmount) {
    return {
      valid: false,
      error: `Minimum amount is ${formatAmount(minAmount, currency)}`
    };
  }
  
  if (amount > maxAmount) {
    return {
      valid: false,
      error: `Maximum amount is ${formatAmount(maxAmount, currency)}`
    };
  }
  
  return { valid: true };
};

export default {
  generateTransactionRef,
  convertCurrency,
  createFlutterwaveConfig,
  initializePayment,
  verifyPayment,
  formatAmount,
  validatePaymentAmount
}; 