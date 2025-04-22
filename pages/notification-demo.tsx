import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotification } from '@/context/notification-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { soundManager } from '@/lib/soundManager';

const NotificationDemo: React.FC = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const [amount, setAmount] = useState(5000);
  const [gameId, setGameId] = useState(42);

  // Démonstration de la notification de jackpot
  const demoJackpot = () => {
    showNotification({
      type: 'jackpot',
      amount,
      gameId
    });
  };

  // Démonstration de la notification de bingo
  const demoBingo = () => {
    showNotification({
      type: 'bingo',
      amount: Math.round(amount * 0.5), // 50% du montant pour le bingo
      gameId
    });
  };

  // Démonstration de la notification de quine
  const demoQuine = () => {
    showNotification({
      type: 'quine',
      amount: Math.round(amount * 0.2), // 20% du montant pour le quine
      gameId
    });
  };
  
  // Tester les sons individuellement
  const testSound = (soundId: string) => {
    soundManager.play(soundId);
  };

  // Tester la séquence sonore de jackpot
  const testJackpotSequence = () => {
    soundManager.playJackpotSequence();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{t('common.testNotifications')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('common.parameters')}</CardTitle>
            <CardDescription>
              {t('notification.testDescription')}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">{t('common.amount')} (€)</Label>
              <Input 
                type="number" 
                id="amount"
                value={amount} 
                onChange={(e) => setAmount(Number(e.target.value))} 
                min={1}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gameId">{t('blockchain.gameId')}</Label>
              <Input 
                type="number" 
                id="gameId"
                value={gameId} 
                onChange={(e) => setGameId(Number(e.target.value))} 
                min={1}
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between flex-wrap">
            <Button 
              onClick={demoJackpot}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {t('customization.testJackpot')}
            </Button>
            
            <Button 
              onClick={demoBingo}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {t('customization.testBingo')}
            </Button>
            
            <Button 
              onClick={demoQuine}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {t('customization.testQuine')}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('customization.soundSettings')}</CardTitle>
            <CardDescription>
              {t('customization.soundSettingsNote')}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="notifications">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="notifications">{t('account.notifications')}</TabsTrigger>
                <TabsTrigger value="sounds">{t('customization.soundEffects')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="notifications" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    onClick={testJackpotSequence}
                    variant="outline"
                    className="flex-1"
                  >
                    {t('customization.testJackpotSound')}
                  </Button>
                  
                  <Button 
                    onClick={() => testSound('bingo-win')}
                    variant="outline"
                    className="flex-1"
                  >
                    {t('customization.testBingoSound')}
                  </Button>
                  
                  <Button 
                    onClick={() => testSound('quine-win')}
                    variant="outline"
                    className="flex-1"
                  >
                    {t('customization.testQuineSound')}
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="sounds" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    onClick={() => testSound('number-called')}
                    variant="outline"
                    className="flex-1"
                  >
                    {t('customization.testNumberSound')}
                  </Button>
                  
                  <Button 
                    onClick={() => testSound('marked')}
                    variant="outline"
                    className="flex-1"
                  >
                    {t('customization.testMarkedSound')}
                  </Button>
                  
                  <Button 
                    onClick={() => testSound('card-purchased')}
                    variant="outline"
                    className="flex-1"
                  >
                    {t('customization.testPurchaseSound')}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <div className="flex items-center space-x-2">
              <Label htmlFor="volume">{t('customization.volume')}</Label>
              <Input 
                type="range" 
                id="volume"
                min="0" 
                max="1" 
                step="0.1"
                defaultValue={soundManager.getVolume()}
                onChange={(e) => soundManager.setVolume(Number(e.target.value))}
                className="w-32"
              />
            </div>
            
            <Button 
              variant="ghost"
              onClick={() => soundManager.toggleMute()}
              className={soundManager.isMuted() ? "text-red-500" : ""}
            >
              {soundManager.isMuted() 
                ? t('customization.unmute') 
                : t('customization.mute')}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default NotificationDemo;