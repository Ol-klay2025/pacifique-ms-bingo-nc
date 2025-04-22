import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/auth-context';
import { formatCurrency, formatDate } from '@/lib/gameUtils';
import { apiRequest } from '@/lib/queryClient';
import { Transaction, Win } from '@/lib/types';
import { Globe, Languages, LogOut, Wallet } from 'lucide-react';

const AccountPanel: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { state: authState, logout, updateLanguage } = useAuth();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wins, setWins] = useState<Win[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load transactions when the transactions tab is selected
  const handleTabChange = async (value: string) => {
    if (value === 'transactions' && transactions.length === 0) {
      try {
        setIsLoading(true);
        const response = await apiRequest('GET', '/api/transactions/my');
        const data = await response.json();
        setTransactions(data.transactions || []);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setIsLoading(false);
      }
    } else if (value === 'wins' && wins.length === 0) {
      try {
        setIsLoading(true);
        const response = await apiRequest('GET', '/api/wins/my');
        const data = await response.json();
        setWins(data.wins || []);
      } catch (error) {
        console.error('Error fetching wins:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const changeLanguage = (lang: 'en' | 'fr') => {
    updateLanguage(lang);
  };
  
  if (!authState.user) {
    return null;
  }
  
  return (
    <div className="space-y-6">
      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>{t('account.accountInfo')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
              <div>
                <div className="text-sm text-gray-500">{t('auth.username')}</div>
                <div className="font-medium">{authState.user.username}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">{t('account.joined')}</div>
                <div className="font-medium">
                  {formatDate(authState.user.createdAt, i18n.language)}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
              <div>
                <div className="text-sm text-gray-500">{t('auth.email')}</div>
                <div className="font-medium">
                  {authState.user.email || t('account.emailNotProvided')}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">{t('account.currentBalance')}</div>
                <div className="font-medium text-success">
                  {formatCurrency(authState.user.balance, i18n.language)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Subscription Info */}
      <Card>
        <CardHeader>
          <CardTitle>{t('subscription.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-500">{t('subscription.status')}</div>
                <div className="font-medium">
                  {authState.user.subscriptionStatus === 'active' ? (
                    <span className="text-success">{t('subscription.active')}</span>
                  ) : authState.user.subscriptionStatus === 'canceling' ? (
                    <span className="text-warning">{t('subscription.canceling')}</span>
                  ) : (
                    <span className="text-muted-foreground">{t('subscription.inactive')}</span>
                  )}
                </div>
              </div>
              
              {authState.user.subscriptionEndDate && (
                <div>
                  <div className="text-sm text-gray-500">{t('subscription.nextRenewal')}</div>
                  <div className="font-medium">
                    {formatDate(authState.user.subscriptionEndDate, i18n.language)}
                  </div>
                </div>
              )}
            </div>
            
            {authState.user.subscriptionStatus === 'active' ? (
              <Button 
                onClick={() => window.location.href = '/account/subscription'}
                variant="outline"
                size="sm"
                className="w-full"
              >
                {t('subscription.manage')}
              </Button>
            ) : (
              <Button 
                onClick={() => window.location.href = '/subscribe'}
                variant="default"
                size="sm"
                className="w-full"
              >
                {t('subscription.upgrade')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{t('account.settings')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Language Preference */}
            <div>
              <div className="text-sm font-medium mb-2 flex items-center">
                <Globe className="h-4 w-4 mr-2" />
                {t('account.languagePreference')}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={authState.user.language === 'en' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => changeLanguage('en')}
                >
                  English
                </Button>
                <Button
                  variant={authState.user.language === 'fr' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => changeLanguage('fr')}
                >
                  Français
                </Button>
              </div>
            </div>
            
            {/* Logout Button */}
            <div>
              <Button variant="outline" size="sm" onClick={() => logout()} className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                {t('auth.logout')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Transactions & Wins */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle>{t('account.history')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="transactions" onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="transactions">{t('account.transactions')}</TabsTrigger>
              <TabsTrigger value="wins">{t('account.wins')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="transactions" className="pt-4">
              {isLoading ? (
                <div className="text-center py-4">{t('common.loading')}</div>
              ) : transactions.length > 0 ? (
                <div className="space-y-2">
                  {transactions.map(transaction => (
                    <div key={transaction.id} className="flex justify-between items-center p-2 border-b">
                      <div>
                        <div className="font-medium">
                          {transaction.type === 'deposit' && t('account.deposit')}
                          {transaction.type === 'withdrawal' && t('account.withdrawal')}
                          {transaction.type === 'win' && t('account.winTransaction')}
                          {transaction.type === 'purchase' && t('account.purchase')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(transaction.createdAt, i18n.language)}
                        </div>
                      </div>
                      <div className={transaction.amount > 0 ? 'text-success' : 'text-destructive'}>
                        {transaction.amount > 0 ? '+' : ''}
                        {formatCurrency(transaction.amount, i18n.language)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  {t('account.noTransactions')}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="wins" className="pt-4">
              {isLoading ? (
                <div className="text-center py-4">{t('common.loading')}</div>
              ) : wins.length > 0 ? (
                <div className="space-y-2">
                  {wins.map(win => (
                    <div key={win.id} className="flex justify-between items-center p-2 border-b">
                      <div>
                        <div className="font-medium">
                          {win.winType === 'quine' ? t('game.quine') : t('game.bingo')}
                          {win.isJackpot && ` (${t('game.jackpot')})`}
                        </div>
                        <div className="text-xs text-gray-500">
                          {t('win.numbersCalled')}: {win.numbersCalled}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(win.createdAt, i18n.language)}
                        </div>
                      </div>
                      <div className="text-success">
                        +{formatCurrency(win.amount, i18n.language)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  {t('account.noWins')}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountPanel;
