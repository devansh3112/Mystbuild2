// Flutterwave/M-Pesa Payment Integration for Mystery Publishers
import { config } from './config.js';

const FLUTTERWAVE_PUBLIC_KEY = config.flutterwave.publicKey;
const FLUTTERWAVE_SECRET_KEY = config.flutterwave.secretKey;

export const paymentMethods = {
  MPESA: 'mpesa',
  CARD: 'card',
  BANK_TRANSFER: 'banktransfer',
  MOBILE_MONEY: 'mobilemoney'
};

// Generate a unique transaction reference
export const generateTransactionRef = () => {
  return `myst_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Format phone number for M-Pesa (ensure it starts with country code)
export const formatMpesaPhone = (phone, countryCode = '+254') => {
  // Remove any non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // If it starts with 0, replace with country code
  if (cleanPhone.startsWith('0')) {
    return countryCode + cleanPhone.substring(1);
  }
  
  // If it doesn't start with country code, add it
  if (!cleanPhone.startsWith(countryCode.replace('+', ''))) {
    return countryCode + cleanPhone;
  }
  
  return '+' + cleanPhone;
};

// Create Flutterwave payment configuration
export const createFlutterwaveConfig = ({
  amount,
  currency = 'KES',
  email,
  phoneNumber,
  name,
  title,
  description,
  paymentMethod = paymentMethods.MPESA,
  redirectUrl,
  onSuccess,
  onError,
  onClose
}) => {
  const txRef = generateTransactionRef();
  
  const config = {
    public_key: FLUTTERWAVE_PUBLIC_KEY,
    tx_ref: txRef,
    amount: amount,
    currency: currency,
    payment_options: paymentMethod,
    customer: {
      email: email,
      phone_number: formatMpesaPhone(phoneNumber),
      name: name,
    },
    customizations: {
      title: title || 'Mystery Publishers Payment',
      description: description || 'Payment for publishing services',
      logo: '/logo.png', // Add your logo here
    },
    redirect_url: redirectUrl,
    callback: onSuccess,
    onclose: onClose,
    meta: {
      platform: 'mystery_publishers',
      source: 'web_app',
      timestamp: new Date().toISOString()
    }
  };

  return config;
};

// Process M-Pesa payment specifically
export const processMpesaPayment = async ({
  amount,
  phoneNumber,
  email,
  name,
  description,
  onSuccess,
  onError,
  onClose
}) => {
  try {
    const config = createFlutterwaveConfig({
      amount,
      currency: 'KES',
      email,
      phoneNumber,
      name,
      description,
      paymentMethod: 'mpesa',
      onSuccess: (response) => {
        console.log('M-Pesa payment successful:', response);
        if (onSuccess) onSuccess(response);
      },
      onError: (error) => {
        console.error('M-Pesa payment error:', error);
        if (onError) onError(error);
      },
      onClose: () => {
        console.log('M-Pesa payment modal closed');
        if (onClose) onClose();
      }
    });

    return config;
  } catch (error) {
    console.error('Error processing M-Pesa payment:', error);
    if (onError) onError(error);
    throw error;
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

    if (!response.ok) {
      throw new Error('Failed to verify payment');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Payment verification error:', error);
    throw error;
  }
};

// Currency conversion utilities
export const currencyRates = config.currency.rates;

export const convertUsdToKes = (usdAmount) => {
  return Math.round(usdAmount * currencyRates.USD_TO_KES);
};

export const convertKesToUsd = (kesAmount) => {
  return Math.round(kesAmount * currencyRates.KES_TO_USD * 100) / 100;
};

// Payment validation
export const validatePaymentData = (paymentData) => {
  const { amount, email, phoneNumber, name } = paymentData;
  
  const errors = [];
  
  if (!amount || amount <= 0) {
    errors.push('Amount must be greater than 0');
  }
  
  if (!email || !email.includes('@')) {
    errors.push('Valid email address is required');
  }
  
  if (!phoneNumber || phoneNumber.length < 10) {
    errors.push('Valid phone number is required');
  }
  
  if (!name || name.trim().length < 2) {
    errors.push('Name is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Payment status constants
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCESSFUL: 'successful',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  PROCESSING: 'processing'
};

// Create payment record for database
export const createPaymentRecord = (paymentData, transactionRef) => {
  return {
    id: transactionRef,
    amount: paymentData.amount,
    currency: paymentData.currency || 'KES',
    payment_method: paymentData.paymentMethod || 'mpesa',
    customer_email: paymentData.email,
    customer_phone: paymentData.phoneNumber,
    customer_name: paymentData.name,
    description: paymentData.description,
    status: PAYMENT_STATUS.PENDING,
    created_at: new Date().toISOString(),
    metadata: {
      platform: 'mystery_publishers',
      source: 'web_app'
    }
  };
}; 