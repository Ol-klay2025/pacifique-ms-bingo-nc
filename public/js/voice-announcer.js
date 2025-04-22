/**
 * MS BINGO Pacifique - Module de voix d'annonceur
 * 
 * Ce module gère la voix synthétisée pour annoncer les numéros tirés, 
 * avec support multilingue (français et anglais) et options de personnalisation.
 */

class VoiceAnnouncer {
    constructor() {
        this.enabled = true;
        this.language = 'fr-FR'; // Langue par défaut
        this.femaleVoice = true; // Voix féminine par défaut
        this.volume = 1.0; // Volume maximum par défaut
        this.pitch = 1.0; // Tonalité normale par défaut
        this.rate = 0.8; // Débit lent pour une meilleure compréhension
        
        // Variables pour éviter les répétitions
        this.lastSpokenText = '';
        this.lastSpokenTime = 0;
        
        // État de vérification de quine
        this.isVerifyingQuine = false;
        
        // File d'attente d'annonces
        this.announcementQueue = [];
        
        // Support multilingue étendu
        this.supportedLanguages = [
            { code: 'fr-FR', name: 'Français' },
            { code: 'en-US', name: 'English' },
            { code: 'es-ES', name: 'Español' },
            { code: 'pt-BR', name: 'Português' },
            { code: 'de-DE', name: 'Deutsch' },
            { code: 'it-IT', name: 'Italiano' },
            { code: 'ja-JP', name: '日本語' },
            { code: 'zh-CN', name: '中文' },
            { code: 'ru-RU', name: 'Русский' },
            { code: 'ar-SA', name: 'العربية' }
        ];
        
        // Textes localisés pour les annonces
        this.localizedTexts = {
            'fr-FR': {
                gameStart: 'Attention ! La partie commence. Bonne chance à tous les joueurs !',
                gameEnd: 'La partie est terminée. Merci de votre participation !',
                quine: 'Quine validée ! Félicitations !',
                bingo: 'Bingo validé ! Félicitations pour cette victoire !',
                number: '{0}',
                smallNumber: 'Petit {0}',
                doubleNumber: 'Coller {0}',
                voiceEnabled: 'Annonceur vocal activé',
                voiceDisabled: 'Annonceur vocal désactivé',
                femaleVoice: 'Voix féminine sélectionnée',
                maleVoice: 'Voix masculine sélectionnée',
                languageSelected: 'Langue française sélectionnée',
                testMessage: 'Ceci est un test de l\'annonceur vocal pour MS BINGO Pacifique'
            },
            'en-US': {
                gameStart: 'Attention! The game is starting. Good luck to all players!',
                gameEnd: 'The game has ended. Thank you for your participation!',
                quine: 'Line completed! Congratulations!',
                bingo: 'Bingo validated! Congratulations on your win!',
                number: '{0}',
                smallNumber: 'Small {0}',
                doubleNumber: 'Double {0}',
                voiceEnabled: 'Voice announcer enabled',
                voiceDisabled: 'Voice announcer disabled',
                femaleVoice: 'Female voice selected',
                maleVoice: 'Male voice selected',
                languageSelected: 'English language selected',
                testMessage: 'This is a voice announcer test for Pacific MS BINGO'
            },
            'es-ES': {
                gameStart: '¡Atención! El juego está comenzando. ¡Buena suerte a todos los jugadores!',
                gameEnd: 'El juego ha terminado. ¡Gracias por su participación!',
                quine: '¡Línea completada! ¡Felicidades!',
                bingo: '¡Bingo validado! ¡Felicidades por tu victoria!',
                number: 'Número {0}',
                voiceEnabled: 'Anunciador de voz activado',
                voiceDisabled: 'Anunciador de voz desactivado',
                femaleVoice: 'Voz femenina seleccionada',
                maleVoice: 'Voz masculina seleccionada',
                languageSelected: 'Idioma español seleccionado',
                testMessage: 'Esta es una prueba del anunciador de voz para MS BINGO Pacífico'
            },
            'pt-BR': {
                gameStart: 'Atenção! O jogo está começando. Boa sorte a todos os jogadores!',
                gameEnd: 'O jogo terminou. Obrigado pela sua participação!',
                quine: 'Linha completada! Parabéns!',
                bingo: 'Bingo validado! Parabéns pela sua vitória!',
                number: 'Número {0}',
                voiceEnabled: 'Anunciador de voz ativado',
                voiceDisabled: 'Anunciador de voz desativado',
                femaleVoice: 'Voz feminina selecionada',
                maleVoice: 'Voz masculina selecionada',
                languageSelected: 'Idioma português selecionado',
                testMessage: 'Este é um teste do anunciador de voz para o MS BINGO Pacífico'
            },
            'de-DE': {
                gameStart: 'Achtung! Das Spiel beginnt. Viel Glück an alle Spieler!',
                gameEnd: 'Das Spiel ist zu Ende. Vielen Dank für Ihre Teilnahme!',
                quine: 'Linie abgeschlossen! Herzlichen Glückwunsch!',
                bingo: 'Bingo bestätigt! Herzlichen Glückwunsch zu Ihrem Sieg!',
                number: 'Nummer {0}',
                voiceEnabled: 'Sprachansage aktiviert',
                voiceDisabled: 'Sprachansage deaktiviert',
                femaleVoice: 'Weibliche Stimme ausgewählt',
                maleVoice: 'Männliche Stimme ausgewählt',
                languageSelected: 'Deutsche Sprache ausgewählt',
                testMessage: 'Dies ist ein Test der Sprachansage für MS BINGO Pazifik'
            },
            'it-IT': {
                gameStart: 'Attenzione! Il gioco sta iniziando. Buona fortuna a tutti i giocatori!',
                gameEnd: 'Il gioco è terminato. Grazie per la tua partecipazione!',
                quine: 'Linea completata! Congratulazioni!',
                bingo: 'Bingo convalidato! Congratulazioni per la tua vittoria!',
                number: 'Numero {0}',
                voiceEnabled: 'Annunciatore vocale attivato',
                voiceDisabled: 'Annunciatore vocale disattivato',
                femaleVoice: 'Voce femminile selezionata',
                maleVoice: 'Voce maschile selezionata',
                languageSelected: 'Lingua italiana selezionata',
                testMessage: 'Questo è un test dell\'annunciatore vocale per MS BINGO Pacifico'
            },
            'ja-JP': {
                gameStart: '注意！ゲームが始まります。すべてのプレイヤーに幸運を！',
                gameEnd: 'ゲームが終了しました。ご参加ありがとうございました！',
                quine: 'ラインが完成しました！おめでとうございます！',
                bingo: 'ビンゴが確認されました！勝利おめでとうございます！',
                number: '番号 {0}',
                voiceEnabled: '音声アナウンサーが有効になりました',
                voiceDisabled: '音声アナウンサーが無効になりました',
                femaleVoice: '女性の声が選択されました',
                maleVoice: '男性の声が選択されました',
                languageSelected: '日本語が選択されました',
                testMessage: 'これは、パシフィックMS BINGOの音声アナウンサーのテストです'
            },
            'zh-CN': {
                gameStart: '注意！游戏即将开始。祝所有玩家好运！',
                gameEnd: '游戏已结束。感谢您的参与！',
                quine: '一行已完成！恭喜！',
                bingo: '宾果已验证！恭喜您获胜！',
                number: '号码 {0}',
                voiceEnabled: '语音播报已启用',
                voiceDisabled: '语音播报已禁用',
                femaleVoice: '已选择女声',
                maleVoice: '已选择男声',
                languageSelected: '已选择中文',
                testMessage: '这是太平洋MS BINGO的语音播报测试'
            },
            'ru-RU': {
                gameStart: 'Внимание! Игра начинается. Удачи всем игрокам!',
                gameEnd: 'Игра закончилась. Спасибо за участие!',
                quine: 'Линия заполнена! Поздравляем!',
                bingo: 'Бинго подтверждено! Поздравляем с победой!',
                number: 'Номер {0}',
                voiceEnabled: 'Голосовой диктор включен',
                voiceDisabled: 'Голосовой диктор выключен',
                femaleVoice: 'Выбран женский голос',
                maleVoice: 'Выбран мужской голос',
                languageSelected: 'Выбран русский язык',
                testMessage: 'Это тест голосового диктора для MS BINGO Тихоокеанский'
            },
            'ar-SA': {
                gameStart: 'انتباه! اللعبة تبدأ. حظا سعيدا لجميع اللاعبين!',
                gameEnd: 'انتهت اللعبة. شكرا لمشاركتكم!',
                quine: 'خط مكتمل! تهانينا!',
                bingo: 'تم التحقق من البينغو! تهانينا على الفوز!',
                number: 'رقم {0}',
                voiceEnabled: 'تم تفعيل المعلن الصوتي',
                voiceDisabled: 'تم تعطيل المعلن الصوتي',
                femaleVoice: 'تم اختيار صوت أنثوي',
                maleVoice: 'تم اختيار صوت ذكوري',
                languageSelected: 'تم اختيار اللغة العربية',
                testMessage: 'هذا اختبار للمعلن الصوتي لـ MS BINGO المحيط الهادئ'
            }
        };
        
        // Charger les préférences sauvegardées
        this.loadPreferences();
        
        // Initialiser la synthèse vocale
        this.synth = window.speechSynthesis;
        
        // Écouter les événements de tirage
        document.addEventListener('numberDrawn', (e) => {
            if (this.enabled) {
                this.announceNumber(e.detail.number, e.detail.column);
            }
        });
        
        // Écouter les événements de quine et bingo pour les annoncer
        document.addEventListener('quine-achieved', async (e) => {
            if (this.enabled) {
                // Utilisation correcte de la fonction asynchrone avec await
                await this.announceQuine(e.detail && e.detail.card ? e.detail.card : null);
            }
        });
        
        document.addEventListener('bingo-achieved', async (e) => {
            if (this.enabled) {
                // Utilisation correcte de la fonction asynchrone avec await
                await this.announceBingo();
                
                // Après l'annonce complète, déclencher l'événement de vérification si nécessaire
                if (e.detail && e.detail.card) {
                    const verificationEvent = new CustomEvent('bingo-verification', {
                        detail: { card: e.detail.card }
                    });
                    document.dispatchEvent(verificationEvent);
                }
            }
        });
        
        // Écouter l'événement de début de partie
        document.addEventListener('gameStarted', (e) => {
            if (this.enabled) {
                this.announceGameStart();
            }
        });
        
        // Écouter l'événement de fin de partie
        document.addEventListener('gameEnded', (e) => {
            if (this.enabled) {
                this.announceGameEnd();
            }
        });
        
        // Exposer l'API globale
        window.voiceAnnouncer = this;
    }
    
    /**
     * Charge les préférences depuis localStorage
     */
    loadPreferences() {
        try {
            const savedPrefs = localStorage.getItem('msBingoVoicePrefs');
            if (savedPrefs) {
                const prefs = JSON.parse(savedPrefs);
                this.enabled = prefs.enabled !== false; // Par défaut activé
                this.language = prefs.language || 'fr-FR';
                this.femaleVoice = prefs.femaleVoice !== false; // Par défaut voix féminine
                this.volume = prefs.volume !== undefined ? prefs.volume : 1.0;
                this.pitch = prefs.pitch !== undefined ? prefs.pitch : 1.0;
                this.rate = prefs.rate !== undefined ? prefs.rate : 0.9;
            }
        } catch (error) {
            console.error('Erreur lors du chargement des préférences vocales:', error);
        }
    }
    
    /**
     * Sauvegarde les préférences actuelles
     */
    savePreferences() {
        try {
            const prefs = {
                enabled: this.enabled,
                language: this.language,
                femaleVoice: this.femaleVoice,
                volume: this.volume,
                pitch: this.pitch,
                rate: this.rate
            };
            localStorage.setItem('msBingoVoicePrefs', JSON.stringify(prefs));
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des préférences vocales:', error);
        }
    }
    
    /**
     * Active ou désactive l'annonceur vocal
     * @param {boolean} enabled - Vrai pour activer, faux pour désactiver
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        this.savePreferences();
        
        // Annoncer le changement d'état
        if (this.enabled) {
            const text = this.getLocalizedText('voiceEnabled');
            this.speak(text);
        }
    }
    
    /**
     * Définit la langue de l'annonceur
     * @param {string} lang - Code de langue (fr-FR, en-US, etc.)
     */
    setLanguage(lang) {
        // Vérifier si la langue est supportée
        const isSupported = this.supportedLanguages.some(language => language.code === lang);
        
        if (isSupported) {
            this.language = lang;
            this.savePreferences();
            
            // Annoncer le changement de langue
            const text = this.getLocalizedText('languageSelected');
            this.speak(text);
        }
    }
    
    /**
     * Règle le sexe de la voix (masculin/féminin)
     * @param {boolean} isFemale - Vrai pour voix féminine, faux pour voix masculine
     */
    setFemaleVoice(isFemale) {
        this.femaleVoice = isFemale;
        this.savePreferences();
        
        // Annoncer le changement de voix
        const key = isFemale ? 'femaleVoice' : 'maleVoice';
        const text = this.getLocalizedText(key);
        this.speak(text);
    }
    
    /**
     * Règle le volume de la voix
     * @param {number} volume - Volume entre 0 et 1
     */
    setVolume(volume) {
        if (volume >= 0 && volume <= 1) {
            this.volume = volume;
            this.savePreferences();
        }
    }
    
    /**
     * Crée un objet de voix basé sur les préférences actuelles
     * @returns {SpeechSynthesisUtterance} Objet de synthèse vocale configuré
     */
    createUtterance(text) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.language;
        utterance.volume = this.volume;
        utterance.pitch = this.pitch;
        utterance.rate = this.rate;
        
        // Sélectionner la voix appropriée si disponible
        const voices = this.synth.getVoices();
        const filteredVoices = voices.filter(voice => 
            voice.lang.startsWith(this.language.substring(0, 2)) &&
            ((this.femaleVoice && voice.name.includes('female')) ||
             (!this.femaleVoice && voice.name.includes('male')))
        );
        
        if (filteredVoices.length > 0) {
            utterance.voice = filteredVoices[0];
        } else {
            // Si pas de correspondance exacte, utiliser une voix avec la bonne langue
            const langVoices = voices.filter(voice => 
                voice.lang.startsWith(this.language.substring(0, 2))
            );
            
            if (langVoices.length > 0) {
                utterance.voice = langVoices[0];
            }
        }
        
        return utterance;
    }
    
    /**
     * Prononce un texte
     * @param {string} text - Texte à prononcer
     * @param {boolean} cancelPrevious - Si vrai, annule les annonces précédentes
     * @returns {Promise} - Promesse résolue lorsque la synthèse est terminée
     */
    speak(text, cancelPrevious = true) {
        return new Promise((resolve) => {
            // Ne rien prononcer si en mode vérification de quine, sauf si c'est une annonce liée à la quine
            if (this.isVerifyingQuine && !text.includes("Quine") && !text.includes("Vérification")) {
                console.log('Annonce ignorée pendant vérification de quine:', text);
                resolve();
                return;
            }
            
            // Protection contre les appels répétés avec le même texte
            if (this.lastSpokenText === text && Date.now() - this.lastSpokenTime < 3000) {
                console.log('Évitement de répétition:', text);
                resolve();
                return;
            }
            
            // Annuler toute synthèse vocale en cours si demandé
            if (cancelPrevious) {
                this.synth.cancel();
            }
            
            // Créer l'utterance et la prononcer
            const utterance = this.createUtterance(text);
            
            // Ajouter un gestionnaire de fin pour résoudre la promesse
            utterance.onend = () => {
                console.log(`Fin de l'annonce: "${text}"`);
                resolve();
            };
            
            // Ajouter un gestionnaire d'erreur
            utterance.onerror = (event) => {
                console.error(`Erreur de synthèse vocale: ${event.error}`);
                resolve(); // Résoudre quand même pour ne pas bloquer
            };
            
            // Prononcer le texte
            this.synth.speak(utterance);
            
            // Mémoriser ce texte et l'heure pour éviter les répétitions
            this.lastSpokenText = text;
            this.lastSpokenTime = Date.now();
        });
    }
    
    /**
     * Obtient un texte localisé
     * @param {string} key Clé du texte à obtenir
     * @param {Array<string>} params Paramètres à insérer dans le texte
     * @returns {string} Texte localisé
     */
    getLocalizedText(key, params = []) {
        const texts = this.localizedTexts[this.language] || this.localizedTexts['en-US'];
        let text = texts[key] || '';
        
        // Remplacer les paramètres
        params.forEach((param, index) => {
            text = text.replace(`{${index}}`, param);
        });
        
        return text;
    }

    /**
     * Annonce un numéro tiré
     * @param {number} number - Numéro tiré
     * @param {number} column - Colonne du numéro (pour le format européen)
     */
    announceNumber(number, column) {
        if (this.language === 'fr-FR') {
            // Règles spéciales pour le français
            const num = parseInt(number);
            let key = 'number';
            let digitToAnnounce = num;
            
            // Chiffres de 1 à 9: annoncer "petit X"
            if (num >= 1 && num <= 9) {
                key = 'smallNumber';
            } 
            // Doubles: annoncer "coller X"  (11, 22, 33, etc.)
            else if (num === 11 || num === 22 || num === 33 || num === 44 || 
                    num === 55 || num === 66 || num === 77 || num === 88) {
                key = 'doubleNumber';
                // Extraire le premier chiffre du double
                digitToAnnounce = Math.floor(num / 10);
            }
            
            const text = this.getLocalizedText(key, [digitToAnnounce.toString()]);
            this.speak(text);
        } else {
            // Pour les autres langues, comportement normal
            const text = this.getLocalizedText('number', [number.toString()]);
            this.speak(text);
        }
    }
    
    /**
     * Annonce les numéros d'une quine un par un avec un intervalle
     * @param {Array<number>} numeros - Liste des numéros à annoncer
     * @param {number} index - Index actuel dans la liste
     * @param {Function} callback - Fonction à appeler lorsque tous les numéros ont été annoncés
     */
    annoncerNumerosQuine(numeros, index, callback) {
        if (index < numeros.length) {
            this.speak(numeros[index].toString(), () => {
                setTimeout(() => {
                    this.annoncerNumerosQuine(numeros, index + 1, callback);
                }, 2000); // 2 secondes entre chaque numéro
            });
        } else {
            // Tous les numéros ont été annoncés
            if (typeof callback === 'function') {
                callback();
            }
        }
    }
    
    /**
     * Joue la séquence complète d'annonce de quine
     * @param {string|number} numeroGagnant - Le numéro gagnant qui a déclenché la quine
     * @param {string|number} numeroCarton - Le numéro du carton gagnant
     * @param {Array<number>} numerosQuine - Liste des numéros de la quine
     * @param {Function} redemarrerPartie - Fonction à appeler pour redémarrer la partie
     */
    playQuineSequence(numeroGagnant, numeroCarton, numerosQuine, redemarrerPartie) {
        // Activer le mode de vérification de quine
        this.isVerifyingQuine = true;
        
        // Mettre le jeu en pause
        if (typeof window.pauseBingoGame === 'function') {
            window.pauseBingoGame();
        }
        
        // Arrêter toutes les annonces en cours
        this.synth.cancel();
        
        // Corriger la prononciation du numéro gagnant si nécessaire
        let numeroGagnantTexte = numeroGagnant.toString();
        switch (parseInt(numeroGagnant)) {
            case 74:
                numeroGagnantTexte = "soixante-quatorze";
                break;
            case 84:
                numeroGagnantTexte = "quatre-vingt-quatre";
                break;
            case 81:
                numeroGagnantTexte = "quatre-vingt-un";
                break;
        }
        
        // Séquence d'annonce
        const self = this;
        this.speak(`Numéro gagnant... ${numeroGagnantTexte}`, () => {
            self.speak(`Quine annoncée du carton numéro ${numeroCarton}`, () => {
                self.speak("Correction", () => {
                    self.annoncerNumerosQuine(numerosQuine, 0, () => {
                        self.speak("La quine est correcte, continuons pour le Bingo", () => {
                            // Désactiver le mode de vérification
                            self.isVerifyingQuine = false;
                            
                            // Redémarrer la partie
                            if (typeof redemarrerPartie === 'function') {
                                redemarrerPartie();
                            } else if (typeof window.resumeBingoGame === 'function') {
                                window.resumeBingoGame();
                            }
                        });
                    });
                });
            });
        });
    }

    /**
     * Annonce une quine et déclenche le processus de vérification
     * @param {Object} cardInfo - Informations sur la carte gagnante (optionnel)
     */
    async announceQuine(cardInfo) {
        try {
            // Récupérer le dernier numéro tiré
            const lastDrawnNumber = window.lastDrawnNumber || null;
            
            // Récupérer les numéros de la quine si disponibles
            let numerosQuine = [];
            if (cardInfo && cardInfo.winningNumbers) {
                numerosQuine = cardInfo.winningNumbers.filter(n => n > 0);
            }
            
            // Utiliser la nouvelle fonction simplifiée pour l'annonce de quine
            this.playQuineSequence(
                lastDrawnNumber || "dernier numéro",
                cardInfo ? cardInfo.id : "inconnu",
                numerosQuine.length > 0 ? numerosQuine : [1, 2, 3, 4, 5], // utiliser des numéros fictifs si pas de données
                () => {
                    if (typeof window.resumeBingoGame === 'function') {
                        window.resumeBingoGame();
                    }
                }
            );
            
            // Déclencher l'événement de vérification
            if (cardInfo) {
                const verificationEvent = new CustomEvent('quine-verification', {
                    detail: { card: cardInfo }
                });
                document.dispatchEvent(verificationEvent);
            }
        } catch (error) {
            console.error("Erreur lors de l'annonce de quine:", error);
            
            // S'assurer que le mode de vérification est désactivé en cas d'erreur
            this.isVerifyingQuine = false;
            
            // Tenter de reprendre le jeu en cas d'erreur
            if (typeof window.resumeBingoGame === 'function') {
                setTimeout(() => window.resumeBingoGame(), 2000);
            }
        }
    }
    
    /**
     * Annonce un numéro clairement et renvoie une promesse
     * @param {number} number - Le numéro à annoncer
     * @returns {Promise} - Une promesse résolue quand l'annonce est terminée
     */
    async announceNumberClearly(number) {
        // Toujours faire une pause avant l'annonce pour améliorer la clarté
        const num = parseInt(number);
        
        if (this.language === 'fr-FR') {
            // Cas spéciaux qui posent problème - prononciation exacte et découpée
            if (num === 11) {
                return this.speak(`Numéro onze! chiffre un et chiffre un! Je répète, onze! un-un!`);
            } else if (num === 74) {
                return this.speak(`Numéro soixante-quatorze! chiffre sept et chiffre quatre! Je répète, soixante-quatorze! sept-quatre!`);
            } else if (num === 84) {
                return this.speak(`Numéro quatre-vingt-quatre! chiffre huit et chiffre quatre! Je répète, quatre-vingt-quatre! huit-quatre!`);
            } else if (num === 81) {
                return this.speak(`Numéro quatre-vingt-un! chiffre huit et chiffre un! Je répète, quatre-vingt-un! huit-un!`);
            }
            // Améliorer la prononciation pour le français
            else if (num >= 1 && num <= 9) {
                // Pour les petits numéros, insérer des pauses
                return this.speak(`Numéro... ${num}`);
            } else if (num === 22 || num === 33 || num === 44 || 
                       num === 55 || num === 66 || num === 77 || num === 88) {
                // Pour les doubles, les annoncer différemment
                return this.speak(`Numéro ${num}, je répète, ${num.toString().split('').join(' ')}`);
            } else if (num >= 10 && num <= 19) {
                // Pour les nombres de 10-19, prononcer chaque chiffre
                return this.speak(`Numéro ${num}, ${Math.floor(num/10)}-${num%10}, je répète, ${num}`);
            } else if (num >= 70 && num <= 79) {
                // Cas spécial pour les 70
                return this.speak(`Numéro soixante-${num-60}, ${Math.floor(num/10)}-${num%10}, je répète, ${num}`);
            } else if (num >= 80 && num <= 89) {
                // Cas spécial pour les 80
                return this.speak(`Numéro quatre-vingt-${num-80}, ${Math.floor(num/10)}-${num%10}, je répète, ${num}`);
            } else {
                // Pour les autres nombres, prononcer les dizaines et les unités séparément
                const dizaine = Math.floor(num / 10) * 10;
                const unite = num % 10;
                
                if (unite === 0) {
                    return this.speak(`Numéro ${num}, je répète, ${num}`);
                } else {
                    return this.speak(`Numéro ${num}, ${Math.floor(num/10)}-${num%10}, je répète, ${num}`);
                }
            }
        } else {
            // Pour l'anglais et autres langues
            return this.speak(`Number ${num}, ${num.toString().split('').join('-')}, I repeat, ${num}`);
        }
    }
    
    /**
     * Annonce un numéro suivi d'un résultat, en garantissant que le résultat
     * ne sera annoncé qu'après la fin complète de l'annonce du numéro
     * @param {string} number - Numéro à annoncer
     * @param {string} result - Résultat à annoncer après le numéro (ex: "Quine !")
     * @returns {Promise} - Promesse résolue lorsque les deux annonces sont terminées
     */
    announceNumberAndResult(number, result) {
        return new Promise((resolve) => {
            // Créer l'annonce du numéro
            const numberUtterance = new SpeechSynthesisUtterance(number);
            numberUtterance.lang = this.language;
            numberUtterance.volume = this.volume;
            
            if (this.femaleVoice) {
                // Chercher une voix féminine
                const voices = this.synth.getVoices();
                const femaleVoice = voices.find(v => 
                    v.lang.startsWith(this.language.split('-')[0]) && 
                    v.name.toLowerCase().includes('female')
                );
                
                if (femaleVoice) {
                    numberUtterance.voice = femaleVoice;
                }
            }
            
            // Configurer la fin de l'annonce du numéro pour déclencher l'annonce du résultat
            numberUtterance.onend = () => {
                // Créer l'annonce du résultat
                const resultUtterance = new SpeechSynthesisUtterance(result);
                resultUtterance.lang = this.language;
                resultUtterance.volume = this.volume;
                
                if (this.femaleVoice) {
                    // Chercher une voix féminine
                    const voices = this.synth.getVoices();
                    const femaleVoice = voices.find(v => 
                        v.lang.startsWith(this.language.split('-')[0]) && 
                        v.name.toLowerCase().includes('female')
                    );
                    
                    if (femaleVoice) {
                        resultUtterance.voice = femaleVoice;
                    }
                }
                
                // Configurer la fin de l'annonce du résultat
                resultUtterance.onend = () => {
                    resolve(); // Résoudre la promesse
                };
                
                this.synth.speak(resultUtterance);
            };
            
            // Démarrer l'annonce du numéro
            this.synth.speak(numberUtterance);
        });
    }
    
    /**
     * Annonce un bingo et attend que l'annonce soit terminée
     * @returns {Promise} - Promesse résolue lorsque l'annonce est terminée
     */
    async announceBingo() {
        try {
            // Activer le mode de vérification (comme pour les quines)
            this.isVerifyingQuine = true;
            
            // Arrêter toutes les annonces en cours
            this.synth.cancel();
            
            // Attendre que toutes les annonces précédentes soient terminées
            await new Promise(resolve => {
                const checkInterval = setInterval(() => {
                    if (!this.synth.speaking) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);
            });
            
            // Attendre un délai additionnel pour séparer clairement les annonces
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Récupérer le texte pour l'annonce de bingo
            const text = this.getLocalizedText('bingo');
            
            // Créer la promesse pour l'annonce
            const announcePromise = this.speak(text, true);
            
            // Attendre que l'annonce soit terminée
            await announcePromise;
            
            // Attendre un délai supplémentaire pour s'assurer que l'annonce est bien terminée
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Désactiver le mode de vérification
            this.isVerifyingQuine = false;
            
            return true;
        } catch (error) {
            console.error("Erreur lors de l'annonce de bingo:", error);
            this.isVerifyingQuine = false;
            return false;
        }
    }
    
    /**
     * Annonce le début d'une partie
     */
    announceGameStart() {
        const text = this.getLocalizedText('gameStart');
        this.speak(text);
    }
    
    /**
     * Annonce la fin d'une partie
     */
    announceGameEnd() {
        const text = this.getLocalizedText('gameEnd');
        this.speak(text);
    }
    
    /**
     * Ouvre le panneau de configuration de la voix
     */
    showVoiceSettingsPanel() {
        // Créer la modal
        const modalContainer = document.createElement('div');
        modalContainer.className = 'voice-settings-modal-container';
        
        modalContainer.innerHTML = `
            <div class="voice-settings-modal">
                <div class="voice-settings-header">
                    <h3>Paramètres de l'annonceur vocal</h3>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="voice-settings-content">
                    <div class="toggle-option">
                        <div class="toggle-label">Annonceur vocal activé</div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="voice-enabled" ${this.enabled ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    
                    <div class="option-group" id="voice-options" ${!this.enabled ? 'style="opacity: 0.5; pointer-events: none;"' : ''}>
                        <div class="radio-option">
                            <div class="radio-label">Langue</div>
                            <div class="radio-buttons">
                                <label>
                                    <input type="radio" name="voice-language" value="fr-FR" ${this.language === 'fr-FR' ? 'checked' : ''}>
                                    Français
                                </label>
                                <label>
                                    <input type="radio" name="voice-language" value="en-US" ${this.language === 'en-US' ? 'checked' : ''}>
                                    English
                                </label>
                            </div>
                        </div>
                        
                        <div class="radio-option">
                            <div class="radio-label">Type de voix</div>
                            <div class="radio-buttons">
                                <label>
                                    <input type="radio" name="voice-gender" value="female" ${this.femaleVoice ? 'checked' : ''}>
                                    Féminine
                                </label>
                                <label>
                                    <input type="radio" name="voice-gender" value="male" ${!this.femaleVoice ? 'checked' : ''}>
                                    Masculine
                                </label>
                            </div>
                        </div>
                        
                        <div class="slider-option">
                            <div class="slider-label">Volume</div>
                            <input type="range" id="voice-volume" min="0" max="1" step="0.1" value="${this.volume}">
                            <div class="slider-value">${Math.round(this.volume * 100)}%</div>
                        </div>
                        
                        <div class="test-buttons">
                            <button id="test-voice-btn" class="primary">Tester la voix</button>
                        </div>
                    </div>
                </div>
                <div class="voice-settings-footer">
                    <button id="save-voice-settings" class="success">Enregistrer</button>
                    <button class="dismiss-btn">Annuler</button>
                </div>
            </div>
        `;
        
        // Ajouter des styles CSS pour la modal
        const styles = document.createElement('style');
        styles.textContent = `
            .voice-settings-modal-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.6);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                animation: fadeIn 0.3s ease-out;
            }
            
            .voice-settings-modal {
                background-color: #2a2a2a;
                border-radius: 10px;
                width: 90%;
                max-width: 500px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
                overflow: hidden;
                animation: slideIn 0.3s ease-out;
                max-height: 90vh;
                overflow-y: auto;
            }
            
            @media (max-width: 768px) {
                .voice-settings-modal {
                    width: 95%;
                    max-width: none;
                }
                
                .radio-buttons {
                    flex-direction: column;
                    align-items: flex-start;
                }
                
                .radio-buttons label {
                    margin-bottom: 8px;
                }
                
                .voice-settings-content {
                    padding: 15px;
                }
                
                .voice-settings-footer {
                    flex-direction: column;
                    gap: 10px;
                }
                
                .voice-settings-footer button {
                    width: 100%;
                }
            }
            
            .voice-settings-header {
                background-color: #0099cc;
                padding: 15px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .voice-settings-header h3 {
                margin: 0;
                color: white;
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
            
            .voice-settings-content {
                padding: 20px;
            }
            
            .toggle-option {
                display: flex;
                align-items: center;
                margin-bottom: 20px;
            }
            
            .toggle-label {
                flex: 1;
                font-weight: bold;
            }
            
            .toggle-switch {
                position: relative;
                display: inline-block;
                width: 48px;
                height: 24px;
            }
            
            .toggle-switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }
            
            .toggle-slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #444;
                border-radius: 24px;
                transition: .4s;
            }
            
            .toggle-slider:before {
                position: absolute;
                content: "";
                height: 18px;
                width: 18px;
                left: 3px;
                bottom: 3px;
                background-color: white;
                border-radius: 50%;
                transition: .4s;
            }
            
            input:checked + .toggle-slider {
                background-color: #0099cc;
            }
            
            input:checked + .toggle-slider:before {
                transform: translateX(24px);
            }
            
            .option-group {
                transition: opacity 0.3s;
            }
            
            .radio-option {
                margin-bottom: 15px;
            }
            
            .radio-label {
                font-weight: bold;
                margin-bottom: 5px;
            }
            
            .radio-buttons {
                display: flex;
                gap: 20px;
            }
            
            .radio-buttons label {
                display: flex;
                align-items: center;
                gap: 5px;
                cursor: pointer;
            }
            
            .slider-option {
                margin-bottom: 15px;
            }
            
            .slider-label {
                font-weight: bold;
                margin-bottom: 5px;
            }
            
            .slider-value {
                text-align: right;
                font-size: 0.9em;
                color: #999;
            }
            
            input[type="range"] {
                width: 100%;
                margin: 5px 0;
            }
            
            .test-buttons {
                margin-top: 15px;
                display: flex;
                justify-content: center;
            }
            
            .test-buttons button {
                padding: 8px 15px;
                border-radius: 4px;
                border: none;
                background-color: #0099cc;
                color: white;
                cursor: pointer;
                transition: background-color 0.3s;
            }
            
            .test-buttons button:hover {
                background-color: #00b3ee;
            }
            
            .voice-settings-footer {
                padding: 15px;
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                border-top: 1px solid #444;
            }
            
            .voice-settings-footer button {
                padding: 8px 15px;
                border-radius: 4px;
                border: none;
                cursor: pointer;
                transition: background-color 0.3s;
            }
            
            .dismiss-btn {
                background-color: #555;
                color: white;
            }
            
            .dismiss-btn:hover {
                background-color: #666;
            }
            
            #save-voice-settings {
                background-color: #4CAF50;
                color: white;
            }
            
            #save-voice-settings:hover {
                background-color: #5cb85c;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideIn {
                from { transform: translateY(-20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        
        // Ajouter la modal et les styles au document
        document.head.appendChild(styles);
        document.body.appendChild(modalContainer);
        
        // Gérer les interactions avec les contrôles
        
        // Activer/désactiver les options de voix
        const voiceEnabled = document.getElementById('voice-enabled');
        const voiceOptions = document.getElementById('voice-options');
        
        voiceEnabled.addEventListener('change', () => {
            voiceOptions.style.opacity = voiceEnabled.checked ? '1' : '0.5';
            voiceOptions.style.pointerEvents = voiceEnabled.checked ? 'auto' : 'none';
        });
        
        // Afficher la valeur du volume
        const volumeSlider = document.getElementById('voice-volume');
        const volumeValue = volumeSlider.nextElementSibling;
        
        volumeSlider.addEventListener('input', () => {
            volumeValue.textContent = `${Math.round(volumeSlider.value * 100)}%`;
        });
        
        // Tester la voix
        document.getElementById('test-voice-btn').addEventListener('click', () => {
            // Créer un objet de voix temporaire pour le test
            const language = document.querySelector('input[name="voice-language"]:checked').value;
            const isFemale = document.querySelector('input[name="voice-gender"]:checked').value === 'female';
            const volume = parseFloat(document.getElementById('voice-volume').value);
            
            // Texte de test
            let testText = '';
            if (language === 'fr-FR') {
                testText = 'Ceci est un test de l\'annonceur vocal pour MS BINGO Pacifique.';
            } else {
                testText = 'This is a voice announcer test for Pacific MS BINGO.';
            }
            
            // Sauvegarder les préférences actuelles
            const tempPrefs = {
                language: this.language,
                femaleVoice: this.femaleVoice,
                volume: this.volume
            };
            
            // Appliquer les nouvelles préférences temporairement
            this.language = language;
            this.femaleVoice = isFemale;
            this.volume = volume;
            
            // Prononcer le texte de test
            this.speak(testText);
            
            // Restaurer les préférences d'origine (mais pas immédiatement pour ne pas interrompre le test)
            setTimeout(() => {
                this.language = tempPrefs.language;
                this.femaleVoice = tempPrefs.femaleVoice;
                this.volume = tempPrefs.volume;
            }, 5000);
        });
        
        // Sauvegarder les paramètres
        document.getElementById('save-voice-settings').addEventListener('click', () => {
            // Récupérer les valeurs
            const enabled = document.getElementById('voice-enabled').checked;
            const language = document.querySelector('input[name="voice-language"]:checked').value;
            const isFemale = document.querySelector('input[name="voice-gender"]:checked').value === 'female';
            const volume = parseFloat(document.getElementById('voice-volume').value);
            
            // Appliquer les paramètres
            this.enabled = enabled;
            this.language = language;
            this.femaleVoice = isFemale;
            this.volume = volume;
            
            // Sauvegarder les préférences
            this.savePreferences();
            
            // Annoncer la sauvegarde si la voix est activée
            if (this.enabled) {
                if (this.language === 'fr-FR') {
                    this.speak('Paramètres de voix sauvegardés');
                } else {
                    this.speak('Voice settings saved');
                }
            }
            
            // Fermer la modal
            modalContainer.remove();
        });
        
        // Gérer la fermeture de la modal
        document.querySelector('.close-btn').addEventListener('click', () => {
            modalContainer.remove();
        });
        
        document.querySelector('.dismiss-btn').addEventListener('click', () => {
            modalContainer.remove();
        });
        
        // Fermer la modal en cliquant en dehors
        modalContainer.addEventListener('click', (e) => {
            if (e.target === modalContainer) {
                modalContainer.remove();
            }
        });
    }
}

// Créer et initialiser l'annonceur vocal quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier que la synthèse vocale est disponible
    if ('speechSynthesis' in window) {
        // Initialiser une fois que les voix sont chargées
        window.speechSynthesis.onvoiceschanged = () => {
            // Créer l'instance uniquement si elle n'existe pas déjà
            if (!window.voiceAnnouncer) {
                window.voiceAnnouncer = new VoiceAnnouncer();
                
                // Exposer une fonction globale pour ouvrir le panneau de configuration
                window.showVoiceSettings = () => {
                    window.voiceAnnouncer.showVoiceSettingsPanel();
                };
            }
        };
        
        // Au cas où l'événement onvoiceschanged est déjà passé
        setTimeout(() => {
            if (!window.voiceAnnouncer && window.speechSynthesis.getVoices().length > 0) {
                window.voiceAnnouncer = new VoiceAnnouncer();
                
                // Exposer une fonction globale pour ouvrir le panneau de configuration
                window.showVoiceSettings = () => {
                    window.voiceAnnouncer.showVoiceSettingsPanel();
                };
            }
        }, 1000);
    }
});