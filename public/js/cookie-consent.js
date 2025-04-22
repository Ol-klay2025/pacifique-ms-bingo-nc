/**
 * MS BINGO PACIFIQUE - Gestion des consentements de cookies RGPD
 * Ce script gère l'affichage de la bannière de consentement et les préférences utilisateur
 */

class CookieConsent {
  constructor() {
    this.consentKey = 'ms-bingo-cookie-consent';
    this.bannerDisplayed = false;
    this.userConsent = this.getConsentFromCookie();
    this.userId = null;
    
    // Vérifier l'authentification et récupérer les préférences depuis le serveur si possible
    this.checkAuthentication();
  }
  
  /**
   * Vérifie si l'utilisateur est authentifié et récupère ses préférences
   */
  async checkAuthentication() {
    try {
      const userCheck = await fetch('/api/user/check');
      if (userCheck.ok) {
        const userData = await userCheck.json();
        
        if (userData.authenticated) {
          this.userId = userData.id;
          this.getServerPreferences();
        } else {
          // Pas d'utilisateur authentifié, utiliser les préférences locales
          this.initializeBanner();
        }
      } else {
        // Erreur de récupération, utiliser les préférences locales
        this.initializeBanner();
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
      this.initializeBanner();
    }
  }
  
  /**
   * Récupère les préférences de cookies depuis le serveur pour un utilisateur authentifié
   */
  async getServerPreferences() {
    try {
      const response = await fetch('/api/gdpr/cookie-preferences');
      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          this.userConsent = data.preferences;
          this.saveConsentToCookie();
          
          // Si aucune préférence n'est définie, afficher la bannière
          if (!this.hasUserMadeChoice()) {
            this.initializeBanner();
          }
        } else {
          this.initializeBanner();
        }
      } else {
        this.initializeBanner();
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des préférences serveur:', error);
      this.initializeBanner();
    }
  }
  
  /**
   * Récupère les préférences de cookies depuis le stockage local
   */
  getConsentFromCookie() {
    const savedConsent = localStorage.getItem(this.consentKey);
    
    if (savedConsent) {
      try {
        return JSON.parse(savedConsent);
      } catch (e) {
        console.error('Erreur lors du parsing des préférences cookies:', e);
      }
    }
    
    // Valeurs par défaut
    return {
      necessary: true, // Toujours true
      functional: false,
      analytics: false
    };
  }
  
  /**
   * Sauvegarde les préférences de cookies dans le stockage local
   */
  saveConsentToCookie() {
    localStorage.setItem(this.consentKey, JSON.stringify(this.userConsent));
  }
  
  /**
   * Sauvegarde les préférences de cookies sur le serveur pour les utilisateurs authentifiés
   */
  async saveConsentToServer() {
    if (!this.userId) return;
    
    try {
      const response = await fetch('/api/gdpr/cookie-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          functional: this.userConsent.functional,
          analytics: this.userConsent.analytics
        })
      });
      
      if (!response.ok) {
        console.error('Erreur lors de la sauvegarde des préférences sur le serveur');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des préférences sur le serveur:', error);
    }
  }
  
  /**
   * Vérifie si l'utilisateur a déjà fait son choix de cookies
   */
  hasUserMadeChoice() {
    return localStorage.getItem(this.consentKey) !== null;
  }
  
  /**
   * Initialise la bannière de consentement si nécessaire
   */
  initializeBanner() {
    if (this.hasUserMadeChoice()) {
      // L'utilisateur a déjà fait son choix, pas besoin d'afficher la bannière
      this.applyConsent();
      return;
    }
    
    this.showBanner();
  }
  
  /**
   * Affiche la bannière de consentement
   */
  showBanner() {
    if (this.bannerDisplayed) return;
    
    // Créer la bannière
    const banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.className = 'cookie-consent-banner';
    
    banner.innerHTML = `
      <div class="cookie-consent-content">
        <h3>Paramètres de confidentialité</h3>
        <p>Nous utilisons des cookies pour améliorer votre expérience sur notre site. Vous pouvez personnaliser vos préférences ci-dessous.</p>
        
        <div class="cookie-options">
          <div class="cookie-option">
            <label>
              <input type="checkbox" id="cookie-necessary" checked disabled>
              <span class="checkmark"></span>
              <div>
                <strong>Cookies nécessaires</strong>
                <p>Ces cookies sont essentiels au fonctionnement du site et ne peuvent pas être désactivés.</p>
              </div>
            </label>
          </div>
          
          <div class="cookie-option">
            <label>
              <input type="checkbox" id="cookie-functional" ${this.userConsent.functional ? 'checked' : ''}>
              <span class="checkmark"></span>
              <div>
                <strong>Cookies fonctionnels</strong>
                <p>Ces cookies permettent d'améliorer les fonctionnalités et la personnalisation de votre expérience.</p>
              </div>
            </label>
          </div>
          
          <div class="cookie-option">
            <label>
              <input type="checkbox" id="cookie-analytics" ${this.userConsent.analytics ? 'checked' : ''}>
              <span class="checkmark"></span>
              <div>
                <strong>Cookies analytiques</strong>
                <p>Ces cookies nous aident à comprendre comment les visiteurs interagissent avec le site.</p>
              </div>
            </label>
          </div>
        </div>
        
        <div class="cookie-buttons">
          <button id="cookie-accept-all" class="btn btn-primary">Tout accepter</button>
          <button id="cookie-save-preferences" class="btn btn-secondary">Enregistrer mes préférences</button>
          <button id="cookie-reject-all" class="btn btn-outline">Tout refuser sauf nécessaires</button>
        </div>
        
        <div class="cookie-footer">
          <a href="/privacy.html" target="_blank">Politique de confidentialité</a>
        </div>
      </div>
    `;
    
    // Ajouter la bannière au document
    document.body.appendChild(banner);
    
    // Ajouter le CSS de la bannière
    this.addStyles();
    
    // Ajouter les gestionnaires d'événements
    document.getElementById('cookie-accept-all').addEventListener('click', () => this.acceptAll());
    document.getElementById('cookie-save-preferences').addEventListener('click', () => this.savePreferences());
    document.getElementById('cookie-reject-all').addEventListener('click', () => this.rejectAll());
    
    // Marquer la bannière comme affichée
    this.bannerDisplayed = true;
  }
  
  /**
   * Ajoute les styles CSS pour la bannière
   */
  addStyles() {
    if (document.getElementById('cookie-consent-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'cookie-consent-styles';
    
    styles.innerHTML = `
      .cookie-consent-banner {
        position: fixed;
        bottom: 20px;
        left: 20px;
        right: 20px;
        max-width: 500px;
        margin: 0 auto;
        background-color: #fff;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        z-index: 9999;
        padding: 20px;
        font-family: 'Montserrat', Arial, sans-serif;
        max-height: 80vh;
        overflow-y: auto;
      }
      
      .cookie-consent-banner h3 {
        margin-top: 0;
        color: #2c3e50;
        font-size: 1.3rem;
      }
      
      .cookie-consent-banner p {
        color: #5d6778;
        font-size: 0.9rem;
        line-height: 1.5;
      }
      
      .cookie-options {
        margin: 25px 0;
      }
      
      .cookie-option {
        margin-bottom: 15px;
        border: 1px solid #eaeaea;
        padding: 12px;
        border-radius: 8px;
        transition: all 0.3s ease;
      }
      
      .cookie-option:hover {
        border-color: #42b983;
        background-color: rgba(66, 185, 131, 0.05);
      }
      
      .cookie-option label {
        display: flex;
        align-items: flex-start;
        cursor: pointer;
      }
      
      .cookie-option input {
        margin-top: 5px;
        margin-right: 15px;
      }
      
      .cookie-option p {
        margin: 5px 0 0;
        font-size: 0.85rem;
      }
      
      .cookie-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 20px;
      }
      
      .btn {
        padding: 10px 20px;
        font-size: 0.9rem;
        border-radius: 5px;
        cursor: pointer;
        border: none;
        font-weight: 600;
        transition: all 0.3s ease;
      }
      
      .btn-primary {
        background-color: #42b983;
        color: white;
      }
      
      .btn-primary:hover {
        background-color: #3aa876;
      }
      
      .btn-secondary {
        background-color: #3498db;
        color: white;
      }
      
      .btn-secondary:hover {
        background-color: #2980b9;
      }
      
      .btn-outline {
        background-color: transparent;
        border: 1px solid #ddd;
        color: #333;
      }
      
      .btn-outline:hover {
        background-color: #f5f5f5;
      }
      
      .cookie-footer {
        margin-top: 15px;
        font-size: 0.8rem;
        text-align: center;
      }
      
      .cookie-footer a {
        color: #3498db;
        text-decoration: underline;
      }
      
      @media (max-width: 600px) {
        .cookie-consent-banner {
          bottom: 0;
          left: 0;
          right: 0;
          border-radius: 10px 10px 0 0;
          max-width: 100%;
        }
        
        .cookie-buttons {
          flex-direction: column;
        }
        
        .btn {
          width: 100%;
        }
      }
    `;
    
    document.head.appendChild(styles);
  }
  
  /**
   * Accepte tous les cookies
   */
  acceptAll() {
    this.userConsent.functional = true;
    this.userConsent.analytics = true;
    
    this.saveConsent();
    this.hideBanner();
  }
  
  /**
   * Enregistre les préférences de cookies actuelles
   */
  savePreferences() {
    this.userConsent.functional = document.getElementById('cookie-functional').checked;
    this.userConsent.analytics = document.getElementById('cookie-analytics').checked;
    
    this.saveConsent();
    this.hideBanner();
  }
  
  /**
   * Rejette tous les cookies sauf ceux nécessaires
   */
  rejectAll() {
    this.userConsent.functional = false;
    this.userConsent.analytics = false;
    
    this.saveConsent();
    this.hideBanner();
  }
  
  /**
   * Enregistre les préférences de cookies localement et sur le serveur
   */
  saveConsent() {
    this.saveConsentToCookie();
    this.saveConsentToServer();
    this.applyConsent();
  }
  
  /**
   * Cache la bannière de consentement
   */
  hideBanner() {
    const banner = document.getElementById('cookie-consent-banner');
    if (banner) {
      banner.style.opacity = '0';
      setTimeout(() => {
        banner.remove();
      }, 300);
    }
  }
  
  /**
   * Applique les préférences de cookies actuelles
   */
  applyConsent() {
    // On active ou désactive les scripts analytiques selon les préférences
    if (this.userConsent.analytics) {
      this.enableAnalytics();
    } else {
      this.disableAnalytics();
    }
    
    // On active ou désactive les fonctionnalités supplémentaires selon les préférences
    if (this.userConsent.functional) {
      this.enableFunctional();
    } else {
      this.disableFunctional();
    }
  }
  
  /**
   * Active les cookies analytiques
   */
  enableAnalytics() {
    // Exemple d'activation Google Analytics
    window.enableAnalytics = true;
    
    // Ici, on pourrait charger dynamiquement les scripts d'analytics
    // Pour l'exemple, on simule juste un événement
    if (typeof window.dataLayer !== 'undefined') {
      window.dataLayer.push({
        'event': 'cookie_consent_analytics',
        'analytics_consent': true
      });
    }
  }
  
  /**
   * Désactive les cookies analytiques
   */
  disableAnalytics() {
    window.enableAnalytics = false;
    
    // Ici, on pourrait désactiver les scripts d'analytics
    if (typeof window.dataLayer !== 'undefined') {
      window.dataLayer.push({
        'event': 'cookie_consent_analytics',
        'analytics_consent': false
      });
    }
  }
  
  /**
   * Active les cookies fonctionnels
   */
  enableFunctional() {
    window.enableFunctional = true;
    
    // Activer les fonctionnalités supplémentaires
    document.dispatchEvent(new CustomEvent('functional-cookies-enabled'));
  }
  
  /**
   * Désactive les cookies fonctionnels
   */
  disableFunctional() {
    window.enableFunctional = false;
    
    // Désactiver les fonctionnalités supplémentaires
    document.dispatchEvent(new CustomEvent('functional-cookies-disabled'));
  }
  
  /**
   * Ouvre la bannière de préférences de cookies
   * Cette méthode peut être appelée via un lien dans la politique de confidentialité
   */
  openPreferences() {
    if (this.bannerDisplayed) return;
    
    this.showBanner();
    
    // Mettre à jour les cases à cocher selon les préférences actuelles
    const functionalCheckbox = document.getElementById('cookie-functional');
    const analyticsCheckbox = document.getElementById('cookie-analytics');
    
    if (functionalCheckbox) functionalCheckbox.checked = this.userConsent.functional;
    if (analyticsCheckbox) analyticsCheckbox.checked = this.userConsent.analytics;
  }
}

// Initialiser la gestion du consentement des cookies
const cookieConsent = new CookieConsent();

// Exposer la méthode pour ouvrir les préférences de cookies
window.openCookiePreferences = function() {
  cookieConsent.openPreferences();
};