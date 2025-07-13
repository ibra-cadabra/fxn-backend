// ✅ routes/consumable.routes.js
import express from 'express';
import {
  getAllConsumables,
  createConsumable,
  deleteConsumableByIdCons,
  updateConsumableByIdCons
} from '../controllers/consumable.controller.js';

const router = express.Router();

router.get('/', getAllConsumables);
router.post('/', createConsumable);
router.put('/:idCons', updateConsumableByIdCons);
router.delete('/:idCons', deleteConsumableByIdCons);

export default router;