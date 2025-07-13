// File: material.controller.js
import Material from '../models/material.model.js';
import {getNextSequence} from '../utils/getNextSequence.js';

// 🔁 Lister tout le matériel
export const getAllMaterials = async (_req, res) => {
  try {
    const materials = await Material.find();
    res.json(materials);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des matériels.' });
  }
};
export const getMaterialsByDepot = async (req, res) => {
  const { idDep } = req.params;
  try {
    const materials = await Material.find({ idDep: Number(idDep) });
    res.status(200).json(materials);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
};
// 🔍 Obtenir un matériel par ID
export const getMaterialById = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ error: 'Matériel non trouvé.' });
    res.json(material);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération du matériel.' });
  }
};
// ➕ Ajouter un nouveau matériel
export const createMaterial = async (req, res) => {
  try {
    // On extrait les champs du corps de la requête dès le début
    const {
      name,
      quantity,
      idDep,
      category,
      state,
      assignedTo,
      description,
      createdAt,
      ...rest
    } = req.body;

    // Maintenant "name" est défini
    let material = await Material.findOne(
      {
        name: new RegExp(`^${name}$`, 'i'),
        idDep: rest.idDep // Assure que idDep est défini
       });

    if (material) {
      console.log('Matériel trouvé, mise à jour de la quantité');
      material.quantity += quantity;
      await material.save();
      res.status(200).json(material);
    } else {
      const newMaterial = new Material({
        name, 
        quantity: quantity || 0, // Assure que quantity est défini
        idDep: idDep || null, // Assure que idDep est défini
        category: category || 'outillage', // Assure que category est défini
        state: state || 'neuf', // Assure que state est défini
        assignedTo: assignedTo || null, // Assure que assignedTo est défini
        description: description || '', // Assure que description est défini
        createdAt: new Date(),
        ...rest
      });

      newMaterial.idMat = await getNextSequence('material');

      const saved = await newMaterial.save();
      res.status(201).json(saved);
      console.log('Requête reçue:', req.body);
      console.log('Matériel créé:', newMaterial);
    }
  } catch (err) {
    console.error('Erreur lors de la création du matériel:', err);
    res.status(400).json({ error: 'Erreur lors de la création du matériel.' });
  }
};
export async function logMaterialMovement(req, res) {
  try {
    const { materialId, type, quantity } = req.body;
    const material = await Material.findById(materialId);
    if (!material) return res.status(404).json({ error: 'Matériel non trouvé' });

    // Met à jour le stock
    if (type === 'entrée') {
      material.quantity += quantity;
    } else if (type === 'sortie') {
      if (material.quantity < quantity) {
        return res.status(400).json({ error: 'Stock insuffisant' });
      }
      material.quantity -= quantity;
    }

    await material.save();

    const movement = logMaterialMovement({ materialId, type, quantity });
    await movement.save();

    res.status(201).json(movement);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}
// ✏️ Modifier un matériel
export const updateMaterialByIdMat = async (req, res) => {
  try {
    const updated = await Material.findOneAndUpdate({ idMat: req.params.idMat }, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Matériel non trouvé.' });
    console.log('updated ' + updated);
    res.json(updated);
  } catch (err) {
    console.error('Erreur update:', err);
    res.status(400).json({ error: 'Erreur lors de la mise à jour du matériel.' });
  }
};
// 🗑️ Supprimer un matériel
export const deleteMaterialByIdMat = async (req, res) => {
  try {
    const deleted = await Material.findOneAndDelete({ idMat: req.params.idMat });
    if (!deleted) return res.status(404).json({ error: 'Matériel non trouvé.' });
    res.json({ message: 'Matériel supprimé avec succès.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression du matériel.' });
  }
};
