import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Wallet, ExternalLink, AlertTriangle } from 'lucide-react';
import { useBlockchain } from '../../lib/blockchainService';

interface WalletConnectorProps {
  onWalletConnected?: (address: string) => void;
  className?: string;
}

/**
 * Composant pour connecter un portefeuille Ethereum (MetaMask)
 */
const WalletConnector: React.FC<WalletConnectorProps> = ({ onWalletConnected, className = '' }) => {
  const { t } = useTranslation();
  const { isMetaMaskAvailable, connectWallet, getWalletBalance } = useBlockchain();
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Vérifier si le wallet est déjà connecté au chargement
  useEffect(() => {
    const checkConnection = async () => {
      try {
        if (isMetaMaskAvailable() && window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            handleConnectedWallet(accounts[0]);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de la connexion du wallet:', error);
      }
    };

    checkConnection();
  }, []);

  // Actualiser la balance quand l'adresse change
  useEffect(() => {
    const updateBalance = async () => {
      if (address) {
        try {
          const walletBalance = await getWalletBalance(address);
          setBalance(walletBalance);
        } catch (error) {
          console.error('Erreur lors de la récupération du solde:', error);
        }
      }
    };

    updateBalance();
  }, [address, getWalletBalance]);

  const handleConnectedWallet = (walletAddress: string) => {
    setAddress(walletAddress);
    if (onWalletConnected) {
      onWalletConnected(walletAddress);
    }
  };

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      const walletAddress = await connectWallet();
      setIsConnecting(false);
      
      if (walletAddress) {
        handleConnectedWallet(walletAddress);
      }
    } catch (error) {
      setIsConnecting(false);
      console.error('Erreur de connexion:', error);
    }
  };

  // Afficher le guide d'installation de MetaMask si non disponible
  if (!isMetaMaskAvailable()) {
    return (
      <div className={`bg-card rounded-lg shadow-sm p-6 ${className}`}>
        <div className="text-center">
          <div className="inline-block p-3 bg-amber-100 rounded-full mb-4">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{t('blockchain.installMetaMask')}</h3>
          <p className="text-muted-foreground mb-4">{t('blockchain.metaMaskRequired')}</p>
          <a 
            href="https://metamask.io/download/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded font-medium hover:bg-primary/90 transition-colors"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            {t('blockchain.installMetaMaskButton')}
          </a>
        </div>
      </div>
    );
  }

  // Afficher les détails du wallet si connecté
  if (address) {
    return (
      <div className={`bg-card rounded-lg shadow-sm p-6 ${className}`}>
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Wallet className="h-5 w-5 mr-2 text-primary" />
          {t('blockchain.connectedWallet')}
        </h3>
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-muted/50 rounded-lg p-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">{t('blockchain.address')}</div>
            <div className="font-mono text-sm break-all">
              {address}
            </div>
          </div>
          <div className="mt-3 md:mt-0 md:ml-4">
            <div className="text-sm text-muted-foreground mb-1">{t('blockchain.balance')}</div>
            <div className="font-medium">{balance ? `${parseFloat(balance).toFixed(4)} ETH` : t('common.loading')}</div>
          </div>
        </div>
      </div>
    );
  }

  // Afficher le bouton de connexion si non connecté
  return (
    <div className={`bg-card rounded-lg shadow-sm p-6 ${className}`}>
      <h3 className="text-xl font-semibold mb-2">{t('blockchain.connectWallet')}</h3>
      <p className="text-muted-foreground mb-4">{t('blockchain.connectWalletDescription')}</p>
      <button
        onClick={handleConnectWallet}
        disabled={isConnecting}
        className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isConnecting ? (
          <>
            <div className="h-4 w-4 mr-2 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            {t('common.connecting')}
          </>
        ) : (
          <>
            <Wallet className="h-4 w-4 mr-2" />
            {t('blockchain.connectWithMetaMask')}
          </>
        )}
      </button>
    </div>
  );
};

export default WalletConnector;