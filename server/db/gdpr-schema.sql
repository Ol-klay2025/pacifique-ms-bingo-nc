-- Tables pour la gestion des demandes RGPD

-- Table pour le suivi des demandes de suppression de données (droit à l'oubli)
CREATE TABLE IF NOT EXISTS gdpr_deletion_requests (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    request_date TIMESTAMP NOT NULL DEFAULT NOW(),
    completion_date TIMESTAMP,
    reason TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'rejected'
    admin_notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table pour le suivi des demandes d'exportation de données (droit à la portabilité)
CREATE TABLE IF NOT EXISTS gdpr_export_requests (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    request_date TIMESTAMP NOT NULL DEFAULT NOW(),
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'rejected'
    format VARCHAR(10) DEFAULT 'json', -- 'json', 'csv', 'xml'
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table pour stocker les préférences de cookies des utilisateurs
CREATE TABLE IF NOT EXISTS user_cookie_preferences (
    user_id INT PRIMARY KEY,
    necessary BOOLEAN NOT NULL DEFAULT TRUE, -- Toujours true, car nécessaires au fonctionnement
    functional BOOLEAN NOT NULL DEFAULT FALSE,
    analytics BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Modifier la table users pour ajouter des champs liés à la RGPD
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deletion_date TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gdpr_consent_version VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS gdpr_consent_date TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_privacy_update_notification TIMESTAMP;

-- Modifier la table transactions pour permettre l'anonymisation
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS anonymized BOOLEAN NOT NULL DEFAULT FALSE;

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_gdpr_deletion_user_id ON gdpr_deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_gdpr_export_user_id ON gdpr_export_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_users_is_deleted ON users(is_deleted);
CREATE INDEX IF NOT EXISTS idx_transactions_anonymized ON transactions(anonymized);