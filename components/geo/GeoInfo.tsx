import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Globe, Lock, CheckCircle, ChevronDown, ChevronUp, MapPin } from 'lucide-react';

interface GeoInfoData {
  ip: string;
  country: string | null;
  countryName: string | null;
  region: string | null;
  city: string | null;
  restricted: boolean;
}

/**
 * Component to display geographic information and restriction status
 * Used in the homepage or footer to inform the user
 */
export const GeoInfo = () => {
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);
  
  const { data, isLoading, error } = useQuery<GeoInfoData>({
    queryKey: ['/api/geo-info'],
    queryFn: async () => {
      const response = await apiRequest<GeoInfoData>('GET', '/api/geo-info');
      return response;
    },
  });

  if (isLoading) {
    return (
      <div className="mt-2 text-xs flex items-center text-muted-foreground">
        <Globe className="h-3.5 w-3.5 mr-1" />
        <span>{t('common.loading')}</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mt-2 text-xs flex items-center text-muted-foreground">
        <Globe className="h-3.5 w-3.5 mr-1" />
        <span>{t('geo.locationUnknown')}</span>
      </div>
    );
  }

  const toggleDetails = () => setShowDetails(!showDetails);

  return (
    <div className="text-xs text-muted-foreground mt-2">
      <div className="flex items-center">
        {data.restricted ? (
          <Lock className="h-3.5 w-3.5 mr-1 text-destructive" />
        ) : (
          <CheckCircle className="h-3.5 w-3.5 mr-1 text-green-500" />
        )}
        
        <span className="font-medium">
          {data.restricted ? t('geo.restricted') : t('geo.allowed')}
        </span>
        
        {data.countryName ? (
          <span className="ml-1">
            - {t('geo.accessFrom', { country: data.countryName })}
          </span>
        ) : (
          <span className="ml-1">- {t('geo.locationUnknown')}</span>
        )}
        
        <button 
          onClick={toggleDetails}
          className="ml-1 inline-flex items-center text-primary hover:text-primary/80 transition-colors"
          aria-label={showDetails ? t('common.hide') : t('common.details')}
        >
          {showDetails ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </button>
      </div>
      
      {showDetails && (
        <div className="mt-1 ml-5 space-y-1 text-xs">
          <p>{data.restricted ? t('geo.restrictedMessage') : t('geo.allowedMessage')}</p>
          
          <div className="mt-2 space-y-0.5">
            <div className="flex items-start">
              <span className="font-medium min-w-20">{t('geo.country')}:</span>
              <span>{data.countryName || data.country || t('geo.locationUnknown')}</span>
            </div>
            
            {data.region && (
              <div className="flex items-start">
                <span className="font-medium min-w-20">{t('geo.region')}:</span>
                <span>{data.region}</span>
              </div>
            )}
            
            {data.city && (
              <div className="flex items-start">
                <span className="font-medium min-w-20">{t('geo.city')}:</span>
                <span>{data.city}</span>
              </div>
            )}
          </div>
          
          <p className="mt-2 text-xs italic">{t('geo.infoMessage')}</p>
        </div>
      )}
    </div>
  );
};