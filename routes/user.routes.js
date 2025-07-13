import express from 'express';
import User from '../models/user.model.js';
import {
  createUser,
  getUsers,
  assignDepotAndVehicule,
  authenticateToken,
  updateUserByIdUser,
  getUserByIdUser,
  isUniqueUser,
  getTechnicians,
  deleteUserByIdUser,
  createCredentials
} from '../controllers/user.controller.js';

const router = express.Router();

router.get('/', getUsers);
router.post('/', createUser);
router.get('/:idUser', getUserByIdUser);
router.post('/:idUser/credentials', createCredentials); // 🔐
router.get('/technicians', getTechnicians); // ✅ Route GET /users/technicians
router.get('/check-unique', isUniqueUser);
router.put('/assign-depot-vehicule', assignDepotAndVehicule); // PUT /technicians/assign
router.put('/:idUser', updateUserByIdUser);
router.delete('/:idUser', deleteUserByIdUser);
router.get('/check-duplicate', async (req, res) => {
  try {
    const { numSec, email, phone, numSiret } = req.query;

    if (!numSec && !email && !phone && !numSiret) {
      return res.status(400).json({ error: 'Aucun paramètre fourni' });
    }

    const orConditions = [];

    if (numSec) orConditions.push({ numSec: Number(numSec) });
    if (email) orConditions.push({ email });
    if (phone) orConditions.push({ phone });
    if (numSiret) orConditions.push({ numSiret });

    const exists = await User.exists({ $or: orConditions });

    res.json({ exists: !!exists });
  } catch (error) {
    console.error('Erreur check-duplicate:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
router.get('/protected', authenticateToken, (req, res) => {
  res.send('Contenu sécurisé');
});

  
export default router;
