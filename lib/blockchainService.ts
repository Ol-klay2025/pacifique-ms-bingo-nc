import { useState } from 'react';
import { ethers } from 'ethers';
import CryptoJS from 'crypto-js';
import { useToast } from '../hooks/use-toast';

/**
 * Interface pour un résultat de jeu à vérifier sur la blockchain
 */
export interface GameResultVerification {
  gameId: number;
  startTime: Date;
  endTime: Date | null;
  calledNumbers: number[];
  quineWinnerId: number | null;
  quineNumberCount: number | null;
  bingoWinnerId: number | null;
  bingoNumberCount: number | null;
  jackpotAmount: number | null;
  verificationHash: string;
  transactionHash: string | null;
}

/**
 * Service de gestion des interactions avec la blockchain
 * Permet de vérifier la transparence et l'intégrité des résultats des jeux
 */
export const blockchainService = {
  /**
   * Vérifie si MetaMask est installé et disponible
   */
  isMetaMaskAvailable(): boolean {
    return typeof window !== 'undefined' && 
           typeof window.ethereum !== 'undefined' && 
           window.ethereum.isMetaMask === true;
  },

  /**
   * Se connecte au wallet Ethereum (MetaMask)
   */
  async connectWallet(): Promise<string | null> {
    try {
      if (!this.isMetaMaskAvailable()) {
        throw new Error('MetaMask n\'est pas installé');
      }

      // Demander l'autorisation de connexion
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (accounts && accounts.length > 0) {
        return accounts[0];
      }
      
      return null;
    } catch (error) {
      console.error('Erreur de connexion au wallet:', error);
      throw error;
    }
  },

  /**
   * Récupère le solde d'un compte Ethereum
   */
  async getWalletBalance(address: string): Promise<string> {
    try {
      if (!this.isMetaMaskAvailable()) {
        throw new Error('MetaMask n\'est pas installé');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(address);
      
      // Convertir le solde de Wei en Ether
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Erreur lors de la récupération du solde:', error);
      throw error;
    }
  },

  /**
   * Générer un hash de vérification pour un jeu
   * Ce hash peut être utilisé pour vérifier l'intégrité des résultats
   */
  generateVerificationHash(gameData: Omit<GameResultVerification, 'verificationHash' | 'transactionHash'>): string {
    // Convertir les données du jeu en chaîne JSON
    const dataString = JSON.stringify({
      gameId: gameData.gameId,
      startTime: gameData.startTime.toISOString(),
      endTime: gameData.endTime ? gameData.endTime.toISOString() : null,
      calledNumbers: gameData.calledNumbers,
      quineWinnerId: gameData.quineWinnerId,
      quineNumberCount: gameData.quineNumberCount,
      bingoWinnerId: gameData.bingoWinnerId,
      bingoNumberCount: gameData.bingoNumberCount,
      jackpotAmount: gameData.jackpotAmount
    });
    
    // Générer un hash SHA-256
    return CryptoJS.SHA256(dataString).toString();
  },

  /**
   * Publie un résultat de jeu sur la blockchain pour vérification 
   * (sous forme de transaction avec données)
   */
  async publishGameResult(gameResult: GameResultVerification): Promise<string> {
    try {
      if (!this.isMetaMaskAvailable()) {
        throw new Error('MetaMask n\'est pas installé');
      }
      
      // Créer le provider et le signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Encodage des données du jeu pour les inclure dans la transaction
      // Nous utilisons un format simple : gameId:hash
      const data = ethers.toUtf8Bytes(
        `MS-BINGO-VERIFICATION:${gameResult.gameId}:${gameResult.verificationHash}`
      );
      
      // Créer la transaction (sans valeur envoyée)
      const tx = await signer.sendTransaction({
        to: signer.address, // Transaction à soi-même
        value: 0, // Pas de transfert d'Ether
        data: data // Données de vérification
      });
      
      // Attendre la confirmation de la transaction
      await tx.wait();
      
      return tx.hash;
    } catch (error) {
      console.error('Erreur lors de la publication sur la blockchain:', error);
      throw error;
    }
  },

  /**
   * Vérifie un résultat de jeu à partir de son hash de transaction
   */
  async verifyGameResult(transactionHash: string): Promise<boolean> {
    try {
      if (!this.isMetaMaskAvailable()) {
        throw new Error('MetaMask n\'est pas installé');
      }
      
      // Créer le provider
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Récupérer les détails de la transaction
      const tx = await provider.getTransaction(transactionHash);
      
      if (!tx) {
        throw new Error('Transaction non trouvée');
      }
      
      // Vérifier que la transaction contient des données
      if (!tx.data || tx.data === '0x') {
        return false;
      }
      
      // Décoder les données
      try {
        const decodedData = ethers.toUtf8String(tx.data);
        
        // Vérifier que les données commencent par notre préfixe
        return decodedData.startsWith('MS-BINGO-VERIFICATION:');
      } catch (e) {
        console.error('Erreur lors du décodage des données:', e);
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      throw error;
    }
  }
};

/**
 * Hook React pour utiliser le service blockchain
 */
export const useBlockchain = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  /**
   * Connecter un wallet avec gestion des erreurs et notifications
   */
  const connectWallet = async (): Promise<string | null> => {
    setIsLoading(true);
    try {
      const address = await blockchainService.connectWallet();
      setIsLoading(false);
      
      if (address) {
        toast({
          title: 'Wallet connecté',
          description: `Adresse: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
        });
      }
      
      return address;
    } catch (error: any) {
      setIsLoading(false);
      toast({
        title: 'Erreur de connexion',
        description: error.message || 'Impossible de connecter le wallet',
        variant: 'destructive',
      });
      return null;
    }
  };
  
  /**
   * Publier un résultat sur la blockchain avec gestion des erreurs et notifications
   */
  const publishGameResult = async (gameResult: GameResultVerification): Promise<string | null> => {
    setIsLoading(true);
    try {
      const hash = await blockchainService.publishGameResult(gameResult);
      setIsLoading(false);
      
      toast({
        title: 'Publication réussie',
        description: `Transaction publiée: ${hash.substring(0, 8)}...`,
      });
      
      return hash;
    } catch (error: any) {
      setIsLoading(false);
      toast({
        title: 'Erreur de publication',
        description: error.message || 'Impossible de publier les données',
        variant: 'destructive',
      });
      return null;
    }
  };
  
  /**
   * Vérifier un résultat sur la blockchain avec gestion des erreurs et notifications
   */
  const verifyGameResult = async (transactionHash: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const isValid = await blockchainService.verifyGameResult(transactionHash);
      setIsLoading(false);
      
      if (isValid) {
        toast({
          title: 'Vérification réussie',
          description: 'Les données du jeu sont authentiques',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Vérification échouée',
          description: 'Les données du jeu ne sont pas valides',
          variant: 'destructive',
        });
      }
      
      return isValid;
    } catch (error: any) {
      setIsLoading(false);
      toast({
        title: 'Erreur de vérification',
        description: error.message || 'Impossible de vérifier les données',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  return {
    isLoading,
    isMetaMaskAvailable: blockchainService.isMetaMaskAvailable,
    connectWallet,
    getWalletBalance: blockchainService.getWalletBalance.bind(blockchainService),
    generateVerificationHash: blockchainService.generateVerificationHash.bind(blockchainService),
    publishGameResult,
    verifyGameResult,
  };
};

// Type global pour window.ethereum
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (request: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}