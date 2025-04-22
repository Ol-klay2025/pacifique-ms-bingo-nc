import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { GeoInfo } from '../geo/GeoInfo';

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/30 mt-auto pt-8 pb-4">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-3">MS BINGO</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t('footer.tagline')}
            </p>
            <GeoInfo />
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-3">{t('footer.links')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm hover:underline">
                  {t('footer.home')}
                </Link>
              </li>
              <li>
                <Link href="/game" className="text-sm hover:underline">
                  {t('footer.playNow')}
                </Link>
              </li>
              <li>
                <Link href="/statistics" className="text-sm hover:underline">
                  {t('footer.statistics')}
                </Link>
              </li>
              <li>
                <Link href="/blockchain-verification" className="text-sm hover:underline">
                  {t('footer.verification')}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-3">{t('footer.legal')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-sm hover:underline">
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm hover:underline">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link href="/responsible-gaming" className="text-sm hover:underline">
                  {t('footer.responsibleGaming')}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-6 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-xs text-muted-foreground">
              &copy; {currentYear} MS BINGO. {t('footer.allRightsReserved')}
            </p>
            <div className="flex items-center gap-4 mt-3 md:mt-0">
              <select 
                className="bg-transparent text-xs border border-border rounded px-2 py-1"
                aria-label={t('footer.selectLanguage')}
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
                <option value="pt">Português</option>
                <option value="it">Italiano</option>
                <option value="de">Deutsch</option>
                <option value="ar">العربية</option>
                <option value="zh">中文</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};