import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/auth-context';
import { apiRequest } from '../lib/queryClient';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Wallet as WalletIcon, CreditCard, Banknote, History, ArrowRight } from 'lucide-react';
import DepositForm from '../components/wallet/deposit-form';
import WithdrawalForm from '../components/wallet/withdrawal-form';
import TransactionList from '../components/wallet/transaction-list';

// Load Stripe outside of component
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const Wallet: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('deposit');
  const [depositAmount, setDepositAmount] = useState<number>(10);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [showStripeForm, setShowStripeForm] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [formRefreshKey, setFormRefreshKey] = useState(0);

  // Function to refresh data after successful operations
  const refreshData = () => {
    setFormRefreshKey(prev => prev + 1);
    fetchTransactions();
  };

  // Fetch user's transaction history
  const fetchTransactions = async () => {
    if (!user) return;

    setIsLoadingTransactions(true);
    try {
      const response = await apiRequest('GET', '/api/transactions');
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  // Create a payment intent when deposit amount changes
  const handlePrepareDeposit = async () => {
    if (depositAmount < 5) {
      return; // Minimum deposit amount
    }

    try {
      const response = await apiRequest('POST', '/api/payment/create-payment-intent', {
        amount: depositAmount
      });
      
      const data = await response.json();
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setShowStripeForm(true);
      }
    } catch (error) {
      console.error('Failed to create payment intent:', error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <p>{t('wallet.pleaseLogin')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <WalletIcon className="mr-2 h-5 w-5" />
                {t('wallet.myWallet')}
              </CardTitle>
              <CardDescription>{t('wallet.manageYourFunds')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">{t('wallet.currentBalance')}</h3>
                <div className="text-3xl font-bold">€{(user.balance / 100).toFixed(2)}</div>
                {user.subscriptionStatus === 'active' && (
                  <div className="mt-2 text-sm bg-green-50 text-green-800 rounded-md p-2 inline-block">
                    {t('wallet.activeSubscription')}
                  </div>
                )}
              </div>

              <Tabs defaultValue="deposit" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full mb-6">
                  <TabsTrigger value="deposit" className="flex-1">
                    <CreditCard className="mr-2 h-4 w-4" />
                    {t('wallet.deposit')}
                  </TabsTrigger>
                  <TabsTrigger value="withdraw" className="flex-1">
                    <Banknote className="mr-2 h-4 w-4" />
                    {t('wallet.withdraw')}
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex-1">
                    <History className="mr-2 h-4 w-4" />
                    {t('wallet.history')}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="deposit">
                  {!showStripeForm ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="amount">{t('wallet.depositAmount')}</Label>
                          <div className="flex items-center">
                            <Input
                              id="amount"
                              type="number"
                              min="5"
                              step="5"
                              placeholder="10"
                              value={depositAmount || ''}
                              onChange={(e) => setDepositAmount(parseInt(e.target.value || '0'))}
                              className="flex-1"
                            />
                            <span className="mx-2">€</span>
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={handlePrepareDeposit} 
                        disabled={depositAmount < 5}
                        className="w-full"
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        {t('wallet.continueToPayment')}
                      </Button>
                      
                      <div className="text-sm text-muted-foreground bg-blue-50 border border-blue-200 p-4 rounded">
                        <p>{t('wallet.depositExplanation')}</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Button 
                        variant="outline" 
                        className="mb-4"
                        onClick={() => setShowStripeForm(false)}
                      >
                        <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                        {t('wallet.backToAmount')}
                      </Button>
                      
                      {clientSecret && (
                        <Elements 
                          stripe={stripePromise} 
                          options={{ 
                            clientSecret,
                            appearance: {
                              theme: 'stripe',
                              variables: {
                                colorPrimary: '#4f46e5',
                              }
                            } 
                          }}
                          key={formRefreshKey}
                        >
                          <DepositForm onSuccess={refreshData} />
                        </Elements>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="withdraw">
                  <WithdrawalForm 
                    balance={user.balance} 
                    onSuccess={refreshData}
                  />
                </TabsContent>

                <TabsContent value="history">
                  <TransactionList 
                    transactions={transactions} 
                    isLoading={isLoadingTransactions} 
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>{t('wallet.paymentInfo')}</CardTitle>
              <CardDescription>{t('wallet.securePayments')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">{t('wallet.depositOptions')}</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CreditCard className="mr-2 h-4 w-4 text-primary" />
                    {t('wallet.creditCard')}
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">{t('wallet.withdrawalOptions')}</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Banknote className="mr-2 h-4 w-4 text-primary" />
                    {t('wallet.bankTransfer')}
                  </li>
                </ul>
              </div>
              
              <div className="text-sm text-muted-foreground bg-amber-50 border border-amber-200 p-4 rounded">
                <p>{t('wallet.withdrawalProcessingTime')}</p>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/50 border-t px-6 py-4">
              <p className="text-xs text-muted-foreground">
                {t('wallet.securityNote')}
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Wallet;