/**
 * Service d'API pour MS BINGO PACIFIQUE
 * Gère les appels aux endpoints de l'API conformité
 */

const API_BASE_URL = '/api';

/**
 * Classe pour gérer les appels à l'API de conformité
 */
class ComplianceApiService {
  /**
   * Effectue une requête à l'API
   * @param {string} endpoint - Endpoint de l'API
   * @param {Object} options - Options de la requête
   * @returns {Promise<any>} Données retournées par l'API
   */
  async fetchApi(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    const fetchOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };
    
    try {
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        // Gestion des erreurs API
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Erreur API (${endpoint}):`, error);
      throw error;
    }
  }
  
  // ---- API AML ----
  
  /**
   * Récupère les alertes AML
   * @param {Object} params - Paramètres de filtrage et pagination
   * @returns {Promise<Object>} Données des alertes AML
   */
  async getAmlAlerts(params = {}) {
    let queryParams = new URLSearchParams();
    
    if (params.status) queryParams.append('status', params.status);
    if (params.riskLevel) queryParams.append('riskLevel', params.riskLevel);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.fetchApi(`/aml/alerts${queryString}`);
  }
  
  /**
   * Récupère les détails d'une alerte AML
   * @param {string} alertId - Identifiant de l'alerte
   * @returns {Promise<Object>} Détails de l'alerte
   */
  async getAmlAlertDetails(alertId) {
    return this.fetchApi(`/aml/alert/${alertId}`);
  }
  
  /**
   * Met à jour le statut d'une alerte AML
   * @param {string} alertId - Identifiant de l'alerte
   * @param {string} status - Nouveau statut
   * @param {string} comment - Commentaire optionnel
   * @returns {Promise<Object>} Résultat de la mise à jour
   */
  async updateAmlAlertStatus(alertId, status, comment = '') {
    return this.fetchApi(`/aml/alert/${alertId}/update`, {
      method: 'POST',
      body: JSON.stringify({ status, comment }),
    });
  }
  
  /**
   * Signale une activité suspecte
   * @param {Object} reportData - Données du signalement
   * @returns {Promise<Object>} Résultat du signalement
   */
  async reportSuspiciousActivity(reportData) {
    return this.fetchApi('/aml/report-suspicious', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }
  
  // ---- API KYC ----
  
  /**
   * Récupère le statut KYC détaillé d'un utilisateur
   * @param {number} userId - ID de l'utilisateur
   * @returns {Promise<Object>} Statut KYC détaillé
   */
  async getKycStatus(userId) {
    return this.fetchApi(`/kyc/status/${userId}/admin`);
  }
  
  /**
   * Vérifie un document soumis
   * @param {string} documentId - ID du document
   * @param {boolean} isApproved - Approbation ou rejet
   * @param {string} comment - Commentaire de vérification
   * @returns {Promise<Object>} Résultat de la vérification
   */
  async verifyDocument(documentId, isApproved, comment = '') {
    return this.fetchApi(`/kyc/verify-document/${documentId}`, {
      method: 'POST',
      body: JSON.stringify({
        approved: isApproved,
        comment,
      }),
    });
  }
  
  // ---- API GDPR ----
  
  /**
   * Exporte les données d'un utilisateur (GDPR)
   * @param {Object} exportParams - Paramètres d'export
   * @returns {Promise<Object>} Résultat de l'export
   */
  async exportUserData(exportParams) {
    return this.fetchApi('/gdpr/export', {
      method: 'POST',
      body: JSON.stringify(exportParams),
    });
  }
}

// Export d'une instance unique du service
const apiService = new ComplianceApiService();
export default apiService;