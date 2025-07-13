// depot.controller.js
import Depot from '../models/depot.model.js';
import Material from '../models/material.model.js';
import Vehicule from '../models/vehicule.model.js';
import Consumable from '../models/consumable.model.js';
import User from '../models/user.model.js';
import { getNextSequence } from '../utils/getNextSequence.js';
import Attribution from "../models/attribution.model.js";

export const getAllDepots = async (req, res) => {
  try {
    const depots = await Depot.find();
    res.json(depots);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des dépôts' });
  }
};

export const getDepotById = async (req, res) => {
  try {
    const depot = await Depot.findOne({ idDep: req.params.idDep });
    if (!depot) {
      return res.status(404).json({ error: 'Dépôt non trouvé' });
    }
    res.json(depot);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur lors de la récupération du dépôt' });
  }
};

export const createDepot = async (req, res) => {
  try {
    const nextId = await getNextSequence('depot');
    const newDepot = new Depot({ ...req.body, idDep: nextId });

    await newDepot.save();
    res.status(201).json(newDepot);
  } catch (error) {
    res.status(400).json({ error: 'Création impossible', details: error.message });
  }
};

export const updateDepotById = async (req, res) => {
  try {
    const updatedDepot = await Depot.findOneAndUpdate(
        { idDep: parseInt(req.params.idDep) },
        req.body,
        { new: true, runValidators: true }
    );

    if (!updatedDepot) {
      return res.status(404).json({ error: 'Dépôt non trouvé' });
    }

    res.json(updatedDepot);
  } catch (error) {
    res.status(400).json({ error: 'Mise à jour impossible', details: error.message });
  }
};

export const deleteDepot = async (req, res) => {
  try {
    const deleted = await Depot.findOneAndDelete({ idDep: parseInt(req.params.idDep) });
    if (!deleted) {
      return res.status(404).json({ error: 'Dépôt non trouvé' });
    }
    res.json({ message: '✅ Dépôt supprimé avec succès' });
  } catch (error) {
    res.status(400).json({ error: '❌ Suppression impossible', details: error.message });
  }
};

export const getDepotResources = async (req, res) => {
  try {
    const depotId = parseInt(req.params.idDep);
    //console.log('📥 idDep reçu :', req.params.idDep);

    if (isNaN(depotId)) {
      return res.status(400).json({ error: 'idDep invalide' });
    }

    // 🔍 Techniciens du dépôt
    const technicians = await User.find({ idDep: depotId, role: 'technicien' });
    //console.log('technicians legnth: ' + technicians);
    const techIds = technicians.map(t => t.idUser);

    // 🚗 Véhicules liés au dépôt (directement ou via un technicien du dépôt)
    const vehicules = await Vehicule.find({
      $or: [
        { idDep: depotId },
        { idTec: { $in: techIds } }
      ]
    });

    // 📦 Matériel, consommables et historique d’attributions
    const [materials, consumables, attributions] = await Promise.all([
      Material.find({ idDep: depotId }),
      Consumable.find({ idDep: depotId }),
      Attribution.find({ idDep: depotId })
    ]);

    // ✅ Réponse complète
    res.json({
      materials,
      consumables,
      technicians,
      vehicules,
      attributions
    });

  } catch (error) {
    console.error('❌ Erreur getDepotResources:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des ressources', details: error.message });
  }
};
export const assignGerantToDepot = async (req, res) => {
  const { idDep, idUser } = req.body;

  try {
    const user = await User.findOne({ idUser });
    const depot = await Depot.findOne({ idDep });

    if (!user || !depot) return res.status(404).json({ message: 'Gérant ou dépôt introuvable' });
    if (user.role !== 'gerant') return res.status(400).json({ message: 'Ce n\'est pas un gérant' });

    // ✅ Vérifie s’il y a déjà un gérant pour ce dépôt
    const existingGerant = await User.findOne({ idDep, role: 'gerant' });
    if (existingGerant) return res.status(409).json({ message: 'Ce dépôt est déjà attribué à un autre gérant' });

    user.idDep = idDep;
    await user.save();

    res.status(200).json({ message: '✅ Gérant assigné au dépôt', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
export const removeGerantFromDepot = async (req, res) => {
  const { idUser } = req.params;

  try {
    const user = await User.findOne({ idUser: parseInt(idUser) });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    if (user.role !== 'gerant') {
      return res.status(400).json({ message: 'Cet utilisateur n’est pas un gérant' });
    }

    if (!user.idDep) {
      return res.status(400).json({ message: 'Ce gérant n’est assigné à aucun dépôt' });
    }

    user.idDep = null;
    await user.save();

    res.status(200).json({ message: '✅ Gérant retiré du dépôt', user });
  } catch (err) {
    console.error('❌ Erreur suppression gérant du dépôt :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
