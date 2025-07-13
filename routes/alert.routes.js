import express from 'express';
import {getLowStockConsumables} from "../controllers/alert.controller.js";

const router = express.Router();

// 🔔 Liste des consommables en dessous du seuil
router.get('/consumables', getLowStockConsumables);

export default router;
