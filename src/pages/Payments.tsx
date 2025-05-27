
import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { DollarSign, CreditCard, CheckCircle, XCircle } from "lucide-react";

interface PaymentTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  counterparty: string;
  type: "incoming" | "outgoing";
}

interface PendingPayment {
  id: string;
  recipient: {
    id: string;
    name: string;
    role: "writer" | "editor";
  };
  description: string;
  amount: number;
  due: string;
  milestone?: string;
}

// Sample transaction data
const getTransactionsByRole = (role: string): PaymentTransaction[] => {
  switch (role) {
    case "writer":
      return [
        {
          id: "t1",
          date: "2025-05-01",
          description: "Initial payment for 'The Haunting of Elmwood Manor'",
          amount: 1200,
          status: "completed",
          counterparty: "Horizon Publishing",
          type: "incoming"
        },
        {
          id: "t2",
          date: "2025-05-15",
          description: "Final payment for 'The Haunting of Elmwood Manor'",
          amount: 1300,
          status: "pending",
          counterparty: "Horizon Publishing",
          type: "incoming"
        }
      ];
    case "editor":
      return [
        {
          id: "t3",
          date: "2025-04-20",
          description: "Initial review milestone for 'Whispers of the Ancient Ones'",
          amount: 440,
          status: "completed",
          counterparty: "Mystic Books",
          type: "incoming"
        },
        {
          id: "t4",
          date: "2025-05-12",
          description: "First half completion milestone for 'Whispers of the Ancient Ones'",
          amount: 880,
          status: "pending",
          counterparty: "Mystic Books",
          type: "incoming"
        }
      ];
    case "publisher": // Changed from "admin" to "publisher"
      return [
        {
          id: "t5",
          date: "2025-04-01",
          description: "Purchase payment for 'Shadows in the Deep'",
          amount: 2800,
          status: "completed",
          counterparty: "Alex Rivera",
          type: "outgoing"
        },
        {
          id: "t6",
          date: "2025-04-20",
          description: "Editor payment - Initial review for 'Whispers of the Ancient Ones'",
          amount: 440,
          status: "completed",
          counterparty: "Mark Davis",
          type: "outgoing"
        },
        {
          id: "t7",
          date: "2025-05-15",
          description: "Final payment for 'The Haunting of Elmwood Manor'",
          amount: 1300,
          status: "pending",
          counterparty: "Sarah Johnson",
          type: "outgoing"
        },
        {
          id: "t8",
          date: "2025-05-12",
          description: "Editor payment - First half completion for 'Whispers of the Ancient Ones'",
          amount: 880,
          status: "pending",
          counterparty: "Mark Davis",
          type: "outgoing"
        }
      ];
    default:
      return [];
  }
};

// Sample pending payments (only for publishers/admin)
const pendingPayments: PendingPayment[] = [
  {
    id: "p1",
    recipient: {
      id: "w1",
      name: "Sarah Johnson",
      role: "writer"
    },
    description: "Final payment for 'The Haunting of Elmwood Manor'",
    amount: 1300,
    due: "2025-05-20"
  },
  {
    id: "p2",
    recipient: {
      id: "e1",
      name: "Mark Davis",
      role: "editor"
    },
    description: "First half completion milestone for 'Whispers of the Ancient Ones'",
    amount: 880,
    due: "2025-05-15",
    milestone: "First Half Completion"
  }
];

const Payments: React.FC = () => {
  const { user, updateUserBalance } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(
    user ? getTransactionsByRole(user.role) : []
  );
  const [paymentRequests, setPaymentRequests] = useState<PendingPayment[]>(
    user?.role === "publisher" ? pendingPayments : [] // Changed from "admin" to "publisher"
  );
  
  const [showAddFundsDialog, setShowAddFundsDialog] = useState(false);
  const [addAmount, setAddAmount] = useState<number>(0);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  
  const addFunds = () => {
    if (addAmount > 0 && user) {
      updateUserBalance(addAmount);
      
      const newTransaction: PaymentTransaction = {
        id: `deposit-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        description: "Deposit to account",
        amount: addAmount,
        status: "completed",
        counterparty: "Bank Account",
        type: "incoming"
      };
      
      setTransactions([newTransaction, ...transactions]);
      
      toast({
        title: "Funds Added",
        description: `$${addAmount} has been added to your account.`
      });
      
      setShowAddFundsDialog(false);
      setAddAmount(0);
    }
  };
  
  const withdrawFunds = () => {
    if (withdrawAmount > 0 && user && (user.balance || 0) >= withdrawAmount) {
      updateUserBalance(-withdrawAmount);
      
      const newTransaction: PaymentTransaction = {
        id: `withdraw-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        description: "Withdrawal to bank account",
        amount: withdrawAmount,
        status: "completed",
        counterparty: "Bank Account",
        type: "outgoing"
      };
      
      setTransactions([newTransaction, ...transactions]);
      
      toast({
        title: "Withdrawal Successful",
        description: `$${withdrawAmount} has been withdrawn from your account.`
      });
      
      setShowWithdrawDialog(false);
      setWithdrawAmount(0);
    } else if ((user?.balance || 0) < withdrawAmount) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough funds for this withdrawal.",
        variant: "destructive"
      });
    }
  };
  
  const processPayment = (paymentId: string) => {
    const payment = paymentRequests.find(p => p.id === paymentId);
    if (!payment || !user) return;
    
    if ((user.balance || 0) < payment.amount) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough funds to make this payment.",
        variant: "destructive"
      });
      return;
    }
    
    updateUserBalance(-payment.amount);
    
    const newTransaction: PaymentTransaction = {
      id: `payment-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      description: payment.description,
      amount: payment.amount,
      status: "completed",
      counterparty: payment.recipient.name,
      type: "outgoing"
    };
    
    setTransactions([newTransaction, ...transactions]);
    setPaymentRequests(paymentRequests.filter(p => p.id !== paymentId));
    
    toast({
      title: "Payment Successful",
      description: `$${payment.amount} has been sent to ${payment.recipient.name}.`
    });
  };

  if (!user) return null;

  const getRoleSpecificContent = () => {
    switch (user.role) {
      case "publisher": // Changed from "admin" to "publisher"
        return (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Pending Payments</CardTitle>
                <CardDescription>Payments that need to be processed</CardDescription>
              </CardHeader>
              <CardContent>
                {paymentRequests.length === 0 ? (
                  <p className="text-center py-6 text-muted-foreground">No pending payments to process.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentRequests.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">{payment.recipient.name}</TableCell>
                          <TableCell className="capitalize">{payment.recipient.role}</TableCell>
                          <TableCell>{payment.description}</TableCell>
                          <TableCell>${payment.amount}</TableCell>
                          <TableCell>{new Date(payment.due).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              onClick={() => processPayment(payment.id)}
                              size="sm"
                              className="bg-publisher-primary hover:bg-publisher-primary/90"
                            >
                              Pay Now
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        );
      case "writer":
        return null; // Additional writer-specific content could go here
      case "editor":
        return null; // Additional editor-specific content could go here
      default:
        return null;
    }
  };

  return (
    <DashboardLayout role={user.role}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-playfair">Payments</h1>
          <p className="text-muted-foreground mt-1">Manage your financial transactions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Balance</CardTitle>
              <CardDescription>Your current account balance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${user.balance?.toFixed(2) || "0.00"}</div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setShowAddFundsDialog(true)}
              >
                Add Funds
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowWithdrawDialog(true)}
                disabled={(user.balance || 0) <= 0}
              >
                Withdraw
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Transaction Summary</CardTitle>
              <CardDescription>Overview of your recent activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col items-center p-4 border rounded-lg">
                  <span className="text-lg font-medium text-muted-foreground">Income</span>
                  <span className="text-2xl font-bold text-green-600 mt-2">
                    ${transactions
                      .filter(t => t.type === 'incoming' && t.status === 'completed')
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toFixed(2)
                    }
                  </span>
                </div>
                <div className="flex flex-col items-center p-4 border rounded-lg">
                  <span className="text-lg font-medium text-muted-foreground">Expenses</span>
                  <span className="text-2xl font-bold text-red-600 mt-2">
                    ${transactions
                      .filter(t => t.type === 'outgoing' && t.status === 'completed')
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toFixed(2)
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {getRoleSpecificContent()}

        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Record of your payments and receipts</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-center py-6 text-muted-foreground">No transaction history to display.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>{user.role === "publisher" ? "User" : "From/To"}</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{transaction.description}</TableCell>
                      <TableCell>{transaction.counterparty}</TableCell>
                      <TableCell>${transaction.amount}</TableCell>
                      <TableCell>
                        <Badge className={transaction.type === "incoming" ? "bg-green-500" : "bg-amber-500"}>
                          {transaction.type === "incoming" ? "Received" : "Sent"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {transaction.status === "completed" ? (
                            <CheckCircle size={16} className="mr-2 text-green-500" />
                          ) : transaction.status === "failed" ? (
                            <XCircle size={16} className="mr-2 text-red-500" />
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-amber-500 mr-2" />
                          )}
                          <span className="capitalize">{transaction.status}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showAddFundsDialog} onOpenChange={setShowAddFundsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Funds</DialogTitle>
            <DialogDescription>
              Add money to your account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input 
                id="amount" 
                type="number" 
                min="1" 
                step="0.01" 
                value={addAmount || ""}
                onChange={(e) => setAddAmount(Number(e.target.value))}
                placeholder="Enter amount"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card">Card Details</Label>
              <div className="flex items-center border rounded-md p-3 bg-muted/30">
                <CreditCard className="mr-2" />
                <span>•••• •••• •••• 4242</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Demo Mode: No real payment will be processed
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddFundsDialog(false)}>Cancel</Button>
            <Button onClick={addFunds} disabled={addAmount <= 0}>
              Add Funds
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw Funds</DialogTitle>
            <DialogDescription>
              Withdraw money to your bank account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="withdrawAmount">Amount ($)</Label>
              <Input 
                id="withdrawAmount" 
                type="number" 
                min="1" 
                max={user?.balance || 0}
                step="0.01" 
                value={withdrawAmount || ""}
                onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                placeholder="Enter amount"
              />
              <p className="text-sm text-muted-foreground">
                Available balance: ${user?.balance?.toFixed(2) || "0.00"}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankAccount">Bank Account</Label>
              <div className="flex items-center border rounded-md p-3 bg-muted/30">
                <span>•••• 5678 (Demo Account)</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Demo Mode: No real withdrawal will be processed
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWithdrawDialog(false)}>Cancel</Button>
            <Button 
              onClick={withdrawFunds} 
              disabled={withdrawAmount <= 0 || withdrawAmount > (user?.balance || 0)}
            >
              Withdraw Funds
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Payments;
