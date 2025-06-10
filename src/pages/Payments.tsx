import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { Wallet, Smartphone, DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle, Plus } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { usePayments } from "@/hooks/usePayments";
import { usePaymentHistory } from "@/hooks/usePaymentHistory";
import { AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import PaystackPayment from "@/components/PaystackPayment";

// Add FlutterwaveConfig type declaration
declare global {
  interface Window {
    FlutterwaveCheckout?: (config: any) => void;
  }
}

const EmptyTransactionsState = () => (
  <div className="text-center py-12">
    <Wallet className="mx-auto h-12 w-12 text-muted-foreground" />
    <h3 className="mt-4 text-lg font-semibold">No transactions yet</h3>
    <p className="mt-2 text-muted-foreground">
      Your payment history will appear here once you make your first transaction.
    </p>
  </div>
);

const TransactionCard = ({ transaction }: { transaction: any }) => {
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatAmount = (amount: number, currency: string = 'NGN') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon(transaction.status)}
            <div>
              <p className="font-medium">{transaction.transaction_ref || transaction.id}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(transaction.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold">
              {formatAmount(transaction.amount, transaction.currency)}
            </p>
            <p className="text-sm capitalize text-muted-foreground">
              {transaction.status}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const PaymentStats = ({ transactions }: { transactions: any[] }) => {
  const totalAmount = transactions
    .filter(t => t.status === 'completed' || t.status === 'success')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const pendingAmount = transactions
    .filter(t => t.status === 'pending')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const successfulTransactions = transactions.filter(
    t => t.status === 'completed' || t.status === 'success'
  ).length;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₦{totalAmount.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            From {successfulTransactions} successful transactions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₦{pendingAmount.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            Awaiting confirmation
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {transactions.length > 0 
              ? ((successfulTransactions / transactions.length) * 100).toFixed(1)
              : 0
            }%
          </div>
          <p className="text-xs text-muted-foreground">
            Payment success rate
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

const Payments: React.FC = () => {
  const { user } = useAuth();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  
  const { processPayment } = usePayments();
  const { transactions: paymentHistory, loading: historyLoading, fetchTransactions } = usePaymentHistory();

  useEffect(() => {
    if (paymentHistory) {
      setTransactions(paymentHistory);
    }
  }, [paymentHistory]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handlePaymentSuccess = async (reference: any, transactionData: any) => {
    console.log('Payment successful:', reference, transactionData);
    setShowPaymentDialog(false);
    setAmount("");
    setDescription("");
    
    // Refresh transaction history
    await fetchTransactions();
    
    toast.success("Payment completed successfully!");
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    toast.error("Payment failed. Please try again.");
  };

  const handleQuickPayment = (presetAmount: number, presetDescription: string) => {
    setAmount(presetAmount.toString());
    setDescription(presetDescription);
    setShowPaymentDialog(true);
  };

  const quickPaymentOptions = [
    { amount: 5000, description: "Basic Editing Service", currency: "NGN" },
    { amount: 15000, description: "Premium Editing Service", currency: "NGN" },
    { amount: 25000, description: "Full Publishing Package", currency: "NGN" },
    { amount: 50000, description: "Complete Manuscript Service", currency: "NGN" }
  ];

  return (
    <DashboardLayout role={user?.role || "writer"}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
            <p className="text-muted-foreground">
              Manage your payments and view transaction history
            </p>
          </div>
          <Button 
            onClick={() => setShowPaymentDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Make Payment
          </Button>
        </div>

        {/* Payment Stats */}
        <PaymentStats transactions={transactions} />

        {/* Quick Payment Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Quick Payment Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {quickPaymentOptions.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start space-y-2"
                  onClick={() => handleQuickPayment(option.amount, option.description)}
                >
                  <div className="font-semibold">
                    ₦{option.amount.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {option.description}
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : transactions.length === 0 ? (
              <EmptyTransactionsState />
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <TransactionCard 
                    key={transaction.id} 
                    transaction={transaction} 
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Make a Payment</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="payment-amount">Amount (NGN)</Label>
                <Input
                  id="payment-amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="100"
                  step="100"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="payment-description">Description (Optional)</Label>
                <Input
                  id="payment-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Payment for..."
                />
              </div>

              {amount && parseFloat(amount) >= 100 && (
                <PaystackPayment
                  amount={parseFloat(amount)}
                  currency="NGN"
                  description={description || "Payment for manuscript services"}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              )}

              {amount && parseFloat(amount) < 100 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <p className="text-sm text-yellow-800">
                      Minimum payment amount is ₦100
                    </p>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Payments;
