import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export const usePaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch payment history for the current user
  const fetchPayments = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      // Publishers can see all payments, others see only their own
      if (user.role !== 'publisher') {
        query = query.eq('user_id', user.id);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setPayments(data || []);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Create a new payment record
  const createPayment = useCallback(async (paymentData) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const paymentRecord = {
        id: paymentData.id || `payment_${Date.now()}`,
        user_id: user.id,
        amount: paymentData.amount,
        currency: paymentData.currency || 'USD',
        payment_method: paymentData.payment_method || 'mpesa',
        payment_provider: paymentData.payment_provider || 'flutterwave',
        transaction_id: paymentData.transaction_id,
        status: paymentData.status || 'pending',
        customer_email: paymentData.customer_email || user.email,
        customer_phone: paymentData.customer_phone,
        customer_name: paymentData.customer_name || user.name,
        description: paymentData.description,
        metadata: paymentData.metadata || {},
        created_at: new Date().toISOString(),
        completed_at: paymentData.status === 'successful' ? new Date().toISOString() : null
      };

      const { data, error: insertError } = await supabase
        .from('payments')
        .insert([paymentRecord])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Add to local state
      setPayments(prev => [data, ...prev]);

      return data;
    } catch (err) {
      console.error('Error creating payment:', err);
      throw err;
    }
  }, [user]);

  // Update payment status
  const updatePaymentStatus = useCallback(async (paymentId, status, additionalData = {}) => {
    try {
      const updateData = {
        status,
        ...additionalData
      };

      if (status === 'successful') {
        updateData.completed_at = new Date().toISOString();
      } else if (status === 'failed') {
        updateData.failed_at = new Date().toISOString();
      }

      const { data, error: updateError } = await supabase
        .from('payments')
        .update(updateData)
        .eq('id', paymentId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setPayments(prev => 
        prev.map(payment => 
          payment.id === paymentId ? { ...payment, ...data } : payment
        )
      );

      return data;
    } catch (err) {
      console.error('Error updating payment status:', err);
      throw err;
    }
  }, []);

  // Get payment statistics
  const getPaymentStats = useCallback(() => {
    const totalSuccessful = payments
      .filter(p => p.status === 'successful')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const totalPending = payments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const totalFailed = payments
      .filter(p => p.status === 'failed')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const mpesaPayments = payments.filter(p => p.payment_method === 'mpesa');
    const cardPayments = payments.filter(p => p.payment_method === 'card');

    return {
      total: payments.length,
      successful: payments.filter(p => p.status === 'successful').length,
      pending: payments.filter(p => p.status === 'pending').length,
      failed: payments.filter(p => p.status === 'failed').length,
      totalAmount: totalSuccessful,
      pendingAmount: totalPending,
      failedAmount: totalFailed,
      mpesaCount: mpesaPayments.length,
      cardCount: cardPayments.length,
      mpesaAmount: mpesaPayments
        .filter(p => p.status === 'successful')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0),
      cardAmount: cardPayments
        .filter(p => p.status === 'successful')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0)
    };
  }, [payments]);

  // Get recent payments
  const getRecentPayments = useCallback((limit = 5) => {
    return payments.slice(0, limit);
  }, [payments]);

  // Get payments by method
  const getPaymentsByMethod = useCallback((method) => {
    return payments.filter(p => p.payment_method === method);
  }, [payments]);

  // Get payments by status
  const getPaymentsByStatus = useCallback((status) => {
    return payments.filter(p => p.status === status);
  }, [payments]);

  // Handle M-Pesa payment completion
  const handleMpesaPaymentComplete = useCallback(async (flutterwaveResponse, originalAmount) => {
    try {
      const paymentRecord = await createPayment({
        id: flutterwaveResponse.tx_ref,
        amount: originalAmount,
        currency: 'USD',
        payment_method: 'mpesa',
        payment_provider: 'flutterwave',
        transaction_id: flutterwaveResponse.transaction_id,
        status: flutterwaveResponse.status === 'successful' ? 'successful' : 'failed',
        customer_phone: flutterwaveResponse.customer?.phone_number,
        description: `M-Pesa deposit - $${originalAmount}`,
        metadata: {
          flutterwave_response: flutterwaveResponse,
          conversion_rate: 150, // USD to KES rate
          kes_amount: originalAmount * 150
        }
      });

      if (flutterwaveResponse.status === 'successful') {
        toast({
          title: "Payment Recorded",
          description: `M-Pesa payment of $${originalAmount} has been recorded successfully.`,
        });
      }

      return paymentRecord;
    } catch (err) {
      console.error('Error handling M-Pesa payment completion:', err);
      toast({
        title: "Error",
        description: "Payment was processed but could not be recorded. Please contact support.",
        variant: "destructive"
      });
      throw err;
    }
  }, [createPayment, toast]);

  // Load payments on mount and when user changes
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return {
    // State
    payments,
    isLoading,
    error,
    
    // Methods
    fetchPayments,
    createPayment,
    updatePaymentStatus,
    handleMpesaPaymentComplete,
    
    // Utilities
    getPaymentStats,
    getRecentPayments,
    getPaymentsByMethod,
    getPaymentsByStatus,
    
    // Computed values
    stats: getPaymentStats(),
    recentPayments: getRecentPayments(),
    mpesaPayments: getPaymentsByMethod('mpesa'),
    cardPayments: getPaymentsByMethod('card'),
    pendingPayments: getPaymentsByStatus('pending'),
    successfulPayments: getPaymentsByStatus('successful'),
    failedPayments: getPaymentsByStatus('failed')
  };
}; 