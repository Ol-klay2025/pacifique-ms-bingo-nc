import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-8 bg-white shadow-lg rounded-lg max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          {t('notFound.title', 'Page introuvable')}
        </h2>
        <p className="text-gray-600 mb-8">
          {t('notFound.description', 'La page que vous recherchez n\'existe pas ou a été déplacée.')}
        </p>
        <Link href="/">
          <a className="inline-flex items-center justify-center bg-primary hover:bg-primary-dark text-white py-2 px-6 rounded-md transition-colors">
            {t('notFound.goHome', 'Retourner à l\'accueil')}
          </a>
        </Link>
      </div>
    </div>
  );
}