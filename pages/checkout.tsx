// Page de paiement unique (achat de cartes de bingo)
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';

// Déclaration pour TypeScript
declare global {
  interface ImportMeta {
    env: Record<string, string>;
  }
}

// Chargement du client Stripe
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Clé Stripe manquante: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Formulaire de paiement Stripe
const CheckoutForm = ({ amount, cardCount }: { amount: number, cardCount: number }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/wallet/success',
        },
      });

      if (error) {
        toast({
          title: "Paiement échoué",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Paiement réussi",
          description: "Merci pour votre achat !",
        });
        // La redirection sera gérée par return_url
      }
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message || "Une erreur est survenue lors du paiement",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="py-4">
        <PaymentElement />
      </div>
      
      <div className="text-sm text-muted-foreground mb-4">
        <p>Vous allez acheter {cardCount} carte{cardCount > 1 ? 's' : ''} de Bingo pour un total de {(amount / 100).toFixed(2)}€</p>
      </div>
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Traitement en cours...
          </>
        ) : (
          `Payer ${(amount / 100).toFixed(2)}€`
        )}
      </Button>
    </form>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Obtenir les paramètres d'URL
  const urlParams = new URLSearchParams(window.location.search);
  const amount = parseInt(urlParams.get('amount') || '100', 10);
  const cardCount = parseInt(urlParams.get('cards') || '1', 10);
  const gameType = urlParams.get('gameType') || 'regular';
  
  useEffect(() => {
    if (!user) {
      setLocation('/auth');
      return;
    }
    
    // Créer un PaymentIntent dès le chargement de la page
    setLoading(true);
    apiRequest("POST", "/api/create-payment-intent", { 
      amount,
      cardCount,
      gameType
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erreur lors de la création du paiement");
        }
        return res.json();
      })
      .then((data) => {
        setClientSecret(data.clientSecret);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Une erreur est survenue");
        setLoading(false);
      });
  }, [amount, cardCount, gameType, setLocation, user]);

  if (!user) {
    return null; // Redirection gérée dans useEffect
  }

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p>Préparation du paiement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-md mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-red-500">Erreur</CardTitle>
            <CardDescription className="text-center">
              Impossible de préparer le paiement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center mb-4">{error}</p>
            <Button onClick={() => setLocation('/wallet')} className="w-full">
              Retour
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Paiement sécurisé</CardTitle>
          <CardDescription>
            Achat de {cardCount} carte{cardCount > 1 ? 's' : ''} de Bingo
          </CardDescription>
        </CardHeader>
        <CardContent>
          {clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret, locale: 'fr' }}>
              <CheckoutForm amount={amount} cardCount={cardCount} />
            </Elements>
          ) : (
            <div className="py-4 text-center text-muted-foreground">
              Impossible de charger le formulaire de paiement
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}