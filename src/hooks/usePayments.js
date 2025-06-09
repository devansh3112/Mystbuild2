import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  generateTransactionRef,
  createFlutterwaveConfig,
  initializePayment,
  verifyPayment
} from '@/lib/payments';
import { toast } from 'sonner';

export const usePayments = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createPayment = useCallback(async (paymentData) => {
    setLoading(true);
    setError(null);

    try {
      const txRef = generateTransactionRef();
      
      // Initialize payment with Flutterwave
      const paymentResult = await initializePayment({
        amount: paymentData.amount,
        email: paymentData.email,
        phone_number: paymentData.phone_number,
        name: paymentData.name,
        currency: paymentData.currency || 'USD',
        description: paymentData.description
      });

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Failed to initialize payment');
      }

      const config = createFlutterwaveConfig({
        amount: paymentData.amount,
        email: paymentData.email,
        phone_number: paymentData.phone_number,
        name: paymentData.name,
        currency: paymentData.currency || 'USD',
        tx_ref: txRef,
        customization: {
          description: paymentData.description || 'Payment for manuscript services'
        }
      });

      // Store payment record in database
      const { data: payment, error: dbError } = await supabase
        .from('payments')
        .insert([{
          id: txRef,
          user_id: paymentData.user_id,
          amount: paymentData.amount,
          currency: paymentData.currency || 'USD',
          payment_method: 'flutterwave',
          status: 'pending',
          description: paymentData.description,
          customer_email: paymentData.email,
          customer_phone: paymentData.phone_number,
          customer_name: paymentData.name,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error('Failed to create payment record');
      }

      setLoading(false);
      return {
        success: true,
        payment: payment,
        config: config,
        tx_ref: txRef
      };

    } catch (err) {
      console.error('Payment creation error:', err);
      setError(err.message);
      setLoading(false);
      toast.error('Failed to create payment: ' + err.message);
      return {
        success: false,
        error: err.message
      };
    }
  }, []);

  const handlePaymentCallback = useCallback(async (response) => {
    setLoading(true);
    setError(null);

    try {
      // Verify the payment with Flutterwave
      const verification = await verifyPayment(response.transaction_id);
      
      if (!verification.success) {
        throw new Error(verification.error || 'Payment verification failed');
      }

      // Update payment record in database
      const { data: payment, error: updateError } = await supabase
        .from('payments')
        .update({
          status: verification.data.status === 'successful' ? 'completed' : 'failed',
          transaction_id: response.transaction_id,
          payment_provider: 'flutterwave',
          flutterwave_data: verification.data
        })
        .eq('id', response.tx_ref)
        .select()
        .single();

      if (updateError) {
        console.error('Update error:', updateError);
        throw new Error('Failed to update payment record');
      }

      setLoading(false);
      
      if (verification.data.status === 'successful') {
        toast.success('Payment completed successfully!');
        return {
          success: true,
          payment: payment,
          transaction: verification.data
        };
      } else {
        toast.error('Payment failed. Please try again.');
        return {
          success: false,
          error: 'Payment was not successful'
        };
      }

    } catch (err) {
      console.error('Payment callback error:', err);
      setError(err.message);
      setLoading(false);
      toast.error('Payment verification failed: ' + err.message);
      return {
        success: false,
        error: err.message
      };
    }
  }, []);

  const getPaymentHistory = useCallback(async (userId) => {
    setLoading(true);
    setError(null);

    try {
      const { data: payments, error: fetchError } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw new Error('Failed to fetch payment history');
      }

      setLoading(false);
      return {
        success: true,
        payments: payments || []
      };

    } catch (err) {
      console.error('Payment history error:', err);
      setError(err.message);
      setLoading(false);
      return {
        success: false,
        error: err.message
      };
    }
  }, []);

  return {
    loading,
    error,
    createPayment,
    handlePaymentCallback,
    getPaymentHistory
  };
}; 