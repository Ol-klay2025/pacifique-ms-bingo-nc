import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/auth-context';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react';

interface DepositFormProps {
  onSuccess: () => void;
}

const DepositForm: React.FC<DepositFormProps> = ({ onSuccess }) => {
  const { t } = useTranslation();
  const { updateUser } = useAuth();
  const stripe = useStripe();
  const elements = useElements();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<'error' | 'success' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      return;
    }

    setIsProcessing(true);
    setMessage(null);
    setStatus(null);

    // Confirm payment
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/wallet`,
      },
      redirect: 'if_required'
    });

    if (error) {
      setMessage(error.message || t('wallet.paymentFailed'));
      setStatus('error');
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      setMessage(t('wallet.paymentSuccessful'));
      setStatus('success');
      
      // Update the user with the new balance from the server
      // This should trigger a session refresh in the auth context
      try {
        const response = await fetch('/api/user');
        const userData = await response.json();
        
        // Update user in context
        updateUser(userData.user || userData);
        
        // Notify parent component of success
        onSuccess();
      } catch (error) {
        console.error('Failed to refresh user data:', error);
      }
    }

    setIsProcessing(false);
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
      
      <PaymentElement />
      
      <Button
        disabled={isProcessing || !stripe || !elements}
        className="w-full"
        type="submit"
      >
        {isProcessing ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t('wallet.processing')}
          </span>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            {t('wallet.payNow')}
          </>
        )}
      </Button>
    </form>
  );
};

export default DepositForm;