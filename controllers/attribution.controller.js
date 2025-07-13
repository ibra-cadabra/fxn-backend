import { assign, retrieve } from '../services/attribution.service.js';
import Attribution from '../models/attribution.model.js';
import AttributionHistory from "../models/attributionHistory.model.js";
/**
 * ✅ Attribution d'une ressource à un technicien
 * ⚠️ Gère les types : 'material' ou 'consumable' (pas de véhicule ici)
 */
export const assignResource = async (req, res) => {
  console.log('📥 Reçu dans /assign:', req.body); // 👈 Ajoute ceci
  try {
    const result = await assign(req.body); // appelle le service centralisé
    res.status(200).json(result);
  } catch (error) {
    console.error('❌ assignResource:', error.message);
    res.status(400).json({ error: error.message });
  }
};

/**
 * ✅ Reprise d'une ressource d’un technicien
 */
export const retrieveResource = async (req, res) => {
  try {
    const result = await retrieve(req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error('❌ retrieveResource:', error.message);
    res.status(400).json({ error: error.message });
  }
};

/**
 * 📜 Récupérer tout l'historique des attributions (admin uniquement)
 * GET /attributions/history/all
 */
export const getAllAttributionHistory = async (req, res) => {
  try {
    const history = await AttributionHistory.find({}).sort({ date: -1 });
    res.status(200).json(history);
  } catch (error) {
    console.error('❌ getAttributionHistory:', error.message);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
};

/**
 * 🟡 Optionnel : Liste des attributions actives (pour dashboard ou debug)
 */
export const getAllAttributions = async (req, res) => {
  try {
    const data = await Attribution.find().sort({ date: -1 });
    res.json(data);
  } catch (error) {
    console.error('❌ getAllAttributions:', error.message);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
};

/**
 * 🟡 Optionnel : Liste des attributions actives pour un dépôt
 */

export const getHistoryByDepotId = async (req, res) => {
  try {
    const { idDep } = req.params;

    const history = await AttributionHistory.find({ depotId: parseInt(idDep) }).sort({ date: -1 });

    res.json(history);
  } catch (err) {
    console.error('❌ Erreur récupération historique du dépôt :', err);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération de l’historique du dépôt' });
  }
};

export const getGlobalAttributionHistory = async (req, res) => {
  try {
    const history = await AttributionHistory.find().sort({ date: -1 });
    res.json(history);
  } catch (err) {
    console.error('Erreur chargement historique global :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getCurrentAttributionsByDepot = async (req, res) => {
  try {
    const { id } = req.params;

    const attributions = await Attribution.find({
      depotId: Number(id),
      action: 'attribution' // ✅ ne retourne que les attributions actives
    });

    res.status(200).json(attributions);
  } catch (err) {
    console.error('❌ Erreur récupération attributions actives :', err);
    res.status(500).json({ message: 'Erreur récupération attributions actives' });
  }
};