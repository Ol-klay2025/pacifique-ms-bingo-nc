/**
 * Module d'affichage de boules de bingo 3D réalistes
 * MS BINGO PACIFIQUE - Style de boules réalistes avec numéros
 */

class BingoBall3D {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' 
      ? document.getElementById(container) 
      : container;
    
    this.options = {
      size: options.size || 100,
      colors: options.colors || [
        '#1a75ff', // bleu
        '#ff5c33', // rouge-orange
        '#33cc33', // vert
        '#ffcc00', // jaune
        '#cc33ff'  // violet
      ],
      highlightColor: options.highlightColor || '#ffffff',
      animationDuration: options.animationDuration || 800,
      floatingEffect: options.floatingEffect !== undefined ? options.floatingEffect : true,
      reflectionEffect: options.reflectionEffect !== undefined ? options.reflectionEffect : true,
      glowEffect: options.glowEffect !== undefined ? options.glowEffect : true,
      backgroundImage: options.backgroundImage || null
    };
    
    this.drawnNumbers = [];
    this.currentNumber = null;
    
    // Initialisation du conteneur
    this.setupContainer();
    
    // Créer les éléments pour l'historique des numéros
    this.setupHistoryContainer();
  }
  
  setupContainer() {
    // S'assurer que le conteneur a une position relative ou absolue
    const currentPosition = window.getComputedStyle(this.container).position;
    if (currentPosition !== 'relative' && currentPosition !== 'absolute') {
      this.container.style.position = 'relative';
    }
    
    // Appliquer une image de fond si spécifiée
    if (this.options.backgroundImage) {
      this.container.style.backgroundImage = `url(${this.options.backgroundImage})`;
      this.container.style.backgroundSize = 'cover';
      this.container.style.backgroundPosition = 'center';
    }
    
    // Conteneur pour la boule principale
    this.mainBallContainer = document.createElement('div');
    this.mainBallContainer.className = 'bingo-ball-main-container';
    this.mainBallContainer.style.height = `${this.options.size * 2}px`;
    this.mainBallContainer.style.display = 'flex';
    this.mainBallContainer.style.justifyContent = 'center';
    this.mainBallContainer.style.alignItems = 'center';
    this.mainBallContainer.style.perspective = '800px';
    
    this.container.appendChild(this.mainBallContainer);
  }
  
  setupHistoryContainer() {
    // Conteneur pour l'historique des boules
    this.historyContainer = document.createElement('div');
    this.historyContainer.className = 'bingo-ball-history-container';
    this.historyContainer.style.display = 'flex';
    this.historyContainer.style.flexDirection = 'column';
    this.historyContainer.style.alignItems = 'center';
    this.historyContainer.style.marginTop = '25px';
    this.historyContainer.style.padding = '15px 10px';
    this.historyContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
    this.historyContainer.style.backdropFilter = 'blur(8px)';
    this.historyContainer.style.borderRadius = '15px';
    this.historyContainer.style.maxWidth = '100%';
    this.historyContainer.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.15)';
    this.historyContainer.style.border = '1px solid rgba(255, 255, 255, 0.2)';
    
    // Ajouter un titre pour cette section
    const historyTitle = document.createElement('div');
    historyTitle.textContent = 'Numéros tirés:';
    historyTitle.style.width = '100%';
    historyTitle.style.textAlign = 'center';
    historyTitle.style.marginBottom = '10px';
    historyTitle.style.fontWeight = 'bold';
    historyTitle.style.fontSize = '16px';
    historyTitle.style.color = 'white';
    historyTitle.style.textShadow = '0 1px 2px rgba(0,0,0,0.3)';
    this.historyContainer.appendChild(historyTitle);
    
    // Ajout d'un conteneur spécifique pour les boules en rangée horizontale
    const ballsContainer = document.createElement('div');
    ballsContainer.className = 'history-balls-container';
    ballsContainer.style.display = 'grid';
    ballsContainer.style.gridTemplateColumns = 'repeat(7, 1fr)'; // 7 colonnes
    ballsContainer.style.gridTemplateRows = 'repeat(2, 1fr)'; // 2 lignes (pour flexibilité)
    ballsContainer.style.gap = '8px';
    ballsContainer.style.width = '100%';
    ballsContainer.style.padding = '10px 5px';
    ballsContainer.style.justifyContent = 'center'; // Centrer les boules
    
    // Style pour afficher les boules en diagonale
    const style = document.createElement('style');
    style.textContent = `
      .history-balls-container {
        position: relative;
      }
      .history-balls-container .bingo-ball-history:nth-child(odd) {
        transform: translateY(-3px);
      }
      .history-balls-container .bingo-ball-history:nth-child(even) {
        transform: translateY(3px);
      }
    `;
    document.head.appendChild(style);
    
    this.historyContainer.appendChild(ballsContainer);
    
    // Stocker une référence au conteneur des boules
    this.historyBallsContainer = ballsContainer;
    
    this.container.appendChild(this.historyContainer);
  }
  
  /**
   * Crée un élément de boule de bingo 3D
   */
  createBallElement(number, size = this.options.size, isMain = false) {
    // Conteneur de la boule
    const ballContainer = document.createElement('div');
    ballContainer.className = `bingo-ball-container ${isMain ? 'main-ball' : 'history-ball'}`;
    ballContainer.style.width = `${size}px`;
    ballContainer.style.height = `${size}px`;
    ballContainer.style.position = 'relative';
    ballContainer.style.margin = isMain ? '0' : '5px';
    ballContainer.style.transition = 'transform 0.3s ease-in-out';
    
    // Choix de couleur pour chaque boule
    const colorIndex = number % this.options.colors.length;
    const ballColor = isMain ? '#FFD700' : this.options.colors[colorIndex]; // Jaune brillant pour la boule principale
    
    // Boule externe (sphère)
    const ball = document.createElement('div');
    ball.className = 'bingo-ball';
    ball.style.width = '100%';
    ball.style.height = '100%';
    ball.style.borderRadius = '50%';
    
    if (isMain) {
      // Style pour la boule principale (jaune brillante)
      ball.style.background = `radial-gradient(circle at 30% 30%, #FFFFE0, ${ballColor})`;
      ball.style.boxShadow = `0 0 15px rgba(255, 215, 0, 0.8), inset 0 0 30px rgba(255, 255, 255, 0.6)`;
      ball.style.border = '2px solid rgba(255, 215, 0, 0.3)';
      ball.style.transform = 'scale(1.2)';
    } else {
      // Style pour les boules d'historique (colorées et plus petites)
      ball.style.background = `radial-gradient(circle at 30% 30%, ${this.options.highlightColor}, ${ballColor})`;
      ball.style.boxShadow = `0 0 8px rgba(0, 0, 0, 0.3), inset 0 0 15px rgba(255, 255, 255, 0.4)`;
      ball.style.border = '1px solid rgba(255, 255, 255, 0.3)';
      ball.style.transform = 'scale(1)';
    }
    
    ball.style.position = 'relative';
    ball.style.overflow = 'hidden';
    ball.style.zIndex = '1';
    
    // Reflet sur la boule
    if (this.options.reflectionEffect) {
      const reflection = document.createElement('div');
      reflection.className = 'bingo-ball-reflection';
      reflection.style.width = isMain ? '40%' : '30%';
      reflection.style.height = isMain ? '40%' : '30%';
      reflection.style.borderRadius = '50%';
      reflection.style.position = 'absolute';
      reflection.style.top = '15%';
      reflection.style.left = '15%';
      reflection.style.background = 'rgba(255, 255, 255, 0.8)';
      reflection.style.filter = isMain ? 'blur(3px)' : 'blur(2px)';
      ball.appendChild(reflection);
      
      // Reflet secondaire
      const secondaryReflection = document.createElement('div');
      secondaryReflection.className = 'bingo-ball-reflection-secondary';
      secondaryReflection.style.width = isMain ? '20%' : '15%';
      secondaryReflection.style.height = isMain ? '20%' : '15%';
      secondaryReflection.style.borderRadius = '50%';
      secondaryReflection.style.position = 'absolute';
      secondaryReflection.style.top = '60%';
      secondaryReflection.style.left = '60%';
      secondaryReflection.style.background = 'rgba(255, 255, 255, 0.6)';
      secondaryReflection.style.filter = isMain ? 'blur(2px)' : 'blur(1px)';
      ball.appendChild(secondaryReflection);
    }
    
    // Cercle central pour le numéro
    const numberCircle = document.createElement('div');
    numberCircle.className = 'bingo-ball-number-circle';
    numberCircle.style.width = isMain ? '70%' : '60%';
    numberCircle.style.height = isMain ? '70%' : '60%';
    numberCircle.style.borderRadius = '50%';
    numberCircle.style.backgroundColor = isMain ? 'white' : '#f5f5dc';
    numberCircle.style.position = 'absolute';
    numberCircle.style.top = '50%';
    numberCircle.style.left = '50%';
    numberCircle.style.transform = 'translate(-50%, -50%)';
    numberCircle.style.display = 'flex';
    numberCircle.style.justifyContent = 'center';
    numberCircle.style.alignItems = 'center';
    numberCircle.style.boxShadow = isMain ? 'inset 0 0 8px rgba(0,0,0,0.2)' : 'inset 0 0 5px rgba(0,0,0,0.2)';
    numberCircle.style.border = isMain ? '2px solid #f0f0f0' : '1px solid #e8e8e8';
    
    // Numéro
    const numberText = document.createElement('div');
    numberText.className = 'bingo-ball-number';
    numberText.textContent = number;
    numberText.style.fontSize = isMain ? `${size * 0.4}px` : `${size * 0.35}px`;
    numberText.style.fontWeight = 'bold';
    numberText.style.color = '#1a1a1a';
    numberText.style.textAlign = 'center';
    numberText.style.fontFamily = 'Arial, sans-serif';
    numberText.style.lineHeight = '1';
    numberText.style.textShadow = '0 1px 1px rgba(255,255,255,0.7)';
    
    numberCircle.appendChild(numberText);
    ball.appendChild(numberCircle);
    ballContainer.appendChild(ball);
    
    // Effet de lueur si activé
    if (this.options.glowEffect && isMain) {
      const glow = document.createElement('div');
      glow.className = 'bingo-ball-glow';
      glow.style.position = 'absolute';
      glow.style.top = '50%';
      glow.style.left = '50%';
      glow.style.transform = 'translate(-50%, -50%)';
      glow.style.width = '130%';
      glow.style.height = '130%';
      glow.style.borderRadius = '50%';
      glow.style.boxShadow = `0 0 40px 15px rgba(255, 215, 0, 0.5)`;
      glow.style.opacity = '0.7';
      glow.style.zIndex = '0';
      ballContainer.appendChild(glow);
    }
    
    // Animation de flottement pour la boule principale
    if (this.options.floatingEffect && isMain) {
      this.applyFloatingAnimation(ballContainer);
    }
    
    // Animation de rotation 3D pour la boule principale lors d'un tirage
    if (isMain) {
      ballContainer.style.transition = `transform ${this.options.animationDuration}ms cubic-bezier(0.175, 0.885, 0.32, 1.275)`;
    }
    
    return ballContainer;
  }
  
  /**
   * Applique une animation de flottement à l'élément
   */
  applyFloatingAnimation(element) {
    // Définir l'animation CSS
    const keyframes = `
      @keyframes floating {
        0% { transform: translateY(0) rotate(0deg); }
        25% { transform: translateY(-5px) rotate(2deg); }
        50% { transform: translateY(0) rotate(0deg); }
        75% { transform: translateY(5px) rotate(-2deg); }
        100% { transform: translateY(0) rotate(0deg); }
      }
    `;
    
    // Ajouter les keyframes au document
    if (!document.querySelector('style#bingo-ball-animations')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'bingo-ball-animations';
      styleSheet.textContent = keyframes;
      document.head.appendChild(styleSheet);
    }
    
    // Appliquer l'animation
    element.style.animation = 'floating 3s ease-in-out infinite';
  }
  
  /**
   * Tire un nouveau numéro et l'affiche
   */
  drawNumber(number) {
    if (number < 1 || number > 90) {
      console.error('Le numéro doit être entre 1 et 90');
      return;
    }
    
    if (this.drawnNumbers.includes(number)) {
      console.warn(`Le numéro ${number} a déjà été tiré`);
      return;
    }
    
    // Ajouter le numéro à la liste des numéros tirés
    this.drawnNumbers.push(number);
    this.currentNumber = number;
    
    // Vider le conteneur principal
    this.mainBallContainer.innerHTML = '';
    
    // Créer la nouvelle boule et l'ajouter au conteneur principal
    const mainBall = this.createBallElement(number, this.options.size, true);
    this.mainBallContainer.appendChild(mainBall);
    
    // Animation d'entrée
    mainBall.style.transform = 'scale(0) rotateY(180deg)';
    setTimeout(() => {
      mainBall.style.transform = 'scale(1.2) rotateY(0deg)';
    }, 50);
    
    // Ajouter la boule à l'historique
    this.addToHistory(number);
    
    return mainBall;
  }
  
  /**
   * Ajoute un numéro à l'historique
   */
  addToHistory(number) {
    // Créer une petite boule et l'ajouter au conteneur d'historique (plus petite que la principale)
    const historyBall = this.createBallElement(number, this.options.size / 3);
    
    // Ajouter un style spécifique pour les boules d'historique
    historyBall.style.margin = '4px';
    historyBall.style.flexShrink = '0'; // Empêche le redimensionnement des boules
    historyBall.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
    
    // Ajouter un attribut data pour faciliter le suivi
    historyBall.setAttribute('data-number', number);
    
    // Insérer la boule au début du conteneur de boules d'historique
    if (this.historyBallsContainer.firstChild) {
      this.historyBallsContainer.insertBefore(historyBall, this.historyBallsContainer.firstChild);
    } else {
      this.historyBallsContainer.appendChild(historyBall);
    }
    
    // Faire défiler vers la gauche pour voir la nouvelle boule
    this.historyBallsContainer.scrollLeft = 0;
    
    // Limiter le nombre de boules d'historique affichées
    const maxBallsToShow = 15; // Nombre maximal de boules à afficher
    const historyBalls = this.historyBallsContainer.querySelectorAll('.bingo-ball-container');
    
    if (historyBalls.length > maxBallsToShow) {
      // Supprimer les boules excédentaires avec une animation de fondu
      for (let i = maxBallsToShow; i < historyBalls.length; i++) {
        const ball = historyBalls[i];
        ball.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
        ball.style.opacity = '0';
        ball.style.transform = 'scale(0.5)';
        
        // Supprimer l'élément après la fin de l'animation
        setTimeout(() => {
          if (ball.parentNode) {
            ball.parentNode.removeChild(ball);
          }
        }, 500);
      }
    }
    
    // Animation d'entrée
    historyBall.style.transform = 'scale(0)';
    historyBall.style.opacity = '0';
    
    setTimeout(() => {
      historyBall.style.transform = 'scale(1)';
      historyBall.style.opacity = '1';
      historyBall.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
    }, 50);
  }
  
  /**
   * Réinitialise le tirage
   */
  reset() {
    // Réinitialiser les données
    this.drawnNumbers = [];
    this.currentNumber = null;
    
    // Vider le conteneur principal
    this.mainBallContainer.innerHTML = '';
    
    // Vider le conteneur de boules d'historique mais conserver le titre
    if (this.historyBallsContainer) {
      this.historyBallsContainer.innerHTML = '';
    } else {
      // Si pour une raison quelconque le conteneur n'existe pas encore, recréer toute la structure
      const oldContainer = this.historyContainer;
      const parent = oldContainer.parentNode;
      
      // Recréer le conteneur d'historique
      this.setupHistoryContainer();
      
      // Remplacer l'ancien conteneur
      parent.replaceChild(this.historyContainer, oldContainer);
    }
  }
  
  /**
   * Récupère la liste des numéros déjà tirés
   */
  getDrawnNumbers() {
    return [...this.drawnNumbers];
  }
  
  /**
   * Récupère le dernier numéro tiré
   */
  getCurrentNumber() {
    return this.currentNumber;
  }
}

// Export pour utilisation dans différents contextes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BingoBall3D;
} else {
  window.BingoBall3D = BingoBall3D;
}