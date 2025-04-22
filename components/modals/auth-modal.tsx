import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/auth-context';
import { useToast } from '../../hooks/use-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'register';
  onChangeMode: (mode: 'login' | 'register') => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  mode, 
  onChangeMode 
}) => {
  const { t } = useTranslation();
  const { login, register } = useAuth();
  const { toast } = useToast();
  
  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Reset form state when modal is closed
  const handleClose = () => {
    setUsername('');
    setPassword('');
    setEmail('');
    setError(null);
    setLoading(false);
    onClose();
  };
  
  // Handle form submission
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
      
      handleClose();
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
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">
            {mode === 'login' ? t('auth.login') : t('auth.register')}
          </h2>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label={t('common.close')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Username field */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.username')}
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:border-transparent"
              required
              disabled={loading}
            />
          </div>
          
          {/* Password field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.password')}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:border-transparent"
              required
              disabled={loading}
            />
          </div>
          
          {/* Registration-specific fields */}
          {mode === 'register' && (
            <>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.email')} ({t('common.optional')})
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.language')}
                </label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={loading}
                >
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                </select>
              </div>
            </>
          )}
          
          {/* Error message */}
          {error && (
            <div className="text-destructive text-sm p-2 bg-destructive/10 rounded">
              {error}
            </div>
          )}
          
          {/* Action buttons */}
          <div className="space-y-2">
            <button
              type="submit"
              className="w-full p-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? t('common.processing') : mode === 'login' ? t('auth.login') : t('auth.register')}
            </button>
            
            <div className="text-center text-sm">
              {mode === 'login' ? (
                <p>
                  {t('auth.noAccount')}{' '}
                  <button
                    type="button"
                    onClick={() => onChangeMode('register')}
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
                    onClick={() => onChangeMode('login')}
                    className="text-primary hover:underline"
                    disabled={loading}
                  >
                    {t('auth.loginHere')}
                  </button>
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;