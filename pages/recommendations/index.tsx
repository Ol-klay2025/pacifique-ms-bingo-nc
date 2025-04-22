import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  CircleX, 
  TrendingUp, 
  Clock, 
  Award, 
  LineChart, 
  Star, 
  History 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Types for recommendation data
interface Factor {
  score: number;
  description: string;
}

interface DifficultyLevel {
  id: string;
  name: string;
  description: string;
}

interface Recommendation {
  recommendedLevel: string;
  recommendedCardCount: number;
  confidence: number;
  factors: Record<string, Factor>;
  timestamp: string;
  previousLevel: string | null;
  description: {
    level: string;
    cardCount: string;
  };
}

interface RecommendationHistoryItem {
  id: number;
  recommendedLevel: string;
  recommendedCardCount: number;
  confidence: number;
  timestamp: string;
  description: string;
}

const RecommendationsPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('current');

  // Fetch current recommendation
  const { 
    data: recommendation, 
    isLoading: isLoadingRecommendation,
    error: recommendationError,
    refetch: refetchRecommendation
  } = useQuery<Recommendation>({
    queryKey: ['/api/recommendations/user'],
    retry: 1,
  });

  // Fetch recommendation history
  const { 
    data: history, 
    isLoading: isLoadingHistory,
    error: historyError
  } = useQuery<RecommendationHistoryItem[]>({
    queryKey: ['/api/recommendations/history'],
    retry: 1,
  });

  // Fetch available difficulty levels
  const { 
    data: levels, 
    isLoading: isLoadingLevels
  } = useQuery<DifficultyLevel[]>({
    queryKey: ['/api/recommendations/levels'],
    retry: 1,
  });

  useEffect(() => {
    if (recommendationError) {
      toast({
        title: "Erreur",
        description: "Impossible de charger la recommandation actuelle. Veuillez réessayer plus tard.",
        variant: "destructive",
      });
    }

    if (historyError) {
      toast({
        title: "Erreur",
        description: "Impossible de charger l'historique des recommandations. Veuillez réessayer plus tard.",
        variant: "destructive",
      });
    }
  }, [recommendationError, historyError, toast]);

  // Function to convert score to progress percentage
  const getScorePercentage = (score: number) => {
    return Math.round(score * 100);
  };

  // Function to get color based on score
  const getScoreColor = (score: number) => {
    if (score < 0.3) return "text-red-500";
    if (score < 0.6) return "text-amber-500";
    return "text-green-500";
  };

  // Function to get progress bar color based on score
  const getProgressColor = (score: number) => {
    if (score < 0.3) return "bg-red-500";
    if (score < 0.6) return "bg-amber-500";
    return "bg-green-500";
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Function to get appropriate icon for factor
  const getFactorIcon = (factor: string) => {
    switch (factor) {
      case 'win_rate':
        return <Award className="h-5 w-5" />;
      case 'game_count':
        return <LineChart className="h-5 w-5" />;
      case 'recent':
        return <Clock className="h-5 w-5" />;
      case 'efficiency':
        return <TrendingUp className="h-5 w-5" />;
      case 'frequency':
        return <History className="h-5 w-5" />;
      default:
        return <Star className="h-5 w-5" />;
    }
  };

  // Generate new recommendation
  const handleRefreshRecommendation = () => {
    refetchRecommendation();
    toast({
      title: "Mise à jour",
      description: "Analyse en cours pour une nouvelle recommandation...",
    });
  };

  // Loading states
  if (isLoadingRecommendation && activeTab === 'current') {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Recommandation de difficulté</h1>
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (isLoadingHistory && activeTab === 'history') {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Historique des recommandations</h1>
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Recommandation de difficulté</h1>
        <Button onClick={handleRefreshRecommendation} variant="outline">
          Actualiser l'analyse
        </Button>
      </div>

      <Tabs defaultValue="current" value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="current">Recommandation actuelle</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
          <TabsTrigger value="levels">Niveaux de difficulté</TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          {recommendation ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="mr-2 h-6 w-6 text-yellow-500" />
                    Niveau recommandé
                  </CardTitle>
                  <CardDescription>
                    Basé sur votre historique de jeu et vos performances
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row items-center md:justify-between gap-4 mb-6">
                    <div className="text-center md:text-left">
                      <h3 className="text-2xl font-bold text-primary capitalize mb-2">
                        {recommendation.recommendedLevel}
                      </h3>
                      <p className="text-muted-foreground">
                        {recommendation.description.level}
                      </p>
                    </div>
                    <div className="text-center md:text-right">
                      <h3 className="text-2xl font-bold mb-2">
                        {recommendation.description.cardCount}
                      </h3>
                      <p className="text-muted-foreground">
                        Nombre de cartes recommandé
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center mb-6">
                    <div className="mr-4">
                      <span className="text-lg font-semibold">Confiance:</span>
                    </div>
                    <div className="flex-1">
                      <Progress
                        value={getScorePercentage(recommendation.confidence)}
                        className={`h-3 ${getProgressColor(recommendation.confidence)}`}
                      />
                    </div>
                    <div className="ml-4">
                      <span className={`text-lg font-bold ${getScoreColor(recommendation.confidence)}`}>
                        {getScorePercentage(recommendation.confidence)}%
                      </span>
                    </div>
                  </div>

                  {recommendation.previousLevel && (
                    <div className="p-4 bg-muted rounded-lg mb-6">
                      <p className="text-muted-foreground">
                        <span className="font-semibold">Évolution: </span>
                        {recommendation.previousLevel === recommendation.recommendedLevel ? (
                          <span>Votre niveau reste stable à <span className="font-semibold capitalize">{recommendation.recommendedLevel}</span></span>
                        ) : (
                          <span>Votre niveau a évolué de <span className="font-semibold capitalize">{recommendation.previousLevel}</span> à <span className="font-semibold capitalize">{recommendation.recommendedLevel}</span></span>
                        )}
                      </p>
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground mb-2">
                    Dernière mise à jour: {formatDate(recommendation.timestamp)}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href="/games">Voir les parties disponibles</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Facteurs d'analyse</CardTitle>
                  <CardDescription>
                    Éléments pris en compte dans la recommandation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recommendation.factors && Object.entries(recommendation.factors).map(([key, factor]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getFactorIcon(key)}
                          <span className="font-medium">{factor.description}</span>
                        </div>
                        <span className={`text-sm font-bold ${getScoreColor(factor.score)}`}>
                          {getScorePercentage(factor.score)}%
                        </span>
                      </div>
                      <Progress
                        value={getScorePercentage(factor.score)}
                        className={`h-2 ${getProgressColor(factor.score)}`}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Aucune recommandation disponible</CardTitle>
                <CardDescription>
                  Participez à quelques parties pour obtenir une recommandation personnalisée
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center p-6">
                  <CircleX className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-center mb-4">
                    Nous n'avons pas encore assez de données pour vous proposer une recommandation personnalisée.
                    Jouez à quelques parties pour permettre à notre système d'analyser votre style de jeu.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/games">Voir les parties disponibles</Link>
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historique des recommandations</CardTitle>
              <CardDescription>
                Évolution de vos niveaux recommandés au fil du temps
              </CardDescription>
            </CardHeader>
            <CardContent>
              {history && history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((item, index) => (
                    <div key={item.id} className="p-4 border rounded-lg">
                      <div className="flex flex-col md:flex-row justify-between mb-2">
                        <div className="flex items-center mb-2 md:mb-0">
                          <Star className="h-5 w-5 text-yellow-500 mr-2" />
                          <h3 className="text-lg font-semibold capitalize">{item.recommendedLevel}</h3>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(item.timestamp)}
                        </span>
                      </div>
                      <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <p className="text-sm">{item.description}</p>
                        <div className="flex items-center">
                          <span className="text-sm mr-2">Confiance:</span>
                          <span className={`text-sm font-bold ${getScoreColor(item.confidence)}`}>
                            {getScorePercentage(item.confidence)}%
                          </span>
                        </div>
                      </div>
                      <p className="text-sm mt-2">
                        <span className="font-medium">Cartes recommandées:</span> {item.recommendedCardCount}
                      </p>
                      {index < history.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6">
                  <CircleX className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-center">
                    Aucun historique de recommandation disponible.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="levels">
          <Card>
            <CardHeader>
              <CardTitle>Niveaux de difficulté disponibles</CardTitle>
              <CardDescription>
                Explication des différents niveaux de difficulté et leurs caractéristiques
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingLevels ? (
                <div className="flex justify-center items-center min-h-[300px]">
                  <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : levels && levels.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {levels.map((level) => (
                    <Card key={level.id} className="overflow-hidden">
                      <CardHeader className={`capitalize bg-${level.id === 'beginner' ? 'green' : level.id === 'easy' ? 'blue' : level.id === 'medium' ? 'amber' : level.id === 'hard' ? 'orange' : 'red'}-100`}>
                        <CardTitle>{level.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <p>{level.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6">
                  <CircleX className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-center">
                    Impossible de charger les niveaux de difficulté.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RecommendationsPage;