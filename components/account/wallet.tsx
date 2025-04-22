import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { formatCurrency } from '@/lib/gameUtils';
import { CreditCard, ArrowDownToLine, ArrowUpToLine } from 'lucide-react';

const Wallet: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { state: authState, deposit, withdraw } = useAuth();
  
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  
  // Convert string input to cents
  const toCents = (amount: string): number => {
    return Math.floor(parseFloat(amount) * 100);
  };
  
  // Handle deposit
  const handleDeposit = async () => {
    if (!depositAmount || isNaN(parseFloat(depositAmount)) || parseFloat(depositAmount) <= 0) {
      toast({
        title: t('wallet.invalidAmount'),
        description: t('wallet.enterValidAmount'),
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setIsDepositing(true);
      await deposit(toCents(depositAmount));
      setDepositAmount('');
    } catch (error) {
      console.error('Deposit error:', error);
    } finally {
      setIsDepositing(false);
    }
  };
  
  // Handle withdraw
  const handleWithdraw = async () => {
    if (!withdrawAmount || isNaN(parseFloat(withdrawAmount)) || parseFloat(withdrawAmount) <= 0) {
      toast({
        title: t('wallet.invalidAmount'),
        description: t('wallet.enterValidAmount'),
        variant: 'destructive'
      });
      return;
    }
    
    const amountInCents = toCents(withdrawAmount);
    if (authState.user && amountInCents > authState.user.balance) {
      toast({
        title: t('wallet.insufficientFunds'),
        description: t('wallet.notEnoughBalance'),
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setIsWithdrawing(true);
      await withdraw(amountInCents);
      setWithdrawAmount('');
    } catch (error) {
      console.error('Withdrawal error:', error);
    } finally {
      setIsWithdrawing(false);
    }
  };
  
  if (!authState.user) {
    return null;
  }
  
  return (
    <div className="space-y-6">
      {/* Current Balance */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{t('wallet.currentBalance')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary mb-2">
            {formatCurrency(authState.user.balance, i18n.language)}
          </div>
          <p className="text-sm text-gray-500">
            {t('wallet.balanceDesc')}
          </p>
        </CardContent>
      </Card>
      
      {/* Deposit Funds */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <ArrowDownToLine className="h-5 w-5 mr-2 text-success" />
            {t('wallet.deposit')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex space-x-2">
              <Input
                type="number"
                placeholder={t('wallet.amount')}
                min="1"
                step="0.01"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
              <Button 
                onClick={handleDeposit} 
                disabled={isDepositing}
                className="bg-success hover:bg-success/90"
              >
                {isDepositing ? t('wallet.processing') : t('wallet.deposit')}
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {[5, 10, 25, 50, 100].map(amount => (
                <Button 
                  key={amount}
                  variant="outline" 
                  size="sm"
                  onClick={() => setDepositAmount(amount.toString())}
                >
                  {amount} {i18n.language === 'fr' ? 'F' : '€'}
                </Button>
              ))}
            </div>
            
            <p className="text-xs text-gray-500 mt-2">
              {t('wallet.depositMethods')}
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Withdraw Funds */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <ArrowUpToLine className="h-5 w-5 mr-2 text-secondary" />
            {t('wallet.withdraw')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex space-x-2">
              <Input
                type="number"
                placeholder={t('wallet.amount')}
                min="1"
                max={authState.user.balance / 100}
                step="0.01"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
              <Button 
                onClick={handleWithdraw} 
                disabled={isWithdrawing}
                variant="secondary"
              >
                {isWithdrawing ? t('wallet.processing') : t('wallet.withdraw')}
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 mt-2">
              {t('wallet.withdrawMethods')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Wallet;
