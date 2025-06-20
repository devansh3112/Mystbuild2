import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { Wallet, Smartphone, DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle, Plus, BookOpen, FileText, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { usePayments } from "@/hooks/usePayments";
import { usePaymentHistory } from "@/hooks/usePaymentHistory";
import { AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import PaystackPayment from "@/components/PaystackPayment";
import { EDITING_PRICE_SLABS, getPricingSlab, getEditingPrice } from "@/lib/payments";

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

const ManuscriptPaymentCard = ({ manuscript, onPaymentInitiate }: { manuscript: any, onPaymentInitiate: (manuscriptId: string, amount: number, slab: any) => void }) => {
  console.log('ManuscriptPaymentCard rendering with:', manuscript);
  
  const wordCount = manuscript.word_count || 0;
  const slab = getPricingSlab(wordCount);
  const price = getEditingPrice(wordCount, 'NGN');

  console.log('Payment calculation:', { wordCount, slab, price });

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{manuscript.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{manuscript.genre} • {wordCount.toLocaleString()} words</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">₦{price.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">{slab.name}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Editing Package Details</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• {slab.description}</li>
              <li>• Professional editing and proofreading</li>
              <li>• Grammar and style corrections</li>
              <li>• Structural feedback and suggestions</li>
              <li>• Final polished manuscript</li>
            </ul>
          </div>
          <Button 
            onClick={() => onPaymentInitiate(manuscript.id, price, slab)}
            className="w-full"
            size="lg"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Pay for Editing Service
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const PricingSlabCard = ({ slab, isRecommended = false }: { slab: any, isRecommended?: boolean }) => (
  <Card className={`relative ${isRecommended ? 'border-primary ring-2 ring-primary/20' : ''}`}>
    {isRecommended && (
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
        <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
          Most Popular
        </span>
      </div>
    )}
    <CardHeader className="text-center">
      <CardTitle className="text-lg">{slab.name}</CardTitle>
      <div className="text-3xl font-bold text-primary">₦{slab.price.NGN.toLocaleString()}</div>
      <p className="text-sm text-muted-foreground">{slab.description}</p>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2 text-sm">
        <li className="flex items-center">
          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
          Professional editing
        </li>
        <li className="flex items-center">
          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
          Grammar & style check
        </li>
        <li className="flex items-center">
          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
          Structural feedback
        </li>
        <li className="flex items-center">
          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
          Final polished manuscript
        </li>
      </ul>
    </CardContent>
  </Card>
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
              <p className="font-medium">{transaction.manuscript_title || transaction.transaction_ref || transaction.id}</p>
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
  const [manuscriptForPayment, setManuscriptForPayment] = useState<any>(null);
  const [selectedSlab, setSelectedSlab] = useState<any>(null);
  
  const { processPayment } = usePayments();
  const { transactions: paymentHistory, loading: historyLoading, fetchTransactions } = usePaymentHistory();

  // Check URL parameters for manuscript payment
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const manuscriptId = urlParams.get('manuscript_id');
    const wordCount = urlParams.get('word_count');
    
    console.log('URL Parameters:', { manuscriptId, wordCount, fullURL: window.location.href });
    
    if (manuscriptId && wordCount) {
      fetchManuscriptForPayment(manuscriptId, parseInt(wordCount));
    } else {
      console.log('No manuscript parameters found in URL');
    }
  }, []);

  const fetchManuscriptForPayment = async (manuscriptId: string, wordCount: number) => {
    console.log('Fetching manuscript for payment:', { manuscriptId, wordCount });
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('manuscripts')
        .select('*')
        .eq('id', manuscriptId)
        .single();
        
      if (error) {
        console.error('Supabase error fetching manuscript:', error);
        throw error;
      }
      
      console.log('Manuscript data fetched:', data);
      const manuscriptWithWordCount = { ...data, word_count: wordCount };
      console.log('Setting manuscript for payment:', manuscriptWithWordCount);
      setManuscriptForPayment(manuscriptWithWordCount);
      
      // Set the payment amount automatically
      const slab = getPricingSlab(wordCount);
      const price = getEditingPrice(wordCount, 'NGN');
      setAmount(price.toString());
      setDescription(`Editing service for "${data.title}" - ${slab.name}`);
      
    } catch (error) {
      console.error('Error fetching manuscript:', error);
      toast.error(`Error loading manuscript details: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

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
    setManuscriptForPayment(null);
    
    // Update manuscript payment status
    if (manuscriptForPayment) {
      try {
        await supabase
          .from('manuscripts')
          .update({ 
            payment_status: 'paid',
            status: 'payment_received' 
          })
          .eq('id', manuscriptForPayment.id);
      } catch (error) {
        console.error('Error updating manuscript payment status:', error);
      }
    }
    
    // Refresh transaction history
    await fetchTransactions();
    
    toast.success("Payment completed successfully! Your manuscript will be assigned to an editor soon.");
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    toast.error("Payment failed. Please try again.");
  };

  const handleManuscriptPayment = (manuscriptId: string, amount: number, slab: any) => {
    setAmount(amount.toString());
    setDescription(`Editing service for "${manuscriptForPayment?.title}" - ${slab.name}`);
    setSelectedSlab(slab);
    setShowPaymentDialog(true);
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
              {manuscriptForPayment 
                ? "Complete payment for your manuscript editing service" 
                : "Manage your payments and view transaction history"
              }
            </p>
          </div>
          {!manuscriptForPayment && (
            <Button 
              onClick={() => setShowPaymentDialog(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Make Payment
            </Button>
          )}
        </div>

        {/* Debug Section - Remove this after testing */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-sm text-yellow-800">Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <div>Current URL: {window.location.href}</div>
              <div>Manuscript ID from URL: {new URLSearchParams(window.location.search).get('manuscript_id')}</div>
              <div>Word Count from URL: {new URLSearchParams(window.location.search).get('word_count')}</div>
              <div>Manuscript for Payment: {manuscriptForPayment ? 'Loaded' : 'Not loaded'}</div>
              <div>Is Loading: {isLoading ? 'Yes' : 'No'}</div>
              {manuscriptForPayment && <div>Manuscript Title: {manuscriptForPayment.title}</div>}
            </div>
          </CardContent>
        </Card>

        {/* Manuscript Payment Card - Show when redirected from upload */}
        {isLoading ? (
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading manuscript details...</span>
              </div>
            </CardContent>
          </Card>
        ) : manuscriptForPayment ? (
          <ManuscriptPaymentCard 
            manuscript={manuscriptForPayment}
            onPaymentInitiate={handleManuscriptPayment}
          />
        ) : null}

        {/* Payment Stats */}
        <PaymentStats transactions={transactions} />

        {/* Pricing Slabs - Show when no specific manuscript */}
        {!manuscriptForPayment && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Editing Service Pricing</h2>
              <p className="text-muted-foreground">Choose the right editing package for your manuscript based on word count</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <PricingSlabCard slab={EDITING_PRICE_SLABS.BASIC} />
              <PricingSlabCard slab={EDITING_PRICE_SLABS.STANDARD} isRecommended={true} />
              <PricingSlabCard slab={EDITING_PRICE_SLABS.PREMIUM} />
            </div>
          </div>
        )}

        {/* Quick Payment Options - Only show when no manuscript */}
        {!manuscriptForPayment && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Quick Payment Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {Object.values(EDITING_PRICE_SLABS).map((slab, index) => (
                  <Button 
                    key={index}
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-start space-y-2"
                    onClick={() => handleQuickPayment((slab as any).price.NGN, (slab as any).name)}
                  >
                    <div className="font-semibold">
                      ₦{(slab as any).price.NGN.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {(slab as any).name}
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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
                  manuscriptId={manuscriptForPayment?.id}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              )}
              
              {(!amount || parseFloat(amount) < 100) && (
                <div className="text-sm text-muted-foreground text-center">
                  Minimum payment amount is ₦100
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
