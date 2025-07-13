// ✅ controllers/consumable.controller.js
import Consumable from '../models/consumable.model.js';
import { getNextSequence } from '../utils/getNextSequence.js';
import ResourceMovement from "../models/resourceMovement.model.js";

export async function getAllConsumables(req, res) {
  const consumables = await Consumable.find();
  res.json(consumables);
}
export async function createConsumable(req, res) {
  try {
    const { name, idDep, quantity, createdBy, ...rest } = req.body;

    // 🕵️ Chercher un consommable du même nom dans le même dépôt
    let consumable = await Consumable.findOne({
      name: new RegExp(`^${name}$`, 'i'),
      idDep
    });

    if (consumable) {
      // ✅ Mise à jour de la quantité si existant dans ce dépôt
      console.log('🔄 Consommable existant dans ce dépôt, mise à jour de la quantité');
      consumable.quantity += quantity;
      await consumable.save();

      await ResourceMovement.create({
        resourceType: 'consommable',
        resourceId: consumable._id,
        resourceName: name,
        depotId: idDep,
        movementType: 'modification',
        quantity,
        createdBy,
        comment: 'Ajout à un consommable existant'
      });
      return res.json({ message: 'Quantité mise à jour', consumable });
    } else {
      // 🆕 Création d’un nouveau consommable pour ce dépôt
      const nextId = await getNextSequence('consumable');
      consumable = await Consumable.create({
        idCons: nextId,
        name,
        idDep,
        quantity,
        ...rest
      });

      await ResourceMovement.create({
        resourceType: 'consommable',
        resourceId: consumable._id,
        resourceName: name,
        depotId: idDep,
        movementType: 'ajout',
        quantity,
        createdBy,
        comment: 'Création nouveau consommable'
      });

      return res.status(201).json({ message: 'Nouveau consommable ajouté', consumable });
    }

  } catch (err) {
    console.error('❌ Erreur lors de l’ajout du consommable :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}
export const deleteConsumableByIdCons = async (req, res) => {
  try {
    const deleted = await Consumable.findOneAndDelete({ idCons: req.params.idCons });
    if (!deleted) return res.status(404).json({ message: 'Consommable non trouvé.' });
    res.json({ message: 'Consommable supprimé.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la suppression.' });
  }
};
export const updateConsumableByIdCons = async (req, res) => {
  try {
    const idCons = parseInt(req.params.idCons);
    const updateData = { ...req.body };
    console.log(updateData);
    // ✅ On s’assure d’écraser la quantité si fournie
    if (typeof req.body.quantity === 'number') {
      updateData.quantity = req.body.quantity;
    }
    const updated = await Consumable.findOneAndUpdate(
        { idCons },
        updateData,
        { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Consommable non trouvé.' });
    res.json(updated);
  } catch (err) {
    console.error('Erreur update:', err);
    res.status(500).json({ message: 'Erreur lors de la mise à jour.' });
  }
};
