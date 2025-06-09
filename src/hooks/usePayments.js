import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  createPaystackConfig,
  processMpesaPayment,
  verifyPayment,
  validatePaymentData,
  convertUsdToKes,
  convertKesToUsd,
  createPaymentRecord,
  PAYMENT_STATUS
} from '@/lib/payments';

export const usePayments = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const { toast } = useToast();
  const { user, updateUserBalance } = useAuth();

  // Initialize payment processing
  const processPayment = useCallback(async (paymentData) => {
    try {
      setIsProcessing(true);
      setPaymentStatus(PAYMENT_STATUS.PROCESSING);

      // Validate payment data
      const validation = validatePaymentData(paymentData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Convert USD to KES for M-Pesa (if needed)
      const kesAmount = paymentData.currency === 'USD' 
        ? convertUsdToKes(paymentData.amount)
        : paymentData.amount;

      // Create payment configuration
      const config = createPaystackConfig({
        amount: kesAmount,
        currency: 'KES',
        email: paymentData.email || user?.email || 'user@mystpublishers.com',
        phoneNumber: paymentData.phoneNumber,
        name: paymentData.name || user?.name || 'Mystery Publishers User',
        description: paymentData.description || 'Mystery Publishers Payment',
        paymentMethod: 'mpesa',
        onSuccess: (response) => handlePaymentSuccess(response, paymentData),
        onError: handlePaymentError,
        onClose: handlePaymentClose
      });

      setCurrentTransaction(config.tx_ref);
      return config;

    } catch (error) {
      handlePaymentError(error);
      throw error;
    }
  }, [user, toast]);

  // Handle successful payment
  const handlePaymentSuccess = useCallback(async (response, originalPaymentData) => {
    try {
      console.log('Payment successful:', response);
      
      // Verify the payment with Paystack
      const verification = await verifyPayment(response.transaction_id);
      
      if (verification.status === 'success' && verification.data.status === 'successful') {
        // Convert back to USD if original was in USD
        const finalAmount = originalPaymentData.currency === 'USD' 
          ? originalPaymentData.amount 
          : convertKesToUsd(response.amount);

        // Update user balance
        if (originalPaymentData.type === 'deposit') {
          updateUserBalance(finalAmount);
        }

        setPaymentStatus(PAYMENT_STATUS.SUCCESSFUL);
        
        toast({
          title: "Payment Successful!",
          description: `Your M-Pesa payment of ${originalPaymentData.currency === 'USD' ? '$' : 'KES '}${originalPaymentData.amount} has been processed successfully.`,
          variant: "default"
        });

        // Create payment record for history
        const paymentRecord = {
          ...createPaymentRecord(originalPaymentData, response.tx_ref),
          transaction_id: response.transaction_id,
          status: PAYMENT_STATUS.SUCCESSFUL,
          completed_at: new Date().toISOString(),
          paystack_data: verification.data
        };

        return paymentRecord;
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Error handling payment success:', error);
      handlePaymentError(error);
    } finally {
      setIsProcessing(false);
    }
  }, [updateUserBalance, toast]);

  // Handle payment error
  const handlePaymentError = useCallback((error) => {
    console.error('Payment error:', error);
    setPaymentStatus(PAYMENT_STATUS.FAILED);
    setIsProcessing(false);
    
    toast({
      title: "Payment Failed",
      description: error.message || "There was an error processing your payment. Please try again.",
      variant: "destructive"
    });
  }, [toast]);

  // Handle payment modal close
  const handlePaymentClose = useCallback(() => {
    console.log('Payment modal closed');
    setPaymentStatus(PAYMENT_STATUS.CANCELLED);
    setIsProcessing(false);
  }, []);

  // Process M-Pesa deposit
  const processMpesaDeposit = useCallback(async (amount, phoneNumber) => {
    try {
      const paymentData = {
        amount: amount,
        currency: 'USD',
        phoneNumber: phoneNumber,
        email: user?.email,
        name: user?.name,
        description: `Account deposit - $${amount}`,
        type: 'deposit'
      };

      return await processPayment(paymentData);
    } catch (error) {
      console.error('M-Pesa deposit error:', error);
      throw error;
    }
  }, [processPayment, user]);

  // Process M-Pesa payment for services
  const processMpesaServicePayment = useCallback(async (amount, phoneNumber, serviceDescription) => {
    try {
      const paymentData = {
        amount: amount,
        currency: 'USD',
        phoneNumber: phoneNumber,
        email: user?.email,
        name: user?.name,
        description: serviceDescription,
        type: 'service_payment'
      };

      return await processPayment(paymentData);
    } catch (error) {
      console.error('M-Pesa service payment error:', error);
      throw error;
    }
  }, [processPayment, user]);

  // Reset payment state
  const resetPaymentState = useCallback(() => {
    setPaymentStatus(null);
    setCurrentTransaction(null);
    setIsProcessing(false);
  }, []);

  return {
    // State
    isProcessing,
    paymentStatus,
    currentTransaction,
    
    // Methods
    processPayment,
    processMpesaDeposit,
    processMpesaServicePayment,
    resetPaymentState,
    
    // Handlers
    handlePaymentSuccess,
    handlePaymentError,
    handlePaymentClose,
    
    // Utilities
    convertUsdToKes,
    convertKesToUsd,
    validatePaymentData
  };
}; 