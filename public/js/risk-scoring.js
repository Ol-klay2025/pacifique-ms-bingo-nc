/**
 * MS BINGO - Système de scoring de risque pour KYC
 * Ce module fournit des fonctions pour évaluer le niveau de risque des documents soumis
 */

/**
 * Calcule un score de risque pour un document d'identité
 * @param {Object} document - Données du document
 * @return {Object} Score de risque et facteurs contributifs
 */
function calculateRiskScore(document) {
    // Facteurs de risque avec leurs poids
    const riskFactors = {
        // Facteurs liés au document
        documentQuality: { weight: 15, score: 0 },    // Qualité d'image faible
        expirationStatus: { weight: 20, score: 0 },   // Document expiré
        dataConsistency: { weight: 25, score: 0 },    // Incohérences entre les données
        manipulationMarks: { weight: 30, score: 0 },  // Signes de manipulation
        
        // Facteurs liés à l'utilisateur
        geolocationRisk: { weight: 15, score: 0 },    // Localisation à haut risque
        behavioralPatterns: { weight: 15, score: 0 }, // Comportements suspects
        duplicateData: { weight: 25, score: 0 },      // Duplication avec d'autres comptes
        
        // Facteurs liés au traitement
        previousRejections: { weight: 10, score: 0 }, // Rejets antérieurs
        verificationAttempts: { weight: 10, score: 0 } // Nombre de tentatives
    };
    
    // Évaluation de chaque facteur
    assessDocumentQuality(document, riskFactors.documentQuality);
    assessExpirationStatus(document, riskFactors.expirationStatus);
    assessDataConsistency(document, riskFactors.dataConsistency);
    assessManipulationMarks(document, riskFactors.manipulationMarks);
    
    assessGeolocationRisk(document, riskFactors.geolocationRisk);
    assessBehavioralPatterns(document, riskFactors.behavioralPatterns);
    assessDuplicateData(document, riskFactors.duplicateData);
    
    assessPreviousRejections(document, riskFactors.previousRejections);
    assessVerificationAttempts(document, riskFactors.verificationAttempts);
    
    // Calcul du score final (normalisé entre 0 et 1)
    let totalWeight = 0;
    let weightedScore = 0;
    
    for (const factor in riskFactors) {
        totalWeight += riskFactors[factor].weight;
        weightedScore += riskFactors[factor].weight * riskFactors[factor].score;
    }
    
    const finalScore = weightedScore / totalWeight;
    
    // Détermination du niveau de risque
    let riskLevel = 'low';
    if (finalScore >= 0.7) {
        riskLevel = 'high';
    } else if (finalScore >= 0.4) {
        riskLevel = 'medium';
    }
    
    // Identification des facteurs principaux de risque
    const keyRiskFactors = [];
    for (const factor in riskFactors) {
        if (riskFactors[factor].score >= 0.7) {
            keyRiskFactors.push({
                name: factor,
                score: riskFactors[factor].score,
                message: riskFactors[factor].message || getDefaultMessageForFactor(factor)
            });
        }
    }
    
    // Tri des facteurs par importance (score * poids)
    keyRiskFactors.sort((a, b) => {
        const aImportance = a.score * riskFactors[a.name].weight;
        const bImportance = b.score * riskFactors[b.name].weight;
        return bImportance - aImportance;
    });
    
    return {
        score: finalScore,
        level: riskLevel,
        keyFactors: keyRiskFactors,
        allFactors: riskFactors
    };
}

/**
 * Évalue la qualité de l'image du document
 */
function assessDocumentQuality(document, factor) {
    if (!document.imageQuality) return;
    
    // La qualité d'image est notée de 0 à 100
    const quality = document.imageQuality;
    
    if (quality < 30) {
        factor.score = 1.0;  // Très mauvaise qualité (100% de risque)
        factor.message = "Image de très mauvaise qualité, illisible";
    } else if (quality < 50) {
        factor.score = 0.8;  // Mauvaise qualité
        factor.message = "Image de qualité insuffisante, détails difficiles à distinguer";
    } else if (quality < 70) {
        factor.score = 0.5;  // Qualité moyenne
        factor.message = "Image de qualité moyenne, certains détails peu clairs";
    } else if (quality < 85) {
        factor.score = 0.2;  // Bonne qualité 
        factor.message = "Image de qualité acceptable, légères imperfections";
    } else {
        factor.score = 0;    // Excellente qualité
    }
}

/**
 * Vérifie si le document est expiré ou proche de l'expiration
 */
function assessExpirationStatus(document, factor) {
    if (!document.expirationDate) return;
    
    const expirationDate = new Date(document.expirationDate);
    const today = new Date();
    
    // Calculer la différence en jours
    const daysDifference = Math.floor((expirationDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysDifference < 0) {
        factor.score = 1.0;  // Document expiré
        factor.message = "Document expiré depuis " + Math.abs(daysDifference) + " jours";
    } else if (daysDifference < 30) {
        factor.score = 0.7;  // Expire dans moins d'un mois
        factor.message = "Document expire très prochainement (" + daysDifference + " jours)";
    } else if (daysDifference < 90) {
        factor.score = 0.3;  // Expire dans moins de 3 mois
        factor.message = "Document expire bientôt (" + daysDifference + " jours)";
    } else {
        factor.score = 0;    // Date d'expiration valide
    }
}

/**
 * Vérifie la cohérence entre les données du document et du compte
 */
function assessDataConsistency(document, factor) {
    let inconsistencies = [];
    
    if (document.name && document.accountName && !isNameMatch(document.name, document.accountName)) {
        inconsistencies.push("Le nom sur le document ne correspond pas au nom du compte");
    }
    
    if (document.dateOfBirth && document.accountDateOfBirth && !isDateMatch(document.dateOfBirth, document.accountDateOfBirth)) {
        inconsistencies.push("La date de naissance ne correspond pas à celle du compte");
    }
    
    if (document.nationality && document.accountNationality && document.nationality !== document.accountNationality) {
        inconsistencies.push("La nationalité ne correspond pas à celle du compte");
    }
    
    if (document.address && document.accountAddress && !isAddressMatch(document.address, document.accountAddress)) {
        inconsistencies.push("L'adresse ne correspond pas à celle du compte");
    }
    
    // Déterminer le score en fonction du nombre d'incohérences
    switch (inconsistencies.length) {
        case 0:
            factor.score = 0;
            break;
        case 1:
            factor.score = 0.5;
            factor.message = inconsistencies[0];
            break;
        case 2:
            factor.score = 0.8;
            factor.message = "Multiples incohérences de données détectées";
            break;
        default:
            factor.score = 1.0;
            factor.message = "Incohérences majeures entre le document et les données du compte";
    }
}

/**
 * Recherche des signes de manipulation d'image
 */
function assessManipulationMarks(document, factor) {
    if (!document.manipulationChecks) return;
    
    const checks = document.manipulationChecks;
    const suspiciousMarks = [];
    
    if (checks.editingDetected) {
        suspiciousMarks.push("Signes d'édition numérique détectés");
    }
    
    if (checks.inconsistentBackground) {
        suspiciousMarks.push("Arrière-plan inconsistant sur le document");
    }
    
    if (checks.fontInconsistency) {
        suspiciousMarks.push("Incohérences de police ou de texte détectées");
    }
    
    if (checks.photoReplacement) {
        suspiciousMarks.push("Possible remplacement de photo détecté");
    }
    
    if (checks.digitallyGenerated) {
        suspiciousMarks.push("Document potentiellement généré numériquement");
    }
    
    // Score basé sur le nombre et la gravité des problèmes
    if (suspiciousMarks.length >= 3 || checks.photoReplacement || checks.digitallyGenerated) {
        factor.score = 1.0;
        factor.message = "Signes forts de manipulation du document";
    } else if (suspiciousMarks.length >= 1) {
        factor.score = 0.7;
        factor.message = suspiciousMarks[0];
    } else {
        factor.score = 0;
    }
}

/**
 * Évalue le risque lié à la géolocalisation de l'utilisateur
 */
function assessGeolocationRisk(document, factor) {
    if (!document.geoData) return;
    
    // Pays à haut risque (exemple simplifié)
    const highRiskCountries = [
        "pays1", "pays2", "pays3"
    ];
    
    // IP VPN/Proxy détectée
    if (document.geoData.isProxy || document.geoData.isVPN) {
        factor.score = 0.8;
        factor.message = "Utilisation détectée d'un VPN ou proxy";
        return;
    }
    
    // Pays d'origine à haut risque
    if (highRiskCountries.includes(document.geoData.country)) {
        factor.score = 0.7;
        factor.message = "Connexion depuis un pays à surveillance renforcée";
        return;
    }
    
    // Incohérence entre pays de connexion et nationalité du document
    if (document.nationality && document.geoData.country && 
        document.nationality !== document.geoData.country) {
        factor.score = 0.4;
        factor.message = "Pays de connexion différent de la nationalité du document";
        return;
    }
    
    factor.score = 0;
}

/**
 * Analyse les comportements suspects de l'utilisateur
 */
function assessBehavioralPatterns(document, factor) {
    if (!document.userBehavior) return;
    
    const behavior = document.userBehavior;
    let riskScore = 0;
    let riskMessage = "";
    
    // Multiples tentatives en peu de temps
    if (behavior.rapidAttempts && behavior.rapidAttempts > 3) {
        riskScore += 0.3;
        riskMessage = "Multiples tentatives rapides de soumission de documents";
    }
    
    // Changements fréquents de données personnelles
    if (behavior.frequentChanges && behavior.frequentChanges > 2) {
        riskScore += 0.3;
        if (riskMessage) riskMessage += " et changements fréquents d'informations";
        else riskMessage = "Changements fréquents d'informations personnelles";
    }
    
    // Activité inhabituelle sur le compte
    if (behavior.unusualActivity) {
        riskScore += 0.4;
        if (riskMessage) riskMessage += " avec activité inhabituelle détectée";
        else riskMessage = "Activité inhabituelle détectée sur le compte";
    }
    
    factor.score = Math.min(riskScore, 1.0);
    if (riskMessage) factor.message = riskMessage;
}

/**
 * Vérifie les duplications potentielles avec d'autres comptes
 */
function assessDuplicateData(document, factor) {
    if (!document.duplicateChecks) return;
    
    const checks = document.duplicateChecks;
    
    if (checks.identicalDocument) {
        factor.score = 1.0;
        factor.message = "Document identique déjà utilisé sur un autre compte";
        return;
    }
    
    if (checks.similarDocumentHighConfidence) {
        factor.score = 0.9;
        factor.message = "Document très similaire détecté sur un autre compte";
        return;
    }
    
    if (checks.similarDocumentMediumConfidence) {
        factor.score = 0.6;
        factor.message = "Similarités détectées avec un document existant";
        return;
    }
    
    if (checks.samePersonDifferentID) {
        factor.score = 0.8;
        factor.message = "Même personne utilisant des documents différents";
        return;
    }
    
    factor.score = 0;
}

/**
 * Vérifie les rejets antérieurs du document ou de l'utilisateur
 */
function assessPreviousRejections(document, factor) {
    if (!document.verificationHistory) return;
    
    const history = document.verificationHistory;
    const totalRejections = history.documentRejections || 0;
    
    if (totalRejections >= 3) {
        factor.score = 1.0;
        factor.message = "Document rejeté à plusieurs reprises (3+ fois)";
    } else if (totalRejections === 2) {
        factor.score = 0.7;
        factor.message = "Document rejeté deux fois précédemment";
    } else if (totalRejections === 1) {
        factor.score = 0.4;
        factor.message = "Document rejeté une fois précédemment";
    } else {
        factor.score = 0;
    }
}

/**
 * Évalue le nombre de tentatives de vérification
 */
function assessVerificationAttempts(document, factor) {
    if (!document.verificationHistory) return;
    
    const history = document.verificationHistory;
    const totalAttempts = history.totalAttempts || 0;
    
    if (totalAttempts >= 5) {
        factor.score = 0.9;
        factor.message = "Nombreuses tentatives de vérification (5+)";
    } else if (totalAttempts >= 3) {
        factor.score = 0.5;
        factor.message = "Plusieurs tentatives de vérification (3+)";
    } else if (totalAttempts === 2) {
        factor.score = 0.2;
    } else {
        factor.score = 0;
    }
}

/**
 * Renvoie un message par défaut pour un facteur de risque
 */
function getDefaultMessageForFactor(factorName) {
    const messages = {
        documentQuality: "Qualité d'image insuffisante",
        expirationStatus: "Problème avec la date d'expiration du document",
        dataConsistency: "Incohérences dans les données du document",
        manipulationMarks: "Signes potentiels de manipulation du document",
        geolocationRisk: "Risque lié à la localisation géographique",
        behavioralPatterns: "Comportement suspect détecté",
        duplicateData: "Duplications potentielles détectées",
        previousRejections: "Rejets antérieurs du document",
        verificationAttempts: "Nombre élevé de tentatives de vérification"
    };
    
    return messages[factorName] || "Facteur de risque détecté";
}

/**
 * Vérifie si deux noms correspondent approximativement
 */
function isNameMatch(name1, name2) {
    // Simplification pour la démo - une implémentation réelle utiliserait
    // des algorithmes plus sophistiqués de correspondance de noms
    const simplify = (name) => name.toLowerCase().trim();
    return simplify(name1) === simplify(name2);
}

/**
 * Vérifie si deux dates correspondent
 */
function isDateMatch(date1, date2) {
    // Convertir en objets Date si ce sont des chaînes
    if (typeof date1 === 'string') date1 = new Date(date1);
    if (typeof date2 === 'string') date2 = new Date(date2);
    
    // Comparer les dates (jour, mois, année)
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
}

/**
 * Vérifie si deux adresses correspondent approximativement
 */
function isAddressMatch(address1, address2) {
    // Simplification pour la démo
    const simplify = (address) => address.toLowerCase().trim()
        .replace(/\s+/g, ' ')
        .replace(/,/g, '');
    
    return simplify(address1) === simplify(address2);
}

/**
 * Fonction utilitaire qui applique l'algorithme de scoring sur un document
 * et met à jour l'interface avec le résultat
 */
function analyzeDocumentRisk(document, displayCallback) {
    // Calcule le score de risque
    const riskAnalysis = calculateRiskScore(document);
    
    // Ajoute une description textuelle du niveau de risque
    let riskDescription = '';
    
    switch (riskAnalysis.level) {
        case 'high':
            riskDescription = 'Ce document présente un risque élevé et nécessite une vérification approfondie.';
            break;
        case 'medium':
            riskDescription = 'Ce document présente un risque modéré et mérite une attention particulière.';
            break;
        case 'low':
            riskDescription = 'Ce document présente un risque faible.';
            break;
    }
    
    // Enrichit l'analyse avec des recommandations
    const recommendations = generateRecommendations(riskAnalysis);
    
    // Combine les résultats
    const result = {
        ...riskAnalysis,
        description: riskDescription,
        recommendations: recommendations
    };
    
    // Si un callback d'affichage est fourni, l'appeler
    if (typeof displayCallback === 'function') {
        displayCallback(result);
    }
    
    return result;
}

/**
 * Génère des recommandations basées sur l'analyse de risque
 */
function generateRecommendations(riskAnalysis) {
    const recommendations = [];
    
    // Recommandations basées sur le niveau de risque global
    if (riskAnalysis.level === 'high') {
        recommendations.push("Effectuer une vérification manuelle approfondie");
        recommendations.push("Demander des documents supplémentaires");
    }
    
    // Recommandations basées sur les facteurs spécifiques
    riskAnalysis.keyFactors.forEach(factor => {
        switch (factor.name) {
            case 'documentQuality':
                recommendations.push("Demander un document de meilleure qualité");
                break;
            case 'expirationStatus':
                recommendations.push("Demander un document à jour ou non expiré");
                break;
            case 'dataConsistency':
                recommendations.push("Vérifier les informations avec une source secondaire");
                break;
            case 'manipulationMarks':
                recommendations.push("Demander l'original du document ou une nouvelle copie certifiée");
                break;
            case 'duplicateData':
                recommendations.push("Vérifier les liens avec les autres comptes similaires");
                break;
        }
    });
    
    // Éliminer les doublons potentiels
    return [...new Set(recommendations)];
}

// Exporter les fonctions pour utilisation dans d'autres fichiers
window.RiskScoring = {
    calculateRiskScore,
    analyzeDocumentRisk
};