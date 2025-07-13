// attribution.service.js
import mongoose from 'mongoose';
import Material from '../models/material.model.js';
import Vehicule from '../models/vehicule.model.js';
import Consumable from '../models/consumable.model.js';
import Attribution from '../models/attribution.model.js';
import AttributionHistory from '../models/attributionHistory.model.js';
import { getNextSequence } from '../utils/getNextSequence.js';

// Liste des types autorisés
const VALID_TYPES = ['materiel', 'consommable', 'vehicule'];

/**
 * Retourne le modèle Mongoose en fonction du type de ressource.
 */
const getModel = (type) => {
  if (type === 'materiel') return Material;
  if (type === 'consommable') return Consumable;
  if (type === 'vehicule') return Vehicule;
  throw new Error('Type de ressource invalide');
};

/**
 * Traite l’attribution ou la reprise d’une ressource avec transaction.
 */
const processAttribution = async (payload, action) => {
  const {
    resourceType,
    resourceId,
    depotId,
    technicianId,
    quantity,
    createdBy,
    comment = ''
  } = payload;

  // Validation basique
  if (!VALID_TYPES.includes(resourceType)) {
    throw new Error('Type de ressource invalide');
  }
  if (!resourceId || !depotId || !technicianId || typeof quantity !== 'number') {
    throw new Error('Champs requis manquants ou invalides');
  }

  const Model = getModel(resourceType);
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 🔍 Recherche de la ressource dans le stock du dépôt
    const resource = await Model.findOne({ _id: resourceId, idDep: depotId }).session(session);
    if (!resource) throw new Error('Ressource non trouvée dans le dépôt');

    // ➕ ou ➖ Mise à jour du stock
    if (action === 'attribution') {
      if (resource.quantity < quantity) {
        throw new Error(`Quantité insuffisante. Stock disponible : ${resource.quantity}`);
      }
      resource.quantity -= quantity;
    } else if (action === 'reprise') {
      resource.quantity += quantity;
    }
    await resource.save({ session });

    // 🔁 Mise à jour de l’attribution active
    const existingAttr = await Attribution.findOne({
      resourceType,
      resourceId,
      technicianId,
      depotId,
      createdBy,
      comment
    }).session(session);

    if (action === 'attribution') {
      if (existingAttr) {
        existingAttr.assignedQuantity += quantity;
        existingAttr.comment = comment;
        await existingAttr.save({ session });
      } else {
        const nextId = await getNextSequence('attribution');
        const newAttr = new Attribution({
          idAttri: nextId,
          resourceType,
          resourceId,
          technicianId,
          depotId,
          createdBy: createdBy,
          assignedQuantity: quantity,
          action: 'attribution',
          comment
        });
        await newAttr.save({ session });
      }
    } else if (action === 'reprise') {
      if (existingAttr) {
        existingAttr.assignedQuantity -= quantity;
        existingAttr.comment = comment;
        if (existingAttr.assignedQuantity <= 0) {
          await existingAttr.deleteOne({ session });
        } else {
          await existingAttr.save({ session });
        }
      }
    }

    // 🕒 Historique complet
    const history = new AttributionHistory({
      resourceType,
      resourceId,
      technicianId,
      quantity,
      depotId,
      createdBy,
      action,
      comment,
      date: new Date()
    });
    await history.save({ session });

    // ✅ Commit & fin de session
    await session.commitTransaction();
    await session.endSession();

    console.log(`✅ ${action} réussie : ${resourceType} [${resourceId}] x${quantity} → tech ${technicianId}`);
    return { success: true };

  } catch (err) {
    await session.abortTransaction();
    await session.endSession();
    console.error('❌ Échec transaction attribution :', err.message);
    throw new Error(err.message);
  }
};

/**
 * Attribution d’une ressource
 */
export const assign = (payload) => processAttribution(payload, 'attribution');

/**
 * Reprise d’une ressource
 */
export const retrieve = (payload) => processAttribution(payload, 'reprise');

/**
 * Récupère l’historique d’attributions pour un dépôt
 */
export const getHistory = async (depotId) => {
  depotId = Number(depotId);
  if (isNaN(depotId)) throw new Error('ID dépôt invalide');

  return AttributionHistory.find({ depotId }).sort({ date: -1 });
};
