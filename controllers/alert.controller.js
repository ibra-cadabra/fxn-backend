import Consumable from '../models/consumable.model.js';

// 🚨 GET /alerts/consumables
export const getLowStockConsumables = async (req, res) => {
    try {
        const alerts = await Consumable.find({
            $expr: { $lt: ['$quantity', '$minThreshold'] }
        });
        res.json(alerts);
    } catch (err) {
        res.status(500).json({ message: 'Erreur récupération alertes', error: err });
    }
};
