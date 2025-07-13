// vehicule.controller.js
import Vehicule from '../models/vehicule.model.js';
import { getNextSequence } from '../utils/getNextSequence.js';
import Attribution from "../models/attribution.model.js";

// 📦 GET : Tous les véhicules
export async function getVehicules(req, res) {
  try {
    const vehicules = await Vehicule.find();
    res.json(vehicules);

  } catch (err) {
    console.error('❌ Erreur getVehicules:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des véhicules' });
  }
}

// 🆕 POST : Création d’un véhicule
export async function createVehicule(req, res) {
  try {
    const vehicule = new Vehicule(req.body);
    vehicule.idVeh = await getNextSequence('vehicule');

    await vehicule.save();
    console.log('✅ Véhicule créé:', vehicule);
    res.status(201).json(vehicule);
  } catch (err) {
    console.error('❌ Erreur création véhicule:', err);
    res.status(500).json({ error: 'Erreur lors de la création du véhicule' });
  }
}

// 🗑️ DELETE : Suppression d’un véhicule
export const deleteVehiculeByIdVeh = async (req, res) => {
  try {
    const deleted = await Vehicule.findOneAndDelete({ idVeh: req.params.idVeh });
    if (!deleted) return res.status(404).json({ message: 'Véhicule non trouvé.' });
    res.json({ message: '✅ Véhicule supprimé.' });
  } catch (err) {
    console.error('❌ Erreur suppression véhicule:', err);
    res.status(500).json({ message: 'Erreur lors de la suppression.' });
  }
};

// ✏️ PUT : Mise à jour d’un véhicule
export const updateVehiculeByIdVeh = async (req, res) => {
  try {
    const idVeh = parseInt(req.params.idVeh);
    if (isNaN(idVeh)) return res.status(400).json({ message: '❌ idVeh invalide (NaN).' });

    const updateData = { ...req.body };
    const updated = await Vehicule.findOneAndUpdate({ idVeh }, updateData, { new: true });

    if (!updated) return res.status(404).json({ message: 'Véhicule non trouvé.' });

    res.json(updated);
  } catch (err) {
    console.error('❌ Erreur update véhicule:', err);
    res.status(500).json({ message: 'Erreur lors de la mise à jour.' });
  }
};

// 🔄 POST : Attribution ou reprise d’un véhicule
export const assignVehicule = async (req, res) => {
  try {
    const { _id, idTec, idDep, createdBy, ...rest } = req.body;

    if (!_id) {
      return res.status(400).json({ message: '❌ _id du véhicule manquant.' });
    }

    const vehicule = await Vehicule.findById(_id);
    if (!vehicule) return res.status(404).json({ message: 'Véhicule non trouvé' });

    // 📝 Historique
    await new Attribution({
      resourceType: 'vehicule',
      resourceId: _id,
      depotId: idDep ?? vehicule.idDep,
      technicianId: idTec ?? null,
      createdBy,
      date: new Date(),
      action: idTec ? 'attribution' : 'reprise',
      ...rest
    }).save();

    // 🛠 Mise à jour
    vehicule.idTec = idTec ?? null;
    vehicule.idDep = idTec ? null : idDep ?? vehicule.idDep;
    await vehicule.save();

    res.status(200).json({ message: '✅ Attribution mise à jour', vehicule });
  } catch (err) {
    console.error('❌ Erreur assignation véhicule:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// 🔍 Vérifie si la plaque existe
export async function checkRegistrationPlateExists(req, res) {
  try {
    const plate = req.params.registrationPlate.toUpperCase();
    const exists = await Vehicule.exists({ registrationPlate: plate });
    res.json({ exists: !!exists });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}
