import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const { login, error, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login({ username, password });
  };

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <div className="card" style={{ width: '400px', maxWidth: '90%' }}>
        <div className="card-header text-center">
          <h2 className="mb-0">MS BINGO PACIFIQUE</h2>
          <p className="text-muted mb-0">Interface d'administration de conformité</p>
        </div>
        <div className="card-body">
          <h3 className="mb-3 text-center">Connexion</h3>
          
          {error && (
            <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
              <AlertCircle size={18} className="mr-2" />
              <div>{error}</div>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username" className="form-label">Nom d'utilisateur</label>
              <input
                type="text"
                id="username"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                placeholder="Entrez votre nom d'utilisateur"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">Mot de passe</label>
              <input
                type="password"
                id="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                placeholder="Entrez votre mot de passe"
              />
            </div>
            
            <div className="mt-4">
              <button 
                type="submit" 
                className="btn btn-primary w-100" 
                disabled={loading}
              >
                {loading ? 'Connexion en cours...' : 'Se connecter'}
              </button>
            </div>
          </form>
        </div>
        <div className="card-footer text-center">
          <small className="text-muted">
            Accès réservé au personnel de conformité autorisé.<br />
            © 2025 MS BINGO PACIFIQUE
          </small>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;