import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Redirect } from 'wouter';

const AuthPage: React.FC = () => {
  const { t } = useTranslation();
  const { login, register, user, isLoading } = useAuth();
  const { toast } = useToast();
  
  // État du formulaire
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState('en');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Rediriger si déjà connecté
  if (!isLoading && user) {
    return <Redirect to="/" />;
  }
  
  // Gestion de la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      if (mode === 'login') {
        await login(username, password);
        toast({
          title: t('auth.loginSuccess'),
          variant: 'success',
        });
      } else {
        await register(username, password, email, language);
        toast({
          title: t('auth.registerSuccess'),
          variant: 'success',
        });
      }
      
      // La redirection est automatique grâce au hook useAuth
    } catch (error: any) {
      setError(error.message);
      toast({
        title: mode === 'login' ? t('auth.loginFailed') : t('auth.registerFailed'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col md:flex-row min-h-[80vh]">
      {/* Formulaire */}
      <div className="flex-1 p-4 md:p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <h1 className="text-3xl font-bold mb-2">
            {mode === 'login' ? t('auth.welcome') : t('auth.createAccount')}
          </h1>
          <p className="text-muted-foreground mb-6">
            {mode === 'login' ? t('auth.welcomeBack') : t('auth.joinCommunity')}
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nom d'utilisateur */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-1">
                {t('auth.username')}
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                required
                disabled={loading}
              />
            </div>
            
            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                {t('auth.password')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                required
                disabled={loading}
              />
            </div>
            
            {/* Champs spécifiques à l'inscription */}
            {mode === 'register' && (
              <>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    {t('auth.email')} ({t('common.optional')})
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <label htmlFor="language" className="block text-sm font-medium mb-1">
                    {t('auth.language')}
                  </label>
                  <select
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    disabled={loading}
                  >
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                  </select>
                </div>
              </>
            )}
            
            {/* Message d'erreur */}
            {error && (
              <div className="text-destructive text-sm p-2 bg-destructive/10 rounded-md">
                {error}
              </div>
            )}
            
            {/* Bouton d'action */}
            <button
              type="submit"
              className="w-full p-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? t('common.processing') : mode === 'login' ? t('auth.login') : t('auth.register')}
            </button>
            
            {/* Lien pour changer de mode */}
            <div className="text-center text-sm mt-4">
              {mode === 'login' ? (
                <p>
                  {t('auth.noAccount')}{' '}
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="text-primary hover:underline"
                    disabled={loading}
                  >
                    {t('auth.createOne')}
                  </button>
                </p>
              ) : (
                <p>
                  {t('auth.haveAccount')}{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-primary hover:underline"
                    disabled={loading}
                  >
                    {t('auth.loginHere')}
                  </button>
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
      
      {/* Héro/Présentation */}
      <div className="flex-1 bg-primary p-8 text-white hidden md:flex flex-col justify-center">
        <div className="max-w-md mx-auto">
          <h2 className="text-3xl font-bold mb-4">{t('auth.welcomeToMsBingo')}</h2>
          <p className="text-xl mb-6">{t('auth.bingoPlatformDesc')}</p>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="bg-white/20 p-2 rounded-full mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">{t('auth.feature1Title')}</h3>
                <p className="text-white/80">{t('auth.feature1Desc')}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-white/20 p-2 rounded-full mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">{t('auth.feature2Title')}</h3>
                <p className="text-white/80">{t('auth.feature2Desc')}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-white/20 p-2 rounded-full mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">{t('auth.feature3Title')}</h3>
                <p className="text-white/80">{t('auth.feature3Desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;