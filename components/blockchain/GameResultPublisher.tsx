import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Shield, Send, Check, X, Info, Clock } from 'lucide-react';
import { useBlockchain, GameResultVerification } from '../../lib/blockchainService';
import { apiRequest } from '../../lib/queryClient';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface GameResultPublisherProps {
  walletConnected: boolean;
  onGameSelect?: (gameResult: GameResultVerification) => void;
}

/**
 * Composant pour publier les résultats de jeu sur la blockchain
 */
const GameResultPublisher: React.FC<GameResultPublisherProps> = ({
  walletConnected,
  onGameSelect
}) => {
  const { t } = useTranslation();
  const { publishGameResult, generateVerificationHash } = useBlockchain();
  const [publishingId, setPublishingId] = useState<number | null>(null);

  // Récupérer les jeux terminés
  const { data: completedGames, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/blockchain/games/completed'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/blockchain/games/completed');
      const data = await response.json();
      return data.games as GameResultVerification[];
    },
    enabled: walletConnected // N'activer la requête que si le wallet est connecté
  });

  // Publier un résultat de jeu sur la blockchain
  const handlePublish = async (gameResult: GameResultVerification) => {
    try {
      setPublishingId(gameResult.gameId);
      
      // Si le hash de vérification n'existe pas encore, le générer
      if (!gameResult.verificationHash) {
        gameResult.verificationHash = generateVerificationHash({
          gameId: gameResult.gameId,
          startTime: new Date(gameResult.startTime),
          endTime: gameResult.endTime ? new Date(gameResult.endTime) : null,
          calledNumbers: gameResult.calledNumbers,
          quineWinnerId: gameResult.quineWinnerId,
          quineNumberCount: gameResult.quineNumberCount,
          bingoWinnerId: gameResult.bingoWinnerId,
          bingoNumberCount: gameResult.bingoNumberCount,
          jackpotAmount: gameResult.jackpotAmount
        });
      }
      
      // Publier sur la blockchain
      const transactionHash = await publishGameResult(gameResult);
      
      if (transactionHash) {
        // Mettre à jour le résultat dans la base de données avec le hash de transaction
        await apiRequest('POST', `/api/blockchain/games/${gameResult.gameId}/verify`, {
          transactionHash,
          verificationHash: gameResult.verificationHash
        });
        
        // Rafraîchir la liste des jeux
        refetch();
        
        // Sélectionner ce jeu pour la vérification si nécessaire
        if (onGameSelect) {
          onGameSelect({
            ...gameResult,
            transactionHash
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors de la publication:', error);
    } finally {
      setPublishingId(null);
    }
  };

  // Formater la date
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive flex items-center">
            <X className="h-5 w-5 mr-2" />
            {t('blockchain.errorLoadingGames')}
          </CardTitle>
          <CardDescription>
            {(error as Error).message || t('blockchain.unableToLoadGames')}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          {t('blockchain.gameResults')}
        </CardTitle>
        <CardDescription>
          {t('blockchain.publishGamesDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-6 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-2 text-muted-foreground">{t('common.loading')}</p>
          </div>
        ) : !completedGames || completedGames.length === 0 ? (
          <div className="py-6 text-center">
            <Info className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">{t('blockchain.noCompletedGames')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>{t('game.date')}</TableHead>
                  <TableHead>{t('blockchain.status')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedGames.map((game) => (
                  <TableRow key={game.gameId}>
                    <TableCell className="font-medium">{game.gameId}</TableCell>
                    <TableCell>{formatDate(game.startTime)}</TableCell>
                    <TableCell>
                      {game.transactionHash ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="success" className="flex items-center space-x-1">
                                <Check className="h-3 w-3" />
                                <span>{t('blockchain.verified')}</span>
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-mono text-xs break-all">
                                {game.transactionHash.substring(0, 10)}...
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <Badge variant="outline" className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{t('blockchain.notVerified')}</span>
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {!game.transactionHash ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePublish(game)}
                          disabled={publishingId === game.gameId}
                        >
                          {publishingId === game.gameId ? (
                            <>
                              <div className="h-3 w-3 mr-1 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              {t('common.processing')}
                            </>
                          ) : (
                            <>
                              <Send className="h-3 w-3 mr-1" />
                              {t('blockchain.publish')}
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => onGameSelect && onGameSelect(game)}
                        >
                          {t('blockchain.viewDetails')}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          {t('common.refresh')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GameResultPublisher;