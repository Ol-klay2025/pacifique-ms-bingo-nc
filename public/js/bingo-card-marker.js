/**
 * MS BINGO PACIFIQUE - Module de marquage automatique des cartes
 * Ce module permet de marquer automatiquement les numéros sur les cartes de bingo
 * lorsqu'ils sont tirés par le système de boules 3D.
 */

class BingoCardMarker {
  constructor(options = {}) {
    this.options = {
      cardSelector: options.cardSelector || '.bingo-card',
      cellSelector: options.cellSelector || '.bingo-cell',
      numberDataAttr: options.numberDataAttr || 'data-number',
      markedClass: options.markedClass || 'marked',
      highlightClass: options.highlightClass || 'highlight',
      animationClass: options.animationClass || 'pulse',
      quineClass: options.quineClass || 'quine',
      bingoClass: options.bingoClass || 'bingo',
      gameRoot: options.gameRoot || document,
      onQuine: options.onQuine || null,
      onBingo: options.onBingo || null,
      onNumberMarked: options.onNumberMarked || null,
      audio: options.audio || null
    };

    // Garder une trace des numéros marqués
    this.markedNumbers = new Set();
    
    // Garder une trace des cartes qui ont fait une quine ou un bingo
    this.quineCards = new Set();
    this.bingoCards = new Set();
  }

  /**
   * Marque un numéro sur toutes les cartes
   * @param {number} number - Le numéro à marquer
   * @param {boolean} animate - Ajouter une animation
   * @returns {Array} - Les cellules qui ont été marquées
   */
  markNumber(number, animate = true) {
    if (this.markedNumbers.has(number)) {
      console.warn(`Le numéro ${number} a déjà été marqué`);
      return [];
    }

    // Ajouter le numéro à l'ensemble des numéros marqués
    this.markedNumbers.add(number);

    // Sélectionner toutes les cellules contenant ce numéro
    const cells = Array.from(
      this.options.gameRoot.querySelectorAll(
        `${this.options.cellSelector}[${this.options.numberDataAttr}="${number}"]`
      )
    );

    // Marquer chaque cellule
    cells.forEach(cell => {
      // Ajouter la classe de marquage
      cell.classList.add(this.options.markedClass);
      
      // Ajouter une classe de surbrillance temporaire
      cell.classList.add(this.options.highlightClass);
      
      // Ajouter une animation si demandé
      if (animate) {
        cell.classList.add(this.options.animationClass);
        
        // Retirer l'animation après qu'elle soit terminée
        setTimeout(() => {
          cell.classList.remove(this.options.animationClass);
          cell.classList.remove(this.options.highlightClass);
        }, 2000);
      }
      
      // Jouer un son de marquage si disponible
      if (this.options.audio) {
        this.options.audio.playMarkSound();
      }
    });

    // Vérifier les quines et bingos après chaque marquage
    this.checkForWins();

    // Appeler le callback si défini
    if (this.options.onNumberMarked) {
      this.options.onNumberMarked(number, cells);
    }

    return cells;
  }

  /**
   * Vérifie les quines et bingos sur toutes les cartes
   */
  checkForWins() {
    // Sélectionner toutes les cartes
    const cards = Array.from(
      this.options.gameRoot.querySelectorAll(this.options.cardSelector)
    );

    console.log("Vérification des gains sur", cards.length, "cartes");
    
    cards.forEach(card => {
      const cardId = card.id || card.getAttribute('data-card-id');
      console.log("Vérification de la carte:", cardId);
      
      // Vérifier les quines (lignes)
      if (!this.quineCards.has(cardId)) {
        console.log("Recherche de quine sur carte", cardId);
        const hasQuine = this.checkForQuine(card);
        console.log("Résultat quine:", hasQuine);
        
        if (hasQuine) {
          console.log("QUINE TROUVÉE sur carte", cardId);
          this.quineCards.add(cardId);
          card.classList.add(this.options.quineClass);
          
          // Appeler le callback si défini
          if (this.options.onQuine) {
            console.log("Exécution du callback onQuine");
            setTimeout(() => {
              this.options.onQuine(card);
            }, 0); // Utiliser setTimeout pour éviter les problèmes de timing
          }
          
          // Jouer un son de quine si disponible
          if (this.options.audio) {
            console.log("Lecture du son de quine");
            setTimeout(() => {
              this.options.audio.playQuineSound();
            }, 100);
          }
        }
      }
      
      // Vérifier les bingos (carte complète)
      if (!this.bingoCards.has(cardId)) {
        console.log("Recherche de bingo sur carte", cardId);
        const hasBingo = this.checkForBingo(card);
        console.log("Résultat bingo:", hasBingo);
        
        if (hasBingo) {
          console.log("BINGO TROUVÉ sur carte", cardId);
          this.bingoCards.add(cardId);
          card.classList.add(this.options.bingoClass);
          
          // Appeler le callback si défini
          if (this.options.onBingo) {
            console.log("Exécution du callback onBingo");
            setTimeout(() => {
              this.options.onBingo(card);
            }, 0); // Utiliser setTimeout pour éviter les problèmes de timing
          }
          
          // Jouer un son de bingo si disponible
          if (this.options.audio) {
            console.log("Lecture du son de bingo");
            setTimeout(() => {
              this.options.audio.playBingoSound();
            }, 100);
          }
        }
      }
    });
  }

  /**
   * Vérifie si une carte a une quine (ligne complète)
   * @param {HTMLElement} card - La carte à vérifier
   * @returns {boolean} - Vrai si la carte a une quine
   */
  checkForQuine(card) {
    // Récupérer toutes les lignes de la carte
    const rows = this.getCardRows(card);
    console.log("Lignes détectées:", rows.length);
    
    // Vérifier chaque ligne
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      console.log(`Vérification ligne ${i+1}, cellules:`, row.length);
      
      // Filtrer pour ne considérer que les cellules qui ont des numéros (pas les cellules vides)
      const numberCells = row.filter(cell => !cell.classList.contains('empty'));
      console.log(`Cellules avec numéros dans ligne ${i+1}:`, numberCells.length);
      
      if (numberCells.length === 0) continue; // Ignorer les lignes sans numéros
      
      // Vérifier si toutes les cellules avec numéros sont marquées
      const allMarked = numberCells.every(cell => {
        const isMarked = cell.classList.contains(this.options.markedClass);
        console.log(`Cellule ${cell.textContent} marquée:`, isMarked);
        return isMarked;
      });
      
      console.log(`Ligne ${i+1} complètement marquée:`, allMarked);
      
      if (allMarked && numberCells.length > 0) {
        console.log(`QUINE CONFIRMÉE sur ligne ${i+1}`);
        return true;
      }
    }
    
    return false;
  }

  /**
   * Vérifie si une carte a un bingo (carte complète)
   * @param {HTMLElement} card - La carte à vérifier
   * @returns {boolean} - Vrai si la carte a un bingo
   */
  checkForBingo(card) {
    // Sélectionner toutes les cellules avec numéros (excluant les cellules vides)
    const cells = Array.from(
      card.querySelectorAll(this.options.cellSelector)
    ).filter(cell => !cell.classList.contains('empty'));
    
    console.log("Vérification bingo - Total cellules avec numéros:", cells.length);
    
    // Si aucune cellule avec numéro, retourner faux
    if (cells.length === 0) return false;
    
    // Vérifier si toutes les cellules avec numéros sont marquées
    const allMarked = cells.every(cell => {
      const isMarked = cell.classList.contains(this.options.markedClass);
      console.log(`Cellule ${cell.textContent} marquée pour bingo:`, isMarked);
      return isMarked;
    });
    
    console.log("Carte complètement marquée:", allMarked);
    
    return allMarked;
  }

  /**
   * Récupère les lignes d'une carte
   * @param {HTMLElement} card - La carte
   * @returns {Array<Array<HTMLElement>>} - Un tableau de lignes, chaque ligne étant un tableau de cellules
   */
  getCardRows(card) {
    console.log("Extraction des lignes pour carte:", card.id || card.getAttribute('data-card-id'));
    
    // Récupérer toutes les cellules
    const cells = Array.from(
      card.querySelectorAll(this.options.cellSelector)
    );
    console.log("Total cellules trouvées:", cells.length);
    
    // Créer un mapping des lignes par attribut data-row
    const rowMap = new Map();
    
    cells.forEach(cell => {
      const rowIndex = cell.getAttribute('data-row');
      console.log(`Cellule ${cell.textContent || 'vide'}, ligne: ${rowIndex}`);
      
      if (!rowIndex) {
        console.warn("Cellule sans attribut data-row:", cell);
        return;
      }
      
      if (!rowMap.has(rowIndex)) {
        rowMap.set(rowIndex, []);
      }
      
      rowMap.get(rowIndex).push(cell);
    });
    
    // Convertir la map en tableau de lignes
    const rows = Array.from(rowMap.values());
    console.log("Nombre de lignes extraites:", rows.length);
    rows.forEach((row, index) => {
      console.log(`Ligne ${index+1}: ${row.length} cellules`);
    });
    
    return rows;
  }

  /**
   * Réinitialise le marqueur (pour une nouvelle partie)
   */
  reset() {
    // Vider les ensembles
    this.markedNumbers.clear();
    this.quineCards.clear();
    this.bingoCards.clear();
    
    // Supprimer toutes les classes de marquage
    const cells = Array.from(
      this.options.gameRoot.querySelectorAll(this.options.cellSelector)
    );
    
    cells.forEach(cell => {
      cell.classList.remove(
        this.options.markedClass,
        this.options.highlightClass,
        this.options.animationClass
      );
    });
    
    // Supprimer les classes de quine et bingo
    const cards = Array.from(
      this.options.gameRoot.querySelectorAll(this.options.cardSelector)
    );
    
    cards.forEach(card => {
      card.classList.remove(
        this.options.quineClass,
        this.options.bingoClass
      );
    });
  }

  /**
   * Connecte le marqueur à un module de boules de bingo
   * @param {Object} bingoBall - Instance de la classe BingoBall3D
   */
  connectToBingoBall(bingoBall) {
    // Vérifier que l'instance est valide
    if (!bingoBall || typeof bingoBall.getCurrentNumber !== 'function') {
      console.error('Instance de BingoBall3D invalide');
      return;
    }
    
    // Récupérer tous les numéros déjà tirés et les marquer
    const drawnNumbers = bingoBall.getDrawnNumbers();
    drawnNumbers.forEach(number => {
      this.markNumber(number, false);
    });
    
    // Créer une fonction d'écouteur d'événements pour les nouveaux tirages
    const handleNewDraw = (event) => {
      const number = bingoBall.getCurrentNumber();
      if (number) {
        this.markNumber(number, true);
      }
    };
    
    // Ajouter l'écouteur d'événements (en supposant un événement personnalisé "numberDrawn")
    document.addEventListener('numberDrawn', handleNewDraw);
    
    // Retourner une fonction pour déconnecter l'écouteur si nécessaire
    return () => {
      document.removeEventListener('numberDrawn', handleNewDraw);
    };
  }
}

// Export pour utilisation dans différents contextes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BingoCardMarker;
} else {
  window.BingoCardMarker = BingoCardMarker;
}