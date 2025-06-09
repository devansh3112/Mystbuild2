import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, AlertCircle } from "lucide-react";
import { config } from "@/lib/config";

const PaystackPayment = ({ 
  amount, 
  email, 
  onSuccess, 
  onError, 
  onClose,
  metadata = {} 
}) => {
  const paystackPublicKey = config.paystack.publicKey;

  useEffect(() => {
    // Load Paystack inline script
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script when component unmounts
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = () => {
    if (!window.PaystackPop) {
      onError({ message: 'Paystack SDK not loaded' });
      return;
    }

    if (!paystackPublicKey) {
      onError({ message: 'Paystack public key not configured' });
      return;
    }

    const handler = window.PaystackPop.setup({
      key: paystackPublicKey,
      email: email,
      amount: amount * 100, // Paystack expects amount in kobo (cents)
      currency: 'USD',
      ref: `mp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {
        custom_fields: [
          {
            display_name: "Customer Name",
            variable_name: "customer_name",
            value: metadata.customerName || 'Unknown'
          }
        ]
      },
      callback: function(response) {
        // Payment successful
        onSuccess({
          reference: response.reference,
          status: 'success',
          amount: amount,
          currency: 'USD',
          customer: {
            email: email,
            name: metadata.customerName || 'Unknown'
          },
          transaction_id: response.reference,
          payment_provider: 'paystack'
        });
      },
      onClose: function() {
        // Payment was closed
        if (onClose) onClose();
      }
    });

    handler.openIframe();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Paystack Payment
        </CardTitle>
        <CardDescription>
          Secure payment processing via Paystack
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-2xl font-bold text-green-600">
            ${amount.toFixed(2)} USD
          </div>
        </div>

        {!paystackPublicKey && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <p className="text-sm text-amber-800">
                Paystack not configured - Please add your Paystack keys to environment variables
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Button 
            onClick={handlePayment}
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={!paystackPublicKey}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Pay ${amount.toFixed(2)} with Paystack
          </Button>
          
          <Button 
            onClick={onClose}
            variant="ghost" 
            className="w-full"
          >
            Cancel
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          Secure payment powered by Paystack
        </div>
      </CardContent>
    </Card>
  );
};

export default PaystackPayment; 