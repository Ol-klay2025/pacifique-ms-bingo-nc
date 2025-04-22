import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useToast } from '../../hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '../../lib/queryClient';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
// Access environment variables safely
const STRIPE_PUBLIC_KEY = typeof import.meta === 'object' && 
                        import.meta && 
                        'env' in import.meta ? 
                        (import.meta as any).env.VITE_STRIPE_PUBLIC_KEY : 
                        process.env.VITE_STRIPE_PUBLIC_KEY;

if (!STRIPE_PUBLIC_KEY) {
  console.warn('Missing Stripe public key. Payment features will not work properly.');
}

const stripePromise = loadStripe(STRIPE_PUBLIC_KEY as string);

interface StripePaymentFormProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

// Component for the actual Stripe Payment Form
const StripePaymentForm: React.FC<StripePaymentFormProps> = ({ 
  amount, 
  onSuccess, 
  onCancel 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return;
    }

    setIsLoading(true);

    // Use confirmPayment to process the payment
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Return URL after payment
        return_url: window.location.origin + '/account',
      },
      redirect: 'if_required',
    });

    if (error) {
      // Show error to customer
      toast({
        title: t('wallet.paymentFailed'),
        description: error.message,
        variant: 'destructive',
      });
      setIsLoading(false);
    } else {
      // Payment successful
      toast({
        title: t('wallet.depositSuccessful'),
        description: t('wallet.fundsAdded', { amount }),
        variant: 'success',
      });
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 px-4 border border-input bg-background hover:bg-muted transition-colors rounded-md text-sm font-medium"
          disabled={isLoading}
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          disabled={!stripe || isLoading}
          className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium 
                   hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('wallet.processing')}
            </span>
          ) : (
            t('wallet.depositAction')
          )}
        </button>
      </div>
    </form>
  );
};

// Wrapper component that handles the payment intent creation
interface StripePaymentWrapperProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const StripePaymentWrapper: React.FC<StripePaymentWrapperProps> = ({ 
  amount, 
  onSuccess, 
  onCancel 
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    // Create a PaymentIntent as soon as the page loads
    const createPaymentIntent = async () => {
      try {
        const response = await apiRequest('POST', '/api/create-payment-intent', {
          amount,
        });
        
        setClientSecret(response.clientSecret);
      } catch (err: any) {
        setError(err.message || t('wallet.paymentInitFailed'));
        toast({
          title: t('common.error'),
          description: err.message || t('wallet.paymentInitFailed'),
          variant: 'destructive',
        });
      }
    };

    createPaymentIntent();
  }, [amount, toast, t]);

  if (error) {
    return (
      <div className="p-4 border border-destructive bg-destructive/10 rounded-md">
        <h3 className="font-medium text-destructive">{t('common.error')}</h3>
        <p className="text-sm mt-1">{error}</p>
        <button
          onClick={onCancel}
          className="mt-4 w-full py-2 px-4 border border-input bg-background hover:bg-muted transition-colors rounded-md text-sm font-medium"
        >
          {t('common.back')}
        </button>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <StripePaymentForm amount={amount} onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
  );
};

export default StripePaymentWrapper;