import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useToast } from '../../hooks/use-toast';
import { apiRequest } from '../../lib/queryClient';
import { Wallet, ArrowDown, Shield } from 'lucide-react';

// Type pour le portefeuille organisateur
interface OrganizerWallet {
  id: number;
  balance: number;
  lastUpdated: string;
}

const OrganizerWalletPage: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [wallet, setWallet] = useState<OrganizerWallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminApiKey, setAdminApiKey] = useState('');
  const [isKeyVerified, setIsKeyVerified] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  // Charger les informations du portefeuille
  const fetchWalletInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiRequest('GET', '/api/admin/organizer-wallet', null, {
        headers: {
          'X-Admin-API-Key': adminApiKey
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWallet(data.wallet);
        setIsKeyVerified(true);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors de la récupération des informations du portefeuille');
        setIsKeyVerified(false);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la récupération des informations du portefeuille');
      setIsKeyVerified(false);
    } finally {
      setLoading(false);
    }
  };

  // Effectuer un retrait
  const handleWithdraw = async () => {
    try {
      setProcessing(true);
      setError(null);

      // Vérifier que le montant est valide
      const amount = parseInt(withdrawAmount);
      if (isNaN(amount) || amount <= 0) {
        setError('Veuillez entrer un montant valide');
        return;
      }

      // Vérifier que le montant ne dépasse pas le solde
      if (wallet && amount > wallet.balance) {
        setError('Le montant du retrait ne peut pas dépasser le solde du portefeuille');
        return;
      }

      const response = await apiRequest('POST', '/api/admin/organizer-wallet/withdraw', 
        { amount }, 
        { headers: { 'X-Admin-API-Key': adminApiKey } }
      );

      if (response.ok) {
        const data = await response.json();
        setWallet(data.wallet);
        setWithdrawAmount('');
        toast({
          title: 'Retrait effectué',
          description: `${(amount / 100).toFixed(2)}€ ont été retirés avec succès du portefeuille organisateur.`,
          variant: 'success'
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors du retrait');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du retrait');
    } finally {
      setProcessing(false);
    }
  };

  // Initialiser le portefeuille s'il n'existe pas
  const initializeWallet = async () => {
    try {
      setProcessing(true);
      setError(null);

      const response = await apiRequest('POST', '/api/admin/organizer-wallet/initialize', 
        {}, 
        { headers: { 'X-Admin-API-Key': adminApiKey } }
      );

      if (response.ok) {
        const data = await response.json();
        setWallet(data.wallet);
        toast({
          title: 'Portefeuille initialisé',
          description: 'Le portefeuille organisateur a été initialisé avec succès.',
          variant: 'success'
        });
      } else {
        const errorData = await response.json();
        // Si le portefeuille existe déjà, on le récupère
        if (errorData.wallet) {
          setWallet(errorData.wallet);
          setIsKeyVerified(true);
        } else {
          setError(errorData.error || 'Erreur lors de l\'initialisation du portefeuille');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'initialisation du portefeuille');
    } finally {
      setProcessing(false);
    }
  };

  // Formatter un montant en euros
  const formatEuros = (cents: number) => {
    return `${(cents / 100).toFixed(2)}€`;
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center">
        <Shield className="mr-2 h-6 w-6" />
        {t('admin.organizerWallet')}
      </h1>

      {!isKeyVerified ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.authentication')}</CardTitle>
            <CardDescription>{t('admin.enterApiKey')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-key">{t('admin.apiKey')}</Label>
                <Input
                  id="admin-key"
                  type="password"
                  value={adminApiKey}
                  onChange={(e) => setAdminApiKey(e.target.value)}
                  placeholder="ms-bingo-admin-secret"
                />
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={fetchWalletInfo} 
              disabled={!adminApiKey || loading}
            >
              {loading ? t('common.loading') : t('admin.verify')}
            </Button>
            <Button 
              onClick={initializeWallet} 
              disabled={!adminApiKey || loading || processing}
            >
              {processing ? t('common.processing') : t('admin.initializeWallet')}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.walletBalance')}</CardTitle>
              <CardDescription>{t('admin.lastUpdated')}: {wallet ? new Date(wallet.lastUpdated).toLocaleString() : '-'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-6">
                <div className="text-center">
                  <Wallet className="h-12 w-12 mx-auto mb-2 text-primary" />
                  <div className="text-4xl font-bold text-primary">
                    {wallet ? formatEuros(wallet.balance) : '0.00€'}
                  </div>
                  <div className="text-muted-foreground mt-2">
                    {t('admin.currentBalance')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('admin.withdrawFunds')}</CardTitle>
              <CardDescription>{t('admin.withdrawDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="withdraw-amount">{t('admin.amount')} (€)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="withdraw-amount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="0.00"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => wallet && setWithdrawAmount((wallet.balance / 100).toString())}
                    >
                      {t('admin.max')}
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {withdrawAmount ? `${parseInt(withdrawAmount) * 100} cents` : ''}
                  </div>
                </div>
                {error && <div className="text-red-500 text-sm">{error}</div>}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleWithdraw} 
                disabled={!withdrawAmount || processing || !wallet || wallet.balance <= 0}
                className="w-full"
              >
                {processing ? (
                  <span className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full" />
                    {t('common.processing')}
                  </span>
                ) : (
                  <span className="flex items-center">
                    <ArrowDown className="mr-2 h-4 w-4" />
                    {t('admin.withdraw')}
                  </span>
                )}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('admin.refreshData')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                onClick={fetchWalletInfo} 
                disabled={loading}
                className="w-full"
              >
                {loading ? t('common.loading') : t('admin.refreshWalletInfo')}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default OrganizerWalletPage;