import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const usePaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Fetch payment history
  const fetchPayments = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('payments')
        .select(`
          *,
          profiles:user_id (
            name,
            email
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setPayments(data || []);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError(err.message);
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Add new payment to history
  const addPayment = useCallback(async (paymentData) => {
    if (!user) return null;

    setLoading(true);
    try {
      const payment = {
        id: paymentData.tx_ref || `FLW-${Date.now()}`,
        user_id: user.id,
        amount: paymentData.amount,
        currency: paymentData.currency || 'USD',
        payment_method: 'flutterwave',
        payment_provider: paymentData.payment_provider || 'flutterwave',
        status: paymentData.status || 'pending',
        description: paymentData.description || 'Payment for services',
        customer_email: paymentData.customer?.email || user.email,
        customer_phone: paymentData.customer?.phone_number || '',
        customer_name: paymentData.customer?.name || user.name,
        transaction_id: paymentData.transaction_id || null,
        created_at: new Date().toISOString(),
        flutterwave_data: paymentData.flutterwave_response || null
      };

      const { data, error: insertError } = await supabase
        .from('payments')
        .insert([payment])
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      // Add to local state
      setPayments(prev => [data, ...prev]);
      
      return data;
    } catch (err) {
      console.error('Error adding payment:', err);
      setError(err.message);
      toast.error('Failed to save payment record');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Update payment status
  const updatePaymentStatus = useCallback(async (paymentId, status, additionalData = {}) => {
    setLoading(true);
    try {
      const updateData = {
        status,
        updated_at: new Date().toISOString(),
        ...additionalData
      };

      const { data, error: updateError } = await supabase
        .from('payments')
        .update(updateData)
        .eq('id', paymentId)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Update local state
      setPayments(prev => 
        prev.map(payment => 
          payment.id === paymentId ? { ...payment, ...updateData } : payment
        )
      );

      return data;
    } catch (err) {
      console.error('Error updating payment:', err);
      setError(err.message);
      toast.error('Failed to update payment status');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Get payment statistics
  const getPaymentStats = useCallback(() => {
    const stats = payments.reduce((acc, payment) => {
      acc.total += 1;
      
      if (payment.status === 'completed') {
        acc.successful += 1;
        acc.totalAmount += parseFloat(payment.amount || 0);
      } else if (payment.status === 'failed') {
        acc.failed += 1;
      } else if (payment.status === 'pending') {
        acc.pending += 1;
      }
      
      return acc;
    }, {
      total: 0,
      successful: 0,
      failed: 0,
      pending: 0,
      totalAmount: 0
    });

    return stats;
  }, [payments]);

  // Handle M-Pesa payment completion (via Flutterwave)
  const handleMpesaPaymentComplete = useCallback(async (flutterwaveResponse, originalAmount) => {
    try {
      const paymentData = {
        id: flutterwaveResponse.tx_ref || flutterwaveResponse.reference || `FLW-${Date.now()}`,
        amount: originalAmount,
        currency: flutterwaveResponse.currency || 'KES',
        payment_method: 'mpesa',
        payment_provider: 'flutterwave',
        transaction_id: flutterwaveResponse.transaction_id || flutterwaveResponse.reference,
        status: flutterwaveResponse.status === 'successful' ? 'successful' : 'failed',
        customer_phone: flutterwaveResponse.customer?.phone_number || flutterwaveResponse.phone_number,
        description: 'M-Pesa deposit via Flutterwave',
        created_at: new Date().toISOString(),
        flutterwave_response: flutterwaveResponse,
      };

      const addedPayment = await addPayment(paymentData);
      
      if (flutterwaveResponse.status === 'successful') {
        toast.success(`M-Pesa payment of ${flutterwaveResponse.currency} ${originalAmount} completed successfully!`);
      } else {
        toast.error('M-Pesa payment failed. Please try again.');
      }

      return addedPayment;
    } catch (error) {
      console.error('Error handling M-Pesa payment completion:', error);
      toast.error('Error processing payment completion');
      return null;
    }
  }, [addPayment]);

  // Clear payment history (for testing)
  const clearPaymentHistory = useCallback(async () => {
    if (!user) return;
    
    try {
      const { error: deleteError } = await supabase
        .from('payments')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      setPayments([]);
      toast.success('Payment history cleared');
    } catch (err) {
      console.error('Error clearing payment history:', err);
      setError(err.message);
      toast.error('Failed to clear payment history');
    }
  }, [user]);

  // Format payment for display
  const formatPayment = useCallback((payment) => {
    return {
      ...payment,
      formattedAmount: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: payment.currency || 'USD'
      }).format(payment.amount),
      formattedDate: new Date(payment.created_at).toLocaleDateString(),
      formattedDateTime: new Date(payment.created_at).toLocaleString(),
      statusColor: {
        completed: 'text-green-600',
        successful: 'text-green-600',
        pending: 'text-yellow-600',
        failed: 'text-red-600',
        cancelled: 'text-gray-600'
      }[payment.status] || 'text-gray-600'
    };
  }, []);

  // Load payments on component mount
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return {
    payments: payments.map(formatPayment),
    loading,
    error,
    stats: getPaymentStats(),
    fetchPayments,
    addPayment,
    updatePaymentStatus,
    handleMpesaPaymentComplete,
    clearPaymentHistory,
    formatPayment
  };
}; 