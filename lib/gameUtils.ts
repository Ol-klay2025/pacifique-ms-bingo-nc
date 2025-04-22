/**
 * Format time remaining until a date in a human-readable form
 */
export function formatTimeUntilStart(startTime: Date): string {
  const now = new Date();
  const diff = new Date(startTime).getTime() - now.getTime();
  
  if (diff <= 0) {
    return 'Now';
  }
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Format a currency value based on the language
 */
export function formatCurrency(amount: number, language: string = 'en'): string {
  // Convert cents to Euros
  const amountInEuros = amount / 100;
  
  if (language === 'fr') {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amountInEuros);
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR'
  }).format(amountInEuros);
}

/**
 * Generate a column-based representation of a bingo number
 */
export function getBingoColumnLetter(number: number): string {
  if (number < 1 || number > 90) {
    return '';
  }
  
  // European 90-ball bingo uses columns 1-9
  const column = Math.ceil(number / 10);
  return column.toString();
}

/**
 * Check if a card has a valid quine (complete row)
 */
export function checkForQuine(cardNumbers: number[][], calledNumbers: number[]): boolean {
  // Check each row
  for (let row = 0; row < cardNumbers.length; row++) {
    const rowNumbers = cardNumbers[row].filter(num => num !== 0);
    const allCalled = rowNumbers.every(num => calledNumbers.includes(num));
    
    if (allCalled && rowNumbers.length > 0) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check if a card has a complete bingo (all numbers marked)
 */
export function checkForBingo(cardNumbers: number[][], calledNumbers: number[]): boolean {
  // Get all numbers on the card (exclude 0s which are empty spaces)
  const allCardNumbers = cardNumbers.flat().filter(num => num !== 0);
  
  // Check if all card numbers have been called
  return allCardNumbers.every(num => calledNumbers.includes(num));
}

/**
 * Create a spoken representation of a bingo number in English
 */
export function getNumberCallEnglish(number: number): string {
  if (number < 1 || number > 90) {
    return '';
  }
  
  // Special names for some numbers in English bingo
  const specialNames: Record<number, string> = {
    1: 'Kelly\'s Eye',
    8: 'Garden Gate',
    11: 'Legs Eleven',
    22: 'Two Little Ducks',
    88: 'Two Fat Ladies',
    90: 'Top of the Shop'
  };
  
  if (specialNames[number]) {
    return `${number}, ${specialNames[number]}`;
  }
  
  return number.toString();
}

/**
 * Create a spoken representation of a bingo number in French
 */
export function getNumberCallFrench(number: number): string {
  if (number < 1 || number > 90) {
    return '';
  }
  
  return `Numéro ${number}`;
}

/**
 * Get the appropriate voice representation based on language
 */
export function getVoiceForLanguage(language: string): string {
  switch (language) {
    case 'fr':
      return 'fr-FR';
    case 'en':
    default:
      return 'en-GB';
  }
}

/**
 * Format a date based on the language
 */
export function formatDate(date: string | Date, language: string = 'en'): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
}