// ✅ routes/attribution.routes.js

import express from 'express';
import * as attributionCtrl from '../controllers/attribution.controller.js';
import * as historyCtrl from '../controllers/attributionHistory.controller.js';
import * as attributionHistoryController from "../controllers/attributionHistory.controller.js";
import {
    getAllHistory,
    getHistoryByUser,
    getHistoryByUserAndDate,
    getHistoryByUserAndDepot,
    getHistoryByUserDepotAndDate,
    getHistoryFiltered
} from "../controllers/attributionHistory.controller.js";

const router = express.Router();

/**
 * 🎯 Routes principales pour l'attribution de ressources
 */

// ➕ Attribution de matériel/consommable
router.post('/assign', attributionCtrl.assignResource);

// ➖ Reprise de matériel/consommable
router.post('/retrieve', attributionCtrl.retrieveResource);

/**
 * 📜 Historique des attributions (attributionHistory)
 */

// 🗂️ Historique global d’un dépôt
router.get('/history/:depotId', historyCtrl.getHistory);

// 🔍 Historique filtré par technicien
router.get('/history/:depotId/technician/:techId', historyCtrl.getHistoryByTechnician);

// 📅 Historique filtré par date
router.get('/history/:depotId/date/:date', historyCtrl.getHistoryByDate);

// ✅ (Optionnel) Ajouter une route pour toutes les attributions en cours
router.get('/depot/:depotId', attributionCtrl.getHistoryByDepotId);

// routes/attributionHistory.routes.js
router.get('/history/by-user/:userId', attributionHistoryController.getHistoryByUser);
router.get('/history/by-user/:userId', getHistoryByUser);
router.get('/history/by-user/:userId/depot/:depotId', getHistoryByUserAndDepot);
router.get('/history/by-user/:userId/date/:date', getHistoryByUserAndDate);
router.get('/history/by-user/:userId/depot/:depotId/date/:date', getHistoryByUserDepotAndDate);

// ✅ Route pour historique global
router.get('/history/all', getAllHistory);

router.get('/filter', getHistoryFiltered);
