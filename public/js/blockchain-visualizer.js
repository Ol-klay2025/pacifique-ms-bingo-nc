/**
 * Visualiseur de Transactions Blockchain
 * Module pour afficher et animer des transactions blockchain dans une interface visuelle
 * PACIFIQUE MS BINGO - Version: Avril 2025
 */

class BlockchainVisualizer {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Container with ID ${containerId} not found`);
      return;
    }

    // Configuration par défaut avec options personnalisables
    this.config = {
      blockCount: options.blockCount || 6,
      transactionSpeed: options.transactionSpeed || 2000,
      animationDuration: options.animationDuration || 1500,
      autoPlay: options.autoPlay !== undefined ? options.autoPlay : true,
      currencySymbol: options.currencySymbol || '₣',
      language: options.language || 'fr',
      blockchainType: options.blockchainType || 'ethereum',
      ...options
    };

    // États et données
    this.blocks = [];
    this.transactions = [];
    this.stats = {
      totalTransactions: 0,
      confirmedTransactions: 0,
      totalValue: 0,
      averageTime: 0
    };
    this.animationActive = this.config.autoPlay;
    this.transactionInterval = null;
    this.hoveredElement = null;

    // Sélection de couleurs par type de blockchain
    this.blockColors = {
      'ethereum': { 
        gradient: 'linear-gradient(135deg, #6b8cee, #3944BC)',
        border: 'rgba(111, 140, 238, 0.7)'
      },
      'bitcoin': {
        gradient: 'linear-gradient(135deg, #F7931A, #CB7B19)',
        border: 'rgba(247, 147, 26, 0.7)'
      },
      'solana': {
        gradient: 'linear-gradient(135deg, #9945FF, #6A35B0)',
        border: 'rgba(153, 69, 255, 0.7)'
      },
      'pacifique': {
        gradient: 'linear-gradient(135deg, #00A2CC, #006699)',
        border: 'rgba(0, 162, 204, 0.7)'
      }
    };

    this.selectedColors = this.blockColors[this.config.blockchainType] || this.blockColors.pacifique;

    // Initialiser l'interface
    this.initializeUI();
    this.createBlocks();
    this.updateStats();
    this.setupEventListeners();

    // Démarrer les animations si autoPlay est activé
    if (this.config.autoPlay) {
      this.startTransactionSimulation();
    }
  }

  // Initialisation de l'interface utilisateur
  initializeUI() {
    const containerHTML = `
      <div class="blockchain-visualizer-container">
        <h3 class="blockchain-title">${this.getTranslation('blockchainTitle')}</h3>
        <div class="blockchain-canvas" id="${this.container.id}-canvas"></div>
        <div class="blockchain-stats">
          <div class="stat-item">
            <div class="stat-value" id="${this.container.id}-total-tx">0</div>
            <div class="stat-label">${this.getTranslation('totalTransactions')}</div>
          </div>
          <div class="stat-item">
            <div class="stat-value" id="${this.container.id}-confirmed-tx">0</div>
            <div class="stat-label">${this.getTranslation('confirmedTransactions')}</div>
          </div>
          <div class="stat-item">
            <div class="stat-value" id="${this.container.id}-total-value">0 ${this.config.currencySymbol}</div>
            <div class="stat-label">${this.getTranslation('totalValue')}</div>
          </div>
          <div class="stat-item">
            <div class="stat-value" id="${this.container.id}-avg-time">0s</div>
            <div class="stat-label">${this.getTranslation('avgConfirmationTime')}</div>
          </div>
        </div>
        <div class="animation-controls">
          <button class="control-button" id="${this.container.id}-play-pause">
            ${this.config.autoPlay ? this.getTranslation('pause') : this.getTranslation('play')}
          </button>
          <button class="control-button" id="${this.container.id}-add-tx">
            ${this.getTranslation('addTransaction')}
          </button>
          <button class="control-button" id="${this.container.id}-clear">
            ${this.getTranslation('clearAll')}
          </button>
        </div>
        <div class="transaction-details" id="${this.container.id}-tx-details"></div>
      </div>
    `;

    this.container.innerHTML = containerHTML;
    this.canvas = document.getElementById(`${this.container.id}-canvas`);
    this.txDetails = document.getElementById(`${this.container.id}-tx-details`);
  }

  // Création des blocs initiaux
  createBlocks() {
    const blockWidth = 100;
    const canvasWidth = this.canvas.offsetWidth;
    const canvasHeight = this.canvas.offsetHeight;
    const horizontalSpacing = (canvasWidth - blockWidth) / (this.config.blockCount - 1);

    for (let i = 0; i < this.config.blockCount; i++) {
      const blockElement = document.createElement('div');
      blockElement.className = 'block';
      blockElement.style.left = `${i * horizontalSpacing}px`;
      blockElement.style.top = `${canvasHeight / 2 - 70}px`;
      blockElement.style.background = this.selectedColors.gradient;
      blockElement.style.borderColor = this.selectedColors.border;

      const blockNumber = this.config.startingBlock ? this.config.startingBlock + i : 10000000 + i;
      const blockHash = this.generateRandomHash();

      blockElement.innerHTML = `
        <div class="block-header">${this.getTranslation('block')} #${blockNumber}</div>
        <div class="block-content">
          <div class="block-hash">${blockHash.substring(0, 10)}...</div>
          <div class="block-value">0 ${this.config.currencySymbol}</div>
        </div>
        <div class="block-footer">${this.getTranslation('transactions')}: 0</div>
      `;

      this.canvas.appendChild(blockElement);

      this.blocks.push({
        element: blockElement,
        number: blockNumber,
        hash: blockHash,
        transactions: [],
        value: 0,
        x: i * horizontalSpacing,
        y: canvasHeight / 2 - 70
      });

      // Ajouter les connexions entre les blocs
      if (i > 0) {
        const connectionElement = document.createElement('div');
        connectionElement.className = 'blockchain-connection';
        connectionElement.style.left = `${(i - 1) * horizontalSpacing + blockWidth}px`;
        connectionElement.style.top = `${canvasHeight / 2}px`;
        connectionElement.style.width = `${horizontalSpacing - blockWidth}px`;
        this.canvas.appendChild(connectionElement);
      }
    }
  }

  // Ajout d'une nouvelle transaction
  addTransaction(options = {}) {
    // Essayer de récupérer des données de transaction depuis l'API
    const useAPI = options.useAPI !== false && !options.value;
    
    if (useAPI) {
      fetch('/api/blockchain/transactions')
        .then(response => response.json())
        .then(data => {
          if (data.transactions && data.transactions.length > 0) {
            // Prendre une transaction aléatoire des données reçues
            const apiTx = data.transactions[Math.floor(Math.random() * data.transactions.length)];
            this.createAndAnimateTransaction({
              value: apiTx.value,
              id: apiTx.id,
              senderAddress: apiTx.sender,
              receiverAddress: apiTx.receiver
            });
          } else {
            // Fallback sur une transaction générée localement
            this.createAndAnimateTransaction(options);
          }
        })
        .catch(error => {
          console.warn('Erreur lors de la récupération des transactions:', error);
          // Fallback sur une transaction générée localement
          this.createAndAnimateTransaction(options);
        });
    } else {
      // Création directe sans API
      this.createAndAnimateTransaction(options);
    }
  }
  
  // Création et animation d'une transaction
  createAndAnimateTransaction(options = {}) {
    const transactionValue = options.value || this.getRandomValue();
    const canvasWidth = this.canvas.offsetWidth;
    const canvasHeight = this.canvas.offsetHeight;
    
    // Créer l'élément de transaction
    const txElement = document.createElement('div');
    txElement.className = 'transaction new';
    
    // Positionner la transaction en haut ou à gauche du canvas
    const startFromTop = Math.random() > 0.5;
    let startX, startY;
    
    if (startFromTop) {
      startX = Math.random() * canvasWidth;
      startY = 0;
    } else {
      startX = 0;
      startY = Math.random() * canvasHeight;
    }
    
    txElement.style.left = `${startX}px`;
    txElement.style.top = `${startY}px`;
    
    this.canvas.appendChild(txElement);
    
    // Déterminer le bloc de destination (aléatoire parmi les blocs existants)
    const targetBlockIndex = Math.floor(Math.random() * this.blocks.length);
    const targetBlock = this.blocks[targetBlockIndex];
    
    // Créer l'objet de transaction
    const txId = options.id || this.generateRandomHash();
    txElement.setAttribute('data-id', txId);
    
    const transaction = {
      id: txId,
      element: txElement,
      value: transactionValue,
      status: 'pending',
      targetBlock: targetBlockIndex,
      createdAt: Date.now(),
      senderAddress: options.senderAddress || this.generateRandomAddress(),
      receiverAddress: options.receiverAddress || this.generateRandomAddress(),
      gasPrice: Math.floor(Math.random() * 100) + 20,
      startX,
      startY,
      currentX: startX,
      currentY: startY,
      targetX: targetBlock.x + 50, // Centre du bloc
      targetY: targetBlock.y + 70  // Centre du bloc
    };
    
    this.transactions.push(transaction);
    this.stats.totalTransactions++;
    
    // Mettre à jour l'affichage des statistiques
    this.updateStats();
    
    // Animer la transaction
    this.animateTransaction(transaction);
    
    return transaction;
  }

  // Animation d'une transaction
  animateTransaction(transaction) {
    const duration = this.config.animationDuration;
    const startTime = Date.now();
    const targetBlock = this.blocks[transaction.targetBlock];
    
    // Fonction d'animation
    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Calculer la position actuelle avec une courbe d'animation (easeOutQuad)
      const easeProgress = 1 - (1 - progress) * (1 - progress);
      transaction.currentX = transaction.startX + (transaction.targetX - transaction.startX) * easeProgress;
      transaction.currentY = transaction.startY + (transaction.targetY - transaction.startY) * easeProgress;
      
      // Mettre à jour la position de l'élément
      transaction.element.style.left = `${transaction.currentX}px`;
      transaction.element.style.top = `${transaction.currentY}px`;
      
      // Continuer l'animation si non complète
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animation terminée, intégrer la transaction au bloc
        this.confirmTransaction(transaction);
      }
    };
    
    // Démarrer l'animation
    requestAnimationFrame(animate);
  }

  // Confirmation d'une transaction
  confirmTransaction(transaction) {
    // Changer le statut et l'apparence de la transaction
    transaction.status = 'confirmed';
    transaction.element.classList.remove('new', 'pending');
    transaction.element.classList.add('confirmed');
    transaction.confirmedAt = Date.now();
    
    // Ajouter la transaction au bloc cible
    const targetBlock = this.blocks[transaction.targetBlock];
    targetBlock.transactions.push(transaction);
    targetBlock.value += transaction.value;
    
    // Faire disparaître la transaction après un court délai
    setTimeout(() => {
      transaction.element.style.opacity = '0';
      setTimeout(() => {
        if (transaction.element.parentNode) {
          transaction.element.parentNode.removeChild(transaction.element);
        }
      }, 500);
      
      // Mettre à jour les informations du bloc
      targetBlock.element.querySelector('.block-value').textContent = 
        `${targetBlock.value.toLocaleString()} ${this.config.currencySymbol}`;
      targetBlock.element.querySelector('.block-footer').textContent = 
        `${this.getTranslation('transactions')}: ${targetBlock.transactions.length}`;
      
      // Effet visuel sur le bloc
      targetBlock.element.style.transform = 'scale(1.1)';
      setTimeout(() => {
        targetBlock.element.style.transform = 'scale(1)';
      }, 300);
    }, 500);
    
    // Mettre à jour les statistiques
    this.stats.confirmedTransactions++;
    this.stats.totalValue += transaction.value;
    
    // Calculer le temps moyen de confirmation
    const confirmationTime = (transaction.confirmedAt - transaction.createdAt) / 1000; // en secondes
    if (this.stats.averageTime === 0) {
      this.stats.averageTime = confirmationTime;
    } else {
      this.stats.averageTime = (this.stats.averageTime * (this.stats.confirmedTransactions - 1) + confirmationTime) / this.stats.confirmedTransactions;
    }
    
    this.updateStats();
  }

  // Mise à jour des statistiques affichées
  updateStats() {
    // Essayer de récupérer des statistiques depuis l'API
    fetch('/api/blockchain/stats')
      .then(response => response.json())
      .then(data => {
        // Mettre à jour avec les données de l'API
        this.stats.totalTransactions = data.totalTransactions || this.stats.totalTransactions;
        this.stats.confirmedTransactions = data.confirmedTransactions || this.stats.confirmedTransactions;
        this.stats.totalValue = data.totalValue || this.stats.totalValue;
        this.stats.averageTime = data.averageTime || this.stats.averageTime;
        
        // Mettre à jour l'affichage
        document.getElementById(`${this.container.id}-total-tx`).textContent = 
          this.stats.totalTransactions.toLocaleString();
        document.getElementById(`${this.container.id}-confirmed-tx`).textContent = 
          this.stats.confirmedTransactions.toLocaleString();
        document.getElementById(`${this.container.id}-total-value`).textContent = 
          `${this.stats.totalValue.toLocaleString()} ${this.config.currencySymbol}`;
        document.getElementById(`${this.container.id}-avg-time`).textContent = 
          `${this.stats.averageTime}s`;
      })
      .catch(error => {
        console.warn('Erreur lors de la récupération des statistiques:', error);
        // Utiliser les statistiques locales en cas d'erreur
        document.getElementById(`${this.container.id}-total-tx`).textContent = 
          this.stats.totalTransactions.toLocaleString();
        document.getElementById(`${this.container.id}-confirmed-tx`).textContent = 
          this.stats.confirmedTransactions.toLocaleString();
        document.getElementById(`${this.container.id}-total-value`).textContent = 
          `${this.stats.totalValue.toLocaleString()} ${this.config.currencySymbol}`;
        document.getElementById(`${this.container.id}-avg-time`).textContent = 
          `${this.stats.averageTime.toFixed(1)}s`;
      });
  }

  // Démarrage de la simulation de transactions
  startTransactionSimulation() {
    this.animationActive = true;
    document.getElementById(`${this.container.id}-play-pause`).textContent = this.getTranslation('pause');
    
    // Créer des transactions à intervalle régulier
    this.transactionInterval = setInterval(() => {
      if (this.animationActive) {
        this.addTransaction();
      }
    }, this.config.transactionSpeed);
  }

  // Arrêt de la simulation
  stopTransactionSimulation() {
    this.animationActive = false;
    document.getElementById(`${this.container.id}-play-pause`).textContent = this.getTranslation('play');
    
    if (this.transactionInterval) {
      clearInterval(this.transactionInterval);
      this.transactionInterval = null;
    }
  }

  // Configuration des écouteurs d'événements
  setupEventListeners() {
    // Bouton Play/Pause
    const playPauseButton = document.getElementById(`${this.container.id}-play-pause`);
    playPauseButton.addEventListener('click', () => {
      if (this.animationActive) {
        this.stopTransactionSimulation();
      } else {
        this.startTransactionSimulation();
      }
    });
    
    // Bouton d'ajout de transaction
    const addTxButton = document.getElementById(`${this.container.id}-add-tx`);
    addTxButton.addEventListener('click', () => {
      this.addTransaction({ value: this.getRandomValue(100, 5000) });
    });
    
    // Bouton de réinitialisation
    const clearButton = document.getElementById(`${this.container.id}-clear`);
    clearButton.addEventListener('click', () => {
      this.clearAll();
    });
    
    // Événements de survol pour les transactions et les blocs
    this.canvas.addEventListener('mousemove', (e) => {
      const target = e.target;
      
      // Vérifier si on survole une transaction ou un bloc
      if (target.classList.contains('transaction') || target.classList.contains('block')) {
        this.hoveredElement = target;
        this.showTooltip(e, target);
      } else {
        this.hideTooltip();
        this.hoveredElement = null;
      }
    });
    
    this.canvas.addEventListener('mouseleave', () => {
      this.hideTooltip();
      this.hoveredElement = null;
    });
  }

  // Affichage d'une infobulle au survol
  showTooltip(event, element) {
    if (element.classList.contains('transaction')) {
      // Trouver la transaction
      const txId = element.getAttribute('data-id');
      const transaction = this.transactions.find(tx => tx.id === txId);
      
      if (transaction) {
        this.txDetails.innerHTML = `
          <strong>${this.getTranslation('transaction')}</strong><br>
          ID: ${transaction.id.substring(0, 8)}...<br>
          ${this.getTranslation('value')}: ${transaction.value} ${this.config.currencySymbol}<br>
          ${this.getTranslation('status')}: ${this.getTranslation(transaction.status)}<br>
          ${this.getTranslation('sender')}: ${transaction.senderAddress.substring(0, 8)}...<br>
          ${this.getTranslation('receiver')}: ${transaction.receiverAddress.substring(0, 8)}...
        `;
      }
    } else if (element.classList.contains('block')) {
      // Trouver le bloc
      const blockIndex = Array.from(this.canvas.querySelectorAll('.block')).indexOf(element);
      const block = this.blocks[blockIndex];
      
      if (block) {
        this.txDetails.innerHTML = `
          <strong>${this.getTranslation('block')} #${block.number}</strong><br>
          ${this.getTranslation('hash')}: ${block.hash.substring(0, 10)}...<br>
          ${this.getTranslation('transactions')}: ${block.transactions.length}<br>
          ${this.getTranslation('totalValue')}: ${block.value} ${this.config.currencySymbol}
        `;
      }
    }
    
    // Positionner l'infobulle
    this.txDetails.style.display = 'block';
    this.txDetails.style.left = `${event.pageX - this.container.offsetLeft + 10}px`;
    this.txDetails.style.top = `${event.pageY - this.container.offsetTop + 10}px`;
  }

  // Masquage de l'infobulle
  hideTooltip() {
    this.txDetails.style.display = 'none';
  }

  // Réinitialisation complète du visualiseur
  clearAll() {
    // Arrêter l'animation
    this.stopTransactionSimulation();
    
    // Supprimer toutes les transactions
    this.transactions.forEach(tx => {
      if (tx.element && tx.element.parentNode) {
        tx.element.parentNode.removeChild(tx.element);
      }
    });
    this.transactions = [];
    
    // Réinitialiser les blocs
    this.blocks.forEach(block => {
      block.transactions = [];
      block.value = 0;
      block.element.querySelector('.block-value').textContent = `0 ${this.config.currencySymbol}`;
      block.element.querySelector('.block-footer').textContent = `${this.getTranslation('transactions')}: 0`;
    });
    
    // Réinitialiser les statistiques
    this.stats = {
      totalTransactions: 0,
      confirmedTransactions: 0,
      totalValue: 0,
      averageTime: 0
    };
    this.updateStats();
  }

  // Fonctions utilitaires
  getRandomValue(min = 10, max = 1000) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  generateRandomHash() {
    let hash = '0x';
    const chars = '0123456789abcdef';
    for (let i = 0; i < 40; i++) {
      hash += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return hash;
  }

  generateRandomAddress() {
    let address = '0x';
    const chars = '0123456789abcdef';
    for (let i = 0; i < 40; i++) {
      address += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return address;
  }

  // Traductions pour l'internationalisation
  getTranslation(key) {
    const translations = {
      fr: {
        blockchainTitle: 'Visualiseur de Transactions Blockchain',
        totalTransactions: 'Total Transactions',
        confirmedTransactions: 'Transactions Confirmées',
        totalValue: 'Valeur Totale',
        avgConfirmationTime: 'Temps de Confirmation Moyen',
        play: 'Démarrer',
        pause: 'Pause',
        addTransaction: 'Ajouter Transaction',
        clearAll: 'Réinitialiser',
        block: 'Bloc',
        transactions: 'Transactions',
        transaction: 'Transaction',
        value: 'Valeur',
        status: 'Statut',
        confirmed: 'Confirmée',
        pending: 'En attente',
        sender: 'Expéditeur',
        receiver: 'Destinataire',
        hash: 'Hash',
        gasPrice: 'Prix du Gaz'
      },
      en: {
        blockchainTitle: 'Blockchain Transaction Visualizer',
        totalTransactions: 'Total Transactions',
        confirmedTransactions: 'Confirmed Transactions',
        totalValue: 'Total Value',
        avgConfirmationTime: 'Avg Confirmation Time',
        play: 'Play',
        pause: 'Pause',
        addTransaction: 'Add Transaction',
        clearAll: 'Clear All',
        block: 'Block',
        transactions: 'Transactions',
        transaction: 'Transaction',
        value: 'Value',
        status: 'Status',
        confirmed: 'Confirmed',
        pending: 'Pending',
        sender: 'Sender',
        receiver: 'Receiver',
        hash: 'Hash',
        gasPrice: 'Gas Price'
      }
    };
    
    return translations[this.config.language][key] || key;
  }
}

// Fonction d'initialisation pour installer le visualiseur sur une page
function initBlockchainVisualizer(containerId, options) {
  return new BlockchainVisualizer(containerId, options);
}

// Export pour utilisation comme module
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = {
    BlockchainVisualizer,
    initBlockchainVisualizer
  };
}