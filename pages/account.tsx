import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/auth-context';
import { Redirect } from 'wouter';
import AccountPanel from '@/components/account/account-panel';
import Wallet from '@/components/account/wallet';

const Account: React.FC = () => {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();
  
  // Redirect to home if not authenticated
  if (!isLoading && !user) {
    return <Redirect to="/" />;
  }
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-primary mb-6">{t('account.myAccount')}</h1>
      
      <Tabs defaultValue="account" className="max-w-4xl">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="account">{t('account.accountInfo')}</TabsTrigger>
          <TabsTrigger value="wallet">{t('account.wallet')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <AccountPanel />
        </TabsContent>
        
        <TabsContent value="wallet">
          <Wallet />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Account;
