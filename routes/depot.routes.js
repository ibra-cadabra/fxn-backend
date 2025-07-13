import express from 'express';
import {
  getAllDepots,
  createDepot,
  getDepotById,
  updateDepotById,
  deleteDepot,
  getDepotResources
} from '../controllers/depot.controller.js';

const router = express.Router();

// Dépôts CRUD
router.get('/', getAllDepots);
router.post('/', createDepot);
router.get('/:idDep', getDepotById);
router.put('/:idDep', updateDepotById);
router.delete('/:idDep', deleteDepot);
router.get('/:idDep/resources', getDepotResources);

export default router;
