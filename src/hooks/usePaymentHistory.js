import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const usePaymentHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Fetch transaction history
  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setTransactions(data || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err.message);
      toast.error('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Add new transaction to history
  const addTransaction = useCallback(async (transactionData) => {
    if (!user) return null;

    setLoading(true);
    try {
      const transaction = {
        id: transactionData.reference || transactionData.tx_ref || `TXN-${Date.now()}`,
        user_id: user.id,
        amount: transactionData.amount,
        currency: transactionData.currency || 'NGN',
        payment_method: 'paystack',
        status: transactionData.status || 'pending',
        transaction_ref: transactionData.reference || transactionData.tx_ref,
        email: transactionData.email || user.email,
        phone: transactionData.phone || null,
        metadata: transactionData.metadata || {},
        created_at: new Date().toISOString()
      };

      const { data, error: insertError } = await supabase
        .from('transactions')
        .insert([transaction])
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      // Add to local state
      setTransactions(prev => [data, ...prev]);
      
      return data;
    } catch (err) {
      console.error('Error adding transaction:', err);
      setError(err.message);
      toast.error('Failed to save transaction record');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Update transaction status
  const updateTransactionStatus = useCallback(async (transactionId, status, additionalData = {}) => {
    setLoading(true);
    try {
      const updateData = {
        status,
        updated_at: new Date().toISOString(),
        ...additionalData
      };

      const { data, error: updateError } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', transactionId)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Update local state
      setTransactions(prev => 
        prev.map(transaction => 
          transaction.id === transactionId ? { ...transaction, ...updateData } : transaction
        )
      );

      return data;
    } catch (err) {
      console.error('Error updating transaction:', err);
      setError(err.message);
      toast.error('Failed to update transaction status');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Get transaction statistics
  const getTransactionStats = useCallback(() => {
    const stats = transactions.reduce((acc, transaction) => {
      acc.total += 1;
      
      if (transaction.status === 'completed' || transaction.status === 'success') {
        acc.successful += 1;
        acc.totalAmount += parseFloat(transaction.amount || 0);
      } else if (transaction.status === 'failed') {
        acc.failed += 1;
      } else if (transaction.status === 'pending') {
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
  }, [transactions]);

  // Handle Paystack payment completion
  const handlePaystackPaymentComplete = useCallback(async (paystackResponse, originalAmount) => {
    try {
      const transactionData = {
        reference: paystackResponse.reference || `PSK-${Date.now()}`,
        amount: originalAmount,
        currency: paystackResponse.currency || 'NGN',
        payment_method: 'paystack',
        status: paystackResponse.status === 'success' ? 'completed' : 'failed',
        email: paystackResponse.customer?.email || user?.email,
        phone: paystackResponse.customer?.phone || null,
        metadata: {
          paystack_response: paystackResponse,
          description: 'Paystack payment completion'
        }
      };

      const addedTransaction = await addTransaction(transactionData);
      
      if (paystackResponse.status === 'success') {
        toast.success(`Payment of ${paystackResponse.currency} ${originalAmount} completed successfully!`);
      } else {
        toast.error('Payment failed. Please try again.');
      }

      return addedTransaction;
    } catch (error) {
      console.error('Error handling Paystack payment completion:', error);
      toast.error('Error processing payment completion');
      return null;
    }
  }, [addTransaction, user]);

  // Clear transaction history (for testing)
  const clearTransactionHistory = useCallback(async () => {
    if (!user) return;
    
    try {
      const { error: deleteError } = await supabase
        .from('transactions')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      setTransactions([]);
      toast.success('Transaction history cleared');
    } catch (err) {
      console.error('Error clearing transaction history:', err);
      setError(err.message);
      toast.error('Failed to clear transaction history');
    }
  }, [user]);

  // Auto-fetch on mount and user change
  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user, fetchTransactions]);

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    addTransaction,
    updateTransactionStatus,
    getTransactionStats,
    handlePaystackPaymentComplete,
    clearTransactionHistory
  };
}; 