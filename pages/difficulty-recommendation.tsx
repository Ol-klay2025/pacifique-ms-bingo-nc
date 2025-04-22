import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/use-auth';
import DifficultyRecommendationComponent from '../components/difficulty/difficulty-recommendation';
import { Loader2 } from 'lucide-react';

const DifficultyRecommendationPage = () => {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // ProtectedRoute will handle redirect
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('difficulty.pageTitle')}</h1>
        <p className="text-gray-600 dark:text-gray-300">
          {t('difficulty.pageDescription')}
        </p>
      </header>

      <main>
        <DifficultyRecommendationComponent userId={user.id} />
      </main>
      
      <footer className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>{t('difficulty.howItWorks')}</p>
          <ul className="list-disc pl-5 mt-4 space-y-2">
            <li>{t('difficulty.explanationPoint1')}</li>
            <li>{t('difficulty.explanationPoint2')}</li>
            <li>{t('difficulty.explanationPoint3')}</li>
            <li>{t('difficulty.explanationPoint4')}</li>
          </ul>
        </div>
      </footer>
    </div>
  );
};

export default DifficultyRecommendationPage;