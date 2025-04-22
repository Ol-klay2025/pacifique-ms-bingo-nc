import { shuffle, range } from './utils';

/**
 * Format européen de carton de bingo
 * - 90 numéros au total (1-90)
 * - Carton composé de 3 lignes et 9 colonnes
 * - 5 numéros par ligne (15 numéros par carton)
 * - Chaque colonne contient des numéros d'une plage spécifique
 *   Col 1: 1-9, Col 2: 10-19, Col 3: 20-29, etc. jusqu'à Col 9: 80-90
 */

/**
 * Génère un carton de bingo au format européen (3x9 avec 15 numéros)
 * @returns Une matrice 3x9 représentant un carton de bingo
 */
export function generateBingoCard(): number[][] {
  // Créer une grille 3x9 initialisée avec des zéros (0 représente une case vide)
  const grid: number[][] = Array(3).fill(0).map(() => Array(9).fill(0));

  // Pour chaque colonne, générer les numéros disponibles dans la plage appropriée
  for (let col = 0; col < 9; col++) {
    // Déterminer la plage de numéros pour cette colonne
    const min = col * 10 + 1;
    const max = col === 8 ? 90 : (col + 1) * 10;
    
    // Générer les numéros pour cette colonne
    const numbersInRange = shuffle(range(min, max));
    
    // Sélectionner 1 à 3 numéros pour cette colonne (distribués sur les lignes)
    const count = col === 0 || col === 8 ? 1 : Math.floor(Math.random() * 2) + 1;
    
    // Placer ces numéros aléatoirement dans la colonne
    const rowIndices = shuffle([0, 1, 2]).slice(0, count);
    
    rowIndices.forEach((row, i) => {
      grid[row][col] = numbersInRange[i];
    });
  }

  // Nous devons nous assurer que chaque ligne a exactement 5 numéros
  // Pour cela, nous ajoutons ou supprimons des numéros par ligne selon les besoins
  for (let row = 0; row < 3; row++) {
    const filledCells = grid[row].filter(num => num !== 0).length;
    
    if (filledCells < 5) {
      // Nous devons ajouter des numéros à cette ligne
      const emptyCols = grid[row]
        .map((val, idx) => ({ val, idx }))
        .filter(item => item.val === 0)
        .map(item => item.idx);
      
      // Choisir aléatoirement les colonnes vides à remplir
      const colsToFill = shuffle(emptyCols).slice(0, 5 - filledCells);
      
      // Remplir ces colonnes avec des numéros appropriés
      colsToFill.forEach(col => {
        const min = col * 10 + 1;
        const max = col === 8 ? 90 : (col + 1) * 10;
        
        // Trouver un numéro qui n'est pas déjà utilisé dans cette colonne
        const usedNumbers = grid.map(r => r[col]).filter(n => n !== 0);
        const availableNumbers = range(min, max).filter(n => !usedNumbers.includes(n));
        
        if (availableNumbers.length > 0) {
          grid[row][col] = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
        }
      });
    } else if (filledCells > 5) {
      // Nous devons supprimer des numéros de cette ligne
      const filledCols = grid[row]
        .map((val, idx) => ({ val, idx }))
        .filter(item => item.val !== 0)
        .map(item => item.idx);
      
      // Choisir aléatoirement les colonnes à vider
      const colsToEmpty = shuffle(filledCols).slice(0, filledCells - 5);
      
      // Vider ces colonnes
      colsToEmpty.forEach(col => {
        grid[row][col] = 0;
      });
    }
  }

  // Trier les numéros dans chaque colonne (les colonnes peuvent contenir 0-3 numéros)
  for (let col = 0; col < 9; col++) {
    const colNumbers = grid.map(row => row[col]).filter(num => num !== 0).sort((a, b) => a - b);
    let colIndex = 0;
    
    for (let row = 0; row < 3; row++) {
      if (grid[row][col] !== 0) {
        grid[row][col] = colNumbers[colIndex++];
      }
    }
  }

  return grid;
}

/**
 * Génère une série de 6 cartons de bingo qui contient tous les numéros de
 * 1 à 90 sans répétition (standard pour le bingo européen)
 * 
 * Un ensemble complet de 6 cartons contient exactement tous les numéros de 1 à 90
 * 6 cartons * 15 numéros = 90 numéros
 * 
 * @returns Un tableau de 6 grilles 3x9 représentant une série complète de cartons
 */
export function generateCompleteCardSeries(): number[][][] {
  const allNumbers = range(1, 90);
  const shuffledNumbers = shuffle([...allNumbers]);
  const cards: number[][][] = [];

  // Créer 6 cartons, chacun avec 15 numéros
  for (let cardIndex = 0; cardIndex < 6; cardIndex++) {
    // Les 15 numéros pour ce carton
    const cardNumbers = shuffledNumbers.slice(cardIndex * 15, (cardIndex + 1) * 15);
    
    // Trier les numéros par plage de colonne
    const numbersByColumn: number[][] = Array(9).fill(0).map(() => []);
    
    cardNumbers.forEach(num => {
      const colIndex = num <= 9 ? 0 : Math.floor((num - 1) / 10);
      numbersByColumn[colIndex].push(num);
    });
    
    // Créer une grille 3x9 initialisée avec des zéros
    const grid: number[][] = Array(3).fill(0).map(() => Array(9).fill(0));
    
    // Distribution équilibrée des numéros sur les lignes
    let totalPlaced = 0;
    
    // D'abord, placer les numéros dans leurs colonnes respectives
    for (let col = 0; col < 9; col++) {
      const colNumbers = numbersByColumn[col].sort((a, b) => a - b);
      
      // Placer les numéros dans la colonne, distribués sur les lignes
      for (let i = 0; i < colNumbers.length; i++) {
        const row = i % 3;
        grid[row][col] = colNumbers[i];
        totalPlaced++;
      }
    }
    
    // Ensuite, équilibrer les lignes pour qu'elles aient chacune 5 numéros
    for (let row = 0; row < 3; row++) {
      const filledCount = grid[row].filter(n => n !== 0).length;
      
      if (filledCount > 5) {
        // Supprimer des numéros en trop
        const filledIndices = grid[row]
          .map((val, idx) => ({ val, idx }))
          .filter(item => item.val !== 0)
          .map(item => item.idx);
        
        const toRemove = filledCount - 5;
        const indicesToRemove = shuffle([...filledIndices]).slice(0, toRemove);
        
        indicesToRemove.forEach(col => {
          // Déplacer ce numéro vers une autre ligne qui a besoin de numéros
          const num = grid[row][col];
          grid[row][col] = 0;
          
          // Trouver une ligne qui a moins de 5 numéros
          for (let otherRow = 0; otherRow < 3; otherRow++) {
            if (otherRow !== row && grid[otherRow].filter(n => n !== 0).length < 5 && grid[otherRow][col] === 0) {
              grid[otherRow][col] = num;
              break;
            }
          }
        });
      }
    }
    
    // Vérification finale: s'assurer que chaque ligne a exactement 5 numéros
    for (let row = 0; row < 3; row++) {
      const filledCount = grid[row].filter(n => n !== 0).length;
      
      if (filledCount !== 5) {
        // Ajuster en déplaçant des numéros d'autres lignes si nécessaire
        if (filledCount < 5) {
          // Trouver des numéros à ajouter
          const neededCount = 5 - filledCount;
          const emptyColumns = grid[row]
            .map((val, idx) => ({ val, idx }))
            .filter(item => item.val === 0)
            .map(item => item.idx);
          
          // Chercher des numéros dans ces colonnes sur d'autres lignes qui ont plus de 5 numéros
          for (let col of emptyColumns) {
            if (neededCount <= 0) break;
            
            for (let otherRow = 0; otherRow < 3; otherRow++) {
              if (otherRow !== row && grid[otherRow][col] !== 0 && 
                  grid[otherRow].filter(n => n !== 0).length > 5) {
                // Déplacer ce numéro
                grid[row][col] = grid[otherRow][col];
                grid[otherRow][col] = 0;
                break;
              }
            }
          }
        }
      }
    }
    
    // Trier les numéros dans chaque colonne
    for (let col = 0; col < 9; col++) {
      const colNumbers = grid.map(r => r[col]).filter(n => n !== 0).sort((a, b) => a - b);
      let colIndex = 0;
      
      for (let row = 0; row < 3; row++) {
        if (grid[row][col] !== 0) {
          grid[row][col] = colNumbers[colIndex++];
        }
      }
    }
    
    cards.push(grid);
  }

  return cards;
}

/**
 * Génère un nombre spécifié de cartons de bingo
 * @param count Nombre de cartons à générer
 * @param generateSeries Si true, génère des séries complètes de 6 cartons
 * @returns Un tableau de cartons de bingo
 */
export function generateBingoCards(count: number, generateSeries: boolean = false): number[][][] {
  if (generateSeries) {
    const seriesCount = Math.ceil(count / 6);
    let allCards: number[][][] = [];
    
    for (let i = 0; i < seriesCount; i++) {
      const series = generateCompleteCardSeries();
      allCards = [...allCards, ...series];
    }
    
    // Ne retourner que le nombre demandé de cartons
    return allCards.slice(0, count);
  } else {
    return Array(count).fill(0).map(() => generateBingoCard());
  }
}