import React, { useState } from 'react';
import { usePaystackPayment } from 'react-paystack';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CreditCard, Smartphone, Building2, Banknote } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { formatAmount, generateTransactionRef } from "@/lib/payments";

// Local validation function since import might be causing issues
const validatePaymentAmount = (amount, currency = 'NGN') => {
  if (!amount || amount <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }
  
  const minAmounts = {
    NGN: 100,
    USD: 1,
    GHS: 1,
    KES: 10
  };
  
  const minAmount = minAmounts[currency] || 100;
  
  if (amount < minAmount) {
    return { valid: false, error: `Minimum amount is ${currency} ${minAmount}` };
  }
  
  return { valid: true };
};

const PaystackPayment = ({ 
  amount = 100, 
  onSuccess = () => {}, 
  onError = () => {},
  currency = "NGN",
  description = "Payment for manuscript services",
  manuscriptId = null
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [selectedCurrency, setSelectedCurrency] = useState(currency);
  const [paymentAmount, setPaymentAmount] = useState(amount);

  // Get Paystack public key with fallback
  const paystackPublicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_2448cc156decb57761a7af852d830c3e41fdbee7';
  
  console.log('Paystack Public Key loaded:', paystackPublicKey);
  console.log('All env vars:', import.meta.env);
  
  // Check if Paystack key is available
  if (!paystackPublicKey || paystackPublicKey === 'undefined') {
    console.error('Paystack public key is not configured properly');
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Payment Configuration Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Payment system is not properly configured. Please contact support.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Initialize Paystack payment
  const paystackConfig = {
    reference: generateTransactionRef(),
    email: email,
    amount: Math.round(paymentAmount * 100), // Convert to smallest currency unit
    currency: selectedCurrency,
    publicKey: paystackPublicKey,
    text: 'Pay Now',
    onSuccess: (reference) => {
      console.log('Payment successful:', reference);
      handlePaymentSuccess(reference);
    },
    onClose: () => {
      console.log('Payment dialog closed');
      setLoading(false);
      toast.info("Payment cancelled");
    },
    metadata: {
      custom_fields: [
        {
          display_name: "Customer Name",
          variable_name: "customer_name",
          value: fullName
        },
        {
          display_name: "Phone Number",
          variable_name: "phone_number",
          value: phone
        }
      ],
      platform: 'web',
      source: 'mystery-publishers',
      description: description,
      manuscript_id: manuscriptId
    },
    channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer']
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  const handlePaymentSuccess = async (reference) => {
    try {
      setLoading(true);

      // Save transaction to database
      const transactionData = {
        id: reference.reference,
        user_id: user?.id,
        amount: paymentAmount,
        currency: selectedCurrency,
        status: 'completed',
        payment_method: 'paystack',
        transaction_ref: reference.reference,
        email: email,
        phone: phone || null,
        manuscript_id: manuscriptId,
        metadata: {
          reference: reference,
          description: description,
          manuscript_id: manuscriptId
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
        toast.error("Payment successful but failed to save transaction record");
      } else {
        toast.success("Payment completed successfully!");
        onSuccess(reference, data);
      }
    } catch (error) {
      console.error('Error in payment success handler:', error);
      toast.error("Payment successful but failed to process");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setLoading(false);
    toast.error("Payment failed. Please try again.");
    onError(error);
  };

  const validateForm = () => {
    if (!email) {
      toast.error("Email is required");
      return false;
    }

    if (!fullName) {
      toast.error("Full name is required");
      return false;
    }

    const validation = validatePaymentAmount(paymentAmount, selectedCurrency);
    if (!validation.valid) {
      toast.error(validation.error);
      return false;
    }

    return true;
  };

  const handlePayment = () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      initializePayment();
    } catch (error) {
      handlePaymentError(error);
    }
  };

  const supportedCurrencies = [
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵' },
    { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' }
  ];

  const paymentMethods = [
    { id: 'card', name: 'Debit/Credit Card', icon: CreditCard, description: 'Visa, Mastercard, Verve' },
    { id: 'bank', name: 'Bank Transfer', icon: Building2, description: 'Direct bank transfer' },
    { id: 'ussd', name: 'USSD', icon: Smartphone, description: 'Pay with USSD code' },
    { id: 'mobile_money', name: 'Mobile Money', icon: Smartphone, description: 'MTN, Airtel, etc.' }
  ];

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Paystack Payment
        </CardTitle>
        <CardDescription>
          Secure payment powered by Paystack
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Amount and Currency */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
              min="1"
              step="0.01"
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {supportedCurrencies.map((curr) => (
                  <SelectItem key={curr.code} value={curr.code}>
                    {curr.symbol} {curr.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Payment Amount Display */}
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">You will pay</p>
          <p className="text-2xl font-bold text-primary">
            {formatAmount(paymentAmount, selectedCurrency)}
          </p>
        </div>

        {/* Customer Information */}
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+234 800 000 0000"
            />
          </div>
        </div>

        {/* Payment Methods Info */}
        <div className="space-y-2">
          <Label>Available Payment Methods</Label>
          <div className="grid grid-cols-2 gap-2">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                <method.icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium">{method.name}</p>
                  <p className="text-xs text-muted-foreground">{method.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Notice */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Your payment is secured by Paystack with 256-bit SSL encryption. We don't store your card details.
          </AlertDescription>
        </Alert>

        {/* Payment Button */}
        <Button 
          onClick={handlePayment}
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Banknote className="h-4 w-4" />
              Pay {formatAmount(paymentAmount, selectedCurrency)}
            </div>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </CardContent>
    </Card>
  );
};

export default PaystackPayment; 