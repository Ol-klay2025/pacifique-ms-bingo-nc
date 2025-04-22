import React from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Info, Check, AlertTriangle, Book, ExternalLink } from 'lucide-react';
import WalletConnector from '../components/blockchain/WalletConnector';
import GameResultPublisher from '../components/blockchain/GameResultPublisher';
import GameVerifier from '../components/blockchain/GameVerifier';
import { GameResultVerification } from '../lib/blockchainService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/**
 * Page de vérification blockchain pour la transparence des résultats
 */
export default function BlockchainVerificationPage() {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = React.useState('verify');
  const [selectedGameResult, setSelectedGameResult] = React.useState<GameResultVerification | undefined>(undefined);
  const [walletConnected, setWalletConnected] = React.useState(false);

  const handleWalletConnected = (address: string) => {
    setWalletConnected(true);
  };

  const handleGameSelect = (gameResult: GameResultVerification) => {
    setSelectedGameResult(gameResult);
    setSelectedTab('verify');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <Shield className="h-8 w-8 mr-2 text-primary" />
          {t('blockchain.verificationTitle')}
        </h1>
        <p className="text-muted-foreground max-w-3xl">
          {t('blockchain.verificationDescription')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne de gauche */}
        <div>
          <WalletConnector onWalletConnected={handleWalletConnected} className="mb-6" />

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="h-5 w-5 mr-2" />
                {t('blockchain.howItWorks')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium mr-3">
                    1
                  </div>
                  <p className="text-sm">{t('blockchain.step1')}</p>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium mr-3">
                    2
                  </div>
                  <p className="text-sm">{t('blockchain.step2')}</p>
                </li>
                <li className="flex">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium mr-3">
                    3
                  </div>
                  <p className="text-sm">{t('blockchain.step3')}</p>
                </li>
              </ul>
              
              <div className="mt-4">
                <a 
                  href="https://ethereum.org/learn" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 inline-flex items-center text-sm"
                >
                  <Book className="h-4 w-4 mr-1" />
                  {t('blockchain.learnMore')}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            </CardContent>
          </Card>

          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{t('blockchain.ethRequiredTitle')}</AlertTitle>
            <AlertDescription>
              {t('blockchain.ethRequiredDescription')}
            </AlertDescription>
          </Alert>
        </div>

        {/* Colonne principale */}
        <div className="lg:col-span-2">
          <Tabs 
            value={selectedTab} 
            onValueChange={setSelectedTab}
            className="mb-6"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="publish">
                {t('blockchain.publishTab')}
              </TabsTrigger>
              <TabsTrigger value="verify">
                {t('blockchain.verifyTab')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="publish" className="mt-6">
              {walletConnected ? (
                <GameResultPublisher 
                  walletConnected={walletConnected} 
                  onGameSelect={handleGameSelect}
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>{t('blockchain.walletRequired')}</CardTitle>
                    <CardDescription>
                      {t('blockchain.connectWalletToPublish')}
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="verify" className="mt-6">
              <GameVerifier selectedGame={selectedGameResult} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}