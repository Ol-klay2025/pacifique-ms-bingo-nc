import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  CreditCard,
  Banknote
} from 'lucide-react';

interface Transaction {
  id: number;
  type: string;
  status: string;
  amount: number;
  description: string;
  createdAt: string;
  stripePaymentIntentId: string | null;
}

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, isLoading }) => {
  const { t, i18n } = useTranslation();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{t('wallet.noTransactions')}</p>
      </div>
    );
  }
  
  // Format date according to locale
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(i18n.language, { 
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };
  
  // Get icon based on transaction type and status
  const getStatusIcon = (transaction: Transaction) => {
    if (transaction.status === 'pending') {
      return <Clock className="h-5 w-5 text-amber-500" />;
    } else if (transaction.status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (transaction.status === 'failed') {
      return <XCircle className="h-5 w-5 text-red-500" />;
    } else {
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    }
  };
  
  // Get icon for transaction type
  const getTypeIcon = (transaction: Transaction) => {
    if (transaction.type === 'deposit') {
      return <CreditCard className="h-5 w-5 text-blue-500" />;
    } else if (transaction.type === 'withdrawal') {
      return <Banknote className="h-5 w-5 text-purple-500" />;
    } else if (transaction.type === 'purchase') {
      return <ArrowUpRight className="h-5 w-5 text-red-500" />;
    } else if (transaction.type === 'win') {
      return <ArrowDownLeft className="h-5 w-5 text-green-500" />;
    } else {
      return <ArrowUpRight className="h-5 w-5 text-neutral-500" />;
    }
  };
  
  // Get CSS class for amount based on type
  const getAmountClass = (transaction: Transaction) => {
    if (transaction.type === 'deposit' || transaction.type === 'win') {
      return 'text-green-600 font-medium';
    } else if (transaction.type === 'withdrawal' || transaction.type === 'purchase') {
      return 'text-red-600 font-medium';
    } else {
      return 'text-neutral-600 font-medium';
    }
  };
  
  // Format amount with + or - sign
  const formatAmount = (transaction: Transaction) => {
    const amount = transaction.amount / 100;
    if (transaction.type === 'deposit' || transaction.type === 'win') {
      return `+€${amount.toFixed(2)}`;
    } else if (transaction.type === 'withdrawal' || transaction.type === 'purchase') {
      return `-€${Math.abs(amount).toFixed(2)}`;
    } else {
      return `€${amount.toFixed(2)}`;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 px-2">{t('wallet.type')}</th>
            <th className="text-left py-2 px-2">{t('wallet.date')}</th>
            <th className="text-left py-2 px-2">{t('wallet.description')}</th>
            <th className="text-left py-2 px-2">{t('wallet.status')}</th>
            <th className="text-right py-2 px-2">{t('wallet.amount')}</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="border-b hover:bg-muted/50">
              <td className="py-3 px-2">
                <div className="flex items-center">
                  {getTypeIcon(transaction)}
                  <span className="ml-2 capitalize">
                    {t(`wallet.transactionType.${transaction.type}`)}
                  </span>
                </div>
              </td>
              <td className="py-3 px-2 text-sm text-muted-foreground">
                {formatDate(transaction.createdAt)}
              </td>
              <td className="py-3 px-2 max-w-[200px] truncate">
                {transaction.description || t('wallet.noDescription')}
              </td>
              <td className="py-3 px-2">
                <div className="flex items-center">
                  {getStatusIcon(transaction)}
                  <span className="ml-2 capitalize">
                    {t(`wallet.status.${transaction.status}`)}
                  </span>
                </div>
              </td>
              <td className={`py-3 px-2 text-right ${getAmountClass(transaction)}`}>
                {formatAmount(transaction)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionList;