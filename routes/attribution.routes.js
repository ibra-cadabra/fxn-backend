// attribution.routes.js
import express from 'express';
import {
    assignResource,
    retrieveResource,
    getAllAttributions,
    getAllAttributionHistory, getHistoryByDepotId, getCurrentAttributionsByDepot
} from '../controllers/attribution.controller.js';
import {getDepotById} from "../controllers/depot.controller.js";

const router = express.Router();

// 🎯 Assigner une ressource (material ou consumable)
router.post('/assign', assignResource);

// 🔁 Reprendre une ressource
router.post('/retrieve', retrieveResource);

// 🧾 Historique global pour l’admin
router.get('/history/all', getAllAttributionHistory);
router.get('/history/:idDep', getHistoryByDepotId); // ✅ Ajout de cette route

// 📦 Attributions actives (en cours, non historiques)
router.get('/', getAllAttributions);

// 📦 Attributions actives pour un dépôt donné
router.get('/depot/:id', getCurrentAttributionsByDepot);

export default router;
