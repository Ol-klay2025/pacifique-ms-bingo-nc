/**
 * Générateur de numéros chanceux personnalisé pour MS BINGO
 * Ce module permet aux joueurs de générer des numéros "chanceux" basés sur
 * différentes méthodes (date de naissance, nom, etc.) et de les utiliser
 * pour sélectionner des cartons.
 */

class LuckyNumberGenerator {
    constructor() {
        this.preferences = this.loadPreferences();
        this.luckyNumbers = [];
        this.initialized = false;
    }

    /**
     * Charge les préférences du générateur depuis le localStorage
     * @returns {Object} Préférences chargées
     */
    loadPreferences() {
        try {
            const savedPrefs = localStorage.getItem('msBingoLuckyGenPrefs');
            if (savedPrefs) {
                return JSON.parse(savedPrefs);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des préférences:', error);
        }
        
        // Préférences par défaut
        return {
            useBirthdate: true,
            useNames: true,
            useLuckyColors: true,
            favoriteNumbers: [],
            birthdate: null,
            name: '',
            luckyColors: ['bleu', 'vert']
        };
    }

    /**
     * Sauvegarde les préférences du générateur
     */
    savePreferences() {
        try {
            localStorage.setItem('msBingoLuckyGenPrefs', JSON.stringify(this.preferences));
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des préférences:', error);
        }
    }

    /**
     * Initialise le générateur avec les informations de l'utilisateur
     * @param {Object} userData Données de l'utilisateur
     */
    initialize(userData = {}) {
        // Fusionner les données utilisateur avec les préférences existantes
        this.preferences = { ...this.preferences, ...userData };
        
        // Générer les numéros chanceux
        this.generateLuckyNumbers();
        
        // Marquer comme initialisé
        this.initialized = true;
        
        // Sauvegarder les préférences
        this.savePreferences();
    }

    /**
     * Génère les numéros chanceux basés sur les préférences
     */
    generateLuckyNumbers() {
        const numbers = new Set();
        
        // Ajouter les numéros favoris
        if (this.preferences.favoriteNumbers && this.preferences.favoriteNumbers.length > 0) {
            this.preferences.favoriteNumbers.forEach(num => {
                if (num >= 1 && num <= 90) {
                    numbers.add(num);
                }
            });
        }
        
        // Ajouter les numéros basés sur la date de naissance
        if (this.preferences.useBirthdate && this.preferences.birthdate) {
            const birthNumbers = this.generateFromBirthdate(this.preferences.birthdate);
            birthNumbers.forEach(num => numbers.add(num));
        }
        
        // Ajouter les numéros basés sur le nom
        if (this.preferences.useNames && this.preferences.name) {
            const nameNumbers = this.generateFromName(this.preferences.name);
            nameNumbers.forEach(num => numbers.add(num));
        }
        
        // Ajouter les numéros basés sur les couleurs porte-bonheur
        if (this.preferences.useLuckyColors && this.preferences.luckyColors) {
            const colorNumbers = this.generateFromColors(this.preferences.luckyColors);
            colorNumbers.forEach(num => numbers.add(num));
        }
        
        // Si pas assez de numéros, ajouter des numéros aléatoires
        while (numbers.size < 5) {
            numbers.add(Math.floor(Math.random() * 90) + 1);
        }
        
        // Convertir en tableau
        this.luckyNumbers = Array.from(numbers).sort((a, b) => a - b);
        
        // Limiter à 15 numéros maximum (pour une carte de bingo)
        if (this.luckyNumbers.length > 15) {
            this.luckyNumbers = this.luckyNumbers.slice(0, 15);
        }
        
        return this.luckyNumbers;
    }

    /**
     * Génère des numéros basés sur la date de naissance
     * @param {string} birthdate Date de naissance au format YYYY-MM-DD
     * @returns {Array<number>} Numéros générés
     */
    generateFromBirthdate(birthdate) {
        const numbers = [];
        
        try {
            const date = new Date(birthdate);
            const day = date.getDate();
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            
            // Jour directement
            if (day >= 1 && day <= 90) {
                numbers.push(day);
            }
            
            // Mois directement
            if (month >= 1 && month <= 90) {
                numbers.push(month);
            }
            
            // Somme des chiffres de l'année
            const yearSum = year.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
            if (yearSum >= 1 && yearSum <= 90) {
                numbers.push(yearSum);
            }
            
            // Jour + mois
            const dayPlusMonth = day + month;
            if (dayPlusMonth >= 1 && dayPlusMonth <= 90) {
                numbers.push(dayPlusMonth);
            }
        } catch (error) {
            console.error('Erreur lors de la génération à partir de la date de naissance:', error);
        }
        
        return numbers;
    }

    /**
     * Génère des numéros basés sur le nom
     * @param {string} name Nom de l'utilisateur
     * @returns {Array<number>} Numéros générés
     */
    generateFromName(name) {
        const numbers = [];
        
        try {
            // Convertir les lettres en valeurs numériques (A=1, B=2, etc.)
            const letterValues = name.toLowerCase().split('').map(char => {
                const code = char.charCodeAt(0) - 96;
                return code >= 1 && code <= 26 ? code : 0;
            }).filter(val => val > 0);
            
            // Ajouter les valeurs des lettres (modulo 90)
            letterValues.forEach(val => {
                if (val <= 90) {
                    numbers.push(val);
                }
            });
            
            // Ajouter la somme des valeurs (modulo 90)
            const sum = letterValues.reduce((acc, val) => acc + val, 0) % 90;
            if (sum > 0) {
                numbers.push(sum);
            }
            
            // Ajouter la longueur du nom
            const nameLength = name.length;
            if (nameLength >= 1 && nameLength <= 90) {
                numbers.push(nameLength);
            }
        } catch (error) {
            console.error('Erreur lors de la génération à partir du nom:', error);
        }
        
        return numbers;
    }

    /**
     * Génère des numéros basés sur les couleurs porte-bonheur
     * @param {Array<string>} colors Couleurs porte-bonheur
     * @returns {Array<number>} Numéros générés
     */
    generateFromColors(colors) {
        const numbers = [];
        const colorMap = {
            'rouge': [1, 9, 18, 27, 36, 45, 54, 63, 72, 81, 90],
            'bleu': [2, 8, 19, 26, 37, 44, 55, 62, 73, 80],
            'vert': [3, 7, 20, 25, 38, 43, 56, 61, 74, 79],
            'jaune': [4, 6, 21, 24, 39, 42, 57, 60, 75, 78],
            'orange': [5, 14, 23, 32, 41, 50, 59, 68, 77, 86],
            'violet': [10, 13, 28, 31, 46, 49, 64, 67, 82, 85],
            'rose': [11, 12, 29, 30, 47, 48, 65, 66, 83, 84],
            'turquoise': [15, 22, 33, 40, 51, 58, 69, 76, 87],
            'or': [16, 20, 34, 39, 52, 57, 70, 75, 88],
            'argent': [17, 19, 35, 37, 53, 55, 71, 73, 89]
        };
        
        try {
            colors.forEach(color => {
                const colorLower = color.toLowerCase();
                if (colorMap[colorLower]) {
                    // Choisir 2 numéros aléatoires de cette couleur
                    const colorNumbers = colorMap[colorLower];
                    for (let i = 0; i < 2; i++) {
                        if (colorNumbers.length > 0) {
                            const randomIndex = Math.floor(Math.random() * colorNumbers.length);
                            numbers.push(colorNumbers[randomIndex]);
                            // Éviter les doublons
                            colorNumbers.splice(randomIndex, 1);
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Erreur lors de la génération à partir des couleurs:', error);
        }
        
        return numbers;
    }

    /**
     * Obtient les numéros chanceux actuels
     * @returns {Array<number>} Numéros chanceux
     */
    getLuckyNumbers() {
        if (!this.initialized || this.luckyNumbers.length === 0) {
            this.generateLuckyNumbers();
        }
        return this.luckyNumbers;
    }

    /**
     * Met à jour les préférences et régénère les numéros chanceux
     * @param {Object} newPrefs Nouvelles préférences
     * @returns {Array<number>} Nouveaux numéros chanceux
     */
    updatePreferences(newPrefs) {
        this.preferences = { ...this.preferences, ...newPrefs };
        this.savePreferences();
        return this.generateLuckyNumbers();
    }

    /**
     * Ajoute un numéro favori
     * @param {number} number Numéro à ajouter
     */
    addFavoriteNumber(number) {
        if (!this.preferences.favoriteNumbers) {
            this.preferences.favoriteNumbers = [];
        }
        
        // Vérifier si le numéro est valide
        if (number >= 1 && number <= 90 && !this.preferences.favoriteNumbers.includes(number)) {
            this.preferences.favoriteNumbers.push(number);
            this.savePreferences();
            this.generateLuckyNumbers();
        }
    }

    /**
     * Supprime un numéro favori
     * @param {number} number Numéro à supprimer
     */
    removeFavoriteNumber(number) {
        if (this.preferences.favoriteNumbers) {
            const index = this.preferences.favoriteNumbers.indexOf(number);
            if (index !== -1) {
                this.preferences.favoriteNumbers.splice(index, 1);
                this.savePreferences();
                this.generateLuckyNumbers();
            }
        }
    }

    /**
     * Génère une carte de bingo basée sur les numéros chanceux
     * @returns {Array} Carte de bingo au format du jeu
     */
    generateLuckyCard() {
        // Générer une carte avec les numéros chanceux intégrés
        const luckyNumbers = this.getLuckyNumbers();
        
        // Initialiser une carte vide
        const card = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0], // Ligne 1
            [0, 0, 0, 0, 0, 0, 0, 0, 0], // Ligne 2
            [0, 0, 0, 0, 0, 0, 0, 0, 0]  // Ligne 3
        ];
        
        // Placer d'abord les numéros chanceux s'ils sont dans la plage 1-90
        const validLuckyNumbers = luckyNumbers.filter(num => num >= 1 && num <= 90);
        
        // Déterminer les colonnes pour chaque numéro chanceux
        const luckyNumbersByColumn = Array(9).fill().map(() => []);
        validLuckyNumbers.forEach(num => {
            const col = Math.min(Math.floor((num - 1) / 10), 8); // 8 est l'index maximum pour les colonnes 0-8
            luckyNumbersByColumn[col].push(num);
        });
        
        // Placer les numéros chanceux dans la carte
        let remainingLuckyNumbers = 15; // Maximum 15 numéros dans une carte
        
        // Pour chaque colonne
        for (let col = 0; col < 9; col++) {
            const numbersInThisColumn = luckyNumbersByColumn[col];
            const maxNumbersToPlace = Math.min(numbersInThisColumn.length, 3); // Maximum 3 par colonne
            
            // Mélanger les numéros disponibles
            const shuffledNumbers = [...numbersInThisColumn].sort(() => Math.random() - 0.5);
            
            // Combien de numéros allons-nous placer dans cette colonne?
            // Respecter les règles du bingo européen: max 2 numéros par colonne pour avoir 5 numéros par ligne
            let numbersToPlace = Math.min(maxNumbersToPlace, 2);
            
            // Si on place 0, il y a une chance de placer 1 numéro quand même
            if (numbersToPlace === 0 && remainingLuckyNumbers > 0 && Math.random() > 0.7) {
                numbersToPlace = 1;
            }
            
            // Si pas assez de numéros chanceux, générer des numéros aléatoires
            let numbersToUse = shuffledNumbers.slice(0, numbersToPlace);
            if (numbersToUse.length < numbersToPlace) {
                // Compléter avec des numéros aléatoires
                const min = col * 10 + 1;
                const max = col === 8 ? 90 : (col + 1) * 10;
                
                while (numbersToUse.length < numbersToPlace) {
                    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
                    if (!numbersToUse.includes(randomNum)) {
                        numbersToUse.push(randomNum);
                    }
                }
            }
            
            // Placer les numéros dans des lignes aléatoires
            const rowIndices = [0, 1, 2].sort(() => Math.random() - 0.5);
            
            for (let i = 0; i < numbersToPlace; i++) {
                if (remainingLuckyNumbers > 0) {
                    card[rowIndices[i]][col] = numbersToUse[i];
                    remainingLuckyNumbers--;
                }
            }
        }
        
        // S'assurer que chaque ligne a exactement 5 numéros (règles du bingo européen)
        for (let row = 0; row < 3; row++) {
            // Compter les numéros dans cette ligne
            const filledCells = card[row].filter(num => num > 0).length;
            
            if (filledCells < 5) {
                // Trouver les colonnes vides
                const emptyCols = [];
                for (let col = 0; col < 9; col++) {
                    if (card[row][col] === 0) {
                        emptyCols.push(col);
                    }
                }
                
                // Mélanger les colonnes vides
                emptyCols.sort(() => Math.random() - 0.5);
                
                // Ajouter des numéros jusqu'à avoir 5 numéros dans la ligne
                for (let i = 0; i < 5 - filledCells; i++) {
                    const col = emptyCols[i];
                    const min = col * 10 + 1;
                    const max = col === 8 ? 90 : (col + 1) * 10;
                    
                    // Générer un numéro unique pour cette colonne
                    let num;
                    do {
                        num = Math.floor(Math.random() * (max - min + 1)) + min;
                    } while (card[0][col] === num || card[1][col] === num || card[2][col] === num);
                    
                    card[row][col] = num;
                }
            } else if (filledCells > 5) {
                // Supprimer des numéros jusqu'à avoir 5 numéros dans la ligne
                const filledCols = [];
                for (let col = 0; col < 9; col++) {
                    if (card[row][col] > 0 && !luckyNumbers.includes(card[row][col])) {
                        filledCols.push(col);
                    }
                }
                
                // Mélanger les colonnes remplies (non chanceux en priorité)
                filledCols.sort(() => Math.random() - 0.5);
                
                for (let i = 0; i < filledCells - 5; i++) {
                    if (filledCols.length > i) {
                        const col = filledCols[i];
                        card[row][col] = 0;
                    }
                }
            }
        }
        
        return card;
    }

    /**
     * Ouvre l'interface des numéros chanceux
     */
    showLuckyNumbersUI() {
        // Créer la modale
        const modalContainer = document.createElement('div');
        modalContainer.className = 'lucky-numbers-modal-container';
        
        // Déterminer le contenu de la modale
        const luckyNumbers = this.getLuckyNumbers();
        let luckyNumbersHTML = '';
        
        if (luckyNumbers.length > 0) {
            luckyNumbersHTML = luckyNumbers.map(num => 
                `<div class="lucky-number">${num}</div>`
            ).join('');
        }
        
        // Créer le HTML de la modale
        modalContainer.innerHTML = `
            <div class="lucky-numbers-modal">
                <div class="modal-header">
                    <h3>Vos Numéros Chanceux</h3>
                    <button class="close-btn">&times;</button>
                </div>
                
                <div class="modal-body">
                    <div class="lucky-numbers-display">
                        ${luckyNumbersHTML}
                    </div>
                    
                    <div class="lucky-numbers-settings">
                        <h4>Paramètres</h4>
                        
                        <div class="settings-group">
                            <label>
                                <input type="checkbox" id="useBirthdate" ${this.preferences.useBirthdate ? 'checked' : ''}>
                                Utiliser ma date de naissance
                            </label>
                            
                            <div class="birthdate-input ${this.preferences.useBirthdate ? '' : 'hidden'}">
                                <input type="date" id="birthdate" value="${this.preferences.birthdate || ''}">
                            </div>
                        </div>
                        
                        <div class="settings-group">
                            <label>
                                <input type="checkbox" id="useNames" ${this.preferences.useNames ? 'checked' : ''}>
                                Utiliser mon nom
                            </label>
                            
                            <div class="name-input ${this.preferences.useNames ? '' : 'hidden'}">
                                <input type="text" id="name" placeholder="Votre nom" value="${this.preferences.name || ''}">
                            </div>
                        </div>
                        
                        <div class="settings-group">
                            <label>
                                <input type="checkbox" id="useLuckyColors" ${this.preferences.useLuckyColors ? 'checked' : ''}>
                                Utiliser mes couleurs porte-bonheur
                            </label>
                            
                            <div class="colors-input ${this.preferences.useLuckyColors ? '' : 'hidden'}">
                                <select id="luckyColors" multiple>
                                    <option value="rouge" ${this.preferences.luckyColors?.includes('rouge') ? 'selected' : ''}>Rouge</option>
                                    <option value="bleu" ${this.preferences.luckyColors?.includes('bleu') ? 'selected' : ''}>Bleu</option>
                                    <option value="vert" ${this.preferences.luckyColors?.includes('vert') ? 'selected' : ''}>Vert</option>
                                    <option value="jaune" ${this.preferences.luckyColors?.includes('jaune') ? 'selected' : ''}>Jaune</option>
                                    <option value="orange" ${this.preferences.luckyColors?.includes('orange') ? 'selected' : ''}>Orange</option>
                                    <option value="violet" ${this.preferences.luckyColors?.includes('violet') ? 'selected' : ''}>Violet</option>
                                    <option value="rose" ${this.preferences.luckyColors?.includes('rose') ? 'selected' : ''}>Rose</option>
                                    <option value="turquoise" ${this.preferences.luckyColors?.includes('turquoise') ? 'selected' : ''}>Turquoise</option>
                                    <option value="or" ${this.preferences.luckyColors?.includes('or') ? 'selected' : ''}>Or</option>
                                    <option value="argent" ${this.preferences.luckyColors?.includes('argent') ? 'selected' : ''}>Argent</option>
                                </select>
                                <small>Maintenez Ctrl/Cmd pour sélectionner plusieurs couleurs</small>
                            </div>
                        </div>
                        
                        <div class="settings-group">
                            <label>Numéros favoris</label>
                            
                            <div class="favorite-numbers">
                                <div id="favorite-numbers-list">
                                    ${(this.preferences.favoriteNumbers || []).map(num => 
                                        `<div class="favorite-number">
                                            ${num}
                                            <button class="remove-favorite" data-number="${num}">&times;</button>
                                        </div>`
                                    ).join('')}
                                </div>
                                
                                <div class="add-favorite">
                                    <input type="number" id="new-favorite" min="1" max="90" placeholder="1-90">
                                    <button id="add-favorite-btn">Ajouter</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button id="generate-lucky-card" class="primary-btn">Générer Carton Chanceux</button>
                    <button id="save-lucky-settings" class="success-btn">Enregistrer</button>
                    <button class="dismiss-btn">Annuler</button>
                </div>
            </div>
        `;
        
        // Ajouter des styles CSS
        const styles = document.createElement('style');
        styles.textContent = `
            .lucky-numbers-modal-container {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.7);
                z-index: 9999;
                display: flex;
                justify-content: center;
                align-items: center;
                animation: fadeIn 0.3s ease-out;
            }
            
            .lucky-numbers-modal {
                background-color: #2a2a2a;
                width: 90%;
                max-width: 600px;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                animation: slideIn 0.3s ease-out;
            }
            
            .modal-header {
                background-color: #0099cc;
                color: white;
                padding: 15px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .modal-header h3 {
                margin: 0;
                font-size: 18px;
            }
            
            .close-btn {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                margin: 0;
            }
            
            .modal-body {
                padding: 20px;
                max-height: 60vh;
                overflow-y: auto;
            }
            
            .lucky-numbers-display {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin-bottom: 20px;
                justify-content: center;
                min-height: 60px;
                background-color: rgba(0, 0, 0, 0.2);
                border-radius: 8px;
                padding: 15px;
            }
            
            .lucky-number {
                width: 40px;
                height: 40px;
                background-color: #0099cc;
                color: white;
                display: flex;
                justify-content: center;
                align-items: center;
                border-radius: 50%;
                font-weight: bold;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            }
            
            .lucky-numbers-settings {
                background-color: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                padding: 15px;
            }
            
            .lucky-numbers-settings h4 {
                margin-top: 0;
                margin-bottom: 15px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                padding-bottom: 10px;
            }
            
            .settings-group {
                margin-bottom: 15px;
            }
            
            .settings-group label {
                display: block;
                margin-bottom: 8px;
                font-weight: bold;
            }
            
            .birthdate-input, .name-input, .colors-input {
                margin-top: 8px;
                margin-bottom: 15px;
                padding-left: 20px;
            }
            
            .hidden {
                display: none;
            }
            
            input[type="date"], input[type="text"], input[type="number"] {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #444;
                border-radius: 4px;
                background-color: #333;
                color: #fff;
            }
            
            select {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #444;
                border-radius: 4px;
                background-color: #333;
                color: #fff;
                height: 100px;
            }
            
            .favorite-numbers {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            #favorite-numbers-list {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                min-height: 40px;
                background-color: rgba(0, 0, 0, 0.2);
                border-radius: 5px;
                padding: 10px;
            }
            
            .favorite-number {
                background-color: #4CAF50;
                color: white;
                display: flex;
                align-items: center;
                border-radius: 20px;
                padding: 5px 10px;
                font-size: 14px;
            }
            
            .remove-favorite {
                background: none;
                border: none;
                color: white;
                margin-left: 5px;
                cursor: pointer;
                font-size: 16px;
            }
            
            .add-favorite {
                display: flex;
                gap: 10px;
            }
            
            #new-favorite {
                width: 80px;
            }
            
            .modal-footer {
                padding: 15px 20px;
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            button {
                padding: 8px 15px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            
            .primary-btn {
                background-color: #0099cc;
                color: white;
            }
            
            .primary-btn:hover {
                background-color: #00b3ee;
            }
            
            .success-btn {
                background-color: #4CAF50;
                color: white;
            }
            
            .success-btn:hover {
                background-color: #5cb85c;
            }
            
            .dismiss-btn {
                background-color: #555;
                color: white;
            }
            
            .dismiss-btn:hover {
                background-color: #666;
            }
            
            small {
                display: block;
                color: #999;
                margin-top: 5px;
                font-size: 12px;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideIn {
                from { transform: translateY(-20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            @media (max-width: 768px) {
                .lucky-numbers-modal {
                    width: 95%;
                    max-height: 90vh;
                }
                
                .modal-body {
                    max-height: 70vh;
                }
                
                .modal-footer {
                    flex-direction: column;
                }
                
                .modal-footer button {
                    width: 100%;
                }
            }
        `;
        
        // Ajouter la modale et les styles au document
        document.head.appendChild(styles);
        document.body.appendChild(modalContainer);
        
        // Gérer les interactions avec les contrôles
        
        // Fermer la modale
        const closeBtn = modalContainer.querySelector('.close-btn');
        const dismissBtn = modalContainer.querySelector('.dismiss-btn');
        
        [closeBtn, dismissBtn].forEach(btn => {
            btn.addEventListener('click', () => {
                styles.remove();
                modalContainer.remove();
            });
        });
        
        // Gérer les cases à cocher
        const useBirthdateCheckbox = document.getElementById('useBirthdate');
        const useNamesCheckbox = document.getElementById('useNames');
        const useLuckyColorsCheckbox = document.getElementById('useLuckyColors');
        
        useBirthdateCheckbox.addEventListener('change', () => {
            document.querySelector('.birthdate-input').classList.toggle('hidden', !useBirthdateCheckbox.checked);
        });
        
        useNamesCheckbox.addEventListener('change', () => {
            document.querySelector('.name-input').classList.toggle('hidden', !useNamesCheckbox.checked);
        });
        
        useLuckyColorsCheckbox.addEventListener('change', () => {
            document.querySelector('.colors-input').classList.toggle('hidden', !useLuckyColorsCheckbox.checked);
        });
        
        // Gérer les numéros favoris
        document.getElementById('add-favorite-btn').addEventListener('click', () => {
            const input = document.getElementById('new-favorite');
            const number = parseInt(input.value);
            
            if (number >= 1 && number <= 90) {
                this.addFavoriteNumber(number);
                
                // Mettre à jour l'affichage
                const favoritesList = document.getElementById('favorite-numbers-list');
                const favoriteElement = document.createElement('div');
                favoriteElement.className = 'favorite-number';
                favoriteElement.innerHTML = `
                    ${number}
                    <button class="remove-favorite" data-number="${number}">&times;</button>
                `;
                favoritesList.appendChild(favoriteElement);
                
                // Ajouter l'écouteur pour le bouton de suppression
                favoriteElement.querySelector('.remove-favorite').addEventListener('click', (e) => {
                    const num = parseInt(e.target.getAttribute('data-number'));
                    this.removeFavoriteNumber(num);
                    favoriteElement.remove();
                    
                    // Mettre à jour l'affichage des numéros chanceux
                    this.updateLuckyNumbersDisplay();
                });
                
                // Effacer le champ
                input.value = '';
                
                // Mettre à jour l'affichage des numéros chanceux
                this.updateLuckyNumbersDisplay();
            }
        });
        
        // Ajouter des écouteurs pour les boutons de suppression existants
        document.querySelectorAll('.remove-favorite').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const num = parseInt(e.target.getAttribute('data-number'));
                this.removeFavoriteNumber(num);
                e.target.parentElement.remove();
                
                // Mettre à jour l'affichage des numéros chanceux
                this.updateLuckyNumbersDisplay();
            });
        });
        
        // Enregistrer les paramètres
        document.getElementById('save-lucky-settings').addEventListener('click', () => {
            const newPrefs = {
                useBirthdate: useBirthdateCheckbox.checked,
                useNames: useNamesCheckbox.checked,
                useLuckyColors: useLuckyColorsCheckbox.checked,
                birthdate: document.getElementById('birthdate').value,
                name: document.getElementById('name').value,
                luckyColors: Array.from(document.getElementById('luckyColors').selectedOptions).map(opt => opt.value)
            };
            
            this.updatePreferences(newPrefs);
            
            // Mettre à jour l'affichage
            this.updateLuckyNumbersDisplay();
            
            // Afficher une notification
            const notification = document.createElement('div');
            notification.className = 'notification success-notification';
            notification.innerHTML = `
                <div class="notification-content">
                    <h3>Préférences enregistrées</h3>
                    <p>Vos numéros chanceux ont été mis à jour.</p>
                </div>
            `;
            document.body.appendChild(notification);
            
            // Fermer la notification après 3 secondes
            setTimeout(() => {
                notification.remove();
            }, 3000);
        });
        
        // Générer un carton chanceux
        document.getElementById('generate-lucky-card').addEventListener('click', () => {
            // Enregistrer les préférences actuelles
            const newPrefs = {
                useBirthdate: useBirthdateCheckbox.checked,
                useNames: useNamesCheckbox.checked,
                useLuckyColors: useLuckyColorsCheckbox.checked,
                birthdate: document.getElementById('birthdate').value,
                name: document.getElementById('name').value,
                luckyColors: Array.from(document.getElementById('luckyColors').selectedOptions).map(opt => opt.value)
            };
            
            this.updatePreferences(newPrefs);
            
            // Générer un carton chanceux
            const luckyCard = this.generateLuckyCard();
            
            // Fermer la modale
            styles.remove();
            modalContainer.remove();
            
            // Déclencher l'événement pour générer le carton
            const event = new CustomEvent('generate-lucky-card', { 
                detail: { luckyCard } 
            });
            document.dispatchEvent(event);
            
            // Afficher une notification
            const notification = document.createElement('div');
            notification.className = 'notification success-notification';
            notification.innerHTML = `
                <div class="notification-content">
                    <h3>Carton chanceux généré!</h3>
                    <p>Votre carton a été créé avec vos numéros chanceux.</p>
                </div>
            `;
            document.body.appendChild(notification);
            
            // Fermer la notification après 3 secondes
            setTimeout(() => {
                notification.remove();
            }, 3000);
        });
    }
    
    /**
     * Met à jour l'affichage des numéros chanceux dans la modale
     */
    updateLuckyNumbersDisplay() {
        const display = document.querySelector('.lucky-numbers-display');
        if (display) {
            // Générer les numéros chanceux
            this.generateLuckyNumbers();
            
            // Mettre à jour l'affichage
            display.innerHTML = this.luckyNumbers.map(num => 
                `<div class="lucky-number">${num}</div>`
            ).join('');
        }
    }
}

// Initialiser le générateur et l'exposer globalement
window.luckyNumberGenerator = new LuckyNumberGenerator();

// Fonction pour afficher le générateur de numéros chanceux
window.showLuckyNumberGenerator = function() {
    window.luckyNumberGenerator.showLuckyNumbersUI();
};

// Écouter l'événement pour générer un carton chanceux
document.addEventListener('generate-lucky-card', (e) => {
    const { luckyCard } = e.detail;
    
    // Tenter de trouver la fonction de génération de cartons
    if (typeof generateBingoCards === 'function') {
        // Mettre le carton chanceux dans une variable globale pour qu'il soit utilisé
        window.currentLuckyCard = luckyCard;
        
        // Générer un carton avec la fonction existante
        // La logique d'utilisation du carton chanceux sera implémentée dans generateBingoCards
        generateBingoCards(1, true);
    } else {
        console.error('La fonction generateBingoCards n\'est pas disponible');
    }
});