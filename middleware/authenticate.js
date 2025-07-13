// middlewares/authenticate.js
import jwt from 'jsonwebtoken';

// 🔐 Middleware d'authentification basé sur JWT
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // ✅ Vérifie que le header Authorization existe et commence par 'Bearer '
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '⛔ Token d’accès manquant ou invalide.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 🧠 Vérifie et décode le token JWT (signé avec JWT_SECRET)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');

    // 🧩 Stocke les infos utilisateur décodées dans la requête (accessible dans les contrôleurs)
    req.user = decoded.user || decoded; // `decoded.user` si accessToken, sinon fallback

    // 🚀 Continue vers la route protégée
    next();
  } catch (err) {
    console.error('❌ Token invalide ou expiré:', err.message);
    return res.status(403).json({ message: '⛔ Accès refusé. Token invalide ou expiré.' });
  }
};
