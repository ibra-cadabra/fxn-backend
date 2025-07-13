// models/attributionHistory.model.js
// ✅ models/attributionHistory.model.js
import mongoose from 'mongoose';

const attributionHistorySchema = new mongoose.Schema({
  resourceType: {
    type: String,
    enum: ['materiel', 'consommable', 'vehicule'],
    required: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'resourceType' // 🔁 référence dynamique
  },
  technicianId: { type: Number, required: true },
  depotId: { type: Number, required: true },
  quantity: { type: Number },
  action: { type: String, enum: ['attribution', 'reprise'], required: true },
  createdBy: { type: Number, required: true },
  comment: { type: String },
  date: { type: Date, default: Date.now }
});

const AttributionHistory = mongoose.model('AttributionHistory', attributionHistorySchema);
export default AttributionHistory;
