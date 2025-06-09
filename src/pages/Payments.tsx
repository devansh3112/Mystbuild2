import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { Wallet, Smartphone, DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { usePayments } from "@/hooks/usePayments";
import { toast } from "sonner";

// Declare Flutterwave global
declare global {
  interface Window {
    FlutterwaveCheckout: (config: any) => void;
  }
}

const Payments = () => {
  const { user } = useAuth();
  const { createPayment, loading: paymentLoading } = usePayments();
  const [balance, setBalance] = useState(0);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // M-Pesa payment states
  const [showMpesaDialog, setShowMpesaDialog] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Load user balance and payment history
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Load user profile for balance
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error loading profile:', profileError);
      } else {
        setBalance(profile?.balance || 0);
      }

      // Load payment history
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (paymentsError) {
        console.error('Error loading payments:', paymentsError);
      } else {
        setPaymentHistory(payments || []);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMpesaDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!phoneNumber) {
      toast.error("Please enter your phone number");
      return;
    }

    try {
      // Format phone number to Kenyan format
      let formattedPhone = phoneNumber.replace(/\D/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '254' + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith('254')) {
        formattedPhone = '254' + formattedPhone;
      }

      // Create payment using Flutterwave
      const paymentResult = await createPayment({
        amount: parseFloat(depositAmount),
        currency: 'USD',
        email: user.email,
        phone_number: formattedPhone,
        name: user.name || user.email,
        user_id: user.id,
        description: `Deposit to Mystery Publishers account - $${depositAmount}`
      });

      if (paymentResult.success) {
        // Redirect to Flutterwave payment portal
        const flutterwaveConfig = paymentResult.config;
        
        // Load Flutterwave script if not already loaded
        if (!window.FlutterwaveCheckout) {
          const script = document.createElement('script');
          script.src = 'https://checkout.flutterwave.com/v3.js';
          script.onload = () => {
            initiateFlutterwavePayment(flutterwaveConfig);
          };
          document.head.appendChild(script);
        } else {
          initiateFlutterwavePayment(flutterwaveConfig);
        }

        setShowMpesaDialog(false);
      } else {
        toast.error(paymentResult.error || "Failed to initiate payment");
      }
    } catch (error) {
      console.error('Error initiating M-Pesa payment:', error);
      toast.error("Failed to initiate payment. Please try again.");
    }
  };

  const initiateFlutterwavePayment = (config) => {
    window.FlutterwaveCheckout({
      ...config,
      callback: (response) => {
        console.log('Payment response:', response);
        if (response.status === 'successful') {
          handlePaymentSuccess(response);
        } else {
          toast.error("Payment was not completed successfully");
        }
      },
      onclose: () => {
        console.log('Payment dialog closed');
      }
    });
  };

  const handlePaymentSuccess = async (response) => {
    try {
      // Update user balance
      const newBalance = balance + parseFloat(depositAmount);
      
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', user.id);

      if (balanceError) {
        console.error('Error updating balance:', balanceError);
        toast.error("Payment successful but failed to update balance");
        return;
      }

      // Update payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .update({
          status: 'completed',
          transaction_id: response.transaction_id,
          payment_provider: 'flutterwave'
        })
        .eq('id', response.tx_ref);

      if (paymentError) {
        console.error('Error updating payment:', paymentError);
      }

      setBalance(newBalance);
      setDepositAmount('');
      setPhoneNumber('');
      
      toast.success(`Successfully deposited $${depositAmount} to your account!`);
      
      // Reload payment history
      loadUserData();
    } catch (error) {
      console.error('Error processing successful payment:', error);
      toast.error("Error processing payment completion");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'successful':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'successful':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <DashboardLayout role={user?.role || "writer"}>
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Center</h1>
          <p className="text-gray-600">Manage your payments and view transaction history</p>
        </div>

        {/* Balance Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-white">
                <Wallet className="h-5 w-5" />
                Account Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(balance)}</div>
              <p className="text-blue-100 text-sm mt-1">Available for use</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Total Deposits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(paymentHistory.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0))}
              </div>
              <p className="text-gray-600 text-sm mt-1">Lifetime deposits</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paymentHistory.length}</div>
              <p className="text-gray-600 text-sm mt-1">Total transactions</p>
            </CardContent>
          </Card>
        </div>

        {/* Deposit Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-green-600" />
              Deposit Funds via M-Pesa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="deposit-amount">Deposit Amount (USD)</Label>
                <Input
                  id="deposit-amount"
                  type="number"
                  placeholder="0.00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  min="1"
                  step="0.01"
                />
              </div>
              <div>
                <Label htmlFor="phone-number">M-Pesa Phone Number</Label>
                <Input
                  id="phone-number"
                  type="tel"
                  placeholder="0712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>
            <Button 
              onClick={handleMpesaDeposit}
              disabled={paymentLoading || !depositAmount || !phoneNumber}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Smartphone className="h-4 w-4 mr-2" />
              {paymentLoading ? "Processing..." : "Pay with M-Pesa"}
            </Button>
            <p className="text-sm text-gray-600">
              You will be redirected to the M-Pesa payment portal to complete your transaction securely.
            </p>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentHistory.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No payment history</h3>
                <p className="text-gray-600">Your payment transactions will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {paymentHistory.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(payment.status)}
                      <div>
                        <p className="font-medium">{payment.description || "Account Deposit"}</p>
                        <p className="text-sm text-gray-600">{formatDate(payment.created_at)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                      <p className={`text-sm capitalize ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Payments;
