import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/use-auth';
import { Clock, Users, DollarSign, CreditCard, LogOut } from 'lucide-react';

export default function HomePage() {
  const { t } = useTranslation();
  const { user, logoutMutation } = useAuth();

  // Mockup des informations de jeu futures
  const nextGame = {
    type: 'standard', // ou 'special'
    startsIn: 1800, // secondes restantes
    registeredPlayers: 42,
    prizePool: 42000, // en centimes (420€)
  };

  // Derniers jeux
  const latestGames = [
    {
      id: 1,
      date: new Date(Date.now() - 3600000), // il y a 1 heure
      winner: 'user123',
      prize: 24000, // 240€
      numbers: 43,
    },
    {
      id: 2,
      date: new Date(Date.now() - 7200000), // il y a 2 heures
      winner: 'bingoMaster',
      prize: 21000, // 210€
      numbers: 52,
    },
    {
      id: 3,
      date: new Date(Date.now() - 9000000), // il y a 2.5 heures
      winner: 'luckyPlayer',
      prize: 22500, // 225€
      numbers: 48,
    },
  ];

  // Formatage du temps restant
  const formatTimeRemaining = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Formatage du montant en euros
  const formatCurrency = (cents: number) => {
    return (cents / 100).toFixed(2) + ' €';
  };

  // Formatage de la date
  const formatDate = (date: Date) => {
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary">MS BINGO</h1>
          <div className="flex items-center space-x-6">
            <div className="text-sm text-text-light">
              <span>{t('header.welcome', 'Bienvenue')}, </span>
              <span className="font-medium text-text-dark">{user?.username}</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-text-light mr-2">
                {t('header.balance', 'Solde')}:
              </span>
              <span className="font-medium text-text-dark">
                {formatCurrency(user?.balance || 0)}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center text-sm text-red-600 hover:text-red-800 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-1" />
              {t('header.logout', 'Déconnexion')}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Prochain jeu */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-text-dark">
                  {t('home.nextGame', 'Prochaine partie')}
                </h2>
              </div>
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                  <div className="mb-4 md:mb-0">
                    <div className="text-sm text-text-light mb-1">
                      {t('home.startsIn', 'Commence dans')}
                    </div>
                    <div className="text-3xl font-bold text-primary">
                      {formatTimeRemaining(nextGame.startsIn)}
                    </div>
                  </div>
                  <button className="bg-primary hover:bg-primary-dark text-white py-2 px-6 rounded-md transition-colors">
                    {t('home.buyCards', 'Acheter des cartes')}
                  </button>
                </div>

                <h3 className="text-lg font-medium text-text-dark mb-4">
                  {t('home.gameInfo', 'Informations sur la partie')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-2 rounded-md mr-3">
                      <CreditCard className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-text-light mb-1">
                        {t('home.type', 'Type')}
                      </div>
                      <div className="font-medium">
                        {nextGame.type === 'standard'
                          ? t('home.standardGame', 'Partie standard')
                          : t('home.specialGame', 'Partie spéciale')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-2 rounded-md mr-3">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-text-light mb-1">
                        {t('home.players', 'Joueurs')}
                      </div>
                      <div className="font-medium">
                        {nextGame.registeredPlayers}{' '}
                        <span className="text-text-light text-sm">
                          {t('home.registered', 'inscrits')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-2 rounded-md mr-3">
                      <DollarSign className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-text-light mb-1">
                        {t('home.prize', 'Cagnotte')}
                      </div>
                      <div className="font-medium">
                        {formatCurrency(nextGame.prizePool)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progression lancement et jackpot */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-text-dark">
                    {t('home.launchProgress', 'Progression du lancement')}
                  </h2>
                </div>
                <div className="p-6">
                  <div className="mb-2 flex justify-between items-center">
                    <span className="text-sm text-text-light">
                      {t('home.registeredUsers', 'Utilisateurs inscrits')}
                    </span>
                    <span className="font-medium">50/1000</span>
                  </div>
                  <div className="launch-progress-container mb-4">
                    <div
                      className="launch-progress-bar"
                      style={{ width: '5%' }}
                    ></div>
                  </div>
                  <p className="text-sm text-text-light">
                    {t(
                      'home.progressInfo',
                      'MS BINGO sera officiellement lancé lorsque nous atteindrons 1000 utilisateurs inscrits'
                    )}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-text-dark">
                    {t('home.jackpotInfo', 'Jackpot actuel')}
                  </h2>
                </div>
                <div className="p-6 text-center">
                  <div className="text-4xl font-bold text-primary mb-4 animate-pulse">
                    {formatCurrency(150000)} {/* 1500€ */}
                  </div>
                  <p className="text-sm text-text-light">
                    {t(
                      'home.jackpotRule',
                      'Pour gagner le jackpot, complétez votre carte en moins de 40 numéros.'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dernières parties */}
          <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-text-dark">
                {t('home.latestGames', 'Dernières parties')}
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-xs text-text-light uppercase">
                  <tr>
                    <th className="px-6 py-3 text-left">{t('home.date', 'Date')}</th>
                    <th className="px-6 py-3 text-left">
                      {t('home.winner', 'Gagnant')}
                    </th>
                    <th className="px-6 py-3 text-left">{t('home.prize', 'Cagnotte')}</th>
                    <th className="px-6 py-3 text-left">
                      {t('home.calledNumbers', 'Numéros')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {latestGames.map((game) => (
                    <tr key={game.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatDate(game.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {game.winner}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatCurrency(game.prize)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{game.numbers}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-text-dark mb-4">MS BINGO</h3>
              <p className="text-text-light text-sm">
                {t(
                  'footer.description',
                  'La plateforme de bingo en ligne qui révolutionne les jeux sociaux avec la technologie blockchain.'
                )}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-dark mb-4">
                {t('footer.links', 'Liens')}
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-text-light hover:text-primary">
                    {t('footer.rules', 'Règles du jeu')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-text-light hover:text-primary">
                    {t('footer.faq', 'FAQ')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-text-light hover:text-primary">
                    {t('footer.contact', 'Contact')}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-dark mb-4">
                {t('footer.legal', 'Mentions légales')}
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-text-light hover:text-primary">
                    {t('footer.terms', 'Conditions d\'utilisation')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-text-light hover:text-primary">
                    {t('footer.privacy', 'Politique de confidentialité')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-text-light hover:text-primary">
                    {t('footer.responsibleGaming', 'Jeu responsable')}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-text-light">
            <p>&copy; {new Date().getFullYear()} MS BINGO. {t('footer.rights', 'Tous droits réservés.')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}