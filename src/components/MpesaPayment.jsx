import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { usePayments } from '@/hooks/usePayments';
import { Smartphone, DollarSign, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const MpesaPayment = ({ 
  amount, 
  currency = 'USD',
  description = 'Mystery Publishers Payment',
  onSuccess,
  onError,
  disabled = false 
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isValidPhone, setIsValidPhone] = useState(false);
  
  
  const {
    isProcessing,
    paymentStatus,
    processMpesaDeposit,
    resetPaymentState,
    convertUsdToKes
  } = usePayments();

  // Format and validate phone number
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    // Format as Kenyan number
    let formattedPhone = value;
    if (value.startsWith('0')) {
      formattedPhone = '254' + value.substring(1);
    } else if (!value.startsWith('254')) {
      formattedPhone = '254' + value;
    }
    
    setPhoneNumber(formattedPhone);
    
    // Validate phone number (should be 12 digits for Kenya: 254xxxxxxxxx)
    setIsValidPhone(formattedPhone.length === 12 && formattedPhone.startsWith('254'));
  };

  // Format phone number display
  const formatPhoneDisplay = (phone) => {
    if (phone.length === 12 && phone.startsWith('254')) {
      return `+${phone.substring(0, 3)} ${phone.substring(3, 6)} ${phone.substring(6, 9)} ${phone.substring(9)}`;
    }
    return phone;
  };

  const handlePayment = async () => {
    if (!isValidPhone) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid Kenyan phone number (e.g., 0712345678)",
        variant: "destructive"
      });
      return;
    }

    try {
      // Use the processMpesaDeposit from usePayments hook
      await processMpesaDeposit(amount, phoneNumber);
      
      toast.success("Please check your phone for the M-Pesa prompt");
      
      if (onSuccess) {
        onSuccess({
          reference: `MP-${Date.now()}`,
          status: 'successful',
          amount: amount,
          currency: currency,
          phone_number: phoneNumber
        });
      }
    } catch (error) {
      console.error('M-Pesa payment error:', error);
      toast.error("Your M-Pesa payment could not be processed. Please try again.");
      if (onError) onError(error);
    }
  };

  const kesAmount = currency === 'USD' ? convertUsdToKes(amount) : amount;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Smartphone className="w-8 h-8 text-green-600" />
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          <span>M-Pesa Payment</span>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Safaricom
          </Badge>
        </CardTitle>
        <CardDescription>
          Pay securely using your M-Pesa mobile money
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Payment Amount */}
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <div className="flex items-center justify-center gap-2 text-2xl font-bold">
            <DollarSign className="w-6 h-6 text-green-600" />
            <span>{currency} {amount}</span>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            ≈ KES {kesAmount.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {description}
          </div>
        </div>

        {/* Phone Number Input */}
        <div className="space-y-2">
          <Label htmlFor="mpesa-phone">M-Pesa Phone Number</Label>
          <div className="relative">
            <Input
              id="mpesa-phone"
              type="tel"
              placeholder="0712345678"
              value={phoneNumber ? formatPhoneDisplay(phoneNumber) : ''}
              onChange={handlePhoneChange}
              className={`pl-12 ${isValidPhone ? 'border-green-500' : ''}`}
              disabled={isProcessing || disabled}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              🇰🇪
            </div>
            {isValidPhone && (
              <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
            )}
          </div>
          <div className="text-xs text-gray-600">
            Enter your Safaricom M-Pesa number (e.g., 0712345678)
          </div>
        </div>

        {/* Payment Process Status */}
        {isProcessing && (
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            <div className="text-sm font-medium text-blue-800">Processing Payment...</div>
            <div className="text-xs text-blue-600 mt-1">
              Please check your phone for the M-Pesa prompt
            </div>
          </div>
        )}

        {/* Payment Instructions */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-800 mb-2">How M-Pesa Payment Works:</h4>
          <ol className="text-sm text-green-700 space-y-1">
            <li>1. Enter your M-Pesa phone number</li>
            <li>2. Click "Pay with M-Pesa"</li>
            <li>3. You'll receive an STK push on your phone</li>
            <li>4. Enter your M-Pesa PIN to complete payment</li>
          </ol>
        </div>
      </CardContent>

      <CardFooter>
        <Button 
          onClick={handlePayment}
          disabled={!isValidPhone || isProcessing || disabled}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            <>
              <Smartphone className="w-4 h-4 mr-2" />
              Pay KES {kesAmount.toLocaleString()} with M-Pesa
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MpesaPayment; 