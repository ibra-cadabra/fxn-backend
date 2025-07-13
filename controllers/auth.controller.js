// controllers/authController.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';

const ACCESS_TOKEN_DURATION = '15m';
const REFRESH_TOKEN_DURATION = '7d';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refreshsecretkey';

/**
 * 🔐 Génère un token d'accès court (JWT)
 */
const generateAccessToken = (user) => {
  return jwt.sign(
      {
        user: {
          idUser: user.idUser,
          role: user.role,
          idDep: user.idDep || null,
          name: user.name,
          prename: user.prename
        }
      },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_DURATION }
  );
};

/**
 * 🔁 Génère un token de rafraîchissement
 */
const generateRefreshToken = (user) => {
  return jwt.sign({ idUser: user.idUser }, REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_DURATION
  });
};

/**
 * 🔑 Connexion de l'utilisateur avec génération de tokens
 */
export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) return res.status(401).json({ message: 'Utilisateur non trouvé' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Mot de passe incorrect' });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // 🧠 Stocker le refreshToken dans la base
    user.refreshToken = refreshToken;
    await user.save();

    res.json({ accessToken, refreshToken });
  } catch (err) {
    console.error('❌ Erreur login :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * ✅ Vérifie le mot de passe courant (action sensible)
 */
export const verifyPassword = async (req, res) => {
  const { password } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Token manquant' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ idUser: decoded.user.idUser });

    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: '⛔ Mot de passe incorrect' });

    res.status(200).json({ message: '✅ Mot de passe confirmé' });
  } catch (err) {
    console.error('Erreur vérification mot de passe :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * 🔁 Rafraîchit le token JWT
 */
export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) return res.status(401).json({ message: 'Token manquant' });

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const user = await User.findOne({ idUser: decoded.idUser });

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: 'Refresh token invalide ou expiré' });
    }

    const newAccessToken = generateAccessToken(user);
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error('❌ Erreur refresh token :', err);
    res.status(403).json({ message: 'Token invalide ou expiré' });
  }
};

/**
 * 🚪 Déconnexion (invalidation refreshToken)
 */
export const logout = async (req, res) => {
  const { idUser } = req.user.idUser;

  try {
    await User.updateOne({ idUser }, { refreshToken: null });
    res.status(200).json({ message: '✅ Déconnexion réussie' });
  } catch (err) {
    console.error('❌ Erreur logout :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
