// File: material.routes.js
import express from 'express';
import{
  getAllMaterials,
  getMaterialById,
  logMaterialMovement,
  createMaterial,
  getMaterialsByDepot,
  updateMaterialByIdMat,
  deleteMaterialByIdMat
} from '../controllers/material.controller.js';

const router = express.Router();

// ➕ Créer un nouveau matériel
router.post('/', createMaterial);
router.post('/movements', logMaterialMovement);

// 📄 Obtenir tous les matériels
router.get('/', getAllMaterials);

// 📄 Obtenir un matériel par ID
router.get('/:idMat', getMaterialById);

router.get('/depots/:idDep/materials', getMaterialsByDepot);

// ✏️ Modifier un matériel
router.put('/by-idMat/:idMat', updateMaterialByIdMat);

// ❌ Supprimer un matériel
router.delete('/by-idMat/:idMat', deleteMaterialByIdMat);

export default router;