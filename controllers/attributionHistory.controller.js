// controllers/attributionHistory.controller.js
import AttributionHistory from '../models/attributionHistory.model.js';

// 📜 Récupérer tout l'historique pour un dépôt
export const getHistory = async (req, res) => {
    try {
        const depotId = parseInt(req.params.depotId);
        if (!depotId) return res.status(400).json({ error: 'idDep requis' });

        const history = await AttributionHistory.find({ depotId }).sort({ date: -1 });
        res.json(history);
    } catch (err) {
        console.error('❌ Erreur getHistory:', err);
        res.status(500).json({ error: 'Erreur serveur interne' });
    }
};

// 📜 Historique filtré par technicien (optionnel)
export const getHistoryByTechnician = async (req, res) => {
    try {
        const depotId = parseInt(req.params.depotId);
        const technicianId = parseInt(req.params.techId);

        const history = await AttributionHistory.find({ depotId, technicianId }).sort({ date: -1 });
        res.json(history);
    } catch (err) {
        console.error('❌ Erreur getHistoryByTechnician:', err);
        res.status(500).json({ error: 'Erreur serveur interne' });
    }
};

// 📜 Historique filtré par date (YYYY-MM-DD)
export const getHistoryByDate = async (req, res) => {
    try {
        const depotId = parseInt(req.params.depotId);
        const dateStr = req.params.date;
        const start = new Date(dateStr);
        const end = new Date(dateStr);
        end.setDate(end.getDate() + 1);

        const history = await AttributionHistory.find({
            depotId,
            date: { $gte: start, $lt: end }
        }).sort({ date: -1 });

        res.json(history);
    } catch (err) {
        console.error('❌ Erreur getHistoryByDate:', err);
        res.status(500).json({ error: 'Erreur serveur interne' });
    }
};

// 📜 Historique par auteur (utilisateur ayant effectué les actions)
export const getHistoryByUser = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId)) return res.status(400).json({ error: 'userId invalide' });

        const history = await AttributionHistory.find({ createdBy: userId }).sort({ date: -1 });
        res.json(history);
    } catch (err) {
        console.error('❌ Erreur getHistoryByUser:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// 📜 Historique filtré par dépôt, auteur et date
export const getHistoryFiltered = async (req, res) => {
    try {
        const { depotId, createdBy, date } = req.query;

        const query = {};
        if (depotId) query.depotId = parseInt(depotId);
        if (createdBy) query.createdBy = parseInt(createdBy);
        if (date) {
            const start = new Date(date);
            const end = new Date(date);
            end.setDate(end.getDate() + 1);
            query.date = { $gte: start, $lt: end };
        }

        const history = await AttributionHistory.find(query).sort({ date: -1 });
        res.json(history);
    } catch (err) {
        console.error('❌ Erreur getHistoryFiltered:', err);
        res.status(500).json({ error: 'Erreur serveur interne' });
    }
};

export const getHistoryByUserAndDepot = async (req, res) => {
    try {
        const createdBy = parseInt(req.params.userId);
        const depotId = parseInt(req.params.depotId);
        if (isNaN(createdBy) || isNaN(depotId)) {
            return res.status(400).json({ error: 'Paramètres invalides' });
        }

        const history = await AttributionHistory.find({ createdBy, depotId }).sort({ date: -1 });
        res.json(history);
    } catch (err) {
        console.error('❌ Erreur getHistoryByUserAndDepot:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

export const getHistoryByUserAndDate = async (req, res) => {
    try {
        const createdBy = parseInt(req.params.userId);
        const dateStr = req.params.date;
        const start = new Date(dateStr);
        const end = new Date(dateStr);
        end.setDate(end.getDate() + 1);

        const history = await AttributionHistory.find({
            createdBy,
            date: { $gte: start, $lt: end }
        }).sort({ date: -1 });

        res.json(history);
    } catch (err) {
        console.error('❌ Erreur getHistoryByUserAndDate:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

export const getHistoryByUserDepotAndDate = async (req, res) => {
    try {
        const createdBy = parseInt(req.params.userId);
        const depotId = parseInt(req.params.depotId);
        const dateStr = req.params.date;

        if (isNaN(createdBy) || isNaN(depotId)) {
            return res.status(400).json({ error: 'Paramètres invalides' });
        }

        const start = new Date(dateStr);
        const end = new Date(dateStr);
        end.setDate(end.getDate() + 1);

        const history = await AttributionHistory.find({
            createdBy,
            depotId,
            date: { $gte: start, $lt: end }
        }).sort({ date: -1 });

        res.json(history);
    } catch (err) {
        console.error('❌ Erreur getHistoryByUserDepotAndDate:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

export const getAllHistory = async (req, res) => {
    try {
        const all = await AttributionHistory.find().sort({ date: -1 });
        res.status(200).json(all);
    } catch (err) {
        console.error('❌ Erreur fetch global history:', err);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération de l’historique global' });
    }
};


