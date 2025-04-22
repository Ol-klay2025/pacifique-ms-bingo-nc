import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Shield, CheckCircle, XCircle, Search, AlertTriangle } from 'lucide-react';
import { useBlockchain, GameResultVerification } from '../../lib/blockchainService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface GameVerifierProps {
  selectedGame?: GameResultVerification;
}

/**
 * Composant pour vérifier les résultats de jeu sur la blockchain
 */
const GameVerifier: React.FC<GameVerifierProps> = ({
  selectedGame
}) => {
  const { t } = useTranslation();
  const { verifyGameResult, isLoading } = useBlockchain();
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Vérifier un résultat de jeu
  const handleVerify = async (hash: string) => {
    try {
      setVerifying(true);
      setError(null);
      setVerificationResult(null);
      
      // Si le hash est valide, vérifier sur la blockchain
      if (!hash || hash.trim().length === 0) {
        setError(t('blockchain.enterTransactionHash'));
        return;
      }
      
      const result = await verifyGameResult(hash.trim());
      setVerificationResult(result);
    } catch (err: any) {
      setError(err.message || t('blockchain.verificationFailed'));
      setVerificationResult(false);
    } finally {
      setVerifying(false);
    }
  };

  // Formater la date
  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // URL pour explorer la transaction
  const getExplorerUrl = (hash: string) => {
    // Utiliser l'explorateur de test si c'est un environnement de développement
    return `https://sepolia.etherscan.io/tx/${hash}`;
  };

  // Si un jeu est sélectionné
  if (selectedGame) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            {t('blockchain.gameVerification')}
          </CardTitle>
          <CardDescription>
            {t('blockchain.gameVerificationDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {t('game.gameNumber')} #{selectedGame.gameId}
              </h3>
              {selectedGame.transactionHash && (
                <a 
                  href={getExplorerUrl(selectedGame.transactionHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  {t('blockchain.viewOnExplorer')}
                </a>
              )}
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="text-muted-foreground">{t('game.startTime')}</Label>
                <p className="font-medium">{formatDate(selectedGame.startTime)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('game.endTime')}</Label>
                <p className="font-medium">{formatDate(selectedGame.endTime)}</p>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold mb-2">{t('game.calledNumbers')}</h4>
                <div className="flex flex-wrap gap-1 bg-muted/50 p-3 rounded-md">
                  {selectedGame.calledNumbers.map((num) => (
                    <span 
                      key={num} 
                      className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 text-primary text-xs font-medium"
                    >
                      {num}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2">{t('game.quineWinner')}</h4>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="text-muted-foreground">{t('game.winnerId')}</TableCell>
                        <TableCell>{selectedGame.quineWinnerId || '-'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-muted-foreground">{t('game.numberCount')}</TableCell>
                        <TableCell>{selectedGame.quineNumberCount || '-'}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold mb-2">{t('game.bingoWinner')}</h4>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="text-muted-foreground">{t('game.winnerId')}</TableCell>
                        <TableCell>{selectedGame.bingoWinnerId || '-'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-muted-foreground">{t('game.numberCount')}</TableCell>
                        <TableCell>{selectedGame.bingoNumberCount || '-'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-muted-foreground">{t('game.jackpotAmount')}</TableCell>
                        <TableCell>
                          {selectedGame.jackpotAmount 
                            ? `${(selectedGame.jackpotAmount / 100).toFixed(2)}€` 
                            : '-'
                          }
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold mb-2">{t('blockchain.verificationHash')}</h4>
                <div className="font-mono text-xs break-all bg-muted/50 p-3 rounded-md">
                  {selectedGame.verificationHash}
                </div>
              </div>
              
              {selectedGame.transactionHash && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">{t('blockchain.transactionHash')}</h4>
                  <div className="font-mono text-xs break-all bg-muted/50 p-3 rounded-md">
                    {selectedGame.transactionHash}
                  </div>
                </div>
              )}
              
              {selectedGame.transactionHash && (
                <Button 
                  onClick={() => handleVerify(selectedGame.transactionHash!)}
                  disabled={verifying}
                  className="w-full"
                >
                  {verifying ? (
                    <>
                      <div className="h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      {t('blockchain.verifying')}
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      {t('blockchain.verifyThisGame')}
                    </>
                  )}
                </Button>
              )}
              
              {verificationResult !== null && (
                <Alert variant={verificationResult ? "success" : "destructive"}>
                  {verificationResult ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <AlertTitle>{t('blockchain.verificationSuccess')}</AlertTitle>
                      <AlertDescription>
                        {t('blockchain.resultAuthentic')}
                      </AlertDescription>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4" />
                      <AlertTitle>{t('blockchain.verificationFailed')}</AlertTitle>
                      <AlertDescription>
                        {error || t('blockchain.resultNotAuthentic')}
                      </AlertDescription>
                    </>
                  )}
                </Alert>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Si aucun jeu n'est sélectionné, afficher le formulaire de vérification
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          {t('blockchain.verifyGame')}
        </CardTitle>
        <CardDescription>
          {t('blockchain.enterHashDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="txHash">{t('blockchain.transactionHash')}</Label>
            <Input
              id="txHash"
              placeholder="0x..."
              value={transactionHash}
              onChange={(e) => setTransactionHash(e.target.value)}
            />
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{t('blockchain.verificationError')}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {verificationResult !== null && (
            <Alert variant={verificationResult ? "success" : "destructive"}>
              {verificationResult ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>{t('blockchain.verificationSuccess')}</AlertTitle>
                  <AlertDescription>
                    {t('blockchain.resultAuthentic')}
                  </AlertDescription>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>{t('blockchain.verificationFailed')}</AlertTitle>
                  <AlertDescription>
                    {t('blockchain.resultNotAuthentic')}
                  </AlertDescription>
                </>
              )}
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full"
          onClick={() => handleVerify(transactionHash)}
          disabled={verifying || !transactionHash}
        >
          {verifying ? (
            <>
              <div className="h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
              {t('blockchain.verifying')}
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              {t('blockchain.verify')}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GameVerifier;