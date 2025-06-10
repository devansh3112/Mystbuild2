import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  generateTransactionRef,
  initializePaystackTransaction,
  verifyPayment,
  validatePaymentAmount
} from '@/lib/payments';
import { toast } from 'sonner';

export const usePayments = () => {
  const [loading, setLoading] = useState(false);

  const processPayment = useCallback(async (paymentData) => {
    setLoading(true);
    try {
      const {
        amount,
        currency = 'NGN',
        email,
        phone,
        name,
        description = 'Payment for manuscript services',
        user_id
      } = paymentData;

      // Validate payment amount
      const validation = validatePaymentAmount(amount, currency);
      if (!validation.valid) {
        toast.error(validation.error);
        return { success: false, error: validation.error };
      }

      // Generate transaction reference
      const reference = generateTransactionRef();

      // Initialize payment with Paystack
      const paymentResult = await initializePaystackTransaction({
        amount,
        email,
        currency,
        reference,
        metadata: {
          user_id,
          phone,
          name,
          description
        }
      });

      if (!paymentResult.success) {
        toast.error(paymentResult.error || 'Failed to initialize payment');
        return paymentResult;
      }

      // Save transaction to database
      const transactionData = {
        id: reference,
        user_id,
        amount,
        currency,
        status: 'pending',
        payment_method: 'paystack',
        transaction_ref: reference,
        email,
        phone: phone || null,
        metadata: {
          paystack_reference: reference,
          authorization_url: paymentResult.authorization_url,
          access_code: paymentResult.access_code,
          description
        },
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('transactions')
        .insert([transactionData])
        .select()
        .single();

      if (error) {
        console.error('Error saving transaction:', error);
        toast.error('Payment initialized but failed to save transaction');
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data,
        reference,
        authorization_url: paymentResult.authorization_url,
        access_code: paymentResult.access_code
      };

    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error('An error occurred while processing payment');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyPaymentStatus = useCallback(async (reference) => {
    setLoading(true);
    try {
      // Verify with Paystack
      const verification = await verifyPayment(reference);

      if (!verification.success) {
        return { success: false, error: verification.error };
      }

      const transaction = verification.transaction;
      
      // Update transaction in database
      const { data, error } = await supabase
        .from('transactions')
        .update({
          status: transaction.status === 'success' ? 'completed' : 'failed',
          metadata: {
            ...transaction,
            verified_at: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq('transaction_ref', reference)
        .select()
        .single();

      if (error) {
        console.error('Error updating transaction:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data,
        transaction,
        status: transaction.status
      };

    } catch (error) {
      console.error('Payment verification error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const getPaymentHistory = useCallback(async (userId, limit = 20) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching payment history:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };

    } catch (error) {
      console.error('Error in getPaymentHistory:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelPayment = useCallback(async (reference) => {
    setLoading(true);
    try {
      // Update transaction status to cancelled
      const { data, error } = await supabase
        .from('transactions')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('transaction_ref', reference)
        .select()
        .single();

      if (error) {
        console.error('Error cancelling payment:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };

    } catch (error) {
      console.error('Error in cancelPayment:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const refundPayment = useCallback(async (reference, reason = '') => {
    setLoading(true);
    try {
      // Note: Paystack refunds require API calls to their refund endpoint
      // This is a placeholder for the refund logic
      console.log('Refund initiated for:', reference, reason);

      // Update transaction status to refunded
      const { data, error } = await supabase
        .from('transactions')
        .update({
          status: 'refunded',
          metadata: {
            refund_reason: reason,
            refunded_at: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq('transaction_ref', reference)
        .select()
        .single();

      if (error) {
        console.error('Error processing refund:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };

    } catch (error) {
      console.error('Error in refundPayment:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    processPayment,
    verifyPaymentStatus,
    getPaymentHistory,
    cancelPayment,
    refundPayment
  };
}; 