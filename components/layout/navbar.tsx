import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/auth-context';

// Icons
import { Menu, X, User, LogOut, Home, Award, Globe, CreditCard, BarChart, Shield, Palette, LayoutDashboard, Wallet, Target } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();

  // Toggle mobile menu
  const toggleMenu = () => setIsOpen(!isOpen);

  // No longer need navigateToAuth as we use direct Links now

  // Handle logout
  const handleLogout = async () => {
    await logout();
    setLocation('/');
    setIsOpen(false);
  };

  // Handle language change
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  return (
    <>
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and brand */}
            <Link href="/" className="flex items-center space-x-2">
              <Award className="h-6 w-6" />
              <span className="text-xl font-bold">MS BINGO</span>
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              <Link href="/" className="px-3 py-2 rounded hover:bg-primary-foreground/10 transition-colors">
                {t('common.bingo')}
              </Link>
              <Link href="/statistics" className="px-3 py-2 rounded hover:bg-primary-foreground/10 transition-colors">
                <div className="flex items-center space-x-1">
                  <BarChart className="h-4 w-4" />
                  <span>{t('statistics.title')}</span>
                </div>
              </Link>
              <Link href="/blockchain" className="px-3 py-2 rounded hover:bg-primary-foreground/10 transition-colors">
                <div className="flex items-center space-x-1">
                  <Shield className="h-4 w-4" />
                  <span>{t('blockchain.verification')}</span>
                </div>
              </Link>
              {user ? (
                <>
                  <Link href="/account" className="px-3 py-2 rounded hover:bg-primary-foreground/10 transition-colors">
                    {t('account.myAccount')}
                  </Link>
                  <Link href="/wallet" className="px-3 py-2 rounded hover:bg-primary-foreground/10 transition-colors">
                    <div className="flex items-center space-x-1">
                      <Wallet className="h-4 w-4" />
                      <span>{t('payment.wallet')}</span>
                    </div>
                  </Link>
                  <Link href="/checkout" className="px-3 py-2 rounded hover:bg-primary-foreground/10 transition-colors">
                    <div className="flex items-center space-x-1">
                      <CreditCard className="h-4 w-4" />
                      <span>{t('payment.buyCards')}</span>
                    </div>
                  </Link>
                  <Link href="/customize" className="px-3 py-2 rounded hover:bg-primary-foreground/10 transition-colors">
                    <div className="flex items-center space-x-1">
                      <Palette className="h-4 w-4" />
                      <span>{t('customization.title')}</span>
                    </div>
                  </Link>
                  <Link href="/dashboard" className="px-3 py-2 rounded hover:bg-primary-foreground/10 transition-colors">
                    <div className="flex items-center space-x-1">
                      <LayoutDashboard className="h-4 w-4" />
                      <span>{t('dashboard.title')}</span>
                    </div>
                  </Link>
                  <Link href="/difficulty-recommendation" className="px-3 py-2 rounded hover:bg-primary-foreground/10 transition-colors">
                    <div className="flex items-center space-x-1">
                      <Target className="h-4 w-4" />
                      <span>{t('difficulty.recommendation')}</span>
                    </div>
                  </Link>
                  <div className="border-l border-primary-foreground/20 h-6 mx-2" />
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium">
                      {user.username} • €{user.balance / 100}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="p-2 rounded hover:bg-primary-foreground/10 transition-colors"
                      aria-label={t('common.logout')}
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link 
                    href="/auth?mode=login"
                    className="px-3 py-2 rounded hover:bg-primary-foreground/10 transition-colors"
                  >
                    {t('common.login')}
                  </Link>
                  <Link
                    href="/auth?mode=register" 
                    className="px-4 py-2 bg-white text-primary rounded font-medium hover:bg-opacity-90 transition-colors"
                  >
                    {t('common.register')}
                  </Link>
                </div>
              )}
              
              {/* Language switcher */}
              <div className="relative group px-3 py-2 rounded hover:bg-primary-foreground/10 transition-colors cursor-pointer">
                <div className="flex items-center space-x-1">
                  <Globe className="h-5 w-5" />
                  <span className="text-sm uppercase">{i18n.language}</span>
                </div>
                <div className="absolute right-0 mt-2 w-36 bg-white text-foreground rounded shadow-lg hidden group-hover:block z-50">
                  <button
                    onClick={() => changeLanguage('en')}
                    className="w-full text-left px-4 py-2 hover:bg-muted/50 transition-colors"
                  >
                    {t('account.english')}
                  </button>
                  <button
                    onClick={() => changeLanguage('fr')}
                    className="w-full text-left px-4 py-2 hover:bg-muted/50 transition-colors"
                  >
                    {t('account.french')}
                  </button>
                </div>
              </div>
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-primary-foreground/10 transition-colors"
              onClick={toggleMenu}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        {isOpen && (
          <div className="md:hidden bg-primary border-t border-primary-foreground/10">
            <div className="container mx-auto px-4 py-3 space-y-1">
              <Link
                href="/"
                className="block px-3 py-2 rounded hover:bg-primary-foreground/10 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center space-x-3">
                  <Home className="h-5 w-5" />
                  <span>{t('common.bingo')}</span>
                </div>
              </Link>
              
              <Link
                href="/statistics"
                className="block px-3 py-2 rounded hover:bg-primary-foreground/10 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center space-x-3">
                  <BarChart className="h-5 w-5" />
                  <span>{t('statistics.title')}</span>
                </div>
              </Link>
              
              <Link
                href="/blockchain"
                className="block px-3 py-2 rounded hover:bg-primary-foreground/10 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5" />
                  <span>{t('blockchain.verification')}</span>
                </div>
              </Link>
              
              {user ? (
                <>
                  <Link
                    href="/account"
                    className="block px-3 py-2 rounded hover:bg-primary-foreground/10 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5" />
                      <span>{t('account.myAccount')}</span>
                    </div>
                  </Link>
                  <Link
                    href="/wallet"
                    className="block px-3 py-2 rounded hover:bg-primary-foreground/10 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <Wallet className="h-5 w-5" />
                      <span>{t('payment.wallet')}</span>
                    </div>
                  </Link>
                  <Link
                    href="/checkout"
                    className="block px-3 py-2 rounded hover:bg-primary-foreground/10 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-5 w-5" />
                      <span>{t('payment.buyCards')}</span>
                    </div>
                  </Link>
                  <Link
                    href="/customize"
                    className="block px-3 py-2 rounded hover:bg-primary-foreground/10 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <Palette className="h-5 w-5" />
                      <span>{t('customization.title')}</span>
                    </div>
                  </Link>
                  <Link
                    href="/dashboard"
                    className="block px-3 py-2 rounded hover:bg-primary-foreground/10 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <LayoutDashboard className="h-5 w-5" />
                      <span>{t('dashboard.title')}</span>
                    </div>
                  </Link>
                  <Link
                    href="/difficulty-recommendation"
                    className="block px-3 py-2 rounded hover:bg-primary-foreground/10 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <Target className="h-5 w-5" />
                      <span>{t('difficulty.recommendation')}</span>
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded hover:bg-primary-foreground/10 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <LogOut className="h-5 w-5" />
                      <span>{t('common.logout')}</span>
                    </div>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth?mode=login"
                    className="block w-full text-left px-3 py-2 rounded hover:bg-primary-foreground/10 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5" />
                      <span>{t('common.login')}</span>
                    </div>
                  </Link>
                  <Link
                    href="/auth?mode=register"
                    className="block w-full text-left px-3 py-2 rounded hover:bg-primary-foreground/10 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5" />
                      <span>{t('common.register')}</span>
                    </div>
                  </Link>
                </>
              )}
              
              {/* Language options */}
              <div className="px-3 py-2 border-t border-primary-foreground/10 mt-2 pt-2">
                <div className="flex items-center space-x-3 mb-2">
                  <Globe className="h-5 w-5" />
                  <span>{t('account.language')}</span>
                </div>
                <div className="ml-8 space-y-1">
                  <button
                    onClick={() => changeLanguage('en')}
                    className={`block px-3 py-1 rounded ${
                      i18n.language === 'en' ? 'bg-primary-foreground/20 font-medium' : ''
                    }`}
                  >
                    {t('account.english')}
                  </button>
                  <button
                    onClick={() => changeLanguage('fr')}
                    className={`block px-3 py-1 rounded ${
                      i18n.language === 'fr' ? 'bg-primary-foreground/20 font-medium' : ''
                    }`}
                  >
                    {t('account.french')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
      
      {/* We no longer need the auth modal as we now use a dedicated auth page */}
    </>
  );
};

export default Navbar;