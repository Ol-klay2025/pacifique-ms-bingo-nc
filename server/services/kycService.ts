import { promises as fs } from 'fs';
import path from 'path';
import multer from 'multer';
import sharp from 'sharp';
import Jimp from 'jimp';
import jsQR from 'jsqr';
import { db } from '../db';
import * as schema from '@shared/schema';
import { eq } from 'drizzle-orm';

// Configurer le dossier de stockage pour les documents KYC
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'kyc');

// S'assurer que le dossier existe
(async () => {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    console.log(`Dossier KYC créé: ${UPLOAD_DIR}`);
  } catch (err) {
    console.error('Erreur lors de la création du dossier KYC:', err);
  }
})();

// Configuration du stockage pour multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const userId = (req.user as any)?.id || 'unknown';
    const documentType = req.body.documentType || 'document';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${userId}-${documentType}-${uniqueSuffix}${ext}`);
  }
});

// Configuration de multer avec validation de fichier
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    // Accepter uniquement les images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont acceptées'));
    }
  }
});

/**
 * Crée une nouvelle demande de vérification KYC
 */
export async function createKycVerification(userId: number) {
  try {
    // Vérifier si l'utilisateur a déjà une demande en cours
    const existingVerification = await db.query.kycVerifications.findFirst({
      where: eq(schema.kycVerifications.userId, userId),
      orderBy: [{ createdAt: 'desc' }]
    });

    // Si demande en cours et pas rejetée, retourner l'existante
    if (existingVerification && existingVerification.status !== 'rejected') {
      return existingVerification;
    }

    // Créer une nouvelle demande
    const [verification] = await db.insert(schema.kycVerifications)
      .values({
        userId,
        status: 'pending',
        verificationLevel: 'basic',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    // Enregistrer cette action dans les logs
    await db.insert(schema.kycLogs).values({
      kycVerificationId: verification.id,
      action: 'verification_request',
      details: { message: 'Nouvelle demande de vérification KYC créée' },
      performedBy: userId,
      createdAt: new Date()
    });

    return verification;
  } catch (error) {
    console.error('Erreur lors de la création de la vérification KYC:', error);
    throw error;
  }
}

/**
 * Enregistre un document KYC
 */
export async function addKycDocument(
  kycVerificationId: number,
  documentType: string,
  documentPath: string,
  documentInfo: {
    documentNumber?: string;
    documentCountry?: string;
    documentExpiryDate?: Date;
  }
) {
  try {
    const [document] = await db.insert(schema.kycDocuments)
      .values({
        kycVerificationId,
        documentType,
        documentPath,
        documentNumber: documentInfo.documentNumber,
        documentCountry: documentInfo.documentCountry,
        documentExpiryDate: documentInfo.documentExpiryDate,
        verificationStatus: 'pending',
        createdAt: new Date()
      })
      .returning();

    // Mettre à jour le statut de la vérification
    await db.update(schema.kycVerifications)
      .set({ 
        status: 'pending',
        updatedAt: new Date()
      })
      .where(eq(schema.kycVerifications.id, kycVerificationId));

    // Enregistrer cette action dans les logs
    const verification = await db.query.kycVerifications.findFirst({
      where: eq(schema.kycVerifications.id, kycVerificationId)
    });

    if (verification) {
      await db.insert(schema.kycLogs).values({
        kycVerificationId,
        action: 'document_upload',
        details: { documentType, documentId: document.id },
        performedBy: verification.userId,
        createdAt: new Date()
      });
    }

    return document;
  } catch (error) {
    console.error('Erreur lors de l\'ajout du document KYC:', error);
    throw error;
  }
}

/**
 * Traite une image pour la vérification (redimensionnement, amélioration)
 */
export async function processImage(filePath: string) {
  try {
    // Redimensionner et optimiser l'image
    const outputPath = filePath.replace(/\.[^/.]+$/, '_processed.jpg');
    
    await sharp(filePath)
      .resize(1000, 1000, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toFile(outputPath);
    
    return outputPath;
  } catch (error) {
    console.error('Erreur lors du traitement de l\'image:', error);
    throw error;
  }
}

/**
 * Analyse un document pour extraire des informations (codes QR, texte, etc.)
 */
export async function analyzeDocument(filePath: string) {
  try {
    const results: any = { qrCodes: [] };
    
    // Lire l'image avec Jimp pour la détection QR
    const image = await Jimp.read(filePath);
    const { width, height } = image.bitmap;
    
    // Obtenir les données brutes de l'image pour jsQR
    const imageData = new Uint8ClampedArray(width * height * 4);
    
    let pos = 0;
    image.scan(0, 0, width, height, function(x, y, idx) {
      imageData[pos++] = this.bitmap.data[idx + 0]; // R
      imageData[pos++] = this.bitmap.data[idx + 1]; // G
      imageData[pos++] = this.bitmap.data[idx + 2]; // B
      imageData[pos++] = this.bitmap.data[idx + 3]; // A
    });
    
    // Détecter les codes QR
    const qrCode = jsQR(imageData, width, height);
    if (qrCode) {
      results.qrCodes.push({
        data: qrCode.data,
        location: qrCode.location
      });
    }
    
    return results;
  } catch (error) {
    console.error('Erreur lors de l\'analyse du document:', error);
    return { error: 'Erreur lors de l\'analyse du document' };
  }
}

/**
 * Met à jour le statut d'une vérification KYC
 */
export async function updateVerificationStatus(
  kycVerificationId: number,
  status: 'pending' | 'approved' | 'rejected',
  reviewInfo: {
    reviewedBy?: number;
    rejectionReason?: string;
  } = {}
) {
  try {
    await db.update(schema.kycVerifications)
      .set({
        status,
        rejectionReason: reviewInfo.rejectionReason,
        reviewedBy: reviewInfo.reviewedBy,
        reviewedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(schema.kycVerifications.id, kycVerificationId));

    // Enregistrer cette action dans les logs
    await db.insert(schema.kycLogs).values({
      kycVerificationId,
      action: 'status_change',
      details: { 
        previousStatus: 'pending', 
        newStatus: status,
        rejectionReason: reviewInfo.rejectionReason
      },
      performedBy: reviewInfo.reviewedBy,
      createdAt: new Date()
    });

    return await db.query.kycVerifications.findFirst({
      where: eq(schema.kycVerifications.id, kycVerificationId)
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut KYC:', error);
    throw error;
  }
}

/**
 * Récupère l'état de vérification KYC d'un utilisateur
 */
export async function getUserKycStatus(userId: number) {
  try {
    const verification = await db.query.kycVerifications.findFirst({
      where: eq(schema.kycVerifications.userId, userId),
      orderBy: [{ createdAt: 'desc' }]
    });

    if (!verification) {
      return {
        status: 'not_started',
        message: 'Vérification KYC non commencée'
      };
    }

    const documents = await db.query.kycDocuments.findMany({
      where: eq(schema.kycDocuments.kycVerificationId, verification.id)
    });

    return {
      verification,
      documents,
      status: verification.status,
      message: getStatusMessage(verification.status, verification.rejectionReason)
    };
  } catch (error) {
    console.error('Erreur lors de la récupération du statut KYC:', error);
    throw error;
  }
}

/**
 * Obtient un message explicatif pour le statut KYC
 */
function getStatusMessage(status: string, rejectionReason?: string | null) {
  switch (status) {
    case 'pending':
      return 'Votre vérification est en cours d\'examen. Nous vous informerons lorsqu\'elle sera terminée.';
    case 'approved':
      return 'Votre identité a été vérifiée avec succès.';
    case 'rejected':
      return `Votre vérification a été rejetée. Raison: ${rejectionReason || 'Non spécifiée'}`;
    default:
      return 'Statut inconnu';
  }
}