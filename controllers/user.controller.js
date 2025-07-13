// user.controller.js
import User from '../models/user.model.js';
import { getNextSequence } from '../utils/getNextSequence.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const createCredentials = async (req, res) => {
  try {
    const { idUser } = req.params;
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Champs requis manquants.' });
    }

    const id = parseInt(idUser, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'idUser invalide (NaN)' });
    }

    const user = await User.findOne({ idUser: id });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    const usernameTaken = await User.findOne({ username });
    if (usernameTaken) {
      return res.status(409).json({ message: 'Nom d’utilisateur déjà pris' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.username = username;
    user.password = hashedPassword;

    await user.save({ validateBeforeSave: false });
    res.status(200).json({ message: '✅ Accès créé avec succès' });
  } catch (error) {
    console.error('❌ Erreur création identifiants:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

export const createUser = async (req, res) => {
  try {
    const { numSec, phone, email, numSiret, role, ...rest } = req.body;

    const errors = [];

    if (numSec) {
      const exists = await User.findOne({ numSec });
      if (exists) errors.push('numSec');
    }

    if (phone) {
      const exists = await User.findOne({ phone });
      if (exists) errors.push('phone');
    }

    if (email) {
      const exists = await User.findOne({ email });
      if (exists) errors.push('email');
    }

    if (numSiret) {
      const exists = await User.findOne({ numSiret });
      if (exists) errors.push('numSiret');
    }

    if (errors.length > 0) {
      return res.status(409).json({
        message: `⛔ Conflit sur les champs suivants : ${errors.join(', ')}`,
        fields: errors
      });
    }

    const nextId = await getNextSequence('user');

    let user = new User({
      idUser: nextId,
      numSec,
      ...(phone ? { phone } : {}),
      ...(email ? { email } : {}),
      role,
      ...(numSiret ? { numSiret } : {}),
      ...rest
    });
    // Nettoie les champs vides
    if (!email) delete user.email;
    if (!phone) delete user.phone;
    if (!numSec) delete user.numSec;
    if (!numSiret) delete user.numSiret;


    const saved = await user.save();
    console.log('✅ Utilisateur créé avec succès:', saved);
    res.status(201).json(saved);
  } catch (err) {
    console.error('❌ Erreur création utilisateur:', err);

    if (err.code === 11000) {
      return res.status(409).json({ message: '⛔ Conflit d\'unicité détecté dans la base.' });
    }

    res.status(400).json({ message: '❌ Erreur lors de l\'ajout de l\'utilisateur' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUserByIdUser = async (req, res) => {
  try {
    const idUser = parseInt(req.params.idUser);
    if (isNaN(idUser)) return res.status(400).json({ message: 'idUser invalide' });

    const updateData = { ...req.body };

    // 🧼 Supprimer les champs vides pour éviter les conflits de duplicat
    ['numSec', 'phone', 'email', 'numSiret'].forEach(field => {
      if (updateData[field] === '') delete updateData[field];
    });

    const errors = [];

    // 🔍 Vérifie l'unicité des champs sensibles (hors utilisateur courant)
    const checkUnique = async (field) => {
      if (!updateData[field]) return;
      const conflict = await User.findOne({ [field]: updateData[field] });
      if (conflict && conflict.idUser !== idUser) errors.push(field);
    };

    await Promise.all([
      checkUnique('numSec'),
      checkUnique('phone'),
      checkUnique('email'),
      checkUnique('numSiret'),
    ]);

    if (errors.length > 0) {
      return res.status(409).json({
        message: `⛔ Conflit sur les champs suivants : ${errors.join(', ')}`,
        fields: errors
      });
    }

    const updated = await User.findOneAndUpdate({ idUser }, updateData, { new: true });
    if (!updated) return res.status(404).json({ message: 'Utilisateur non trouvé.' });

    console.log('✅ Utilisateur mis à jour :', updated);
    res.json(updated);

  } catch (err) {
    console.error('❌ Erreur update:', err);

    if (err.code === 11000) {
      return res.status(409).json({
        message: '⛔ Conflit d’unicité détecté',
        fields: [Object.keys(err.keyPattern)[0]]
      });
    }

    res.status(500).json({ message: 'Erreur lors de la mise à jour.' });
  }
};

export const deleteUserByIdUser = async (req, res) => {
  try {
    const id = parseInt(req.params.idUser);
    if (isNaN(id)) return res.status(400).json({ message: 'idUser invalide' });

    const deleted = await User.findOneAndDelete({ idUser: id });
    if (!deleted) return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    res.json({ message: 'Utiisateur supprimé.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur.' });
  }
};

export const isUniqueUser = async (req, res) => {
  try {
    const { numSec, phone, email, numSiret } = req.query;
    const fieldsInConflict = [];

    if (numSec) {
      const exists = await User.findOne({ numSec });
      if (exists) fieldsInConflict.push('numSec');
    }

    if (phone) {
      const exists = await User.findOne({ phone });
      if (exists) fieldsInConflict.push('phone');
    }

    if (email) {
      const exists = await User.findOne({ email });
      if (exists) fieldsInConflict.push('email');
    }

    if (numSiret) {
      const exists = await User.findOne({ numSiret });
      if (exists) fieldsInConflict.push('numSiret');
    }

    if (fieldsInConflict.length > 0) {
      return res.status(409).json({ fields: fieldsInConflict });
    }
    res.status(200).json({ message: 'OK' });
  } catch (error) {
    console.error('❌ Erreur vérification unicité:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const assignDepotAndVehicule = async (req, res) => {
  try {
    const { idUser, idDep, idVeh } = req.body;
    const user = await User.findOne({ idUser });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    user.idDep = idDep || null;
    user.idVeh = idVeh || null;

    await user.save();

    res.json({ message: 'Affectation réussie', utilisateur: user });
  } catch (error) {
    console.error('Erreur assignation', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getTechnicians = async (req, res) => {
  try {
    const technicians = await User.find({ role: 'technicien' });
    res.status(200).json(technicians);
  } catch (error) {
    console.error('❌ Erreur chargement techniciens:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getUserByIdUser = async (req, res) => {
  try {
    const { idUser } = req.params;
    const id = parseInt(idUser);
    if (isNaN(id)) return res.status(400).json({ message: 'idUser invalide' });

    const user = await User.findOne({ idUser: id });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('❌ Erreur récupération utilisateur :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
