import React, { useState, useEffect } from 'react';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Progress } from "@/components/ui/progress";

interface LaunchProgressData {
  userCount: number;
  targetCount: number;
  percentage: number;
  remainingCount: number;
  isLaunched: boolean;
}

export const LaunchProgressGauge: React.FC = () => {
  const { toast } = useToast();
  const { data, isLoading, error } = useQuery<LaunchProgressData>({
    queryKey: ['/api/launch-progress'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/launch-progress');
      return res.json();
    },
    refetchInterval: 60000, // Actualisez toutes les minutes
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de progression du lancement",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="bg-background/95 p-4 rounded-lg backdrop-blur shadow-lg border border-border w-full max-w-md mx-auto">
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-4 bg-primary/20 rounded w-1/3"></div>
          <div className="h-6 bg-primary/20 rounded"></div>
          <div className="h-4 bg-primary/20 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="bg-background/95 p-6 rounded-lg backdrop-blur shadow-lg border border-border w-full max-w-md mx-auto">
      <h3 className="font-bold text-xl mb-2 text-center">
        {data.isLaunched ? "MS BINGO est lancé !" : "Progression vers le lancement"}
      </h3>
      
      <div className="space-y-4">
        <Progress 
          value={data.percentage} 
          className="h-3 w-full"
        />
        
        <div className="flex flex-col space-y-1">
          <p className="text-lg font-medium text-center">
            {data.percentage}% complété
          </p>
          
          <p className="text-sm text-muted-foreground text-center">
            {data.userCount} utilisateurs enregistrés sur {data.targetCount}
          </p>
          
          {!data.isLaunched && (
            <p className="text-sm text-center mt-4">
              <span className="font-medium">Encore {data.remainingCount} inscriptions</span> avant le lancement officiel !
            </p>
          )}
          
          {data.isLaunched && (
            <div className="flex items-center justify-center mt-2">
              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Lancé !
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};