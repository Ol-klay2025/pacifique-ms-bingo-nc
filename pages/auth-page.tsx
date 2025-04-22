import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Redirect } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

// Schémas de validation
const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  language: z.enum(['fr', 'en']),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { t, i18n } = useTranslation();
  const [formType, setFormType] = useState<'login' | 'register'>('login');
  const { user, loginMutation, registerMutation } = useAuth();

  // Formulaire de connexion
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Formulaire d'inscription
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      language: i18n.language as 'fr' | 'en',
    },
  });

  // Soumission du formulaire de connexion
  const handleLoginSubmit = (data: LoginFormData) => {
    loginMutation.mutate({
      username: data.username,
      password: data.password,
    });
  };

  // Soumission du formulaire d'inscription
  const handleRegisterSubmit = (data: RegisterFormData) => {
    registerMutation.mutate({
      username: data.username,
      email: data.email,
      password: data.password,
      language: data.language,
    });
  };

  // Redirection si déjà connecté
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Formulaire */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900">MS BINGO</h1>
            <p className="mt-2 text-sm text-gray-600">
              {t('auth.tagline', 'Votre plateforme de bingo en ligne')}
            </p>
          </div>

          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {/* Onglets */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                className={`flex-1 py-2 text-center ${
                  formType === 'login'
                    ? 'border-b-2 border-primary text-primary font-medium'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setFormType('login')}
              >
                {t('auth.login', 'Connexion')}
              </button>
              <button
                className={`flex-1 py-2 text-center ${
                  formType === 'register'
                    ? 'border-b-2 border-primary text-primary font-medium'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setFormType('register')}
              >
                {t('auth.register', 'Inscription')}
              </button>
            </div>

            {/* Formulaire de connexion */}
            {formType === 'login' && (
              <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="login-username" className="block text-sm font-medium text-gray-700">
                    {t('auth.username', 'Nom d\'utilisateur')}
                  </label>
                  <div className="mt-1">
                    <input
                      id="login-username"
                      type="text"
                      autoComplete="username"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                      {...loginForm.register('username')}
                    />
                    {loginForm.formState.errors.username && (
                      <p className="mt-1 text-sm text-red-600">
                        {loginForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">
                    {t('auth.password', 'Mot de passe')}
                  </label>
                  <div className="mt-1">
                    <input
                      id="login-password"
                      type="password"
                      autoComplete="current-password"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                      {...loginForm.register('password')}
                    />
                    {loginForm.formState.errors.password && (
                      <p className="mt-1 text-sm text-red-600">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t('auth.loggingIn', 'Connexion en cours...')}
                      </>
                    ) : (
                      t('auth.login', 'Connexion')
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Formulaire d'inscription */}
            {formType === 'register' && (
              <form onSubmit={registerForm.handleSubmit(handleRegisterSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="register-username" className="block text-sm font-medium text-gray-700">
                    {t('auth.username', 'Nom d\'utilisateur')}
                  </label>
                  <div className="mt-1">
                    <input
                      id="register-username"
                      type="text"
                      autoComplete="username"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                      {...registerForm.register('username')}
                    />
                    {registerForm.formState.errors.username && (
                      <p className="mt-1 text-sm text-red-600">
                        {registerForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="register-email" className="block text-sm font-medium text-gray-700">
                    {t('auth.email', 'Email')}
                  </label>
                  <div className="mt-1">
                    <input
                      id="register-email"
                      type="email"
                      autoComplete="email"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                      {...registerForm.register('email')}
                    />
                    {registerForm.formState.errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {registerForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="register-password" className="block text-sm font-medium text-gray-700">
                    {t('auth.password', 'Mot de passe')}
                  </label>
                  <div className="mt-1">
                    <input
                      id="register-password"
                      type="password"
                      autoComplete="new-password"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                      {...registerForm.register('password')}
                    />
                    {registerForm.formState.errors.password && (
                      <p className="mt-1 text-sm text-red-600">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="register-confirm-password" className="block text-sm font-medium text-gray-700">
                    {t('auth.confirmPassword', 'Confirmer le mot de passe')}
                  </label>
                  <div className="mt-1">
                    <input
                      id="register-confirm-password"
                      type="password"
                      autoComplete="new-password"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                      {...registerForm.register('confirmPassword')}
                    />
                    {registerForm.formState.errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">
                        {registerForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="register-language" className="block text-sm font-medium text-gray-700">
                    {t('auth.language', 'Langue préférée')}
                  </label>
                  <div className="mt-1">
                    <select
                      id="register-language"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                      {...registerForm.register('language')}
                    >
                      <option value="fr">{t('language.french', 'Français')}</option>
                      <option value="en">{t('language.english', 'Anglais')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={registerMutation.isPending}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t('auth.registering', 'Inscription en cours...')}
                      </>
                    ) : (
                      t('auth.register', 'Inscription')
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Progression du lancement */}
          <div className="mt-8 bg-white p-4 shadow sm:rounded-lg">
            <h2 className="text-sm font-medium text-gray-700 mb-3">
              {t('auth.launchProgress', 'Progression du lancement')}
            </h2>
            <div className="mb-2 flex justify-between items-center">
              <span className="text-sm text-gray-500">50/1000</span>
              <span className="text-sm text-gray-500">5%</span>
            </div>
            <div className="launch-progress-container">
              <div className="launch-progress-bar" style={{ width: '5%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero section */}
      <div className="hidden lg:block lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-dark to-primary opacity-90"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-12">
          <h2 className="text-4xl font-bold mb-6 text-center">
            {t('auth.heroTitle', 'Bienvenue sur MS BINGO')}
          </h2>
          <p className="text-lg mb-10 text-center max-w-md">
            {t(
              'auth.heroDescription',
              'La plateforme de bingo en ligne qui révolutionne les jeux sociaux avec technologie blockchain, paiements sécurisés et expérience utilisateur de pointe.'
            )}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-2xl">
            <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-2">
                {t('auth.feature1Title', 'Parties automatisées 24/7')}
              </h3>
              <p className="text-sm text-white/80">
                {t(
                  'auth.feature1Description',
                  'Parties régulières toutes les heures et parties spéciales toutes les 4 heures.'
                )}
              </p>
            </div>
            <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-2">
                {t('auth.feature2Title', 'Distribution transparente')}
              </h3>
              <p className="text-sm text-white/80">
                {t(
                  'auth.feature2Description',
                  '50% pour Bingo (carte complète), 20% pour Quine (ligne), 10% pour jackpot, 20% pour la plateforme.'
                )}
              </p>
            </div>
            <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-2">
                {t('auth.feature3Title', 'Expérience immersive')}
              </h3>
              <p className="text-sm text-white/80">
                {t(
                  'auth.feature3Description',
                  'Annonce vocale des numéros, interface intuitive, et vérification automatique des cartes.'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}