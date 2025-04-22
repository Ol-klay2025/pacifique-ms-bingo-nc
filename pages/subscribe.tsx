// Page d'abonnement pour MS BINGO
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Loader2, CheckCircle, Info } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from '@/components/ui/badge';

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

// Types d'abonnement disponibles
const subscriptionPlans = [
  {
    id: "ms-bingo-standard",
    name: "Standard",
    price: 9.99,
    period: "monthly",
    features: [
      "5 cartes gratuites par jour",
      "Réduction de 10% sur les achats de cartes",
      "Accès prioritaire aux jeux spéciaux"
    ],
    description: "Parfait pour les joueurs réguliers"
  },
  {
    id: "ms-bingo-premium",
    name: "Premium",
    price: 19.99,
    period: "monthly",
    features: [
      "15 cartes gratuites par jour",
      "Réduction de 20% sur les achats de cartes",
      "Accès prioritaire aux jeux spéciaux",
      "Cartes à thème exclusives",
      "Alertes personnalisées pour les jackpots"
    ],
    description: "L'expérience complète pour les passionnés"
  }
];

// Composant pour les plans d'abonnement
const SubscriptionPlan = ({ 
  plan, 
  selected, 
  onSelect 
}: { 
  plan: typeof subscriptionPlans[0], 
  selected: boolean, 
  onSelect: () => void 
}) => {
  return (
    <Card 
      className={`relative cursor-pointer hover:border-primary transition ${
        selected ? 'border-primary ring-2 ring-primary/20' : ''
      }`}
      onClick={onSelect}
    >
      {selected && (
        <div className="absolute top-2 right-2">
          <CheckCircle className="w-5 h-5 text-primary" />
        </div>
      )}
      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline mb-4">
          <span className="text-3xl font-bold">{plan.price}€</span>
          <span className="text-sm text-muted-foreground ml-1">/ mois</span>
        </div>
        <ul className="space-y-2">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start">
              <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          variant={selected ? "default" : "outline"} 
          className="w-full"
        >
          {selected ? "Sélectionné" : "Choisir ce plan"}
        </Button>
      </CardFooter>
    </Card>
  );
};

// Formulaire de paiement Stripe
const SubscriptionForm = ({ selectedPlan }: { selectedPlan: typeof subscriptionPlans[0] }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
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
          return_url: window.location.origin + '/profile/subscription',
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
          title: "Abonnement réussi",
          description: "Votre abonnement a été activé avec succès !",
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
      
      <div className="text-sm space-y-2">
        <div className="flex justify-between">
          <span>Abonnement {selectedPlan.name}</span>
          <span>{selectedPlan.price}€ / mois</span>
        </div>
        <Separator />
        <div className="flex justify-between font-medium">
          <span>Total</span>
          <span>{selectedPlan.price}€ / mois</span>
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground flex items-start">
        <Info className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
        <p>
          En confirmant votre abonnement, vous autorisez MS BINGO à débiter votre moyen de 
          paiement du montant ci-dessus chaque mois jusqu'à ce que vous annuliez. 
          Vous pouvez annuler à tout moment dans vos paramètres.
        </p>
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
          "Confirmer l'abonnement"
        )}
      </Button>
    </form>
  );
};

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Obtenir le plan sélectionné
  const selectedPlan = subscriptionPlans[selectedPlanIndex];
  
  useEffect(() => {
    if (!user) {
      setLocation('/auth');
      return;
    }
    
    // Vérifier si l'utilisateur a déjà un abonnement
    // Note: Comme subscriptionStatus n'existe pas actuellement dans User, nous commentons cette logique
    // Décommenter et adapter quand la propriété sera ajoutée au schéma
    /*
    if (user.subscriptionStatus === 'active') {
      toast({
        title: "Abonnement actif",
        description: "Vous avez déjà un abonnement actif",
      });
      setLocation('/profile/subscription');
      return;
    }
    */
    
    // Créer un PaymentIntent pour l'abonnement
    setLoading(true);
    apiRequest("POST", "/api/create-subscription", { 
      planId: selectedPlan.id
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erreur lors de la création de l'abonnement");
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
  }, [setLocation, selectedPlan.id, toast, user]);

  if (!user) {
    return null; // Redirection gérée dans useEffect
  }

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p>Préparation de l'abonnement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-3xl mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-red-500">Erreur</CardTitle>
            <CardDescription className="text-center">
              Impossible de préparer l'abonnement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center mb-4">{error}</p>
            <Button onClick={() => setLocation('/profile')} className="w-full">
              Retour
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Abonnement MS BINGO</h1>
        <p className="text-muted-foreground">
          Choisissez le plan qui correspond à vos besoins
        </p>
      </div>
      
      <Tabs defaultValue="plans" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="plans">Choisir un plan</TabsTrigger>
          <TabsTrigger value="payment" disabled={!clientSecret}>Paiement</TabsTrigger>
        </TabsList>
        
        <TabsContent value="plans">
          <div className="grid md:grid-cols-2 gap-6">
            {subscriptionPlans.map((plan, index) => (
              <SubscriptionPlan
                key={plan.id}
                plan={plan}
                selected={index === selectedPlanIndex}
                onSelect={() => setSelectedPlanIndex(index)}
              />
            ))}
          </div>
          
          <div className="mt-8 flex justify-center">
            <Button 
              size="lg" 
              onClick={() => document.querySelector('[data-value="payment"]')?.dispatchEvent(
                new MouseEvent('click', { bubbles: true })
              )}
            >
              Continuer vers le paiement
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Paiement sécurisé</CardTitle>
                  <CardDescription>
                    Finaliser votre abonnement
                  </CardDescription>
                </div>
                <Badge variant="outline" className="ml-auto">
                  Plan {selectedPlan.name}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret, locale: 'fr' }}>
                  <SubscriptionForm selectedPlan={selectedPlan} />
                </Elements>
              ) : (
                <div className="py-4 text-center text-muted-foreground">
                  Impossible de charger le formulaire de paiement
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}