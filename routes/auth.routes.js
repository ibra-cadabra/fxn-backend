import express from 'express';
import {
    login,
    logout,
    verifyPassword,
    refreshToken
} from '../controllers/auth.controller.js';
import {authenticate} from "../middleware/authenticate.js";

const router = express.Router();

/**
 * @route POST /auth/login
 * @desc Connexion utilisateur (retourne accessToken et refreshToken)
 */
router.post('/login', login);

/**
 * @route POST /auth/refresh
 * @desc Rafraîchir un token d'accès expiré
 */
router.post('/refresh', refreshToken);

/**
 * @route POST /auth/verify-password
 * @access Protégé (authentifié uniquement)
 * @desc Vérifie le mot de passe courant (action sensible)
 */
router.post('/verify-password', authenticate, verifyPassword);

/**
 * @route POST /auth/logout
 * @access Protégé (authentifié uniquement)
 * @desc Déconnecte l'utilisateur et invalide le refreshToken stocké
 */
router.post('/logout', authenticate, logout);

export default router;
