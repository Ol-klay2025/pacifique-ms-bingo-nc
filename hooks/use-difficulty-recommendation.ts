import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '../lib/queryClient';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface DifficultyFactor {
  score: number;
  description: string;
}

export interface DifficultyRecommendation {
  id: number;
  userId: number;
  recommendedLevel: string;
  recommendedCardCount: number;
  confidence: number;
  factorsAnalysis: Record<string, DifficultyFactor>;
  previousLevel: string | null;
  createdAt: string | Date;
}

export function useDifficultyRecommendation(userId: number) {
  const { t } = useTranslation();
  const [error, setError] = useState<Error | null>(null);

  // Fetch current recommendation for user
  const {
    data: recommendation,
    isLoading: isLoadingRecommendation,
  } = useQuery<DifficultyRecommendation>({
    queryKey: ['/api/difficulty-recommendations/current', userId],
    enabled: Boolean(userId),
  });

  // Fetch recommendation history for user
  const {
    data: history,
    isLoading: isLoadingHistory,
  } = useQuery<DifficultyRecommendation[]>({
    queryKey: ['/api/difficulty-recommendations/history', userId],
    enabled: Boolean(userId),
  });

  // Generate new recommendation
  const {
    mutate: generateRecommendation,
    isPending: isGenerating,
  } = useMutation({
    mutationFn: async () => {
      setError(null);
      try {
        const response = await apiRequest('POST', `/api/difficulty-recommendations/generate/${userId}`);
        return await response.json();
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/difficulty-recommendations/current', userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/difficulty-recommendations/history', userId] });
    },
  });

  // Apply recommendation
  const {
    mutate: applyRecommendation,
    isPending: isApplying,
  } = useMutation({
    mutationFn: async () => {
      if (!recommendation) throw new Error('No recommendation to apply');
      
      const response = await apiRequest('POST', `/api/difficulty-recommendations/apply/${recommendation.id}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
  });

  // Utility functions for translating and formatting data
  const getDifficultyLabel = (level: string): string => {
    const difficultyMap: Record<string, string> = {
      'beginner': t('difficulty.levels.beginner'),
      'easy': t('difficulty.levels.easy'),
      'medium': t('difficulty.levels.medium'),
      'hard': t('difficulty.levels.hard'),
      'expert': t('difficulty.levels.expert'),
    };
    
    return difficultyMap[level] || level;
  };

  const getFactorLabel = (factor: string): string => {
    const factorMap: Record<string, string> = {
      'win_rate': t('difficulty.factors.winRate'),
      'game_count': t('difficulty.factors.gameCount'),
      'recent': t('difficulty.factors.recentPerformance'),
      'efficiency': t('difficulty.factors.cardEfficiency'),
      'frequency': t('difficulty.factors.sessionFrequency'),
    };
    
    return factorMap[factor] || factor;
  };

  const getConfidenceLabel = (confidence: number): string => {
    if (confidence >= 0.8) return t('difficulty.confidence.high');
    if (confidence >= 0.5) return t('difficulty.confidence.medium');
    return t('difficulty.confidence.low');
  };

  const isLoading = isLoadingRecommendation || isLoadingHistory;

  return {
    recommendation,
    history,
    isLoading,
    error,
    generateRecommendation,
    isGenerating,
    applyRecommendation,
    isApplying,
    getDifficultyLabel,
    getFactorLabel,
    getConfidenceLabel,
  };
}