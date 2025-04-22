import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import VolumeControl from '@/components/ui/volume-control';
import SoundToggle from '@/components/ui/sound-toggle';
import { soundManager } from '@/lib/soundManager';

const CustomizationPage: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  // État pour suivre les paramètres sonores
  const [muted, setMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.7);
  
  // Synchroniser les états avec soundManager au chargement
  useEffect(() => {
    setMuted(soundManager.isMuted());
    setVolume(soundManager.getVolume());
  }, []);
  
  // Mettre à jour les états lorsque les contrôles sont modifiés
  useEffect(() => {
    // On s'abonne aux changements de volume et de mute
    const checkSettings = () => {
      const currentMuted = soundManager.isMuted();
      const currentVolume = soundManager.getVolume();
      
      if (currentMuted !== muted) {
        setMuted(currentMuted);
      }
      
      if (currentVolume !== volume) {
        setVolume(currentVolume);
      }
    };
    
    // Vérifier les changements toutes les 2 secondes
    const interval = setInterval(checkSettings, 2000);
    
    return () => clearInterval(interval);
  }, [muted, volume]);
  
  // Tester les sons
  const playNumberSound = () => {
    soundManager.play('number-called');
  };
  
  const playBingoSound = () => {
    soundManager.play('bingo-win');
  };
  
  const playJackpotSound = () => {
    soundManager.playJackpotSequence();
  };
  
  // Sauvegarder les paramètres
  const saveSettings = () => {
    try {
      // Les paramètres sont automatiquement sauvegardés via soundManager
      toast({
        title: t('customization.themeApplied'),
        description: t('customization.soundSettingsNote'),
      });
    } catch (error) {
      toast({
        title: t('customization.saveError'),
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">{t('customization.title')}</h1>
      
      <Tabs defaultValue="sound" className="w-full">
        <TabsList className="grid grid-cols-2 mb-8">
          <TabsTrigger value="sound">{t('customization.soundSettings')}</TabsTrigger>
          <TabsTrigger value="theme">{t('customization.cardThemes')}</TabsTrigger>
        </TabsList>
        
        {/* Onglet Paramètres sonores */}
        <TabsContent value="sound">
          <Card>
            <CardHeader>
              <CardTitle>{t('customization.soundSettings')}</CardTitle>
              <CardDescription>
                {t('customization.soundSettingsNote')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Contrôle global du son (on/off) */}
              <div className="space-y-2">
                <Label>{t('common.bingo')} {t('customization.soundEffects')}</Label>
                <div className="flex items-center space-x-2">
                  <SoundToggle 
                    showLabel={true} 
                    size={6}
                    initialValue={muted}
                  />
                  <span className="text-sm ml-2 text-muted-foreground">
                    {muted ? t('customization.disabled') : t('customization.enabled')}
                  </span>
                </div>
              </div>
              
              {/* Contrôle du volume */}
              <div className="space-y-2">
                <Label>{t('customization.volume')}</Label>
                <VolumeControl showValue={true} />
              </div>
              
              {/* Test des sons */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">{t('customization.testNumberSound')}</h3>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    onClick={playNumberSound}
                    className="flex-1"
                  >
                    {t('game.numbers')}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={playBingoSound}
                    className="flex-1"
                  >
                    {t('common.bingo')}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={playJackpotSound}
                    className="flex-1"
                  >
                    {t('common.jackpot')}
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveSettings}>{t('common.save')}</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Onglet Thèmes de cartes - À implémenter dans une future mise à jour */}
        <TabsContent value="theme">
          <Card>
            <CardHeader>
              <CardTitle>{t('customization.cardThemes')}</CardTitle>
              <CardDescription>
                {t('customization.selectCardTheme')}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <p className="text-muted-foreground italic">
                {t('common.loading')} {t('customization.cardThemes')}...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomizationPage;