// middlewares/authorize.js

/**
 * 🔒 Middleware d'autorisation basé sur les rôles.
 * @param {string[]} allowedRoles - Liste des rôles autorisés (ex : ['administrateur', 'dirigeant']).
 */
export const authorize = (allowedRoles = []) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: '⛔ Accès refusé (utilisateur non authentifié).' });
        }

        const userRole = req.user.role;

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ message: `⛔ Accès interdit pour le rôle : ${userRole}` });
        }

        next(); // ✅ Autorisé, on continue
    };
};
