import React, { createContext, useState, useContext, useEffect } from 'react';
import { useLocation } from 'wouter';
import api from '../api/api';

// Contexte d'authentification
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [, setLocation] = useLocation();

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Vérifier si un jeton est présent dans le stockage local
        const token = localStorage.getItem('auth_token');
        if (!token) {
          setLoading(false);
          return;
        }

        // Configurer le token d'authentification pour les requêtes API
        api.setAuthToken(token);

        // Charger les informations de l'utilisateur
        const response = await api.get('/api/user');
        setUser(response.data);
      } catch (err) {
        console.error('Erreur lors de la vérification de l\'authentification:', err);
        // Suppression du token en cas d'erreur
        localStorage.removeItem('auth_token');
        api.setAuthToken(null);
        setError('Session expirée. Veuillez vous reconnecter.');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Fonction de connexion
  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await api.post('/api/login', credentials);
      const { token, user } = response.data;
      
      // Enregistrer le token dans le localStorage
      localStorage.setItem('auth_token', token);
      api.setAuthToken(token);
      
      setUser(user);
      setLocation('/dashboard');
      return true;
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError(err.response?.data?.message || 'Échec de la connexion. Veuillez vérifier vos identifiants.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    localStorage.removeItem('auth_token');
    api.setAuthToken(null);
    setUser(null);
    setLocation('/');
  };

  // Valeurs exposées par le contexte
  const value = {
    user,
    loading,
    error,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};