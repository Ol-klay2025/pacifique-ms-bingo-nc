/**
 * Utilitaires pour la gestion des cartes et règles de Bingo
 */

/**
 * Génère une carte de bingo selon le format 90-ball européen
 * Une carte contient 15 nombres répartis sur 3 lignes et 9 colonnes (5 nombres par ligne)
 * La première colonne contient des nombres de 1-9, la deuxième de 10-19, etc.
 * @returns Matrice 3x9 contenant les nombres de la carte (0 pour les cases vides)
 */
export function generateBingoCard(): number[][] {
  // Initialiser la grille 3x9 avec des zéros (cases vides)
  const grid: number[][] = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0]
  ];
  
  // Pour chaque colonne
  for (let col = 0; col < 9; col++) {
    // Déterminer la plage de nombres pour cette colonne
    const min = col * 10 + 1;
    const max = col === 8 ? 90 : min + 9;
    
    // Sélectionner 3 nombres aléatoires dans cette plage
    const availableNumbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);
    shuffleArray(availableNumbers);
    const selectedNumbers = availableNumbers.slice(0, 3);
    
    // Placer les nombres dans la colonne
    selectedNumbers.sort((a, b) => a - b); // Tri croissant
    
    // Sélectionner aléatoirement les lignes qui auront des nombres
    // Une carte de bingo européenne a 5 nombres par ligne (donc 15 nombres au total)
    // Nous devons donc choisir les lignes pour chaque colonne de manière à respecter cette contrainte
    
    // Générer les indices de ligne pour cette colonne
    const rowIndices = chooseRowsForColumn(grid);
    
    // Placer les nombres dans les lignes sélectionnées
    for (let i = 0; i < rowIndices.length; i++) {
      grid[rowIndices[i]][col] = selectedNumbers[i];
    }
  }
  
  return grid;
}

/**
 * Choisit les lignes dans lesquelles placer des nombres pour une colonne
 * en s'assurant que chaque ligne contient exactement 5 nombres
 * @param grid Grille actuelle
 * @returns Indices des lignes à utiliser pour la colonne actuelle
 */
function chooseRowsForColumn(grid: number[][]): number[] {
  // Compter les nombres dans chaque ligne
  const rowCounts = grid.map(row => row.filter(n => n !== 0).length);
  
  // Déterminer combien de lignes doivent recevoir un nombre dans cette colonne
  const availableSlots = Math.min(3, 15 - rowCounts.reduce((a, b) => a + b, 0));
  
  if (availableSlots === 0) {
    return []; // Toutes les lignes ont déjà 5 nombres
  }
  
  // Identifier les lignes qui peuvent encore recevoir des nombres
  const eligibleRows = rowCounts
    .map((count, index) => ({ count, index }))
    .filter(row => row.count < 5)
    .sort((a, b) => a.count - b.count); // Prioriser les lignes avec moins de nombres
  
  // Sélectionner les lignes pour cette colonne
  const selectedRows: number[] = [];
  
  // D'abord, prendre les lignes qui ont besoin de plus de nombres
  for (let i = 0; i < availableSlots && i < eligibleRows.length; i++) {
    selectedRows.push(eligibleRows[i].index);
  }
  
  return selectedRows;
}

/**
 * Mélange aléatoirement un tableau
 * @param array Tableau à mélanger
 */
function shuffleArray(array: any[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/**
 * Vérifie si une ligne complète a été marquée (quine)
 * @param cardNumbers Matrice 3x9 représentant la carte
 * @param calledNumbers Liste des numéros tirés
 * @returns Vrai si au moins une ligne est complète
 */
export function verifyQuineWin(cardNumbers: number[][], calledNumbers: number[]): boolean {
  const calledSet = new Set(calledNumbers);
  
  // Vérifier chaque ligne
  for (let row = 0; row < 3; row++) {
    let allMarked = true;
    
    // Vérifier si tous les nombres de la ligne (non vides) sont marqués
    for (let col = 0; col < 9; col++) {
      const number = cardNumbers[row][col];
      if (number !== 0 && !calledSet.has(number)) {
        allMarked = false;
        break;
      }
    }
    
    if (allMarked) {
      return true; // Une ligne complète trouvée
    }
  }
  
  return false;
}

/**
 * Vérifie si toutes les cases de la carte ont été marquées (bingo)
 * @param cardNumbers Matrice 3x9 représentant la carte
 * @param calledNumbers Liste des numéros tirés
 * @returns Vrai si toutes les cases sont marquées
 */
export function verifyBingoWin(cardNumbers: number[][], calledNumbers: number[]): boolean {
  const calledSet = new Set(calledNumbers);
  
  // Vérifier toutes les cases non vides
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 9; col++) {
      const number = cardNumbers[row][col];
      if (number !== 0 && !calledSet.has(number)) {
        return false; // Au moins un nombre non marqué
      }
    }
  }
  
  return true; // Tous les nombres sont marqués
}

/**
 * Vérifie si une carte a gagné le jackpot (bingo en moins de X numéros)
 * @param cardNumbers Matrice 3x9 représentant la carte
 * @param calledNumbers Liste des numéros tirés
 * @param threshold Nombre maximum de numéros pour gagner le jackpot
 * @returns Vrai si le jackpot est gagné
 */
export function verifyJackpotWin(
  cardNumbers: number[][],
  calledNumbers: number[],
  threshold: number
): boolean {
  return verifyBingoWin(cardNumbers, calledNumbers) && calledNumbers.length <= threshold;
}

/**
 * Génère une série de 6 cartes contenant tous les numéros de 1 à 90
 * @returns Un tableau de 6 cartes (matrices 3x9)
 */
export function generateCardSet(): number[][][] {
  // Une série de 6 cartes contient tous les numéros de 1 à 90 sans duplication
  const cards: number[][][] = [];
  const usedNumbers = new Set<number>();
  
  // Créer 6 cartes
  for (let i = 0; i < 6; i++) {
    // Générer une carte qui n'utilise pas de nombres déjà utilisés
    const card = generateCardWithoutDuplicates(usedNumbers);
    cards.push(card);
    
    // Ajouter les nombres de cette carte à l'ensemble des nombres utilisés
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 9; col++) {
        const number = card[row][col];
        if (number !== 0) {
          usedNumbers.add(number);
        }
      }
    }
  }
  
  return cards;
}

/**
 * Génère une carte de bingo sans utiliser des nombres déjà utilisés
 * @param usedNumbers Ensemble des nombres déjà utilisés
 * @returns Matrice 3x9 représentant la carte
 */
function generateCardWithoutDuplicates(usedNumbers: Set<number>): number[][] {
  // Initialiser la grille 3x9 avec des zéros (cases vides)
  const grid: number[][] = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0]
  ];
  
  // Pour chaque colonne
  for (let col = 0; col < 9; col++) {
    // Déterminer la plage de nombres pour cette colonne
    const min = col * 10 + 1;
    const max = col === 8 ? 90 : min + 9;
    
    // Sélectionner les nombres disponibles dans cette plage
    const availableNumbers = [];
    for (let num = min; num <= max; num++) {
      if (!usedNumbers.has(num)) {
        availableNumbers.push(num);
      }
    }
    
    // Mélanger les nombres disponibles
    shuffleArray(availableNumbers);
    
    // Déterminer combien de nombres nous pouvons utiliser (max 3)
    const numbersToUse = Math.min(3, availableNumbers.length);
    
    if (numbersToUse === 0) {
      continue; // Pas de nombres disponibles pour cette colonne
    }
    
    // Sélectionner des nombres pour cette colonne
    const selectedNumbers = availableNumbers.slice(0, numbersToUse);
    selectedNumbers.sort((a, b) => a - b); // Tri croissant
    
    // Sélectionner les lignes pour ces nombres
    const rowIndices = chooseRowsForColumn(grid);
    
    // Placer les nombres dans les lignes sélectionnées
    for (let i = 0; i < Math.min(rowIndices.length, selectedNumbers.length); i++) {
      grid[rowIndices[i]][col] = selectedNumbers[i];
    }
  }
  
  return grid;
}

/**
 * Convertit une matrice de carte de bingo en format d'affichage
 * @param cardNumbers Matrice 3x9 représentant la carte
 * @returns Chaîne de caractères formatée pour l'affichage
 */
export function formatBingoCard(cardNumbers: number[][]): string {
  let result = '';
  
  // Ajouter une ligne d'en-tête
  result += "-------------------------\n";
  result += "| B | I | N | G | O |\n";
  result += "-------------------------\n";
  
  // Ajouter chaque ligne de la carte
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 9; col++) {
      const number = cardNumbers[row][col];
      result += number === 0 ? '   ' : number.toString().padStart(2, ' ') + ' ';
    }
    result += '\n';
  }
  
  result += "-------------------------\n";
  
  return result;
}