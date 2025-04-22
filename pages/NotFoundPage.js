import React from 'react';
import { Link } from 'wouter';
import { AlertTriangle, Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '70vh' }}>
      <AlertTriangle size={64} color="#ff8c00" className="mb-4" />
      <h1 className="mb-3">Page non trouvée</h1>
      <p className="text-muted mb-4 text-center">
        Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <Link href="/dashboard">
        <a className="btn btn-primary">
          <Home size={16} className="mr-2" />
          Retour au tableau de bord
        </a>
      </Link>
    </div>
  );
};

export default NotFoundPage;