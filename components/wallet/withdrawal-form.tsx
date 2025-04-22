import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/auth-context';
import { apiRequest } from '../../lib/queryClient';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Banknote, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface WithdrawalFormProps {
  balance: number;
  onSuccess: () => void;
}

const WithdrawalForm: React.FC<WithdrawalFormProps> = ({ balance, onSuccess }) => {
  const { t } = useTranslation();
  const { updateUser } = useAuth();
  
  const [withdrawalAmount, setWithdrawalAmount] = useState<number>(0);
  const [bankAccount, setBankAccount] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [accountHolderName, setAccountHolderName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<'error' | 'success' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (withdrawalAmount < 10) {
      setMessage(t('wallet.minimumWithdrawal'));
      setStatus('error');
      return;
    }

    if (withdrawalAmount * 100 > balance) {
      setMessage(t('wallet.insufficientBalance'));
      setStatus('error');
      return;
    }

    if (!bankAccount || !bankName || !accountHolderName) {
      setMessage(t('wallet.missingBankDetails'));
      setStatus('error');
      return;
    }

    setIsProcessing(true);
    setMessage(null);
    setStatus(null);

    try {
      const response = await apiRequest('POST', '/api/payment/withdraw', {
        amount: withdrawalAmount * 100, // Convert to cents
        bankAccount,
        bankName,
        accountHolderName
      });
      
      const data = await response.json();
      
      if (data.error) {
        setMessage(data.error);
        setStatus('error');
      } else {
        setMessage(t('wallet.withdrawalRequested'));
        setStatus('success');
        
        // Update user in context with new balance
        if (data.user) {
          updateUser(data.user);
        }
        
        // Clear form
        setWithdrawalAmount(0);
        setBankAccount('');
        setBankName('');
        setAccountHolderName('');
        
        // Notify parent component of success
        onSuccess();
      }
    } catch (error: any) {
      setMessage(error.message || t('wallet.withdrawalFailed'));
      setStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {status && (
        <Alert variant={status === 'error' ? 'destructive' : 'default'} className={status === 'success' ? 'bg-green-50 border-green-200 text-green-800' : ''}>
          {status === 'error' ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          )}
          <AlertTitle>
            {status === 'error' ? t('wallet.error') : t('wallet.success')}
          </AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">{t('wallet.withdrawalAmount')}</Label>
          <Input
            id="amount"
            type="number"
            min="10"
            step="1"
            placeholder="10"
            value={withdrawalAmount || ''}
            onChange={(e) => setWithdrawalAmount(parseInt(e.target.value || '0'))}
            className="flex-1"
          />
          <div className="text-sm text-muted-foreground">
            {t('wallet.availableBalance')}: €{(balance / 100).toFixed(2)}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bankName">{t('wallet.bankName')}</Label>
          <Input
            id="bankName"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="e.g. BNP Paribas"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="accountHolderName">{t('wallet.accountHolderName')}</Label>
          <Input
            id="accountHolderName"
            value={accountHolderName}
            onChange={(e) => setAccountHolderName(e.target.value)}
            placeholder="e.g. John Doe"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bankAccount">{t('wallet.bankAccount')}</Label>
          <Input
            id="bankAccount"
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
            placeholder="e.g. FR76 1234 5678 9012 3456 7890 123"
          />
          <div className="text-sm text-muted-foreground">
            {t('wallet.ibanFormat')}
          </div>
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground bg-blue-50 border border-blue-200 p-4 rounded">
        <p>{t('wallet.withdrawalExplanation')}</p>
      </div>
      
      <Button
        disabled={isProcessing || withdrawalAmount < 10 || !bankAccount || !bankName || !accountHolderName}
        className="w-full"
        type="submit"
      >
        {isProcessing ? (
          <span className="flex items-center">
            <Clock className="mr-2 h-4 w-4 animate-spin" />
            {t('wallet.processing')}
          </span>
        ) : (
          <>
            <Banknote className="mr-2 h-4 w-4" />
            {t('wallet.requestWithdrawal')}
          </>
        )}
      </Button>
    </form>
  );
};

export default WithdrawalForm;