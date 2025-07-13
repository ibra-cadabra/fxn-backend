import express from 'express';
import * as vehiculeCtrl from "../controllers/vehicule.controller.js";

const router = express.Router();

router.get('/', vehiculeCtrl.getVehicules);
router.post('/', vehiculeCtrl.createVehicule);
router.put('/:idVeh', vehiculeCtrl.updateVehiculeByIdVeh);
router.delete('/:idVeh', vehiculeCtrl.deleteVehiculeByIdVeh);
router.get('/exists/:registrationPlate', vehiculeCtrl.checkRegistrationPlateExists);

// ✅ Attribution ou reprise véhicule
router.post('/assign', vehiculeCtrl.assignVehicule);

export default router;
